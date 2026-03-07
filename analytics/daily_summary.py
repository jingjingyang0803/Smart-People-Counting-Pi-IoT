import json
import sys
from pathlib import Path


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def safe_avg(values: list[float]) -> float:
    return round(sum(values) / len(values), 2) if values else 0.0


def compute_daily_summary(rows: list[dict], date_str: str) -> dict:
    if not rows:
        raise ValueError("No hourly summary rows found.")

    total_in_values = [int(r.get("total_in", 0)) for r in rows]
    total_out_values = [int(r.get("total_out", 0)) for r in rows]
    peak_occupancy_values = [int(r.get("peak_occupancy", 0)) for r in rows]
    avg_fps_values = [float(r.get("avg_fps", 0.0)) for r in rows if r.get("avg_fps") is not None]
    avg_cpu_values = [float(r.get("avg_cpu", 0.0)) for r in rows if r.get("avg_cpu") is not None]

    last = rows[-1]

    return {
        "date": date_str,
        "device_id": last.get("device_id", "unknown-device"),
        "zone": last.get("zone", "unknown-zone"),
        "hours_included": len(rows),
        "total_in": sum(total_in_values),
        "total_out": sum(total_out_values),
        "net_flow": sum(total_in_values) - sum(total_out_values),
        "peak_occupancy": max(peak_occupancy_values) if peak_occupancy_values else 0,
        "avg_fps": safe_avg(avg_fps_values),
        "avg_cpu": safe_avg(avg_cpu_values),
    }


def get_output_path(device_id: str, date_str: str) -> Path:
    out_dir = Path("storage/daily") / device_id
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir / f"{date_str}.json"


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python analytics/daily_summary.py <date: YYYY-MM-DD> <hourly_json_1> [hourly_json_2] ...")
        sys.exit(1)

    date_str = sys.argv[1]
    input_paths = [Path(p) for p in sys.argv[2:]]

    rows = []
    for path in input_paths:
        if not path.exists():
            print(f"Skipping missing file: {path}")
            continue
        rows.append(load_json(path))

    if not rows:
        print("No valid hourly summary files found.")
        sys.exit(1)

    rows.sort(key=lambda x: x.get("hour_start", ""))

    summary = compute_daily_summary(rows, date_str)
    output_path = get_output_path(summary["device_id"], date_str)

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"Daily summary written to: {output_path}")


if __name__ == "__main__":
    main()