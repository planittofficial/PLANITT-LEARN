import { cn } from "@/lib/utils";

type WelcomeHeroProps = {
  firstName: string;
  streak: number;
  className?: string;
};

export function WelcomeHero({
  firstName,
  streak,
  className,
}: WelcomeHeroProps) {
  return (
    <section
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4",
        className
      )}
    >
      <div>
        <h2 className="font-headline text-3xl font-bold text-textPrimary">
          Welcome, <span className="text-brand italic">{firstName}</span>.
        </h2>
        <p className="font-mono text-xs text-textSecondary mt-1 uppercase tracking-wider">
          Status: {streak}-day consecutive execution streak
        </p>
      </div>
      <div className="flex gap-2">
        <div className="px-4 py-2 bg-surface border border-borderSubtle rounded flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_#14B8A6] animate-pulse"></div>
          <span className="font-mono text-[10px] text-textPrimary uppercase tracking-wider font-bold">SYSTEM_OPERATIONAL</span>
        </div>
      </div>
    </section>
  );
}
