# Stage 1: Build production dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Final lightweight runner image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Ensure uploads directory structure is created (though backend auto-creates it)
RUN mkdir -p src/uploads/profile_pics src/uploads/post_images

EXPOSE 5000
ENV NODE_ENV=production
CMD ["npm", "start"]
