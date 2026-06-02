// This file sets up the cart items and formats the receipt.


// Cart line (Same for all banks)
export interface CartLine {
  // Short name printed after qty, example= "1% Milk"
  itemName: string;
  qty: number;

  // Price per single item (line total = qty × itemPrice)
  itemPrice: number;
}

// Cart summary (Same for all banks)
export interface CartSummary {
  readonly lines: readonly CartLine[];
  readonly totalUsd: number;
}

// Fixed width for dashed “paper” alignment (characters after indent) (Same for all banks)
export const RECEIPT_BODY_WIDTH = 46;

// Leading spaces so lines line up under self-checkout transcript (Same for all banks)
export const RECEIPT_INDENT = "      ";

// Calculate the line amount (Same for all banks)
function lineAmount(line: CartLine): number {
  return Math.round(line.qty * line.itemPrice * 100) / 100;
}

// Format the line amount (Same for all banks)
export function lineAmountUsd(line: CartLine): number {
  return lineAmount(line);
}

// Format the quantity prefix (Same for all banks)
function qtyPrefix(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(2);
}

// Format the receipt item line (Same for all banks)
export function formatReceiptItemLine(line: CartLine): string {
  const price = `$${lineAmount(line).toFixed(2)}`;
  const left = `${qtyPrefix(line.qty)}x - ${line.itemName}`;
  const minFill = 5;
  const gapBudget = RECEIPT_BODY_WIDTH - left.length - price.length - 4; /* spacing around filler */
  const fills = Math.max(minFill, gapBudget > minFill ? gapBudget : minFill);
  return `${RECEIPT_INDENT}${left}  ${"_".repeat(fills)}  ${price}`;
}

// Print the receipt money row (Same for all banks)
export function formatReceiptMoneyRow(label: string, amountUsd: number): string {
  const price = `$${amountUsd.toFixed(2)}`;
  const gapBudget = RECEIPT_BODY_WIDTH - label.length - price.length - 4;
  const fills = Math.max(5, gapBudget > 5 ? gapBudget : 5);
  return `${RECEIPT_INDENT}${label}  ${"_".repeat(fills)}  ${price}`;
}

// Print the receipt text row (Same for all banks)
export function formatReceiptTextRow(left: string, right: string): string {
  const gapBudget = RECEIPT_BODY_WIDTH - left.length - right.length - 4;
  const fills = Math.max(3, gapBudget > 3 ? gapBudget : 3);
  return `${RECEIPT_INDENT}${left}  ${"_".repeat(fills)}  ${right}`;
}

// Print the receipt top (Same for all banks)
export function printReceiptTop(): void {
  console.log(`${RECEIPT_INDENT}${"═".repeat(46)}`);
  const title = "Walmart";
  const padTitle = Math.max(0, Math.floor((46 - title.length) / 2));
  console.log(`${RECEIPT_INDENT}${" ".repeat(padTitle)}${title}`);
  const subtitle = "Store #1234 — Self Checkout";
  const padSub = Math.max(0, Math.floor((46 - subtitle.length) / 2));
  console.log(`${RECEIPT_INDENT}${" ".repeat(padSub)}${subtitle}`);
  console.log(`${RECEIPT_INDENT}${"═".repeat(46)}`);
  console.log(
    `${RECEIPT_INDENT}${new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })}`
  );
  console.log(`${RECEIPT_INDENT}${"─".repeat(46)}\n`);
}

export function receiptDividerThin(): void {
  console.log(`${RECEIPT_INDENT}${"─".repeat(46)}`);
}

// This function helps center the text inside the receipt width (Same for all banks)
export function centeredReceiptLine(text: string): string {
  const pad = Math.max(0, Math.floor((46 - text.length) / 2));
  return `${RECEIPT_INDENT}${" ".repeat(pad)}${text}`;
}

// This creates a demo cart (Same for all banks)
export function createDemoCart(): CartSummary {
  const lines = [
    { itemName: "1% Milk", qty: 1, itemPrice: 3 },
    { itemName: "Sandwich Bread", qty: 2, itemPrice: 2 },
    { itemName: "Large Eggs", qty: 1, itemPrice: 3 },
  ] as const;
  const sum = Math.round(lines.reduce((a, line) => a + lineAmount(line), 0) * 100) / 100;
  return { lines, totalUsd: sum };
}

// This prints the cart summary (Same for all banks)
export function printCartSummary(cart: CartSummary): void {
  printReceiptTop();
  for (const line of cart.lines) {
    console.log(formatReceiptItemLine(line));
  }
  receiptDividerThin();
  console.log(formatReceiptMoneyRow("SUBTOTAL", cart.totalUsd));
  console.log("");
}
