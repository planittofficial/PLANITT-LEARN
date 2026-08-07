import { redirect } from "next/navigation";

import { AdminGuard } from "@/components/layout/admin/AdminGuard";
import { AdminShell } from "@/components/layout/admin";
import { isServerAdmin } from "@/lib/security/server-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isServerAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
