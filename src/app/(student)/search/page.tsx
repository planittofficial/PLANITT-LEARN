"use client";

import { Suspense } from "react";

import { SearchPageSkeleton } from "@/components/ui/skeletons";
import { StudentSearchView } from "@/features/search";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <StudentSearchView />
    </Suspense>
  );
}
