import { LearnShell } from "@/components/layout/student";
import { EmptyState } from "@/components/shared";

export default function ProfilePage() {
  return (
    <LearnShell>
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="mt-6">
        <EmptyState title="Profile coming soon" description="Your learning stats will appear here." />
      </div>
    </LearnShell>
  );
}
