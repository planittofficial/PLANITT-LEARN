import { AdminGuard } from "@/components/layout/admin/AdminGuard";
import { AdminShell } from "@/components/layout/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
