import mqtt from "mqtt";
import type { LiveTelemetryMessage } from "../types";

const MQTT_URL = "ws://localhost:9001";
const MQTT_TOPIC = "people_counting/data";

export function subscribeToLiveTelemetry(
  onMessage: (msg: LiveTelemetryMessage) => void,
) {
  const client = mqtt.connect(MQTT_URL);

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error("Subscribe error:", err);
      }
    });
  });

  client.on("message", (_topic, payload) => {
    try {
      const parsed = JSON.parse(payload.toString()) as LiveTelemetryMessage;
      onMessage(parsed);
    } catch (error) {
      console.error("Invalid MQTT message:", error);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  return () => {
    client.end(true);
  };
}
