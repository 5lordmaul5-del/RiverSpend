FROM node:22-alpine

RUN apk add --no-cache postgresql-client

ENV NODE_ENV=production
WORKDIR /app

COPY infra/river-cloud/api/server.mjs ./server.mjs
COPY infra/river-cloud/auth/river-auth.mjs ./river-auth.mjs
COPY infra/river-cloud/api/rate-limit.mjs ./rate-limit.mjs
COPY infra/river-cloud/api/db-concurrency.mjs ./db-concurrency.mjs
COPY infra/river-cloud/api/db-advisory-semaphore.mjs ./db-advisory-semaphore.mjs

USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
