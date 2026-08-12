export const LMS_VIEW_MODE_KEY = "lms-view-mode";

export type LmsViewMode = "admin" | "student";

export function getLmsViewMode(): LmsViewMode | null {
  if (typeof window === "undefined") return null;
  const mode = localStorage.getItem(LMS_VIEW_MODE_KEY);
  if (mode === "admin" || mode === "student") return mode;
  return null;
}

export function setLmsViewMode(mode: LmsViewMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LMS_VIEW_MODE_KEY, mode);
}

export function isStudentViewMode(): boolean {
  return getLmsViewMode() === "student";
}
