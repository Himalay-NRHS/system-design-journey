# LLD Series · Module 01 — Introduction to Low Level Design
> *definition · lld vs hld · stakeholders · importance*

---

## Phase 1 — Foundations

---

## 01 · What is Low Level Design?

> LLD is the process of **translating a system's high-level architecture** into detailed, implementable blueprints — specifying **classes, interfaces, methods, relationships,** and **design patterns** that developers directly code from.

**Core Idea:** LLD answers *"How exactly will each component be built?"* — it is the bridge between architecture (what to build) and actual code (how it runs).

- Defines **classes, attributes, methods** and their visibility
- Specifies **interactions** between objects (who calls whom)
- Applies **design patterns** to solve recurring problems
- Enforces **SOLID principles** for clean, maintainable code
- Produces artefacts like **UML class diagrams** & sequence diagrams
- Scope: **module/component level**, not the whole system

> 💡 **Interview tip:** LLD = "object-level blueprint." Think class diagrams, design patterns, and method signatures — not servers or databases.

---

## 02 · LLD vs HLD

| Dimension | High Level Design (HLD) | Low Level Design (LLD) |
|---|---|---|
| **Focus** | System architecture & topology | Class & object design |
| **Granularity** | Services, databases, APIs | Classes, methods, interfaces |
| **Key Question** | What components exist? How do they communicate? | How is each module structured internally? |
| **Audience** | Architects, product, business stakeholders | Developers, senior engineers |
| **Artefacts** | Architecture diagrams, data flow, API contracts | UML class diagrams, sequence diagrams |
| **Patterns** | Microservices, CQRS, event-driven | Factory, Strategy, Observer, etc. |
| **When** | Early stage / planning phase | Implementation / sprint planning |

**Key distinction:**
- **HLD** = *"What boxes exist and how they're wired."*
- **LLD** = *"What's inside each box and how its parts interact."*

**Are they sequential?**
- Yes — **HLD comes first** (system boundaries, tech stack, data stores), then LLD zooms into individual modules.
- In interviews, LLD is asked more frequently as it directly tests coding design skills.

---

## 03 · Stakeholders in LLD

> **What is a Stakeholder?** Anyone who **influences, uses, reviews, or is impacted by** the LLD. Each has different concerns — a good design balances them all.

| Stakeholder | Primary Concern | Role in LLD |
|---|---|---|
| **Developer** | Readability · Implementability | Implements the design; needs clear, unambiguous class structures |
| **Software Architect** | Consistency · Scalability | Ensures LLD aligns with HLD and overall system constraints |
| **QA / Tester** | Testability · Edge cases | Reviews for unit isolation — can each component be tested independently? |
| **Tech Lead** | Maintainability · Standards | Reviews code quality, team conventions, and design hygiene |
| **Product Manager** | Feature coverage | Validates design covers all functional requirements (indirect influence) |
| **Security Engineer** | Access control · Safety | Flags access control issues, data exposure, and security anti-patterns |
| **DevOps / Infra** | Deployability · Config | Checks deployment feasibility, config injection, resource usage |
| **Interviewer** | Clarity · Justification | Evaluates design thinking, OOP mastery, and trade-off reasoning |

> 💡 **Interview tip:** Don't just list stakeholder names — map each to their **primary concern**. It signals design maturity.

---

## 04 · Why is LLD Important?

**1. Blueprint Before Code**
- Prevents costly rework
- Design flaws caught at LLD stage are **10–100× cheaper** to fix than post-implementation bugs

**2. Enforces Clean Code Principles**
- Promotes **SOLID, DRY, KISS**
- Forces thinking about Single Responsibility *before* code is written, not after

**3. Enables Team Collaboration**
- Provides a **shared contract** between developers
- Multiple engineers can work in parallel using the same class interfaces

**4. Scalability & Extensibility**
- Good LLD makes it easy to **add new features without breaking existing ones**
- Open/Closed Principle in practice

**5. Enables Testability**
- Well-designed classes with **clear interfaces and injected dependencies** are easy to unit test and mock

**6. Reusability via Design Patterns**
- LLD is where **design patterns** (Factory, Strategy, Observer…) are applied
- Encodes proven solutions directly into the structure

**7. Interview Signal**
- In SDE2+ interviews, LLD is the **primary filter** for design thinking, OOP mastery, and ability to handle trade-offs under constraints

> 💡 **One-liner to remember:** *"LLD is the difference between code that works and code that lasts."*

---

## Quick Revision Summary

- **LLD** = detailed object/class-level design blueprint before coding
- **HLD** = system-wide architecture · **LLD** = module-level internals
- **HLD → LLD** is sequential — zoom in from system to class
- Key stakeholders: Developer, Architect, QA, Tech Lead, PM, Security, DevOps
- LLD importance: reduces rework · enables parallel dev · enforces SOLID · ensures testability
- Artefacts: UML class diagrams · sequence diagrams · interface contracts
