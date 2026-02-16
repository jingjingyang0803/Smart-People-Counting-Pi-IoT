import { useEffect, useState } from "react";
import type { Mode, Payload } from "./types";
import ModeToggle from "./components/ModeToggle";
import BusinessDashboard from "./BusinessDashboard";
import TechnicalDashboard from "./TechnicalDashboard";
import { MOCK_FILES, fetchPayload } from "./services/api";

export default function DashboardPage() {
  const [selected, setSelected] = useState(MOCK_FILES[0].path);
  const [mode, setMode] = useState<Mode>("business");
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const json = await fetchPayload(selected);
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

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <h1 className="h1">Smart People Counting</h1>
          <div className="subtle">
            {mode === "business"
              ? "Management Overview"
              : "Technical Monitoring"}
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

          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </header>

      {loading && <p className="subtle">Loading…</p>}
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {!loading &&
        !err &&
        data &&
        (mode === "business" ? (
          <BusinessDashboard data={data} />
        ) : (
          <TechnicalDashboard data={data} />
        ))}
    </div>
  );
}
