import { ALL_COURSE_IDS, COMBO_PLAN_ID } from "@/lib/catalog/courses";
import { prisma } from "@/lib/db/prisma";
import { isDevAccessToken } from "@/lib/dev/standalone";
import { getDatabaseUrl, devMockEnrollments, requireAppBackendUrl } from "@/lib/env";
import {
  enrolledCourseIdsFromTransactions,
  expandComboEnrollments,
  isEnrolledInCourse,
  type PaymentTransaction,
} from "@/lib/learning/enrollment";

export class EnrollmentError extends Error {
  readonly status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "EnrollmentError";
    this.status = status;
  }
}

/** Map a paid plan_id to one or more course IDs (combo expands to all). */
export function courseIdsForPlan(planId: string): string[] {
  const normalized = planId.trim().toLowerCase();
  if (!normalized.startsWith("learn-")) return [];
  if (normalized === COMBO_PLAN_ID) return [...ALL_COURSE_IDS];
  return [normalized];
}

export async function fetchPaymentHistory(accessToken: string): Promise<PaymentTransaction[]> {
  const response = await fetch(`${requireAppBackendUrl()}/api/v1/payments/me/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { items?: PaymentTransaction[] };
  return Array.isArray(data.items) ? data.items : [];
}

async function enrolledCourseIdsFromDatabase(userId: string): Promise<Set<string>> {
  const ids = new Set<string>();
  if (!getDatabaseUrl()) return ids;

  try {
    const rows = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true, planId: true },
    });

    for (const row of rows) {
      ids.add(row.courseId);
      if (row.planId) {
        for (const courseId of courseIdsForPlan(row.planId)) {
          ids.add(courseId);
        }
      }
    }
  } catch {
    // DB unavailable — fall back to payment history only
  }

  return ids;
}

/**
 * Single source of truth for course access.
 * Merges Learn DB enrollments with live payment history from appbackend.
 */
export async function getEnrolledCourseIds(
  userId: string,
  options?: { accessToken?: string },
): Promise<Set<string>> {
  const ids = new Set<string>();

  const token = options?.accessToken;
  if (token && isDevAccessToken(token)) {
    for (const planId of devMockEnrollments()) {
      ids.add(planId);
    }
  } else if (token) {
    const transactions = await fetchPaymentHistory(token);
    for (const courseId of enrolledCourseIdsFromTransactions(transactions)) {
      ids.add(courseId);
    }
  }

  for (const courseId of await enrolledCourseIdsFromDatabase(userId)) {
    ids.add(courseId);
  }

  return expandComboEnrollments(ids);
}

export async function isEnrolled(
  userId: string,
  courseId: string,
  options?: { accessToken?: string },
): Promise<boolean> {
  const ids = await getEnrolledCourseIds(userId, options);
  return isEnrolledInCourse(ids, courseId);
}

export async function assertEnrolled(
  userId: string,
  courseId: string,
  options?: { accessToken?: string },
): Promise<void> {
  const enrolled = await isEnrolled(userId, courseId, options);
  if (!enrolled) {
    throw new EnrollmentError("Not enrolled in this course", 403);
  }
}

export async function ensureUserProfile(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<void> {
  if (!getDatabaseUrl()) return;

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name ?? null,
    },
    update: {
      email: user.email.toLowerCase(),
      ...(user.name !== undefined ? { name: user.name } : {}),
    },
  });

  // Sync dev mock enrollments to database if standalone/dev-preview is active
  try {
    const mockPlans = devMockEnrollments();
    if (mockPlans.length > 0) {
      const courseIds = new Set<string>();
      for (const planId of mockPlans) {
        for (const courseId of courseIdsForPlan(planId)) {
          courseIds.add(courseId);
        }
      }
      for (const courseId of courseIds) {
        const courseExists = await prisma.course.findUnique({ where: { id: courseId } });
        if (courseExists) {
          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: user.id, courseId } },
            create: {
              userId: user.id,
              courseId,
              planId: mockPlans[0],
              source: "dev_mock",
            },
            update: {
              source: "dev_mock",
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to sync dev mock enrollments to database:", err);
  }
}

export type EnrollmentSnapshot = {
  enrolledCourseIds: string[];
  transactions: PaymentTransaction[];
  source: "dev_mock" | "alvest" | "mixed";
};

/**
 * Full enrollment picture for the authenticated user.
 * Used by GET /api/v1/enrollment/me — single API contract for UI + main-site integration.
 */
export async function getEnrollmentSnapshot(
  userId: string,
  accessToken: string,
): Promise<EnrollmentSnapshot> {
  const enrolledSet = await getEnrolledCourseIds(userId, { accessToken });

  let transactions: PaymentTransaction[] = [];
  if (isDevAccessToken(accessToken)) {
    transactions = devMockEnrollments().map((plan_id) => ({
      plan_id,
      status: "paid",
    }));
  } else {
    transactions = await fetchPaymentHistory(accessToken);
  }

  const fromPayments = enrolledCourseIdsFromTransactions(transactions);
  const fromDb = await enrolledCourseIdsFromDatabase(userId);

  let source: EnrollmentSnapshot["source"] = "alvest";
  if (isDevAccessToken(accessToken)) {
    source = fromDb.size > 0 ? "mixed" : "dev_mock";
  } else if (fromDb.size > 0 && fromPayments.size > 0) {
    source = "mixed";
  }

  return {
    enrolledCourseIds: [...enrolledSet],
    transactions,
    source,
  };
}
