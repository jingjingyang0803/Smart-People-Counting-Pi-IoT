# Communication Module

## Responsibility

The Communication module is responsible for transmitting structured IoT data from the edge device (Raspberry Pi) to external systems such as the dashboard or server.

Main responsibilities:

- MQTT-based communication
- Unified JSON schema handling
- Event publishing
- Message logging
- Decoupling processing from visualization

## Why MQTT?

This project uses **MQTT** instead of REST for the following reasons:

### 1️⃣ Designed for IoT

MQTT is:

- Lightweight
- Low-bandwidth
- Publish/subscribe based
- Designed for constrained devices

Raspberry Pi 3B+ is a limited edge device, so lightweight communication is preferred.

### 2️⃣ Publish/Subscribe Architecture

Unlike REST (request–response model), MQTT uses:

```
Publisher → Broker → Subscriber
```

In this system:

```
Raspberry Pi → MQTT Broker → Dashboard
```

Benefits:

- Loose coupling between modules
- Dashboard does not directly depend on device
- Multiple subscribers possible (analytics, logging, monitoring)
- Easier scalability

### 3️⃣ Real-Time Streaming

People counting requires:

- Continuous data flow
- Near real-time updates
- Minimal overhead

MQTT allows:

- Persistent connection
- Low-latency message delivery
- Efficient small-payload transmission

REST would require repeated HTTP requests and higher overhead.

## MQTT Broker

Default configuration:

```
Broker: localhost
Port: 1883
```

Example broker: Mosquitto

Start broker:

```bash
sudo systemctl start mosquitto
```

## MQTT Topic Structure

Current topic:

```
people_counting/data
```

Design logic:

- `people_counting` → system namespace
- `data` → real-time telemetry

Future scalable structure:

```
people_counting/<device_id>/<zone>/data
```

This allows:

- Multi-device deployment
- Multi-zone monitoring
- Cloud expansion

## How to Run

Ensure MQTT broker is running.

Install dependency:

```bash
pip install paho-mqtt
```

Then import and use:

```python
from mqtt_client import publish
```

## Payload Schema

All messages must follow the unified schema:

```
../shared/data_schema_example.json
```

Example:

```json
{
  "timestamp": "2026-02-18T14:25:12Z",
  "device_id": "pi-01",
  "zone": "main_entrance",
  "motion_score": 0.68,
  "people_in": 3,
  "people_out": 1,
  "occupancy": 12,
  "brightness": 0.45,
  "fps": 14.8,
  "cpu": 55.2
}
```

Core fields are always present. Optional fields (e.g., YOLO metadata) may be included.

## Design Considerations

### Decoupled Architecture

The Processing module does not directly interact with the Dashboard.

Communication layer ensures:

- Separation of concerns
- Independent development
- Easier testing (mock publisher/subscriber)

### Reliability & QoS

MQTT supports Quality of Service (QoS):

- QoS 0 → Fast, no guarantee
- QoS 1 → At least once delivery
- QoS 2 → Exactly once delivery

For this project:

- QoS 1 is recommended to balance reliability and performance.

### Scalability

This design allows future expansion:

- Cloud broker instead of localhost
- Remote monitoring
- Database subscription
- Multi-Pi deployment

## Comparison: MQTT vs REST

| Feature               | MQTT              | REST             |
| --------------------- | ----------------- | ---------------- |
| Communication Model   | Publish/Subscribe | Request/Response |
| Overhead              | Low               | Higher           |
| Real-time streaming   | Native            | Polling required |
| IoT suitability       | High              | Moderate         |
| Persistent connection | Yes               | No               |

For a real-time people counting IoT system, MQTT is more suitable.

## Output

The Communication module:

- Publishes structured IoT messages
- Ensures schema consistency
- Enables real-time visualization
- Supports future scalability
