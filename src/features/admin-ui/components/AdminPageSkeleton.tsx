import { Skeleton } from "@/components/ui/Skeleton";

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-36 rounded-lg bg-white/5 border border-white/5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg bg-white/5 border border-white/5" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg bg-white/5 border border-white/5" />
    </div>
  );
}
