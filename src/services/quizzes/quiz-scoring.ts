import type { QuizAnswer, QuizAttemptResult, QuizQuestion } from "@/types/quiz.types";

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
