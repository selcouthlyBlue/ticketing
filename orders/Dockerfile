FROM node:alpine

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build
COPY . .

EXPOSE 3000

CMD ["node", "build/index.js"]
