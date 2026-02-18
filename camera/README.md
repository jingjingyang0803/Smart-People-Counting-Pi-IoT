# Camera Module

## Responsibility

- Camera setup and configuration
- Video capture
- FPS and resolution control
- Sample video recording
- Basic performance measurement (CPU, FPS)

## Hardware

- Raspberry Pi
- Pi Camera (CSI)

## How to Run

### Install dependencies

```bash
sudo apt update
sudo apt install -y python3-picamera2 python3-psutil
```

### Run capture with performance logging

```bash
python3 capture.py
```

The script prints JSON output every second:

```json
{
  "timestamp": "...",
  "device_id": "pi-01",
  "zone": "main_entrance",
  "fps": 29.8,
  "cpu": 42.3
}
```

## Record Sample Video

```bash
bash record_sample.sh
```

## Output

- Live frames (for processing module)
- FPS
- CPU usage
