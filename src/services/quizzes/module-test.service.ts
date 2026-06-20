import { prisma } from "@/lib/db/prisma";
import { scoreQuiz, stripCorrectAnswers } from "@/services/quizzes/quiz-scoring";
import type { QuizAnswer, QuizAttemptResult, QuizPublicView, QuizQuestion } from "@/types/quiz.types";
import type { UpsertQuizInput } from "@/validations/quiz.schema";

function parseQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw as QuizQuestion[];
}

export async function getModuleTestForStudent(moduleId: string): Promise<QuizPublicView | null> {
  const test = await prisma.moduleTest.findUnique({ where: { moduleId } });
  if (!test || !test.published) return null;

  const questions = parseQuestions(test.questionPool);
  return {
    id: test.id,
    moduleId: test.moduleId,
    title: test.title,
    passingScore: test.passingScore,
    questions: stripCorrectAnswers(questions),
  };
}

export async function getModuleTestForAdmin(moduleId: string) {
  const test = await prisma.moduleTest.findUnique({ where: { moduleId } });
  if (!test) return null;

  return {
    id: test.id,
    moduleId: test.moduleId,
    title: test.title,
    passingScore: test.passingScore,
    questions: parseQuestions(test.questionPool),
    published: test.published,
  };
}

export async function upsertModuleTest(moduleId: string, input: UpsertQuizInput) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return null;

  const test = await prisma.moduleTest.upsert({
    where: { moduleId },
    create: {
      moduleId,
      title: input.title,
      passingScore: input.passingScore ?? 60,
      questionPool: input.questions,
      published: input.published ?? false,
    },
    update: {
      title: input.title,
      passingScore: input.passingScore,
      questionPool: input.questions,
      published: input.published,
    },
  });

  return {
    id: test.id,
    moduleId: test.moduleId,
    title: test.title,
    passingScore: test.passingScore,
    questions: parseQuestions(test.questionPool),
    published: test.published,
  };
}

export async function deleteModuleTest(moduleId: string): Promise<boolean> {
  const existing = await prisma.moduleTest.findUnique({ where: { moduleId } });
  if (!existing) return false;
  await prisma.moduleTest.delete({ where: { moduleId } });
  return true;
}

export async function submitModuleTestAttempt(
  userId: string,
  moduleId: string,
  answers: QuizAnswer[],
): Promise<QuizAttemptResult | null> {
  const test = await prisma.moduleTest.findUnique({
    where: { moduleId },
    include: { module: { select: { courseId: true } } },
  });
  if (!test || !test.published) return null;

  const questions = parseQuestions(test.questionPool);
  const result = scoreQuiz(questions, answers, test.passingScore);

  await prisma.quizAttempt.create({
    data: {
      userId,
      attemptType: "module",
      moduleId,
      score: result.score,
      maxScore: result.maxScore,
      passed: result.passed,
      answers,
    },
  });

  return result;
}
