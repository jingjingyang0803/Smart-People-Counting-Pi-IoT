import { useMemo, useState } from "react";
import type { Payload } from "./types";
import MetaPanel from "./components/MetaPanel";
import TrafficTrendTable from "./components/TrafficTrendTable";
import EventsTable from "./components/EventsTable";
import DeviceHealth from "./components/DeviceHealth";
import { getBuckets } from "./services/compute";

export default function TechnicalDashboard({ data }: { data: Payload }) {
  const buckets = getBuckets(data);
  const [direction, setDirection] = useState<"all" | "in" | "out">("all");

  const events = useMemo(() => {
    const all = [...data.events].sort((a, b) => (a.ts < b.ts ? 1 : -1));
    if (direction === "all") return all;
    return all.filter((e) => e.direction === direction);
  }, [data.events, direction]);

  return (
    <>
      <MetaPanel data={data} />

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
              onChange={(e) => setDirection(e.target.value as any)}
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
