````markdown
# Motion Detection

This folder contains a simple rule-based motion detection and people counting demo using OpenCV.

It reads a video or webcam, detects motion, estimates brightness, counts people crossing a line, and prints JSON output per frame.

---

## Setup

Open a terminal inside the **motion detection** folder.

### 1. Create a virtual environment

Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\activate
````

Mac / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### 2. Install dependencies

```bash
pip install opencv-python numpy
```

---

## Run the script

### Run using sample video

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --preview
```

### Run using webcam

```bash
python motion_detection.py --source 0 --preview
```

Press **q** to close the preview window.

---

## Save output to JSON file

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --output-jsonl output.jsonl
```

This will generate JSON lines like:

```json
{
  "timestamp": "...",
  "motion_score": 0.003,
  "people_in": 5,
  "people_out": 5,
  "occupancy": 0,
  "brightness": 0.39,
  "presence": 1
}
```

---

## Useful options

### Focus on doorway area (ROI)

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --preview --roi "x,y,w,h"
```

Example

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --preview --roi "200,120,600,500"
```

---

### Adjust counting line

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --preview --line-pos 0.6
```

---

### Reduce false detections

Increase blob size threshold:

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --preview --min-blob-area 2000
```

Increase cooldown between counts:

```bash
python motion_detection.py --source sample_videos/sample1.mp4 --preview --cooldown-seconds 1.5
```

---

## Notes

* This is a **rule-based system**, not an AI detector.
* Accuracy depends on camera angle, lighting, and ROI selection.
* Adjust parameters (`roi`, `line-pos`, `min-blob-area`) for better results.

```
```
