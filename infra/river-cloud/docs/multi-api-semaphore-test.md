# RiverCloud multi-API semaphore test

The CI fixture launches a disposable PostgreSQL database, a deterministic RiverAuth stub, and two API containers on a project-specific Compose stack. The APIs use the same database but separate process-local gates.

The test occupies all eight reserved PostgreSQL advisory slots from separate holder sessions, then sends authenticated profile requests to both API instances. Each must return HTTP 503 with `database_busy`. After the holder sessions exit and the locks are released, both APIs must return HTTP 200.

The fixture binds HTTP test ports only to loopback (18080 and 18081), uses synthetic identity and credentials, and tears down the project including its disposable volume.

## Scope and limitations

- This validates that both API instances consult the shared semaphore and map saturation to the expected HTTP response.
- The lock holders are separate PostgreSQL sessions; the test does not create sustained concurrent HTTP database operations across the two API containers.
- It does not prove distributed rate limiting, load balancing, production identity-provider behavior, or a production deployment.
- It uses an isolated Compose project and synthetic credentials. No production data, secrets, or services are touched.
