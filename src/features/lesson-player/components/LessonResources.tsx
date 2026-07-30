"use client";

import { ExternalLink, FileText, Link2, Video } from "lucide-react";

import type { Lesson } from "@/lib/catalog/courses";

type LessonResourcesProps = {
  lesson: Lesson;
};

export function LessonResources({ lesson }: LessonResourcesProps) {
  const resources: Array<{ label: string; href: string; icon: typeof Video }> = [];

  if (lesson.content.videoUrl) {
    resources.push({ label: "Video source", href: lesson.content.videoUrl, icon: Video });
  }
  if (lesson.content.externalUrl) {
    resources.push({ label: "External resource", href: lesson.content.externalUrl, icon: ExternalLink });
  }
  if (lesson.content.markdown) {
    resources.push({ label: "Article content", href: "#lesson-content", icon: FileText });
  }

  if (resources.length === 0) return null;

  return (
    <div className="rounded-lg border border-borderSubtle bg-surface p-4 shadow-card">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-textMuted">
        <Link2 className="h-3.5 w-3.5" />
        Resources
      </p>
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
