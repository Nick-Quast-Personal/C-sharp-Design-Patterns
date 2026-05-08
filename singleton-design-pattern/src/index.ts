// ----------------------------------- Singleton Code Example! -----------------------------------
// ----- Behind the scenes code / logic -----

// Read typed answers in the terminal.
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/** Singleton: one shared GameScoreboard; use getInstance() — not `new GameScoreboard()`. */
class GameScoreboard {
  private static instance: GameScoreboard | undefined;

  readonly homeTeam = "Home";
  readonly awayTeam = "Away";

  private homeGoals = 0;
  private awayGoals = 0;

  private constructor() {}

  /** Returns the single shared instance (created on first call). */
  static getInstance(): GameScoreboard {
    if (!GameScoreboard.instance) {
      GameScoreboard.instance = new GameScoreboard();
    }
    return GameScoreboard.instance;
  }

  goalHome(): void {
    this.homeGoals += 1;
  }

  goalAway(): void {
    this.awayGoals += 1;
  }

  reset(): void {
    this.homeGoals = 0;
    this.awayGoals = 0;
  }

  getHomeGoals(): number {
    return this.homeGoals;
  }

  getAwayGoals(): number {
    return this.awayGoals;
  }

  /** Display string built from the same object’s goal counts (not the Singleton itself — that’s GameScoreboard). */
  getCurrentScore(): string {
    return `${this.homeTeam} ${this.homeGoals} – ${this.awayGoals} ${this.awayTeam}`;
  }
}




// --- DEMO! In the terminal, run "npm run dev" to start! ---
console.log(
  "\n=============== Singleton Design Pattern: Game Scoreboard ===============\n"
);
console.log(
  " Singleton Pattern: Only one instance of the GameScoreboard class can be created.\n"
);

runControlPanel();

function printNelsonRoadScoreboard(): void {
  const board = GameScoreboard.getInstance();
  console.log("\n  ┌─────────────────────────────┐");
  console.log("  │    N E L S O N  R O A D     │");
  console.log("  │        S T A D I U M        │");
  console.log("  │                             │");
  console.log(`  │      ${board.getCurrentScore().padEnd(23)}│`);
  console.log("  │                             │");
  console.log("  └─────────────────────────────┘\n");
}

function printMenu(): void {
  printNelsonRoadScoreboard();
  console.log("--- Control Panel ---");
  console.log("--- Select an option: ---");
  console.log("  1  Goal for Home (AFC Richmond)");
  console.log("  2  Goal for Away (West Ham United)");
  console.log("  3  Show current radio and TV score");
  console.log("  4  Reset game");
  console.log("  5  End the game & quit");
  console.log("");
}

function runControlPanel(): void {
  printMenu();
  rl.question("Pick an option (1–5): ", (answer: string) => {
    const choice = answer.trim();

    switch (choice) {
      case "1":
        GameScoreboard.getInstance().goalHome();
        console.log(`\n\n  --------------------------------------------------------------`);
        console.log("\n  Home goal! AFC Richmond scores.\n");
        console.log(`\n  --------------------------------------------------------------`);
        break;

      case "2":
        GameScoreboard.getInstance().goalAway();
        console.log(`\n\n  --------------------------------------------------------------`);
        console.log("\n  Away goal — West Ham United.\n");
        console.log(`\n  --------------------------------------------------------------`);
        break;

      case "3": {
        const officialScoreText =
          GameScoreboard.getInstance().getCurrentScore();

        console.log(`\n\n  --------------------------------------------------------------`);
        console.log(`\n Radio Broadcast Score: ${officialScoreText}`);
        console.log(`\n TV Broadcast Score: ${officialScoreText}\n`);
        console.log(
          " (Both use GameScoreboard.getInstance().getCurrentScore() — one object.)\n"
        );
        console.log(`\n  --------------------------------------------------------------`);
        break;
      }

      case "4":
        GameScoreboard.getInstance().reset();
        console.log("\n  Scoreboard reset.\n");
        break;

      case "5":
        endTheGame();
        return;

      default:
        console.log("\n  Please enter a number from 1 to 5.\n");
    }

    runControlPanel();
  });
}

// End the game and display the result.
function endTheGame(): void {
  const board = GameScoreboard.getInstance();
  const home = board.getHomeGoals();
  const away = board.getAwayGoals();

  console.log(
    "\n  ———————————————————————————————————————————————————————————————\n"
  );
  console.log("\n  ——— Whistle! Whistle! ———\n");
  console.log("\n  ——— Game Over! ———\n");
  console.log(
    "\n  ———————————————————————————————————————————————————————————————\n"
  );

  if (home > away) {
    console.log("\n  Winner = AFC Richmond!");
    console.log(
      "\n  Congratulations Richmond! The greyhounds have done it! AFC Richmond is going to the Premier League!\n"
    );
  } else if (away > home) {
    console.log("\n  Winner = West Ham United");
    console.log(
      "\n  Tough loss for our grey hounds today. Join us next week for another exciting game!\n"
    );
  } else {
    console.log("\n  It's a draw — no winner today.");
    console.log(
      `\n  Final: ${board.getCurrentScore()}. Thanks for watching. See you next week at Nelson Road Stadium!\n`
    );
  }

  quitDemo();
}

function quitDemo(): void {
  console.log(
    "\n ------------------------------------------------------------------------------ \n"
  );
  console.log("\n  Thank you for visiting Nelson Road Stadium! \n");
  console.log("\n ------------------------------------------------------------------------------ \n\n\n");
  rl.close();
}
