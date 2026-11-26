"""Small fail-closed validation helpers for River API request envelopes.

Prototype: no provider access, no network, no secrets. Callers should use these
helpers before routing requests and keep the allowlist configuration explicit.
"""
from __future__ import annotations
from typing import Any

ALLOWED_KEYS = frozenset({"request_id", "model", "prompt", "max_tokens", "metadata"})

class EnvelopeError(ValueError):
    pass

def validate_envelope(payload: Any, *, allowed_models: set[str], max_prompt_chars: int = 20_000, max_tokens: int = 4_096) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise EnvelopeError("envelope must be an object")
    unknown = set(payload) - ALLOWED_KEYS
    if unknown:
        raise EnvelopeError("unknown envelope fields")
    request_id = payload.get("request_id")
    model = payload.get("model")
    prompt = payload.get("prompt")
    tokens = payload.get("max_tokens", 1024)
    if not isinstance(request_id, str) or not request_id.strip() or len(request_id) > 128:
        raise EnvelopeError("invalid request_id")
    if not isinstance(model, str) or model not in allowed_models:
        raise EnvelopeError("model is not allowlisted")
    if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > max_prompt_chars:
        raise EnvelopeError("invalid prompt")
    if isinstance(tokens, bool) or not isinstance(tokens, int) or tokens < 1 or tokens > max_tokens:
        raise EnvelopeError("max_tokens out of bounds")
    metadata = payload.get("metadata", {})
    if not isinstance(metadata, dict) or len(metadata) > 32:
        raise EnvelopeError("invalid metadata")
    return {"request_id": request_id, "model": model, "prompt": prompt, "max_tokens": tokens, "metadata": metadata}
