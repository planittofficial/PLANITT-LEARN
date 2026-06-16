"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LearnShell } from "@/components/layout/student";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { getLessonByPath } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { loadCourseProgress, saveLessonComplete, type CourseProgress } from "@/lib/learning/progress";
import { planittCheckoutUrl } from "@/constants/urls";

export default function LessonPage() {
  const params = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  const { courseId, moduleId, lessonId } = params;
  const resolved = getLessonByPath(courseId, moduleId, lessonId);
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();
  const [progress, setProgress] = useState<CourseProgress>({});

  useEffect(() => {
    if (!user?.id) return;
    setProgress(loadCourseProgress(user.id, courseId));
  }, [courseId, user?.id]);

  if (!resolved) notFound();
  const { course, module, lesson } = resolved;

  if (loading) {
    return (
      <LearnShell>
        <p className="text-sm text-textSecondary">Loading lesson…</p>
      </LearnShell>
    );
  }

  if (!isEnrolledInCourse(enrolledIds, courseId)) {
    return (
      <LearnShell>
        <p className="text-sm text-textSecondary">Enroll on Planitt to access this lesson.</p>
        <a href={planittCheckoutUrl(courseId)} className="mt-2 inline-block text-sm text-brand">
          Buy course →
        </a>
      </LearnShell>
    );
  }

  const completed = progress[lesson.id]?.completed;

  const markComplete = () => {
    if (!user?.id) return;
    setProgress(saveLessonComplete(user.id, courseId, lesson.id));
  };

  return (
    <LearnShell>
      <Link
        href={ROUTES.STUDENT.course(courseId)}
        className="text-sm text-textMuted hover:text-brand"
      >
        ← {course.title}
      </Link>
      <p className="mt-4 text-xs uppercase tracking-wide text-brand">{module.title}</p>
      <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
      <p className="mt-2 text-sm text-textSecondary">{lesson.summary}</p>

      <article className="prose-lesson mt-8 rounded-xl border border-borderSubtle bg-surface p-6">
        {lesson.content.markdown ? (
          lesson.content.markdown.split("\n\n").map((block) => {
            if (block.startsWith("## ")) {
              return <h2 key={block}>{block.replace(/^##\s*/, "")}</h2>;
            }
            return <p key={block}>{block}</p>;
          })
        ) : (
          <p className="text-textSecondary">Lesson content placeholder.</p>
        )}
      </article>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={markComplete}
          disabled={completed}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>

      <p className="mt-10 text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </LearnShell>
  );
}
