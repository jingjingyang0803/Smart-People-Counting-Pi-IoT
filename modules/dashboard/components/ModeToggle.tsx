import type { Mode } from "../types";

export default function ModeToggle({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="select"
        onClick={() => setMode("business")}
        style={{ opacity: mode === "business" ? 1 : 0.7 }}
      >
        Business
      </button>
      <button
        className="select"
        onClick={() => setMode("technical")}
        style={{ opacity: mode === "technical" ? 1 : 0.7 }}
      >
        Technical
      </button>
    </div>
  );
}
