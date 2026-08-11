"use client";

import { ExternalLink, FileText, Link2, Video } from "lucide-react";

import type { Lesson } from "@/lib/catalog/courses";
import { isYoutubeUrl } from "@/lib/video/video-url";

export function lessonHasResources(lesson: Lesson): boolean {
  if (lesson.content.videoUrl && !isYoutubeUrl(lesson.content.videoUrl)) return true;
  if (lesson.content.externalUrl && !isYoutubeUrl(lesson.content.externalUrl)) return true;
  return false;
}

type LessonResourcesProps = {
  lesson: Lesson;
  embedded?: boolean;
};

export function LessonResources({ lesson, embedded = false }: LessonResourcesProps) {
  const resources: Array<{ label: string; href: string; icon: typeof Video }> = [];

  // YouTube lessons are intentionally embed-only. Showing the source URL here
  // would create an unnecessary copy/share path for unlisted videos.
  if (lesson.content.videoUrl && !isYoutubeUrl(lesson.content.videoUrl)) {
    resources.push({ label: "Video source", href: lesson.content.videoUrl, icon: Video });
  }
  if (lesson.content.externalUrl) {
    resources.push({ label: "External resource", href: lesson.content.externalUrl, icon: ExternalLink });
  }
  if (lesson.content.markdown) {
    resources.push({ label: "Article content", href: "#lesson-content", icon: FileText });
  }

  if (resources.length === 0) return embedded ? (
    <p className="text-sm text-textMuted">No additional resources for this lesson.</p>
  ) : null;

  return (
    <div className={embedded ? "" : "rounded-lg border border-borderSubtle bg-surface p-4 shadow-card"}>
      {!embedded ? (
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-textMuted">
          <Link2 className="h-3.5 w-3.5" />
          Resources
        </p>
      ) : null}
      <ul className="space-y-2">
        {resources.map((r) => (
          <li key={r.label}>
            <a
              href={r.href}
              target={r.href.startsWith("#") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border border-borderSubtle/60 px-3 py-2 text-sm text-textSecondary transition hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
            >
              <r.icon className="h-4 w-4 shrink-0" />
              {r.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
