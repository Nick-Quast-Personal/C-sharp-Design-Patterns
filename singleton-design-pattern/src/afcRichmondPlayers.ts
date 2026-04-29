/** AFC Richmond outfield players for random home-goal shoutouts in the demo. */
export const AFC_RICHMOND_PLAYERS: readonly string[] = [
  "Jamie Tartt (#9)",
  "Sam Obisanya (#24)",
  "Dani Rojas (#14)",
  "Isaac McAdoo (#5)",
  "Roy Kent (#6)",
  "Colin Hughes (#12)",
  "Jan Maas (#13)",
  "Van Damme (#81)",
  "Moe Bumbercatch (#21)",
  "Richard Montlaur (#8)",
  "Zava (#10)",
];

export function getRandomRichmondPlayer(): string {
  const i = Math.floor(Math.random() * AFC_RICHMOND_PLAYERS.length);
  return AFC_RICHMOND_PLAYERS[i]!;
}
