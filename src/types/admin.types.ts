export type PlatformOverview = {
  totalStudents: number;
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalEnrollments: number;
  completedLessons: number;
};

export type AnalyticsOverview = PlatformOverview & {
  quizAttempts: number;
  quizPassRate: number;
  popularCourses: Array<{
    courseId: string;
    title: string;
    enrollmentCount: number;
  }>;
  recentActivity: Array<{
    userId: string;
    name: string;
    lessonId: string;
    lessonTitle: string;
    completed: boolean;
    lastWatchedAt: string;
  }>;
};

export type AdminStudentSummary = {
  id: string;
  email: string;
  name: string | null;
  enrolledCourseCount: number;
  lessonsCompleted: number;
  quizAttempts: number;
  createdAt: string;
};

export type AdminStudentDetail = AdminStudentSummary & {
  enrollments: Array<{
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
  }>;
  progress: Array<{
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    watchPercent: number;
    completed: boolean;
  }>;
  quizResults: Array<{
    id: string;
    type: "lesson" | "module";
    score: number;
    maxScore: number;
    passed: boolean;
    attemptedAt: string;
  }>;
};
