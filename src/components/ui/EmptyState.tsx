type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-borderSubtle p-8 text-center">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-textSecondary">
        {description}
      </p>
    </div>
  );
}