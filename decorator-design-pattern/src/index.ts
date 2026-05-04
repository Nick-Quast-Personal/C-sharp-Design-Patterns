// ----------------------------------- Decorator pattern demo -----------------------------------

// --------------- Behind the scenes code / logic ---------------

// This allows us to read input from the terminal.
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// This function asks the user a question and returns the answer.
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim().toLowerCase()));
  });
}

// This function checks if the answer is yes.
function yes(answer: string): boolean {
  return answer === "y" || answer === "yes";
}

// This function calculates the total price of the package.
function packageTotalUsd(pkg: GameDayPackage): number {
  return pkg.lineItems().reduce((sum, line) => sum + line.amountUsd, 0);
}

// Receipt line
// This is the receipt line at the bottom of the receipt.
interface ReceiptLine {
  readonly label: string;
  readonly amountUsd: number;
}

// Game day package
// This interface is the base interface for all the packages.
interface GameDayPackage {
  lineItems(): readonly ReceiptLine[];
}

// General admission
// This class is the concrete component for the general admission ticket.
class GeneralAdmission implements GameDayPackage {
  lineItems(): readonly ReceiptLine[] {
    return [
      {
        label: "General admission — Nelson Road (AFC Richmond game)",
        amountUsd: 45,
      },
    ];
  }
}

// Game day package decorator
// This class is the base class for all the decorators.
abstract class GameDayPackageDecorator implements GameDayPackage {
  constructor(protected readonly wrapped: GameDayPackage) {}

  abstract lineItems(): readonly ReceiptLine[];
}

// VIP lounge decorator
// This class is the decorator for the VIP lounge.
class VipLoungeDecorator extends GameDayPackageDecorator {
  lineItems(): readonly ReceiptLine[] {
    return [...this.wrapped.lineItems(), { label: "+ VIP Lounge", amountUsd: 35 }];
  }
}

// Parking pass decorator
// This class is the decorator for the parking pass.
class ParkingPassDecorator extends GameDayPackageDecorator {
  lineItems(): readonly ReceiptLine[] {
    return [...this.wrapped.lineItems(), { label: "+ Parking Pass", amountUsd: 12 }];
  }
}

// Believe Tshirt decorator
// This class is the decorator for the Believe T-shirt.
class BelieveTshirtDecorator extends GameDayPackageDecorator {
  lineItems(): readonly ReceiptLine[] {
    return [
      ...this.wrapped.lineItems(),
      { label: '+ Official "Believe" T-shirt', amountUsd: 18 },
    ];
  }
}


// --- DEMO! In the terminal, run "npm run dev" to start! ---
async function main(): Promise<void> {
  console.log("\n=============== Decorator Design Pattern: Game Day Package ===============\n");
  console.log("- Get your game day package now!\n");
  console.log("- Create your very own Nelson Road ticket bundle!\n" );
  console.log("- Each add on you add to your package will enhance your Game Day experience!\n");
  try {
    await buildPackage();
  } finally {
    rl.close();
  }
}

// Build the package
// This function builds the package and adds the add-ons to the package.
async function buildPackage(): Promise<void> {
  let pkg: GameDayPackage = new GeneralAdmission();

  console.log("\nStarting from general admission ($45).\n");

  const vip = await question("Question: Would you like to add a VIP lounge? (+$35) [y/n]: ");
  if (yes(vip)) pkg = new VipLoungeDecorator(pkg);

  const parking = await question("Question: Would you like to add a parking pass? (+$12) [y/n]: ");
  if (yes(parking)) pkg = new ParkingPassDecorator(pkg);

  const tshirt = await question(
    "Question: Would you like to add an official Believe T-shirt? (+$18) [y/n]: "
  );
  if (yes(tshirt)) pkg = new BelieveTshirtDecorator(pkg);

  printReceipt(pkg);

  const pay = await question("\n Question: Would you like to complete your purchase now? [y/n]: ");
  if (yes(pay)) {
    console.log("\n\n  Thank you for your purchase.\n\n");
    console.log("  ═══════════════════════════════════════════════════════════");
    console.log("                         Welcome to ");
    console.log("             N E L S O N   R O A D   S T A D I U M ! ");
    console.log("  ═══════════════════════════════════════════════════════════\n");
  } else {
    console.log("\n  No worries, your cart wasn’t charged. Come back when you’re ready! \n\n\n");
  }
}

/** Receipt-style print: base line then add-ons, prices right-aligned */
function printReceipt(pkg: GameDayPackage): void {
  const lines = pkg.lineItems();
  const total = packageTotalUsd(pkg);
  const labelColumnWidth = 52;

  console.log("\n");
  console.log("  ═══════════════════════════════════════════════════════════");
  console.log("           N E L S O N   R O A D   —   R E C E I P T");
  console.log("  ═══════════════════════════════════════════════════════════\n");

  for (const line of lines) {
    const price = `$${line.amountUsd.toFixed(2)}`;
    const truncated =
      line.label.length > labelColumnWidth
        ? `${line.label.slice(0, labelColumnWidth - 3)}...`
        : line.label;
    const gap = Math.max(1, labelColumnWidth - truncated.length);
    console.log(`  ${truncated}${" ".repeat(gap)}${price}`);
  }

  console.log("\n  ───────────────────────────────────────────────────────────");
  const totalStr = `$${total.toFixed(2)} USD`;
  console.log(`  TOTAL                                          ${totalStr}`);
  console.log("  ═══════════════════════════════════════════════════════════\n");

  console.log(
    "  (Each decorator adds to the line item(s) above it.)\n"
  );
}

void main();
