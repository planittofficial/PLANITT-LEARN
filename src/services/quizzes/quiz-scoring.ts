import type { QuizAnswer, QuizAttemptResult, QuizQuestion } from "@/types/quiz.types";

/** Normalize a Prisma Json question pool into an array (handles stringified JSON). */
export function coerceQuestionList(raw: unknown): QuizQuestion[] {
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is QuizQuestion => {
    if (!item || typeof item !== "object") return false;
    const q = item as Partial<QuizQuestion>;
    return (
      typeof q.id === "string" &&
      typeof q.prompt === "string" &&
      Array.isArray(q.options) &&
      q.options.length > 0
    );
  });
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  passingScore: number,
): QuizAttemptResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
  let correctCount = 0;

  for (const question of questions) {
    const selected = answerMap.get(question.id);
    if (selected === question.correctIndex) correctCount += 1;
  }

  const totalQuestions = questions.length;
  const maxScore = totalQuestions;
  const score = correctCount;
  const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percent >= passingScore;

  return {
    score,
    maxScore,
    passed,
    passingScore,
    correctCount,
    totalQuestions,
  };
}

export function stripCorrectAnswers(questions: QuizQuestion[]) {
  return questions.map(({ id, prompt, options }) => ({ id, prompt, options }));
}
