import { fail, ok } from "@/lib/api/response";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import {
  processEnrollmentWebhook,
  WebhookError,
} from "@/services/enrollment/webhook.service";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "webhooks:enrollment", 30, 60_000);
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    const result = await processEnrollmentWebhook(request, body);

    return ok({
      ok: true,
      userId: result.userId,
      planId: result.planId,
      courseIds: result.courseIds,
      enrollmentsCreated: result.enrollmentsCreated,
    });
  } catch (error) {
    if (error instanceof WebhookError) {
      return fail(error.message, error.status);
    }
    logServerError("enrollment webhook", error);
    return fail("Webhook processing failed", 500);
  }
}
