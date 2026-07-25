const BOOKMARKS_KEY = "alvest_learn_bookmarks";

export type Bookmark = {
  courseId: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  savedAt: string;
};

export function getBookmarks(userId: string): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${BOOKMARKS_KEY}:${userId}`);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(userId: string, lessonId: string): boolean {
  return getBookmarks(userId).some((b) => b.lessonId === lessonId);
}

export function toggleBookmark(userId: string, bookmark: Omit<Bookmark, "savedAt">): boolean {
  if (typeof window === "undefined") return false;
  const list = getBookmarks(userId);
  const exists = list.findIndex((b) => b.lessonId === bookmark.lessonId);
  let next: Bookmark[];
  let added: boolean;
  if (exists >= 0) {
    next = list.filter((b) => b.lessonId !== bookmark.lessonId);
    added = false;
  } else {
    next = [{ ...bookmark, savedAt: new Date().toISOString() }, ...list];
    added = true;
  }
  window.localStorage.setItem(`${BOOKMARKS_KEY}:${userId}`, JSON.stringify(next));
  return added;
}
