# Circuit Breakers: A Complete Guide

## What are Circuit Breakers?

A circuit breaker is a design pattern used in distributed systems to prevent cascading failures. Just like an electrical circuit breaker that stops electricity flow when there's an overload, a software circuit breaker monitors for failures and stops calling a failing service temporarily to give it time to recover.

## Understanding Cascading Failures

Cascading failures occur when a failure in one part of a system triggers failures in other parts, creating a domino effect that can bring down an entire system.

### How Cascading Failures Happen

Consider this scenario: Service A depends on Service B, which depends on Service C. When Service C becomes slow or unresponsive, Service B's threads get blocked waiting for responses. As more requests pile up, Service B runs out of resources. Now Service A starts experiencing timeouts from Service B, and its threads get blocked too. Soon, the entire system grinds to a halt, even though only one service initially failed.

The problem compounds because each service keeps trying to call the failing dependency, wasting resources that could be used for other operations. This creates a feedback loop where the situation gets progressively worse.

## Why Use Circuit Breakers?

Circuit breakers provide several critical benefits:

**Prevent Resource Exhaustion**: Stop your service from wasting threads, connections, and memory waiting for a service that's already down.

**Fail Fast**: Return errors immediately instead of making users wait for timeouts, improving user experience.

**System Stability**: Protect your entire system from cascading failures by isolating problems.

**Recovery Time**: Give failing services breathing room to recover without being bombarded with requests.

**Monitoring and Alerting**: Circuit breaker state changes provide clear signals for monitoring and alerting systems.

## Circuit Breaker States

A circuit breaker operates in three states:

**Closed State**: Everything is working normally. Requests pass through to the service. The circuit breaker monitors for failures and tracks success/failure rates.

**Open State**: The failure threshold has been exceeded. The circuit breaker immediately returns errors without attempting to call the service. This state lasts for a configured timeout period.

**Half-Open State**: After the timeout expires, the circuit breaker allows a limited number of test requests through. If these succeed, it transitions back to Closed. If they fail, it returns to Open.

## How to Use Circuit Breakers

### Basic Implementation Pattern

```python
# Conceptual example
circuit_breaker = CircuitBreaker(
    failure_threshold=5,      # Open after 5 failures
    timeout=60,               # Stay open for 60 seconds
    expected_exception=ServiceException
)

@circuit_breaker
def call_external_service():
    return external_api.get_data()
```

### Configuration Parameters

**Failure Threshold**: How many failures before opening the circuit (e.g., 5 consecutive failures or 50% failure rate over 10 requests).

**Timeout Duration**: How long to keep the circuit open before trying again (e.g., 30-60 seconds).

**Success Threshold**: In half-open state, how many successful requests needed to close the circuit (e.g., 2-3 successes).

**Rolling Window**: Time window for calculating failure rates (e.g., last 10 seconds or last 20 requests).

## Where to Use Circuit Breakers

Circuit breakers should be implemented at boundaries between systems:

**External API Calls**: Third-party services, payment gateways, social media APIs.

**Microservice Communication**: Between your own services in a distributed architecture.

**Database Connections**: Especially for non-critical reads or secondary databases.

**Cache Systems**: When calling distributed cache servers like Redis or Memcached.

**Message Queue Operations**: When publishing to or consuming from message brokers.

**File Storage Services**: Cloud storage like S3, Azure Blob, or Google Cloud Storage.

Essentially, use circuit breakers anywhere a remote call could fail or become slow, impacting your system's stability.

## Why Circuit Breakers are Important

In modern distributed systems, failures are inevitable. Network issues, service overloads, deployments, and hardware problems all cause temporary outages. Without circuit breakers, a single failing dependency can bring down your entire system through cascading failures.

Circuit breakers provide a crucial defense mechanism that allows systems to degrade gracefully rather than fail catastrophically. They're particularly important in microservices architectures where services have many dependencies and failure in one can quickly spread to others.

## Circuit Breaker Implementation with Caching

One powerful pattern is combining circuit breakers with caching to improve resilience. When a service becomes unavailable, you can serve stale cached data instead of failing completely.

### Implementation Example with Cache Fallback

```python
import time
from enum import Enum
from typing import Optional, Callable, Any
import hashlib
import json

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CachedCircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: int = 60,
        half_open_attempts: int = 3,
        cache_ttl: int = 300,  # Cache valid for 5 minutes
        stale_cache_ttl: int = 3600  # Serve stale cache for up to 1 hour
    ):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.half_open_attempts = half_open_attempts
        self.cache_ttl = cache_ttl
        self.stale_cache_ttl = stale_cache_ttl
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.half_open_success_count = 0
        
        # Simple in-memory cache (use Redis in production)
        self.cache = {}
    
    def _get_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate cache key from function name and arguments"""
        key_data = {
            'func': func_name,
            'args': args,
            'kwargs': kwargs
        }
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_cached_value(self, cache_key: str) -> Optional[tuple]:
        """Get cached value if available and not too stale"""
        if cache_key in self.cache:
            value, timestamp = self.cache[cache_key]
            age = time.time() - timestamp
            
            # Return fresh cache
            if age < self.cache_ttl:
                return ('fresh', value)
            
            # Return stale cache if within stale threshold
            if age < self.stale_cache_ttl:
                return ('stale', value)
        
        return None
    
    def _update_cache(self, cache_key: str, value: Any):
        """Update cache with new value"""
        self.cache[cache_key] = (value, time.time())
    
    def _should_attempt_call(self) -> bool:
        """Determine if we should attempt to call the service"""
        if self.state == CircuitState.CLOSED:
            return True
        
        if self.state == CircuitState.OPEN:
            # Check if timeout has expired
            if time.time() - self.last_failure_time >= self.timeout:
                self.state = CircuitState.HALF_OPEN
                self.half_open_success_count = 0
                return True
            return False
        
        # Half-open state: allow limited attempts
        return True
    
    def _record_success(self):
        """Record successful call"""
        if self.state == CircuitState.HALF_OPEN:
            self.half_open_success_count += 1
            if self.half_open_success_count >= self.half_open_attempts:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
        elif self.state == CircuitState.CLOSED:
            self.failure_count = 0
    
    def _record_failure(self):
        """Record failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
        elif self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker and cache fallback"""
        cache_key = self._get_cache_key(func.__name__, args, kwargs)
        
        # Try to get cached value
        cached = self._get_cached_value(cache_key)
        
        # Check if we should attempt the call
        if not self._should_attempt_call():
            print(f"Circuit is OPEN, serving from cache")
            if cached:
                return cached[1]  # Return cached value
            raise Exception("Circuit breaker is open and no cache available")
        
        # Attempt the call
        try:
            result = func(*args, **kwargs)
            self._record_success()
            self._update_cache(cache_key, result)
            print(f"Call succeeded, state: {self.state.value}")
            return result
            
        except Exception as e:
            self._record_failure()
            print(f"Call failed, state: {self.state.value}, failures: {self.failure_count}")
            
            # Try to serve from cache (even stale)
            if cached:
                cache_age, value = cached
                print(f"Serving {cache_age} cached data due to failure")
                return value
            
            # No cache available, propagate error
            raise e

# Example usage
def fetch_user_data(user_id: int):
    """Simulated external API call"""
    import random
    if random.random() < 0.3:  # 30% failure rate
        raise Exception("Service unavailable")
    return {"id": user_id, "name": f"User {user_id}", "email": f"user{user_id}@example.com"}

# Create circuit breaker with cache
cb = CachedCircuitBreaker(
    failure_threshold=3,
    timeout=10,
    cache_ttl=60,
    stale_cache_ttl=300
)

# Use the circuit breaker
for i in range(10):
    try:
        user = cb.call(fetch_user_data, user_id=123)
        print(f"Retrieved user: {user}")
    except Exception as e:
        print(f"Failed to get user: {e}")
    time.sleep(1)
```

### Redis-Based Circuit Breaker Implementation

For production systems, use a distributed cache like Redis:

```python
import redis
import json
from typing import Optional

class RedisCircuitBreaker:
    def __init__(self, redis_client: redis.Redis, service_name: str):
        self.redis = redis_client
        self.service_name = service_name
        self.state_key = f"cb:{service_name}:state"
        self.failure_key = f"cb:{service_name}:failures"
        self.cache_prefix = f"cb:{service_name}:cache:"
        
        self.failure_threshold = 5
        self.timeout = 60
        self.cache_ttl = 300
    
    def get_state(self) -> str:
        """Get current circuit breaker state"""
        state = self.redis.get(self.state_key)
        return state.decode() if state else 'closed'
    
    def open_circuit(self):
        """Open the circuit"""
        self.redis.setex(self.state_key, self.timeout, 'open')
    
    def close_circuit(self):
        """Close the circuit"""
        self.redis.delete(self.state_key)
        self.redis.delete(self.failure_key)
    
    def record_failure(self):
        """Record a failure"""
        failures = self.redis.incr(self.failure_key)
        self.redis.expire(self.failure_key, self.timeout)
        
        if failures >= self.failure_threshold:
            self.open_circuit()
    
    def get_cached(self, key: str) -> Optional[dict]:
        """Get cached response"""
        cache_key = f"{self.cache_prefix}{key}"
        data = self.redis.get(cache_key)
        return json.loads(data) if data else None
    
    def set_cache(self, key: str, value: dict):
        """Cache response"""
        cache_key = f"{self.cache_prefix}{key}"
        self.redis.setex(
            cache_key,
            self.cache_ttl,
            json.dumps(value)
        )
    
    def call(self, func, cache_key: str, *args, **kwargs):
        """Execute with circuit breaker protection"""
        state = self.get_state()
        
        if state == 'open':
            # Try cache first
            cached = self.get_cached(cache_key)
            if cached:
                return cached
            raise Exception(f"Circuit breaker open for {self.service_name}")
        
        try:
            result = func(*args, **kwargs)
            self.set_cache(cache_key, result)
            return result
        except Exception as e:
            self.record_failure()
            
            # Fallback to cache
            cached = self.get_cached(cache_key)
            if cached:
                return cached
            raise e
```

## Popular Circuit Breaker Libraries

### Python
- **pybreaker**: Simple circuit breaker implementation
- **circuitbreaker**: Decorator-based circuit breaker
- **tenacity**: Retry and circuit breaker library

### Java
- **Resilience4j**: Modern fault tolerance library
- **Hystrix**: Netflix's latency and fault tolerance library (maintenance mode)

### JavaScript/Node.js
- **opossum**: Circuit breaker for Node.js
- **cockatiel**: Resilience and transient-fault-handling library

### Go
- **gobreaker**: Circuit breaker pattern implementation
- **go-resiliency**: Set of resilience patterns including circuit breakers

## Best Practices

**Start Conservative**: Begin with higher thresholds and adjust based on monitoring data.

**Monitor Circuit Breaker State**: Track state transitions and alert on circuits that stay open too long.

**Implement Fallbacks**: Always have a fallback strategy, whether it's cached data, default values, or degraded functionality.

**Use Bulkheads**: Combine circuit breakers with thread pool isolation to prevent one failing service from consuming all resources.

**Test Circuit Breakers**: Include chaos engineering tests to verify circuit breakers work under failure conditions.

**Set Appropriate Timeouts**: Circuit breaker timeout should be longer than request timeouts but short enough for quick recovery.

**Log State Changes**: Log every state transition for debugging and analysis.

**Different Thresholds for Different Services**: Critical services might need lower thresholds than optional features.

## Conclusion

Circuit breakers are essential for building resilient distributed systems. By preventing cascading failures, enabling fast failure, and providing recovery time for struggling services, they help maintain system stability even when individual components fail. Combined with caching strategies, circuit breakers can ensure your application continues serving users even during partial outages, making them a critical pattern for any production system.