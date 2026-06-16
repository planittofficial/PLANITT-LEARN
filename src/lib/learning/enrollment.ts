import { ALL_COURSE_IDS, COMBO_PLAN_ID } from "@/lib/catalog/courses";

/**
 * Client-safe enrollment helpers.
 * Server source of truth: `services/enrollment/enrollment.service.ts` + GET /api/v1/enrollment/me
 */

export type PaymentTransaction = {
  plan_id?: string;
  status?: string;
};

export function expandComboEnrollments(planIds: Set<string>): Set<string> {
  if (planIds.has(COMBO_PLAN_ID)) {
    for (const id of ALL_COURSE_IDS) {
      planIds.add(id);
    }
  }
  return planIds;
}

/** @deprecated Server-only — use getEnrollmentSnapshot() or GET /api/v1/enrollment/me */
export function enrolledCourseIdsFromTransactions(transactions: PaymentTransaction[]): Set<string> {
  const ids = new Set<string>();

  for (const tx of transactions) {
    const planId = (tx.plan_id ?? "").trim().toLowerCase();
    if (!planId.startsWith("learn-")) continue;
    if ((tx.status ?? "").toLowerCase() !== "paid") continue;
    ids.add(planId);
  }

  return expandComboEnrollments(ids);
}

export function isEnrolledInCourse(enrolled: Set<string>, courseId: string): boolean {
  return enrolled.has(courseId);
}
