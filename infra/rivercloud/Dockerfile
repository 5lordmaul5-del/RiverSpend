FROM node:22.23.5-alpine3.23@sha256:6868d4695b947ee120bffaa463fecd68cde370d7bfec92955e7c8ac576b4f475
WORKDIR /app
COPY --chown=node:node infra/rivercloud/rc34-proxy-api.mjs /app/infra/rivercloud/rc34-proxy-api.mjs
COPY --chown=node:node infra/rivercloud/queue.mjs /app/infra/rivercloud/queue.mjs
COPY --chown=node:node infra/rivercloud/engine.mjs /app/infra/rivercloud/engine.mjs
COPY --chown=node:node infra/rivercloud/rc11-state.mjs /app/infra/rivercloud/rc11-state.mjs
COPY --chown=node:node infra/rivercloud/rc13-identity.mjs /app/infra/rivercloud/rc13-identity.mjs
RUN mkdir -p /data && chown node:node /data && chmod 700 /data
USER node
EXPOSE 8788
CMD ["node", "/app/infra/rivercloud/rc34-proxy-api.mjs"]
