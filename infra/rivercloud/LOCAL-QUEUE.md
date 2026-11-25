# RC-3/RC-11 local queue prototype

The local API accepts validated immutable staging plans only. It binds to loopback and requires a Bearer token of at least 32 characters.

## Start

Set RIVERCLOUD_ENGINE_TOKEN to a random value of at least 32 characters and set RIVERCLOUD_ENGINE_PORT if needed. Then run:

node infra/rivercloud/server.mjs

## Routes

- GET /health — prototype status; runner remains disconnected
- GET /jobs — persisted plan-only queue
- POST /deploy — validated staging plan (projectId, branch, commit SHA, target)

## State and safety

Queue records, approval records and events are stored in a single state file under the configured queue directory. Mutations are serialized and use atomic replacement. Duplicate plan submissions are idempotent. The queue does not execute commands, builds, containers, webhooks or deployments.

The state lock is local and not distributed. Stale lock recovery is manual. Protect and back up this directory. Do not expose the API to the internet or use it for production.
