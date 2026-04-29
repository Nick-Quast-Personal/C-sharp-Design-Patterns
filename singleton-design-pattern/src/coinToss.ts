// This shows the two sides of the coin.
export type CoinSide = "heads" | "tails";

export function flipCoin(): CoinSide {
  return Math.random() < 0.5 ? "heads" : "tails";
}

// Check the users input and return "heads" or "tails", or null if invalid.
export function parseCoinChoice(raw: string): CoinSide | null {
  const s = raw.trim().toLowerCase();
  if (s === "heads") return "heads";
  if (s === "tails") return "tails";
  return null;
}

// Return the result of the coin toss.
export function coinResultPhrase(landed: CoinSide): string {
  return landed === "heads" ? "Heads it is" : "Tails it is";
}

// Check if AFC Richmond team won the coin toss by comparing the users choice and the result of the coin toss.
export function richmondWonCoinToss(richmondPick: CoinSide, landed: CoinSide): boolean {
  return richmondPick === landed;
}
