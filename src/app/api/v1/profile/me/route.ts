import { fail, ok } from "@/lib/api/response";
import { normalizeCourseId } from "@/lib/api/path";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { getDatabaseUrl, isDevStandalone } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { getEnrolledCourseIds } from "@/services/enrollment/enrollment.service";
import { ensureUserProfile } from "@/services/enrollment/enrollment.service";

async function buildProfilePayload(
  user: { id: string; email: string; name: string },
  token: string,
) {
  const enrolledIds = await getEnrolledCourseIds(user.id, { accessToken: token });
  const enrolledCourseIds = [...enrolledIds].map(normalizeCourseId);

  let lessonsCompleted = 0;
  let totalLessons = 0;
  let displayName = user.name;

  if (getDatabaseUrl()) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true },
      });
      if (dbUser?.name?.trim()) displayName = dbUser.name.trim();
    } catch {
      // Keep auth name when DB is unavailable.
    }
  }

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
            userId: user.id,
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

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: user.email,
      name: displayName,
    },
    stats: {
      enrolledCourseCount: enrolledCourseIds.length,
      lessonsCompleted,
      totalLessons,
    },
    enrolledCourseIds,
  };
}

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "profile:me", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const payload = await buildProfilePayload(auth.user, auth.token);
  return ok(payload);
}

export async function PATCH(request: Request) {
  const limited = enforceApiRateLimit(request, "profile:patch", 20, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const nameRaw =
    body && typeof body === "object" && "name" in body
      ? (body as { name?: unknown }).name
      : undefined;

  if (typeof nameRaw !== "string") {
    return fail("name is required", 400);
  }

  const name = nameRaw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) {
    return fail("Name must be between 2 and 80 characters", 400);
  }

  if (getDatabaseUrl() && !isDevStandalone()) {
    try {
      await ensureUserProfile({
        id: auth.user.id,
        email: auth.user.email,
        name,
      });
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { name },
      });
    } catch {
      return fail("Could not save profile right now. Try again shortly.", 503);
    }
  } else if (getDatabaseUrl()) {
    // Standalone with DB: still persist locally so admin/CMS views stay in sync.
    try {
      await ensureUserProfile({
        id: auth.user.id,
        email: auth.user.email,
        name,
      });
    } catch {
      // Preferences still save client-side.
    }
  }

  const payload = await buildProfilePayload(
    { ...auth.user, name },
    auth.token,
  );
  return ok(payload);
}
