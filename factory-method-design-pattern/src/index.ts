// ----------------------------------- Factory Method Code Example! -----------------------------------

// Setup code / behind the scenes -------------
import * as readline from "readline"; // This just lets us read input from the terminal.


// --- Products (Pizza hierarchy) ---
// Every pizza should have this. This is like a rule book.
class Pizza {
  constructor(readonly name: string) {}

  prepare(): void {
    console.log(`Preparing ${this.name}`);
  }

  bake(): void {
    console.log(`......Baking ${this.name} \n`);
  }

  cut(): void {
    console.log(".........Cutting the pizza into slices \n");
  }

  box(): void {
    console.log(`............Placing ${this.name} in official Coach Beard's PizzaStore box. \n`);
  }
}

// These are the types of pizzas that can be ordered. ------------------------------------------------
// Each pizza type extends the Pizza class and overrides the prepare and cut methods.
// ---- New York Pizza Types ----
class NewYorkCheesePizza extends Pizza {
  constructor() {
    super("New York Cheese Pizza");
  }

  prepare(): void {
    console.log("...Preparing New York Cheese Pizza (thin crust) \n");
  }

  cut(): void {
    console.log(
      ".........Cutting into traditional triangle slices \n"
    );
  }
}

class NewYorkPepperoniPizza extends Pizza {
  constructor() {
    super("New York Pepperoni Pizza");
  }

  prepare(): void {
    console.log(
      "...Preparing New York Pepperoni Pizza (thin crust, pepperoni) \n"
    );
  }

  cut(): void {
    console.log(
      ".........Cutting into traditional triangle slices \n"
    );
  }
}

// ---- Chicago Pizza Types ----
class ChicagoCheesePizza extends Pizza {
  constructor() {
    super("Chicago Cheese Pizza");
  }

  prepare(): void {
    console.log("...Preparing Chicago Cheese Pizza (deep dish) \n");
  }

  cut(): void {
    console.log(".........Cutting into square slices \n");
  }
}



class ChicagoSausagePizza extends Pizza {
  constructor() {
    super("Chicago Sausage Pizza");
  }

  prepare(): void {
    console.log("...Preparing Chicago Sausage Pizza (deep dish) \n");
  }

  cut(): void {
    console.log(".........Cutting into square slices \n");
  }
}
//-----------------------------------------------------------------------------------------------------


// --- Creator (Factory Method lives here) ---
// This is the same flow regardless of the store.
// Think of this as the blueprint for any pizza store.
abstract class PizzaStore {
  orderPizza(type: string): Pizza {
    const pizza = this.createPizza(type);
    pizza.prepare();
    pizza.bake();
    pizza.cut();
    pizza.box();

    return pizza;
  }

  protected abstract createPizza(type: string): Pizza; 
}

// Concrete franchise: each store implements createPizza with its own menu.
class NewYorkPizzaStore extends PizzaStore {
  protected createPizza(type: string): Pizza {
    const normalized = type.trim().toLowerCase();
    if (normalized === "cheese") {
      return new NewYorkCheesePizza();
    }
    if (normalized === "pepperoni") {
      return new NewYorkPepperoniPizza();
    }
    throw new Error(`Unknown pizza type: ${type}`);
  }
}

class ChicagoPizzaStore extends PizzaStore {
  protected createPizza(type: string): Pizza {
    const normalized = type.trim().toLowerCase();
    if (normalized === "cheese") {
      return new ChicagoCheesePizza();
    }
    if (normalized === "sausage") {
      return new ChicagoSausagePizza();
    }
    throw new Error(`Unknown pizza type: ${type}`);
  }
}


// --- DEMO! In the terminal, run "npm run dev" to start! ----------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("===== Factory Method Design Pattern: Coach Beard's Pizza Store! ===== \n");
console.log("Stores:");
console.log("  - New York Pizza Store______________ thin crust, cut into traditional triangle slices.");
console.log("  - Chicago Pizza Store_______________ deep dish, cut into square slices.\n");
console.log("Menus (each store offers different types of pizzas):");
console.log("  - New York: cheese, pepperoni");
console.log("  - Chicago:  cheese, sausage \n");


// Ask the user if they want to order a pizza.
function askWantToOrder(): void {
  rl.question(
    "Question: Would you like to order a pizza? (yes/no): ",
    (answer: string) => {
      const y = answer.trim().toLowerCase();
      if (y === "yes" || y === "y") {
        console.log("");
        askStore();
      } else if (y === "no" || y === "n") {
        console.log(
          "\nThank you for visiting Coach Beard's Pizza Store! See you again soon!\n\n"
        );
        rl.close();
      } else {
        console.log("\nPlease enter yes or no.\n");
        askWantToOrder();
      }
    }
  );
}

// Ask the user which store they want to order from.
function askStore(): void {
  rl.question(
    "Question: Which store would you like to order from? (NY or Chicago): ",
    (answer: string) => {
      const choice = answer.trim().toLowerCase();
      let store: PizzaStore | undefined;
      let label: string;

      if (choice === "ny" || choice === "new york") {
        store = new NewYorkPizzaStore();
        label = "New York";
      } else if (choice === "chicago") {
        store = new ChicagoPizzaStore();
        label = "Chicago";
      } else {
        console.log("\n Please enter NY or Chicago. \n");
        askStore();

        return;
      }

      console.log(`\n   Ordering from the ${label} Pizza Store.\n`);
      askPizzaType(store);
    }
  );
}

// Ask the user what pizza they want to order.
function askPizzaType(store: PizzaStore): void {
  const prompt =
    store instanceof NewYorkPizzaStore
      ? "Question: What pizza would you like? (cheese or pepperoni): "
      : "Question: What pizza would you like? (cheese or sausage): ";

  rl.question(prompt, (answer: string) => {
    const type = answer.trim().toLowerCase();

    const validNewYork = type === "cheese" || type === "pepperoni";
    const validChicago = type === "cheese" || type === "sausage";
    const choiceMatchesStoreMenu =
      store instanceof NewYorkPizzaStore ? validNewYork : validChicago;

    if (!choiceMatchesStoreMenu) {
      const hint =
        store instanceof NewYorkPizzaStore
          ? "cheese or pepperoni"
          : "cheese or sausage";
      console.log(`\n Please order ${hint} from this store.\n`);
      askPizzaType(store);
      return;
    }

    console.log("\n\n Your Pizza is being prepared... \n");
    console.log("\n --- Watch your progress ---\n");
    try {
      store.orderPizza(type);
      console.log("\n --- Order Up! --- \n");
      console.log("\n --- Your order is ready! --- \n");
      console.log("\n Enjoy your pizza! \n\n");
    } catch (e) {
      console.error(String(e));
    }

    askOrderAnother();
  });
}

function askOrderAnother(): void {
  rl.question(
    "Question: Would you like to order another pizza? (yes/no): ",
    (again: string) => {
      const y = again.trim().toLowerCase();
      if (y === "yes" || y === "y") {
        console.log("");
        askStore();
      } else if (y === "no" || y === "n") {
        console.log(
          "\nThank you for visiting Coach Beard's Pizza Store! See you again soon!\n\n"
        );
        rl.close();
      } else {
        console.log("\nPlease enter yes or no.\n");
        askOrderAnother();
      }
    }
  );
}

askWantToOrder();
