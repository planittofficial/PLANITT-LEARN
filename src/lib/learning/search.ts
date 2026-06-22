import { ROUTES } from "@/constants/routes";
import { COURSE_CATALOG } from "@/lib/catalog/courses";

import { getBookmarks } from "./bookmarks";
import { isEnrolledInCourse } from "./enrollment";

const RECENT_SEARCHES_KEY = "planitt_learn_recent_searches";
const MAX_RECENT = 8;

export type SearchResultType =
  | "course"
  | "module"
  | "lesson"
  | "bookmark"
  | "note";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
  enrolled: boolean;
  score: number;
};

export type SearchFilter = "all" | SearchResultType;

export const SEARCH_TYPE_LABELS: Record<SearchResultType, string> = {
  course: "Courses",
  module: "Modules",
  lesson: "Lessons",
  bookmark: "Bookmarks",
  note: "Notes",
};

function scoreText(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 85;
  if (t.includes(q)) return 65;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => t.includes(w))) return 45;
  return 0;
}

function bestScore(fields: string[], query: string): number {
  return Math.max(0, ...fields.map((f) => scoreText(f, query)));
}

function getAllNotes(userId: string): Array<{ lessonId: string; text: string }> {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`planitt_learn_notes:${userId}`);
    if (!raw) return [];
    const notes = JSON.parse(raw) as Record<string, string>;
    return Object.entries(notes)
      .filter(([, text]) => text.trim().length > 0)
      .map(([lessonId, text]) => ({ lessonId, text }));
  } catch {
    return [];
  }
}

function findLessonContext(lessonId: string) {
  for (const course of COURSE_CATALOG) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { course, module: mod, lesson };
      }
    }
  }
  return null;
}

function excerpt(text: string, query: string, maxLen = 80): string {
  const lower = text.toLowerCase();
  const q = query.toLowerCase().trim();
  const idx = lower.indexOf(q);
  if (idx < 0) return text.slice(0, maxLen) + (text.length > maxLen ? "…" : "");
  const start = Math.max(0, idx - 20);
  const slice = text.slice(start, start + maxLen);
  return (start > 0 ? "…" : "") + slice + (start + maxLen < text.length ? "…" : "");
}

export function searchLearningContent(
  query: string,
  options?: {
    userId?: string;
    enrolledIds?: Set<string>;
    filter?: SearchFilter;
    limit?: number;
  },
): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const enrolledIds = options?.enrolledIds ?? new Set<string>();
  const filter = options?.filter ?? "all";
  const limit = options?.limit ?? 40;
  const results: SearchResult[] = [];

  for (const course of COURSE_CATALOG) {
    const enrolled = isEnrolledInCourse(enrolledIds, course.id);

    if (filter === "all" || filter === "course") {
      const score = bestScore(
        [course.title, course.category, course.level, course.blurb, ...course.outcomes],
        q,
      );
      if (score > 0) {
        results.push({
          id: `course:${course.id}`,
          type: "course",
          title: course.title,
          subtitle: course.blurb,
          href: ROUTES.STUDENT.course(course.id),
          meta: `${course.category} · ${course.level}`,
          enrolled,
          score,
        });
      }
    }

    for (const mod of course.modules) {
      if (filter === "all" || filter === "module") {
        const score = bestScore([mod.title, mod.summary, course.title], q);
        if (score > 0) {
          results.push({
            id: `module:${course.id}:${mod.id}`,
            type: "module",
            title: mod.title,
            subtitle: mod.summary,
            href: ROUTES.STUDENT.course(course.id),
            meta: course.title,
            enrolled,
            score: score - 5,
          });
        }
      }

      for (const lesson of mod.lessons) {
        if (filter === "all" || filter === "lesson") {
          const score = bestScore(
            [lesson.title, lesson.summary, mod.title, course.title, lesson.kind],
            q,
          );
          if (score > 0) {
            results.push({
              id: `lesson:${lesson.id}`,
              type: "lesson",
              title: lesson.title,
              subtitle: lesson.summary,
              href: ROUTES.STUDENT.lesson(course.id, mod.id, lesson.id),
              meta: `${course.title} · ${lesson.durationMinutes} min`,
              enrolled,
              score,
            });
          }
        }
      }
    }
  }

  if (options?.userId) {
    if (filter === "all" || filter === "bookmark") {
      for (const bookmark of getBookmarks(options.userId)) {
        const score = bestScore(
          [bookmark.lessonTitle, bookmark.courseTitle],
          q,
        );
        if (score > 0) {
          results.push({
            id: `bookmark:${bookmark.lessonId}`,
            type: "bookmark",
            title: bookmark.lessonTitle,
            subtitle: bookmark.courseTitle,
            href: ROUTES.STUDENT.lesson(
              bookmark.courseId,
              bookmark.moduleId,
              bookmark.lessonId,
            ),
            meta: "Saved bookmark",
            enrolled: isEnrolledInCourse(enrolledIds, bookmark.courseId),
            score: score + 5,
          });
        }
      }
    }

    if (filter === "all" || filter === "note") {
      for (const { lessonId, text } of getAllNotes(options.userId)) {
        const score = bestScore([text], q);
        if (score > 0) {
          const ctx = findLessonContext(lessonId);
          if (!ctx) continue;
          results.push({
            id: `note:${lessonId}`,
            type: "note",
            title: ctx.lesson.title,
            subtitle: excerpt(text, q),
            href: ROUTES.STUDENT.lesson(ctx.course.id, ctx.module.id, lessonId),
            meta: `${ctx.course.title} · Your note`,
            enrolled: isEnrolledInCourse(enrolledIds, ctx.course.id),
            score: score + 3,
          });
        }
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentSearch(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2 || typeof window === "undefined") return;
  const existing = getRecentSearches().filter(
    (s) => s.toLowerCase() !== trimmed.toLowerCase(),
  );
  const next = [trimmed, ...existing].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export function groupSearchResults(results: SearchResult[]) {
  const groups: Record<SearchResultType, SearchResult[]> = {
    course: [],
    lesson: [],
    module: [],
    bookmark: [],
    note: [],
  };
  for (const result of results) {
    groups[result.type].push(result);
  }
  return groups;
}
