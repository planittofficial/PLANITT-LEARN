"use client";

import Link from "next/link";
import { use } from "react";

import { QuizBuilder } from "@/features/admin-quizzes";
import { useModuleTest, useSaveModuleTest } from "@/hooks/admin/use-admin-quizzes";

export default function Page({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const { data: test, isLoading } = useModuleTest(moduleId);
  const saveTest = useSaveModuleTest(moduleId);

  if (isLoading) return <p>Loading module test…</p>;

  return (
    <div className="space-y-6">
      <Link href={`/admin/modules/${moduleId}`} className="text-sm text-brand">← Module</Link>
      <h1 className="text-2xl font-bold">Module test builder</h1>
      <QuizBuilder
        initial={test?.questions ?? []}
        passingScore={test?.passingScore ?? 60}
        title={test?.title ?? undefined}
        saving={saveTest.isPending}
        onSave={(payload) => saveTest.mutate(payload)}
      />
    </div>
  );
}
