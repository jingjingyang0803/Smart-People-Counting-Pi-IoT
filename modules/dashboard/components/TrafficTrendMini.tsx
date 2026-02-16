import type { Bucket } from "../types";
import { formatHHMM } from "../services/compute";

export default function TrafficTrendMini({ buckets }: { buckets: Bucket[] }) {
  if (buckets.length === 0)
    return <p className="subtle">No trend buckets available.</p>;

  const flows = buckets.map((b) => b.in + b.out);
  const max = Math.max(...flows, 1);

  return (
    <div className="panel" style={{ padding: 14 }}>
      <div className="subtle" style={{ marginBottom: 10 }}>
        Flow per bucket (IN+OUT)
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {buckets.map((b) => {
          const value = b.in + b.out;
          const pct = Math.round((value / max) * 100);
          return (
            <div
              key={b.ts}
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr 52px",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, opacity: 0.85 }}>
                {formatHHMM(b.ts)}
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                  background: "var(--panel-2)",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "rgba(99,102,241,0.55)",
                  }}
                />
              </div>
              <div style={{ textAlign: "right", fontWeight: 800 }}>{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
