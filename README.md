# C# Design Patterns

This repository contains hands-on demonstrations of common design patterns. Most demos are interactive **TypeScript** programs you run in the terminal; some folders also include **C# reference implementations** that show how the same ideas appear in production code.

Design patterns are reusable solutions to common software design problems. They provide proven, tested development paradigms that can help speed up the development process and improve code quality.

## Patterns Included

| Pattern | Folder | Demo scenario |
|---------|--------|---------------|
| **Observer** | [observer-design-pattern](./observer-design-pattern/) | Trucking company broadcasts driver status to subscribers (JavaScript and TypeScript) |
| **Strategy** | [strategy-design-pattern](./strategy-design-pattern/) | Shipping cost calculator swaps pricing algorithms at runtime |
| **Factory Method** | [factory-method-design-pattern](./factory-method-design-pattern/) | New York vs Chicago pizza stores (thin crust vs deep dish) |
| **Singleton** | [singleton-design-pattern](./singleton-design-pattern/) | Shared game scoreboard for radio and TV broadcasts |
| **Decorator** | [decorator-design-pattern](./decorator-design-pattern/) | Optional game-day package add-ons (VIP, parking, merch) |
| **Adapter** | [adapter-design-pattern](./adapter-design-pattern/) | Weather App adapts legacy Celsius third-party API to Fahrenheit |
| **Template Method** | [template-method-design-pattern](./template-method-design-pattern/) | Walmart self-checkout payment flow with bank-specific steps |
| **Circuit Breaker** | [circuit-breaker-pattern](./circuit-breaker-pattern/) | Walmart+ grocery refund when the refund API is down |
| **Pipeline** | [pipeline-design-pattern](./pipeline-design-pattern/) | 2026 World Cup stadium entry (scan → verify → VIP check → grant entry) |

Each folder has its own README with pattern details, when to use it, and demo hints.

## How to Run

Each folder is self-contained with its own `package.json` and dependencies.

### TypeScript demos (most patterns)

```bash
cd <pattern-folder>
npm install
npm run dev
```

This applies to: `strategy-design-pattern`, `factory-method-design-pattern`, `singleton-design-pattern`, `decorator-design-pattern`, `adapter-design-pattern`, `template-method-design-pattern`, `circuit-breaker-pattern`, and `pipeline-design-pattern`.

### Observer (JavaScript / TypeScript at folder root)

```bash
cd observer-design-pattern
node index.js        # JavaScript version
# or
npx ts-node index.ts # TypeScript version (requires ts-node)
```

## Project Structure

```
csharp-design-patterns/
├── observer-design-pattern/
│   ├── index.js
│   ├── index.ts
│   └── package.json
├── strategy-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── factory-method-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── singleton-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── decorator-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── adapter-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── template-method-design-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── circuit-breaker-pattern/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── pipeline-design-pattern/
│   ├── src/
│   │   ├── index.ts
│   │   └── Pipeline Examples/   # C# reference implementations
│   ├── package.json
│   └── tsconfig.json
├── package.json
└── README.md
```

## Contributing

Feel free to add new design patterns or improve existing implementations!

## Resources

- [dofactory — C# Design Patterns](https://www.dofactory.com/net/design-patterns) — primary reference for this repo (GoF patterns with structural, real-world, and .NET-optimized C# examples)
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns) (Gang of Four book)
- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Martin Fowler — Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
