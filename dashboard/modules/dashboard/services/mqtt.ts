import mqtt from "mqtt";
import type { LiveTelemetryMessage } from "../types";

// const MQTT_URL = "ws://localhost:9001";
// https://www.hivemq.com/demos/websocket-client/
// Host: broker.hivemq.com
// Port: 8884
// SSL: ✔
const MQTT_URL = "wss://broker.hivemq.com:8884/mqtt";
const MQTT_TOPIC = "people_counting/data";

export function subscribeToLiveTelemetry(
  onMessage: (msg: LiveTelemetryMessage) => void,
  onStatusChange?: (
    status: "connecting" | "connected" | "error" | "closed",
  ) => void,
) {
  onStatusChange?.("connecting");

  const client = mqtt.connect(MQTT_URL);

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    onStatusChange?.("connected");

    client.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error("Subscribe error:", err);
        onStatusChange?.("error");
      }
    });
  });

  client.on("message", (_topic, payload) => {
    try {
      const parsed = JSON.parse(String(payload)) as LiveTelemetryMessage;
      onMessage(parsed);
    } catch (error) {
      console.error("Invalid MQTT message:", error);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err);
    onStatusChange?.("error");
  });

  client.on("close", () => {
    console.log("MQTT connection closed");
    onStatusChange?.("closed");
  });

  return () => {
    client.end(true);
  };
}
