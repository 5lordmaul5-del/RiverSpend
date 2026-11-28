# Point 12 — Model compatibility checklist

Use this checklist before deliberately downloading or configuring a model.

1. Confirm owner-host capacity with Point 10 (disk and memory).
2. Confirm the local Ollama service is running and inspect installed inventory using Point 11.
3. Verify the model name/tag and publisher source from official documentation.
4. Review license and intended-use terms.
5. Estimate storage needs and leave disk headroom for temporary download layers and backups.
6. Select a conservative context length for available memory; test one small workload before increasing.
7. Keep model acquisition a deliberate command by the owner. Never paste secrets into model prompts.
8. After acquisition, inventory it and record model identifier, version/tag, date and verification notes in local owner records (not committed to repository).
9. Test a basic request and observe memory, latency and error behavior before relying on the model.

This checklist does not automate downloads, pull a model, modify configuration or execute inference.
