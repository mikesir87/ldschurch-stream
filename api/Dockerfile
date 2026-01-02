FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
