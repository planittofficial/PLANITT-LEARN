import { prisma } from "@/lib/db/prisma";
import { scoreQuiz, stripCorrectAnswers } from "@/services/quizzes/quiz-scoring";
import type { QuizAnswer, QuizAttemptResult, QuizPublicView, QuizQuestion } from "@/types/quiz.types";
import type { UpsertQuizInput } from "@/validations/quiz.schema";

function parseQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw as QuizQuestion[];
}

export async function getLessonQuizForStudent(lessonId: string): Promise<QuizPublicView | null> {
  const quiz = await prisma.lessonQuiz.findUnique({ where: { lessonId } });
  if (!quiz || !quiz.published) return null;

  const questions = parseQuestions(quiz.questions);
  return {
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: stripCorrectAnswers(questions),
  };
}

export async function getLessonQuizForAdmin(lessonId: string) {
  const quiz = await prisma.lessonQuiz.findUnique({ where: { lessonId } });
  if (!quiz) return null;

  return {
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: parseQuestions(quiz.questions),
    published: quiz.published,
  };
}

export async function upsertLessonQuiz(lessonId: string, input: UpsertQuizInput) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return null;

  const quiz = await prisma.lessonQuiz.upsert({
    where: { lessonId },
    create: {
      lessonId,
      title: input.title,
      passingScore: input.passingScore ?? 60,
      questions: input.questions,
      published: input.published ?? false,
    },
    update: {
      title: input.title,
      passingScore: input.passingScore,
      questions: input.questions,
      published: input.published,
    },
  });

  return {
    id: quiz.id,
    lessonId: quiz.lessonId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: parseQuestions(quiz.questions),
    published: quiz.published,
  };
}

export async function deleteLessonQuiz(lessonId: string): Promise<boolean> {
  const existing = await prisma.lessonQuiz.findUnique({ where: { lessonId } });
  if (!existing) return false;
  await prisma.lessonQuiz.delete({ where: { lessonId } });
  return true;
}

export async function submitLessonQuizAttempt(
  userId: string,
  lessonId: string,
  answers: QuizAnswer[],
): Promise<QuizAttemptResult | null> {
  const quiz = await prisma.lessonQuiz.findUnique({
    where: { lessonId },
    include: { lesson: { select: { module: { select: { courseId: true } } } } },
  });
  if (!quiz || !quiz.published) return null;

  const questions = parseQuestions(quiz.questions);
  const result = scoreQuiz(questions, answers, quiz.passingScore);

  await prisma.quizAttempt.create({
    data: {
      userId,
      attemptType: "lesson",
      lessonId,
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      answers,
    },
  });

  return result;
}
