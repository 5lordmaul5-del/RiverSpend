# RiverSSAI 20.0 — Local autonomy foundation

This branch starts an isolated, self-hosted AI foundation. It is a scaffold, not an autonomous production agent.

## Principles
- Local-first: no commercial model API required for the default inference path.
- Provider-optional: external model endpoints are adapters, not dependencies.
- Explicit boundaries: agents cannot execute shell commands, deploy, spend money, access secrets or mutate production.
- Transparent operations: tasks, tool requests and results must be logged.
- Resource-aware: concurrency and model size depend on available RAM/VRAM/CPU.

## Initial components
- Ollama local inference runtime (compose scaffold).
- Specialist registry (roles, not 90 separate running processes).
- Orchestrator/API scaffold is a later gate after runtime tests and threat-model review.
- Model selection and downloads are manual; compose does not automatically pull models.

## Start
Install Docker Compose and Ollama image prerequisites, review compose, then run from this directory:
`docker compose up -d`
This starts only the local inference service, bound to 127.0.0.1. It does not download a model or expose it publicly.
Then manually pull an appropriate model using Ollama CLI inside the container, after choosing a model compatible with your hardware.

## Limitations
No model is installed by default. No agent loop, web access, code execution, deployment, secrets integration, fine tuning, distributed compute or production security is implemented yet. This foundation must not be treated as unlimited compute.
