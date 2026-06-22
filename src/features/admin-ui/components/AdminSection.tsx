type AdminSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminSection({ title, description, action, children }: AdminSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">{title}</h2>
          {description ? <p className="mt-1 text-sm text-textMuted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
