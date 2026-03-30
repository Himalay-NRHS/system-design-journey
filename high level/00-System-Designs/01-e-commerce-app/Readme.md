# E-Commerce Product Listing - System Design

## 1. Problem Statement
Design a product catalog system for a small e-commerce shop to manage and display their inventory to customers.

---

## 2. Requirements

### Functional Requirements
- Shop owners can add, update, and delete products
- Customers can browse and view the product catalog
- Quick access to product listings
- Separate interfaces for customers and admins

### Non-Functional Requirements
- High availability for customer-facing catalog
- Fast response times for browsing
- Scalable to handle varying customer traffic
- Secure admin operations

### Out of Scope
- Payment processing
- Order management
- User authentication (simplified)

### Scale Estimates
- **Catalog size**: ~100 products
- **Storage**: Minimal, fits in single node
- **Traffic**: Read-heavy (browsing > modifications)
- **Users**: High customer traffic, single admin

---

## 3. High-Level Design

### Architecture Pattern
**3-Tier Architecture**

```
Client Layer → Frontend Layer → Backend Layer → Database Layer
```

### System Components
1. **Catalog Frontend** - Customer interface
2. **Admin Frontend** - Shop owner interface  
3. **Catalog Backend Service** - REST API servers
4. **Load Balancers** - Traffic distribution
5. **Database** - MySQL for structured product data

---

## 4. Data Model

### Database Choice: MySQL
**Rationale**: 
- Structured product data with clear schema
- ACID properties for inventory consistency
- Small dataset fits in single node
- Relational queries for product filtering

### Products Table Schema
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);
```

---

## 5. API Design

### Customer APIs (Read Operations)
```
GET  /api/v1/products              # List all products
GET  /api/v1/products/{id}         # Get product details
GET  /api/v1/products?category=X   # Filter by category
```

### Admin APIs (CRUD Operations)
```
POST   /api/admin/products         # Add new product
PUT    /api/admin/products/{id}    # Update product
DELETE /api/admin/products/{id}    # Delete product
GET    /api/admin/products         # List for management
```

---

## 6. Detailed Component Design

### Frontend Layer

#### Catalog Frontend (Customer-facing)
- **Purpose**: Display products to end users
- **Traffic**: High volume (many concurrent customers)
- **Operations**: Read-only
- **Scaling**: Multiple servers

#### Admin Frontend (Shop Owner)
- **Purpose**: Product management interface
- **Traffic**: Low volume (single admin user)
- **Operations**: Full CRUD
- **Scaling**: Single server with backup for HA

**Design Decision**: Separate UIs prevent bug tangling and improve security

### Backend Service (Catalog Backend)

**Components**:
- REST-based HTTP web servers
- Load Balancer with DNS: `api.mystore.com`
- Auto-scaling policies

**Responsibilities**:
- Handle API requests from both frontends
- Business logic validation
- Database query routing
- Response formatting

### Database Layer

**Master-Replica Architecture**:

**Master Node**:
- Handles all write operations (INSERT, UPDATE, DELETE)
- Can serve read queries
- Source of truth for data

**Read Replicas**:
- Handle read queries only (SELECT)
- Asynchronous replication from master
- Distribute read load

---

## 7. System Architecture Diagram

```
┌─────────────┐         ┌──────────────┐
│  End Users  │         │ Shop Owner   │
│ (Customers) │         │   (Admin)    │
└──────┬──────┘         └──────┬───────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│  Catalog    │         │    Admin     │
│  Frontend   │         │   Frontend   │
│(Multi-Srv)  │         │ (Single+LB)  │
└──────┬──────┘         └──────┬───────┘
       │                       │
       └───────────┬───────────┘
                   ▼
            ┌─────────────┐
            │Load Balancer│
            │api.mystore  │
            └──────┬──────┘
                   │
       ┏━━━━━━━━━━━┻━━━━━━━━━━━┓
       ▼           ▼            ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │API Srv1│  │API Srv2│  │API SrvN│
   └───┬────┘  └───┬────┘  └───┬────┘
       │           │            │
       │(writes)   │(writes)    │(writes)
       └─────┬─────┴────┬───────┘
             ▼          ▼
        ┌──────────────────┐
        │   MySQL Master   │
        │  (Read + Write)  │
        └────────┬─────────┘
                 │ Replication
         ┏━━━━━━━┻━━━━━━━┓
         ▼               ▼
    ┌─────────┐     ┌─────────┐
    │ Replica1│     │ Replica2│
    │ (Read)  │     │ (Read)  │
    └─────────┘     └─────────┘
         ▲               ▲
         │(reads)        │(reads)
         └───────┬───────┘
                API Servers
```

---

## 8. Traffic & Load Analysis

### Load Characteristics

| Component | Traffic Type | Volume | Scaling Need |
|-----------|-------------|--------|--------------|
| Catalog Frontend | Customer browsing | High | Multiple servers |
| Admin Frontend | Product management | Very Low | 1 server + backup |
| Backend API | Mixed R/W | High (read-heavy) | Auto-scaling group |
| Master DB | Writes | Low | Single node |
| Read Replicas | Reads | High | Add replicas as needed |

### Read vs Write Ratio
- **Reads**: 95%+ (customers browsing catalog)
- **Writes**: <5% (admin updates)
- **Rationale**: No payment/checkout, pure catalog browsing

---

## 9. Scaling Strategy

### Horizontal Scaling

**Frontend Tier**:
- Add more catalog frontend servers behind load balancer
- Auto-scaling based on traffic patterns
- Admin frontend: Single server sufficient (backup for failover)

**Backend Tier**:
- Auto-scaling policy for API servers
- Load balancer distributes requests
- Scale out during peak traffic

**Database Tier**:
- Add read replicas to handle increased read load
- Master handles all writes (single point)
- Each replica reduces master read burden

### Load Balancer Configuration
- Health checks on backend servers
- Round-robin or least-connections distribution
- Automatic failover for failed nodes

---

## 10. Data Flow Patterns

### Customer Browse Flow
```
Customer → Catalog Frontend → Load Balancer 
→ API Server → Read Replica → Product Data → Response
```

### Admin Update Flow
```
Shop Owner → Admin Frontend → Load Balancer 
→ API Server → Master DB → Write Success
→ Replication → Read Replicas Updated
```

---

## 11. Database Replication Setup

### Replication Configuration

**Step 1: Enable Binary Logging on Master**
```sql
# my.cnf on master
[mysqld]
server-id=1
log-bin=mysql-bin
binlog-format=ROW
```

**Step 2: Create Replication User**
```sql
CREATE USER 'repl_user'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'%';
FLUSH PRIVILEGES;
```

**Step 3: Configure Read Replicas**
```sql
# my.cnf on replica
[mysqld]
server-id=2
relay-log=mysql-relay-bin
read_only=1

# Start replication
CHANGE MASTER TO
  MASTER_HOST='master_host',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=0;

START SLAVE;
```

### Read/Write Splitting in Application

**API Server Configuration**:
```python
# Connection pool setup
write_db = MySQLConnection(host='master.db.internal')
read_dbs = [
    MySQLConnection(host='replica1.db.internal'),
    MySQLConnection(host='replica2.db.internal')
]

# Route queries
def execute_query(query, is_write=False):
    if is_write:
        return write_db.execute(query)
    else:
        replica = random.choice(read_dbs)  # Load balance reads
        return replica.execute(query)
```

---

## 12. Trade-offs & Design Decisions

### Why MySQL over NoSQL?
- ✅ Structured product data with clear schema
- ✅ ACID guarantees for inventory accuracy
- ✅ Small dataset (100 items) doesn't need NoSQL scale
- ✅ Relational queries for filtering/categories

### Why Separate Admin UI?
- ✅ Security: Isolate admin operations
- ✅ Maintainability: Independent deployments
- ✅ Performance: Different scaling requirements
- ❌ Increased complexity (acceptable trade-off)

### Master-Replica vs Master-Master?
- ✅ Simpler conflict resolution
- ✅ Clear write path (all writes to master)
- ✅ Sufficient for read-heavy workload
- ❌ Master is single point of failure (acceptable for small shop)

---

## 13. Exercises

### Exercise 1: Optimize Database Schema
Add the following to improve performance:
- Full-text index on product name/description for search
- Composite index on (category, is_active) for filtered queries
- Partitioning by category if catalog grows

### Exercise 2: Implement Connection Pooling
Configure backend API servers to:
- Maintain persistent DB connections
- Pool size based on expected concurrent queries
- Monitor connection usage and adjust

### Exercise 3: Add Caching Layer
Consider adding Redis between API and DB:
- Cache frequently accessed products
- TTL-based invalidation
- Cache-aside pattern for reads
- Write-through for updates

---

## 14. Performance Considerations

### Optimization Strategies
- **Database Indexing**: On category, is_active fields
- **Query Optimization**: SELECT only needed columns
- **Connection Pooling**: Reuse DB connections
- **Async Replication**: Don't block writes waiting for replicas
- **Load Balancer Health Checks**: Remove failed servers quickly

### Monitoring Metrics
- API response times (p50, p95, p99)
- Database query latency
- Replication lag between master and replicas
- Server CPU/memory utilization
- Load balancer request distribution