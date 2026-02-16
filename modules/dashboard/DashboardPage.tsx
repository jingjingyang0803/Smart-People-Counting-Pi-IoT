import { useEffect, useMemo, useState } from "react";

type Point = [number, number];

type Payload = {
  schemaVersion: string;
  siteId: string;
  sensorId: string;
  zone: {
    name: string;
    line: {
      id: string;
      a: Point;
      b: Point;
      insideHint: string;
    };
  };
  generatedAt: string;
  window: { start: string; end: string };
  events: Array<{
    type: "crossing";
    ts: string;
    direction: "in" | "out";
    trackId: string;
    confidence: number;
    snapshot?: { path: string };
  }>;
  aggregates: {
    total: { in: number; out: number; net: number };
    byMinute?: Array<{ ts: string; in: number; out: number }>;
    byHour?: Array<{ ts: string; in: number; out: number }>;
    occupancyEstimate?: { current: number; method: "net_count" };
  };
  health: {
    lastFrameTs: string;
    fps: number;
    cpuTempC: number;
    uptimeSec: number;
  };
};

const MOCK_FILES = [
  { label: "sample_1.json", path: "/data/mock/sample_1.json" },
  { label: "sample_2.json", path: "/data/mock/sample_2.json" },
];

function formatUptime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function DashboardPage() {
  const [selected, setSelected] = useState(MOCK_FILES[0].path);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<"all" | "in" | "out">(
    "all",
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      setData(null);

      try {
        const res = await fetch(selected, { cache: "no-store" });
        if (!res.ok)
          throw new Error(`Failed to fetch ${selected} (HTTP ${res.status})`);
        const json = (await res.json()) as Payload;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const buckets = useMemo(() => {
    if (!data) return [];
    return data.aggregates.byMinute ?? data.aggregates.byHour ?? [];
  }, [data]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    const all = [...data.events].sort((a, b) => (a.ts < b.ts ? 1 : -1));
    if (directionFilter === "all") return all;
    return all.filter((e) => e.direction === directionFilter);
  }, [data, directionFilter]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Smart People Counting Dashboard</h2>
          <div style={{ opacity: 0.75, marginTop: 4 }}>
            Mock-driven UI · Entrance IN/OUT counting
          </div>
        </div>

        <div style={styles.controls}>
          <label style={styles.label}>
            Data source
            <select
              style={styles.select}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {MOCK_FILES.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.label}>
            Events
            <select
              style={styles.select}
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="in">IN</option>
              <option value="out">OUT</option>
            </select>
          </label>
        </div>
      </header>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {data && (
        <>
          <section style={styles.meta}>
            <div>
              <b>Site:</b> {data.siteId} · <b>Sensor:</b> {data.sensorId} ·{" "}
              <b>Zone:</b> {data.zone.name}
            </div>
            <div style={{ opacity: 0.75 }}>
              Window: {data.window.start} → {data.window.end} · Generated:{" "}
              {data.generatedAt}
            </div>
            <div style={{ opacity: 0.75 }}>
              Line: {data.zone.line.id} · A={JSON.stringify(data.zone.line.a)}{" "}
              B={JSON.stringify(data.zone.line.b)} · Inside:{" "}
              {data.zone.line.insideHint}
            </div>
          </section>

          {/* KPI cards */}
          <section style={styles.grid}>
            <KpiCard title="Total IN" value={data.aggregates.total.in} />
            <KpiCard title="Total OUT" value={data.aggregates.total.out} />
            <KpiCard title="Net" value={data.aggregates.total.net} />
            <KpiCard
              title="Occupancy (est.)"
              value={data.aggregates.occupancyEstimate?.current ?? "—"}
              subtitle={
                data.aggregates.occupancyEstimate
                  ? `method: ${data.aggregates.occupancyEstimate.method}`
                  : ""
              }
            />
          </section>

          {/* Trend */}
          <section style={styles.section}>
            <h3 style={styles.h3}>Traffic trend</h3>
            {buckets.length === 0 ? (
              <p style={{ opacity: 0.75 }}>
                No byMinute/byHour buckets found in aggregates.
              </p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Bucket start</th>
                    <th style={styles.th}>IN</th>
                    <th style={styles.th}>OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((b) => (
                    <tr key={b.ts}>
                      <td style={styles.td}>{b.ts}</td>
                      <td style={styles.td}>{b.in}</td>
                      <td style={styles.td}>{b.out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Events */}
          <section style={styles.section}>
            <h3 style={styles.h3}>Recent crossing events</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ts</th>
                  <th style={styles.th}>direction</th>
                  <th style={styles.th}>trackId</th>
                  <th style={styles.th}>confidence</th>
                  <th style={styles.th}>snapshot</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e, idx) => (
                  <tr key={`${e.ts}-${e.trackId}-${idx}`}>
                    <td style={styles.td}>{e.ts}</td>
                    <td style={styles.td}>
                      <span style={pill(e.direction)}>
                        {e.direction.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{e.trackId}</td>
                    <td style={styles.td}>{e.confidence.toFixed(2)}</td>
                    <td style={styles.td}>{e.snapshot?.path ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Health */}
          <section style={styles.section}>
            <h3 style={styles.h3}>Device health</h3>
            <div style={styles.healthGrid}>
              <HealthItem label="Last frame" value={data.health.lastFrameTs} />
              <HealthItem label="FPS" value={data.health.fps.toFixed(1)} />
              <HealthItem
                label="CPU temp"
                value={`${data.health.cpuTempC.toFixed(1)} °C`}
              />
              <HealthItem
                label="Uptime"
                value={formatUptime(data.health.uptimeSec)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard(props: {
  title: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <div style={styles.card}>
      <div style={{ opacity: 0.7, fontSize: 13 }}>{props.title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
        {props.value}
      </div>
      {props.subtitle ? (
        <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
          {props.subtitle}
        </div>
      ) : null}
    </div>
  );
}

function HealthItem(props: { label: string; value: string }) {
  return (
    <div style={styles.healthItem}>
      <div style={{ opacity: 0.7, fontSize: 13 }}>{props.label}</div>
      <div style={{ marginTop: 6, fontWeight: 600 }}>{props.value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 18,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 12,
  },
  controls: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    opacity: 0.85,
  },
  select: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    minWidth: 180,
  },
  meta: {
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 14,
    marginBottom: 12,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  },
  section: { marginTop: 14 },
  h3: { margin: "8px 0 10px 0" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #eee",
    borderRadius: 12,
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "10px 10px",
    borderBottom: "1px solid #eee",
    fontSize: 13,
    opacity: 0.8,
  },
  td: {
    padding: "10px 10px",
    borderBottom: "1px solid #f2f2f2",
    verticalAlign: "top",
  },
  healthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  healthItem: { border: "1px solid #eee", borderRadius: 14, padding: 14 },
};

function pill(direction: "in" | "out"): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    fontSize: 12,
    fontWeight: 700,
  };
}
