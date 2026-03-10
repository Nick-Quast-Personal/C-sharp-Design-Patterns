# Strategy Design Pattern

The **Strategy** pattern is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

## Key Idea

Instead of implementing a single algorithm directly, code receives run-time instructions on which algorithm from a family of algorithms to use. This allows the algorithm to vary independently from the clients that use it.

## When to Use

- You have multiple ways of performing the same action and want to swap between them at runtime.
- You want to avoid complex conditional logic (`if`/`else` or `switch`) for selecting behaviors.
- You need to isolate the implementation details of an algorithm from the code that uses it.

## Example: Shipping Cost Calculator

A `ShippingCalculator` context class delegates cost calculation to a `ShippingStrategy`. Three concrete strategies are provided:

| Strategy | Rate | Handling Fee |
|---|---|---|
| `groundShipping` | $1.50/lb | -- |
| `expressShipping` | $3.00/lb | $5.00 |
| `overnightShipping` | $5.00/lb | $10.00 |

The demo prompts you for a package weight, lets you select an initial strategy, then allows you to switch and compare other strategies at runtime using `setStrategy()`.

## How to Run

```bash
cd strategy-design-pattern
npm install
npm run dev
```

### Example Output (15 lbs)

```
=== Strategy Design Pattern: Shipping Cost Calculator ===

Shipping Options:
  - Ground Shipping___________________ Package Weight x $1.50/lb
  - Express Shipping__________________ Package Weight x $3.00/lb + $5.00 handling fee
  - Overnight Shipping________________ Package Weight x $5.00/lb + $10.00 handling fee 

Question: How many pounds is your package? 15

 Package weight: 15 lbs 

Question: Which shipping method would you like to use? (Ground, Express, or Overnight): ground

You have selected Ground shipping. 

The cost of Ground shipping for your package is: $22.50 

Question: Would you like to switch your shipping method? (yes/no): yes

 Which method would you like to switch to? (Ground, Express, or Overnight): overnight

You have selected Overnight shipping. 

The cost of Overnight shipping for your package is: $85.00 

Question: Would you like to switch your shipping method? (yes/no): no

 Thank you, your package will be shipped soon. Have a good day! 
```
