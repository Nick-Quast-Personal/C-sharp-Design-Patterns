// ----------------------------------- Strategy Code Example! -----------------------------------

// Setup code / behind the scenes -------------
import * as readline from "readline"; // This just lets us read input from the terminal.

interface shippingStrategy {
  // Every strategy needs to have this. This is like a rule book.
  calculateShippingCost(packageWeight: number): number;
}

// Strategies / Shipping options
// In a real-world scenario, these would have their own files and be imported as needed.
const groundShipping: shippingStrategy = {
  calculateShippingCost: (packageWeight) => packageWeight * 1.5,
};

const expressShipping: shippingStrategy = {
  calculateShippingCost: (packageWeight) => packageWeight * 3.0 + 5.0,
};

const overnightShipping: shippingStrategy = {
  calculateShippingCost: (packageWeight) => packageWeight * 5.0 + 10.0,
};

// This is the guts or the navigator that handles everything.
// Note, it doesn't actually do the work, it just delegates it to the strategy that's picked.
// Kind of like a waiter at a restaurant.
class shippingCalculator {
  private currentStrategy: shippingStrategy;

  constructor(selectedStrategy: shippingStrategy) {
    // This sets the initial strategy.
    this.currentStrategy = selectedStrategy;
  }

  setStrategy(selectedStrategy: shippingStrategy): void {
    // This allows us to change the strategy.
    this.currentStrategy = selectedStrategy;
  }

  // This is what reaches out to the selected strategy and returns the resutl after the work is done.
  getShippingCost(packageWeight: number): number {
    return this.currentStrategy.calculateShippingCost(packageWeight);
  }
}

// --- DEMO! In the terminal, run "npm run dev" to start! ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=== Strategy Design Pattern: Shipping Cost Calculator ===\n");
console.log("Shipping Options:");
console.log("  - Ground Shipping___________________ Package Weight x $1.50/lb");
console.log(
  "  - Express Shipping__________________ Package Weight x $3.00/lb + $5.00 handling fee"
);
console.log(
  "  - Overnight Shipping________________ Package Weight x $5.00/lb + $10.00 handling fee \n\n"
);

function askForWeight(): void {
  rl.question(
    "Question: How many pounds is your package? ",
    (answer: string) => {
      const packageWeight = parseFloat(answer);

      if (isNaN(packageWeight) || packageWeight <= 0) {
        console.log("\n Please enter a valid weight greater than 0. \n");
        askForWeight();
        return;
      }

      console.log(`\n Package weight: ${packageWeight} lbs \n`);
      askForMethod(packageWeight);
    }
  );
}

function askForMethod(packageWeight: number): void {
  rl.question(
    "Question: Which shipping method would you like to use? (Ground, Express, or Overnight): ",
    (answer: string) => {
      const choice = answer.trim().toLowerCase();

      let selectedStrategy: shippingStrategy;
      let label: string;

      switch (choice) {
        case "ground":
          selectedStrategy = groundShipping;
          label = "Ground";
          break;
        case "express":
          selectedStrategy = expressShipping;
          label = "Express";
          break;
        case "overnight":
          selectedStrategy = overnightShipping;
          label = "Overnight";
          break;
        default:
          console.log("\nPlease enter Ground, Express, or Overnight.\n");
          askForMethod(packageWeight);
          return;
      }

      const calculator = new shippingCalculator(selectedStrategy);
      console.log(`\nYou have selected ${label} shipping. \n`);
      console.log(
        `The cost of ${label} shipping for your package is: $${calculator
          .getShippingCost(packageWeight)
          .toFixed(2)} \n`
      );

      // Ask if user wants to try another strategy
      askToCompareShipping(packageWeight, calculator);
    }
  );
}

function askToCompareShipping(
  packageWeight: number,
  calculator: shippingCalculator
): void {
  rl.question(
    "Question: Would you like to switch your shipping method? (yes/no): ",
    (answer: string) => {
      const choice = answer.trim().toLowerCase();

      if (choice === "yes") {
        rl.question(
          "\n Which method would you like to switch to? (Ground, Express, or Overnight): ",
          (answer: string) => {
            const newChoice = answer.trim().toLowerCase();
            let newStrategy: shippingStrategy;
            let newLabel: string;

            switch (newChoice) {
              case "ground":
                newStrategy = groundShipping;
                newLabel = "Ground";
                break;
              case "express":
                newStrategy = expressShipping;
                newLabel = "Express";
                break;
              case "overnight":
                newStrategy = overnightShipping;
                newLabel = "Overnight";
                break;
              default:
                console.log("\nPlease enter Ground, Express, or Overnight.\n");
                askToCompareShipping(packageWeight, calculator);
                return;
            }

            // Use setStrategy to switch the shipping methods
            calculator.setStrategy(newStrategy);
            console.log(`\nYou have selected ${newLabel} shipping. \n`);
            console.log(
              `The cost of ${newLabel} shipping for your package is: $${calculator
                .getShippingCost(packageWeight)
                .toFixed(2)} \n`
            );

            askToCompareShipping(packageWeight, calculator);
          }
        );
      } else if (choice === "no") {
        console.log(
          "\n Thank you, your package will be shipped soon. Have a good day! \n"
        );
        rl.close();
      } else {
        console.log("\n Please enter either yes or no. \n");
        askToCompareShipping(packageWeight, calculator);
      }
    }
  );
}

askForWeight();
