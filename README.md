# C# Design Patterns

This repository contains implementations of various Design Patterns in TypeScript/JavaScript.

Design patterns are reusable solutions to common software design problems. They provide proven, tested development paradigms that can help speed up the development process and improve code quality.

## Patterns Included

- **[observer-design-pattern](./observer-design-pattern/)** - Demonstrates the Observer pattern with a trucking company example. Includes both JavaScript and TypeScript implementations.
- **[strategy-design-pattern](./strategy-design-pattern/)** - Demonstrates the Strategy pattern with a shipping cost calculator example in TypeScript.
- **Factory Design Pattern** (coming soon)

## How to Run

Each folder is self-contained with its own files and dependencies.

### Observer Design Pattern

```bash
cd observer-design-pattern
node index.js        # Run the JavaScript version
# or
npx ts-node index.ts # Run the TypeScript version (requires ts-node)
```

### Strategy Design Pattern

```bash
cd strategy-design-pattern
npm install
npm start
```

## Project Structure

```
C-sharp-Design-Patterns/
├── observer-design-pattern/
│   ├── index.js
│   ├── index.ts
│   └── package.json
├── strategy-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── README.md
└── (more patterns to come)
```

## Contributing

Feel free to add new design patterns or improve existing implementations!

## Resources

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns) (Gang of Four book)
- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
