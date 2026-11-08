FROM node:22-alpine
WORKDIR /app
RUN npm init -y && npm install --omit=dev pg@8.16.3
COPY server/river-ai-standalone.mjs ./server/river-ai-standalone.mjs
COPY docs/RIVERSPEND_MASTER_KNOWLEDGE.md ./docs/RIVERSPEND_MASTER_KNOWLEDGE.md
COPY infra/river-ai/schema.sql ./infra/river-ai/schema.sql
COPY lib/riverSSAI/agentsRegistry.mjs ./lib/riverSSAI/agentsRegistry.mjs
COPY lib/riverSSAI/router.mjs ./lib/riverSSAI/router.mjs
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node","server/river-ai-standalone.mjs"]
