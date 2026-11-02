FROM node:24.22.2-alpine3.24
WORKDIR /app
# dependencies first: Docker caches this layer until package files change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY index.js ./
# don't run as root inside the container
USER node
CMD ["node", "index.js"]