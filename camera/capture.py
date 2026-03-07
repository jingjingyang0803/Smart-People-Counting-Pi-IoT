"""
Camera Capture & Edge Telemetry Publisher (Raspberry Pi)

This script:
- Captures frames from the Raspberry Pi Camera (Picamera2)
- Runs lightweight edge people counting (processing.PeopleCounter)
- Collects device performance metrics (FPS, CPU, CPU temperature)
- Publishes structured JSON messages via MQTT
"""

from __future__ import annotations

import argparse
import time
from typing import Optional

import psutil
from picamera2 import Picamera2

from communication.mqtt_client import publish
from communication.schema import build_payload
from processing.motion_detection import ROI
from processing.people_counter import CounterConfig, PeopleCounter


DEFAULT_DEVICE_ID = "pi-01"
DEFAULT_ZONE = "main_entrance"
DEFAULT_CAPACITY = 10


def get_cpu_temperature() -> float:
    """
    Read Raspberry Pi CPU temperature in degrees Celsius.
    """
    try:
        with open("/sys/class/thermal/thermal_zone0/temp", encoding="utf-8") as f:
            temp = float(f.read()) / 1000.0
        return round(temp, 2)
    except Exception:
        return 0.0


def parse_roi(roi_str: Optional[str]) -> Optional[ROI]:
    """
    Parse ROI from a string "x,y,w,h".
    Example: "80,60,480,360"
    """
    if not roi_str:
        return None

    parts = [p.strip() for p in roi_str.split(",")]
    if len(parts) != 4:
        raise ValueError('ROI must be formatted as "x,y,w,h"')

    x, y, w, h = map(int, parts)
    if w <= 0 or h <= 0:
        raise ValueError("ROI width and height must be > 0")

    return ROI(x=x, y=y, w=w, h=h)


def compute_crowd_level(occupancy: int, capacity: int) -> str:
    """
    Compute crowd level dynamically from occupancy/capacity ratio.
    """
    safe_capacity = max(capacity, 1)
    ratio = occupancy / safe_capacity

    if ratio < 0.4:
        return "low"
    if ratio < 0.8:
        return "medium"
    return "crowded"


def start_capture(config: Optional[dict] = None) -> None:
    """
    Start the camera capture + people counting + MQTT publishing pipeline.

    If config is provided from main.py, use it as defaults.
    CLI arguments can still override the defaults if this file is run directly.
    """
    parser = argparse.ArgumentParser(
        description="Raspberry Pi camera capture + edge people counting + MQTT publishing"
    )
    parser.add_argument("--width", type=int, default=640, help="Camera frame width")
    parser.add_argument("--height", type=int, default=480, help="Camera frame height")
    parser.add_argument(
        "--fps",
        type=int,
        default=30,
        help="Target capture FPS (best effort)",
    )

    parser.add_argument(
        "--device-id",
        default=(config.get("device_id") if config else DEFAULT_DEVICE_ID),
        help="Device identifier",
    )
    parser.add_argument(
        "--zone",
        default=(config.get("zone") if config else DEFAULT_ZONE),
        help="Logical zone name (e.g., entrance)",
    )
    parser.add_argument(
        "--capacity",
        type=int,
        default=(config.get("capacity", DEFAULT_CAPACITY) if config else DEFAULT_CAPACITY),
        help="Maximum configured capacity of the monitored space",
    )

    parser.add_argument("--roi", default=None, help='Optional ROI "x,y,w,h" in pixels')
    parser.add_argument(
        "--line-pos",
        type=float,
        default=0.5,
        help="Counting line position inside ROI (0.0–1.0)",
    )
    parser.add_argument(
        "--direction",
        choices=["horizontal", "vertical"],
        default="horizontal",
        help="Counting line orientation",
    )
    parser.add_argument(
        "--in-direction",
        choices=["positive", "negative"],
        default="positive",
        help="Defines which crossing direction counts as IN",
    )
    parser.add_argument(
        "--min-blob-area",
        type=int,
        default=1200,
        help="Min contour area for motion blobs",
    )
    parser.add_argument(
        "--cooldown",
        type=float,
        default=1.0,
        help="Cooldown seconds to prevent double counting",
    )
    parser.add_argument(
        "--emit-interval",
        type=float,
        default=1.0,
        help="Seconds between MQTT messages",
    )

    args = parser.parse_args()

    roi = parse_roi(args.roi)

    counter_cfg = CounterConfig(
        roi=roi,
        direction=args.direction,
        line_pos=args.line_pos,
        in_direction=args.in_direction,
        min_blob_area=args.min_blob_area,
        cooldown_seconds=args.cooldown,
    )
    counter = PeopleCounter(counter_cfg)

    picam2 = Picamera2()
    camera_config = picam2.create_video_configuration(
        main={"size": (args.width, args.height), "format": "RGB888"}
    )
    picam2.configure(camera_config)
    picam2.start()

    psutil.cpu_percent(interval=None)
    frames = 0
    t_start = time.time()
    last_emit = time.time()

    try:
        while True:
            frame = picam2.capture_array()
            frames += 1

            people_in, people_out, occupancy, motion_score, brightness, _annotated = (
                counter.update(frame)
            )

            now = time.time()

            if now - last_emit >= args.emit_interval:
                elapsed = now - t_start
                fps = frames / elapsed if elapsed > 0 else 0.0
                cpu = psutil.cpu_percent(interval=None)
                cpu_temp = get_cpu_temperature()
                crowd_level = compute_crowd_level(occupancy, args.capacity)

                payload = build_payload(
                    device_id=args.device_id,
                    zone=args.zone,
                    people_in=people_in,
                    people_out=people_out,
                    occupancy=occupancy,
                    fps=round(fps, 2),
                    cpu=round(cpu, 2),
                )

                payload["cpu_temp"] = cpu_temp
                payload["motion_score"] = round(float(motion_score), 6)
                payload["brightness"] = round(float(brightness), 4)
                payload["crowd_level"] = crowd_level
                payload["capacity"] = args.capacity

                print(payload)
                publish(payload)

                frames = 0
                t_start = now
                last_emit = now

    except KeyboardInterrupt:
        print("Stopping capture pipeline...")
    finally:
        picam2.stop()


def main() -> None:
    start_capture()


if __name__ == "__main__":
    main()