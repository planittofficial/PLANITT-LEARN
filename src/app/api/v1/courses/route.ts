import { fail, ok } from "@/lib/api/response";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { listPublishedCourses } from "@/services/courses/course.service";

/** Public catalog — published courses from the database. */
export async function GET() {
  try {
    const courses = await listPublishedCourses();
    return ok({ ok: true, courses });
  } catch (error) {
    return handleDatabaseError(error);
  }
}
