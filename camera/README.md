# Camera Module

## Responsibility

- Camera setup and configuration
- Video capture from Raspberry Pi Camera v2
- FPS and resolution control
- Sample video recording
- Performance measurement (FPS, CPU usage, latency)

## Hardware Configuration

- **Board:** Raspberry Pi 3B+
- **Camera:** Raspberry Pi Camera v2 (8MP, Sony IMX219)
- **Interface:** CSI (Camera Serial Interface)
- **OS:** Raspberry Pi OS (64-bit installed)

The Raspberry Pi 3B+ has:

- Quad-core 1.4GHz CPU
- 1GB RAM

Since it is a resource-constrained edge device, resolution and FPS must be carefully selected.

## Default Video Configuration

```
Resolution: 640 × 480
Frame Rate: 30 FPS
```

### Why 640×480 @ 30 FPS?

This configuration was selected based on the following considerations:

### 1️⃣ Real-Time Responsiveness

People counting relies on motion continuity and ROI(Region of Interest) crossing detection.

Higher FPS (30) improves:

- Motion smoothness
- Entry/exit detection accuracy
- Temporal resolution

### 2️⃣ Computational Efficiency

Pixel comparison:

| Resolution | Total Pixels |
| ---------- | ------------ |
| 640×480    | 307,200      |
| 1280×720   | 921,600      |

1280×720 requires approximately **3× more processing power**.

On Raspberry Pi 3B+:

- 640×480 @ 30 FPS → stable real-time performance
- 1280×720 @ 15 FPS → higher CPU usage, possible frame drops

Since people counting does not require high-detail object recognition, 640×480 is sufficient.

## Alternative Test Mode (Performance Evaluation)

For experimental comparison:

```
1280 × 720 @ 15 FPS
```

Used for:

- Performance benchmarking
- YOLO-based detection (stretch goal)
- Resolution comparison study

## How to Run

### Install dependencies

```bash
sudo apt update
sudo apt install -y python3-picamera2 python3-psutil
```

### Run capture with performance logging

```bash
python3 capture.py --width 640 --height 480 --fps 30
```

Example output (printed every second):

```json
{
  "timestamp": "2026-02-18T14:25:12Z",
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

This generates a sample video for:

- Offline processing development
- Algorithm testing without device access
- Team collaboration

## Output

The camera module provides:

- Live frames to the processing module
- FPS measurement
- CPU usage statistics
- Sample recorded video

All output data is structured to integrate with the shared JSON schema.

## Performance Considerations

Since Raspberry Pi 3B+ is limited in computational resources:

- Stable FPS is prioritized over high resolution
- Edge processing must remain lightweight
- System stability is more important than visual quality

This ensures the people counting system operates reliably in real-time IoT scenarios.
