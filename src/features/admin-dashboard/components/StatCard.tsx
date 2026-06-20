export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-borderSubtle bg-surface p-5">
      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-2 text-3xl font-bold text-textPrimary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-textMuted">{hint}</p> : null}
    </div>
  );
}
