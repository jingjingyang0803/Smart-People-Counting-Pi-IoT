import type { Payload } from "./types";
import KpiCard from "./components/KpiCard";
import TrafficTrendMini from "./components/TrafficTrendMini";
import InOutSplitMini from "./components/InOutSplitMini";
import {
  getBuckets,
  getOccupancy,
  getPeakBucket,
  getTotalVisitors,
  formatHHMM,
  formatSiteName,
} from "./services/compute";

export default function BusinessDashboard({ data }: { data: Payload }) {
  const buckets = getBuckets(data);
  const peak = getPeakBucket(buckets);

  const visitors = getTotalVisitors(data);
  const occupancy = getOccupancy(data);

  const inCount = data.aggregates.total.in;
  const outCount = data.aggregates.total.out;

  const capacity = 20; // demo value
  const utilization = Math.min(999, Math.round((occupancy / capacity) * 100));

  const status =
    utilization >= 90 ? "Over capacity" : utilization >= 70 ? "Busy" : "Normal";

  const statusVariant =
    status === "Normal" ? "normal" : status === "Busy" ? "busy" : "over";

  return (
    <>
      <section className="panel meta">
        <div>
          <b>Location:</b> {formatSiteName(data.siteId)} · <b>Entrance:</b>{" "}
          {data.zone.name}
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
          variant={statusVariant as any}
        />
      </section>

      <section className="section">
        <h2 className="h2">Today overview</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <InOutSplitMini inCount={inCount} outCount={outCount} />
          {/* 你已有的趋势图组件也很适合管理者 */}
          <TrafficTrendMini buckets={buckets} />
        </div>
      </section>
    </>
  );
}
