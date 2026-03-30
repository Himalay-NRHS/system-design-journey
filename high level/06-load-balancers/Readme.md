# Comprehensive Guide to Load Balancers

## What is a Load Balancer?

A load balancer is a critical networking component that distributes incoming network traffic across multiple servers or resources. Think of it as a traffic controller at a busy intersection, intelligently directing vehicles (requests) to different roads (servers) to prevent any single road from becoming congested.

Load balancers sit between clients and backend servers, acting as a reverse proxy that receives requests and forwards them to available servers based on various algorithms and health checks.

## How Load Balancers Work

The fundamental workflow of a load balancer follows these steps:

1. **Client Request**: A user sends a request to access an application or service
2. **Load Balancer Reception**: The request hits the load balancer's IP address or DNS name
3. **Server Selection**: The load balancer chooses an appropriate backend server based on the configured algorithm
4. **Health Check Verification**: Ensures the selected server is healthy and responsive
5. **Request Forwarding**: The load balancer forwards the request to the chosen server
6. **Response Return**: The server processes the request and sends the response back through the load balancer to the client

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Load Balancer  │
                  └────┬───┬───┬───┘
                       │   │   │
           ┌───────────┘   │   └───────────┐
           ▼               ▼               ▼
      ┌────────┐      ┌────────┐      ┌────────┐
      │Server 1│      │Server 2│      │Server 3│
      └────────┘      └────────┘      └────────┘
```

## Why Use Load Balancers?

Load balancers provide numerous critical benefits for modern applications:

**Scalability**: Easily add or remove servers from the pool without disrupting service. As demand grows, simply add more servers behind the load balancer.

**High Availability**: If one server fails, the load balancer automatically routes traffic to healthy servers, ensuring continuous service availability.

**Performance Optimization**: Distributes requests efficiently to prevent any single server from being overwhelmed, reducing response times and improving user experience.

**Maintenance Flexibility**: Servers can be taken offline for maintenance or updates without affecting overall service availability.

**Geographic Distribution**: Route users to the nearest data center or server location for reduced latency.

**SSL Termination**: Load balancers can handle SSL/TLS encryption and decryption, offloading this computationally expensive task from backend servers.

**Security Layer**: Acts as an additional security boundary, hiding backend server details and providing DDoS protection.

## Static DNS of Load Balancers

When you deploy a load balancer, you typically receive a DNS name (like `my-load-balancer-123456.us-east-1.elb.amazonaws.com`) or can assign a static IP address. This DNS name becomes the single entry point for all client requests.

**DNS Resolution**: Clients resolve the load balancer's DNS name to one or more IP addresses. The load balancer's DNS can return multiple IP addresses for redundancy.

**Static IP Assignment**: Some load balancers support Elastic IPs or static IP addresses, which is useful when:
- Clients need to whitelist specific IP addresses
- Firewall rules require static IPs
- Compliance requirements mandate fixed endpoints

**DNS TTL Considerations**: The Time To Live (TTL) value determines how long DNS records are cached. Lower TTL values allow for faster failover but increase DNS query load.

**CNAME vs A Records**: Load balancers can be referenced using CNAME records (pointing to the load balancer's DNS name) or A records (pointing directly to IP addresses). CNAMEs offer more flexibility as the underlying IPs can change without updating DNS.

## Load Balancing Algorithms

### Round Robin

Round robin is the simplest load balancing algorithm that distributes requests sequentially across all available servers in rotation.

**How it works**: The load balancer maintains a list of servers and sends each new request to the next server in line. After reaching the last server, it cycles back to the first.

**Best for**: Environments where all servers have similar specifications and each request requires roughly the same processing power.

**Advantages**:
- Simple to implement and understand
- Equal distribution of requests across servers
- Low computational overhead
- No need to track server states beyond health checks

**Disadvantages**:
- Doesn't account for server capacity differences
- Ignores current server load or active connections
- May send requests to already busy servers
- Not ideal when requests have varying processing times

### Weighted Round Robin

An enhanced version of round robin that assigns a weight to each server based on its capacity or performance capabilities.

**How it works**: Servers with higher weights receive proportionally more requests. For example, if Server A has weight 3 and Server B has weight 1, Server A receives three requests for every one request sent to Server B.

**Best for**: Heterogeneous environments where servers have different specifications (CPU, memory, network capacity).

**Advantages**:
- Accounts for server capacity differences
- Flexible resource allocation based on hardware capabilities
- Can gradually introduce new servers with lower weights
- Useful for canary deployments and A/B testing

**Disadvantages**:
- Requires manual weight configuration and tuning
- Still doesn't consider real-time server load
- Weights may need frequent adjustment as load patterns change
- Can be complex to determine optimal weights

### Least Connections

This algorithm routes new requests to the server with the fewest active connections.

**How it works**: The load balancer tracks the number of active connections each server is handling and directs new requests to the server with the minimum count.

**Best for**: Applications where requests have varying durations, such as database connections, long-polling, WebSocket connections, or streaming services.

**Advantages**:
- Dynamically adapts to real-time server load
- Prevents overloading of servers with long-running connections
- More efficient for variable request durations
- Better resource utilization than round robin

**Disadvantages**:
- Higher computational overhead (must track connection counts)
- Connection count doesn't always reflect actual server load
- New servers receive a burst of connections initially
- May not work well with connection pooling or persistent connections

### Hash-Based Routing

Hash-based routing uses a hash function on specific request attributes (like IP address, session ID, or URL) to determine which server should handle the request.

**How it works**: The algorithm applies a hash function to a chosen attribute (source IP, cookie value, URL path) and uses the result to consistently map requests to the same server. The hash output is typically mapped to the server pool using modulo operation or consistent hashing.

**Best for**: Applications requiring session persistence or when you want to maximize cache hit rates by ensuring similar requests go to the same server.

**Advantages**:
- Ensures requests from the same client go to the same server (session affinity)
- Improves cache efficiency as similar requests hit the same server
- Useful for stateful applications
- Predictable routing behavior for troubleshooting

**Disadvantages**:
- Can lead to uneven distribution if hash keys aren't well-distributed
- Adding or removing servers disrupts existing mappings (unless using consistent hashing)
- Less flexible for dynamic scaling
- Server failure requires remapping affected sessions

#### Stickiness in Hash-Based Routing

**Session stickiness** (also called session affinity or sticky sessions) ensures that requests from the same client are always routed to the same backend server during a session. In hash-based routing, stickiness is achieved by hashing session identifiers like cookies or IP addresses.

**Cookie-based stickiness**: The load balancer generates a cookie (or uses an application cookie) to identify the session and ensure subsequent requests return to the same server. This is more reliable than IP-based stickiness as client IPs can change.

**Duration-based stickiness**: Stickiness can be time-limited, after which new requests might be routed to different servers. This helps balance load while maintaining session continuity.

**Stickiness trade-offs**: While stickiness helps with stateful applications, it can reduce the effectiveness of load balancing and create issues during server failures or deployments, as sessions tied to a failing server must be re-established.

## Comparing Load Balancing Algorithms

| Algorithm | Best Use Case | Distribution Fairness | Complexity | Session Persistence |
|-----------|--------------|----------------------|------------|---------------------|
| Round Robin | Homogeneous servers, stateless apps | High | Low | No |
| Weighted Round Robin | Mixed server capacities | Medium-High | Medium | No |
| Least Connections | Variable request durations | High | Medium-High | No |
| Hash-Based | Stateful apps, cache optimization | Low-Medium | Medium | Yes |

**Choosing the right algorithm**: Consider your application's characteristics. Use round robin for simple stateless applications with uniform servers. Opt for least connections when dealing with WebSockets or long-polling. Choose hash-based routing when session persistence is critical. Weighted variants help when server capacities differ significantly.

## Key Advantages of Load Balancers

**Horizontal Scalability**: Load balancers enable seamless horizontal scaling by allowing you to add more servers to handle increased traffic without modifying application code or client configurations.

**Fault Tolerance and High Availability**: Automatic health checks detect failed servers and redirect traffic to healthy instances, often achieving 99.99% uptime or higher.

**Zero-Downtime Deployments**: Deploy new application versions by gradually shifting traffic from old to new servers (blue-green or canary deployments) without service interruption.

**Global Server Load Balancing (GSLB)**: Distribute traffic across multiple geographic regions for reduced latency and disaster recovery capabilities.

**SSL/TLS Offloading**: Centralize certificate management and reduce computational load on backend servers by handling encryption at the load balancer level.

**DDoS Protection**: Load balancers can absorb and filter malicious traffic, protecting backend infrastructure from distributed denial-of-service attacks.

**Content-Based Routing**: Route requests to different server pools based on URL paths, HTTP headers, or request content (e.g., /api requests to API servers, /images to static content servers).

**Connection Multiplexing**: Maintain persistent connections with clients while efficiently managing backend server connections, reducing overhead.

## Scalability Using Load Balancers: Examples

### Example 1: E-commerce Platform During Holiday Sales

Consider an e-commerce site that normally handles 1,000 requests per second but expects 50,000 during Black Friday.

**Without load balancer**: A single powerful server might cost $10,000 and sit idle 99% of the year. It also represents a single point of failure.

**With load balancer**: Start with 5 servers handling normal traffic (200 requests each). During the sales event, automatically scale to 50 servers. After the event, scale back down. This approach:
- Reduces costs by 70-80% through efficient resource utilization
- Handles traffic spikes gracefully with auto-scaling
- Maintains availability even if multiple servers fail
- Allows rolling updates without downtime

### Example 2: SaaS Application with Global Users

A Software-as-a-Service platform serves users across North America, Europe, and Asia.

**Architecture with load balancers**:
```
Global DNS/CDN
       │
       ├─── US Load Balancer ──┬─── Server 1 (US-East)
       │                       ├─── Server 2 (US-East)
       │                       └─── Server 3 (US-West)
       │
       ├─── EU Load Balancer ──┬─── Server 4 (EU-West)
       │                       └─── Server 5 (EU-Central)
       │
       └─── Asia Load Balancer ─┬─── Server 6 (Asia-Pacific)
                                └─── Server 7 (Asia-Pacific)
```

Benefits:
- Users connect to their nearest region (latency reduced by 60-80%)
- Regional failures don't affect global availability
- Comply with data residency requirements
- Scale each region independently based on demand

### Example 3: Microservices Architecture

A modern application with multiple microservices (authentication, payment, inventory, notifications).

**Load balancer per service**:
- Authentication service: 3 servers with least connections (handles long-lived sessions)
- Payment service: 5 servers with weighted round robin (different processing capabilities)
- Inventory service: 4 servers with round robin (fast, stateless queries)
- Notification service: 2 servers with hash-based routing (maintains WebSocket connections)

Each service scales independently. If payments surge during a sale, only payment servers scale up. The load balancer ensures traffic is distributed optimally within each service.

## Availability Through Load Balancers

Load balancers dramatically improve application availability through several mechanisms:

**Active Health Checks**: Load balancers continuously monitor backend servers using:
- HTTP/HTTPS health check endpoints (e.g., GET /health returns 200 OK)
- TCP connection tests
- Custom health check scripts
- Typical check intervals: every 5-30 seconds

**Automatic Failover**: When a server fails health checks (usually after 2-3 consecutive failures), the load balancer immediately stops routing traffic to it. Recovery is automatic when the server passes health checks again.

**Multi-AZ and Multi-Region Deployments**: Distributing servers across multiple availability zones or regions protects against data center failures. AWS load balancers can route traffic across AZs seamlessly.

**Connection Draining**: When removing a server from the pool (for maintenance or scaling down), connection draining allows existing connections to complete gracefully (typically 300 seconds) before fully removing the server.

**Availability Calculations**: With a load balancer and multiple servers:
- Single server: 99.9% uptime = 8.76 hours downtime/year
- Load balancer + 2 servers: 99.99% uptime = 52 minutes downtime/year
- Load balancer + 3 servers across 2 AZs: 99.995% uptime = 26 minutes downtime/year

**Real-world availability scenarios**:
- Database failure: Load balancer detects failed database server within 15 seconds, redirects queries to replica
- Application crash: Server stops responding to health checks, removed from pool in under 30 seconds
- Planned maintenance: Gracefully drain connections, update server, return to pool with zero user impact

## AWS Load Balancers: Key Features and Insights

AWS offers three types of load balancers, each designed for different use cases:

### Application Load Balancer (ALB)
- Operates at Layer 7 (application layer) of the OSI model
- Best for HTTP/HTTPS traffic with advanced routing capabilities
- Supports WebSockets and HTTP/2
- Can route based on URL path, hostname, HTTP headers, and query parameters
- Integrates with AWS WAF for application-level security
- Native support for containerized applications (ECS, EKS)
- Slow start mode gradually increases traffic to new targets

### Network Load Balancer (NLB)
- Operates at Layer 4 (transport layer) for ultra-high performance
- Handles millions of requests per second with ultra-low latency
- Supports static IP addresses and Elastic IPs
- Preserves source IP addresses of clients
- Ideal for TCP/UDP traffic, gaming, IoT, and high-performance applications
- Can handle volatile workload patterns

### Gateway Load Balancer (GWLB)
- Designed for deploying third-party virtual appliances
- Operates at Layer 3 (network layer)
- Transparently routes traffic through security appliances (firewalls, IDS/IPS)
- Supports GENEVE protocol on port 6081
- Simplifies scaling of virtual appliances

### Interesting AWS Load Balancer Features (optional)

**Cross-Zone Load Balancing**: Distributes traffic evenly across all registered targets in all enabled availability zones. Without this, traffic is distributed only among targets in the same AZ as the load balancer node.

**Desync Mitigation Mode**: Protects against HTTP desync attacks by controlling how the load balancer handles malformed requests. Modes include monitor, defensive, and strictest.

**Least Outstanding Requests**: ALB routing algorithm that sends requests to the target with the lowest number of outstanding (in-flight) requests, better than least connections for HTTP.

**Lambda Target Support**: ALBs can invoke AWS Lambda functions directly, enabling serverless architectures without managing servers at all.

**Fixed Response Actions**: ALBs can return custom fixed responses (like custom error pages) without routing to a target.

**Redirect Actions**: Automatically redirect HTTP to HTTPS or redirect old URLs to new ones at the load balancer level.

**Authentication Integration**: ALBs can authenticate users through Amazon Cognito or any OpenID Connect (OIDC) compliant identity provider before routing requests.

**Request Tracing**: ALBs add a unique trace ID to each request, making it easy to track requests through distributed systems.

**Host-Based and Path-Based Routing**: Route different domains or URL paths to different target groups (e.g., api.example.com to API servers, www.example.com to web servers, /images/* to image servers).

## AWS Load Balancer Configuration Settings

### Basic Configuration Settings

**Name**: Identifier for your load balancer. Must be unique within your account per region. Naming convention matters for organization and automation.

**Scheme**: 
- **Internet-facing**: Load balancer has a public DNS name and routes requests from clients over the internet. Nodes have public IP addresses.
- **Internal**: Load balancer has private IP addresses only, used for routing traffic within your VPC. Ideal for internal microservices communication.

**IP Address Type**:
- **IPv4**: Standard IP addressing
- **Dualstack**: Supports both IPv4 and IPv6, automatically assigning both types of addresses to the load balancer

**VPC**: The Virtual Private Cloud where your load balancer will be deployed. Must be the same VPC as your target instances or containers.

**Availability Zones and Subnets**: Select at least two subnets in different availability zones for high availability. The load balancer creates a load balancer node in each selected subnet.

**Security Groups** (ALB/GWLB only): Control inbound and outbound traffic to the load balancer. Typically allow inbound on ports 80 (HTTP) and 443 (HTTPS) from 0.0.0.0/0, and outbound to target security groups.

### Listener Configuration

**Listeners**: Define what ports and protocols the load balancer accepts traffic on. Each listener has:

**Port**: The port number to listen on (e.g., 80 for HTTP, 443 for HTTPS, custom ports)

**Protocol**:
- **HTTP**: For unencrypted web traffic
- **HTTPS**: For encrypted web traffic (requires SSL certificate)
- **TCP**: For network-level load balancing (NLB)
- **TLS**: For encrypted TCP traffic (NLB)
- **UDP**: For UDP traffic (NLB)
- **TCP_UDP**: For protocols that use both TCP and UDP (NLB)
- **GENEVE**: For Gateway Load Balancers

**Default Actions**: What the load balancer does when a request matches the listener:
- **Forward**: Send to target group
- **Redirect**: Redirect to different URL or protocol
- **Fixed Response**: Return a static response
- **Authenticate**: Authenticate with Cognito or OIDC before forwarding

**SSL/TLS Certificates** (HTTPS/TLS listeners):
- Certificate sources: AWS Certificate Manager (ACM), IAM certificate store
- Multiple certificates per listener using SNI (Server Name Indication)
- Default certificate for requests that don't match any SNI certificate

**Security Policy** (HTTPS/TLS): Defines SSL/TLS protocols and ciphers:
- **ELBSecurityPolicy-TLS13-1-2-2021-06**: Recommended policy supporting TLS 1.3 and TLS 1.2
- **ELBSecurityPolicy-2016-08**: Backward compatible policy supporting older TLS versions
- **ELBSecurityPolicy-FS-1-2-Res-2020-10**: Forward secrecy enabled, only TLS 1.2+
- Custom policies for specific compliance requirements

**ALPN Policies** (TLS listeners on NLB): Application-Layer Protocol Negotiation for selecting application protocol:
- HTTP1Only
- HTTP2Only
- HTTP2Optional
- HTTP2Preferred
- None

### Target Group Configuration

**Target Type**:
- **Instance**: Register EC2 instances as targets using instance IDs
- **IP**: Register targets by IP address (can be outside VPC, in peered VPCs, or on-premises)
- **Lambda**: Register Lambda function as a target (ALB only)
- **ALB**: Register an ALB as a target (NLB only, for chaining load balancers)

**Protocol and Port**: The protocol and port the load balancer uses to route traffic to targets
- Common combinations: HTTP:80, HTTPS:443, TCP:any

**Protocol Version** (ALB):
- **HTTP1**: Standard HTTP/1.1
- **HTTP2**: For improved performance with multiplexing
- **gRPC**: For gRPC microservices communication

**VPC**: Must match the VPC of your load balancer (except for IP targets outside VPC)

**Health Check Settings**:

**Health Check Protocol**: Protocol for health checks (HTTP, HTTPS, TCP)

**Health Check Path** (HTTP/HTTPS): The URL path to ping (e.g., /health, /ping, /)

**Health Check Port**:
- **Traffic port**: Use the same port as the target receives traffic on
- **Override**: Specify a different port for health checks

**Healthy Threshold**: Number of consecutive successful health checks required before marking target healthy (default: 5 for ALB, 3 for NLB)

**Unhealthy Threshold**: Number of consecutive failed health checks before marking target unhealthy (default: 2)

**Timeout**: Time to wait for a health check response before considering it failed (2-120 seconds)

**Interval**: Time between health checks (5-300 seconds)

**Success Codes** (HTTP/HTTPS): Expected HTTP status codes for successful health checks (e.g., 200, 200-299, 200,201,202)

**Advanced Health Check Settings**:

**Matcher** (gRPC): Expected gRPC response codes (0-99)

**Health Check Enabled**: Can disable health checks (all targets considered healthy)

### Target Group Attributes

**Deregistration Delay** (Connection Draining): Time to wait for in-flight requests to complete before deregistering a target (0-3600 seconds, default: 300). During this time, the target is in "draining" state.

**Slow Start Duration**: Time period during which the load balancer linearly increases the number of requests sent to a newly registered target (30-900 seconds, default: 0/disabled). Helps new targets warm up caches and connection pools.

**Load Balancing Algorithm**:
- **Round Robin**: Distributes requests evenly across targets in rotation
- **Least Outstanding Requests**: Routes to target with fewest in-flight requests (HTTP/HTTPS only)

**Stickiness** (Session Affinity):
- **Enabled/Disabled**: Whether to use sticky sessions
- **Stickiness Type**:
  - **Load balancer generated cookie**: ALB generates a cookie (AWSALB) to track sessions
  - **Application-based cookie**: Uses an application-generated cookie or custom name
- **Stickiness Duration**: How long the cookie is valid (1 second - 7 days)
- **Cookie Name** (application-based): Name of the application cookie or custom cookie

**HTTP2 Enabled** (ALB): Whether to enable HTTP/2 for target group

**Preserve Client IP**:
- **Enabled**: Source IP is preserved (NLB default behavior)
- **Disabled**: Source IP is the load balancer's private IP

**Proxy Protocol v2** (NLB): Prepends connection information (source IP, destination IP, port numbers) to the TCP data sent to targets

### Advanced Load Balancer Attributes

**Deletion Protection**: Prevents accidental deletion of the load balancer

**Cross-Zone Load Balancing**:
- **Enabled**: Distributes traffic evenly across all targets in all enabled AZs (ALB default: enabled, NLB default: disabled)
- **Disabled**: Distributes traffic only to targets in the same AZ as the load balancer node
- **Note**: Cross-zone load balancing on NLB incurs inter-AZ data transfer charges

**Access Logs**:
- **Enabled**: Stores detailed information about requests sent to your load balancer in S3
- **S3 Bucket**: Destination bucket for logs
- **S3 Prefix**: Optional prefix for organizing logs
- Log information includes: timestamps, client IPs, latencies, request paths, server responses, SSL cipher, SSL protocol

**Drop Invalid Header Fields** (ALB): Whether to remove HTTP headers with invalid characters before routing to targets

**Desync Mitigation Mode** (ALB): Protection level against HTTP desync attacks
- **Monitor**: Allows all requests but logs suspicious ones (CloudWatch metrics)
- **Defensive**: Blocks requests that don't comply with RFC 7230 (default)
- **Strictest**: Applies additional protections, may block some legitimate requests

**HTTP/2 Support** (ALB): Enable or disable HTTP/2 protocol support

**WebSockets Support** (ALB): Automatically enabled, allows persistent connections

**Idle Timeout** (ALB): Time in seconds that a connection is allowed to be idle before closed (1-4000 seconds, default: 60)

**Client Keep Alive** (NLB): TCP keep-alive time in seconds (60-31536000)

### Routing and Rules

**Listener Rules** (ALB): Define routing behavior based on request attributes. Rules are processed in priority order.

**Rule Priority**: Order in which rules are evaluated (1-50000). Lower numbers are evaluated first.

**Conditions**: When the rule matches
- **Host header**: Route based on domain name (e.g., api.example.com)
- **Path**: Route based on URL path (e.g., /api/*, /images/*)
- **HTTP header**: Route based on any HTTP header value
- **HTTP request method**: Route based on GET, POST, PUT, etc.
- **Query string**: Route based on query parameters
- **Source IP**: Route based on client IP address or CIDR block

**Actions**: What to do when conditions match
- **Forward to target group**: Send traffic to specified target group
- **Forward to multiple target groups**: Distribute traffic across multiple groups with weights
- **Redirect**: Redirect to different URL (change protocol, host, path, port, query)
- **Return fixed response**: Return custom HTTP response (status code and optional body)
- **Authenticate with Cognito**: Authenticate users via Amazon Cognito user pool
- **Authenticate with OIDC**: Authenticate via OpenID Connect compliant identity provider

**Default Rule**: Catch-all rule when no other rules match (typically forwards to primary target group)

### Monitoring and Tags

**CloudWatch Metrics**: Automatically published metrics including:
- **Request Count**: Total number of requests
- **Active Connection Count**: Number of concurrent connections
- **New Connection Count**: Number of new connections established
- **Target Response Time**: Time for targets to respond
- **Healthy/Unhealthy Host Count**: Number of healthy and unhealthy targets
- **HTTP Response Codes**: 2xx, 3xx, 4xx, 5xx status code counts
- **Processed Bytes**: Total bytes processed by the load balancer
- **ConsumedLCUs**: Load Balancer Capacity Units consumed (for billing)

**Access Logs**: Detailed request-level logs stored in S3 (optional, must be enabled)

**Request Tracing** (ALB): X-Amzn-Trace-Id header added to each request for distributed tracing

**Tags**: Key-value pairs for organization, cost allocation, and automation
- Used for: billing reports, resource grouping, access control, automation scripts
- Maximum 50 tags per resource
- Common tags: Environment (prod/staging), Application, Owner, CostCenter

### Auto Scaling Integration

**Target Tracking Policies**: Automatically scale target group capacity based on metrics
- **ALBRequestCountPerTarget**: Maintain specific request rate per target
- **Custom metrics**: CPU utilization, memory, custom application metrics

**Scheduled Scaling**: Scale capacity at specific times (e.g., before known traffic spikes)

**Predictive Scaling**: Uses machine learning to predict traffic patterns and scale proactively

### Network and Security Settings

**WAF Integration** (ALB): Associate AWS WAF web ACL for application-layer protection:
- SQL injection protection
- Cross-site scripting (XSS) protection
- Rate limiting
- IP allow/deny lists
- Geographic restrictions

**AWS Shield Integration**: Automatic DDoS protection
- **Standard**: Automatic protection against common attacks (included)
- **Advanced**: Enhanced DDoS protection with 24/7 DDoS response team (additional cost)

**Connection Settings**:

**Client Timeout** (NLB): Time allowed for client to send data after connection established (1-3600 seconds)

**TCP Reset**: Send TCP RST packet when closing connections (instead of FIN)

**Flow Timeout** (GWLB): Time idle flows are maintained (60-7200 seconds)

### Integration Settings

**Elastic IPs** (NLB): Assign static Elastic IPs to each subnet for whitelisting purposes

**Private IP Addresses**: Specify custom private IPs for internal load balancers

**AWS Global Accelerator**: Route traffic through AWS global network for improved performance and availability

**AWS PrivateLink**: Expose services privately to other VPCs without internet gateway, NAT, or VPC peering

**AWS Transit Gateway**: Connect load balancers across multiple VPCs and on-premises networks

**Route 53 Integration**: Use Route 53 DNS with health checks to route traffic to load balancers based on health and geography

### Cost Optimization Settings

**Capacity Units**: ALB and NLB pricing based on Load Balancer Capacity Units (LCUs):
- **New connections**: Number per second
- **Active connections**: Concurrent connections
- **Processed bytes**: Throughput in MB
- **Rule evaluations**: For ALBs (per second)
- Billed on dimension with highest usage

**Resource Optimization**:
- Remove unused load balancers
- Use cross-zone load balancing strategically (NLB incurs inter-AZ charges)
- Right-size target groups based on actual traffic patterns
- Use scheduled scaling to reduce capacity during low-traffic periods

This comprehensive configuration guide covers the extensive settings available for AWS load balancers, allowing you to fine-tune performance, security, availability, and cost optimization for your specific application requirements.