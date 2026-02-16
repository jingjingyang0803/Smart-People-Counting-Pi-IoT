import type { Payload } from "./types";
import KpiCard from "./components/KpiCard";
import TrafficTrendMini from "./components/TrafficTrendMini";
import {
  getBuckets,
  getOccupancy,
  getPeakBucket,
  getTotalVisitors,
  formatHHMM,
} from "./services/compute";

export default function BusinessDashboard({ data }: { data: Payload }) {
  const buckets = getBuckets(data);
  const peak = getPeakBucket(buckets);
  const visitors = getTotalVisitors(data);
  const occupancy = getOccupancy(data);

  const capacity = 20; // 先写死：课程项目足够，后续可移到 config
  const utilization = Math.min(999, Math.round((occupancy / capacity) * 100));

  const status =
    utilization >= 90 ? "Over capacity" : utilization >= 70 ? "Busy" : "Normal";

  return (
    <>
      <section className="panel meta">
        <div>
          <b>Location:</b> {data.siteId} · <b>Entrance:</b> {data.zone.name}
        </div>
        <div className="subtle">
          Period: {data.window.start} → {data.window.end}
        </div>
      </section>

      <section className="grid">
        <KpiCard title="Today visitors" value={visitors} subtitle="Total IN" />
        <KpiCard
          title="Current occupancy"
          value={occupancy}
          subtitle={`Capacity: ${capacity}`}
        />
        <KpiCard
          title="Peak time"
          value={peak ? formatHHMM(peak.ts) : "—"}
          subtitle={peak ? `Flow: ${peak.in + peak.out}` : ""}
        />
        <KpiCard
          title="Status"
          value={status}
          subtitle={`${utilization}% used`}
        />
      </section>

      <section className="section">
        <h2 className="h2">Traffic trend</h2>
        <TrafficTrendMini buckets={buckets} />
      </section>
    </>
  );
}
