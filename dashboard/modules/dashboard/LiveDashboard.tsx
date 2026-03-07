import { useEffect, useMemo, useState } from "react";
import { subscribeToLiveTelemetry } from "./services/mqtt";
import { normalizeLiveTelemetry } from "./services/normalize";
import type { LiveDashboardState, LiveTelemetryMessage } from "./types";
import KpiCard from "./components/KpiCard";

const MAX_POINTS = 30;

export default function LiveDashboard() {
  const [current, setCurrent] = useState<LiveDashboardState | null>(null);
  const [history, setHistory] = useState<LiveDashboardState[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveTelemetry(
      (msg: LiveTelemetryMessage) => {
        const normalized = normalizeLiveTelemetry(msg);

        setCurrent(normalized);
        setHistory((prev) => [...prev.slice(-(MAX_POINTS - 1)), normalized]);
      },
    );

    return unsubscribe;
  }, []);

  const status = useMemo(() => {
    if (!current) return "Waiting for data";
    if (current.occupancy > 20) return "Busy";
    return "Normal";
  }, [current]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Live Monitoring</h1>
        <p className="text-gray-400 mt-2">Real-time telemetry from MQTT</p>
      </div>

      <div className="rounded-3xl border p-6">
        <div className="text-lg font-semibold">
          Device: {current?.deviceId ?? "--"}
        </div>
        <div className="text-gray-400">Zone: {current?.zoneName ?? "--"}</div>
        <div className="text-gray-400">
          Last update: {current?.timestamp ?? "--"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Current occupancy" value={current?.occupancy ?? 0} />
        <KpiCard title="Total IN" value={current?.peopleIn ?? 0} />
        <KpiCard title="Total OUT" value={current?.peopleOut ?? 0} />
        <KpiCard title="Status" value={status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard title="FPS" value={current?.fps ?? "--"} />
        <KpiCard title="CPU" value={current?.cpu ?? "--"} />
      </div>

      {current?.occupancyMismatch && (
        <div className="rounded-3xl border p-4 text-sm">
          Warning: occupancy does not match people_in - people_out.
        </div>
      )}

      <div className="rounded-3xl border p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent messages</h2>
        <div className="space-y-2 text-sm">
          {history
            .slice()
            .reverse()
            .map((item, idx) => (
              <div
                key={`${item.timestamp}-${idx}`}
                className="flex justify-between border-b pb-2"
              >
                <span>{item.timestamp}</span>
                <span>occ={item.occupancy}</span>
                <span>in={item.peopleIn}</span>
                <span>out={item.peopleOut}</span>
                <span>fps={item.fps ?? "--"}</span>
                <span>cpu={item.cpu ?? "--"}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
