// ----- Prototype Design Pattern Demo -----

// Prototype interface (every duplicate needs to have "clone")
interface IPrototype {
    clone(): IPrototype;
}

// Concrete Prototype Button (the original / master button)
class Button implements IPrototype {
    private label: string;
    private color: string;
    private width: number;
    private height: number;
    private borderRadius: number;

    // Sets the fields
    constructor(label: string, color: string, width: number, height: number, borderRadius: number) {
        this.label = label;
        this.color = color;
        this.width = width;
        this.height = height;
        this.borderRadius = borderRadius;
    }

    // Makes a copy of this button
    clone(): Button {
        return new Button(this.label, this.color, this.width, this.height, this.borderRadius);
    }

    setLabel(label: string): void {
        this.label = label;
    }

    setColor(color: string): void {
        this.color = color;
    }

    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    setBorderRadius(borderRadius: number): void {
        this.borderRadius = borderRadius;
    }

    // Prints the current button info
    show(): void {
        console.log(
            `"${this.label}" Button | color: ${this.color} | size: ${this.width}x${this.height} | ` +
            `borderRadius: ${this.borderRadius}`
        );
    }
}

// Demo
// ---- UX Designer goes to make the buttons ----
console.log(`UX Designer starts making the buttons...`);
console.log(`Start with the master button (the sign up button)`);

// Sign Up Button (Original / master button)
const masterButton = new Button("Sign Up", "blue", 200, 50, 4);
masterButton.show();
console.log(`---------------------------------------------------------------------------`);

// Login Button (duplicate)
const loginButton = masterButton.clone();
loginButton.setLabel("Log In");
loginButton.setBorderRadius(20);
loginButton.show();
console.log(`---------------------------------------------------------------------------`);

// Delete Button (duplicate)
const deleteButton = masterButton.clone();
deleteButton.setLabel("Delete");
deleteButton.setColor("red");
deleteButton.show();
console.log(`---------------------------------------------------------------------------`);

// Test Button (duplicate)
const testButton = masterButton.clone();
testButton.setLabel("Test");
testButton.setColor("orange");
testButton.setSize(100, 30);
testButton.setBorderRadius(8);
testButton.show();
console.log(`---------------------------------------------------------------------------`);

// Master button is still the same (the copies did not change it)
console.log(`Show the master (Sign Up) button again`);
masterButton.show();
console.log(`--------------------------------------------------------------------------- \n\n`);

// -----
console.log(`CHANGE MASTER BUTTON (What If?)`);
console.log(`---------------------------------------------------------------------------`);
// -----

masterButton.setColor("purple");
masterButton.show();
console.log(`---------------------------------------------------------------------------`);
// -----

const applePayButton = masterButton.clone();
applePayButton.setLabel("Apple Pay");
applePayButton.show();
console.log(`---------------------------------------------------------------------------`);


