# communication/mqtt_client.py
import json
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883
TOPIC = "people_counting/data"

_client = mqtt.Client()
_client.connect(BROKER, PORT, 60)
_client.loop_start()

def publish(data):
    _client.publish(TOPIC, json.dumps(data))
