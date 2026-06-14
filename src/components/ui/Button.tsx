import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50",
        variant === "primary" ? "bg-brand text-black" : "border border-borderSubtle text-textPrimary",
        className,
      )}
      {...props}
    />
  );
}
