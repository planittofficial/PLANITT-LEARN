import { Skeleton } from "@/components/ui/Skeleton";

export function AdminPageSkeleton() {
  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      <Skeleton className="h-36 rounded-xl border border-borderSubtle bg-elevated" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl border border-borderSubtle bg-elevated" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl border border-borderSubtle bg-elevated" />
    </div>
  );
}
