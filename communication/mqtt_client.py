import json
import paho.mqtt.client as mqtt

BROKER = "localhost"
TOPIC = "people_counting/data"

client = mqtt.Client()
client.connect(BROKER)

def publish(data):
    client.publish(TOPIC, json.dumps(data))