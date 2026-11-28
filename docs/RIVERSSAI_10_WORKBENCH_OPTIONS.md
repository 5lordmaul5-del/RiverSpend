# RiverSSAI 10.0 Workbench options

## User-facing workbench
- Temporary chat mode: clears the visible current conversation when toggled on and skips local-storage persistence while enabled. This is a client-side temporary mode only; it is not a guarantee of server-side deletion or privacy beyond the app's current data handling.
- Artifacts: draft panel for preparing content and submitting it into the chat for Nova to structure. Persistent artifact storage/export is not yet connected.
- Programmazione: interface placeholder for scheduled workflows; real scheduling requires RiverAutoma/service integration.
- Strumenti: explains workflow planning and connected tool permissions.

## Roadmap inspired by user screenshots
- Multi-step workflows and task execution, with progress/results and approval gates.
- Artifacts: create/edit/export documents, images, code and plans.
- Temporary/Incognito chat controls with transparent retention semantics.
- Scheduled tasks and conditional monitoring, backed by RiverAutoma.
- Media/file input and device integration only when supported and permissions are granted.
- Settings: memory/retention, personalization, privacy, access and connected tools.
- Mobile-first navigation and PWA affordances.

## Safety and implementation status
The first UI increment is a prototype. The temporary mode skips local persistence and clears the visible chat on activation, but it does not provide server-side retention guarantees. Scheduling, durable artifacts, device connections, media processing and external actions require separate backend implementations, tests and explicit permissions.
