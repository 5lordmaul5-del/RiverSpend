FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server/river-ai-standalone.mjs ./server/river-ai-standalone.mjs
COPY infra/river-ai/schema.sql ./infra/river-ai/schema.sql
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node","server/river-ai-standalone.mjs"]
