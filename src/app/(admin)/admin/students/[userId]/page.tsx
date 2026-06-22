"use client";

import { use } from "react";

import { StudentDetailAdminView } from "@/features/admin-students";

export default function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  return <StudentDetailAdminView userId={userId} />;
}
