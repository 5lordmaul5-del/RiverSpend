"""RC-161 restricted child: dispatch only built-in, side-effect-free toy tasks."""
import json
import sys


def _unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate JSON key")
        result[key] = value
    return result


def _reject_constant(value):
    raise ValueError("non-finite JSON constant")


def execute(kind, payload):
    if type(payload) is not dict:
        raise ValueError("payload must be an object")
    if kind == "echo":
        return {"echo": payload}
    if kind == "json_validate":
        value = payload.get("json")
        if type(value) is not str:
            raise ValueError("invalid json input")
        json.loads(value, object_pairs_hook=_unique_pairs, parse_constant=_reject_constant)
        return {"valid": True}
    if kind == "metrics_report":
        keys = ("total", "success", "failed")
        if any(type(payload.get(key)) is not int or payload[key] < 0 for key in keys):
            raise ValueError("bad metrics")
        if payload["success"] + payload["failed"] > payload["total"]:
            raise ValueError("inconsistent metrics")
        return {key: payload[key] for key in keys}
    raise ValueError("task type denied")


if __name__ == "__main__":
    try:
        request = json.loads(sys.stdin.read(), object_pairs_hook=_unique_pairs, parse_constant=_reject_constant)
        result = execute(request["type"], request["payload"])
        print(json.dumps({"ok": True, "result": result}, separators=(",", ":")))
    except Exception:
        print(json.dumps({"ok": False, "error": "task_failed"}, separators=(",", ":")))
        sys.exit(2)
