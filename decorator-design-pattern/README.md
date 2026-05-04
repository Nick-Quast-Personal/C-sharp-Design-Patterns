# Decorator Design Pattern

The **Decorator** pattern is a structural pattern that lets you attach **new behavior or responsibilities** to an object **at runtime** by wrapping it in decorator objects that share the same interface as the core object. You can stack decorators to combine behaviors without subclassing every combination.

## Key Idea

Define a common interface (`GameDayPackage` here). A **concrete component** implements it for the base case. Each **decorator** holds a reference to another `GameDayPackage`, forwards calls where needed, and adds its own contribution (extra line on the receipt, extra price). Wrapping `base` with `A` then `B` behaves like “base + A + B” without a class like `BaseWithAAndB`.

## When to Use

- Add responsibilities dynamically and optionally (addons, middleware, streams, UI borders).
- Prefer composition over a combinatorial explosion of subclasses (`GA`, `GA_VIP`, `GA_Parking`, `GA_VIP_Parking`, …).
- Wrappers should be transparent: callers still use the single interface.

## Example: Nelson Road Game-Day Package

- **`GameDayPackage`** — `lineItems()` returns receipt lines (base ticket plus each add-on) with amounts in USD; the demo prints them as a Nelson Road receipt and totals them.
- **`GeneralAdmission`** — the concrete component (base game entry).
- **`VipLoungeDecorator`**, **`ParkingPassDecorator`**, **`BelieveTshirtDecorator`** — each wraps another `GameDayPackage` and adds one line + price bump.
- The demo prompts **y/n** for each add-on in order; the final object may be `tshirt(parking(vip(ga)))` — same interface, stacked behavior.

## How to Run

```bash
cd decorator-design-pattern
npm install
npm run dev
```

Answer **y** or **n** for each optional extra; the program prints a receipt-style listing and total in USD, then asks to complete purchase. If you confirm, you’ll see the thank-you / welcome message.
