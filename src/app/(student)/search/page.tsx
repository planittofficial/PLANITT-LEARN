"use client";

import { Suspense } from "react";

import { LearnShell } from "@/components/layout/student";
import { SearchPageSkeleton } from "@/components/ui/skeletons";
import { StudentSearchView } from "@/features/search";

export default function SearchPage() {
  return (
    <LearnShell>
      <Suspense fallback={<SearchPageSkeleton />}>
        <StudentSearchView />
      </Suspense>
    </LearnShell>
  );
}
