import { cn } from "@/lib/utils";

type AdminTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function AdminTextarea({ label, className, id, ...props }: AdminTextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="mb-1.5 block text-xs font-medium text-textSecondary">{label}</span>
      ) : null}
      <textarea
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
