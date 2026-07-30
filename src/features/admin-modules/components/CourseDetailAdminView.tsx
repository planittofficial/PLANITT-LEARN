"use client";

import Link from "next/link";
import { useState } from "react";
import { Layers, Plus, Trash2, ChevronRight } from "lucide-react";

import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
  AdminSection,
} from "@/features/admin-ui";
import {
  useAdminModules,
  useCreateModule,
  useDeleteModule,
} from "@/hooks/admin/use-admin-modules";
import { useAdminCourse } from "@/hooks/admin/use-admin-courses";

export function CourseDetailAdminView({ courseId }: { courseId: string }) {
  const { data: course } = useAdminCourse(courseId);
  const { data: modules, isLoading } = useAdminModules(courseId);
  const createModule = useCreateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const [showForm, setShowForm] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createModule.mutateAsync({ id, title });
    setShowForm(false);
    setId("");
    setTitle("");
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Course Module Editor"
        title={course?.title ?? courseId}
        description={course?.blurb ?? "Manage modules and lesson structure for this course."}
        icon={Layers}
        action={
          <Link href={`/admin/courses/${courseId}/edit`}>
            <AdminButton variant="secondary">Edit Course Settings</AdminButton>
          </Link>
        }
      />

      <AdminSection
        title="Module Index"
        description="Each module groups related lessons. Open a module to add lessons and upload videos."
        action={
          <AdminButton onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5" />
            Add Module
          </AdminButton>
        }
      >
        {showForm ? (
          <AdminCard highlight className="mb-4">
            <p className="font-mono text-[9px] text-brand uppercase tracking-widest mb-3">// New Module Configuration</p>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
              <AdminInput
                label="Module ID"
                placeholder="e.g. fx-module-1"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
              <div className="sm:col-span-2">
                <AdminInput
                  label="Module Title"
                  placeholder="Module title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <AdminButton type="submit">Create Module</AdminButton>
              </div>
            </form>
          </AdminCard>
        ) : null}

        {isLoading ? (
          <p className="font-mono text-xs text-textMuted uppercase tracking-widest animate-pulse">Loading modules…</p>
        ) : null}

        <div className="space-y-3">
          {(modules ?? []).map((mod) => (
            <div
              key={mod.id}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/5 bg-[#131313]/60 px-5 py-4 hover:border-brand/30 transition"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/modules/${mod.id}`}
                  className="font-mono font-bold text-brand hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                  {mod.title}
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" />
                </Link>
                <p className="mt-1 font-mono text-[9px] text-textMuted uppercase tracking-widest">
                  {mod.id} · {mod.lessonCount} lesson{mod.lessonCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/quizzes/modules/${mod.id}`}>
                  <AdminButton variant="secondary" size="sm">
                    Module Test
                  </AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => deleteModule.mutate(mod.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </AdminButton>
              </div>
            </div>
          ))}
        </div>

        {(modules ?? []).length === 0 && !isLoading ? (
          <div className="rounded-lg border border-dashed border-white/10 px-6 py-10 text-center font-mono text-xs text-textMuted uppercase tracking-wider">
            No modules yet. Add your first module above.
          </div>
        ) : null}
      </AdminSection>
    </div>
  );
}
