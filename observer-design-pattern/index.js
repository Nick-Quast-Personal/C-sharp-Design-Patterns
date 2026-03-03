// ============================================
// OBSERVER DESIGN PATTERN - Trucking Example
// JavaScript Implementation
// ============================================

// Observer Interface
// This defines what all observers must implement.
class IDriverObserver {
  Update(driver) {
    throw new Error("Update method must be implemented");
  }
}

// Subject (Driver)
// This is the object that everyone wants to watch.
// It notifies all registered observers when its state changes.
class Driver {
  constructor(name) {
    this.name = name;
    this.status = "Available"; // Initial/ default status
    this.listOfObservers = []; // List of observers watching this driver
  }

  // Add: Register an observer to watch this driver
  Add(observer) {
    this.listOfObservers.push(observer);
  }

  // Remove: Unregister an observer
  Remove(observer) {
    const index = this.listOfObservers.indexOf(observer);
    if (index > -1) {
      this.listOfObservers.splice(index, 1);
    }
  }

  // ChangeStatus: Update driver status and notify all observers
  ChangeStatus(newStatus) {
    this.status = newStatus;
    this.Notify(); // Alert all observers to the change
  }

  // Notify: Send update to all observers
  // This is the key part - when something changes, EVERYONE watching gets notified
  Notify() {
    console.log(`UPDATE: Status has been changed.`);
    console.log(`Notify Observers:`);

    for (const observer of this.listOfObservers) {
      observer.Update(this);
    }
  }
}

// Concrete Observer 1: DriverManager
// This observer reacts to driver status changes by logging a message.
class DriverManager extends IDriverObserver {
  constructor(name) {
    super();
    this.name = name;
  }

  Update(driver) {
    console.log(
      `📋 Driver Manager ${this.name}: {${driver.name}} is now {${driver.status}}`
    );
  }
}

// Concrete Observer 2: DispatchTeam
// This observer also reacts to driver status changes with its own message.
class DispatchTeam extends IDriverObserver {
  Update(driver) {
    console.log(
      `📡 Dispatch notified: {${driver.name}} status changed to {${driver.status}}`
    );
  }
}

// ============================================
// DEMO: Using the Observer Pattern
// ============================================

const readline = require("readline");

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
const statuses = ["Available", "En Route", "Stopped", "Delivered"];

// Function to ask user for input
function askForStatusChange() {
  console.log(`------ Current driver status: ${driver.status} ------ \n`);
  rl.question(
    "Question: Has the driver status changed? (yes/no): ",
    (answer) => {
      if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
        // Show available statuses (exclude current status)
        const availableStatuses = statuses.filter((s) => s !== driver.status);
        const statusList =
          availableStatuses.length === 1
            ? availableStatuses[0]
            : availableStatuses.slice(0, -1).join(", ") +
              ", or " +
              availableStatuses[availableStatuses.length - 1];
        console.log(`\nQuestion: What is the new status? (${statusList})`);

        rl.question("Enter new status: ", (newStatus) => {
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
