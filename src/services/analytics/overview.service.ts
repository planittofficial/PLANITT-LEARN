import { COURSE_CATALOG, countCourseLessons } from "@/lib/catalog/courses";
import { prisma } from "@/lib/db/prisma";
import type { PlatformOverview } from "@/types/admin.types";

function overviewFromCatalog(): PlatformOverview {
  const totalModules = COURSE_CATALOG.reduce((sum, course) => sum + course.modules.length, 0);
  const totalLessons = COURSE_CATALOG.reduce((sum, course) => sum + countCourseLessons(course), 0);

  return {
    totalStudents: 0,
    totalCourses: COURSE_CATALOG.length,
    totalModules,
    totalLessons,
    totalEnrollments: 0,
    completedLessons: 0,
  };
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  try {
    const [students, courses, modules, lessons, enrollments, completedLessons] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.enrollment.count(),
      prisma.lessonProgress.count({ where: { completed: true } }),
    ]);

    return {
      totalStudents: students,
      totalCourses: courses,
      totalModules: modules,
      totalLessons: lessons,
      totalEnrollments: enrollments,
      completedLessons,
    };
  } catch {
    return overviewFromCatalog();
  }
}