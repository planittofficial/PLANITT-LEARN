import { COURSE_CATALOG } from "@/lib/catalog/courses";

import { getTotalMinutesLearned, getWeeklyActivity, type WeeklyDay } from "./activity";
import { loadGamification, getLevelInfo } from "./gamification";
import { getQuizStats } from "./quiz-history";
import { loadCourseProgress, countCompletedLessons } from "./progress";

export type CourseAnalyticsRow = {
  courseId: string;
  title: string;
  category: string;
  lessonsCompleted: number;
  totalLessons: number;
  modulesCompleted: number;
  totalModules: number;
  percent: number;
};

export type StudentAnalyticsSnapshot = {
  totalMinutesLearned: number;
  totalHoursLearned: number;
  lessonsCompleted: number;
  totalLessons: number;
  modulesCompleted: number;
  totalModules: number;
  quizAverageScore: number | null;
  quizAttempts: number;
  weeklyActivity: WeeklyDay[];
  xp: number;
  streak: number;
  longestStreak: number;
  level: number;
  levelTitle: string;
  courseBreakdown: CourseAnalyticsRow[];
};

function countModulesCompleted(
  progress: ReturnType<typeof loadCourseProgress>,
  modules: (typeof COURSE_CATALOG)[0]["modules"],
): { completed: number; total: number } {
  let completed = 0;
  for (const mod of modules) {
    const lessonIds = mod.lessons.map((l) => l.id);
    const stats = countCompletedLessons(progress, lessonIds);
    if (stats.total > 0 && stats.completed === stats.total) completed += 1;
  }
  return { completed, total: modules.length };
}

export function getStudentAnalytics(userId: string): StudentAnalyticsSnapshot {
  const gamification = loadGamification(userId);
  const level = getLevelInfo(gamification.xp);
  const quiz = getQuizStats(userId);

  let lessonsCompleted = 0;
  let totalLessons = 0;
  let modulesCompleted = 0;
  let totalModules = 0;
  const courseBreakdown: CourseAnalyticsRow[] = [];

  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const lessonStats = countCompletedLessons(progress, lessonIds);
    const moduleStats = countModulesCompleted(progress, course.modules);

    lessonsCompleted += lessonStats.completed;
    totalLessons += lessonStats.total;
    modulesCompleted += moduleStats.completed;
    totalModules += moduleStats.total;

    const percent =
      lessonStats.total > 0 ? Math.round((lessonStats.completed / lessonStats.total) * 100) : 0;

    courseBreakdown.push({
      courseId: course.id,
      title: course.title,
      category: course.category,
      lessonsCompleted: lessonStats.completed,
      totalLessons: lessonStats.total,
      modulesCompleted: moduleStats.completed,
      totalModules: moduleStats.total,
      percent,
    });
  }

  const totalMinutesLearned = getTotalMinutesLearned(userId);

  return {
    totalMinutesLearned,
    totalHoursLearned: Math.round((totalMinutesLearned / 60) * 10) / 10,
    lessonsCompleted,
    totalLessons,
    modulesCompleted,
    totalModules,
    quizAverageScore: quiz.averageScore,
    quizAttempts: quiz.attempts,
    weeklyActivity: getWeeklyActivity(userId),
    xp: gamification.xp,
    streak: gamification.streak,
    longestStreak: gamification.longestStreak,
    level: level.level,
    levelTitle: level.title,
    courseBreakdown: courseBreakdown.filter((c) => c.totalLessons > 0),
  };
}

export function formatLearningTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
