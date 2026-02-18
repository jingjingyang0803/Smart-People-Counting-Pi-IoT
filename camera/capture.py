import time
import json
import psutil
from datetime import datetime
from picamera2 import Picamera2

def main():
    picam2 = Picamera2()
    config = picam2.create_video_configuration(
        main={"size": (640, 480), "format": "RGB888"}
    )
    picam2.configure(config)
    picam2.start()

    psutil.cpu_percent(interval=None)
    start = time.time()
    frames = 0

    while True:
        frame = picam2.capture_array()
        frames += 1

        if time.time() - start >= 1:
            fps = frames / (time.time() - start)
            cpu = psutil.cpu_percent(interval=None)

            data = {
                "timestamp": datetime.utcnow().isoformat(),
                "device_id": "pi-01",
                "zone": "main_entrance",
                "fps": round(fps, 2),
                "cpu": cpu
            }

            print(json.dumps(data))

            start = time.time()
            frames = 0

if __name__ == "__main__":
    main()