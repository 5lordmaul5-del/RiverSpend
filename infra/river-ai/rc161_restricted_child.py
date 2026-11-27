"""RC-161 restricted child: dispatch only built-in, side-effect-free toy tasks."""
import json
import sys


def execute(kind, payload):
    if type(payload) is not dict:
        raise ValueError("payload must be an object")
    if kind == "echo":
        return {"echo": payload}
    if kind == "json_validate":
        value = payload.get("json")
        if type(value) is not str:
            raise ValueError("invalid json input")
        json.loads(value)
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
        request = json.loads(sys.stdin.read())
        result = execute(request["type"], request["payload"])
        print(json.dumps({"ok": True, "result": result}, separators=(",", ":")))
    except Exception:
        print(json.dumps({"ok": False, "error": "task_failed"}, separators=(",", ":")))
        sys.exit(2)
