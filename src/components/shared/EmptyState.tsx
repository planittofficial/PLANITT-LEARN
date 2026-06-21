import type { LucideIcon } from "lucide-react";
import { BookOpen, Inbox, Lock, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-borderSubtle bg-surface/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
        <Icon className="h-7 w-7 text-brand" />
      </div>
      <p className="text-base font-semibold text-textPrimary">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-textSecondary">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function NoCoursesEmpty({ action }: { action?: React.ReactNode }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No enrolled courses yet"
      description="Purchase a course on Planitt to start your learning journey. Your progress will appear here automatically."
      action={action}
    />
  );
}

export function NoLessonsEmpty() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Lessons coming soon"
      description="This module is being prepared. Check back shortly for new content."
    />
  );
}

export function LockedCourseEmpty({ action }: { action?: React.ReactNode }) {
  return (
    <EmptyState
      icon={Lock}
      title="Course locked"
      description="Enroll on Planitt to unlock this course and access all modules and lessons."
      action={action}
    />
  );
}

export function LeaderboardEmpty() {
  return (
    <EmptyState
      icon={Trophy}
      title="Leaderboard warming up"
      description="Complete lessons and quizzes to climb the rankings. Be the first on the board!"
    />
  );
}
