export default function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <div className="panel card">
      <div className="cardTitle">{title}</div>
      <div className="cardValue">{value}</div>
      {subtitle ? <div className="cardSub">{subtitle}</div> : null}
    </div>
  );
}
