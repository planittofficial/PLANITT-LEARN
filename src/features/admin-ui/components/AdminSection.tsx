type AdminSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminSection({ title, description, action, children }: AdminSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <h2 className="font-headline text-base font-extrabold text-textPrimary uppercase tracking-wider">{title}</h2>
          {description ? <p className="mt-1 font-mono text-[10px] text-textMuted uppercase tracking-widest">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
