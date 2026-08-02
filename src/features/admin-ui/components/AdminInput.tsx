import { cn } from "@/lib/utils";

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function AdminInput({ label, className, id, ...props }: AdminInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="text-xs font-medium text-textSecondary block mb-1.5">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2.5 text-sm text-textPrimary placeholder:text-textMuted outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
