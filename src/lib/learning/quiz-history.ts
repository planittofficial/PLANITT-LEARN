const QUIZ_HISTORY_KEY = "alvest_learn_quiz_history";

export type QuizHistoryEntry = {
  id: string;
  type: "lesson" | "module";
  targetId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptedAt: string;
};

export function recordQuizAttempt(
  userId: string,
  entry: Omit<QuizHistoryEntry, "id" | "attemptedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(`${QUIZ_HISTORY_KEY}:${userId}`);
    const list: QuizHistoryEntry[] = raw ? (JSON.parse(raw) as QuizHistoryEntry[]) : [];
    list.unshift({
      ...entry,
      id: `${Date.now()}-${entry.targetId}`,
      attemptedAt: new Date().toISOString(),
    });
    window.localStorage.setItem(
      `${QUIZ_HISTORY_KEY}:${userId}`,
      JSON.stringify(list.slice(0, 100)),
    );
  } catch {
    // ignore
  }
}

export function getQuizHistory(userId: string): QuizHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${QUIZ_HISTORY_KEY}:${userId}`);
    return raw ? (JSON.parse(raw) as QuizHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function getQuizStats(userId: string): {
  attempts: number;
  averageScore: number | null;
  passRate: number | null;
} {
  const history = getQuizHistory(userId);
  if (history.length === 0) {
    return { attempts: 0, averageScore: null, passRate: null };
  }

  const totalPercent = history.reduce((sum, h) => {
    const pct = h.maxScore > 0 ? (h.score / h.maxScore) * 100 : 0;
    return sum + pct;
  }, 0);

  const passed = history.filter((h) => h.passed).length;

  return {
    attempts: history.length,
    averageScore: Math.round((totalPercent / history.length) * 10) / 10,
    passRate: Math.round((passed / history.length) * 100),
  };
}
