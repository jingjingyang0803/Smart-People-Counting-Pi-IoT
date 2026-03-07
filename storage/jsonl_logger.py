import json
from datetime import datetime, timezone
from pathlib import Path


class JsonlLogger:
    def __init__(self, root_dir: str = "storage/logs"):
        self.root_dir = Path(root_dir)

    def _parse_timestamp(self, ts: str | None) -> datetime:
        if not ts:
            return datetime.now(timezone.utc)

        try:
            return datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except ValueError:
            return datetime.now(timezone.utc)

    def _get_log_path(self, message: dict) -> Path:
        device_id = message.get("device_id", "unknown-device")
        ts = self._parse_timestamp(message.get("timestamp"))

        device_dir = self.root_dir / device_id
        device_dir.mkdir(parents=True, exist_ok=True)

        filename = ts.strftime("%Y-%m-%d_%H.jsonl")
        return device_dir / filename

    def write(self, message: dict) -> None:
        path = self._get_log_path(message)

        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(message, ensure_ascii=False) + "\n")