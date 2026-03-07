import json
import sys
from pathlib import Path


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def safe_avg(values: list[float]) -> float:
    return round(sum(values) / len(values), 2) if values else 0.0


def compute_hourly_summary(rows: list[dict]) -> dict:
    if not rows:
        raise ValueError("No telemetry rows found.")

    first = rows[0]
    last = rows[-1]

    people_in_values = [int(r.get("people_in", 0)) for r in rows]
    people_out_values = [int(r.get("people_out", 0)) for r in rows]
    occupancy_values = [int(r.get("occupancy", 0)) for r in rows]
    fps_values = [float(r.get("fps", 0.0)) for r in rows if r.get("fps") is not None]
    cpu_values = [float(r.get("cpu", 0.0)) for r in rows if r.get("cpu") is not None]

    total_in = max(0, int(last.get("people_in", 0)) - int(first.get("people_in", 0)))
    total_out = max(0, int(last.get("people_out", 0)) - int(first.get("people_out", 0)))

    return {
        "device_id": last.get("device_id", "unknown-device"),
        "zone": last.get("zone", "unknown-zone"),
        "hour_start": rows[0].get("timestamp"),
        "hour_end": rows[-1].get("timestamp"),
        "samples": len(rows),
        "total_in": total_in,
        "total_out": total_out,
        "net_flow": total_in - total_out,
        "peak_occupancy": max(occupancy_values) if occupancy_values else 0,
        "avg_fps": safe_avg(fps_values),
        "avg_cpu": safe_avg(cpu_values),
        "last_people_in": people_in_values[-1] if people_in_values else 0,
        "last_people_out": people_out_values[-1] if people_out_values else 0,
        "last_occupancy": occupancy_values[-1] if occupancy_values else 0,
    }


def get_output_path(input_path: Path, device_id: str) -> Path:
    # input: storage/logs/pi-01/2026-03-07_14.jsonl
    # output: storage/hourly/pi-01/2026-03-07_14.json
    filename = input_path.stem + ".json"
    out_dir = Path("storage/hourly") / device_id
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir / filename


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python analytics/hourly_summary.py <path_to_hourly_jsonl>")
        sys.exit(1)

    input_path = Path(sys.argv[1])

    if not input_path.exists():
        print(f"File not found: {input_path}")
        sys.exit(1)

    rows = load_jsonl(input_path)
    summary = compute_hourly_summary(rows)

    output_path = get_output_path(input_path, summary["device_id"])

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"Hourly summary written to: {output_path}")


if __name__ == "__main__":
    main()