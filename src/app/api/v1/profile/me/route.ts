import { ok } from "@/lib/api/response";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { COURSE_CATALOG, countCourseLessons } from "@/lib/catalog/courses";
import { getEnrolledCourseIds } from "@/services/enrollment/enrollment.service";
import { getDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "profile:me", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const enrolledIds = await getEnrolledCourseIds(auth.user.id, { accessToken: auth.token });
  const enrolledCourseIds = [...enrolledIds];

  let lessonsCompleted = 0;
  let totalLessons = 0;

  for (const courseId of enrolledCourseIds) {
    const course = COURSE_CATALOG.find((c) => c.id === courseId);
    if (!course) continue;
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    totalLessons += lessonIds.length;
  }

  if (getDatabaseUrl()) {
    try {
      const rows = await prisma.lessonProgress.findMany({
        where: { userId: auth.user.id, completed: true },
        select: { lessonId: true },
      });
      lessonsCompleted = rows.length;
    } catch {
      // fall back to zero
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
