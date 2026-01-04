# Base OS image (plain Linux)
FROM ubuntu:latest

# Set working directory inside container
WORKDIR /app

# Install curl → use it to install Node.js → install node + npm
RUN apt update && \
    apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y nodejs

# Copy dependency files first (better caching)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application code
COPY index.js .

# Command that runs when container starts
CMD ["node", "index.js"]
