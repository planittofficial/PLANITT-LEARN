import { Sparkles } from "lucide-react";

import { LearnShell } from "@/components/layout/student";
import { planittCheckoutUrl } from "@/constants/urls";
import { MyCoursesSection } from "@/features/student-dashboard";

export default function HomePage() {
  return (
    <LearnShell>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-brand">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">My Learning</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-textSecondary">
          Continue your trading education journey. Track progress, complete lessons, and climb the
          leaderboard.
        </p>
        <a
          href={planittCheckoutUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Explore more courses on Planitt ↗
        </a>
      </header>

      <MyCoursesSection />

      <p className="mt-12 text-center text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </LearnShell>
  );
}
