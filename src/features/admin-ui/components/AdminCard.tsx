import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
};

export function AdminCard({ children, className, highlight }: AdminCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-borderSubtle bg-surface p-5 shadow-card relative overflow-hidden",
        highlight && "border-brand/20 bg-brand/5",
        className,
      )}
    >
      <div className="glow-border" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
