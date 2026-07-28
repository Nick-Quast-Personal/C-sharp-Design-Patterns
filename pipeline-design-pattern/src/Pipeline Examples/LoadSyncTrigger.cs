// --------------- Behind the scenes code / logic ---------------
//
// What this file is:
//   - A function that listens for Kafka messages about load data.
//   - When messages arrive, it starts a pipeline to process and sync those loads.
//   - This is like an initializer (setup). It does not define the actual pipeline steps.
//   - The actual steps live in LoadSyncPipeline (a separate class, not in this repo).
//
// How this relates to the other pipeline files:
//   Compared to my pipeline pattern (stadium demo):
//     - pipelineContext                  -> like StadiumEntryContext (shared data passed through every step)
//     - loadSyncPipeline.ExecuteAsync()  -> like runStadiumEntryPipeline()
//     - LoadSyncPipeline                 -> like stadiumEntryPipeline (the list of steps)
//     - Kafka messages                   -> like the user typing ticket info in the terminal
//
//   Compared to nuget-pipeline.cs:
//     - This file calls the nuget Pipeline engine; it does not contain the engine itself.
//     - ExecuteAsync(pipelineContext) is the method from nuget-pipeline.cs that runs all the children steps.
//     - _pipelineFactory.Create<LoadSyncPipeline>() builds a pipeline with its steps already configured.
//
//   Flow:
//   1. Kafka sends load messages
//   2. This trigger reads and maps them onto pipelineContext.
//   3. It creates a LoadSyncPipeline and calls ExecuteAsync().
//   4. The nuget Pipeline engine runs each step in order.
//   5. Logs how long it took and if it succeeded or failed.
//
// ------------------------------------------------------------------------------------------------

using AutoMapper;
using Common.Dto;
using Common.Extensions;
using KNX.Core.Loads.Implementation.Pipelines.LoadProcessor.Orders.LoadsSync;
using KNX.Infrastructure.Common.Extensions;
using KNX.Infrastructure.Common.Interfaces.Pipelines;
using KNX.Infrastructure.Http.Triggers;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Kafka;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.Domain.Documents.LoadCore;

namespace KNX.Core.Load.Processor.Triggers.Orders;

// LoadSyncTrigger
// Azure Function entry point. Receives Kafka events and kicks off the LoadSyncPipeline.
public class LoadSyncTrigger : BaseServerlessPipeline
{
    // Constructor — dependency injection provides the services this trigger needs.
    // IPipelineFactory is used to create pipeline instances (like LoadSyncPipeline).
    public LoadSyncTrigger(IServiceProvider serviceProvider, IPipelineFactory pipelineFactory, IMapper mapper, ILogger logger) : base(serviceProvider, pipelineFactory, mapper, logger)
    {
    }

    // InitializeBatchMetadata
    // Tags each batch run with an ID and the pipeline name for logging and tracking.
    public override Dictionary<string, object> InitializeBatchMetadata()
    {
        return new Dictionary<string, object>
        {
            { "batchId", Guid.NewGuid().ToString() },
            { "pipeline", nameof(LoadSyncTrigger) }
        };
    }

    // Run — the main trigger method
    // Fires when Kafka messages arrive. Like main() in the stadium demo — it starts the whole process.
    [FunctionName(nameof(LoadSyncTrigger))]
    [Disable("Kafka:Trigger:LoadSyncTriggerDisabled")]
    public async Task Run([KafkaTrigger(
        "%Kafka:Brokers%",
        "%Kafka:Topics:LoadSyncCombined%",
        ConsumerGroup = "%Kafka:ConsumerGroups:LoadsCombined%",
        Protocol = BrokerProtocol.SaslSsl,
        AuthenticationMode = BrokerAuthenticationMode.ScramSha256,
        Username = "%Kafka:Username%",
        Password = "%Kafka:Password%",
        SslCaLocation = "%Kafka:SslCaLocation%"
    )] KafkaEventData<string>[] kafkaEvents)
    {
        var startedAt = DateTimeOffset.UtcNow;

        // Create the shared context — like building a StadiumEntryContext before running the pipeline.
        var pipelineContext = InitializeContext(nameof(LoadSyncTrigger), _logger);

        try
        {
            // Step 1: Read the Kafka messages and convert them to load documents.
            var loadDtos = kafkaEvents.DeserializeEventData<StandardizedLoadDto>();
            var loadCoreDocuments = _mapper.Map<IReadOnlyCollection<LoadCoreDocument>>(loadDtos);

            if (loadCoreDocuments?.Any() == true)
            {
                _logger.LogInformation($"{nameof(LoadSyncTrigger)} documentIds: {JsonConvert.SerializeObject(loadCoreDocuments.Select(x => $"{x.Id}").ToList())}, EventId: {pipelineContext.GetEventId()}");

                // Step 2: Put the load data onto the context so pipeline steps can use it.
                pipelineContext.SetPartialSuccess(false);
                pipelineContext.SetLoadCoreDocumentsToUpsert(loadCoreDocuments);

                // Step 3: Create the pipeline and run it.
                // _pipelineFactory.Create<LoadSyncPipeline>() — builds the pipeline with its steps.
                // ExecuteAsync(pipelineContext) — like runStadiumEntryPipeline(); runs each step in order.
                var loadSyncPipeline = _pipelineFactory.Create<LoadSyncPipeline>();
                await loadSyncPipeline.ExecuteAsync(pipelineContext);

                // Step 4: Log results (how many documents processed, how long it took, etc.).
                LogMetadata<LoadCoreDocument>(kafkaEvents, pipelineContext, startedAt, AggregateBusMetadata(loadDtos), _logger);
            }
        }
        catch (Exception ex)
        {
            // Something went wrong outside the pipeline (e.g. bad Kafka message, mapping error).
            _logger.LogError(ex, $"{nameof(LoadSyncTrigger)}: {ex.Message}, EventId: {pipelineContext.GetEventId()}");
        }
        finally
        {
            // Always log how long the whole trigger took, whether it succeeded or failed.
            _logger.LogInformation($"{nameof(LoadSyncTrigger)}: Duration: {startedAt.ToTotalMillisecondsDuration()}, EventId: {pipelineContext.GetEventId()}");
        }
    }
}
