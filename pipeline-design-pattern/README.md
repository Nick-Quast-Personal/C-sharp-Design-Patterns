# Pipeline Design Pattern

The **Pipeline** pattern breaks a job into **ordered stages**. Each stage receives a shared context object, does one focused task, and passes the result to the next stage. If a stage fails, the pipeline can stop early instead of running the rest.

## Key Idea

Define a context object (`StadiumEntryContext` here) that flows through the pipeline. Each **stage function** (`scanTicket`, `verifyStadiumSeat`, `checkIfVIP`, `grantStadiumEntry`) does one job and returns the updated context. The **pipeline** (`stadiumEntryPipeline`) is the ordered list of stages. The **pipeline runner** (`runStadiumEntryPipeline`) calls each stage in order and stops when a stage sets `failedStage` — only `grantStadiumEntry` sets `approved` to true.

## When to Use

- Break a multi-step process into small, readable steps (validate → verify → check access → approve).
- Reuse or reorder stages without rewriting the whole flow.
- Stop early when something fails (invalid ticket, wrong seat, no VIP access).
- Prefer this over the **Decorator** pattern when you need **sequential processing**, not **stacking behavior** on one object.

## Pipeline vs Decorator

| Decorator | Pipeline |
|-----------|----------|
| Wraps one object to **add** behavior | Runs **ordered stages** on shared context |
| All wrappers share the same interface | Each stage is a separate function in a list |
| Stack is built at runtime via choices | Pipeline order is fixed; choices affect **input data** |

## Example: 2026 World Cup Stadium Entry

**Game:** USA vs England — Quarterfinal, July 10, 2026  
**Stadium:** SoFi Stadium, Inglewood, California

- **`StadiumEntryContext`** — fan name, ticket code, seat info, VIP flag, approval status, and a step log.
- **`scanTicket`** — validates the ticket confirmation code for this game.
- **`verifyStadiumSeat`** — confirms section, row, and seat match the ticket record.
- **`checkIfVIP`** — checks that the fan's VIP answer matches the VIP status on the ticket record (randomly YES or NO each run).
- **`grantStadiumEntry`** — final approval and gate pass.
- **`runStadiumEntryPipeline`** — runs all stages in order; stops if any stage rejects entry.

## Pattern Q&A

### Q1: What is the Pipeline pattern used for?

- **Breaking big jobs into small steps** — Instead of one giant function that does everything, you split the work into ordered stages (e.g. scan ticket → verify seat → check access → grant entry).
- **Passing data through a chain** — Each stage receives input, does one focused task, and passes the result to the next stage.
- **Reusing and reordering steps** — You can add, remove, or rearrange stages without rewriting the whole flow.
- **Stopping early when something fails** — If a stage rejects the request (invalid ticket, wrong seat), the pipeline can halt immediately instead of running useless later steps.

### Q2: What do you like about the Pipeline pattern?

- **Easy to read** — The flow reads top-to-bottom like a checklist: "first we do this, then this, then this."
- **Easy to test** — Each stage can be tested on its own with sample input, without running the full pipeline.
- **Single responsibility** — Each stage does one job well, which keeps code small and focused.
- **Flexible composition** — Different pipelines can share the same stages (e.g. a "VIP entry" pipeline reuses scan + verify but adds extra hospitality checks).

### Q3: What don't you like about the Pipeline pattern?

- **Hidden dependencies between stages** — Later stages may assume earlier stages already set certain fields; if order is wrong, bugs are subtle.
- **Every step runs in order** — You cannot skip straight to the one step that should handle a special case; earlier steps still run first.
- **Debugging long chains** — When something fails in stage 7 of 10, you must trace back through each stage to find the root cause.
- **Too much setup for small jobs** — If you only have two simple steps, a full pipeline is extra work. Regular functions are often enough.

## How to Run

```bash
cd pipeline-design-pattern
npm install
npm run dev
```

Enter your name, ticket code, seat details, and VIP status (YES, NO, yes, no, y, or n — as shown on your ticket). The demo prints each pipeline stage as it runs, then shows a gate pass or a rejection message.

**Demo hints:** use ticket code `USMNT-2026-USA-ENG`, seat Section `112`, Row `8`, Seat `14`, and enter the VIP value shown on your ticket.
