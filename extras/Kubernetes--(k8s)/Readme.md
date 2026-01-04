# Kubernetes 

## 1. Introduction

### What is Container Orchestration?

**Container orchestration** is the automated process of managing the lifecycle of containers in large, dynamic environments. It handles:
- **Deployment**: Starting containers across multiple machines
- **Scaling**: Adding or removing container instances based on demand
- **Networking**: Connecting containers so they can communicate
- **Load balancing**: Distributing traffic across container instances
- **Self-healing**: Restarting failed containers automatically
- **Resource management**: Allocating CPU, memory, and storage efficiently

### What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications. It treats your infrastructure as a single computing resource and intelligently distributes workloads across it.

**Key capabilities:**
- Automatically places containers based on resource requirements
- Self-heals by restarting failed containers
- Scales applications up or down based on demand
- Performs rolling updates and rollbacks with zero downtime
- Manages configuration, secrets, and storage

## 2. History & Why Kubernetes Exists

- **Created by Google in 2014** and donated to the Cloud Native Computing Foundation (CNCF)
- **Inspired by Google's Borg system**, which managed billions of containers across Google's infrastructure
- **Problem it solves**: As microservices architectures grew, manually managing hundreds or thousands of containers across multiple servers became impossible
- **Modern necessity**: Applications now consist of dozens of microservices that need to communicate, scale independently, and recover from failures automatically

## 3. Core Concepts

### Containers

Lightweight, portable packages that include an application and all its dependencies (libraries, runtime, system tools). Containers share the host OS kernel, making them faster and more efficient than virtual machines. Examples: Docker, containerd, CRI-O.

### Pod

The **smallest deployable unit** in Kubernetes. A pod wraps one or more containers that share:
- Network namespace (same IP address)
- Storage volumes
- Lifecycle (started/stopped together)

**Use case**: Typically one container per pod, but multiple containers are used when they're tightly coupled (e.g., a web server + log collector sidecar).

### Node

A **worker machine** (physical or virtual) that runs pods. Each node contains:
- Container runtime (Docker, containerd)
- kubelet (agent that communicates with control plane)
- kube-proxy (handles networking)

**Types**: Master nodes (control plane) and worker nodes (run applications).

### Cluster

A **set of nodes** managed by Kubernetes. At minimum, a cluster has:
- At least one control plane node (manages the cluster)
- One or more worker nodes (run application workloads)

## 4. Kubernetes Architecture

### Control Plane Components

The "brain" of Kubernetes that makes global decisions about the cluster:

- **API Server**: The front-end for Kubernetes. All communication (kubectl, dashboards, other components) goes through it. It validates and processes REST requests.

- **Scheduler**: Watches for newly created pods with no assigned node and selects an optimal node based on resource requirements, constraints, and policies.

- **Controller Manager**: Runs controller processes that regulate the cluster state:
  - Node Controller: Monitors node health
  - Replication Controller: Maintains correct number of pods
  - Endpoints Controller: Populates service endpoints
  - Service Account Controller: Creates default accounts for namespaces

- **etcd**: A distributed key-value store that holds all cluster data (configuration, state, metadata). This is the single source of truth for the cluster.

### Worker Node Components

Components that run on every node to maintain running pods:

- **kubelet**: An agent that ensures containers are running in pods as specified. It communicates with the API server and manages pod lifecycle.

- **kube-proxy**: Maintains network rules on nodes, enabling communication to pods from inside or outside the cluster. Implements Kubernetes Service concept.

- **Container Runtime**: Software responsible for running containers (Docker, containerd, CRI-O).

## 5. How Kubernetes Works

**Basic workflow:**

1. **User writes a manifest** (YAML/JSON file) describing desired state (e.g., "run 3 replicas of my app")
2. **Submit to API Server** using kubectl or API call
3. **API Server validates** the request and stores it in etcd
4. **Scheduler watches** for unassigned pods and selects appropriate nodes based on resources and constraints
5. **Scheduler updates** API Server with node assignment
6. **kubelet on the selected node** sees the assignment, pulls container images, and creates the pod
7. **Containers start** and the application runs
8. **Controllers continuously monitor** actual state vs desired state and make corrections

**Example**: If a pod crashes, the controller notices the mismatch and creates a new pod to maintain the desired replica count.

## 6. Why Kubernetes Works

- **Declarative model**: You describe what you want (desired state), not how to do it. Kubernetes figures out the steps.

- **Self-healing**: Automatically replaces failed containers, reschedules pods from failed nodes, and kills unresponsive containers.

- **Horizontal scaling**: Easily scale applications up or down manually or automatically based on CPU/memory usage.

- **Service discovery & load balancing**: Kubernetes assigns DNS names and IPs to services and distributes traffic across healthy pods.

- **Automated rollouts & rollbacks**: Deploy new versions gradually with zero downtime. Automatically rollback if something breaks.

- **Resource optimization**: Efficiently packs containers onto nodes based on resource requirements.

## 7. Core Workload Resources

### Deployments

The most common way to run stateless applications. Manages ReplicaSets and provides declarative updates with:
- Rolling updates (gradual replacement of old pods)
- Rollback capability
- Scaling up/down

**Use case**: Web servers, APIs, microservices.

### ReplicaSets

Ensures a specified number of pod replicas are running at all times. Usually managed by Deployments, rarely used directly.

### StatefulSets

For stateful applications that need:
- Stable network identities (persistent pod names)
- Stable persistent storage
- Ordered deployment and scaling

**Use case**: Databases (MySQL, PostgreSQL), message queues (Kafka), distributed systems.

### DaemonSets

Ensures a copy of a pod runs on all (or specific) nodes. When nodes are added, pods are automatically added to them.

**Use case**: Log collectors, monitoring agents, network plugins running on every node.

### Jobs & CronJobs

- **Jobs**: Run pods to completion for batch processing tasks
- **CronJobs**: Run Jobs on a schedule (like Linux cron)

**Use case**: Database backups, data processing, periodic cleanup tasks.

## 8. Networking

### Pod Networking

Every pod gets its own IP address. Pods can communicate with each other directly without NAT, regardless of which node they're on. Implemented by Container Network Interface (CNI) plugins like Calico, Flannel, Weave.

### Services

Provides a stable endpoint (IP and DNS name) for accessing a group of pods. Traffic is load-balanced across healthy pods.

**Types:**
- **ClusterIP** (default): Internal-only access within the cluster
- **NodePort**: Exposes service on a static port on each node's IP
- **LoadBalancer**: Creates an external load balancer (cloud provider integration)
- **ExternalName**: Maps service to a DNS name

### Ingress

Manages external HTTP/HTTPS access to services in the cluster. Provides:
- Path-based routing (example.com/api → API service)
- Host-based routing (api.example.com → API service)
- SSL/TLS termination
- Load balancing

Requires an Ingress Controller (nginx, Traefik, HAProxy).

## 9. Storage

### Volumes

Storage attached to a pod that persists beyond container restarts. Types include:
- emptyDir: Temporary storage, deleted when pod is removed
- hostPath: Mounts directory from node's filesystem
- configMap/secret: Inject configuration as files
- Cloud volumes: AWS EBS, Azure Disk, GCE Persistent Disk

### Persistent Volumes (PV)

Cluster-level storage resource provisioned by an administrator or dynamically created. Independent of pod lifecycle.

### Persistent Volume Claims (PVC)

A request for storage by a user. Binds to an available PV that meets the requirements (size, access mode, storage class). Pods reference PVCs to use persistent storage.

**Workflow**: User creates PVC → Kubernetes finds matching PV → PVC binds to PV → Pod mounts PVC.

## 10. Configuration Management

### ConfigMaps

Store non-sensitive configuration data as key-value pairs. Can be consumed by pods as:
- Environment variables
- Command-line arguments
- Configuration files in volumes

**Use case**: Application settings, feature flags, connection strings (non-sensitive).

### Secrets

Similar to ConfigMaps but for sensitive data (passwords, tokens, keys). Data is base64-encoded and can be encrypted at rest. Should be used with RBAC to restrict access.

**Use case**: Database passwords, API keys, TLS certificates.

## 11. Scaling & Reliability

### Horizontal Pod Autoscaler (HPA)

Automatically scales the number of pod replicas based on:
- CPU utilization
- Memory usage
- Custom metrics (requests per second, queue length)

**Example**: Scale from 2 to 10 replicas when CPU usage exceeds 70%.

### Probes

Health checks to determine container status:

- **Liveness Probe**: Checks if container is running. If it fails, kubelet restarts the container.
- **Readiness Probe**: Checks if container is ready to serve traffic. If it fails, pod is removed from service endpoints.
- **Startup Probe**: Used for slow-starting containers. Disables liveness/readiness checks until startup succeeds.

### Self-Healing

Kubernetes automatically:
- Restarts failed containers
- Reschedules pods from failed nodes
- Kills containers that don't pass health checks
- Maintains desired replica count

## 12. Security

### RBAC (Role-Based Access Control)

Controls who can access which Kubernetes resources. Components:
- **Users/ServiceAccounts**: Identities
- **Roles/ClusterRoles**: Define permissions (verbs like get, list, create on resources)
- **RoleBindings/ClusterRoleBindings**: Bind roles to users

**Example**: Give user X permission to view pods in namespace Y but not delete them.

### Namespaces

Virtual clusters within a physical cluster. Provide:
- Resource isolation
- Logical separation of environments (dev, staging, prod)
- Resource quotas per namespace
- Access control boundaries

### Network Policies

Firewall rules for pod-to-pod communication. Define which pods can communicate with each other based on:
- Pod labels
- Namespaces
- IP blocks
- Ports

**Requires**: A CNI plugin that supports network policies (Calico, Cilium).

## 13. Key Interview Topics

### Kubernetes vs Docker

- **Docker**: A containerization platform for building and running containers
- **Kubernetes**: A container orchestration platform that manages Docker (or other) containers at scale
- **Relationship**: Kubernetes uses Docker (or alternatives) as its container runtime

### Pod vs Deployment

- **Pod**: Single instance of running container(s). Manual creation, no self-healing.
- **Deployment**: Manages multiple pod replicas, provides rolling updates, self-healing, and scaling.

### Service Types

- **ClusterIP**: Internal cluster access only
- **NodePort**: External access via node IP and static port
- **LoadBalancer**: Cloud load balancer with external IP
- **ExternalName**: DNS CNAME redirect to external service

### ConfigMaps vs Secrets

- **ConfigMaps**: Non-sensitive configuration (plain text)
- **Secrets**: Sensitive data (base64-encoded, optionally encrypted)
- Both can be mounted as volumes or environment variables

### Rolling Updates

Gradual replacement of old pod versions with new ones:
- Update a few pods at a time
- Verify new pods are healthy before continuing
- Zero downtime deployment
- Can rollback if issues detected

### Helm

A package manager for Kubernetes. Bundles Kubernetes manifests into reusable "charts" that can be versioned, shared, and configured with variables.

### etcd

The distributed database storing all cluster state. If etcd is lost, the cluster state is lost. Always backup etcd in production. Typically runs on control plane nodes.

### Ingress vs LoadBalancer

- **LoadBalancer**: Creates one cloud load balancer per service (expensive for many services)
- **Ingress**: Single entry point with intelligent routing to multiple services (cost-effective, more features)

## 14. Real-World Use Cases

### Microservices Architecture

Kubernetes excels at running and managing dozens or hundreds of microservices that need to:
- Scale independently
- Communicate efficiently
- Deploy without affecting others
- Self-heal on failures

### CI/CD Pipelines

Kubernetes integrates with Jenkins, GitLab CI, ArgoCD, and other tools to:
- Automate testing in isolated environments
- Deploy new versions with zero downtime
- Rollback bad deployments automatically
- Support blue-green and canary deployment strategies

### Cloud-Native Applications

Applications designed to run in dynamic cloud environments benefit from:
- Auto-scaling based on traffic
- Multi-cloud portability (run on AWS, Azure, GCP, or on-premises)
- Resilience through distributed architecture
- Cost optimization through efficient resource usage

### Batch Processing & ML Workloads

Using Jobs and CronJobs for:
- Data processing pipelines
- Machine learning training jobs
- ETL workflows
- Scheduled maintenance tasks

## 15. Getting Started

### Installation Options

- **minikube**: Single-node cluster for local development
- **kind** (Kubernetes in Docker): Multi-node local clusters using Docker
- **kubeadm**: Production-grade cluster setup on bare metal or VMs
- **Managed services**: EKS (AWS), GKE (Google Cloud), AKS (Azure)

### Prerequisites

- Linux, macOS, or Windows with WSL2
- Container runtime (Docker, containerd)
- kubectl CLI tool
- At least 2 CPUs and 2GB RAM for local development

### Basic kubectl Commands

```bash
kubectl get pods                    # List pods
kubectl get services               # List services
kubectl get deployments           # List deployments
kubectl describe pod <name>       # Detailed pod info
kubectl logs <pod-name>          # View container logs
kubectl apply -f manifest.yaml   # Create/update resources
kubectl delete pod <name>        # Delete a pod
kubectl scale deployment <name> --replicas=5  # Scale deployment
```

## 16. Conclusion

Kubernetes has become the de facto standard for container orchestration and the backbone of modern cloud infrastructure. It enables organizations to:
- Deploy applications faster and more reliably
- Scale efficiently to handle varying loads
- Reduce infrastructure costs through better resource utilization
- Build resilient systems that self-heal from failures
- Maintain portability across cloud providers

Whether running microservices, batch jobs, or machine learning workloads, Kubernetes provides the platform to build, deploy, and operate applications at any scale.
