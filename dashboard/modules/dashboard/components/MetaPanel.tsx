import type { Payload } from "../types";

export default function MetaPanel({ data }: { data: Payload }) {
  return (
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
        Line: {data.zone.line.id} · A={JSON.stringify(data.zone.line.a)} B=
        {JSON.stringify(data.zone.line.b)} · Inside: {data.zone.line.insideHint}
      </div>
    </section>
  );
}
