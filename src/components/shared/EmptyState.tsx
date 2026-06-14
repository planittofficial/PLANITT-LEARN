export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-borderSubtle p-6 text-center text-sm text-textSecondary">
      <p className="font-medium text-textPrimary">{title}</p>
      {description ? <p className="mt-2">{description}</p> : null}
    </div>
  );
}
