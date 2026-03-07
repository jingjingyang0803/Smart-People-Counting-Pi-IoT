# Smart People Counting IoT System

## 1. Project Overview

This repository is designed to be reproducible on any Raspberry Pi equipped with a compatible camera module.

This project implements a modular **IoT-based people counting system** using a **Raspberry Pi 3 Model B+** and a **Raspberry Pi Camera Module V2**.

The system captures live video, performs lightweight **edge video analytics**, estimates people flow and occupancy, and converts visual information into structured IoT telemetry data. The processed data is transmitted through **MQTT** and visualized in a real-time web dashboard.

The project demonstrates how a camera can be treated as an **IoT sensing device**, enabling edge computing and real-time monitoring.

### Key Objectives

- Edge-based people counting on resource-constrained hardware
- Modular IoT system architecture
- Real-time data transmission using MQTT
- Scalable data pipeline for storage and analytics
- Performance evaluation on embedded devices

# 2. System Pipeline

The system follows a typical **edge-to-dashboard IoT pipeline**.

```
Camera (Sensor)
   ↓
Edge Processing (Raspberry Pi)
   ↓
MQTT Communication
   ↓
Dashboard (Client Application)
   ↓
Storage
   ↓
Analytics
```

- **Dashboard** consumes real-time MQTT data streams.
- **Storage and Analytics** operate on historical logs for insights and evaluation.

# 3. Core Application: People Counting

The primary objective of the system is to estimate:

- Number of people **entering**
- Number of people **leaving**
- Current **occupancy**
- **Motion intensity**
- **Environmental brightness**

The people counting algorithm runs directly on the **edge device (Raspberry Pi)** to minimize network bandwidth and enable real-time processing.

# 4. Detection Method

The system uses lightweight computer vision techniques suitable for embedded hardware.

### Motion-Based Counting Pipeline

```
Frame
 ↓
Background subtraction (OpenCV MOG2)
 ↓
Motion blob extraction
 ↓
Centroid tracking
 ↓
Line-crossing detection
 ↓
Update people_in / people_out / occupancy
```

### Detection Components

- **Background subtraction (MOG2)** for motion detection
- **ROI-based entrance monitoring** to limit detection to relevant areas
- **Motion blob extraction** using contour detection
- **Centroid tracking** to estimate object movement
- **Line-crossing logic** to determine entry and exit events

This approach prioritizes:

- Real-time performance
- Low computational cost
- Stable IoT telemetry generation

The system is designed as an **edge analytics pipeline**, not as a high-accuracy AI benchmark.

The goal is not to maximize detection accuracy but to ensure stable performance on resource-constrained edge hardware.

# 5. System Architecture

The repository follows a **modular monorepo architecture** to enable parallel development and clear separation of responsibilities.

```
people-counting-system/
│
├── camera/          # Camera interface and frame acquisition
│
├── processing/      # Edge analytics: motion detection and people counting
│
├── communication/   # MQTT messaging and device communication
│
├── storage/         # Local telemetry logging utilities
│
├── analytics/       # Historical data analysis and KPI computation
│
├── shared/          # Shared data schema and common utilities
│
├── dashboard/       # Real-time web dashboard and visualization
│
├── config/          # Device configuration templates
│
├── deploy/          # Deployment configuration (systemd service)
```

This architecture supports:

- independent module development
- easier testing and debugging
- scalable system integration

# 6. Module Responsibilities

## Camera Module

Handles video acquisition from the Raspberry Pi camera.

Responsibilities:

- Capture video frames
- Configure resolution and frame rate
- Monitor performance metrics (FPS, CPU usage)
- Provide recorded videos for offline testing

Output:

```
Raw video frames
```

## Processing Module

Performs **edge video analytics** and people counting.

Responsibilities:

- Motion detection using **background subtraction (MOG2)**
- Motion blob extraction
- Centroid tracking
- Line-crossing detection
- Occupancy estimation
- Brightness estimation

Output:

```
Structured JSON telemetry
```

Example logic:

```
Motion detected in entrance ROI
↓
Extract motion blobs
↓
Track centroid movement
↓
Detect line crossing
↓
Update people_in / people_out
↓
Compute occupancy
```

## Communication Module

Handles **device-to-system communication**.

Responsibilities:

- Publish structured telemetry via **MQTT**
- Maintain consistent message formatting
- Enable real-time dashboard updates

Example MQTT topic:

```
people_counting/data
```

## Storage Module

Handles **local persistence of telemetry data**.

Responsibilities:

- Store structured JSON logs
- Enable offline debugging
- Support replay and analytics

Log format:

```
JSON Lines (.jsonl)
```

## Analytics Module

Performs **historical data analysis** on stored logs.

Example metrics:

- Peak occupancy
- Hourly entry counts
- Average processing FPS
- CPU utilization trends

These metrics provide **long-term system insights beyond real-time monitoring**.

## Dashboard Module

Provides **real-time visualization of system telemetry**.

Displays:

- Current occupancy
- People entering / leaving
- Motion score
- Brightness level
- System performance metrics

Features:

- Live MQTT data streaming
- Support for mock data during development
- Lightweight browser-based interface

# 7. Unified Data Schema

The schema is designed to remain stable so that all modules(camera, processing, dashboard, analytics) can operate independently.

All modules use a shared JSON schema defined in:

```
shared/data_schema_example.json
```

Example telemetry message:

```json
{
  "timestamp": "2026-03-06T00:25:29Z",
  "device_id": "pi-01",
  "zone": "main_entrance",
  "people_in": 34,
  "people_out": 32,
  "occupancy": 2,
  "motion_score": 0.012,
  "brightness": 0.45,
  "fps": 29.9,
  "cpu": 52.8
}
```

### Design Principles

- Core fields always present
- Optional fields allowed
- Dashboard tolerant to missing fields
- Schema updates require team agreement

# 8. Performance Evaluation

Because the system runs on a **Raspberry Pi 3 Model B+**, performance evaluation focuses on:

- Processing **frames per second (FPS)**
- **CPU utilization**
- **Processing latency**
- System stability under continuous operation

These measurements ensure the algorithm remains **practical for edge deployment**.

# 9. Optional Extension — YOLO-Based Detection

As a stretch goal, the system may integrate lightweight **YOLO-based person detection**.

Possible approach:

- Run YOLO inference at a low frequency (e.g., 1 FPS)
- Use results to validate or enhance motion-based counting
- Attach object detection metadata to the telemetry stream

This extension improves accuracy while preserving the **core real-time pipeline**.

# 10. Hardware & Software Stack

### Hardware

- Raspberry Pi 3 Model B+
- Raspberry Pi Camera Module V2
- MicroSD card
- Power supply

### Software

- Python 3
- OpenCV
- NumPy
- MQTT (Mosquitto broker)
- React + Vite dashboard

# 11. Final Deliverables

The project deliverables include:

- Working **people counting system demonstration**
- Real-time web dashboard
- Modular source code repository
- System architecture documentation
- Performance evaluation report

# 12. Reproducibility

The repository is structured to allow straightforward reproduction on Raspberry Pi devices.

To run the system on a new device:

1. Install system dependencies
2. Clone the repository
3. Install Python dependencies
4. Configure the device configuration file
5. Run the edge pipeline

Detailed instructions are provided in **`SETUP.md`**.
