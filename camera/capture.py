import time
import json
import psutil
from datetime import datetime
from picamera2 import Picamera2
import paho.mqtt.client as mqtt

BROKER = "localhost"          # broker runs on the Pi
TOPIC  = "people_counting/data"

def main():
    client = mqtt.Client()
    client.connect(BROKER, 1883, 60)
    client.loop_start()

    picam2 = Picamera2()
    config = picam2.create_video_configuration(
        main={"size": (640, 480), "format": "RGB888"}
    )
    picam2.configure(config)
    picam2.start()

    psutil.cpu_percent(interval=None)
    start = time.time()
    frames = 0

    try:
        while True:
            _frame = picam2.capture_array()
            frames += 1

            elapsed = time.time() - start
            if elapsed >= 1:
                fps = frames / elapsed
                cpu = psutil.cpu_percent(interval=None)

                data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "device_id": "pi-01",
                    "zone": "main_entrance",
                    "fps": round(fps, 2),
                    "cpu": cpu
                }

                payload = json.dumps(data)
                print(payload)
                client.publish(TOPIC, payload)

                start = time.time()
                frames = 0
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
