# People Counting System (IoT Project)

## System Overview

Camera → Processing → MQTT → Dashboard

## Modules

### Camera

Handles video capture and performance measurement.

### Processing

Detects motion and updates people count.

### Communication

Publishes structured data via MQTT.

### Dashboard

Visualizes real-time data (built using Vite).

## Data Flow

1. Camera captures frame
2. Processing detects motion / updates count
3. Communication publishes JSON
4. Dashboard subscribes and displays data

## Team Development Strategy

- All members work in parallel
- Unified JSON schema defined in shared/
- Integration phase after two weeks
