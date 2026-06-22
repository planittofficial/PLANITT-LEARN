"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminTextarea,
} from "@/features/admin-ui";
import { useAdminCourse, useUpdateCourse } from "@/hooks/admin/use-admin-courses";
import { ROUTES } from "@/constants/routes";

export default function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: course } = useAdminCourse(courseId);
  const updateCourse = useUpdateCourse(courseId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [blurb, setBlurb] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setCategory(course.category);
    setLevel(course.level);
    setBlurb(course.blurb);
    setDescription(course.description ?? "");
    setPublished(course.published);
  }, [course]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateCourse.mutateAsync({ title, category, level, blurb, description, published });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href={`/admin/courses/${courseId}`}
        className="text-sm text-violet-400 hover:underline"
      >
        ← Course
      </Link>

      <AdminPageHeader
        eyebrow="Edit"
        title="Edit course"
        description="Update metadata and publish when the course is ready for students."
      />

      <AdminCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <AdminInput label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <AdminInput label="Level" value={level} onChange={(e) => setLevel(e.target.value)} />
          <AdminTextarea label="Blurb" rows={2} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
          <AdminTextarea
            label="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-textSecondary">
            <input
              type="checkbox"
              className="rounded border-borderSubtle"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
          <AdminButton type="submit">Save changes</AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
