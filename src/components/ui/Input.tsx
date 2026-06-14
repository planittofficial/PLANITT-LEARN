import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2 text-sm text-textPrimary",
        className,
      )}
      {...props}
    />
  );
}
