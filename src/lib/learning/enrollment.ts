import { ALL_COURSE_IDS, COMBO_PLAN_ID } from "@/lib/catalog/courses";
import { devMockEnrollments } from "@/lib/env";

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

export function enrolledCourseIdsFromTransactions(transactions: PaymentTransaction[]): Set<string> {
  const ids = new Set<string>();

  for (const mock of devMockEnrollments()) {
    ids.add(mock);
  }

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
