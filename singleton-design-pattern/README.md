# Singleton Design Pattern

The **Singleton** pattern is a creational design pattern that ensures a class has **at most one instance** and provides a global point of access to it.

## Key Idea

Hide the constructor (or otherwise prevent `new`) and expose a `getInstance()` (or similar) that creates the object the first time and returns the same object afterward. Everyone who needs the scoreboard asks for **the** instance, so state stays consistent.

## When to Use

- Exactly one shared object must coordinate state across the app (with caution: prefer dependency injection when testing and flexibility matter more).
- Controlled lazy initialization: create the instance only when first needed.

## Example: Game Scoreboard (`src/index.ts`)

- **`GameScoreboard`** is the **Singleton**: `getInstance()` returns the only instance; **`goalHome`** / **`goalAway`** update shared tallies; **`getCurrentScore()`** returns the score **string** for displays.
- On startup the demo prints **`getInstance() === getInstance()`** → `true`, then the **control panel** loop.
- Before each menu, the **Nelson Road** ASCII board reads that same instance.
- Option **3** prints radio + TV lines from **`GameScoreboard.getInstance().getCurrentScore()`**.
- **4** resets; **5** full time + goodbye.

## How to Run

```bash
cd singleton-design-pattern
npm install
npm run dev
```

### Menu

```
  1  Goal for Home (AFC Richmond)
  2  Goal for Away (West Ham United)
  3  Show current radio and TV score
  4  Reset game
  5  End the game & quit
```
