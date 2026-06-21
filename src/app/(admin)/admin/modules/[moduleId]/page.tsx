"use client";

import { use } from "react";

import { ModuleDetailAdminView } from "@/features/admin-lessons";

export default function Page({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  return <ModuleDetailAdminView moduleId={moduleId} />;
}
