import { cn } from "@/lib/utils";

type AdminTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function AdminTextarea({ label, className, id, ...props }: AdminTextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm" htmlFor={inputId}>
      {label ? <span className="text-textSecondary">{label}</span> : null}
      <textarea
        id={inputId}
        className={cn(
          "mt-1.5 w-full rounded-xl border border-borderSubtle bg-overlay-subtle px-3 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
