// ----------------------------------- Singleton Code Example! -----------------------------------
// ----- Behind the scenes code / logic -----

// This allows us to read input from the terminal.
import * as readline from "readline";
import { getRandomRichmondPlayer } from "./afcRichmondPlayers";
import {
  coinResultPhrase,
  flipCoin,
  parseCoinChoice,
  richmondWonCoinToss,
} from "./coinToss";

// Set up readline to read terminal input.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// GameScoreboard (Singleton. (Only one instance of the class can be created.))
class GameScoreboard {
  private static instance: GameScoreboard | undefined;

  // The home and away teams are constants.
  readonly homeTeam = "Home";
  readonly awayTeam = "Away";

  private homeGoals = 0;
  private awayGoals = 0;

  // This means its a private constructor and you can't have multiple GameScoreboards.
  private constructor() {}

  // This is a method that returns the score of the game from the GameScoreboard.
  static getInstance(): GameScoreboard {
    if (!GameScoreboard.instance) {
      GameScoreboard.instance = new GameScoreboard();
    }
    return GameScoreboard.instance;
  }

  // Home Point
  goalHome(): void {
    this.homeGoals += 1;
  }

  // Away Point
  goalAway(): void {
    this.awayGoals += 1;
  }

  // Reset the game scoreboard
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

  // Get the current score of the game
  getCurrentScore(): string {
    return `${this.homeTeam} ${this.homeGoals} – ${this.awayGoals} ${this.awayTeam}`;
  }
}

// --- DEMO! In the terminal, run "npm run dev" to start! ---
console.log(
  "\n=============== Singleton Design Pattern: Game Scoreboard ===============\n"
);
askStartOrCancel();

function askStartOrCancel(): void {
  console.log("\n Welcome to the AFC Richmond vs. West Ham United game! \n");
  console.log("Would you like to...");
  console.log("1. Start the Game");
  console.log("2. Cancel the game.\n");
  rl.question("Enter 1 or 2: ", (answer: string) => {
    const choice = answer.trim();
    if (choice === "1") {
      askRichmondCoinChoice();
    } else if (choice === "2") {
      quitDemo();
    } else {
      console.log("\n  Please enter 1 or 2.\n");
      askStartOrCancel();
    }
  });
}

function askRichmondCoinChoice(): void {
  console.log("\n\n Would AFC Richmond like Heads or Tails? \n");
  rl.question("Enter heads or tails: ", (answer: string) => {
    const pick = parseCoinChoice(answer);
    if (!pick) {
      console.log("\n  Please enter heads or tails.\n");
      askRichmondCoinChoice();
      return;
    }

    const landed = flipCoin();
    console.log(`\n  ${coinResultPhrase(landed)}!\n`);

    if (richmondWonCoinToss(pick, landed)) {
      console.log("\n  AFC Richmond has won the coin toss!\n");
    } else {
      console.log("\n  West Ham United has won the coin toss.\n");
    }

    console.log("\n  Let's start the game!\n");
    console.log(
      "\n Note: There is only one GameScoreboard (source of truth). Radio and TV broadcasts both read it.\n"
    );
    runControlPanel();
  });
}

// Stadium scoreboard display (the physical board at Nelson Road — still fed by the same GameScoreboard singleton).
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

// Menu Options (stadium scoreboard is shown before every control panel — same GameScoreboard singleton).
function printMenu(): void {
  printNelsonRoadScoreboard();
  console.log("--- Control Panel ---");
  console.log("--- Select an option: ---");
  console.log("  1  Goal for Home");
  console.log("  2  Goal for Away");
  console.log("  3  Show current radio and TV score");
  console.log("  4  Reset game");
  console.log("  5  End the game & quit");
  console.log("");
}

// Control panel
// This is a function that runs the control panel and handles the user's input.
function runControlPanel(): void {
  printMenu();
  rl.question("Pick an option (1–5): ", (answer: string) => {
    const choice = answer.trim();

    switch (choice) {
      case "1": {
        GameScoreboard.getInstance().goalHome();
        const scorer = getRandomRichmondPlayer();
        console.log(
          "\n  ————————————————————————————————————————————————————————\n"
        );
        console.log("\n  Home Goal!");
        console.log("\n  AFC Richmond just scored!");
        console.log(`\n  What a beautiful kick from ${scorer}!\n`);
        console.log(
          "\n  ————————————————————————————————————————————————————————\n"
        );
        break;
      }

      case "2":
        GameScoreboard.getInstance().goalAway();
        console.log(
          "\n  ————————————————————————————————————————————————————————\n"
        );
        console.log("\n  Away Goal. West Ham United just scored. :( \n");
        console.log(
          "\n  ————————————————————————————————————————————————————————\n"
        );
        break;

      case "3": {
        const score = GameScoreboard.getInstance().getCurrentScore();

        console.log(
          "\n  ———————————————————————————————————————————————————————————————\n"
        );
        console.log(`\n  Radio Broadcast Score: ${score}`);
        console.log(`  TV Broadcast Score: ${score}\n`);
        console.log(
          "  (Note: Both Radio and TV broadcast use the same scoreboard.)\n"
        );
        console.log(
          "\n  ———————————————————————————————————————————————————————————————\n"
        );
        break;
      }

      case "4":
        GameScoreboard.getInstance().reset();
        console.log("\n  Game scoreboard reset.\n");
        break;

      case "5":
        endTheGame();
        return;

      default:
        console.log("\n\n  Please enter a number from 1 to 5.\n");
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
    "\n\n ------------------------------------------------------------------------------ \n"
  );
  console.log(
    "\n  Thank you for visiting Nelson Road Stadium and supporting AFC Richmond! \n"
  );
  console.log("\n  Have a great day! \n");
  console.log(
    "\n ------------------------------------------------------------------------------ \n\n\n"
  );
  rl.close();
}
