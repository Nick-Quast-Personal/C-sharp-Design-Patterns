// ----------------------------------- KNX Infrastructure Pipeline (NuGet) -----------------------------------

// --------------- Behind the scenes code / logic ---------------
//
// What this file is:
//   - This is a production pipeline.
//   - Not a demo. It is the reusable class that runs pipelines.
//   - It has steps (called "children") that are added at runtime via AddChild().
//
// Demo Notes (compare to pipeline-design-pattern):
//   1. PipelineContext
//      - Like StadiumEntryContext — the shared object passed through every step.
//      - Holds data, errors, and access to application services (dependency injection).
//
//   2. Children (_children / Children)
//      - Like stadiumEntryPipeline — the ordered list of steps in the pipeline.
//      - Each child is a INode (a step). Steps are added with AddChild().
//      - This nugget pipeline starts with zero steps (children). Then add as many as it needs.
//
//   3. ExecuteAsync()
//      - This is like the runStadiumEntryPipeline() in my pipeline example — the main entry point that runs the pipeline.
//      - Runs initializers first, then each child in order, then finalizers.
//
//   4. PerformExecuteChildrenAsync()
//      - This is like the for-loop inside runStadiumEntryPipeline() in my pipeline example.
//      - Walks each child, calls ExecuteAsync on it, and decides whether to keep going.
//
//   5. Failure handling (different from the stadium demo)
//      - In my pipeline demo, if a stage get set to a failedStage on the context, the loop breaks.
//      - In the KNX pipeline, it uses three things:
//          - NodeState (Succeeded / Failed / Skipped) on each step's Result
//          - Exceptions (if a step throws, the pipeline always stops)
//          - ErrorHandlers (optional custom code to run when a specific step fails)
// ------------------------------------------------------------------------------------------------

using KNX.Infrastructure.Common.Entities.Pipelines.Extensions;
using KNX.Infrastructure.Common.Entities.Pipelines.PipelineContinuationStrategies;
using KNX.Infrastructure.Common.Interfaces.Pipelines;
using System.Collections.ObjectModel;
using System.Runtime.ExceptionServices;

namespace KNX.Infrastructure.Common.Entities.Pipelines
{
    // Pipeline
    // The main pipeline class. Runs an ordered list of steps (children) against a shared PipelineContext.
    public class Pipeline : BaseNode, IPipeline
    {
        // _children
        // The ordered list of pipeline steps. Like stadiumEntryPipeline, but steps are added with AddChild().
        private readonly List<INode> _children = new List<INode>();

        // _initializers
        // Setup code that runs once before any steps execute (e.g. load config, open a connection).
        private readonly List<Type> _initializers = new List<Type>();

        // _finalizers
        // Cleanup code that runs once after all steps finish (e.g. close connections, write logs).
        private readonly List<Type> _finalizers = new List<Type>();

        // _errorHandlers
        // Maps a step type to one or more error handler classes.
        // When that step fails, the registered handlers run (e.g. log the error, notify support).
        private readonly Dictionary<Type, IList<Type>> _errorHandlers = new Dictionary<Type, IList<Type>>();

        // _onCompleteHandlers
        // Handlers that run when the entire pipeline completes.
        private readonly List<Type> _onCompleteHandlers = new List<Type>();

        // _lastNodeExecuted
        // Tracks which step ran last. Used for resume/retry via GetExecutionSnapshot() and SetNextStep().
        private INode? _lastNodeExecuted;

        // _executionStopped
        // When true, the pipeline loop breaks early. Something called StopExecution().
        private bool _executionStopped = false;

        // _continuationStrategy
        // The active strategy that decides "keep going to the next step" or "stop here."
        private IPipelineContinuationStrategy _continuationStrategy;

        // _continuationStrategyType
        // The type of continuation strategy to load from dependency injection at runtime.
        private Type _continuationStrategyType;

        public Pipeline()
        {
            Type = GetType();
            Name = Type.FullName;
        }

        // Children
        // Read-only view of the pipeline steps. Like stadiumEntryPipeline, but as INode objects.
        public IReadOnlyCollection<INode> Children => _children.AsReadOnly();

        // ErrorHandlers
        // Read-only view of which error handlers are registered for each step type.
        public IReadOnlyDictionary<Type, IList<Type>> ErrorHandlers => new ReadOnlyDictionary<Type, IList<Type>>(_errorHandlers);

        // Initializers
        // Read-only view of setup classes that run before the main steps.
        public IReadOnlyList<Type> Initializers => _initializers.AsReadOnly();

        // Finalizers
        // Read-only view of cleanup classes that run after the main steps.
        public IReadOnlyList<Type> Finalizers => _finalizers.AsReadOnly();

        // ContinuationStrategy
        // Which strategy decides whether to move to the next step after a step finishes.
        // Defaults to PipelineContinuationStrategy.Default if none is set.
        public Type ContinuationStrategy
        {
            get
            {
                if (_continuationStrategyType != null)
                {
                    return _continuationStrategyType;
                }

                return PipelineContinuationStrategy.Default;
            }

            set => _continuationStrategyType = value;
        }

        // GetExecutionSnapshot
        // Returns where the pipeline stopped — which step ran last and its position in the list.
        // The stadium demo does not have this; it always runs from the start.
        public PipelineExecutionSnapshot GetExecutionSnapshot()
        {
            if (_lastNodeExecuted == null)
            {
                return PipelineExecutionSnapshot.Empty;
            }

            var idxStep = _children.IndexOf(_lastNodeExecuted);

            if (_lastNodeExecuted is PipelineStepNode node)
            {
                return new PipelineExecutionSnapshot(node.Step, new[] { idxStep });
            }

            // Nested pipeline — combine this level's index with the child pipeline's snapshot.
            if (_lastNodeExecuted is IPipeline p)
            {
                var childSnapshot = p.GetExecutionSnapshot();
                var executionPath = new[] { idxStep }.Concat(
                    childSnapshot.LastStepExecutedPath
                ).ToArray();

                return new PipelineExecutionSnapshot(
                    childSnapshot.LastStepExecuted,
                    executionPath
                );
            }

            return PipelineExecutionSnapshot.Empty;
        }

        // AddChild
        // Adds a step to the pipeline. Like adding a function to stadiumEntryPipeline.
        public void AddChild(INode child)
        {
            _children.Add(child);
            child.Parent = this;
        }

        // AddErrorHandlerForStep
        // Registers an error handler for a specific step type.
        // When that step fails, the handler runs before the pipeline stops or continues.
        public void AddErrorHandlerForStep(Type stepType, Type errorHandlerType)
        {
            if (_errorHandlers.ContainsKey(stepType))
            {
                var stepErrorHandlers = _errorHandlers[stepType] ?? new List<Type>();
                stepErrorHandlers.Add(errorHandlerType);
            }
            else
            {
                var stepErrorHandlers = new List<Type>();
                stepErrorHandlers.Add(errorHandlerType);
                _errorHandlers.Add(stepType, stepErrorHandlers);
            }
        }

        // AddInitializer
        // Registers a setup class that runs before the main steps.
        public void AddInitializer(Type initializerType)
        {
            _initializers.Add(initializerType);
        }

        // AddFinalizer
        // Registers a cleanup class that runs after the main steps.
        public void AddFinalizer(Type finalizerType)
        {
            _finalizers.Add(finalizerType);
        }

        // ExecuteAsync — the pipeline runner
        // Like runStadiumEntryPipeline(). This is the main entry point.
        // Flow: initializers → run each child → finalizers.
        public override async Task ExecuteAsync(PipelineContext context)
        {
            // Load the continuation strategy from dependency injection.
            _continuationStrategy = (IPipelineContinuationStrategy)context
                .ApplicationServices
                .GetService(ContinuationStrategy);

            // Run setup code before the main steps.
            await ExecuteInitializersAsync(context);

            try
            {
                // Optional gate — skip the whole pipeline if ShouldExecuteAsync returns false.
                if (ShouldExecuteAsync == null || await ShouldExecuteAsync(context))
                {
                    try
                    {
                        // Run each child step in order (the main loop).
                        await PerformExecuteChildrenAsync(context);

                        // Set the overall pipeline result based on how each child did.
                        Result.State = AggregateChildState();
                    }
                    catch (Exception ex)
                    {
                        // A step threw an exception — run failure handling.
                        await OnStepFailureAsync(this, context, ex);
                    }
                }
                else
                {
                    // Whole pipeline was skipped (e.g. a condition was not met).
                    Result.State = NodeState.Skipped;
                }
            }
            finally
            {
                // Always run cleanup, unless the pipeline was fully skipped.
                if (Result.State != NodeState.Skipped)
                {
                    await ExecuteFinalizersAsync(context);
                }
            }
        }

        // Reset
        // Clears all children, handlers, and execution state so the pipeline can be reused.
        public override void Reset()
        {
            base.Reset();

            _children.Clear();
            _errorHandlers.Clear();
            _onCompleteHandlers.Clear();
            _lastNodeExecuted = null;
            _executionStopped = false;
        }

        // StopExecution
        // Tells the pipeline to stop after the current step. Like breaking the loop early.
        public void StopExecution() => _executionStopped = true;

        // PerformExecuteChildrenAsync — the step loop
        // Like the for-loop inside runStadiumEntryPipeline().
        // Walks each child, runs it, and decides whether to continue to the next one.
        protected virtual async Task PerformExecuteChildrenAsync(PipelineContext context)
        {
            var shouldContinue = true;
            IEnumerable<INode> nodesToExecute = Children;

            // Resume support — if we are picking up where we left off, skip steps already done.
            if (_lastNodeExecuted != null)
            {
                var skippedNodes = Children.TakeWhile(n => n != _lastNodeExecuted);

                nodesToExecute = Children.Skip(skippedNodes.Count());

                foreach (var node in skippedNodes)
                {
                    node.MarkSkipped();
                }
            }

            foreach (var pipelineStep in nodesToExecute)
            {
                // Something called StopExecution() — break out of the loop.
                if (_executionStopped)
                {
                    break;
                }

                _lastNodeExecuted = pipelineStep;

                try
                {
                    // Run this step. Like calling stage(current) in the stadium demo.
                    await pipelineStep.ExecuteAsync(context);

                    // Ask the continuation strategy: should we run the next step?
                    // Unlike the stadium demo (which always stops on failedStage), this can say "keep going."
                    var continuation = _continuationStrategy.GetContinuation(
                        pipelineStep,
                        this,
                        context
                    );

                    shouldContinue = continuation == PipelineContinuation.NextStep;

                    // Step reported Failed and the strategy says stop — run error handlers and break.
                    // Like checking failedStage !== "" in runStadiumEntryPipeline().
                    if (pipelineStep.Result.State == NodeState.Failed && !shouldContinue)
                    {
                        await OnStepFailureAsync(pipelineStep, context);
                        shouldContinue = false;
                        break;
                    }

                    // Strategy says stop for any other reason (e.g. partial success) — break.
                    if (!shouldContinue)
                    {
                        shouldContinue = false;
                        break;
                    }
                }
                catch (Exception ex)
                {
                    // Step threw an exception — always stop. No option to keep going.
                    await OnStepFailureAsync(pipelineStep, context, ex);

                    shouldContinue = false;
                    break;
                }
            }

            Result.ShouldContinue = shouldContinue;
        }

        // AggregateChildState
        // Combines every child's Result.State into one overall pipeline state.
        // Like looking at all stages to decide if the whole run succeeded or failed.
        protected NodeState AggregateChildState()
            => Children
                .Select(x => x.Result.State)
                .DefaultIfEmpty(NodeState.Succeeded)
                .Aggregate();

        // OnStepFailureAsync
        // Handles a failed step. Unlike the stadium demo (which just sets failedStage), this:
        //   1. Marks the step as NodeState.Failed
        //   2. Runs any registered error handlers for that step type
        //   3. Re-throws the exception if one was thrown (crash = always stop)
        protected async Task OnStepFailureAsync(INode pipelineStep, PipelineContext context, Exception exception = null)
        {
            // Mark the step as failed if there was an exception or errors on the context.
            if (exception != null || context.Errors?.Count > 0)
            {
                pipelineStep.Result.State = NodeState.Failed;
            }

            // Run any error handlers registered for this step type.
            if (ErrorHandlers.ContainsKey(pipelineStep.Type))
            {
                foreach (var errorHandlerType in ErrorHandlers[pipelineStep.Type])
                {
                    await ExecuteErrorHandlerAsync(errorHandlerType, context, exception);
                }
            }

            // If the step threw an exception, re-throw it after handlers have run.
            if (exception != null)
            {
                ExceptionDispatchInfo.Capture(exception).Throw();
            }
        }

        // ExecuteErrorHandlerAsync
        // Loads and runs one error handler from dependency injection.
        protected async Task ExecuteErrorHandlerAsync(Type errorHandlerType, PipelineContext context, Exception ex)
        {
            var errorHandler = context.ApplicationServices.GetService(errorHandlerType) as IPipelineErrorHandler;

            if (errorHandler == null)
            {
                throw new InvalidOperationException($"Could not find service for type {errorHandlerType.FullName}");
            }

            // Handler can decide whether it should run for this specific error.
            if (await errorHandler.ShouldExecuteAsync(context, ex))
            {
                await errorHandler.ExecuteAsync(context, ex);
            }
        }

        // ExecuteInitializersAsync
        // Runs all registered setup classes before the main steps start.
        protected async Task ExecuteInitializersAsync(PipelineContext context)
        {
            var initializers = Initializers.Select(
                type => (type, context.ApplicationServices.GetService(type) as IPipelineInitializer)
            );

            foreach (var (type, initializer) in initializers)
            {
                if (initializer == null)
                {
                    throw new InvalidOperationException($"Could not find service for type {type.FullName}");
                }

                await initializer.ExecuteAsync(this, context);
            }
        }

        // ExecuteFinalizersAsync
        // Runs all registered cleanup classes after the main steps finish.
        protected async Task ExecuteFinalizersAsync(PipelineContext context)
        {
            var finalizers = Finalizers.Select(
                type => (type, context.ApplicationServices.GetService(type) as IPipelineFinalizer)
            );

            foreach (var (type, finalizer) in finalizers)
            {
                if (finalizer == null)
                {
                    throw new InvalidOperationException($"Could not find service for type {type.FullName}");
                }

                await finalizer.ExecuteAsync(this, context);
            }
        }

        // HasNode
        // Searches this pipeline and all nested child pipelines for a node matching a condition.
        public override bool HasNode(Func<INode, bool> func)
        {
            var has = base.HasNode(func);

            if (has) return has;

            if (Children.Count > 0)
            {
                foreach (var child in Children)
                {
                    has = child.HasNode(func);

                    if (has)
                    {
                        break;
                    }
                }
            }

            return has;
        }

        // InitializeSteps
        // Hook for subclasses to set up steps. Empty here — override in a specific pipeline.
        public virtual void InitializeSteps()
        {
        }

        // SetNextStep
        // Sets where the pipeline should resume from (by index path).
        // The stadium demo always starts at step 1; this lets you jump to a later step.
        public INode SetNextStep(int[] nodePath)
        {
            if (nodePath.Length < 1)
            {
                throw new ArgumentException("Can't get node at path with no segments");
            }

            var idxNode = nodePath[0];

            if (idxNode < 0 || idxNode >= _children.Count)
            {
                throw new ArgumentException("Node path specifies out-of-range child index");
            }

            _lastNodeExecuted = _children[idxNode];

            if (nodePath.Length == 1)
            {
                return _lastNodeExecuted;
            }

            // Step into a nested child pipeline and continue down the path.
            if (_lastNodeExecuted is IPipeline pipeline)
            {
                return pipeline.SetNextStep(nodePath.Skip(1).ToArray());
            }
            else
            {
                throw new ArgumentException("Node path terminates mid-sequence with non-pipeline child");
            }
        }

        // GetChild
        // Finds a specific step by index path (e.g. [0, 2] = first child, then its third child).
        public INode GetChild(int[] nodePath)
        {
            if (nodePath.Length < 1)
            {
                throw new ArgumentException("Can't get node at path with no segments");
            }

            var idxNode = nodePath[0];

            if (idxNode < 0 || idxNode >= _children.Count)
            {
                throw new ArgumentException("Node path specifies out-of-range child index");
            }

            var node = _children[idxNode];

            if (nodePath.Length == 1)
            {
                return node;
            }

            // Step into a nested child pipeline and continue down the path.
            if (node is IPipeline pipeline)
            {
                return pipeline.GetChild(nodePath.Skip(1).ToArray());
            }
            else
            {
                throw new ArgumentException("Node path terminates mid-sequence with non-pipeline child");
            }
        }
    }
}
