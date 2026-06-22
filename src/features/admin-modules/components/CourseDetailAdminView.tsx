"use client";

import Link from "next/link";
import { useState } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";

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
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Course"
        title={course?.title ?? courseId}
        description={course?.blurb ?? "Manage modules and lesson structure for this course."}
        icon={Layers}
        action={
          <Link href={`/admin/courses/${courseId}/edit`}>
            <AdminButton variant="secondary">Edit course</AdminButton>
          </Link>
        }
      />

      <AdminSection
        title="Modules"
        description="Each module groups related lessons. Open a module to add lessons and upload videos."
        action={
          <AdminButton onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Add module
          </AdminButton>
        }
      >
        {showForm ? (
          <AdminCard highlight>
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
                  label="Title"
                  placeholder="Module title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <AdminButton type="submit">Create module</AdminButton>
              </div>
            </form>
          </AdminCard>
        ) : null}

        {isLoading ? <p className="text-textSecondary">Loading modules…</p> : null}

        <div className="space-y-3">
          {(modules ?? []).map((mod) => (
            <AdminCard key={mod.id} className="flex flex-wrap items-center justify-between gap-4 !p-4">
              <div>
                <Link
                  href={`/admin/modules/${mod.id}`}
                  className="font-semibold text-violet-400 hover:underline"
                >
                  {mod.title}
                </Link>
                <p className="mt-1 text-xs text-textMuted">
                  {mod.id} · {mod.lessonCount} lesson{mod.lessonCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/quizzes/modules/${mod.id}`}>
                  <AdminButton variant="secondary" size="sm">
                    Module test
                  </AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => deleteModule.mutate(mod.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </AdminButton>
              </div>
            </AdminCard>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
