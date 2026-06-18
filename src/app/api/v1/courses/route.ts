import { ok } from "@/lib/api/response";
import { listPublishedCourses } from "@/services/courses/course.service";

/** Public catalog — published courses (DB or static fallback). */
export async function GET() {
  const courses = await listPublishedCourses();
  return ok({ ok: true, courses });
}
