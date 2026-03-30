# Database Fundamentals – System Design Notes

---

## 1. What is a Database
A database is a system that stores data persistently and allows multiple users or programs to read and write that data safely and efficiently.

A database internally manages:
- Storage on disk
- Query execution
- Transactions
- Concurrency control
- Crash recovery

---

## 2. Types of Databases

### 2.1 Relational Databases (SQL)
Relational databases store data in tables with rows and columns using a fixed schema.

Key characteristics:
- Predefined schema
- Relationships via foreign keys
- Strong consistency
- Full ACID transactions

Examples:
- MySQL
- PostgreSQL
- Oracle
- SQL Server

---

### 2.2 Non-Relational Databases (NoSQL)
Non-relational databases store data in flexible formats and are designed for scale.

Key characteristics:
- Schema-less or flexible schema
- Horizontally scalable
- Often eventual consistency
- Optimized for specific workloads

Types:
- Key–Value: Redis
- Document: MongoDB
- Wide-column: Cassandra
- Graph: Neo4j

---

## 3. Relational vs Non-Relational

| Aspect | Relational | Non-Relational |
|------|------------|----------------|
| Schema | Fixed | Flexible |
| Transactions | Full ACID | Limited |
| Scaling | Vertical (mostly) | Horizontal |
| Joins | Supported | Avoided |
| Consistency | Strong | Eventual (often) |

---

## 4. Transactions

### 4.1 What is a Transaction
A transaction is a group of database operations executed as a single logical unit.

Either:
- All operations succeed and are committed
- Any operation fails and everything is rolled back

---

### 4.2 Why Transactions Are Needed
Transactions ensure data correctness, prevent partial updates, and protect against crashes and concurrent access issues.

---

### 4.3 Transaction Syntax (SQL)

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;
-- or
ROLLBACK;
```

### 4.4 Autocommit
- Default mode in most databases
- Each SQL statement runs as its own transaction
- Explicit `BEGIN` / `START TRANSACTION` disables autocommit until `COMMIT` or `ROLLBACK`

---

## 5. ACID Properties (Transaction Context)

### Atomicity
All operations inside a transaction either complete fully or none of them are applied.

### Consistency
A transaction moves the database from one valid state to another while respecting constraints.

### Isolation
Multiple transactions can execute concurrently without seeing each other's intermediate states.

### Durability
Once a transaction is committed, its changes survive crashes using logs and disk writes.

---

## 6. Isolation Levels (Detailed)

Isolation level defines how visible one transaction's changes are to other transactions. Each level solves different concurrency problems but with trade-offs in performance and consistency.

---

### 6.1 Read Uncommitted

**What it allows:**
A transaction can read data written by another uncommitted transaction (dirty data).

**Problems it solves:**
- None (weakest isolation)

**Problems it causes:**
- **Dirty Reads**: Reading uncommitted changes that might be rolled back
- **Non-repeatable Reads**: Same query returns different results within the transaction
- **Phantom Reads**: New rows appear in range queries

**Example:**
```
Transaction A: UPDATE accounts SET balance = 500 WHERE id = 1; (not committed)
Transaction B: SELECT balance FROM accounts WHERE id = 1; → Returns 500 (dirty read)
Transaction A: ROLLBACK; (Transaction B read invalid data)
```

**Use case:**
- Rarely used in production
- Only when approximate data is acceptable

---

### 6.2 Read Committed

**What it allows:**
A transaction can only read data that has been committed by other transactions.

**Problems it solves:**
- **Dirty Reads**: Prevented ✓

**Problems it still has:**
- **Non-repeatable Reads**: Same row may return different values if read twice
- **Phantom Reads**: New rows can appear in range queries

**Example:**
```
Transaction A: SELECT balance FROM accounts WHERE id = 1; → Returns 1000
Transaction B: UPDATE accounts SET balance = 500 WHERE id = 1; COMMIT;
Transaction A: SELECT balance FROM accounts WHERE id = 1; → Returns 500 (non-repeatable read)
```

**Default in:**
- PostgreSQL
- Oracle
- SQL Server

**Use case:**
- Most common isolation level
- Good balance of consistency and performance

---

### 6.3 Repeatable Read

**What it allows:**
Once a transaction reads a row, that row's values remain consistent for the entire transaction.

**Problems it solves:**
- **Dirty Reads**: Prevented ✓
- **Non-repeatable Reads**: Prevented ✓

**Problems it still has:**
- **Phantom Reads**: New rows matching the query criteria can appear

**Example:**
```
Transaction A: SELECT * FROM accounts WHERE balance > 1000; → Returns 5 rows
Transaction B: INSERT INTO accounts VALUES (6, 1500); COMMIT;
Transaction A: SELECT * FROM accounts WHERE balance > 1000; → Returns 6 rows (phantom read)
```

**Implementation:**
- MySQL (InnoDB): Uses MVCC (Multi-Version Concurrency Control)
- Prevents phantom reads in practice

**Default in:**
- MySQL (InnoDB)

**Use case:**
- When you need consistent row-level reads
- Financial applications

---

### 6.4 Serializable

**What it allows:**
Transactions execute as if they were run one after another, not concurrently.

**Problems it solves:**
- **Dirty Reads**: Prevented ✓
- **Non-repeatable Reads**: Prevented ✓
- **Phantom Reads**: Prevented ✓

**Problems it still has:**
- None (strongest isolation)

**Trade-offs:**
- Highest consistency
- Lowest concurrency (transactions may wait/retry)
- Performance overhead
- Possible deadlocks

**Implementation approaches:**
- Locks on read ranges
- Serializable Snapshot Isolation (PostgreSQL)
- Optimistic concurrency control

**Use case:**
- Critical financial transactions
- When absolute consistency is required
- Systems with low concurrency needs

---

### 6.5 Isolation Level Comparison Table

| Isolation Level | Dirty Reads | Non-repeatable Reads | Phantom Reads | Performance |
|----------------|-------------|---------------------|---------------|-------------|
| Read Uncommitted | ❌ Possible | ❌ Possible | ❌ Possible | ⚡ Fastest |
| Read Committed | ✅ Prevented | ❌ Possible | ❌ Possible | ⚡ Fast |
| Repeatable Read | ✅ Prevented | ✅ Prevented | ❌ Possible* | 🔄 Moderate |
| Serializable | ✅ Prevented | ✅ Prevented | ✅ Prevented | 🐌 Slowest |

*MySQL InnoDB prevents phantom reads at Repeatable Read level

---

### 6.6 How to Set Isolation Level

**PostgreSQL:**
```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**MySQL:**
```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**Check current level:**
```sql
-- PostgreSQL
SHOW TRANSACTION ISOLATION LEVEL;

-- MySQL
SELECT @@transaction_isolation;
```

---

### 6.7 Choosing the Right Isolation Level

**Use Read Committed when:**
- You need good performance
- Occasional stale reads are acceptable
- Most web applications

**Use Repeatable Read when:**
- You need consistent reads within a transaction
- Financial calculations
- Report generation

**Use Serializable when:**
- Absolute consistency is critical
- Banking transactions
- Inventory management with strict rules
- Low concurrency workloads

---

## 7. Scaling a Database

### What is Scaling
Scaling means increasing the system's ability to handle more users, data, or queries.

---

### 7.1 Vertical Scaling (Scale Up)
Increase resources of a single machine such as CPU, RAM, or disk.

Pros:
- Simple
- No application changes

Cons:
- Hardware limits
- Single point of failure
- Expensive

---

### 7.2 Horizontal Scaling (Scale Out)
Add more machines and distribute load or data across them.

Pros:
- High scalability
- Fault tolerant

Cons:
- Complex architecture
- Harder consistency management

---

## 8. Partitioning

Partitioning divides a table into smaller logical parts within the same database instance.

Types:
- Range partitioning
- Hash partitioning
- List partitioning

Purpose:
- Faster queries
- Easier maintenance
- Better data organization

---

## 9. Sharding

Sharding splits data across multiple database servers.

Each shard stores only a subset of the total data.

Key points:
- Enables horizontal scaling
- Application decides which shard to access
- Cross-shard joins are difficult

---

## 10. Replication

Replication copies data from one database node to one or more other nodes.

Used for:
- High availability
- Read scaling
- Fault tolerance

---

## 11. Read Replicas

### 11.1 What is a Read Replica
A read replica is a copy of the primary database used only for read operations.

- Writes go to primary
- Reads go to replicas

---

### 11.2 Synchronous Replication
Primary waits for replica acknowledgment before committing.

- Strong consistency
- Higher latency

Used when data loss is unacceptable.

---

### 11.3 Asynchronous Replication
Primary commits immediately and replicas update later.

- Faster writes
- Replica lag possible

Most common in real-world systems.

---

### 11.4 Why Read Replicas Are Used
- Scale read-heavy workloads
- Reduce load on primary database
- Improve availability
- Enable geo-distributed reads

---

### 11.5 Trade-offs
- Stale reads possible
- Not suitable for strict read-after-write consistency

---

## 12. Distributed Systems

### What is a Distributed System
A distributed system is a collection of independent machines that work together and appear as a single system.

Databases become distributed when:
- Data is replicated
- Data is sharded
- Multiple nodes handle requests

---

### Challenges in Distributed Systems
- Network failures
- Partial outages
- Data consistency
- Node coordination

---

## 13. CAP Theorem

In a distributed system, only two of the following three can be guaranteed at the same time:
- Consistency
- Availability
- Partition tolerance

Trade-offs are unavoidable.

---

## 14. Picking the Right Database

Key questions:
1. Do I need strong transactions?
2. Are data relationships important?
3. Expected scale?
4. Read-heavy or write-heavy workload?
5. Can the system tolerate stale reads?

---

## 15. Polyglot Persistence

Using multiple databases for different purposes in the same system.

Example:
- PostgreSQL for core transactional data
- Redis for caching
- Elasticsearch for search
- Cassandra for high write throughput

---

## 16. Summary

- Transactions ensure correctness
- ACID properties guarantee data integrity
- Isolation levels control concurrency with different trade-offs
- Replication improves availability
- Sharding enables scale
- Distributed systems require trade-offs
- No single database fits all use cases
