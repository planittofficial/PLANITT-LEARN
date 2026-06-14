"use client";

/** Fetch published course catalog — wire to GET /api/v1/courses — Sanvi implements in Phase 2. */
export function useCourses() {
  return { data: [], isLoading: false, error: null };
}
