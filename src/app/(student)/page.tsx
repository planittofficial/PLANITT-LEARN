import { GraduationCap } from "lucide-react";

import { LearnShell } from "@/components/layout/student";
import { planittCheckoutUrl } from "@/constants/urls";
import { MyCoursesSection } from "@/features/student-dashboard";

export default function HomePage() {
  return (
    <LearnShell>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-brand">
          <GraduationCap className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-wide">Planitt Learn</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold">My learning</h1>
        <p className="mt-2 max-w-2xl text-sm text-textSecondary">
          Your enrolled courses appear below. Open a course to explore modules and lessons — then
          complete your assigned tasks in the catalog files.
        </p>
        <a
          href={planittCheckoutUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
          Browse &amp; buy courses on Planitt ↗
        </a>
      </header>

      <MyCoursesSection />

      <p className="mt-10 text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </LearnShell>
  );
}
