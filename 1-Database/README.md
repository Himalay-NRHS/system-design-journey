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
Multiple transactions can execute concurrently without seeing each other’s intermediate states.

### Durability
Once a transaction is committed, its changes survive crashes using logs and disk writes.

---

## 6. Isolation Levels (Explained Using Transactions)

Isolation level defines how visible one transaction’s changes are to other transactions.

---

### 6.1 Read Uncommitted
A transaction can read data written by another uncommitted transaction.

Issue:
- Dirty reads

---

### 6.2 Read Committed
A transaction can read only committed data, but repeated reads may return different values.

Issue:
- Non-repeatable reads  
Default in PostgreSQL and Oracle.

---

### 6.3 Repeatable Read
Rows read by a transaction cannot change until the transaction ends.

Issue:
- Phantom reads  
Default in MySQL (InnoDB).

---

### 6.4 Serializable
Transactions behave as if they run one after another, not concurrently.

- Safest isolation level
- Lowest concurrency
- Highest overhead

---

## 7. Scaling a Database

### What is Scaling
Scaling means increasing the system’s ability to handle more users, data, or queries.

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
- Isolation controls concurrency
- Replication improves availability
- Sharding enables scale
- Distributed systems require trade-offs
- No single database fits all use cases
