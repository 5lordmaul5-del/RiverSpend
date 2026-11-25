# RC-13 — OIDC proxy integration foundation

## What this config does

The Compose/Caddy preview now places OAuth2 Proxy between Caddy and the demo upstream. It uses the generic OpenID Connect provider and restricts access to the configured email domain(s) and OIDC group(s). It is a standard third-party OIDC middleware; RiverCloud does not implement its own JWT signature verification.

- Caddy is the only service publishing host ports.
- OAuth2 Proxy and the demo upstream are internal to the dedicated Compose network.
- OAuth2 Proxy's direct trusted proxy is the fixed Caddy address on that network.
- The OIDC group claim and allowlist must be configured at the identity provider.
- The demo upstream is only a placeholder. The loopback queue server is not yet integrated into this auth boundary or route-level RBAC.

## Provider registration

At the OIDC provider, register a confidential client with this redirect URI:

`https://<RIVERCLOUD_DOMAIN>/oauth2/callback`

Configure the issuer URL, client ID, client secret, verified email, and a groups claim (named `groups` by default). Allow the `RiverCloudOperators` group (or your chosen operator group) in the token/session. Verify the exact group claim in a test token before using the allowlist.

## Local configuration

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Generate a cookie secret with `openssl rand -base64 32`.
3. Ensure DNS and the chosen network subnet do not conflict with your host.
4. Review the Docker Compose/Caddy configuration and provider registration.
5. Do not start this stack until the credentials, group claims, network and TLS setup are reviewed.

No services have been started by this change.

## Security gates still outstanding

- Provider-specific MFA/conditional access and session revocation policies.
- Route-level RBAC in the RiverCloud API; proxy group allowlisting only gates the placeholder upstream.
- Authenticated actor binding in job approvals/audit.
- Cookie/session behavior, logout, CSRF, rate-limit, header-spoofing and provider integration tests. Static config tests now verify trusted-proxy IP, secure cookies and the absence of skip-auth rules.
- OAuth2 Proxy v7.15.6 is above the versions affected by the reported 7.15.2–7.15.4 forwarded-URI bypass; this configuration also restricts trusted proxy IPs and contains no skip-auth rules. This is a version/configuration check, not a full image scan. Image digest pinning and image scan/SBOM remain pending.
- Staging rehearsal and threat review.

OAuth2 Proxy image is version-tag pinned to `v7.15.6`; digest pinning remains pending.
