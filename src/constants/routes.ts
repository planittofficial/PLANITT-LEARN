export const ROUTES = {
  STUDENT: {
    HOME: "/",
    LOGIN: "/login",
    COURSES: "/courses",
    course: (courseId: string) => `/courses/${courseId}`,
    lesson: (courseId: string, moduleId: string, lessonId: string) =>
      `/courses/${courseId}/${moduleId}/${lessonId}`,
    LEADERBOARD: "/leaderboard",
    PROFILE: "/profile",
  },
  ADMIN: {
    HOME: "/admin",
    COURSES: "/admin/courses",
    STUDENTS: "/admin/students",
    LEADERBOARD: "/admin/leaderboard",
    ANALYTICS: "/admin/analytics",
  },
  API: {
    AUTH: {
      ME: "/api/v1/auth/me",
      GOOGLE: "/api/v1/auth/google",
      LOGOUT: "/api/v1/auth/logout",
      REFRESH: "/api/v1/auth/refresh",
      DEV_LOGIN: "/api/v1/auth/dev-login",
    },
    ENROLLMENT: {
      ME: "/api/v1/enrollment/me",
      PREVIEW: "/api/v1/enrollment/preview",
    },
  },
} as const;
