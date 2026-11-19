FROM node:22-alpine

RUN apk add --no-cache postgresql-client

ENV NODE_ENV=production
WORKDIR /app

COPY infra/river-cloud/api/server.mjs ./server.mjs
COPY infra/river-cloud/auth/river-auth.mjs ./river-auth.mjs

USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
