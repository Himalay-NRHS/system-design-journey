# Data Redundancy & Production Data Management

## What is Data Redundancy?

**Data Redundancy** is the practice of storing multiple copies of data across different locations/systems to ensure availability, durability, and fault tolerance.

**Key Benefits:**
- Prevents data loss from hardware failures
- Enables high availability during outages
- Supports disaster recovery
- Improves read performance through distribution

## Levels of Redundancy

### 1. Application Level
- Multiple application servers behind load balancer
- Stateless design for easy horizontal scaling
- Session replication across instances

### 2. Database Level
- **Master-Slave Replication**: Read replicas for scaling reads
- **Master-Master Replication**: Multi-write capability
- **Multi-Region Deployment**: Geographic redundancy

### 3. Storage Level
- **RAID configurations**: Disk-level redundancy
- **Distributed file systems**: HDFS, GlusterFS
- **Object storage**: S3 with multi-AZ replication

### 4. Infrastructure Level
- Multiple data centers (on-prem)
- Multiple availability zones (cloud)
- Multiple cloud regions for critical data

## Backup & Restore Strategies

### Backup Types

**Full Backup**
- Complete copy of all data
- Slowest but simplest restore
- High storage cost
- Schedule: Weekly/Monthly

**Incremental Backup**
- Only changes since last backup (any type)
- Fastest backup, slower restore
- Lowest storage cost
- Schedule: Daily

**Differential Backup**
- Changes since last full backup
- Moderate backup/restore speed
- Moderate storage cost
- Schedule: Daily

### Backup Strategy (3-2-1 Rule)
- **3** copies of data
- **2** different media types
- **1** copy offsite

### RPO and RTO

**RPO (Recovery Point Objective)**
- Maximum acceptable data loss (time-based)
- Example: RPO = 1 hour means you can lose up to 1 hour of data

**RTO (Recovery Time Objective)**
- Maximum acceptable downtime
- Example: RTO = 4 hours means system must be up within 4 hours

## Continuous Redundancy

### Real-Time Replication
- Synchronous replication (zero data loss, slower)
- Asynchronous replication (potential data loss, faster)
- Semi-synchronous (hybrid approach)

### Change Data Capture (CDC)
- Captures changes from transaction logs
- Streams to multiple destinations
- Tools: Debezium, Maxwell, AWS DMS

### Hot Standby Systems
- Secondary system always running
- Instant failover capability
- Higher cost but minimal downtime

## Disaster Recovery Management

### DR Strategies (Cost vs RTO/RPO)

**1. Backup & Restore (Lowest Cost)**
- RTO: Hours to days
- RPO: Hours
- Regular backups to cold storage

**2. Pilot Light**
- RTO: Minutes to hours
- RPO: Minutes
- Core systems running at minimal capacity

**3. Warm Standby**
- RTO: Minutes
- RPO: Seconds to minutes
- Scaled-down replica always running

**4. Hot Standby / Active-Active (Highest Cost)**
- RTO: Seconds to real-time
- RPO: Near zero
- Full production environment in multiple locations

### DR Plan Essentials
- Regular failover testing (quarterly/annually)
- Documented runbooks and procedures
- Automated failover where possible
- Clear communication protocols
- Data consistency verification

## MySQL Replication Setup

### Master-Slave Replication

**Master Server Configuration** (`/etc/mysql/my.cnf`):
```ini
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_do_db = production_db
bind-address = 0.0.0.0
```

**Steps on Master:**
```sql
-- Create replication user
CREATE USER 'replicator'@'%' IDENTIFIED BY 'strong_password';
GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';
FLUSH PRIVILEGES;

-- Get master status
SHOW MASTER STATUS;
-- Note: File and Position values
```

**Slave Server Configuration** (`/etc/mysql/my.cnf`):
```ini
[mysqld]
server-id = 2
relay-log = /var/log/mysql/mysql-relay-bin.log
log_bin = /var/log/mysql/mysql-bin.log
read_only = 1
```

**Steps on Slave:**
```sql
-- Configure replication
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='replicator',
  MASTER_PASSWORD='strong_password',
  MASTER_LOG_FILE='mysql-bin.000001',  -- From SHOW MASTER STATUS
  MASTER_LOG_POS=12345;                -- From SHOW MASTER STATUS

-- Start replication
START SLAVE;

-- Verify status
SHOW SLAVE STATUS\G
-- Check: Slave_IO_Running: Yes, Slave_SQL_Running: Yes
```

### Replication Lag Monitoring
```sql
-- Check seconds behind master
SHOW SLAVE STATUS\G
-- Look for: Seconds_Behind_Master
```

## MySQL Backup & Restore

### Logical Backup (mysqldump)

**Full Database Backup:**
```bash
# Single database
mysqldump -u root -p database_name > backup.sql

# All databases
mysqldump -u root -p --all-databases > all_backup.sql

# With routines, triggers, events
mysqldump -u root -p --routines --triggers --events database_name > full_backup.sql

# Compressed backup
mysqldump -u root -p database_name | gzip > backup.sql.gz
```

**Table-Level Backup:**
```bash
mysqldump -u root -p database_name table1 table2 > tables_backup.sql
```

**Restore from Logical Backup:**
```bash
# Restore compressed backup
gunzip < backup.sql.gz | mysql -u root -p database_name

# Restore regular backup
mysql -u root -p database_name < backup.sql

# Create database and restore
mysql -u root -p -e "CREATE DATABASE new_database;"
mysql -u root -p new_database < backup.sql
```

### Physical Backup (File System Copy)

**Using MySQL Enterprise Backup or Percona XtraBackup:**
```bash
# Hot backup (no downtime)
xtrabackup --backup --target-dir=/backup/full

# Prepare backup
xtrabackup --prepare --target-dir=/backup/full

# Restore
systemctl stop mysql
xtrabackup --copy-back --target-dir=/backup/full
chown -R mysql:mysql /var/lib/mysql
systemctl start mysql
```

### Binary Log Backups (Point-in-Time Recovery)
```bash
# Flush logs to start new binary log
mysqladmin flush-logs

# Backup binary logs
cp /var/log/mysql/mysql-bin.* /backup/binlogs/

# Point-in-time restore
mysqlbinlog mysql-bin.000001 mysql-bin.000002 | mysql -u root -p

# Restore up to specific time
mysqlbinlog --stop-datetime="2025-01-04 14:30:00" \
  mysql-bin.000001 | mysql -u root -p
```

### Automated Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
DB_NAME="production_db"

# Create backup
mysqldump -u backup_user -p$DB_PASS \
  --single-transaction \
  --routines --triggers \
  $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME-$DATE.sql.gz

# Retain only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/$DB_NAME-$DATE.sql.gz s3://my-backups/mysql/
```

## Production Data Handling Best Practices

### Data Protection
- Encryption at rest and in transit
- Access control with least privilege
- Audit logging for sensitive operations
- Regular security assessments

### Performance Optimization
- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization and indexing
- Caching layers (Redis, Memcached)

### Monitoring & Alerts
- Replication lag monitoring
- Disk space alerts
- Connection pool saturation
- Slow query identification
- Backup success/failure notifications

### Data Consistency
- ACID transactions for critical operations
- Eventual consistency for distributed systems
- Regular data integrity checks
- Automated reconciliation processes

### Scalability Patterns
- **Vertical Scaling**: Increase server resources
- **Horizontal Scaling**: Add more replicas
- **Sharding**: Partition data across multiple databases
- **Read/Write Splitting**: Route reads to replicas

## System Design Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Synchronous Replication** | Zero data loss, strong consistency | Higher latency, reduced availability |
| **Asynchronous Replication** | Low latency, high availability | Potential data loss, eventual consistency |
| **Multi-Master** | High write availability | Conflict resolution complexity |
| **Sharding** | Horizontal scalability | Complex queries, rebalancing overhead |

## Quick Interview Points

- **Always design for failure** - assume any component can fail
- **RTO/RPO drive architecture** - hot standby vs backup/restore
- **Replication lag** - monitor and handle appropriately
- **Backup testing** - untested backups = no backups
- **Multi-region** - for true disaster recovery
- **CAP theorem** - consistency vs availability trade-offs
- **Automate everything** - backups, failover, monitoring