export const ROUTES = {
  STUDENT: {
    HOME: "/",
    LOGIN: "/login",
    COURSES: "/courses",
    course: (courseId: string) => `/courses/${courseId}`,
    lesson: (courseId: string, moduleId: string, lessonId: string) =>
      `/courses/${courseId}/${moduleId}/${lessonId}`,
    LEADERBOARD: "/leaderboard",
    ANALYTICS: "/analytics",
    ACHIEVEMENTS: "/achievements",
    NOTIFICATIONS: "/notifications",
    SEARCH: "/search",
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
      ADMIN: "/api/v1/auth/admin",
      GOOGLE: "/api/v1/auth/google",
      LOGIN: "/api/v1/auth/login",
      LOGOUT: "/api/v1/auth/logout",
      REFRESH: "/api/v1/auth/refresh",
      DEV_LOGIN: "/api/v1/auth/dev-login",
    },
    ENROLLMENT: {
      ME: "/api/v1/enrollment/me",
      PREVIEW: "/api/v1/enrollment/preview",
      verify: (courseId: string) => `/api/v1/enrollment/verify/${courseId}`,
    },
    COURSES: {
      LIST: "/api/v1/courses",
      detail: (courseId: string) => `/api/v1/courses/${courseId}`,
      modules: (courseId: string) => `/api/v1/courses/${courseId}/modules`,
      progress: (courseId: string) => `/api/v1/courses/${courseId}/progress`,
    },
    LESSONS: {
      detail: (lessonId: string) => `/api/v1/lessons/${lessonId}`,
      progress: (lessonId: string) => `/api/v1/lessons/${lessonId}/progress`,
    },
    QUIZZES: {
      lesson: (lessonId: string) => `/api/v1/quizzes/lessons/${lessonId}`,
      lessonAttempts: (lessonId: string) => `/api/v1/quizzes/lessons/${lessonId}/attempts`,
      module: (moduleId: string) => `/api/v1/quizzes/modules/${moduleId}`,
      moduleAttempts: (moduleId: string) => `/api/v1/quizzes/modules/${moduleId}/attempts`,
    },
    PROFILE: {
      ME: "/api/v1/profile/me",
    },
  },
} as const;
