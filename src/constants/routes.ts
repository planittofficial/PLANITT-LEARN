import { encodePathSegment } from "@/lib/api/path";

export const ROUTES = {
  STUDENT: {
    HOME: "/",
    LOGIN: "/login",
    COURSES: "/courses",
    course: (courseId: string) => `/courses/${encodePathSegment(courseId)}`,
    lesson: (courseId: string, moduleId: string, lessonId: string) =>
      `/courses/${encodePathSegment(courseId)}/${encodePathSegment(moduleId)}/${encodePathSegment(lessonId)}`,
    moduleTest: (courseId: string, moduleId: string) =>
      `/courses/${encodePathSegment(courseId)}/${encodePathSegment(moduleId)}/test`,
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
      LOGIN_MPIN: "/api/v1/auth/login/mpin",
      HANDOFF: "/api/v1/auth/handoff",
      LOGOUT: "/api/v1/auth/logout",
      REFRESH: "/api/v1/auth/refresh",
      DEV_LOGIN: "/api/v1/auth/dev-login",
    },
    ENROLLMENT: {
      ME: "/api/v1/enrollment/me",
      PREVIEW: "/api/v1/enrollment/preview",
      verify: (courseId: string) => `/api/v1/enrollment/verify/${encodePathSegment(courseId)}`,
    },
    COURSES: {
      LIST: "/api/v1/courses",
      detail: (courseId: string) => `/api/v1/courses/${encodePathSegment(courseId)}`,
      modules: (courseId: string) => `/api/v1/courses/${encodePathSegment(courseId)}/modules`,
      progress: (courseId: string) => `/api/v1/courses/${encodePathSegment(courseId)}/progress`,
    },
    LESSONS: {
      detail: (lessonId: string) => `/api/v1/lessons/${encodePathSegment(lessonId)}`,
      playback: (lessonId: string) => `/api/v1/lessons/${encodePathSegment(lessonId)}/playback`,
      progress: (lessonId: string) => `/api/v1/lessons/${encodePathSegment(lessonId)}/progress`,
    },
    QUIZZES: {
      lesson: (lessonId: string) => `/api/v1/quizzes/lessons/${encodePathSegment(lessonId)}`,
      lessonAttempts: (lessonId: string) =>
        `/api/v1/quizzes/lessons/${encodePathSegment(lessonId)}/attempts`,
      module: (moduleId: string) => `/api/v1/quizzes/modules/${encodePathSegment(moduleId)}`,
      moduleAttempts: (moduleId: string) =>
        `/api/v1/quizzes/modules/${encodePathSegment(moduleId)}/attempts`,
    },
    PROFILE: {
      ME: "/api/v1/profile/me",
    },
  },
} as const;
