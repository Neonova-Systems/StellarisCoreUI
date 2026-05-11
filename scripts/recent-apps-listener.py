#!/usr/bin/env python3
import json
import os
import shlex
import socket
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

MAX_ITEMS = 10
DEBOUNCE_SECONDS = 0.12


def fail(message: str, exit_code: int = 1) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(exit_code)


def cache_file() -> Path:
    cache_root = Path(os.environ.get("XDG_CACHE_HOME", Path.home() / ".cache"))
    return cache_root / "ags" / "recent_apps.json"


def read_recent_items(path: Path) -> list[dict]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def write_recent_items(path: Path, items: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    tmp_path.write_text(json.dumps(items[:MAX_ITEMS], indent=2, ensure_ascii=False), encoding="utf-8")
    tmp_path.replace(path)


def active_window_info() -> dict:
    result = subprocess.run(
        ["hyprctl", "activewindow", "-j"],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    if result.returncode != 0 or not result.stdout.strip():
        return {}
    try:
        data = json.loads(result.stdout)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def normalize_entry(data: dict) -> dict | None:
    app_class = (data.get("initialClass") or data.get("class") or "").strip()
    if not app_class:
        return None
    title = (data.get("title") or data.get("initialTitle") or app_class).strip()
    desktop_entry = (data.get("initialClass") or data.get("class") or app_class).strip()
    pid = data.get("pid")
    return {
        "class": app_class,
        "desktopEntry": desktop_entry,
        "title": title,
        "pid": pid,
    }


def exec_path_for(app_class: str) -> str:
    result = subprocess.run(
        ["sh", "-lc", f"command -v {shlex.quote(app_class)}"],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )
    if result.returncode != 0 or not result.stdout.strip():
        return app_class

    first_line = result.stdout.splitlines()[0].strip()
    return first_line or app_class


def compute_score(launch_count: int, last_access_str: str) -> float:
    """Compute frequency-recency hybrid score.
    Score = (frequency * 0.5) + (1 / hours_since_last_used)
    """
    try:
        last_access = datetime.strptime(last_access_str, "%Y-%m-%d %H:%M:%S")
        now = datetime.now()
        hours_since = max((now - last_access).total_seconds() / 3600, 0.01)  # min 0.01h to avoid inf
        return (launch_count * 0.5) + (1.0 / hours_since)
    except Exception:
        return 0.0


def upsert_recent(entries: list[dict], entry: dict) -> list[dict]:
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    filtered = [item for item in entries if item.get("class") != entry["class"]]

    existing = next((item for item in entries if item.get("class") == entry["class"]), None)
    launch_count = int((existing or {}).get("launchCount", 0) or 0) + 1

    new_entry = {
        **entry,
        "launchCount": launch_count,
        "lastAccess": now,
        "execPath": exec_path_for(entry["class"]),
    }
    new_entry["score"] = compute_score(launch_count, now)
    
    filtered.insert(0, new_entry)
    
    # Sort by score descending, then by launchCount (secondary sort for ties)
    filtered.sort(key=lambda x: (-x.get("score", 0), -x.get("launchCount", 0)))
    
    return filtered[:MAX_ITEMS]


def hyprland_socket() -> Path:
    runtime_dir = os.environ.get("XDG_RUNTIME_DIR")
    if not runtime_dir:
        fail("XDG_RUNTIME_DIR is not set")

    runtime_path = Path(runtime_dir)
    hypr_root = runtime_path / "hypr"
    if not hypr_root.is_dir():
        fail(f"Hyprland runtime directory not found: {hypr_root}")

    instance = os.environ.get("HYPRLAND_INSTANCE_SIGNATURE")
    if instance:
        candidate = hypr_root / instance
        if candidate.is_dir():
            sock = candidate / ".socket2.sock"
            if sock.exists():
                return sock

    candidates = sorted(path for path in hypr_root.iterdir() if path.is_dir())
    for candidate in candidates:
        sock = candidate / ".socket2.sock"
        if sock.exists():
            return sock

    fail(f"Could not find Hyprland socket under {hypr_root}")
    raise AssertionError


def main() -> int:
    sock_path = hyprland_socket()
    recent_path = cache_file()
    last_event = 0.0

    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
        client.connect(str(sock_path))
        reader = client.makefile("r", encoding="utf-8", errors="replace")

        while True:
            line = reader.readline()
            if line == "":
                return 0

            raw_line = line.rstrip("\n")
            if not raw_line.startswith("activewindowv2>>"):
                continue

            now = time.monotonic()
            if now - last_event < DEBOUNCE_SECONDS:
                continue
            last_event = now

            window = normalize_entry(active_window_info())
            if window is None:
                continue

            recent_items = read_recent_items(recent_path)
            write_recent_items(recent_path, upsert_recent(recent_items, window))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
