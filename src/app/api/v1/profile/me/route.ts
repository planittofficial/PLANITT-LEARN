import { ok } from "@/lib/api/response";
import { normalizeCourseId } from "@/lib/api/path";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { getDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { getEnrolledCourseIds } from "@/services/enrollment/enrollment.service";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "profile:me", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const enrolledIds = await getEnrolledCourseIds(auth.user.id, { accessToken: auth.token });
  const enrolledCourseIds = [...enrolledIds].map(normalizeCourseId);

  let lessonsCompleted = 0;
  let totalLessons = 0;

  if (getDatabaseUrl() && enrolledCourseIds.length > 0) {
    try {
      const [lessonCount, completedCount] = await Promise.all([
        prisma.lesson.count({
          where: {
            published: true,
            module: { published: true, courseId: { in: enrolledCourseIds } },
          },
        }),
        prisma.lessonProgress.count({
          where: {
            userId: auth.user.id,
            completed: true,
            lesson: {
              published: true,
              module: { published: true, courseId: { in: enrolledCourseIds } },
            },
          },
        }),
      ]);
      totalLessons = lessonCount;
      lessonsCompleted = completedCount;
    } catch {
      // Leave counts at zero when DB is temporarily unavailable.
    }
  }

  return ok({
    ok: true,
    user: auth.user,
    stats: {
      enrolledCourseCount: enrolledCourseIds.length,
      lessonsCompleted,
      totalLessons,
    },
    enrolledCourseIds,
  });
}
