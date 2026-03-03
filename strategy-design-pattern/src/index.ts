// ----------------------------------- Strategy Code Example! -----------------------------------

import * as readline from "readline";

interface ShippingStrategy {
    calculateShippingCost(packageWeight: number): number;
}

// Shipping options (These are the different strategies)
const groundShipping: ShippingStrategy = {
    calculateShippingCost: (packageWeight) => packageWeight * 1.5,
};

const expressShipping: ShippingStrategy = {
    calculateShippingCost: (packageWeight) => packageWeight * 3.0 + 5.0,
};

const overnightShipping: ShippingStrategy = {
    calculateShippingCost: (packageWeight) => packageWeight * 5.0 + 10.0,
};


class ShippingCalculator {
    private strategy: ShippingStrategy;

    constructor(strategy: ShippingStrategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy: ShippingStrategy): void {
        this.strategy = strategy;
    }

    getShippingCost(packageWeight: number): number {
        return this.strategy.calculateShippingCost(packageWeight);
    }
}

// --- DEMO Example! Go to the terminal and run "npm run dev" to get started! ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log("=== Strategy Design Pattern: Shipping Cost Calculator ===\n");

function askForWeight(): void {
    rl.question("How many pounds is your package? ", (answer: string) => {
        const packageWeight = parseFloat(answer);

        if (isNaN(packageWeight) || packageWeight <= 0) {
            console.log("\n Please enter a valid weight greater than 0.\n");
            askForWeight();
            return;
        }

        console.log(`\nPackage weight: ${packageWeight} lbs\n`);

        const calculator = new ShippingCalculator(groundShipping);
        console.log(`Ground Shipping (${packageWeight} lbs x $1.50/lb):__________________$${calculator.getShippingCost(packageWeight).toFixed(2)}`);

        calculator.setStrategy(expressShipping);
        console.log(`Express Shipping (${packageWeight} lbs x $3.00/lb + $5.00):_________$${calculator.getShippingCost(packageWeight).toFixed(2)}`);

        calculator.setStrategy(overnightShipping);
        console.log(`Overnight Shipping (${packageWeight} lbs x $5.00/lb + $10.00):______$${calculator.getShippingCost(packageWeight).toFixed(2)} \n\n`);

        rl.close();
    });
}

askForWeight();
