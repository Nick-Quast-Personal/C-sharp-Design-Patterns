# Observer Design Pattern

A hands-on demonstration of the **Observer** behavioral design pattern, modeled around a trucking/logistics scenario where driver status changes are broadcast to subscribed observers.

## The Pattern

The Observer pattern defines a one-to-many relationship between a **Subject** and its **Observers**. When the subject's state changes, all registered observers are automatically notified.

![Observer Pattern](Observer%20Images/Observer%20Pattern.png)

Observers **subscribe** to a subject. When the subject changes, it **notifies** every subscriber so each can react independently.

![Details](Observer%20Images/Details.png)

## Project Structure

| Class / Interface | Role | Description |
|---|---|---|
| `IDriverObserver` | Observer Interface | Defines the `Update(driver)` contract |
| `Driver` | Subject | Holds status and a list of observers; calls `Notify()` on status change |
| `DriverManager` | Concrete Observer | Logs the driver's new status from a manager's perspective |
| `DispatchTeam` | Concrete Observer | Logs the driver's new status from dispatch's perspective |

## How It Works

1. A `Driver` (subject) is created with an initial status.
2. `DriverManager` and `DispatchTeam` observers subscribe to the driver.
3. The program interactively prompts for status changes (`Available`, `En Route`, `Stopped`, `Delivered`).
4. On each change, `Driver.Notify()` iterates through all observers and calls their `Update()` method.

## Getting Started

```bash
npm install
npm run dev
```

### Example Output

```
Has the driver status changed? (yes/no): yes
Enter new status (Available, En Route, Stopped, Delivered): En Route

UPDATE: Status has been changed.
Notify Observers:
📋 Driver Manager Rebecca: {Ted Lasso} is now {En Route}
📋 Driver Manager Higgins: {Ted Lasso} is now {En Route}
📡 Dispatch notified: {Ted Lasso} status changed to {En Route}
```

## Tech Stack

- **JavaScript** (`index.js`) — runnable implementation
- **TypeScript** (`index.ts`) — typed reference implementation
- **Node.js** — runtime
