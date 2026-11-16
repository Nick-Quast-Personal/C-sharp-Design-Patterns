// ----- Prototype Design Pattern Demo -----

// Nested object that belongs to a button
interface ButtonStyle {
    borderRadius: number;
    shadow: boolean;
}

// Prototype interface
interface IPrototype {
    clone(): IPrototype;
}

// Concrete Prototype Button (the original / master button)
class Button implements IPrototype {
    private label: string;
    private color: string;
    private width: number;
    private height: number;
    private style: ButtonStyle;

    constructor(label: string, color: string, width: number, height: number, style: ButtonStyle) {
        this.label = label;
        this.color = color;
        this.width = width;
        this.height = height;
        this.style = style;
    }

    // Deep copy: the style object is copied too, so copies don't share it
    clone(): Button {
        const styleCopy: ButtonStyle = { ...this.style };
        return new Button(this.label, this.color, this.width, this.height, styleCopy);
    }

    setLabel(label: string): void {
        this.label = label;
    }

    setColor(color: string): void {
        this.color = color;
    }

    setBorderRadius(radius: number): void {
        this.style.borderRadius = radius;
    }

    show(): void {
        console.log(
            `Button "${this.label}" | color: ${this.color} | size: ${this.width}x${this.height} | ` +
            `borderRadius: ${this.style.borderRadius} | shadow: ${this.style.shadow}`
        );
    }
}

// ---- UX Designer (makes the master design in Figma) ----

// Sign Up Button (This is the original / master button)
const masterButton = new Button("Sign Up", "blue", 200, 50, { borderRadius: 4, shadow: false });

console.log(`UX Designer made the master button:`);
masterButton.show();
console.log(`-----`);


//  Login Button (duplicate)
const loginButton = masterButton.clone();
loginButton.setLabel("Log In");
loginButton.setBorderRadius(20);
loginButton.show();
console.log(`-----`);


// Delete Button (duplicate)
const deleteButton = masterButton.clone();
deleteButton.setLabel("Delete");
deleteButton.setColor("red");
deleteButton.show();
console.log(`-----`);

// Master button is still the same (the copies did not change it)
masterButton.show();