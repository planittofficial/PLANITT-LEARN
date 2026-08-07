import { EnrollmentSource } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { enrollmentWebhookSecret, getDatabaseUrl } from "@/lib/env";

import {
  courseIdsForPlan,
  ensureUserProfile,
} from "@/services/enrollment/enrollment.service";

export class WebhookError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "WebhookError";
    this.status = status;
  }
}

export type EnrollmentWebhookPayload = {
  user_id: string;
  plan_id: string;
  email?: string;
  name?: string | null;
  status?: string;
};

function normalizePayload(body: unknown): EnrollmentWebhookPayload | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const userId =
    typeof record.user_id === "string"
      ? record.user_id.trim()
      : typeof record.userId === "string"
        ? record.userId.trim()
        : "";
  const planId =
    typeof record.plan_id === "string"
      ? record.plan_id.trim().toLowerCase()
      : typeof record.planId === "string"
        ? record.planId.trim().toLowerCase()
        : "";

  if (!userId || !planId) return null;

  const email =
    typeof record.email === "string" ? record.email.trim().toLowerCase() : undefined;
  const name =
    typeof record.name === "string"
      ? record.name.trim()
      : record.name === null
        ? null
        : undefined;
  const status = typeof record.status === "string" ? record.status.trim().toLowerCase() : undefined;

  return { user_id: userId, plan_id: planId, email, name, status };
}

export function validateWebhookSecret(request: Request): void {
  const expected = enrollmentWebhookSecret();
  if (!expected) {
    throw new WebhookError("Enrollment webhook is not configured", 503);
  }

  const headerSecret =
    request.headers.get("x-learn-webhook-secret")?.trim() ??
    request.headers.get("x-webhook-secret")?.trim();

  if (headerSecret && headerSecret === expected) return;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token === expected) return;
  }

  throw new WebhookError("Invalid webhook secret", 401);
}

export type ProcessEnrollmentWebhookResult = {
  userId: string;
  planId: string;
  courseIds: string[];
  enrollmentsCreated: number;
};

export async function processEnrollmentWebhook(
  request: Request,
  body: unknown,
): Promise<ProcessEnrollmentWebhookResult> {
  validateWebhookSecret(request);

  if (!getDatabaseUrl()) {
    throw new WebhookError("DATABASE_URL is required for enrollment webhooks", 503);
  }

  const payload = normalizePayload(body);
  if (!payload) {
    throw new WebhookError("Invalid webhook payload", 400);
  }

  if (payload.status && payload.status !== "paid") {
    throw new WebhookError("Only paid enrollments are processed", 400);
  }

  const courseIds = courseIdsForPlan(payload.plan_id);
  if (courseIds.length === 0) {
    throw new WebhookError("Unknown or invalid plan_id", 400);
  }

  const event = await prisma.enrollmentEvent.create({
    data: {
      userId: payload.user_id,
      planId: payload.plan_id,
      courseId: courseIds[0] ?? null,
      payload: body as object,
      processed: false,
    },
  });

  try {
    if (!payload.email) {
      throw new WebhookError("email is required to create user", 400);
    }

    await ensureUserProfile({
      id: payload.user_id,
      email: payload.email,
      name: payload.name,
    });

    let enrollmentsCreated = 0;

    for (const courseId of courseIds) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) continue;

      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: payload.user_id,
            courseId,
          },
        },
        create: {
          userId: payload.user_id,
          courseId,
          planId: payload.plan_id,
          source: EnrollmentSource.payment,
        },
        update: {
          planId: payload.plan_id,
          source: EnrollmentSource.payment,
        },
      });
      enrollmentsCreated += 1;
    }

    if (enrollmentsCreated === 0) {
      throw new WebhookError(
        `No courses in Learn DB match plan_id "${payload.plan_id}". Run db:seed to sync the catalog.`,
        422,
      );
    }

    await prisma.enrollmentEvent.update({
      where: { id: event.id },
      data: { processed: true },
    });

    return {
      userId: payload.user_id,
      planId: payload.plan_id,
      courseIds,
      enrollmentsCreated,
    };
  } catch (error) {
    if (error instanceof WebhookError) throw error;
    throw new WebhookError("Failed to process enrollment webhook", 500);
  }
}
