"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCreateCourse } from "@/hooks/admin/use-admin-courses";

export default function Page() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [id, setId] = useState("learn-");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Trading");
  const [level, setLevel] = useState("Beginner");
  const [blurb, setBlurb] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createCourse.mutateAsync({ id, title, category, level, blurb });
    router.push(`/admin/courses/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/admin/courses" className="text-sm text-brand">← Courses</Link>
      <h1 className="text-2xl font-bold">Add course</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-borderSubtle p-5">
        <label className="block text-sm">
          Course ID (learn-*)
          <input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={id} onChange={(e) => setId(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Title
          <input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Category
          <input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Level
          <input className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Blurb
          <textarea className="mt-1 w-full rounded-lg border border-borderSubtle bg-surface px-3 py-2" rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
        </label>
        {createCourse.error ? <p className="text-sm text-danger">{(createCourse.error as Error).message}</p> : null}
        <button type="submit" disabled={createCourse.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm text-white">
          {createCourse.isPending ? "Creating…" : "Create course"}
        </button>
      </form>
    </div>
  );
}
