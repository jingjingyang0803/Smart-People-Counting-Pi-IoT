# Communication Module

## Responsibility

- MQTT communication
- Unified JSON schema handling
- Event publishing
- Logging

## MQTT Broker

Default:
localhost

## MQTT Topic

people_counting/data

## How to Run

Ensure MQTT broker is running.

Install:
pip install paho-mqtt

Then import publish() function.

## Payload Schema

Defined in:
../shared/data_schema_example.json

All published messages must match this schema.

## Example Message

{
"timestamp": "...",
"device_id": "pi-01",
"zone": "main_entrance",
"people_in": 3,
"people_out": 1,
"occupancy": 12,
"fps": 14.8,
"cpu": 55.2
}
