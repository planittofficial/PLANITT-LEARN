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
        "rounded-2xl border border-borderSubtle bg-surface p-5 sm:p-6",
        highlight && "border-brand/20 bg-gradient-to-br from-brand/8 to-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}
