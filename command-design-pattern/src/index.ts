// ----- Command Design Pattern Demo -----

// Receiver (this is the chef that does the actual work)
class Chef {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    cookBurger(): void {
        console.log(`Chef ${this.name} is cooking the burger.`);
        console.log(`-----`);
    }

    makeSalad(): void {
        console.log(`Chef ${this.name} is making the salad.`);
        console.log(`-----`);
    }
}

// Command interface (this is the ticket the waiter writes down the order on)
interface ICommand {
    execute(): void;
}

// Concrete Command (this is where the chef grabs the ticket and cooks the burger/order)
class OrderBurgerCommand implements ICommand {
    private readonly chef: Chef;

    constructor(targetChef: Chef) {
        this.chef = targetChef;
    }

    execute(): void {
        this.chef.cookBurger();
    }
}

class OrderSaladCommand implements ICommand {
    private readonly chef: Chef;

    constructor(targetChef: Chef) {
        this.chef = targetChef;
    }

    execute(): void {
        this.chef.makeSalad();
    }
}

// Invoker (the waiter, he takes the ticket to the chef)
class Waiter {
    private command: ICommand | undefined;
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    setOrder(command: ICommand): void {
        this.command = command;
    }

    executeOrder(): void {
        console.log(`Waiter ${this.name} is sending the order to the kitchen.`)
        this.command?.execute();
    }
}


// Input from the customer to the waiter
// (all of this is where the customer places the order with the waiter)

// ---- Staff Members(Waiters and Chefs) ----
const waiterSteve = new Waiter("Steve");
const waiterMike = new Waiter("Mike");
const chefJake = new Chef("Jake");
const chefBilly = new Chef("Billy");


// ---- Customer/Client 1 ----
const order1 = new OrderBurgerCommand(chefJake);

waiterSteve.setOrder(order1);
waiterSteve.executeOrder();


// ---- Customer/Client 2 ----
const order2 = new OrderSaladCommand(chefBilly);

waiterSteve.setOrder(order2);
waiterSteve.executeOrder();


// ---- Customer/Client 3 ----
const order3 = new OrderBurgerCommand(chefJake);

waiterSteve.setOrder(order3);
waiterSteve.executeOrder();


// ---- Customer/Client 4 ----
const order4 = new OrderSaladCommand(chefBilly);

waiterMike.setOrder(order4);
waiterMike.executeOrder();

