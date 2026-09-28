FROM node:26-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat curl git

COPY package.json package-lock.json* ./
RUN npm install

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev"]
