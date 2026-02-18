export default function InOutSplitMini({
  inCount,
  outCount,
}: {
  inCount: number;
  outCount: number;
}) {
  const total = Math.max(1, inCount + outCount);
  const inPct = Math.round((inCount / total) * 100);
  const outPct = 100 - inPct;

  return (
    <div className="panel" style={{ padding: 14 }}>
      <div className="subtle" style={{ marginBottom: 10 }}>
        IN / OUT split (today)
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid var(--border)",
          background: "var(--panel-2)",
          display: "flex",
        }}
        aria-label={`IN ${inPct}%, OUT ${outPct}%`}
      >
        <div
          style={{ width: `${inPct}%`, background: "rgba(16,185,129,0.55)" }}
        />
        <div
          style={{ width: `${outPct}%`, background: "rgba(239,68,68,0.50)" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <div style={{ fontWeight: 800 }}>
          IN{" "}
          <span className="subtle" style={{ fontWeight: 600 }}>
            {inCount} ({inPct}%)
          </span>
        </div>
        <div style={{ fontWeight: 800 }}>
          OUT{" "}
          <span className="subtle" style={{ fontWeight: 600 }}>
            {outCount} ({outPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}
