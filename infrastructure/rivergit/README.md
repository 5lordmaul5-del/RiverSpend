# RiverGit — isolated Forgejo node

The Compose file is a deployment scaffold, not a turnkey production installation.

Before starting:
1. Provision a dedicated Linux VM with supported Docker Engine and Compose.
2. Set immutable, verified image references in a host-local `.env` file (never commit it).
3. Configure hostname, DNS, firewall and TLS reverse proxy.
4. Keep web and SSH ports private until ingress and access controls are ready.
5. Back up PostgreSQL and Forgejo persistent data to a separate provider/account.
6. Complete a restore drill before importing repositories.

Default port bindings are loopback-only. Do not change them to public bindings without a reviewed ingress design. The Forgejo Actions runner is intentionally excluded: runners execute repository-controlled code and require a separate isolated worker host and strict job permissions.

See [RiverCloud Infrastructure](../../docs/RIVERCLOUD-OWN-INFRASTRUCTURE.md).
