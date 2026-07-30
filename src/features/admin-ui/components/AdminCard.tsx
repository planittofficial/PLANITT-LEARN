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
        "rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden",
        highlight && "border-brand/20 bg-brand/5",
        className,
      )}
    >
      <div className="glow-border" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
