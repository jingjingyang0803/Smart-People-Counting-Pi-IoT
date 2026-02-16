import { useEffect, useMemo, useState } from "react";

type Point = [number, number];

type Payload = {
  schemaVersion: string;
  siteId: string;
  sensorId: string;
  zone: {
    name: string;
    line: { id: string; a: Point; b: Point; insideHint: string };
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
    <div className="container">
      <header className="topbar">
        <div>
          <h1 className="h1">Smart People Counting Dashboard</h1>
          <div className="subtle">
            Mock-driven UI · Entrance IN/OUT counting
          </div>
        </div>

        <div className="controls">
          <label className="label">
            Data source
            <select
              className="select"
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

          <label className="label">
            Events
            <select
              className="select"
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

      {loading && <p className="subtle">Loading…</p>}
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {data && (
        <>
          <section className="panel meta">
            <div>
              <b>Site:</b> {data.siteId} · <b>Sensor:</b> {data.sensorId} ·{" "}
              <b>Zone:</b> {data.zone.name}
            </div>
            <div className="subtle">
              Window: {data.window.start} → {data.window.end} · Generated:{" "}
              {data.generatedAt}
            </div>
            <div className="subtle">
              Line: {data.zone.line.id} · A={JSON.stringify(data.zone.line.a)}{" "}
              B={JSON.stringify(data.zone.line.b)} · Inside:{" "}
              {data.zone.line.insideHint}
            </div>
          </section>

          <section className="grid">
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

          <section className="section">
            <h2 className="h2">Traffic trend</h2>
            {buckets.length === 0 ? (
              <p className="subtle">
                No byMinute/byHour buckets found in aggregates.
              </p>
            ) : (
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Bucket start</th>
                      <th>IN</th>
                      <th>OUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buckets.map((b) => (
                      <tr key={b.ts}>
                        <td>{b.ts}</td>
                        <td>{b.in}</td>
                        <td>{b.out}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="section">
            <h2 className="h2">Recent crossing events</h2>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>ts</th>
                    <th>direction</th>
                    <th>trackId</th>
                    <th>confidence</th>
                    <th>snapshot</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((e, idx) => (
                    <tr key={`${e.ts}-${e.trackId}-${idx}`}>
                      <td>{e.ts}</td>
                      <td>
                        <span
                          className={`pill ${e.direction === "in" ? "pillIn" : "pillOut"}`}
                        >
                          {e.direction.toUpperCase()}
                        </span>
                      </td>
                      <td>{e.trackId}</td>
                      <td>{e.confidence.toFixed(2)}</td>
                      <td>{e.snapshot?.path ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <h2 className="h2">Device health</h2>
            <div className="healthGrid">
              <HealthCard label="Last frame" value={data.health.lastFrameTs} />
              <HealthCard label="FPS" value={data.health.fps.toFixed(1)} />
              <HealthCard
                label="CPU temp"
                value={`${data.health.cpuTempC.toFixed(1)} °C`}
              />
              <HealthCard
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
    <div className="panel card">
      <div className="cardTitle">{props.title}</div>
      <div className="cardValue">{props.value}</div>
      {props.subtitle ? <div className="cardSub">{props.subtitle}</div> : null}
    </div>
  );
}

function HealthCard(props: { label: string; value: string }) {
  return (
    <div className="panel card">
      <div className="cardTitle">{props.label}</div>
      <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18 }}>
        {props.value}
      </div>
    </div>
  );
}
