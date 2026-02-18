# Raspberry Pi–Based Edge People Counting System for IoT

## 1. Project Overview

This project implements a modular IoT-based People Counting System using a Raspberry Pi 3B+ and Pi Camera v2.

The system captures live video, performs edge-level video analysis, estimates people presence and occupancy, and converts visual information into structured IoT data. The results are transmitted via MQTT and visualized in a lightweight web dashboard.

The project focuses on:

- Treating the camera as an IoT sensor
- Edge-based people counting logic
- Modular system architecture
- Real-time data transmission
- Performance evaluation on constrained hardware

System pipeline:

```
Camera → Processing → Communication → Storage → Analytics → Dashboard
```

## 2. Core Application: People Counting

The primary goal of the system is to estimate:

- Number of people entering
- Number of people leaving
- Current occupancy
- Motion intensity
- Environmental brightness

People counting is implemented using:

- Frame difference–based motion detection
- ROI-based analysis (e.g., entrance zone)
- Simple direction logic (future extension)
- Optional YOLO-based person detection (stretch goal)

The system does not aim for high-accuracy AI benchmarking, but rather for:

- Real-time responsiveness
- Low computational cost
- Stable IoT data output

## 3. System Architecture

### Modular Monorepo Structure

```
people-counting-system/
│
├── camera/          # Video acquisition & performance
├── processing/      # Motion & people counting logic
├── communication/   # MQTT / REST publishing
├── storage/         # JSON logging
├── analytics/       # KPI & trend analysis
├── shared/          # Unified data schema
├── dashboard/       # Real-time visualization
```

## 4. Module Responsibilities

### Camera Module

- Capture video frames from Pi Camera
- Configure resolution and FPS
- Measure system performance (FPS, CPU, latency)
- Provide recorded sample video for offline testing

### Processing Module

- Motion detection (frame difference)
- ROI-based entrance monitoring
- Occupancy estimation
- Brightness level estimation
- Generate structured JSON output

Example logic:

- Motion detected in entrance ROI → potential entry/exit event
- Update occupancy counter accordingly

### Communication Module

- Publish structured data via MQTT
- Maintain unified JSON schema
- Handle device-to-dashboard communication

### Storage Module

- Store JSON logs locally
- Enable offline analytics

### Analytics Module

- Compute:
  - Peak occupancy
  - Hourly entry counts
  - Average FPS
  - CPU usage trends
- Provide historical insights beyond real-time dashboard

### Dashboard Module

- Display:
  - Current occupancy
  - People in/out
  - Motion score
  - Brightness
  - System performance
- Supports mock data and live MQTT stream

## 5. Unified Data Schema

All modules follow a shared JSON schema defined in:

```
shared/data_schema_example.json
```

Design principles:

- Core people-counting fields always present
- YOLO field optional
- Dashboard handles missing fields gracefully
- Schema changes require team agreement

## 6. Performance Evaluation

Since Raspberry Pi 3B+ is resource-constrained, the system evaluates:

- Frames per second (FPS)
- CPU usage
- Processing latency
- Stability under continuous operation

This ensures the people counting algorithm remains practical for edge deployment.

## 7. Stretch Goal — YOLO-Based Person Detection

Optional enhancement:

- Lightweight person detection
- Low inference rate (e.g., 1 FPS)
- Used to validate motion-based counting
- Adds object count metadata
- Does not affect core pipeline stability

## 8. Development Strategy

### Parallel Development

Team members work independently on:

- Video capture
- Processing logic (using recorded videos)
- MQTT communication
- Dashboard visualization (mock data)
- YOLO experimentation

### Integration Requirements

- Strict shared JSON schema
- Agreed MQTT topic structure
- Clear module interfaces

Integration phase scheduled after core modules stabilize.

## 9. Hardware & Software Stack

### Hardware

- Raspberry Pi 3B+
- Raspberry Pi Camera v2
- SD card
- Power supply

### Software

- Python
- OpenCV
- NumPy
- MQTT (Mosquitto)
- Vite-based web dashboard

## 10. Final Deliverables

- Working people counting system demo
- Real-time dashboard
- Modular source code repository
- Architecture diagram
- Performance evaluation report
