import { cn } from "@/lib/utils";

export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md shadow-2xl relative", className)}>
      <div className="glow-border" />
      <div className="overflow-x-auto relative z-10">{children}</div>
    </div>
  );
}

export function AdminTableElement({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full text-left text-xs font-mono">{children}</table>;
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-white/5 bg-black/40 text-[10px] font-bold uppercase tracking-widest text-textMuted">
      {children}
    </thead>
  );
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-white/5">{children}</tbody>;
}

export function AdminTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-white/5", className)}>{children}</tr>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3.5 text-textSecondary uppercase tracking-wide", className)}>{children}</td>;
}

export function AdminTableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-4 py-3.5 text-textMuted uppercase tracking-widest font-bold", className)}>{children}</th>;
}
