# Singleton Design Pattern

The **Singleton** pattern is a creational design pattern that ensures a class has **at most one instance** and provides a global point of access to it.

## Key Idea

Hide the constructor (or otherwise prevent `new`) and expose a `getInstance()` (or similar) that creates the object the first time and returns the same object afterward. Everyone who needs the scoreboard asks for **the** instance, so state stays consistent.

## When to Use

- Exactly one shared object must coordinate state across the app (with caution: prefer dependency injection when testing and flexibility matter more).
- Controlled lazy initialization: create the instance only when first needed.

## Example: Game Scoreboard

- **`GameScoreboard`** is the singleton **source of truth** for the score. **`getInstance()`** returns the only instance; **`goalHome`** / **`goalAway`** update tallies (Home = AFC Richmond, Away = West Ham United in the demo copy).
- Before every **Control Panel**, the demo prints the **Nelson Road** stadium scoreboard from that same singleton.
- Option **3** prints **Radio** and **TV** lines using **`getCurrentScore()`** — two broadcasters, one object.
- Option **4** ends the match: **AFC Richmond** wins if Home goals are ahead, **West Ham United** if Away is ahead, otherwise a short draw message; then the program exits.
- On launch, choose **Start the Game** or **Cancel the game.** (cancel has the same goodbye as **Quit**).
- After **Start**, Richmond picks **heads** or **tails** (case-insensitive); **[`src/coinToss.ts`](src/coinToss.ts)** flips the coin and decides the toss winner, then **Let's start the game!** and the singleton intro before the control panel.
- Home goals pick a random Richmond player from **[`src/afcRichmondPlayers.ts`](src/afcRichmondPlayers.ts)** (`getRandomRichmondPlayer()`).

## How to Run

```bash
cd singleton-design-pattern
npm install
npm run dev
```

The scoreboard appears each turn; use **3** for radio/TV copy, **4** for full time when you want to wrap up.

### Example Output (excerpt)

```
  ┌─────────────────────────────┐
  │    N E L S O N  R O A D     │
  │        S T A D I U M        │
  │                             │
  │      Home 1 – 0 Away        │
  │                             │
  └─────────────────────────────┘

--- Control Panel ---
--- Select an option: ---
  1  Goal for Home
  2  Goal for Away
  3  Show current radio and TV score
  4  End the Game
  5  Reset game
  6  Quit
```

Option **3** then shows:

```
  Radio Broadcast Score: Home 1 – 0 Away
  TV Broadcast Score: Home 1 – 0 Away
```

Option **4** with Home ahead prints Richmond winning and promotion to the Premier League; with Away ahead, West Ham wins and a tough-loss line for the Greyhounds.
