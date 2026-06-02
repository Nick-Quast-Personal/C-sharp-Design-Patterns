// ----------------------------------- Template Method pattern demo -----------------------------------

// --------------- Behind the scenes code / logic ---------------
//
// READ THIS SECTION FIRST TO UNDERSTAND THE TEMPLATE METHOD PATTERN:
//
//   1. PaymentWorkflow.runPayment()
//        - This is the template method: it defines the high-level payment flow.
//        - Every bank executes the same steps in the same order.

//   2. collectPaymentDetails() (overridden by each bank subclass)
//        - Step 2 hook: Collects card info (customized per bank).

//   3. charge() (overridden by each bank subclass)
//        - Step 3 hook: Processes the payment (customized per bank).

//   4. Steps 1 and 4 (add processing fee and print receipt)
//        - These are implemented in the base class (These are the same for all banks).


// Not part of the Template Method pattern (demo support only):
//   - grocery-cart.ts: sets up cart items and formats the receipt.


import * as readline from "readline";
import {
  centeredReceiptLine,
  createDemoCart,
  formatReceiptItemLine,
  formatReceiptMoneyRow,
  formatReceiptTextRow,
  printReceiptTop,
  receiptDividerThin,
  printCartSummary,
  type CartSummary,
} from "./grocery-cart";

// Base method (Steps are the same for all banks
abstract class PaymentWorkflow {
  constructor(protected readonly cart: CartSummary) {}

  protected cartSubtotal = 0;
  protected processingFee = 0.5;
  protected tenderTotal = 0;
  protected bankConfirmationId = "";
  protected maskedCardLabel = "";

  // This runs the payment process for all banks.
  // This is a method or action that is the same for all banks.
  // This is NOT the base class.
  async runPayment(): Promise<void> {
    this.cartSubtotal = this.cart.totalUsd;

    console.log("\n  --------- Payment Process --------- \n");

    console.log(" Step 1. Add card processing fee to the total:");
    this.addProcessingFee();
    console.log("");

    console.log(" Step 2. Collect card Information:");
    await this.collectPaymentDetails();
    console.log("");

    console.log(" Step 3. Charge the card:");
    this.charge();
    console.log("");

    console.log(" Step 4. Print the receipt:\n");
    this.printReceipt();

    console.log(
      "  Pattern note: runPayment() order never changes. Steps 1 and 4 are shared on the base class. " +
        "Each bank overrides collectPaymentDetails() (step 2) and charge() (step 3).\n"
    );
  }

  // Step 1 — Add the processing fee to the cart total. 
  // This is the same for every bank. (Base class)
  protected addProcessingFee(): void {
    this.tenderTotal = Math.round((this.cartSubtotal + this.processingFee) * 100) / 100;
    console.log(
      `      Cart total: $${this.cartSubtotal.toFixed(2)} + processing fee $${this.processingFee.toFixed(
        2
      )} = $${this.tenderTotal.toFixed(2)}`
    );
  }

  // Step 2 — Collect card information
  // Each bank subclass implements its own card collection flow.
  // Overridden by each bank subclass.
  // Each subclass must provide its own way to collect payment details.
  protected abstract collectPaymentDetails(): Promise<void>;

  // Step 3 — Each bank subclass implements its own payment API call.
  protected abstract charge(): void;

  // Step 4 — Same receipt layout for every bank (Base class)
  protected printReceipt(): void {
    printReceiptTop();
    for (const line of this.cart.lines) {
      console.log(formatReceiptItemLine(line));
    }
    receiptDividerThin();
    console.log(formatReceiptMoneyRow("SUBTOTAL", this.cartSubtotal));
    console.log(formatReceiptMoneyRow("CARD FEE", this.processingFee));
    console.log(formatReceiptMoneyRow("TOTAL", this.tenderTotal));
    console.log(formatReceiptMoneyRow("TENDERED", this.tenderTotal));
    receiptDividerThin();
    console.log(formatReceiptTextRow("PAID WITH", this.maskedCardLabel));
    console.log(formatReceiptTextRow("AUTHORIZATION", this.bankConfirmationId));
    receiptDividerThin();
    console.log(centeredReceiptLine("\n" + "            *** THANK YOU — Have a nice day ***" + "\n"));
    console.log(centeredReceiptLine("===============================================" + "\n"));
    console.log("");
  }
}

// Wells Fargo Payment Flow (Concrete class, overrides steps 2 and 3)
class WellsFargoPaymentFlow extends PaymentWorkflow {
  protected async collectPaymentDetails(): Promise<void> {
    const last4 = await requireCardLastFour("Wells Fargo");
    await requireCardPin("Wells Fargo");
    this.maskedCardLabel = `Wells ****${last4}`;
  }

  protected charge(): void {
    // Mock Wells Fargo Payment API — returns a confirmation number
    this.bankConfirmationId = `WF-${Date.now().toString(36).toUpperCase()}`;
    console.log("      Wells Fargo — Approved");
    console.log(`      Confirmation number - ${this.bankConfirmationId}`);
  }
}

// Chase Payment Flow (Concrete class, overrides steps 2 and 3)
class ChasePaymentFlow extends PaymentWorkflow {
  protected async collectPaymentDetails(): Promise<void> {
    const last4 = await requireCardLastFour("Chase Bank");
    await requireStreetAddress("Chase Bank");
    this.maskedCardLabel = `Chase ****${last4}`;
  }

  protected charge(): void {
    // Mock Chase Payment API — returns a confirmation number
    this.bankConfirmationId = `CHG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    console.log("      Chase Bank — Approved");
    console.log(`      Confirmation number - ${this.bankConfirmationId}`);
  }
}

// Bank of America Payment Flow (Concrete class, overrides steps 2 and 3)
class BankOfAmericaPaymentFlow extends PaymentWorkflow {
  protected async collectPaymentDetails(): Promise<void> {
    const last4 = await requireCardLastFour("Bank of America");
    await requireBillingZip("Bank of America");
    this.maskedCardLabel = `BofA ****${last4}`;
  }

  protected charge(): void {
    // Mock Bank of America Payment API — returns a confirmation number
    const n = Math.floor(100 + Math.random() * 899);
    this.bankConfirmationId = `BOFA-${n}`;
    console.log("      Bank of America — Approved");
    console.log(`      Confirmation number - ${this.bankConfirmationId}`);
  }
}

const isInteractiveTerminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let pendingLine: ((line: string) => void) | null = null;
const lineQueue: string[] = [];

if (!isInteractiveTerminal) {
  rl.on("line", (line) => {
    if (pendingLine) {
      pendingLine(line);
      pendingLine = null;
    } else {
      lineQueue.push(line);
    }
  });
}

function input(prompt: string): Promise<string> {
  if (isInteractiveTerminal) {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => resolve(answer.trim()));
    });
  }

  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const finish = (line: string): void => {
      process.stdout.write(line + "\n");
      resolve(line.trim());
    };
    if (lineQueue.length > 0) {
      finish(lineQueue.shift()!);
      return;
    }
    pendingLine = finish;
  });
}

async function requireInput(prompt: string): Promise<string> {
  while (true) {
    const answer = await input(prompt);
    if (answer.length > 0) {
      return answer;
    }
    console.log("      Please enter a response (empty answers are not allowed).\n");
  }
}

async function requireCardLastFour(bankBrand: string): Promise<string> {
  const prompt = `      Question: What are the last 4 digits of your ${bankBrand} card?: `;
  while (true) {
    const raw = await requireInput(prompt);
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length === 4) {
      return digitsOnly;
    }
    console.log("      Please enter the last 4 digits of your card.\n");
  }
}

async function requireCardPin(bankBrand: string): Promise<string> {
  const prompt = `      Question: What is your 4-digit PIN for your ${bankBrand} card?: `;
  while (true) {
    const raw = await requireInput(prompt);
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length === 4) {
      return digitsOnly;
    }
    console.log("      Please enter a 4-digit PIN.\n");
  }
}

async function requireStreetAddress(bankBrand: string): Promise<string> {
  const prompt = `      Question: What street do you live on? (${bankBrand} verification): `;
  return requireInput(prompt);
}

async function requireBillingZip(bankBrand: string): Promise<string> {
  const prompt = `      Question: What is the billing zip on your ${bankBrand} card?: `;
  while (true) {
    const raw = await requireInput(prompt);
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length === 5) {
      return digitsOnly;
    }
    console.log("      Please enter a 5-digit billing zip.\n");
  }
}



// --- DEMO! In the terminal, run "npm run dev" to start! ---
async function main(): Promise<void> {
  console.log(
    "\n=============== Template Method Design Pattern: Self-checkout ===============\n"
  );

  const cart = createDemoCart();
  // Cart preview below = demo setup (not part of Template Method).
  // Step 4 inside runPayment() prints the final receipt after payment.
  printCartSummary(cart);

  console.log(" -----------------------------------------------------------------------------\n");
  console.log(" -----------------------------------------------------------------------------\n");

  console.log(
    "  Question: How would you like to pay?  (1) Wells Fargo  (2) Chase Bank  (3) Bank of America\n"
  );

  try {
    let choice: "1" | "2" | "3";
    while (true) {
      const answer = await requireInput("  Question: Please select a payment option. [1/2/3]: ");
      if (answer === "1" || answer === "2" || answer === "3") {
        choice = answer;
        break;
      }
      console.log("  Question: Please enter 1, 2, or 3.\n");
    }

    const bankLabels: Record<"1" | "2" | "3", string> = {
      "1": "Wells Fargo",
      "2": "Chase Bank",
      "3": "Bank of America",
    };
    console.log(`\n\n Payment method selected: ${bankLabels[choice]} \n`);

    let flow: PaymentWorkflow;
    switch (choice) {
      case "1":
        flow = new WellsFargoPaymentFlow(cart);
        break;
      case "2":
        flow = new ChasePaymentFlow(cart);
        break;
      case "3":
        flow = new BankOfAmericaPaymentFlow(cart);
        break;
    }
    await flow.runPayment();
  } finally {
    rl.close();
  }
}

void main();
