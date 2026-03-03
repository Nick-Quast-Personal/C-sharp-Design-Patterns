# Strategy Design Pattern

The **Strategy** pattern is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.

## Key Idea

Instead of implementing a single algorithm directly, code receives run-time instructions on which algorithm from a family of algorithms to use. This allows the algorithm to vary independently from the clients that use it.

## When to Use

- You have multiple ways of performing the same action and want to swap between them at runtime.
- You want to avoid complex conditional logic (`if`/`else` or `switch`) for selecting behaviors.
- You need to isolate the implementation details of an algorithm from the code that uses it.

## Classic Example

A payment system that supports multiple payment methods (credit card, PayPal, crypto). Each method is a separate strategy, and the checkout process doesn't need to know the details -- it just calls `Pay()` on whichever strategy is active.

## Project Status

Coming soon.
