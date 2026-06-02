# Template Method Design Pattern

**Template Method** means one method owns the **fixed order** of steps in an algorithm. Shared steps live on a **base class**; the steps that differ are **overridden** in subclasses.

In this demo, **`PaymentWorkflow.runPayment()`** is the template method. Every bank runs the same four steps in the same order. **Steps 1 and 4** stay on the base class. **Steps 2 and 3** are overridden in each bank subclass.

**Not real payments.** Teaching mock only.

## Read this repo in order (good for juniors)

1. **[src/grocery-cart.ts](src/grocery-cart.ts)** — cart items and receipt-style printing **before** payment. **Not** Template Method; just setup.
2. **[src/index.ts](src/index.ts)** — start at **`PaymentWorkflow`**:
   - **`runPayment()`** — template method (do not reorder these steps)
   - **`addProcessingFee()`**, **`printReceipt()`** — shared on the base class (steps 1 and 4)
   - **`collectPaymentDetails()`**, **`charge()`** — abstract hooks; each bank subclass implements both (steps 2 and 3)
3. **`WellsFargoPaymentFlow` / `ChasePaymentFlow` / `BankOfAmericaPaymentFlow`** — each overrides **step 2** (collect card) and **step 3** (charge)
4. Bottom of **`index.ts`** — terminal prompts and **`main()`** (demo wiring, not the pattern)

## Flow (ASCII)

```text
PaymentWorkflow.runPayment()     ← template method
  ├─ Step 1: addProcessingFee()     shared (base class)
  ├─ Step 2: collectPaymentDetails() overridden per bank
  ├─ Step 3: charge()               overridden per bank (mock payment API)
  └─ Step 4: printReceipt()         shared (base class)
```

## What each bank does differently (steps 2 and 3)

| Bank | Step 2 (collect) | Step 3 (charge) |
|------|------------------|-----------------|
| Wells Fargo | Last 4 digits + 4-digit PIN | Mock Wells Fargo Payment API → `WF-...` |
| Chase | Last 4 digits + street address | Mock Chase Payment API → `CHG-...` |
| Bank of America | Last 4 digits + billing zip | Mock Bank of America Payment API → `BOFA-...` |

## Vocabulary

| Term | In this demo |
|------|----------------|
| Template method | `runPayment()` |
| Abstract class | `PaymentWorkflow` |
| Concrete classes | `WellsFargoPaymentFlow`, `ChasePaymentFlow`, `BankOfAmericaPaymentFlow` |
| Overridden steps | `collectPaymentDetails()` (step 2) and `charge()` (step 3) |
| Shared steps | `addProcessingFee()` (step 1) and `printReceipt()` (step 4) |

## Run

```bash
cd template-method-design-pattern
npm install
npm run dev
```

Pick **1**, **2**, or **3** for Wells Fargo / Chase Bank / Bank of America. Every bank asks for the **last 4 card digits**, then a second question:

- **Wells Fargo (1):** 4-digit PIN
- **Chase (2):** street you live on (any text)
- **Bank of America (3):** 5-digit billing zip

Then watch steps 1–4 run.

Cart **subtotal $10.00** + **$0.50** processing fee → **$10.50** total.

## Try this exercise (compare two banks)

Run the demo **twice** — once with **Wells Fargo (1)**, then again with **Chase (2)**:

- **Steps 1 and 4** should look the same (same fee math, same receipt layout).
- **Steps 2 and 3** should change (different questions, different confirmation IDs).

That side-by-side comparison is the Template Method in action: same pipeline, different hooks.

**Piped stdin (automation):**

```bash
# Wells Fargo (last 4 + PIN)
npm run build && printf '1\n4242\n1234\n' | node dist/index.js

# Chase (last 4 + street)
npm run build && printf '2\n4242\nMain Street\n' | node dist/index.js

# Bank of America (last 4 + zip)
npm run build && printf '3\n4242\n90210\n' | node dist/index.js
```
