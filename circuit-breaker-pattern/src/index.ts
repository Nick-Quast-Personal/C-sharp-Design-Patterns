// ----------------------------------- Circuit Breaker pattern demo -----------------------------------

// --------------- Behind the scenes code / logic ---------------
//
// Demo Notes:
//   1. CircuitState ("closed" | "open" | "half-open")
//      - closed: refund API calls are allowed normally.
//      - open: too many failures. No API calls — fail fast and save the refund request.
//      - half-open: wait time passed. One test refund call checks if the API is back.
//
//   2. CircuitBreaker
//      - Wraps the refund API call and tracks failures.
//      - Opens after failureThreshold failures in a row.
//      - After resetTimeoutMs, allows one half-open test call.
//      - A successful call resets back to closed.
//
//   3. processRefundRemote()
//      - Simulated Walmart refund API.
//      - Fails on a simple scripted schedule so the demo is easy to follow.
//
//   4. requestRefund()
//      - What the Walmart+ app calls when you tap "Request refund".
//      - Uses the circuit breaker.
//      - When open: instant message + saved request (no slow API wait).
//
//   5. refundBreaker
//      - The shared circuit breaker for this demo.
//      - Opens after 3 failures. Tries again after 6 seconds.
//
// Note, the receipt, printRefundResult, and waitForEnter are just helpers for the demo.
//
// ------------------------------------------------------------------------------------------------


// This allows us to read input from the terminal.
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// This function waits for the user to press Enter.
function waitForEnter(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    rl.question(prompt, () => resolve());
  });
}

// This function waits for a number of milliseconds.
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Circuit breaker settings
const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 6000;
const REFUND_API_DELAY_MS = 1500;

// Missing item from the delivery
const MISSING_ITEM = "Milk";
const MISSING_ITEM_PRICE = 4.99;
const ORDER_NUMBER = "WM-8842";

// Circuit state
type CircuitState = "closed" | "open" | "half-open";

// Refund result
interface RefundResult {
  approved: boolean;
  message: string;
  circuitState: CircuitState;
  calledRefundApi: boolean;
  waitMs: number;
}

// Circuit open error
// Thrown when the circuit is open and the refund API must not be called.
class CircuitOpenError extends Error {
  constructor() {
    super("Circuit is open — refund API call blocked.");
    this.name = "CircuitOpenError";
  }
}

// Circuit breaker
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;

  constructor(
    private readonly failureThreshold: number,
    private readonly resetTimeoutMs: number
  ) {}

  // Get state
  getState(): CircuitState {
    if (this.failureCount < this.failureThreshold) {
      // Circuit CLOSED — failures are below the limit, calls are allowed.
      return "closed";
    }

    if (
      this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime >= this.resetTimeoutMs
    ) {
      // Circuit HALF-OPEN — wait time passed, one test call is allowed.
      return "half-open";
    }

    // Circuit OPEN — too many failures, calls are blocked.
    return "open";
  }

  // Execute
  async execute<T>(protectedCall: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === "open") {
      // Circuit OPEN — block the call immediately (fail fast).
      throw new CircuitOpenError();
    }

    if (state === "half-open") {
      // Circuit HALF-OPEN — allow one test call to see if the API recovered.
    } else {
      // Circuit CLOSED — normal mode, call goes through.
    }

    try {
      const result = await protectedCall();
      this.onSuccess();
      // Circuit CLOSED — success resets the breaker back to normal.
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  private onFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
  }

  getMillisUntilHalfOpen(): number {
    if (this.getState() !== "open" || this.lastFailureTime === null) {
      return 0;
    }
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.resetTimeoutMs - elapsed);
  }
}

// Scripted refund API results (only used when the circuit actually calls the API).
// Attempts 1-3 fail. Attempt 4 (half-open test) succeeds.
const REFUND_API_WILL_SUCCEED: readonly boolean[] = [false, false, false, true];

let refundApiCallCount = 0;

// Process refund remote
// Simulated Walmart refund API — slow when it fails.
async function processRefundRemote(itemName: string, amountUsd: number): Promise<void> {
  const willSucceed = REFUND_API_WILL_SUCCEED[refundApiCallCount] ?? true;
  refundApiCallCount += 1;

  await delay(REFUND_API_DELAY_MS);

  if (!willSucceed) {
    throw new Error("Refund system is unavailable. Please try again later.");
  }
}

// Refund breaker
const refundBreaker = new CircuitBreaker(FAILURE_THRESHOLD, RESET_TIMEOUT_MS);

// Request refund
// This is what the app runs when you tap "Request refund" for the missing item.
async function requestRefund(itemName: string, amountUsd: number): Promise<RefundResult> {
  const stateBefore = refundBreaker.getState();
  const startedAt = Date.now();

  try {
    await refundBreaker.execute(async () => {
      await processRefundRemote(itemName, amountUsd);
    });

    return {
      approved: true,
      message: `Refund approved — $${amountUsd.toFixed(2)} for ${itemName} will be credited in 3-5 days.`,
      circuitState: refundBreaker.getState(),
      calledRefundApi: true,
      waitMs: Date.now() - startedAt,
    };
  } catch (error) {
    const waitMs = Date.now() - startedAt;

    if (error instanceof CircuitOpenError) {
      // Circuit OPEN — do not call the API. Save the request and respond instantly.
      return {
        approved: false,
        message:
          `Refund system is down. Your $${amountUsd.toFixed(2)} refund for ${itemName} has been saved — we will process it automatically when the system is back.`,
        circuitState: "open",
        calledRefundApi: false,
        waitMs,
      };
    }

    const stateAfter = refundBreaker.getState();
    const prefix =
      stateBefore === "half-open"
        ? "Half-open test failed."
        : "Refund API call failed.";

    return {
      approved: false,
      message: `${prefix} ${error instanceof Error ? error.message : "Unknown error."}`,
      circuitState: stateAfter,
      calledRefundApi: true,
      waitMs,
    };
  }
}

// Print refund result
function printRefundResult(result: RefundResult, attemptNumber: number): void {
  const apiLine = result.calledRefundApi
    ? `Refund API called (waited ${result.waitMs} ms)`
    : `No refund API call — instant response (${result.waitMs} ms)`;

  console.log(`\n\n  Refund attempt #${attemptNumber}`);
  console.log(`  ---------------------`);
  console.log(`  Circuit: ${result.circuitState.toUpperCase()}`);
  console.log(`  ${apiLine}`);
  console.log(`  Result: ${result.approved ? "APPROVED" : "ERROR — Not approved. Please try again."}`);
  console.log(`  Error Message: ${result.message}`);
}

// --- Circuit Breaker DEMO! In the terminal, run "npm run dev" to start! ---

// Print demo banner
function printDemoBanner(): void {
  console.log("\n======== Circuit Breaker Design Pattern: Walmart+ ========\n");
  console.log("----- Notes / how this demo works -----\n");
  console.log("  1. CLOSED     —----> Refund API is called normally. AKA, everything is working and the world is happy.");
  console.log("  2. OPEN       —----> Too many failures. No API call. Request saved instantly. AKA, it's broken and the world is on fire.");
  console.log("  3. HALF-OPEN  —----> After a short wait, one test refund checks if the API is back online. AKA, it's broken but we're trying to fix it.");
  console.log("  4. CLOSED     —----> Test refund succeeds. Refund goes through. AKA, it's fixed and the world is happy again.\n\n");

  console.log("----- Timing Notes ------------------------------------------\n");
  console.log(` - The circuit breaker is opened after ${FAILURE_THRESHOLD} failed API calls. Then it retries after ${RESET_TIMEOUT_MS / 1000} seconds.\n`);
  console.log(" - Press Enter before each refund attempt.\n");
  console.log("-------------------------------------------------------------\n\n");
}

// Print delivery receipt
function printDeliveryReceipt(): void {
  console.log("\n  ═══════════════════════════════════════════════════════════");
  console.log("                  W A L M A R T +   D E L I V E R Y");
  console.log("  ═══════════════════════════════════════════════════════════\n");
  console.log(`  Order #${ORDER_NUMBER} — Delivered today\n`);
  console.log("    Bananas                              $2.49");
  console.log("    Bread                                $3.29");
  console.log(`    ${MISSING_ITEM.padEnd(36)} $${MISSING_ITEM_PRICE.toFixed(2)}  <---  MISSING`);
  console.log("    Eggs                                 $5.49");
  console.log("\n  ───────────────────────────────────────────────────────────");
  console.log("    Total                               $16.26");
  console.log("  ═══════════════════════════════════════════════════════════\n\n\n");
  
  console.log(`  Missing items:`);
  console.log("  ────────────────");
  console.log(`  - ${MISSING_ITEM} ($${MISSING_ITEM_PRICE.toFixed(2)})\n\n\n`);
}

// Ask the user if they want to start a refund before running the demo.

async function askToStartRefund(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question("Would you like to start a refund? (y/n):", (answer: string) => {
      const normalized = answer.trim().toLowerCase();
      if (normalized === "y" || normalized === "yes") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

async function main(): Promise<void> {
  printDemoBanner();
  printDeliveryReceipt();

  try {
    const wantsRefund = await askToStartRefund();
    if (wantsRefund) {
      await runRefundDemo();
    } else {
      console.log("\nThank you for using Walmart+");
    }
  } finally {
    rl.close();
  }
}


// Run refund demo
// Five refund attempts show closed -> open -> half-open -> closed.
async function runRefundDemo(): Promise<void> {
  // console.log("  --------- Refund attempts ---------\n");
  // console.log("  The refund system will fail a few times, then recover.\n");

  const totalAttempts = 4;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    await waitForEnter(`\n\n  Press Enter to request a refund for ${MISSING_ITEM} (attempt ${attempt})... `);

    const result = await requestRefund(MISSING_ITEM, MISSING_ITEM_PRICE);
    printRefundResult(result, attempt);

    // After the circuit opens, wait so the next attempt can run a half-open test.
    if (result.circuitState === "open" && attempt < totalAttempts) {
      const waitMs = refundBreaker.getMillisUntilHalfOpen();
      if (waitMs > 0) {
        console.log(
          `\n  Waiting ${Math.ceil(waitMs / 1000)} second(s) before the circuit can try one test refund (HALF-OPEN).............`
        );
        console.log(`.....................................................................................................................`);
        console.log(`..................................................................................................................... \n\n`);

        await delay(waitMs);
        console.log("  Circuit: HALF-OPEN\n");
        console.log("  Ready for a half-open test. Press Enter on the next attempt.\n");
      }
    }
  }

  console.log("\n\n\n\n  --------- END ---------\n");
  console.log("  Notes:");
  console.log("    - CLOSED: The refund API was called until it failed too many times.");
  console.log("    - OPEN: The app stopped making calls to the broken API and saved your request.");
  console.log("    - HALF-OPEN: One test refund checked if the system was back.");
  console.log("    - CLOSED again: The refund was approved.\n");
}

void main();
