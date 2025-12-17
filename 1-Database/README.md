# Databases – System Design Notes

## 1. What is a Database?
A database is a system that:
- Stores data persistently
- Allows reading and writing data efficiently
- Enforces rules like consistency, isolation, durability
- Supports concurrent access by multiple users/processes

At core:
> **Database = Data + Query Engine + Storage Engine + Concurrency Control**

---

## 2. Types of Databases

### 2.1 Relational Databases (SQL)
Data is stored in **tables (rows × columns)** with a fixed schema.

Examples:
- MySQL
- PostgreSQL
- Oracle
- SQL Server

Key ideas:
- Schema first
- Relations via foreign keys
- Strong consistency
- SQL for querying

---

### 2.2 Non-Relational Databases (NoSQL)
Data is stored in **flexible formats**, schema optional.

Types:
- Key–Value (Redis)
- Document (MongoDB)
- Wide-Column (Cassandra)
- Graph (Neo4j)

Key ideas:
- Schema flexible or schema-less
- Optimized for scale
- Often eventual consistency
- Different query models

---

## 3. Relational vs Non-Relational

| Aspect | Relational | Non-Relational |
|------|-----------|---------------|
| Schema | Fixed | Flexible |
| Consistency | Strong (ACID) | Often eventual |
| Transactions | Yes | Limited / partial |
| Scaling | Vertical (mainly) | Horizontal (native) |
| Joins | Supported | Usually avoided |
| Use case | Financial, banking | Large-scale, fast apps |

---

## 4. When to Use Which

### Use Relational DB when:
- Data relationships matter
- Transactions are critical
- Strong consistency is required
- Complex queries and joins needed

Examples:
- Banking systems
- Order management
- Inventory systems

---

### Use Non-Relational DB when:
- Data structure changes frequently
- Massive read/write scale
- Low latency is more important than strict consistency
- Simple access patterns

Examples:
- Caching (Redis)
- Social feeds
- Logs, metrics
- Real-time analytics

---

## 5. ACID Properties

ACID ensures **correctness of transactions**.

### A – Atomicity
- Transaction is all or nothing
- Partial updates are rolled back

Example:
Money transfer:
- Debit A
- Credit B  
If credit fails → debit must rollback

---

### C – Consistency
- Database moves from one valid state to another
- Constraints, rules, triggers are respected

---

### I – Isolation
- Concurrent transactions should not interfere

Handled using **isolation levels** (below).

---

### D – Durability
- Once committed, data survives crashes
- Ensured via WAL, logs, disk flush

---

## 6. Isolation Levels (Important)

Isolation defines **how visible one transaction is to others**.

### 6.1 Read Uncommitted
- Can read uncommitted data
- Dirty reads possible
- Fast but unsafe

---

### 6.2 Read Committed
- Only committed data is visible
- Dirty reads prevented
- Non-repeatable reads possible

(Default in many DBs)

---

### 6.3 Repeatable Read
- Same row read twice gives same result
- Prevents dirty + non-repeatable reads
- Phantom reads possible

(MySQL default)

---

### 6.4 Serializable
- Transactions run as if sequential
- No dirty, non-repeatable, or phantom reads
- Slowest but safest

---

## 7. What is Scaling?
Scaling = **handling more load (users, data, queries)**.

Load can increase due to:
- More users
- More data
- More queries per second

---

## 8. Vertical Scaling (Scale Up)

### What it means:
- Increase power of a single machine

Examples:
- More RAM
- Faster CPU
- Bigger disk

### Pros:
- Simple
- No app changes

### Cons:
- Hardware limit
- Expensive
- Single point of failure

Used mostly by **relational DBs**.

---

## 9. Horizontal Scaling (Scale Out)

### What it means:
- Add more machines
- Distribute data across them

Examples:
- Multiple DB nodes
- Load balanced reads/writes

### Pros:
- Practically unlimited scale
- Fault tolerant

### Cons:
- Complex
- Data consistency harder

Used mostly by **NoSQL DBs**.

---

## 10. Partitioning

### What it is:
- Splitting a table into smaller logical parts
- Still on the same database/server

Types:
- Range partitioning
- Hash partitioning
- List partitioning

Example:
Users table partitioned by year of signup.

Purpose:
- Faster queries
- Easier maintenance

---

## 11. Sharding

### What it is:
- Horizontal partitioning **across multiple machines**
- Each shard has a subset of data

Example:
- Users A–M → Shard 1
- Users N–Z → Shard 2

Key points:
- Each shard is independent
- App must know where data lives
- Cross-shard joins are hard

---

## 12. Replication

### What it is:
- Copying data to multiple nodes

Types:
- Master–Slave
- Leader–Follower
- Multi-Leader

Why needed:
- High availability
- Read scaling
- Fault tolerance

---

## 13. CAP Theorem (System Design Core)

A distributed system can guarantee only **two of three**:

- **C**onsistency
- **A**vailability
- **P**artition tolerance

Examples:
- RDBMS: CP
- MongoDB: CP / AP (configurable)
- Cassandra: AP
- Redis: CP (single leader)

---

## 14. Picking the Right Database

Ask these questions:
1. Do I need transactions?
2. Do relationships matter?
3. How much data growth?
4. Read heavy or write heavy?
5. Latency critical or consistency critical?

### Common Pattern:
- PostgreSQL/MySQL → source of truth
- Redis → cache
- Elasticsearch → search
- Cassandra → large writes

---

## 15. Polyglot Persistence
Using **multiple databases** for different needs.

Example:
- PostgreSQL → orders
- Redis → sessions
- MongoDB → user profiles
- Kafka → event stream

Modern systems almost always do this.

---

## 16. Summary (One-Look)

- SQL → correctness, structure, transactions
- NoSQL → scale, speed, flexibility
- Vertical scaling → bigger machine
- Horizontal scaling → more machines
- Partitioning → inside one DB
- Sharding → across DBs
- ACID → correctness
- CAP → distributed tradeoffs

---

**End of Notes**
