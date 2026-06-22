"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

import { isBookmarked, toggleBookmark } from "@/lib/learning/bookmarks";
import { syncAchievements } from "@/lib/learning/achievements";
import { cn } from "@/lib/utils";

type LessonBookmarkButtonProps = {
  userId: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  className?: string;
};

export function LessonBookmarkButton({
  userId,
  courseId,
  courseTitle,
  moduleId,
  lessonId,
  lessonTitle,
  className,
}: LessonBookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(userId, lessonId));

  function handleToggle() {
    const added = toggleBookmark(userId, {
      courseId,
      courseTitle,
      moduleId,
      lessonId,
      lessonTitle,
    });
    setBookmarked(added);
    if (added) syncAchievements(userId);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition",
        bookmarked
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-borderSubtle text-textSecondary hover:border-brand/30 hover:text-brand",
        className,
      )}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Bookmarked
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Bookmark
        </>
      )}
    </button>
  );
}
