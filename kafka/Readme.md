# Apache Kafka Essentials

A practical guide to Apache Kafka - the distributed event streaming platform for building real-time data pipelines and streaming applications.

## Table of Contents

- [What is Apache Kafka?](#what-is-apache-kafka)
- [Core Concepts](#core-concepts)
- [Installation & Setup](#installation--setup)
- [Producers](#producers)
- [Consumers](#consumers)
- [Admin Operations](#admin-operations)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Common Use Cases](#common-use-cases)

## What is Apache Kafka?

Apache Kafka is a distributed streaming platform that lets you:
- Publish and subscribe to streams of records (like a message queue)
- Store streams of records reliably
- Process streams of records in real-time

### Key Features

- **High Throughput**: Handle millions of messages per second
- **Scalability**: Scale horizontally by adding more brokers
- **Fault Tolerance**: Data replication across multiple brokers
- **Durability**: Messages persisted to disk
- **Low Latency**: Real-time data processing

## Core Concepts

### Topics
A category or feed name where records are published. Like a folder in a file system.

### Partitions
Topics are divided into partitions for parallelism. Each partition is an ordered sequence of records.

### Offsets
A unique ID for each record within a partition. Consumers track their position using offsets.

### Consumer Groups
Multiple consumers working together to consume messages from a topic.

### Architecture

```
Producer → Topic (Partitions) → Consumer Group
              ↓
         Kafka Brokers
```

## Installation & Setup

### Install KafkaJS

```bash
npm install kafkajs
```

### Docker Setup (Quick Start)

```yaml
# docker-compose.yml
version: '3'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

```bash
docker-compose up -d
```

## Producers

Producers send messages to Kafka topics.

### Basic Producer

```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function sendMessage() {
  await producer.connect();
  
  await producer.send({
    topic: 'my-topic',
    messages: [
      { 
        key: 'user-123',
        value: JSON.stringify({ name: 'John', age: 30 })
      }
    ]
  });
  
  await producer.disconnect();
}

sendMessage().catch(console.error);
```

### Send Multiple Messages

```javascript
async function sendBatch() {
  await producer.connect();
  
  const messages = [
    { key: '1', value: 'Message 1' },
    { key: '2', value: 'Message 2' },
    { key: '3', value: 'Message 3' }
  ];
  
  await producer.send({
    topic: 'my-topic',
    messages: messages
  });
  
  console.log('Batch sent successfully');
  await producer.disconnect();
}
```

### Producer with Compression

```javascript
const { CompressionTypes } = require('kafkajs');

await producer.send({
  topic: 'my-topic',
  compression: CompressionTypes.GZIP,
  messages: [
    { value: 'Compressed message' }
  ]
});
```

## Consumers

Consumers read messages from Kafka topics.

### Basic Consumer

```javascript
const consumer = kafka.consumer({ 
  groupId: 'my-group' 
});

async function consumeMessages() {
  await consumer.connect();
  
  await consumer.subscribe({ 
    topic: 'my-topic',
    fromBeginning: true 
  });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic: topic,
        partition: partition,
        offset: message.offset,
        value: message.value.toString()
      });
    }
  });
}

consumeMessages().catch(console.error);
```

### Subscribe to Multiple Topics

```javascript
await consumer.subscribe({ 
  topics: ['topic-1', 'topic-2', 'topic-3']
});
```

### Manual Offset Commit

```javascript
await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }) => {
    // Process message
    console.log('Processing:', message.value.toString());
    
    // Manually commit offset
    await consumer.commitOffsets([
      {
        topic: topic,
        partition: partition,
        offset: (parseInt(message.offset) + 1).toString()
      }
    ]);
  }
});
```

### Batch Processing

```javascript
await consumer.run({
  eachBatch: async ({ batch }) => {
    console.log(`Processing ${batch.messages.length} messages`);
    
    for (let message of batch.messages) {
      console.log('Message:', message.value.toString());
    }
  }
});
```

## Admin Operations

Manage topics and cluster configuration.

### Create Topic

```javascript
const admin = kafka.admin();

async function createTopic() {
  await admin.connect();
  
  await admin.createTopics({
    topics: [
      {
        topic: 'my-new-topic',
        numPartitions: 3,
        replicationFactor: 1
      }
    ]
  });
  
  console.log('Topic created');
  await admin.disconnect();
}
```

### List Topics

```javascript
async function listTopics() {
  await admin.connect();
  const topics = await admin.listTopics();
  console.log('Topics:', topics);
  await admin.disconnect();
}
```

### Delete Topic

```javascript
await admin.deleteTopics({
  topics: ['old-topic']
});
```

### Get Consumer Group Info

```javascript
const groups = await admin.listGroups();
console.log('Consumer groups:', groups);

const offsets = await admin.fetchOffsets({
  groupId: 'my-group',
  topics: ['my-topic']
});
console.log('Offsets:', offsets);
```

## Configuration

### Client Configuration

```javascript
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['broker1:9092', 'broker2:9092'],
  
  // Connection settings
  connectionTimeout: 10000,
  requestTimeout: 30000,
  
  // Retry settings
  retry: {
    retries: 5,
    initialRetryTime: 300
  }
});
```

### Producer Configuration

```javascript
const producer = kafka.producer({
  // Acknowledgment level
  acks: -1,  // 0=none, 1=leader, -1=all replicas
  
  // Compression
  compression: CompressionTypes.GZIP,
  
  // Idempotence for exactly-once
  idempotent: true,
  
  // Timeout
  timeout: 30000
});
```

### Consumer Configuration

```javascript
const consumer = kafka.consumer({
  groupId: 'my-group',
  
  // Session timeout
  sessionTimeout: 30000,
  
  // Auto commit
  autoCommit: true,
  autoCommitInterval: 5000,
  
  // Start from beginning or latest
  fromBeginning: false
});
```

### Security (SSL/SASL)

```javascript
const kafka = new Kafka({
  brokers: ['broker:9093'],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: 'my-username',
    password: 'my-password'
  }
});
```

## Best Practices

### 1. Error Handling

```javascript
// Producer error handling
try {
  await producer.send({ topic: 'my-topic', messages });
} catch (error) {
  console.error('Failed to send:', error);
  // Implement retry logic or alert
}

// Consumer error handling
consumer.on('consumer.crash', ({ error }) => {
  console.error('Consumer crashed:', error);
});
```

### 2. Graceful Shutdown

```javascript
const shutdown = async () => {
  await producer.disconnect();
  await consumer.disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

### 3. Message Keys

```javascript
// Use keys for partitioning
await producer.send({
  topic: 'orders',
  messages: [
    { 
      key: 'customer-123',  // Same key → same partition
      value: JSON.stringify(orderData)
    }
  ]
});
```

### 4. JSON Serialization

```javascript
// Producer
const data = { userId: 123, action: 'login' };
await producer.send({
  topic: 'events',
  messages: [{ value: JSON.stringify(data) }]
});

// Consumer
await consumer.run({
  eachMessage: async ({ message }) => {
    const data = JSON.parse(message.value.toString());
    console.log('Event:', data);
  }
});
```

### 5. Consumer Group Pattern

```javascript
// Multiple consumers in same group share work
const consumer1 = kafka.consumer({ groupId: 'processors' });
const consumer2 = kafka.consumer({ groupId: 'processors' });

// Both subscribe to same topic - partitions split between them
await consumer1.subscribe({ topic: 'tasks' });
await consumer2.subscribe({ topic: 'tasks' });
```

## Common Use Cases

### 1. Event Logging

```javascript
// Log events to Kafka
async function logEvent(event) {
  await producer.send({
    topic: 'application-logs',
    messages: [
      {
        value: JSON.stringify({
          timestamp: Date.now(),
          level: 'info',
          ...event
        })
      }
    ]
  });
}
```

### 2. Data Pipeline

```javascript
// Read from one topic, process, write to another
const inputConsumer = kafka.consumer({ groupId: 'pipeline' });
const outputProducer = kafka.producer();

await inputConsumer.subscribe({ topic: 'raw-data' });

await inputConsumer.run({
  eachMessage: async ({ message }) => {
    // Transform data
    const input = JSON.parse(message.value.toString());
    const output = transformData(input);
    
    // Send to output topic
    await outputProducer.send({
      topic: 'processed-data',
      messages: [{ value: JSON.stringify(output) }]
    });
  }
});
```

### 3. Real-time Analytics

```javascript
// Aggregate events in real-time
const stats = { total: 0, byUser: {} };

await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString());
    
    stats.total++;
    stats.byUser[event.userId] = (stats.byUser[event.userId] || 0) + 1;
    
    console.log('Stats:', stats);
  }
});
```

### 4. Microservices Communication

```javascript
// Service A publishes events
await producer.send({
  topic: 'order-created',
  messages: [
    { 
      key: orderId,
      value: JSON.stringify(orderData)
    }
  ]
});

// Service B subscribes to events
await consumer.subscribe({ topic: 'order-created' });
await consumer.run({
  eachMessage: async ({ message }) => {
    const order = JSON.parse(message.value.toString());
    await processOrder(order);
  }
});
```

### 5. Event Sourcing

```javascript
// Store all state changes as events
async function saveEvent(entityId, event) {
  await producer.send({
    topic: 'entity-events',
    messages: [
      {
        key: entityId,
        value: JSON.stringify({
          entityId,
          eventType: event.type,
          timestamp: Date.now(),
          data: event.data
        })
      }
    ]
  });
}

// Rebuild state from events
async function rebuildState(entityId) {
  const state = {};
  
  await consumer.subscribe({ topic: 'entity-events' });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.key.toString() === entityId) {
        const event = JSON.parse(message.value.toString());
        applyEvent(state, event);
      }
    }
  });
  
  return state;
}
```

## Quick Reference

### Producer
```javascript
const producer = kafka.producer();
await producer.connect();
await producer.send({ topic, messages });
await producer.disconnect();
```

### Consumer
```javascript
const consumer = kafka.consumer({ groupId });
await consumer.connect();
await consumer.subscribe({ topic });
await consumer.run({ eachMessage: async ({ message }) => {} });
await consumer.disconnect();
```

### Admin
```javascript
const admin = kafka.admin();
await admin.connect();
await admin.createTopics({ topics: [...] });
await admin.disconnect();
```

---

**Resources:**
- [KafkaJS Documentation](https://kafka.js.org/)
- [Apache Kafka Docs](https://kafka.apache.org/documentation/)
- [Kafka: The Definitive Guide](https://www.confluent.io/resources/kafka-the-definitive-guide/)
