# Docker — From Zero to Production Mental Model



---

## 1. Why Docker Exists (First Principles)

### The problem

* Code works on my machine
* Fails on another machine

Reasons:

* OS differences
* Library versions
* Environment variables
* System configuration

### Docker’s solution

* Package **app + dependencies + environment**
* Run the same way everywhere

> Docker = standardized execution environment

---

## 2. What Docker Is (and Is Not)

Docker is NOT:

* A virtual machine
* A full operating system

Docker IS:

* Process isolation using the **host OS kernel**
* Built on Linux features:

  * namespaces
  * cgroups

Result:

* Lightweight
* Fast startup
* Near-native performance

---

## 3. Container vs Virtual Machine

### Virtual Machine

```
Hardware
└── Host OS
    └── Hypervisor
        └── Guest OS
            └── App
```

* Heavy
* Slow boot
* Full OS per VM

### Docker Container

```
Hardware
└── Host OS (shared kernel)
    └── Docker Engine
        └── App + dependencies
```

* No guest OS
* Fast
* Small

---

## 4. What Is a Container

A container is:

* A **running process**
* With isolated:

  * filesystem
  * network
  * process tree

Important:

* Containers are ephemeral
* Delete container → data gone (unless volumes)

---

## 5. What Is an Image

An image is:

* Read-only template
* Blueprint for containers

Mental model:

* Image = class
* Container = object

Images are built using a **Dockerfile**

---

## 6. Docker Architecture (Execution Pipeline)

```
Docker CLI
   ↓
Docker Daemon (dockerd)
   ↓
containerd → runc → Linux kernel
```

### Docker CLI

* Command-line client
* Sends requests to daemon

### Docker Daemon (dockerd)

* Background service
* Manages images, containers, networks, volumes

### containerd

* Manages container lifecycle
* Used by Docker and Kubernetes

### runc

* Low-level runtime
* Creates isolated Linux processes

### Linux Kernel

* Enforces isolation and limits

> Containers are normal Linux processes with restrictions

---

## 7. What Is a Daemon

A daemon is a program that:

* Runs in the background
* Has no UI
* Starts at boot
* Listens for requests

Examples:

* dockerd
* sshd
* cron

Docker daemon:

* Keeps running even if CLI closes
* Startup impact is negligible

---

## 8. Linux Namespaces & cgroups

### Namespaces

* Isolate what a process can see
* PID, NET, MOUNT, USER

### cgroups (Control Groups)

* Limit what a process can use

Controls:

* CPU
* Memory
* Disk I/O

Docker example:

```bash
docker run --memory=512m --cpus=1 nginx
```

Mental model:

> namespaces isolate visibility, cgroups limit usage

---

## 9. Docker Isolation & Security

* Containers are isolated by default
* Malware inside container usually cannot affect host

Unsafe cases:

* `--privileged`
* Mounting host filesystem
* Running as root

Rule:

> Containers are safe unless you break isolation

---

## 10. Why Many Containers Instead of One (in Docker compose)

Benefits:

* Separation of concerns
* Independent scaling
* Fault isolation

Example:

* frontend
* backend
* database
* redis

---

## 11. Redis Without Docker

Possible:

* Install directly on OS

Why Docker is preferred:

* Zero setup
* Easy versioning
* Clean uninstall

---

## 12. SMTP & MailHog

### SMTP

* Protocol for sending emails

### MailHog

* Fake SMTP server
* Captures emails locally
* Used in development

---

## 13. Base Images Explained

### If you run

```bash
docker run node
```

Flow:

* Docker checks local images
* If not found:

  * pulls from Docker Hub
  * then runs container

Pull is automatic.

---

## 14. Which OS Does a Container Run On?

* Containers always use **host kernel**
* Base image provides filesystem + libraries

`node` image internally uses Debian or Alpine

---

## 15. Why Ubuntu Base Image Is Popular

Pros:

* Familiar
* Huge package ecosystem
* Easy debugging

Cons:

* Larger image size

Alternative:

* Alpine (smaller)

---

## 16. Core Docker Commands

```bash
docker --version
docker pull ubuntu
docker images
docker ps
docker ps -a
docker stop <id>
docker rm <id>
docker rmi <image>
```

---

## 17. docker run Essentials

### Interactive mode

```bash
docker run -it ubuntu bash
```

Flags:

* `-i` keep STDIN open
* `-t` allocate terminal

Without `-it`, shell exits immediately.

### Flag order does not matter

All valid:

```bash
docker run -it ubuntu bash
docker run ubuntu -it bash
docker run -i -t ubuntu bash
```

---

## 18. Container Lifecycle

* `docker run` → create + start
* `docker start` → start existing
* Main process exits → container stops

Detached mode:

```bash
docker run -d nginx
```

---

## 19. Dockerfile (Build vs Run)

### Build-time instructions

* FROM
* RUN
* COPY
* ADD

### Run-time instructions

* CMD
* ENTRYPOINT

> CMD / ENTRYPOINT run only when container starts

---

## 20. Docker Build Cache

* Each instruction = layer
* Layers are cached

Correct pattern:

```Dockerfile
COPY package.json package-lock.json ./
RUN npm install
COPY . .
```

Why:

* Code changes don’t invalidate dependency cache

---

## 21. Volumes

Persist data beyond container life:

```bash
docker run -v mydata:/data my-app
```

---

## 22. Networking & Ports

```bash
docker run -p 8080:3000 my-app
```

Meaning:

* Host 8080 → container 3000

---

## 23. process.env (Environment Variables)

* Provided by OS
* Accessible in Node.js via `process.env`

Sources:

* OS
* Docker `-e`
* Dockerfile `ENV`
* Cloud providers

Example:

```bash
docker run -e PORT=3000 my-app
```

Useful keys:

* PORT
* NODE_ENV
* DATABASE_URL
* REDIS_URL
* API_KEY

Rule:

> Never hardcode secrets

---

## 24. Docker Compose

Purpose:

* Run multiple containers together

Example:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
  redis:
    image: redis
```

Commands:

```bash
docker compose up
docker compose up -d
docker compose down
```

Mental model:

> Compose = docker run for systems

---

## 25. Docker Compose vs Kubernetes

| Feature      | Compose | Kubernetes |
| ------------ | ------- | ---------- |
| Machines     | 1       | Many       |
| Scaling      | Manual  | Automatic  |
| Self-healing | No      | Yes        |
| Production   | No      | Yes        |

Compose:

* Local dev

Kubernetes:

* Production orchestration

> Kubernetes is an operating system for containers

---

## 26. When Not to Use Docker

* Very small scripts
* Tight hardware access
* GUI-heavy apps




---

End of document
