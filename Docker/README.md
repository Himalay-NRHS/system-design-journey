# Docker — From Zero to Working Mental Model



## 1. Why Docker Exists (First Principles)

### The core problem

* Software runs fine on **my laptop**
* Breaks on **your laptop / server / cloud**

Reasons:

* Different OS versions
* Different libraries
* Different environment variables
* Different system configs

### Old solution (bad)

* Manually install everything
* Write long setup docs
* Still breaks

### Docker solution

* Package **app + dependencies + environment** together
* Run the same way **everywhere**

> Docker = **standardized execution environment**

---

## 2. What Docker Actually Is

Docker is **NOT**:

* A virtual machine
* A full operating system

Docker **IS**:

* Process isolation using the **host OS kernel**
* Uses Linux features:

  * namespaces (isolation)
  * cgroups (resource limits)

Result:

* Lightweight
* Fast startup
* Near‑native performance

---

## 3. Docker vs Virtual Machine (Mental Model)

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

### Docker

```
Hardware
└── Host OS (kernel shared)
    └── Docker Engine
        └── App + dependencies
```

* No guest OS
* Fast
* Small

---

## 4. What Is a Container

A **container** is:

* A running process
* With isolated:

  * filesystem
  * network
  * process tree

Key points:

* Containers are **ephemeral**
* Delete container → data gone (unless volumes)

---

## 5. What Is an Image

An **image** is:

* Read‑only template
* Blueprint for containers

Think:

* Image = class
* Container = object

Images are built using a **Dockerfile**

---

## 6. Docker Engine Architecture

```
Docker CLI
   ↓
Docker Daemon (dockerd)
   ↓
containerd → runc → Linux kernel
```

### Docker Daemon

* Background service
* Manages images, containers, networks

### Daemon impact on startup time

* Yes, daemon starts on boot
* Lightweight
* Negligible impact on Windows startup

---

## 7. What Is a Daemon

A **daemon**:

* Background service
* No UI
* Starts with OS

Examples:

* dockerd
* sshd
* cron

Docker daemon:

* Listens for Docker CLI commands
* Creates containers

---

## 8. Docker Isolation & Security

### How Docker achieves isolation

* **Namespaces**:

  * PID namespace → process isolation
  * NET namespace → network isolation
  * MOUNT namespace → filesystem isolation

* **cgroups**:

  * CPU limits
  * Memory limits

### Malware question

> If I download malware inside a container, will it affect Windows?

Answer:

* Normally **NO**
* Container is isolated
* Malware stays inside container

Exception:

* If container runs:

  * `--privileged`
  * root user
  * mounted host filesystem

Rule:

> Containers are safe **if you don’t punch holes** in isolation

---

## 9. Why Containers Instead of One Big App

Reasons:

* Separation of concerns
* Independent scaling
* Independent failure

Example:

* frontend container
* backend container
* database container
* redis container

If one crashes → others live

---

## 10. Redis Without Docker (Alternative Way)

Redis can be used without Docker by:

* Installing directly on OS
* Running as system service

Why Docker is preferred:

* Zero config
* Easy version control
* No OS pollution

---

## 11. What Is MailHog

MailHog = **fake SMTP server**

Purpose:

* Catch emails locally
* No real emails sent

Used in development to:

* Test email flows
* Debug email content

---

## 12. What Is SMTP

SMTP = Simple Mail Transfer Protocol

Used for:

* Sending emails

Flow:

```
App → SMTP Server → Recipient Inbox
```

MailHog replaces real SMTP during dev

---

## 13. Docker Base Images (Important Concept)

### Question you asked

> If I select node as base image, which OS does container run on?

Answer:

* Container always runs on **host kernel**
* Base image only provides:

  * filesystem
  * libraries

`node` image internally is usually based on:

* Debian
* Alpine

---

## 14. Why People Choose Ubuntu as Base Image

Reasons:

* Familiar
* Large package ecosystem
* Easy debugging

Downside:

* Larger image size

Alternative:

* Alpine (smaller, faster)

---

## 15. Basic Docker Commands (Must‑Know)

### Check installation

```bash
docker --version
```

### Pull image

```bash
docker pull ubuntu
```

### List images

```bash
docker images
```

### Run container

```bash
docker run ubuntu
```

### Run interactive shell

```bash
docker run -it ubuntu bash
```

### List running containers

```bash
docker ps
```

### List all containers

```bash
docker ps -a
```

### Stop container

```bash
docker stop <id>
```

### Remove container

```bash
docker rm <id>
```

### Remove image

```bash
docker rmi <image>
```

---

## 16. Dockerfile (From Absolute Basics)

A Dockerfile is a **recipe**

### Common instructions

* `FROM` → base image
* `RUN` → execute command
* `WORKDIR` → set working directory
* `COPY` → copy files
* `CMD` → default command

---

## 17. Dockerfile: Ubuntu → Node → App

```Dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "index.js"]
```

---

## 18. Build and Run Your Image

### Build

```bash
docker build -t my-node-app .
```

### Run

```bash
docker run my-node-app
```

### Run with port mapping

```bash
docker run -p 3000:3000 my-node-app
```

---

## 19. Environment Variables in Containers

```bash
docker run -e NODE_ENV=production my-app
```

Used for:

* secrets
* configs

---

## 20. Volumes (Data Persistence)

Problem:

* Containers are temporary

Solution:

* Volumes

```bash
docker run -v mydata:/data my-app
```

---

## 21. Docker Networking (Basic)

Containers communicate via:

* bridge network

```bash
docker network ls
```

---

## 22. Kubernetes (High Level)

Docker runs containers

Kubernetes:

* Manages containers at scale
* Auto restart
* Auto scale
* Load balancing

Docker = local engine
K8s = orchestration brain

---

## 23. Mental Checklist Before Using Docker

Ask:

* Do I need isolation?
* Do I need reproducibility?
* Do I want easy setup?

If yes → Docker

---

## 24. One‑Line Summary

> Docker packages **code + environment**, runs it **consistently**, isolates it **safely**, and scales it **cleanly**.

---

## 25. How to Use This Doc

* Read once fully
* Then use as command reference
* Extend with:

  * Docker Compose
  * Multi‑stage builds
  * Production hardening

---

End of document.
