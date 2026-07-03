# Step 1: Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# If using React Router, copy a custom nginx config to handle SPA routing if necessary
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]