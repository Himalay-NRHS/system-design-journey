# 📦 Caching (System Design)

## 1. What is Caching?
Caching means storing **data or computation results** in a **faster storage layer** so future requests don’t redo expensive work.

Core idea:  
**Trade memory for speed**

```
Without cache: Client → Server → DB
With cache:    Client → Cache → DB (only on miss)
```

---

## 2. Why Do We Need Caching?
Because repeated computation and I/O are expensive.

Caching helps when:
- Data is read frequently
- Data is expensive to compute
- Data doesn’t change often

---

## 3. Importance of Caching
- Reduces latency
- Reduces database load
- Increases throughput (QPS)
- Handles traffic spikes better
- Saves infrastructure cost

---

## 4. Common Use Cases
- User profiles
- Product lists
- Session data
- Authentication tokens
- Aggregated statistics
- API responses

---

## 5. Disadvantages of Caching
- Stale data risk
- Cache inconsistency
- Extra infrastructure
- Hard cache invalidation
- Debugging complexity

> Cache invalidation is one of the hardest problems in computer science.

---

## 6. Caching at Different Levels

### 6.1 Client-Side Caching
Examples:
- Browser cache
- HTTP cache headers
- Service workers
- LocalStorage / IndexedDB

Pros:
- Zero server load
- Very fast

Cons:
- Hard to invalidate
- Less control

---

### 6.2 Application-Level Caching
Stored in:
- In-memory (LRU maps)
- Redis / Memcached

Used for:
- DB query results
- Computed values

---

### 6.3 Database-Level Caching
Examples:
- Query cache
- Materialized views
- Precomputed columns

Example:
Instead of computing repeatedly:
```sql
total_price = price * quantity
```
Precompute and store it.

---

### 6.4 CDN-Level Caching
Caches static content at edge locations near users.

Used for:
- Images
- JS / CSS
- Videos
- Static HTML

---

## 7. Remote Cache (Redis)
Redis is an **in-memory key-value store** shared across servers.

Why Redis:
- Extremely fast (RAM)
- TTL support
- Distributed
- Rich data structures

Typical flow:
```
Request → Redis
  ├─ HIT → return
  └─ MISS → DB → store in Redis → return
```

---

## 8. Cache Population Strategies

### 8.1 Cache-Aside (Lazy Loading)
1. Check cache
2. If miss → fetch from DB
3. Store in cache

Pros:
- Simple
- Cache only what’s needed

Cons:
- First request is slow

---

### 8.2 Write-Through Cache
- Write to cache and DB together

Pros:
- Cache always consistent

Cons:
- Slower writes

---

### 8.3 Write-Back (Write-Behind)
- Write to cache first
- DB updated asynchronously

Pros:
- Very fast writes

Cons:
- Risk of data loss

---

## 9. Cache Staleness
Cache staleness happens when cached data is outdated.

Causes:
- DB updated but cache not updated
- Long TTL values

---

## 10. Cache Invalidation Techniques

1. **TTL (Time To Live)**
   - Cache auto-expires after time

2. **Explicit Invalidation**
   - Update or delete cache on DB write

3. **Versioned Keys**
   - Example: `user:123:v2`

---

## 11. Scaling a Cache

### Vertical Scaling
- Add more RAM
- Limited and expensive

### Horizontal Scaling
- Shard cache keys
- Redis Cluster
- Consistent hashing

Example:
```
cache_node = user_id % N
```

---

## 12. CDN (Content Delivery Network)

### What is a CDN?
A globally distributed cache that serves content from the **nearest edge server**.

---

### Why Use CDN?
- Lower latency
- Offload origin servers
- Handle massive traffic
- Improve availability

---

### How CDN Works
1. User requests content
2. CDN checks edge cache
3. HIT → serve immediately
4. MISS → fetch from origin → cache → serve

---

### CDN Configuration (High-Level)
1. Choose CDN provider
2. Point DNS to CDN
3. Configure cache rules
4. Set `Cache-Control` headers
5. Invalidate cache when needed

---

## 13. Advantages of Caching
- Faster responses
- Reduced DB load
- Better scalability
- Cost-efficient

---

## 14. Disadvantages of Caching
- Stale data
- Invalidation complexity
- Extra infra
- Debugging difficulty

---

## 15. Should We Cache Everything? NO.
Just because you **can**, doesn’t mean you **should**.

Do NOT cache when:
- Data changes very frequently
- Strong consistency is required
- Cache miss penalty is small
- Data is rarely accessed

Golden rule:
> Cache hot, expensive, mostly-read data.

---

## 16. Final Mental Model
Caching is an **optimization layer**, not a requirement.

Build a correct system first  
Then make it fast  
Then add caching
