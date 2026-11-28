# RiverSSAI Canva Workbench — next integration increment

Status: implementation roadmap; Canva account connector in ChatGPT does not itself grant RiverSSAI runtime API access.

## Verified design asset
- Title: Banner marketplace RiverSpend
- Design ID: DAHcMb-yxWU
- Canva edit URL: https://www.canva.com/d/wX-LB8ESiGa3E4l
- View URL: https://www.canva.com/d/3HUTHcDtfEQTV3M
- One page; checked via connected Canva read operation on 2026-11-28.

## Workbench UI
The RiverSSAI app exposes the Canva creative section and links directly to the verified edit URL. Thumbnail URLs returned by Canva are signed/time-limited; do not treat them as permanent website assets.

## Integration phases
1. **Design discovery:** list/search designs through authorized Canva Connect API scopes.
2. **Brief-to-design:** prepare brief, constraints, aspect ratio, required text, campaign tag, then create design with user consent.
3. **Export:** obtain supported export job and download result using documented API endpoints only.
4. **Asset ingestion:** validate MIME type, dimensions, size, checksum and safe filename; store in RiverSpend-controlled storage after authorization.
5. **Review:** preview, brand/text validation, human approval.
6. **Publishing:** user-approved deployment or listing placement; never auto-publish.

## Runtime prerequisites
- OAuth authorization code, minimal scopes, state and PKCE where supported.
- Secret/token storage and rotation in an approved secure store.
- Export/download API access confirmed against the user's Canva plan and API scopes.
- Tests for authorization/revocation, export polling, timeouts, quotas, invalid media, and no-publish-by-default.

## Immediate limitation
The current integration is a UI entry point and blueprint. No Canva OAuth credentials, runtime export API, permanent asset storage, or browser/CI verification are claimed.
