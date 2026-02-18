# Processing Module

## Responsibility

The Processing module performs **edge-level video analysis** and converts raw video frames into structured IoT data for the People Counting system.

Main responsibilities:

- Motion detection
- Occupancy estimation
- Basic people in/out counting
- ROI-based entrance monitoring
- Brightness estimation
- Structured JSON data generation

## Role in System Architecture

The Processing module acts as the **core intelligence layer** of the system.

It transforms raw image data into meaningful occupancy information.

## Input

- Live video frames from the Camera module
- Resolution: 640×480 (default)
- Frame rate: 30 FPS (default)

## Current Implementation

### 1️⃣ Motion Detection

Implemented using **frame difference**:

- Convert frames to grayscale
- Compute absolute difference
- Apply thresholding
- Measure motion intensity

Why frame difference?

- Lightweight computation
- Suitable for Raspberry Pi 3B+
- Real-time capable at 30 FPS
- Does not require GPU or heavy models

This method prioritizes stability over AI-level accuracy.

### 2️⃣ People Counting Logic

Current version uses:

- Motion detection within a predefined ROI (Region of Interest)
- Simple occupancy increment logic

Example idea:

- Motion detected in entrance ROI → possible entry event
- Update occupancy counter

This is a simplified model designed for:

- Demonstrating system integration
- Testing pipeline performance
- Maintaining real-time responsiveness

### 3️⃣ Brightness Estimation

Brightness is calculated by:

- Averaging grayscale pixel intensity
- Normalizing value between 0–1

Purpose:

- Environmental monitoring
- Future adaptive threshold tuning
- Additional IoT metadata

## Output Format

All outputs must follow the shared JSON schema:

```
../shared/data_schema_example.json
```

Example output:

```json
{
  "motion_score": 0.68,
  "people_in": 2,
  "people_out": 1,
  "occupancy": 12,
  "brightness": 0.45
}
```

The Processing module does not directly handle communication.

It only generates structured data.

## Design Considerations

### Why Not Use YOLO for Core Logic?

YOLO-based object detection is computationally expensive.

On Raspberry Pi 3B+:

- Full-resolution YOLO inference reduces FPS significantly
- CPU usage increases dramatically
- Real-time performance becomes unstable

Therefore:

- Frame-difference motion detection is used for MVP
- YOLO is reserved as a stretch goal
- YOLO inference runs at low frequency (e.g., 1 FPS)

This ensures system reliability.

## Future Extensions

- Direction-based counting (entry vs exit logic)
- Background subtraction improvement
- Multi-zone monitoring
- Adaptive threshold based on brightness
- YOLO-based validation layer

## Performance Focus

Since the system runs on a constrained edge device:

- Processing must maintain near real-time speed
- Stable FPS is prioritized over detection complexity
- Lightweight algorithms are preferred

The goal is to demonstrate a **complete IoT edge pipeline**, not to maximize AI accuracy.
