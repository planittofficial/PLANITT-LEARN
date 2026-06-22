"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminTextarea,
} from "@/features/admin-ui";
import { useCreateCourse } from "@/hooks/admin/use-admin-courses";
import { ROUTES } from "@/constants/routes";

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
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href={ROUTES.ADMIN.COURSES} className="text-sm text-violet-400 hover:underline">
        ← Courses
      </Link>

      <AdminPageHeader
        eyebrow="New content"
        title="Add course"
        description="Create a new learning path. You can add modules and lessons after saving."
        icon={Plus}
      />

      <AdminCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput
            label="Course ID (learn-*)"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
          <AdminInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <AdminInput
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <AdminInput label="Level" value={level} onChange={(e) => setLevel(e.target.value)} required />
          <AdminTextarea label="Blurb" rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
          {createCourse.error ? (
            <p className="text-sm text-rose-400">{(createCourse.error as Error).message}</p>
          ) : null}
          <AdminButton type="submit" disabled={createCourse.isPending}>
            {createCourse.isPending ? "Creating…" : "Create course"}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
