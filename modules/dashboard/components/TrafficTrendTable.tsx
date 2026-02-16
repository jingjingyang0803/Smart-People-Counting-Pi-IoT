import type { Bucket } from "../types";

export default function TrafficTrendTable({ buckets }: { buckets: Bucket[] }) {
  if (buckets.length === 0) return <p className="subtle">No buckets found.</p>;

  return (
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
  );
}
