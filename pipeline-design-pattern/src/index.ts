// ----------------------------------- Pipeline pattern demo -----------------------------------

// --------------- Behind the scenes code / logic ---------------
//
// Demo Notes: 
//   1. StadiumEntryContext
//      - This is the shared object/context that is passed through every stage (fan name, ticket, seat, VIP).
//      - Each stage reads and updates it. Then passes it to the next stage.
//
//   2. Stages (scanTicket, verifyStadiumSeat, checkIfVIP, grantStadiumEntry)
//      - The current stages are: 
//          - scanTicket 
//          - verifyStadiumSeat
//          - checkIfVIP
//          - grantStadiumEntry
//      - Each stage does one job in the pipeline.
//      - Each stage returns the updated context. And if a stage fails, it sets "failedStage" and the pipeline stops.
//
//   3. stadiumEntryPipeline
//      - This is the list of stages in order. Or in other words, this is the pipeline.
//      - Stages always run in this set order.
//
//   4. runStadiumEntryPipeline()
//      - This is what runs the pipeline and passes the context along.
//      - Note, this also stops the pipeline early if a stage fails.
//
//
// Note, other stuff like the questions, demo ticket, and printGate pass are just helpers for the demo.
//
// ------------------------------------------------------------------------------------------------


// This allows us to read input from the terminal.
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// This function asks the user a question and returns the answer.
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

// This function makes the user enter an answer.
async function requiredQuestion(prompt: string): Promise<string> {
  while (true) {
    const answer = await question(prompt);
    if (answer !== "") {
      return answer;
    }
    console.log("  Please enter an answer.\n");
  }
}

// This function makes the user enter a yes/no answer.
async function requiredYesNoAnswer(prompt: string): Promise<boolean> {
  while (true) {
    const answer = await question(prompt);
    const parsed = parseYesNoAnswer(answer);
    if (parsed !== null) {
      return parsed;
    }
    console.log("  Please enter a yes or no answer.\n");
  }
}

// Convert answer: 
// This function just makes yes = true and no = false.
function parseYesNoAnswer(answer: string): boolean | null {
  const normalized = answer.trim().toLowerCase();
  if (normalized === "yes" || normalized === "y") {
    return true;
  }
  if (normalized === "no" || normalized === "n") {
    return false;
  }
  return null;
}

// Game details
const GAME_LABEL = "USA vs England — Quarterfinal, July 10, 2026";
const STADIUM_LABEL = "SoFi Stadium"; //SoFi Stadium, Inglewood, California

// Ticket details
const VALID_TICKET_CODE = "USMNT-2026-USA-ENG";
const VALID_SECTION = "112";
const VALID_ROW = "8";
const VALID_SEAT = "14";

// Demo ticket
// This is the ticket record used in the demo (VIP is random each time it runs).
interface DemoTicket {
  ticketCode: string;
  section: string;
  row: string;
  seat: string;
  hasVip: boolean;
}

// createDemoTicket
// This function creates a demo ticket with random VIP status.
function createDemoTicket(): DemoTicket {
  return {
    ticketCode: VALID_TICKET_CODE,
    section: VALID_SECTION,
    row: VALID_ROW,
    seat: VALID_SEAT,
    hasVip: Math.random() < 0.5,
  };
}

// Stadium entry context
// This is the shared object/context that is passed through every stage in the pipeline.
interface StadiumEntryContext {
  fanName: string;
  ticketCode: string;
  section: string;
  row: string;
  seat: string;
  ticketHasVip: boolean; // VIP - What is on the fan's ticket
  vipAnswer: boolean; // VIP - What the fan entered
  approved: boolean; // If the fan is approved to enter the stadium
  failedStage: string; // If a stage fails, this is the name of the stage that failed
  stepLog: string[]; // This is the log of the steps that have been run so far.
}

// PipelineStage
// This outlines the structure of a stage in the pipeline. (context in -> do work -> context out)
// Every stage receives context and must return context (Updated or not).
type PipelineStage = (context: StadiumEntryContext) => StadiumEntryContext;


// The pipeline — ordered list of stages
// You can add, remove, or reorder these stages to change the flow of the pipeline.
const stadiumEntryPipeline: PipelineStage[] = [
  scanTicket, // Stage 1
  verifyStadiumSeat, // Stage 2
  checkIfVIP, // Stage 3
  grantStadiumEntry, // Stage 4
];

// runStadiumEntryPipeline — the pipeline runner
// This function runs the pipeline and passes the context to the next stage.
// Note, it also stops the pipeline early if a stage fails.
// Ocastrator
function runStadiumEntryPipeline(context: StadiumEntryContext): StadiumEntryContext {
  let current = context;
  const totalStages = stadiumEntryPipeline.length;

  for (let i = 0; i < totalStages; i++) {
    const stage = stadiumEntryPipeline[i];
    const stageNumber = i + 1;
    const stageName = stage.name;

    current = {
      ...current,
      stepLog: [...current.stepLog, `Step ${stageNumber} of ${totalStages}: ${stageName}`],
    };

    current = stage(current);

    if (current.failedStage !== "") {
      break;
    }
  }

  return current;
}


// ----------------------------------- Pipeline stages -----------------------------------

// Pipeline stage 1 — scanTicket
// This stage checks that the ticket code is valid for the game.
function scanTicket(context: StadiumEntryContext): StadiumEntryContext {
  const code = context.ticketCode.trim().toUpperCase();

  if (code !== VALID_TICKET_CODE) {
    return {
      ...context,
      approved: false,
      failedStage: "scanTicket",
      stepLog: [
        ...context.stepLog,
        `  -> FAILED: ticket code "${context.ticketCode}" is not valid for ${GAME_LABEL}.`,
      ],
    };
  }

  return {
    ...context,
    ticketCode: code,
    stepLog: [
      ...context.stepLog,
      `  -> PASSED: ticket code is valid for ${GAME_LABEL}. \n`,
    ],
  };
}

// Pipeline stage 2 — verifyStadiumSeat
// This stage checks that the section, row, and seat match the ticket record.
function verifyStadiumSeat(context: StadiumEntryContext): StadiumEntryContext {
  const sectionMatch = context.section.trim() === VALID_SECTION;
  const rowMatch = context.row.trim() === VALID_ROW;
  const seatMatch = context.seat.trim() === VALID_SEAT;

  if (!sectionMatch || !rowMatch || !seatMatch) {
    return {
      ...context,
      approved: false,
      failedStage: "verifyStadiumSeat",
      stepLog: [
        ...context.stepLog,
        `  -> FAILED: seat Section ${context.section}, Row ${context.row}, Seat ${context.seat} does not match this ticket.`,
        `    (Expected Section ${VALID_SECTION}, Row ${VALID_ROW}, Seat ${VALID_SEAT}.)`,
      ],
    };
  }

  return {
    ...context,
    stepLog: [
      ...context.stepLog,
      `  -> PASSED: Section ${VALID_SECTION}, Row ${VALID_ROW}, Seat ${VALID_SEAT} confirmed. \n`,
    ],
  };
}

// Pipeline stage 3 — checkIfVIP
// This stage checks that the VIP answer matches what is on the ticket record.
function checkIfVIP(context: StadiumEntryContext): StadiumEntryContext {
  if (context.vipAnswer !== context.ticketHasVip) {
    const expected = context.ticketHasVip ? "YES" : "NO";
    const received = context.vipAnswer ? "YES" : "NO";

    return {
      ...context,
      approved: false,
      failedStage: "checkIfVIP",
      stepLog: [
        ...context.stepLog,
        `  -> FAILED: VIP answer "${received}" does not match this ticket (expected "${expected}"). \n`,
      ],
    };
  }

  if (context.ticketHasVip) {
    return {
      ...context,
      stepLog: [
        ...context.stepLog,
        "  -> PASSED: VIP lounge access confirmed on this ticket. \n",
      ],
    };
  }

  return {
    ...context,
    stepLog: [
      ...context.stepLog,
      "  -> PASSED: standard ticket confirmed — no VIP on this ticket. \n",
    ],
  };
}

// Pipeline stage 4 — grantStadiumEntry
// This is the final stage — it is the only stage that sets approved to true.
function grantStadiumEntry(context: StadiumEntryContext): StadiumEntryContext {
  return {
    ...context,
    approved: true,
    stepLog: [
      ...context.stepLog,
      `  -> PASSED: ${context.fanName} is cleared to enter ${STADIUM_LABEL}. \n`,
    ],
  };
}




// --- DEMO! In the terminal, run "npm run dev" to start! ---

async function main(): Promise<void> {
  console.log("\n=============== Pipeline Design Pattern: Stadium Entry ===============\n");
  console.log(`----- Game Details -----`);
  console.log(`- Game: ${GAME_LABEL}`);
  console.log(`- Stadium: ${STADIUM_LABEL}\n\n`);


  console.log("----- How the Pipeline pattern works in this demo ----- \n");
  console.log("  1. One context object (StadiumEntryContext) that holds all of the fan and ticket data.");
  console.log("  2. Four stages, each stage does one specific job. Each stage runs in order.");
  console.log("  3. runStadiumEntryPipeline() runs each stage and passes the context along.");
  console.log("  4. If a stage fails, the pipeline stops and later stages do not run.\n");

  try {
    await runStadiumEntryDemo();
  } finally {
    rl.close();
  }
}

// runStadiumEntryDemo
// This function collects fan details and runs the stadium entry pipeline.
async function runStadiumEntryDemo(): Promise<void> {
  const demoTicket = createDemoTicket(); // This is the ticket details.
  printSampleTicket(demoTicket); // This prints the ticket details to the console.

  console.log("\n\n Enter your details to enter the stadium.\n");

  const fanName = await requiredQuestion("Question: What is your name? ");
  const ticketCode = await requiredQuestion("Question: What is your ticket confirmation code? ");
  const section = await requiredQuestion("Question: What section is on your ticket? ");
  const row = await requiredQuestion("Question: What row is on your ticket? ");
  const seat = await requiredQuestion("Question: What seat number is on your ticket? ");
  const vipAnswer = await requiredYesNoAnswer(
    "Question: Are you a VIP member? ( yes or no ): "
  );

  const context: StadiumEntryContext = {
    fanName: fanName.trim(),
    ticketCode,
    section,
    row,
    seat,
    ticketHasVip: demoTicket.hasVip,
    vipAnswer,
    approved: false,
    failedStage: "",
    stepLog: [],
  };

  console.log("\n  --------- Running entry pipeline ---------\n");
  console.log("  Pipeline order: scanTicket -> verifyStadiumSeat -> checkIfVIP -> grantStadiumEntry\n");

  const result = runStadiumEntryPipeline(context);

  for (const line of result.stepLog) {
    console.log(`  ${line}`);
  }

  console.log("\n  --------- Pipeline result ---------\n");

  if (result.approved) {
    printGatePass(result);
  } else {
    console.log(`  Entry denied at stage: ${result.failedStage}\n`);
    console.log("  Later stages did not run. Please see a stadium attendant for help.\n");
  }

  console.log(
    "  Pattern note: stadiumEntryPipeline runs each stage in order, passing the same context through every step. Data flows from one stage to the next in the pipeline.\n"
 
  );
}

// printSampleTicket
// This function prints a sample ticket so the user knows what values to enter in the demo.
function printSampleTicket(ticket: DemoTicket): void {
  const labelWidth = 14;
  const vipLabel = ticket.hasVip ? "YES" : "NO";

  console.log("\n");
  console.log("  ═══════════════════════════════════════════════════════════");
  console.log("              2 0 2 6   F I F A   W O R L D   C U P");
  console.log("                      ——— ADMIT ONE ———");
  console.log("  ═══════════════════════════════════════════════════════════\n");
  console.log("                        USA  vs  ENG");
  console.log("                 Quarterfinal · July 10, 2026\n");
  console.log("                        SoFi Stadium");
  console.log("                  Inglewood, California\n");
  console.log("  ───────────────────────────────────────────────────────────");
  console.log(`  ${"TICKET CODE".padEnd(labelWidth)} ${ticket.ticketCode}`);
  console.log(`  ${"SECTION".padEnd(labelWidth)} ${ticket.section}`);
  console.log(`  ${"ROW".padEnd(labelWidth)} ${ticket.row}`);
  console.log(`  ${"SEAT".padEnd(labelWidth)} ${ticket.seat}`);
  console.log(`  ${"VIP".padEnd(labelWidth)} ${vipLabel}`);
  console.log("  ───────────────────────────────────────────────────────────");
  console.log("        Present this ticket at the gate for entry.");
  console.log("  ═══════════════════════════════════════════════════════════\n");
}

// printGatePass
// This function prints a simple gate pass when entry is approved.
function printGatePass(context: StadiumEntryContext): void {
  const vipLine = context.ticketHasVip ? "  VIP:   YES\n" : "";

  console.log("  ═══════════════════════════════════════════════════════════");
  console.log("          W E L C O M E   T O   S O F I   S T A D I U M !");
  console.log("                    ———————————————————————");
  console.log("                G A T E   P A S S — A P P R O V E D ");
  console.log("  ═══════════════════════════════════════════════════════════\n");
  console.log(`  Fan:     ${context.fanName}`);
  console.log(`  Game:    ${GAME_LABEL}`);
  console.log(`  Ticket:  ${context.ticketCode}`);
  console.log(`  Seat:    Section ${context.section}, Row ${context.row}, Seat ${context.seat}`);
  console.log(vipLine);
  console.log("  ═══════════════════════════════════════════════════════════\n");
}

void main();
