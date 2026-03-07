import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import paho.mqtt.client as mqtt
import psutil


CONFIG_PATH = Path("config/device.json")


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(
            "Missing config/device.json. Copy config/device.example.json first."
        )
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def create_mqtt_client(host: str, port: int) -> mqtt.Client:
    client = mqtt.Client()
    client.connect(host, port, 60)
    return client


def build_message(config: dict, people_in: int, people_out: int, occupancy: int, fps: float) -> dict:
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device_id": config["device_id"],
        "zone": config["zone"],
        "people_in": people_in,
        "people_out": people_out,
        "occupancy": occupancy,
        "fps": round(fps, 2),
        "cpu": psutil.cpu_percent(),
    }


def run_live(config: dict) -> None:
    mqtt_cfg = config["mqtt"]
    pub_cfg = config["publish"]

    client = create_mqtt_client(mqtt_cfg["host"], mqtt_cfg["port"])
    topic = mqtt_cfg["topic"]

    interval_sec = pub_cfg.get("interval_sec", 1)

    # TODO: replace these mock counters with real camera + processing pipeline
    people_in = 0
    people_out = 0
    occupancy = 0

    last_time = time.time()

    while True:
        now = time.time()
        fps = 1.0 / max(now - last_time, 1e-6)
        last_time = now

        message = build_message(config, people_in, people_out, occupancy, fps)
        client.publish(topic, json.dumps(message))
        print(json.dumps(message, ensure_ascii=False))

        time.sleep(interval_sec)


def run_test(config: dict) -> None:
    print("Loaded config:")
    print(json.dumps(config, indent=2, ensure_ascii=False))
    print("Test mode OK.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["live", "test"], default="live")
    args = parser.parse_args()

    config = load_config()

    if args.mode == "test":
        run_test(config)
    else:
        run_live(config)


if __name__ == "__main__":
    main()