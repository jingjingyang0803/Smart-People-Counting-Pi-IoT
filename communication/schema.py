# communication/schema.py
from datetime import datetime, timezone

def build_payload(device_id, zone, people_in, people_out, occupancy, fps, cpu):
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device_id": device_id,
        "zone": zone,
        "people_in": people_in,
        "people_out": people_out,
        "occupancy": occupancy,
        "fps": fps,
        "cpu": cpu
    }
