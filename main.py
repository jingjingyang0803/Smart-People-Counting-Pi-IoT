import argparse
import json
from pathlib import Path

from camera.capture import start_capture


CONFIG_PATH = Path("config/device.json")


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(
            "Missing config/device.json. Copy config/device.example.json first."
        )
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def run_live(config: dict) -> None:
    print("Smart People Counting IoT System starting...")
    print(f"Device ID: {config['device_id']}")
    print(f"Zone: {config['zone']}")
    print("Launching camera capture pipeline...")

    start_capture(config)


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