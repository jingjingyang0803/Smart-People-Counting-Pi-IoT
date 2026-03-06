# camera/capture.py
import time
import psutil
from picamera2 import Picamera2

from processing.motion_detection import detect_motion
from processing.people_counter import PeopleCounter
from communication.schema import build_payload
from communication.mqtt_client import publish

DEVICE_ID = "pi-01"
ZONE = "main_entrance"

def main(width=640, height=480, fps_target=30):
    picam2 = Picamera2()
    config = picam2.create_video_configuration(
        main={"size": (width, height), "format": "RGB888"}
    )
    picam2.configure(config)
    picam2.start()

    counter = PeopleCounter(frame_height=480)
    prev_frame = None

    psutil.cpu_percent(interval=None)
    start = time.time()
    frames = 0

    try:
        while True:
            frame = picam2.capture_array()
            frames += 1

            motion = False
            if prev_frame is not None:
                motion = detect_motion(prev_frame, frame)
            prev_frame = frame

            # update counting state every frame
            people_in, people_out, occupancy = counter.update(frame)

            elapsed = time.time() - start
            if elapsed >= 1.0:
                fps = frames / elapsed
                cpu = psutil.cpu_percent(interval=None)

                payload = build_payload(
                    device_id=DEVICE_ID,
                    zone=ZONE,
                    people_in=people_in,
                    people_out=people_out,
                    occupancy=occupancy,
                    fps=round(fps, 2),
                    cpu=cpu
                )

                print(payload)   # for debugging
                publish(payload) # MQTT publish

                start = time.time()
                frames = 0

    except KeyboardInterrupt:
        pass
    finally:
        picam2.stop()

if __name__ == "__main__":
    main()
