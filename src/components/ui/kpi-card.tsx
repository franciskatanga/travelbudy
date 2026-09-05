import { Card } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  helpText,
}: {
  label: string;
  value: string;
  helpText?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {helpText && <p className="mt-1 text-xs text-ink-muted">{helpText}</p>}
    </Card>
  );
}
