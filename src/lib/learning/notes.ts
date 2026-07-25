const NOTES_KEY = "alvest_learn_notes";

export function getLessonNote(userId: string, lessonId: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(`${NOTES_KEY}:${userId}`);
    if (!raw) return "";
    const notes = JSON.parse(raw) as Record<string, string>;
    return notes[lessonId] ?? "";
  } catch {
    return "";
  }
}

export function saveLessonNote(userId: string, lessonId: string, note: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(`${NOTES_KEY}:${userId}`);
    const notes: Record<string, string> = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    if (note.trim()) notes[lessonId] = note;
    else delete notes[lessonId];
    window.localStorage.setItem(`${NOTES_KEY}:${userId}`, JSON.stringify(notes));
  } catch {
    // ignore
  }
}
