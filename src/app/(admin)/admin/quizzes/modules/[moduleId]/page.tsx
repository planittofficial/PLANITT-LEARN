"use client";

import Link from "next/link";
import { use } from "react";
import { Target } from "lucide-react";

import { AdminPageHeader, AdminPageSkeleton } from "@/features/admin-ui";
import { QuizBuilder } from "@/features/admin-quizzes";
import { useModuleTest, useSaveModuleTest } from "@/hooks/admin/use-admin-quizzes";

export default function Page({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const { data: test, isLoading } = useModuleTest(moduleId);
  const saveTest = useSaveModuleTest(moduleId);

  if (isLoading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <Link
        href={`/admin/modules/${moduleId}`}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] text-brand hover:underline uppercase tracking-widest"
      >
        ← Back to Module Node
      </Link>
      <AdminPageHeader
        eyebrow="Assessment Setup"
        title="Module Test Builder"
        description="Build an end-of-module assessment to validate learner understanding."
        icon={Target}
      />
      <QuizBuilder
        initial={test?.questions ?? []}
        passingScore={test?.passingScore ?? 60}
        title={test?.title ?? undefined}
        published={test?.published ?? false}
        saving={saveTest.isPending}
        onSave={(payload) => saveTest.mutate(payload)}
      />
    </div>
  );
}
