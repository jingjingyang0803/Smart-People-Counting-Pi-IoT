import { useEffect, useMemo, useState } from "react";
import { subscribeToLiveTelemetry } from "./services/mqtt";
import { normalizeLiveTelemetry } from "./services/normalize";
import type { LiveDashboardState, LiveTelemetryMessage } from "./types";
import KpiCard from "./components/KpiCard";

const MAX_POINTS = 30;

type ConnectionStatus = "connecting" | "connected" | "error" | "closed";

function formatTime(ts?: string) {
  if (!ts) return "--";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatNumber(value: number | null | undefined, digits = 2) {
  if (value == null) return "--";
  return value.toFixed(digits);
}

function getStatus(
  current: LiveDashboardState | null,
  connectionStatus: ConnectionStatus,
) {
  if (connectionStatus === "connecting") return "Connecting";
  if (connectionStatus === "error" || connectionStatus === "closed") {
    return "Disconnected";
  }
  if (!current) return "Waiting for data";
  if (current.occupancyMismatch) return "Warning";
  if (current.crowdLevel === "crowded") return "Busy";
  if (current.crowdLevel === "medium") return "Warning";
  return "Normal";
}

export default function TechnicalDashboard() {
  const [current, setCurrent] = useState<LiveDashboardState | null>(null);
  const [history, setHistory] = useState<LiveDashboardState[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const unsubscribe = subscribeToLiveTelemetry(
      (msg: LiveTelemetryMessage) => {
        const normalized = normalizeLiveTelemetry(msg);
        setCurrent(normalized);
        setHistory((prev) => [...prev.slice(-(MAX_POINTS - 1)), normalized]);
      },
      setConnectionStatus,
    );

    return unsubscribe;
  }, []);

  const status = useMemo(
    () => getStatus(current, connectionStatus),
    [current, connectionStatus],
  );

  const statusVariant: "normal" | "busy" | "over" =
    status === "Normal" ? "normal" : status === "Busy" ? "busy" : "over";

  const consistency = current?.occupancyMismatch ? "Mismatch" : "OK";
  const consistencyVariant: "normal" | "over" =
    consistency === "OK" ? "normal" : "over";

  return (
    <>
      <section className="panel meta">
        <div>
          <b>Device:</b> {current?.deviceId ?? "--"} · <b>Zone:</b>{" "}
          {current?.zoneName ?? "--"} · <b>Last update:</b>{" "}
          {formatTime(current?.timestamp)}
        </div>
        <div className="subtle">
          MQTT status: {connectionStatus} · Messages received: {history.length}
        </div>
      </section>

      <section className="grid">
        <KpiCard title="Current occupancy" value={current?.occupancy ?? 0} />
        <KpiCard title="Total IN" value={current?.peopleIn ?? 0} />
        <KpiCard title="Total OUT" value={current?.peopleOut ?? 0} />
        <KpiCard
          title="System status"
          value={status}
          subtitle={`MQTT: ${connectionStatus}`}
          variant={statusVariant}
        />
        <KpiCard
          title="Crowd level"
          value={current?.crowdLevel ?? "--"}
          subtitle={
            current?.capacity != null ? `Capacity: ${current.capacity}` : ""
          }
          variant={
            current?.crowdLevel === "low"
              ? "normal"
              : current?.crowdLevel === "medium"
                ? "busy"
                : current?.crowdLevel === "crowded"
                  ? "over"
                  : "normal"
          }
        />
        <KpiCard title="FPS" value={current?.fps ?? "--"} />
        <KpiCard title="CPU %" value={current?.cpu ?? "--"} />
        <KpiCard
          title="CPU Temp"
          value={
            current?.cpuTemp != null
              ? `${formatNumber(current.cpuTemp, 1)} °C`
              : "--"
          }
        />
        <KpiCard
          title="Brightness"
          value={formatNumber(current?.brightness, 3)}
        />
        <KpiCard
          title="Motion score"
          value={formatNumber(current?.motionScore, 4)}
        />
        <KpiCard title="Messages received" value={history.length} />
        <KpiCard
          title="Data consistency"
          value={consistency}
          subtitle={
            current?.occupancyMismatch
              ? "occupancy ≠ people_in - people_out"
              : "occupancy is consistent"
          }
          variant={consistencyVariant}
        />
      </section>

      <section className="section">
        <h2 className="h2">Recent trend</h2>
        <div className="panel" style={{ padding: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {history.slice(-12).map((item, idx) => (
              <div
                key={`${item.timestamp}-${idx}`}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="subtle" style={{ marginBottom: 8 }}>
                  {formatTime(item.timestamp)}
                </div>
                <div>
                  <b>Occ:</b> {item.occupancy}
                </div>
                <div>
                  <b>Crowd:</b> {item.crowdLevel ?? "--"}
                </div>
                <div>
                  <b>FPS:</b> {item.fps ?? "--"}
                </div>
                <div>
                  <b>CPU:</b> {item.cpu ?? "--"}
                </div>
                <div>
                  <b>Temp:</b>{" "}
                  {item.cpuTemp != null
                    ? `${formatNumber(item.cpuTemp, 1)} °C`
                    : "--"}
                </div>
                <div>
                  <b>Brightness:</b> {formatNumber(item.brightness, 3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
          }}
        >
          <h2 className="h2" style={{ marginBottom: 12 }}>
            Recent messages
          </h2>
          <div className="subtle">Latest {history.length} messages</div>
        </div>

        <div className="panel" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.6fr 0.8fr 0.8fr 0.8fr 0.9fr 0.9fr 1fr 0.9fr",
              gap: 12,
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 600,
            }}
          >
            <div>time</div>
            <div>occ</div>
            <div>in</div>
            <div>out</div>
            <div>fps</div>
            <div>cpu</div>
            <div>cpu temp</div>
            <div>crowd</div>
          </div>

          {history.length === 0 ? (
            <div style={{ padding: 16 }} className="subtle">
              No messages received yet.
            </div>
          ) : (
            history
              .slice()
              .reverse()
              .map((item, idx) => (
                <div
                  key={`${item.timestamp}-${idx}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1.6fr 0.8fr 0.8fr 0.8fr 0.9fr 0.9fr 1fr 0.9fr",
                    gap: 12,
                    padding: "14px 16px",
                    borderBottom:
                      idx === history.length - 1
                        ? "none"
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>{formatTime(item.timestamp)}</div>
                  <div>{item.occupancy}</div>
                  <div>{item.peopleIn}</div>
                  <div>{item.peopleOut}</div>
                  <div>{item.fps ?? "--"}</div>
                  <div>{item.cpu ?? "--"}</div>
                  <div>
                    {item.cpuTemp != null
                      ? `${formatNumber(item.cpuTemp, 1)} °C`
                      : "--"}
                  </div>
                  <div>{item.crowdLevel ?? "--"}</div>
                </div>
              ))
          )}
        </div>
      </section>
    </>
  );
}
