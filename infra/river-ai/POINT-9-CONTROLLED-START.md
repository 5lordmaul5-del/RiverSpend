# Point 9 — Controlled local start and stop

These owner-run commands start or stop the local Compose services. They are not executed by CI.

## Start
```bash
bash infra/river-ai/start-owner-runtime.sh
```

The start script requires the Point 8 owner configuration file with permissions 0600/0400 and validates Compose rendering before requesting startup.

## Stop
```bash
bash infra/river-ai/stop-owner-runtime.sh
```

Stop preserves volumes; it does not delete data. This is not a service-health guarantee: run the safe diagnostics and read-only endpoint test after startup.

Owner actions can download model assets or consume local disk, CPU, memory and network bandwidth. Review the model configuration and storage capacity before starting.
