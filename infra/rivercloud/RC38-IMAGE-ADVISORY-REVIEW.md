# RC-38 — preliminary image-version advisory review

Date: 26 November 2026

## Findings (version-level only; not a container scan)
- Node base: Dockerfile pins `node:22.23.5-alpine3.23`. The official Node 22.23.5 security release dated 11 November 2026 includes security fixes and is later than the 22.23.4 fix for CVE-2026-111497. Exact Alpine package metadata, image contents and SBOM have not been scanned.
- Caddy: Compose pins `caddy:2.11.9`. A version-level advisory lists Caddy versions below 2.11.9-r0 as affected by CVE-2026-111943. The image's package inventory and fix status remain unverified by a scanner.
- OAuth2 Proxy: Compose pins v7.15.6. Upstream release notes dated 5 November 2026 list security fixes. v7.15.2 also fixed several configuration-dependent authentication bypasses. This is a version review, not proof that all embedded dependencies are free of CVEs.
- Images are digest-pinned. No SBOM, image-signature verification or full container vulnerability scan has been produced. The demo whoami image is also unscanned.

## Sources
- Node 22.23.5 security release: https://nodejs.org/en/blog/release/v22.23.5
- OAuth2 Proxy release notes: https://github.com/oauth2-proxy/oauth2-proxy/releases
- Caddy version-level advisory: https://security.snyk.io/vuln/SNYK-MINIMOSLATEST-CADDY-22514111

## Next steps
- Generate SBOMs from the exact image digests.
- Scan the exact image layers and package inventory, including the demo image.
- Verify image signatures/provenance and document CVE exceptions/patch cadence.
- Re-run the scan after every image digest change.

