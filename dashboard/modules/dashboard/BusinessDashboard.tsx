import { useEffect, useMemo, useState } from "react";
import { subscribeToLiveTelemetry } from "./services/mqtt";
import { normalizeLiveTelemetry } from "./services/normalize";
import type { LiveDashboardState, LiveTelemetryMessage } from "./types";
import KpiCard from "./components/KpiCard";

type ConnectionStatus = "connecting" | "connected" | "error" | "closed";

const MAX_POINTS = 24;

function formatTime(ts?: string) {
  if (!ts) return "--";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BusinessDashboard() {
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

  const capacity = current?.capacity ?? 20;
  const occupancy = current?.occupancy ?? 0;
  const utilization =
    capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;

  const status = useMemo(() => {
    if (!current) return "Waiting";
    if (current.crowdLevel === "crowded") return "Crowded";
    if (current.crowdLevel === "medium") return "Medium";
    return "Low";
  }, [current]);

  const statusVariant: "normal" | "busy" | "over" =
    status === "Low" ? "normal" : status === "Medium" ? "busy" : "over";

  const peakOccupancy = history.reduce(
    (max, item) => Math.max(max, item.occupancy),
    occupancy,
  );

  const totalIn = current?.peopleIn ?? 0;
  const totalOut = current?.peopleOut ?? 0;

  return (
    <>
      <section className="panel meta">
        <div>
          <b>Zone:</b> {current?.zoneName ?? "--"} · <b>Last update:</b>{" "}
          {formatTime(current?.timestamp)}
        </div>
        <div className="subtle">
          Capacity-aware business view · MQTT: {connectionStatus}
        </div>
      </section>

      <section className="grid">
        <KpiCard
          title="Current occupancy"
          value={occupancy}
          subtitle={`Capacity: ${capacity}`}
        />
        <KpiCard
          title="Utilization"
          value={`${utilization}%`}
          subtitle={`${occupancy} / ${capacity}`}
        />
        <KpiCard
          title="Crowd status"
          value={status}
          subtitle="Dynamic by capacity"
          variant={statusVariant}
        />
        <KpiCard
          title="Peak occupancy"
          value={peakOccupancy}
          subtitle="Recent live window"
        />
        <KpiCard title="People IN" value={totalIn} />
        <KpiCard title="People OUT" value={totalOut} />
      </section>

      <section className="section">
        <h2 className="h2">Live KPI trend</h2>
        <div
          className="panel"
          style={{
            padding: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {history.slice(-8).map((item, idx) => {
              const itemCapacity = item.capacity ?? capacity;
              const itemUtilization =
                itemCapacity > 0
                  ? Math.round((item.occupancy / itemCapacity) * 100)
                  : 0;

              return (
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
                    <b>Util:</b> {itemUtilization}%
                  </div>
                  <div>
                    <b>Status:</b> {item.crowdLevel ?? "--"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="h2">Current business interpretation</h2>
        <div className="panel" style={{ padding: 20 }}>
          <p style={{ margin: 0 }}>
            The monitored entrance currently has <b>{occupancy}</b> people in
            the space, with a configured capacity of <b>{capacity}</b>. This
            corresponds to <b>{utilization}% utilization</b> and the current
            crowd level is <b>{status}</b>.
          </p>
        </div>
      </section>
    </>
  );
}
