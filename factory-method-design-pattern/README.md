# Factory Method Design Pattern

The **Factory Method** pattern is a creational design pattern that provides an interface for creating objects in a superclass, but lets subclasses alter the type of objects that will be created.

## Key Idea

Define a method (the factory method) that subclasses override to instantiate the right **product** type. Clients call operations on the abstract **creator** (for example `orderPizza`) that rely on that factory method, so creation stays in one place per variant.

## When to Use

- A class cannot anticipate the class of objects it must create.
- You want subclasses to specify which objects to create.
- You want to localize knowledge of which helper class is instantiated.

## Example: New York vs Chicago Pizza Store

- **`PizzaStore`** is the abstract creator. **`orderPizza(type)`** calls **`createPizza(type)`** (the factory method), then runs **`prepare`**, **`bake`**, **`cut`**, and **`box`** on the `Pizza`.
- **`NewYorkPizzaStore`** and **`ChicagoPizzaStore`** override **`createPizza`** with **different menus**: New York offers **cheese** and **pepperoni**; Chicago offers **cheese** and **sausage**. The same `type` string can map to **different concrete `Pizza` classes** depending on which store you use (e.g. pepperoni only exists at the New York store in this demo).

| Store | Factory | Menu (examples) |
| --- | --- | --- |
| New York | `NewYorkPizzaStore` | `NewYorkCheesePizza`, `NewYorkPepperoniPizza` |
| Chicago | `ChicagoPizzaStore` | `ChicagoCheesePizza`, `ChicagoSausagePizza` |

The demo prompts you for a store (NY or Chicago), then a pizza type from that store’s menu, then shows the full order pipeline.

## How to Run

```bash
cd factory-method-design-pattern
npm install
npm run dev
```

### Example Output

```
===== Factory Method Design Pattern: Coach Beard's Pizza Store! =====

Stores:
  - New York Pizza Store______________ thin crust, cut into traditional triangle slices.
  - Chicago Pizza Store_______________ deep dish, cut into square slices.

Menus (each store offers different types of pizzas):
  - New York: cheese, pepperoni
  - Chicago:  cheese, sausage

Question: Would you like to order a pizza? (yes/no): yes

Question: Which store would you like to order from? (NY or Chicago): ny

   Ordering from the New York Pizza Store.

Question: What pizza would you like? (cheese or pepperoni): pepperoni

 Your Pizza is being prepared...

 --- Watch your progress ---

...Preparing New York Pepperoni Pizza (thin crust, pepperoni)
......Baking New York Pepperoni Pizza
.........Cutting into traditional triangle slices
............Placing New York Pepperoni Pizza in official Coach Beard's PizzaStore box.

 --- Order Up! ---

 --- Your order is ready! ---

 Enjoy your pizza!

Question: Would you like to order another pizza? (yes/no): no

Thank you for visiting Coach Beard's Pizza Store! See you again soon!
```
