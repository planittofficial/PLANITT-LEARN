import { cn } from "@/lib/utils";

export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-borderSubtle bg-surface shadow-card relative", className)}>
      <div className="glow-border" />
      <div className="overflow-x-auto relative z-10">{children}</div>
    </div>
  );
}

export function AdminTableElement({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full text-left text-sm">{children}</table>;
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-borderSubtle bg-overlay-subtle text-xs font-semibold text-textMuted">
      {children}
    </thead>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-borderSubtle">{children}</tbody>;
}

export function AdminTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-overlay-hover", className)}>{children}</tr>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3.5 text-textSecondary", className)}>{children}</td>;
}

export function AdminTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-4 py-3.5 text-left text-textMuted font-semibold", className)}>{children}</th>;
}
