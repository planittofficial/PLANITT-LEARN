import Link from "next/link";

type Crumb = { label: string; href?: string };

export function AdminBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-textMuted">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 ? <span>/</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ) : (
            <span className="text-textSecondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
