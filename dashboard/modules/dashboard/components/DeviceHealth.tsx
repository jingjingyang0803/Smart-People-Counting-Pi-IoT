import type { Payload } from "../types";
import { formatUptime } from "../services/compute";

export default function DeviceHealth({
  health,
}: {
  health: Payload["health"];
}) {
  return (
    <div className="healthGrid">
      <div className="panel card">
        <div className="cardTitle">Last frame</div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
          {health.lastFrameTs}
        </div>
      </div>
      <div className="panel card">
        <div className="cardTitle">FPS</div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
          {health.fps.toFixed(1)}
        </div>
      </div>
      <div className="panel card">
        <div className="cardTitle">CPU temp</div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
          {health.cpuTempC.toFixed(1)} °C
        </div>
      </div>
      <div className="panel card">
        <div className="cardTitle">Uptime</div>
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
          {formatUptime(health.uptimeSec)}
        </div>
      </div>
    </div>
  );
}
