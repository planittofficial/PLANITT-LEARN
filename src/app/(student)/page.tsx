"use client";

import { Suspense } from "react";

import { MyCoursesSection } from "@/features/student-dashboard";
import { usePurchasedEnrollmentRefresh } from "@/hooks/enrollment/use-purchased-enrollment-refresh";

function HomeContent() {
  usePurchasedEnrollmentRefresh();

  return (
    <>
      <MyCoursesSection />
      <p className="mt-12 text-center text-xs text-textMuted">
        Educational content only — not investment advice. Always perform your own due diligence.
      </p>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<MyCoursesSection />}>
      <HomeContent />
    </Suspense>
  );
}
