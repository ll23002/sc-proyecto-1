FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

COPY package.json package-lock.json* ./

RUN npm ci



EXPOSE 9000

CMD ["npx", "quasar", "dev", "--port", "9000", "--hostname", "0.0.0.0"]