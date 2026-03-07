import { useEffect, useState } from "react";
import type { Mode, Payload } from "./types";
import ModeToggle from "./components/ModeToggle";
import BusinessDashboard from "./BusinessDashboard";
import TechnicalDashboard from "./TechnicalDashboard";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { MOCK_FILES, fetchPayload } from "./services/api";

export default function DashboardPage() {
  const [selected, setSelected] = useState<string>(MOCK_FILES[0].path);
  const [mode, setMode] = useState<Mode>("technical");
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "analytics") {
      setLoading(false);
      setErr(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const json = await fetchPayload(selected);
        if (!cancelled) setData(json);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setErr(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [selected, mode]);

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <h1 className="h1">Smart People Counting</h1>
          <div className="subtle">
            {mode === "technical"
              ? "Technical Monitoring"
              : mode === "business"
                ? "Business Overview"
                : "Analytics"}
          </div>
        </div>

        <div className="controls">
          {mode === "analytics" && (
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
          )}

          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </header>

      {mode === "technical" && <TechnicalDashboard />}
      {mode === "business" && <BusinessDashboard />}

      {mode === "analytics" && loading && <p className="subtle">Loading…</p>}
      {mode === "analytics" && err && (
        <p style={{ color: "crimson" }}>Error: {err}</p>
      )}
      {mode === "analytics" && !loading && !err && data && (
        <AnalyticsDashboard data={data} />
      )}
    </div>
  );
}
