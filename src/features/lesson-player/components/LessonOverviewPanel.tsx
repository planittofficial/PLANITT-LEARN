"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Clock, FileText, Layers, ListChecks, StickyNote, Video } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { MarkdownLesson } from "@/features/lesson-player/components/MarkdownLesson";
import { LessonNotes } from "@/features/lesson-player/components/LessonNotes";
import { LessonResources } from "@/features/lesson-player/components/LessonResources";
import type { CourseDefinition, CourseModule, Lesson } from "@/lib/catalog/courses";
import { buildLessonOverviewContent } from "@/lib/learning/lesson-overview";
import { cn } from "@/lib/utils";
import { isYoutubeUrl } from "@/lib/video/video-url";

type TabId = "overview" | "notes" | "resources";

type LessonOverviewPanelProps = {
  lesson: Lesson;
  module: CourseModule;
  course: CourseDefinition;
  completed: boolean;
  userId?: string;
  hasResources: boolean;
};

export function LessonOverviewPanel({
  lesson,
  module,
  course,
  completed,
  userId,
  hasResources,
}: LessonOverviewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const overview = buildLessonOverviewContent(lesson, module, course);

  const isVideoLesson = lesson.kind === "video" || Boolean(lesson.content.videoAvailable);

  const tabs: Array<{ id: TabId; label: string; icon: typeof BookOpen }> = [
    { id: "overview", label: "Overview", icon: BookOpen },
    ...(userId ? [{ id: "notes" as const, label: "My notes", icon: StickyNote }] : []),
    ...(hasResources ? [{ id: "resources" as const, label: "Resources", icon: FileText }] : []),
  ];

  return (
    <section className="lesson-panel overflow-hidden rounded-xl border border-borderSubtle bg-surface shadow-card">
      <div className="flex gap-1 overflow-x-auto border-b border-borderSubtle bg-elevated/40 px-2 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium transition",
                active
                  ? "text-brand"
                  : "text-textMuted hover:text-textPrimary",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {active ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6 lg:p-8">
        {activeTab === "overview" ? (
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailTile
                icon={Clock}
                label="Duration"
                value={`${lesson.durationMinutes} min`}
              />
              <DetailTile
                icon={isVideoLesson ? Video : FileText}
                label="Format"
                value={isVideoLesson ? "Video lecture" : lesson.kind === "external" ? "External resource" : "Reading"}
              />
              <DetailTile icon={Layers} label="Module" value={module.title} />
              <DetailTile
                icon={CheckCircle2}
                label="Status"
                value={completed ? "Completed" : "In progress"}
                valueClassName={completed ? "text-brand" : "text-amber-600 dark:text-amber-400"}
              />
            </div>

            <div>
              <h2 className="flex items-center gap-2 font-headline text-lg font-semibold text-textPrimary">
                <BookOpen className="h-5 w-5 text-brand" />
                About this lesson
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-textSecondary sm:text-base">
                {overview.about ||
                  `This lesson is part of ${module.title} in ${course.title}. Watch the lecture carefully and note the key concepts before moving to the next section.`}
              </p>
            </div>

            {overview.objectives.length > 0 ? (
              <div>
                <h2 className="flex items-center gap-2 font-headline text-lg font-semibold text-textPrimary">
                  <ListChecks className="h-5 w-5 text-brand" />
                  What you&apos;ll learn
                </h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {overview.objectives.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 rounded-lg border border-borderSubtle/80 bg-elevated/50 px-3.5 py-3 text-sm leading-6 text-textSecondary"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {overview.hasMarkdown ? (
              <div className="border-t border-borderSubtle pt-8">
                <div className="mb-4 flex items-center gap-2">
                  <Badge className="py-0.5 text-xs">Lesson notes</Badge>
                  <span className="text-xs text-textMuted">Supplementary reading for this lecture</span>
                </div>
                <MarkdownLesson markdown={lesson.content.markdown!} />
              </div>
            ) : null}

            <div className="rounded-lg border border-brand/15 bg-brand-subtle/60 px-4 py-3 text-xs leading-6 text-textSecondary">
              <span className="font-semibold text-textPrimary">Course context:</span>{" "}
              {course.title} · {course.level} · {course.category}
            </div>
          </div>
        ) : null}

        {activeTab === "notes" && userId ? (
          <div className="max-w-3xl">
            <p className="mb-4 text-sm text-textSecondary">
              Capture insights, definitions, and trading rules while you watch. Notes are saved on this device.
            </p>
            <LessonNotes userId={userId} lessonId={lesson.id} embedded />
          </div>
        ) : null}

        {activeTab === "resources" ? (
          <div className="max-w-2xl">
            <LessonResources lesson={lesson} embedded />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-borderSubtle bg-elevated/40 px-4 py-3.5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-textMuted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={cn("mt-1.5 text-sm font-semibold leading-snug text-textPrimary", valueClassName)}>
        {value}
      </p>
    </div>
  );
}
