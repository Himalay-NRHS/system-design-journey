FROM ubuntu

RUN apt update && \
    apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y nodejs && \
    apt clean

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY index.js index.js

RUN npm install

CMD ["node", "index.js"]