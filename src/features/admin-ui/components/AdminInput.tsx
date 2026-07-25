import { cn } from "@/lib/utils";

type AdminInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function AdminInput({ label, className, id, ...props }: AdminInputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm" htmlFor={inputId}>
      {label ? <span className="text-textSecondary">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          "mt-1.5 w-full rounded-xl border border-borderSubtle bg-overlay-subtle px-3 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-brand/40 focus:ring-2 focus:ring-brand/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
