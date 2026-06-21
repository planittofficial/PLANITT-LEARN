"use client";

import { use } from "react";

import { LessonEditorView } from "@/features/admin-lessons";

export default function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  return <LessonEditorView lessonId={lessonId} />;
}
