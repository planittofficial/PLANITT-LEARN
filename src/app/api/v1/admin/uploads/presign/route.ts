import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { createVideoUploadPresign } from "@/services/storage/video-storage.service";
import { parsePresignUpload } from "@/validations/quiz.schema";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:uploads:presign", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parsePresignUpload(body);
  if (!input) return fail("filename is required", 400);

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const lessonId = typeof record.lessonId === "string" ? record.lessonId.trim() : undefined;

  const presign = createVideoUploadPresign({
    filename: input.filename,
    contentType: input.contentType,
    lessonId,
  });

  return ok({ ok: true, presign });
}
