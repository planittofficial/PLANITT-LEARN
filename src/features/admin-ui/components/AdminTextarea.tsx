import { cn } from "@/lib/utils";

type AdminTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function AdminTextarea({ label, className, id, ...props }: AdminTextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest block mb-1.5">
          {label}
        </span>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          "w-full rounded border border-white/5 bg-[#1C1B1B] px-3 py-2.5 font-mono text-xs text-textPrimary placeholder:text-textMuted outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 tracking-wide",
          className,
        )}
        {...props}
      />
    </label>
  );
}
