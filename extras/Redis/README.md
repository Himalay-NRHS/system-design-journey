# Redis – Complete Notes (From First Principles)

## 1. What is Redis
Redis is an **in-memory key–value data store**.
- Extremely fast (RAM based)
- Single-threaded execution
- Used for caching, queues, counters, sessions, real-time systems

---

## 2. Core Data Model
Redis stores data as:
```
key → value
```
The **value has a data type**, which defines how Redis can operate on it.

---

## 3. String

### What it is
- Simplest data type
- Stores raw bytes (text, numbers, JSON, base64, etc.)

### Commands
```bash
SET key value
GET key
MSET a 1 b 2
MGET a b
```
### Limits
- Max size: **512 MB per string**

### Counters
```bash
INCR counter
INCRBY counter 5
```
- Atomic
- Auto-creates key starting from 0

---

## 4. Hash (Grouped Data)

### What it is
- Key → field → value
- Like a HashMap / object

```bash
HSET user:1 name Alex age 21
HGET user:1 name
HGETALL user:1
```

### Important
- Fields cannot expire individually
- Expiry applies to the **whole hash**
- Memory efficient for small objects

---

## 5. List

### What it is
- Ordered collection
- Implemented as linked list

### Commands
```bash
LPUSH list a
RPUSH list b
LPOP list
RPOP list
LRANGE list 0 -1
```

### Use cases
- Stack (LIFO)
- Queue (FIFO)
- Logs

### Blocking
```bash
BLPOP jobs 0
```

---

## 6. Set

### What it is
- Unordered
- Unique elements only

```bash
SADD users a b c
SISMEMBER users a
SMEMBERS users
```

### Use cases
- Membership checks
- Deduplication

---

## 7. Sorted Set (ZSet – Priority Queue)

### What it is
- Like Set
- Each value has a score
- Sorted by score

```bash
ZADD pq 10 task1
ZADD pq 5 task2
ZRANGE pq 0 -1 WITHSCORES
ZPOPMIN pq
```

### Use cases
- Leaderboards
- Priority queues
- Scheduling

---

## 8. Expiry (TTL)

### What it does
- Automatically deletes keys after time

```bash
SET session:1 abc EX 60
EXPIRE key 10
TTL key
```

### Why used
- Caching
- Sessions
- Locks
- Rate limiting

### Deletion
- Lazy deletion
- Active background cleanup

---

## 9. Streams

### What it is
- Append-only log
- Ordered, persistent

```bash
XADD orders * user 1 amount 500
XREAD STREAMS orders 0
```

### Consumer Groups
```bash
XGROUP CREATE orders workers $
XREADGROUP GROUP workers c1 STREAMS orders >
XACK orders workers id
```

### Use cases
- Event pipelines
- Reliable queues

---

## 10. Pub/Sub

### What it is
- Live messaging
- No persistence

```bash
SUBSCRIBE news
PUBLISH news "hello"
```

### Important
- Offline subscribers miss messages
- No retry or storage

### Use Streams if reliability needed

---

## 11. Geospatial Data

### Built on Sorted Sets

```bash
GEOADD places 77.59 12.97 bangalore
GEODIST places bangalore mumbai KM
GEORADIUS places 77.6 13.0 500 KM
```

### Use cases
- Nearby search
- Location services

---

## 12. Bitmaps

### What it is
- Bit-level operations on strings

```bash
SETBIT login 1 1
GETBIT login 1
```

### Use cases
- DAU tracking
- Feature flags

---

## 13. HyperLogLog

### What it is
- Approximate unique counter
- Fixed memory (~12KB)

```bash
PFADD visitors u1 u2
PFCOUNT visitors
```

---

## 14. Redis Modules

### RedisJSON
- Native JSON storage
- Partial updates

### RedisTimeSeries
- Metrics & time-series data

### RedisBloom
- Bloom filters
- Top-K
- Count-Min Sketch

---

## 15. Docker + Redis

### Start Redis container
```bash
docker run -d -p 6379:6379 --name redis-stack redis/redis-stack
```

### Important rule
- Ports are mapped **only at container creation**
- Cannot add ports using `docker exec`
- Must recreate container to change ports

---

## 16. Node.js Client (ioredis)

### Setup
```js
const { Redis } = require('ioredis');
const client = new Redis();
module.exports = client;
```

### Usage
```js
await client.set('a', 10);
await client.incr('counter');
await client.hgetall('user:1');
```

---

## 17. When NOT to use Redis
- Large file storage
- Long-term durable storage
- Complex relational queries

---

## 18. Summary
Redis is:
- Fast
- In-memory
- Atomic
- Multi-purpose

Correct usage depends on choosing the **right data type**.
