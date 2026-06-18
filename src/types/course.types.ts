export type LessonKind = "video" | "article" | "external";

export type LessonContent = {
  markdown?: string;
  videoUrl?: string;
  externalUrl?: string;
};

export type ApiLesson = {
  id: string;
  title: string;
  summary: string;
  kind: LessonKind;
  durationMinutes: number;
  minWatchPercent: number;
  content: LessonContent;
};

export type ApiModule = {
  id: string;
  title: string;
  summary: string;
  lessons: ApiLesson[];
};

export type ApiCourseListItem = {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  blurb: string;
  outcomes: string[];
  moduleCount: number;
  lessonCount: number;
};

export type ApiCourseDetail = ApiCourseListItem & {
  modules: ApiModule[];
};

export type ApiAdminCourse = ApiCourseListItem & {
  published: boolean;
  sortOrder: number;
};
