import type { PaymentTransaction } from "@/lib/learning/enrollment";

/** Where enrollment data was resolved (for debugging / UI badges in dev). */
export type EnrollmentSource = "dev_mock" | "planitt" | "mixed";

/**
 * GET /api/v1/enrollment/me — canonical enrollment response.
 * Main website integration: appbackend payment history → enrolledCourseIds.
 */
export type EnrollmentMeResponse = {
  ok: true;
  enrolledCourseIds: string[];
  items: PaymentTransaction[];
  source: EnrollmentSource;
};

export type EnrollmentPreviewResponse = {
  standalone: boolean;
  enrolledCourseIds: string[];
};

export type EnrollmentVerifyResponse = {
  ok: true;
  enrolled: boolean;
};
