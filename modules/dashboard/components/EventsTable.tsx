import type { CrossingEvent } from "../types";

export default function EventsTable({ events }: { events: CrossingEvent[] }) {
  return (
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
          {events.map((e, idx) => (
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
  );
}
