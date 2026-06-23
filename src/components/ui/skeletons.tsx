import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="h-48 rounded-2xl bg-overlay-hover" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function CoursePageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function LessonPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-3/4 max-w-lg" />
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="aspect-video lg:col-span-2 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Skeleton className="h-44 rounded-2xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}

export function NotificationsPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

export function AchievementsPageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-44 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <Skeleton className="h-52 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-52 rounded-2xl lg:col-span-2" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
