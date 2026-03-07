import { useMemo, useState } from "react";
import type { Payload } from "./types";
import MetaPanel from "./components/MetaPanel";
import TrafficTrendTable from "./components/TrafficTrendTable";
import EventsTable from "./components/EventsTable";
import DeviceHealth from "./components/DeviceHealth";
import { getBuckets } from "./services/compute";

export default function AnalyticsDashboard({ data }: { data: Payload }) {
  const buckets = getBuckets(data);
  const [direction, setDirection] = useState<"all" | "in" | "out">("all");

  const events = useMemo(() => {
    const all = [...data.events].sort((a, b) => (a.ts < b.ts ? 1 : -1));
    if (direction === "all") return all;
    return all.filter((e) => e.direction === direction);
  }, [data.events, direction]);

  const totalIn = data.aggregates.total.in;
  const totalOut = data.aggregates.total.out;
  const net = data.aggregates.total.net;
  const currentOccupancy = data.aggregates.occupancyEstimate?.current ?? net;
  const peakFlow = buckets.reduce(
    (best, bucket) => {
      const flow = bucket.in + bucket.out;
      if (!best || flow > best.flow) {
        return { ts: bucket.ts, flow };
      }
      return best;
    },
    null as { ts: string; flow: number } | null,
  );

  const avgFps = data.health.fps;
  const cpuTemp = data.health.cpuTempC;

  return (
    <>
      <MetaPanel data={data} />

      <section className="grid">
        <div className="panel" style={{ padding: 18 }}>
          <div className="subtle">Total IN</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalIn}</div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div className="subtle">Total OUT</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalOut}</div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div className="subtle">Net flow</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{net}</div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div className="subtle">Estimated occupancy</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {currentOccupancy}
          </div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div className="subtle">Peak bucket</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {peakFlow ? peakFlow.ts : "--"}
          </div>
          <div className="subtle">
            {peakFlow ? `Flow: ${peakFlow.flow}` : "No data"}
          </div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div className="subtle">Device health</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {avgFps.toFixed(1)} FPS
          </div>
          <div className="subtle">{cpuTemp.toFixed(1)} °C</div>
        </div>
      </section>

      <section className="section">
        <h2 className="h2">Traffic trend (buckets)</h2>
        <TrafficTrendTable buckets={buckets} />
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
          <h2 className="h2" style={{ margin: 0 }}>
            Raw crossing events
          </h2>
          <label className="label">
            Filter
            <select
              className="select"
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as "all" | "in" | "out")
              }
            >
              <option value="all">All</option>
              <option value="in">IN</option>
              <option value="out">OUT</option>
            </select>
          </label>
        </div>
        <EventsTable events={events} />
      </section>

      <section className="section">
        <h2 className="h2">Device health</h2>
        <DeviceHealth health={data.health} />
      </section>
    </>
  );
}
