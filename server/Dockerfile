FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# build TS → JS
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]