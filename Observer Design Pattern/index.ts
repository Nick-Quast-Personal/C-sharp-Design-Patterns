// ============================================
// OBSERVER DESIGN PATTERN - Trucking Example
// TypeScript Implementation
// ============================================

import * as readline from "readline";

// Observer Interface
// This defines what all observers must implement.
interface IDriverObserver {
  Update(driver: Driver): void;
}

// Subject (Driver)
// This is the object that everyone wants to watch.
// It notifies all registered observers when its state changes.
class Driver {
  name: string;
  status: string;
  listOfObservers: IDriverObserver[];

  constructor(name: string) {
    this.name = name;
    this.status = "Available"; // Initial/ default status
    this.listOfObservers = []; // List of observers watching this driver
  }

  // Add: Register an observer to watch this driver
  Add(observer: IDriverObserver): void {
    this.listOfObservers.push(observer);
  }

  // Remove: Unregister an observer
  Remove(observer: IDriverObserver): void {
    const index = this.listOfObservers.indexOf(observer);
    if (index > -1) {
      this.listOfObservers.splice(index, 1);
    }
  }

  // ChangeStatus: Update driver status and notify all observers
  ChangeStatus(newStatus: string): void {
    this.status = newStatus;
    this.Notify(); // Alert all observers to the change
  }

  // Notify: Send update to all observers
  // This is the key part - when something changes, EVERYONE watching gets notified
  Notify(): void {
    console.log(`UPDATE: Status has been changed.`);
    console.log(`Notify Observers:`);

    for (const observer of this.listOfObservers) {
      observer.Update(this);
    }
  }
}

// Concrete Observer 1: DriverManager
// This observer reacts to driver status changes by logging a message.
class DriverManager implements IDriverObserver {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  Update(driver: Driver): void {
    console.log(
      `📋 Driver Manager ${this.name}: {${driver.name}} is now {${driver.status}}`
    );
  }
}

// Concrete Observer 2: DispatchTeam
// This observer also reacts to driver status changes with its own message.
class DispatchTeam implements IDriverObserver {
  Update(driver: Driver): void {
    console.log(
      `📡 Dispatch notified: {${driver.name}} status changed to {${driver.status}}`
    );
  }
}

// ============================================
// DEMO: Using the Observer Pattern
// ============================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  "\n================ Observer Pattern Demo: Trucking Company ================\n"
);

// Step 1: Create a driver (the Subject)
const driver = new Driver("Ted Lasso");
console.log(`- Created driver: ${driver.name}\n`);

// Step 2: Create observers
const manager = new DriverManager("Rebecca");
const manager2 = new DriverManager("Higgins");
const dispatch = new DispatchTeam();
console.log("- Created observers: DriverManager and DispatchTeam \n");

// Step 3: Register observers with the driver
// Now when the driver's status changes, these two will be notified
driver.Add(manager);
driver.Add(manager2);
driver.Add(dispatch);
console.log("- Observers added to driver \n");

// Available statuses
const statuses: string[] = ["Available", "En Route", "Stopped", "Delivered"];

// Function to ask user for input
function askForStatusChange(): void {
  console.log(`------ Current driver status: ${driver.status} ------ \n`);
  rl.question(
    "Question: Has the driver status changed? (yes/no): ",
    (answer: string) => {
      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        // Show available statuses (exclude current status)
        const availableStatuses = statuses.filter((s) => s !== driver.status);
        const statusList: string =
          availableStatuses.length === 1
            ? availableStatuses[0]
            : availableStatuses.slice(0, -1).join(", ") +
              ", or " +
              availableStatuses[availableStatuses.length - 1];
        console.log(`\nQuestion: What is the new status? (${statusList})`);

        rl.question("Enter new status: ", (newStatus: string) => {
          // Validate the input
          if (availableStatuses.includes(newStatus)) {
            console.log("");
            driver.ChangeStatus(newStatus);
            console.log("");
            askForStatusChange(); // Ask again
          } else {
            console.log("Invalid status. Please try again.\n");
            askForStatusChange(); // Ask again
          }
        });
      } else if (
        answer.toLowerCase() === "no" ||
        answer.toLowerCase() === "n"
      ) {
        console.log(
          "\nThank you for confirming this driver's status. Goodbye. \n"
        );
        rl.close();
      } else {
        console.log("Please answer yes or no.\n");
        askForStatusChange(); // Ask again
      }
    }
  );
}

// Start the interactive demo
askForStatusChange();
