"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { useAdminCourse, useUpdateCourse } from "@/hooks/admin/use-admin-courses";

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
    <div className="mx-auto max-w-xl space-y-6">
      <Link href={`/admin/courses/${courseId}`} className="text-sm text-brand">← Course</Link>
      <h1 className="text-2xl font-bold">Edit course</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-borderSubtle p-5">
        <label className="block text-sm">Title<input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="block text-sm">Category<input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)} /></label>
        <label className="block text-sm">Level<input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value)} /></label>
        <label className="block text-sm">Blurb<textarea className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" rows={2} value={blurb} onChange={(e) => setBlurb(e.target.value)} /></label>
        <label className="block text-sm">Description<textarea className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Save changes</button>
      </form>
    </div>
  );
}
