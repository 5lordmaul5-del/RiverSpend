"""RC-161 restricted child: dispatch only built-in, side-effect-free toy tasks."""
import json
import resource
import sys

MAX_CHILD_FILE_BYTES = 32768
RESOURCE_LIMITS = (
    (resource.RLIMIT_CPU, (2, 2)),
    (resource.RLIMIT_AS, (128 * 1024 * 1024, 128 * 1024 * 1024)),
    (resource.RLIMIT_FSIZE, (MAX_CHILD_FILE_BYTES, MAX_CHILD_FILE_BYTES)),
    (resource.RLIMIT_NOFILE, (32, 32)),
    (resource.RLIMIT_CORE, (0, 0)),
)


def apply_resource_limits():
    """Apply conservative Linux process limits before handling task input."""
    for limit_name, bounds in RESOURCE_LIMITS:
        resource.setrlimit(limit_name, bounds)


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
        apply_resource_limits()
        request = json.loads(sys.stdin.read())
        result = execute(request["type"], request["payload"])
        print(json.dumps({"ok": True, "result": result}, separators=(",", ":")))
    except Exception:
        print(json.dumps({"ok": False, "error": "task_failed"}, separators=(",", ":")))
        sys.exit(2)
