
# LLD Interview Prep — SOLID Principles
> Interface · Contract · Composition · S · O · L · I · D  
> Revision-Friendly · Complete Examples · Code Walkthroughs

---

## Quick Reference

| Principle | One-Line Definition |
|-----------|-------------------|
| **S** — Single Responsibility | A class should have only one reason to change |
| **O** — Open/Closed | Open for extension, closed for modification |
| **L** — Liskov Substitution | Subtypes must be substitutable for their base types |
| **I** — Interface Segregation | No client should be forced to depend on methods it doesn't use |
| **D** — Dependency Inversion | Depend on abstractions, not on concretions |

---

# Prerequisites: Interface, Contract & Composition

---

## 1. Interface

**What is it?** A contract that defines what a class must do, without dictating how it does it.

- **Pure abstraction:** Only method signatures, no implementation
- **Multiple implementation:** Many classes can implement the same interface
- **Decouples:** Caller doesn't care about implementation details
- **Polymorphism:** Same interface → different behaviors at runtime

```java
// Interface - defines WHAT, not HOW
interface Drawable {
    void draw();
    void resize(int factor);
}

// Different classes implement the same interface
class Circle implements Drawable {
    void draw() { /* draw circle */ }
    void resize(int factor) { ... }
}

class Square implements Drawable {
    void draw() { /* draw square */ }
    void resize(int factor) { ... }
}
```

---

## 2. Contract (Design by Contract)

**What is it?** An agreement between a class and its callers about what will be provided and expected.

| Contract Type | Meaning |
|--------------|---------|
| **Preconditions** | What must be true BEFORE calling a method (caller's obligation) |
| **Postconditions** | What will be true AFTER the method runs (class's guarantee) |
| **Invariants** | What is always true about an object's state (class's promise) |

### Why are Contracts Used?

- **Clear boundaries:** Defines exact responsibilities between caller and callee
- **Safe substitution:** Any implementer must honor the contract (key for LSP)
- **Reliable design:** Other classes can depend on the contract without knowing impl
- **Testability:** Pre/postconditions translate directly to unit test assertions

```java
interface BankAccount {
    /**
     * Precondition:  amount > 0 && amount <= balance
     * Postcondition: balance decreases by amount
     * Invariant:     balance >= 0 always
     */
    void withdraw(double amount);
}
```

---

## 3. Composition vs Inheritance

- **Composition:** "Has-a" relationship — a class contains instances of other classes to gain their behavior.
- **Inheritance:** "Is-a" relationship — a class extends another to reuse or override behavior.

### Favor Composition Over Inheritance — Why?

- Inheritance creates tight coupling — changes in parent break child classes
- Composition is flexible — you can swap behaviors at runtime
- Inheritance violates encapsulation — child sees parent internals
- Composition supports Single Responsibility — each class does one thing
- **Rule of thumb: If you're not sure, use composition**

```java
// ❌ Inheritance approach — tight coupling
class Bird { void fly() {...} }
class Penguin extends Bird { /* Penguin can't fly! */ }

// ✅ Composition approach — flexible
interface FlyBehavior { void fly(); }
class CanFly   implements FlyBehavior { void fly() { /* flap wings */ } }
class CannotFly implements FlyBehavior { void fly() { /* do nothing */ } }

class Bird {
    FlyBehavior flyBehavior;  // composed in
    void fly() { flyBehavior.fly(); }
}
class Penguin extends Bird { Penguin() { flyBehavior = new CannotFly(); } }
class Eagle   extends Bird { Eagle()   { flyBehavior = new CanFly(); } }
```

---

---

# S — Single Responsibility Principle
> *A class should have only one reason to change*

---

## Definition

> *"A class should have only one reason to change." — Robert C. Martin*

**In simpler words:** Each class should own exactly one piece of functionality. If you can name two unrelated jobs your class does — it violates SRP.

---

## Why Do We Need It?

- **Change isolation:** A change in one responsibility doesn't accidentally break another
- **Easier testing:** Smaller classes with one job are far easier to unit test
- **Readability:** Class name tells you exactly what it does
- **Reusability:** Focused classes can be reused in other contexts
- **Team parallel work:** Different team members can work on different classes without conflicts

---

## When to Apply It?

- When a class is doing both business logic AND persistence/logging/formatting
- When a change in UI formatting forces you to touch business logic code
- When your class has more than one team of people interested in changing it
- **Rule of thumb:** If you need to use "and" to describe what a class does → SRP violation

---

## Benefits

| Benefit | Explanation |
|---------|------------|
| Maintainability | Easier to find and fix bugs — each class has a clear scope |
| Testability | One responsibility = smaller test surface area |
| Reduced coupling | Fewer dependencies between unrelated concerns |
| Cleaner modules | Natural boundaries between layers (service, repo, formatter) |

---

## Bad vs Good Example — Employee Class

```java
// ❌ BAD — Employee class has 3 responsibilities
class Employee {
    String name; double salary;

    // Responsibility 1: Business logic
    double calculatePay() { ... }

    // Responsibility 2: Persistence
    void saveToDatabase() { ... }

    // Responsibility 3: Reporting / Formatting
    String generateReport() { ... }
}
```

```java
// ✅ GOOD — Each class has exactly one job
class Employee {                    // Domain entity
    String name; double salary;
    double calculatePay() { ... }   // Only business logic
}

class EmployeeRepository {          // Only persistence
    void save(Employee e) { ... }
    Employee findById(int id) { ... }
}

class EmployeeReportFormatter {     // Only formatting
    String generate(Employee e) { ... }
}
```

---

---

# O — Open/Closed Principle
> *Open for extension, closed for modification*

---

## Definition

> *"Software entities should be open for extension but closed for modification." — Bertrand Meyer*

**In simpler words:** You should be able to add new behavior to your system without editing existing, working code.

---

## Why Do We Need It?

- **Stability:** Modifying existing code risks breaking already-tested functionality
- **Scalability:** Adding new features = adding new classes, not editing old ones
- **Regression-safe:** Existing unit tests remain valid when you only extend
- **Team safety:** Other devs don't need to worry about side effects from your additions

---

## When to Apply It?

- When you keep modifying a method every time a new type/feature is added
- When you see long if-else or switch-case blocks checking object type
- When adding a discount type, payment method, or notification channel requires touching core logic

---

## ⚠️ Common Misconceptions

> ❌ **Misconception 1: "You can never modify existing code"**  
> ✅ Truth: OCP applies to stable, production code. Bug fixes and initial design are fine to change.

> ❌ **Misconception 2: "OCP means use inheritance only"**  
> ✅ Truth: Composition + interfaces are often better than inheritance for OCP.

> ❌ **Misconception 3: "Every class must follow OCP from day one"**  
> ✅ Truth: Apply OCP when a class changes frequently. Over-abstracting early = over-engineering.

> ✅ **Key Insight:** "Closed for modification" means closed to the EXISTING behavior being broken.

---

## Bad vs Good Example — Discount Calculator

```java
// ❌ BAD — Adding a new discount type requires modifying this method
class DiscountCalculator {
    double calculate(String type, double price) {
        if (type.equals("STUDENT"))   return price * 0.8;
        if (type.equals("SENIOR"))    return price * 0.7;
        // Every new discount type → must edit this class ❌
        return price;
    }
}
```

```java
// ✅ GOOD — Add new discounts by adding new classes, never modifying old
interface DiscountStrategy {
    double apply(double price);
}

class StudentDiscount implements DiscountStrategy {
    double apply(double price) { return price * 0.8; }
}
class SeniorDiscount implements DiscountStrategy {
    double apply(double price) { return price * 0.7; }
}
// New: SeasonalDiscount → add a new class, ZERO changes to existing classes ✅
class SeasonalDiscount implements DiscountStrategy {
    double apply(double price) { return price * 0.9; }
}

class PriceCalculator {     // Closed for modification ✅
    double finalPrice(double price, DiscountStrategy discount) {
        return discount.apply(price);
    }
}
```

---

---

# L — Liskov Substitution Principle
> *Subtypes must be substitutable for their base types*

---

## Definition

> *"If S is a subtype of T, then objects of type T may be replaced by objects of type S without altering any of the desirable properties of the program." — Barbara Liskov*

**In simpler words:** A child class must be able to replace its parent class everywhere without breaking anything. It must honor the contract of the parent.

---

## Why Do We Need It?

- **Safe polymorphism:** You can confidently substitute subclasses without unexpected failures
- **Contract enforcement:** Subtypes must uphold the behavioral promises of their base type
- **Predictability:** Code that works with a parent type works with any subtype
- **Inheritance correctness:** LSP tells you when inheritance is being misused

---

## Key Principles / Rules of LSP

| Rule | Meaning |
|------|---------|
| **Precondition rule** | Subtype cannot STRENGTHEN preconditions (accept less than parent) |
| **Postcondition rule** | Subtype cannot WEAKEN postconditions (guarantee less than parent) |
| **Invariant rule** | Invariants of the base class must be preserved by subtype |
| **Exception rule** | Subtype cannot throw new/unexpected exceptions not in parent |
| **History rule** | Subtype should not allow state changes that parent does not permit |

---

## When to Apply It?

- When you override a method and the behavior changes drastically from parent
- When a subclass throws `UnsupportedOperationException` for an inherited method
- When client code needs to use `instanceof` checks to handle subtypes differently
- **Classic red flag:** `Penguin extends Bird`, but `fly()` throws an exception

---

## Classic Violation — Rectangle / Square Problem

```java
// ❌ VIOLATION — Square breaks Rectangle's contract
class Rectangle {
    int width, height;
    void setWidth(int w)  { this.width  = w; }
    void setHeight(int h) { this.height = h; }
    int  area() { return width * height; }
}

class Square extends Rectangle {  // ← Problem!
    void setWidth(int w)  { width = height = w; }  // Changes height too!
    void setHeight(int h) { width = height = h; }  // Changes width too!
}

// Client code breaks when Square replaces Rectangle
void testRectangle(Rectangle r) {
    r.setWidth(5); r.setHeight(4);
    assert r.area() == 20; // ❌ FAILS for Square (returns 16)
}
```

```java
// ✅ FIX — Use abstraction instead of wrong inheritance
interface Shape { int area(); }

class Rectangle implements Shape {
    int width, height;
    Rectangle(int w, int h) { width = w; height = h; }
    public int area() { return width * height; }
}

class Square implements Shape {   // Independent class ✅
    int side;
    Square(int s) { side = s; }
    public int area() { return side * side; }
}
```

---

---

# I — Interface Segregation Principle
> *No client should be forced to depend on methods it doesn't use*

---

## Definition

> *"Clients should not be forced to depend on interfaces they do not use." — Robert C. Martin*

**In simpler words:** Instead of one fat interface, create smaller role-specific interfaces. A class implements only what it actually needs.

---

## Why Do We Need It?

- **Avoids forced coupling:** Classes don't carry dead weight methods they never use
- **Decoupled changes:** A change to a method only affects clients that actually use it
- **Cleaner implementations:** No more "throw UnsupportedOperationException" stubs
- **Role clarity:** Each interface represents a distinct capability or role

---

## When to Apply It?

- When a class implements an interface but leaves many methods empty or throws exceptions
- When a fat interface grows over time and not all implementers need all methods
- When you notice changes to one method force recompilation of unrelated classes

---

## Bad vs Good Example — Worker Interface

```java
// ❌ BAD — Fat interface forces Robot to implement eat() and sleep()
interface Worker {
    void work();
    void eat();   // Robot doesn't eat!
    void sleep(); // Robot doesn't sleep!
}

class Robot implements Worker {
    void work()  { /* real logic */ }
    void eat()   { throw new UnsupportedOperationException(); } // ❌
    void sleep() { throw new UnsupportedOperationException(); } // ❌
}
```

```java
// ✅ GOOD — Segregated interfaces, each class implements only what it needs
interface Workable  { void work(); }
interface Feedable  { void eat();  }
interface Sleepable { void sleep(); }

class Robot implements Workable {  // Only what it needs ✅
    void work() { /* robot logic */ }
}

class Human implements Workable, Feedable, Sleepable {
    void work()  { ... }
    void eat()   { ... }
    void sleep() { ... }
}
```

---

---

# D — Dependency Inversion Principle
> *Depend on abstractions, not on concretions*

---

## Definition

> *"High-level modules should not depend on low-level modules. Both should depend on abstractions." — Robert C. Martin*

**Two Rules:**
- **Rule 1:** High-level modules (business logic) must not depend on low-level modules (DB, network, etc.)
- **Rule 2:** Abstractions (interfaces) should not depend on details; details should depend on abstractions

---

## Why Do We Need It?

- **Decoupling:** Business logic does not care HOW data is stored, only WHAT the store can do
- **Testability:** Inject mock implementations in tests without changing production code
- **Flexibility:** Switch from MySQL to MongoDB by swapping one implementation class
- **Extensibility:** Add new data sources without touching core logic

---

## When to Apply It?

- When business logic directly instantiates a database, file system, or external API class
- When you cannot write unit tests because the class creates its own dependencies
- When switching a storage layer requires editing core business code

---

## Key Concept: Dependency Injection

**Dependency Injection (DI)** is the primary mechanism for achieving DIP.

| DI Type | Description |
|---------|-------------|
| **Constructor Injection** | Dependency passed via constructor *(most common, preferred)* |
| **Setter Injection** | Dependency passed via setter method |
| **Interface Injection** | Dependency provided via an interface method |
| **DI Containers** | Frameworks (Spring, Guice) wire dependencies automatically |

> **Rule:** The HIGH-LEVEL class declares what it needs (interface). Caller decides which implementation to inject.

---

## Bad vs Good Example — Order Service

```java
// ❌ BAD — OrderService tightly coupled to MySQLOrderRepository
class MySQLOrderRepository {  // Low-level
    void save(Order o) { /* MySQL logic */ }
}

class OrderService {  // High-level — has a problem!
    private MySQLOrderRepository repo = new MySQLOrderRepository(); // ❌ hard dependency
    void placeOrder(Order o) { repo.save(o); }
}
// Problem: Can't switch to MongoDB. Can't mock in tests.
```

```java
// ✅ GOOD — Both depend on abstraction (interface)
interface OrderRepository {          // Abstraction
    void save(Order order);
}

class MySQLOrderRepository implements OrderRepository {  // Low-level detail
    void save(Order o) { /* MySQL logic */ }
}
class MongoOrderRepository implements OrderRepository {  // Easy to swap ✅
    void save(Order o) { /* Mongo logic */ }
}

class OrderService {  // High-level — clean ✅
    private final OrderRepository repo;  // depends on abstraction
    OrderService(OrderRepository repo) { this.repo = repo; }  // Constructor injection
    void placeOrder(Order o) { repo.save(o); }
}

// Usage — inject whichever impl you want
OrderService svc = new OrderService(new MySQLOrderRepository());
OrderService svc = new OrderService(new MongoOrderRepository()); // ← no change to OrderService
```

---

---

# How the 5 Principles Work Together

| Principle Link | How They Reinforce Each Other |
|---------------|-------------------------------|
| **SRP → OCP** | SRP gives each class one job → easier to extend without touching others (OCP) |
| **OCP → LSP** | OCP uses polymorphism → LSP ensures subtypes used in extensions are safe |
| **LSP → ISP** | LSP requires subtypes to honor contracts → ISP keeps contracts focused and small |
| **ISP → DIP** | ISP creates small, role-specific interfaces → DIP depends on those abstractions |
| **DIP → SRP** | DIP injects abstractions → high-level classes stay focused on one job (SRP) |

---

## Interview Quick Summary

| | |
|-|--|
| **S** | One class, one reason to change. Split responsibilities ruthlessly. |
| **O** | New features → new classes, not edits to old ones. Use Strategy/Template patterns. |
| **L** | Subclasses must honor their parent's contract. No surprise exceptions or broken behavior. |
| **I** | Break fat interfaces into small role interfaces. Classes implement only what they need. |
| **D** | High-level code depends on interfaces, not concrete classes. Inject dependencies. |
