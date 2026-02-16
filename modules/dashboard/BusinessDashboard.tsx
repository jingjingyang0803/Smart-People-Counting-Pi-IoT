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
import { SITE_DISPLAY_NAME, ZONE_CONFIG } from "./config";

export default function BusinessDashboard({ data }: { data: Payload }) {
  const buckets = getBuckets(data);
  const peak = getPeakBucket(buckets);

  const visitors = getTotalVisitors(data);
  const occupancy = getOccupancy(data);

  const inCount = data.aggregates.total.in;
  const outCount = data.aggregates.total.out;

  const siteName = SITE_DISPLAY_NAME[data.siteId] ?? data.siteId;
  const zoneKey = `${data.siteId}::${data.zone.name}`.toLowerCase();

  const cfg = ZONE_CONFIG[zoneKey] ?? {
    capacity: 20,
    busyPct: 70,
    overPct: 90,
  };

  const capacity = cfg.capacity;
  const utilization = Math.min(999, Math.round((occupancy / capacity) * 100));

  const status =
    utilization >= cfg.overPct
      ? "Over capacity"
      : utilization >= cfg.busyPct
        ? "Busy"
        : "Normal";

  const statusVariant =
    status === "Normal" ? "normal" : status === "Busy" ? "busy" : "over";

  return (
    <>
      <section className="panel meta">
        <div>
          <b>Location:</b> {siteName} · <b>Entrance:</b> {data.zone.name}
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

          <TrafficTrendMini buckets={buckets} />
        </div>
      </section>
    </>
  );
}
