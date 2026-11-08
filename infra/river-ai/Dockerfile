FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server/river-ai-standalone.mjs ./server/river-ai-standalone.mjs
COPY infra/river-ai/schema.sql ./infra/river-ai/schema.sql
COPY lib/riverSSAI/agentsRegistry.mjs ./lib/riverSSAI/agentsRegistry.mjs
COPY lib/riverSSAI/router.mjs ./lib/riverSSAI/router.mjs
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node","server/river-ai-standalone.mjs"]
