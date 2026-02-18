export default function KpiCard({
  title,
  value,
  subtitle,
  variant,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: "normal" | "busy" | "over";
}) {
  const variantClass =
    variant === "normal"
      ? "statusNormal"
      : variant === "busy"
        ? "statusBusy"
        : variant === "over"
          ? "statusOver"
          : "";

  return (
    <div className={`panel card ${variantClass}`}>
      <div className="cardTitle">{title}</div>
      <div className="cardValue">{value}</div>
      {subtitle ? <div className="cardSub">{subtitle}</div> : null}
    </div>
  );
}
