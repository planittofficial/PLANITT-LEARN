"use client";

import { use } from "react";

import { CourseDetailAdminView } from "@/features/admin-modules";

export default function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <CourseDetailAdminView courseId={courseId} />;
}
