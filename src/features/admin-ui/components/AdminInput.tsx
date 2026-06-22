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
          "mt-1.5 w-full rounded-xl border border-borderSubtle bg-black/20 px-3 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
