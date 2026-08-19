import { prisma } from "@/lib/db/prisma";
import { coerceQuestionList, scoreQuiz, stripCorrectAnswers } from "@/services/quizzes/quiz-scoring";
import type { QuizAnswer, QuizAttemptResult, QuizPublicView } from "@/types/quiz.types";
import type { UpsertQuizInput } from "@/validations/quiz.schema";

/** Students can take a module test once it has questions (legacy saves defaulted published=false). */
export function isModuleTestVisibleToStudents<T extends { questionPool: unknown }>(
  test: T | null | undefined,
): test is T {
  if (!test) return false;
  return coerceQuestionList(test.questionPool).length > 0;
}

export async function getModuleTestForStudent(moduleId: string): Promise<QuizPublicView | null> {
  const test = await prisma.moduleTest.findUnique({ where: { moduleId } });
  if (!test || !isModuleTestVisibleToStudents(test)) return null;

  const questions = coerceQuestionList(test.questionPool);
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
    questions: coerceQuestionList(test.questionPool),
    published: test.published,
  };
}

export async function upsertModuleTest(moduleId: string, input: UpsertQuizInput) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return null;

  const published = input.published ?? true;

  const test = await prisma.moduleTest.upsert({
    where: { moduleId },
    create: {
      moduleId,
      title: input.title,
      passingScore: input.passingScore ?? 60,
      questionPool: input.questions,
      published,
    },
    update: {
      title: input.title,
      passingScore: input.passingScore,
      questionPool: input.questions,
      published,
    },
  });

  return {
    id: test.id,
    moduleId: test.moduleId,
    title: test.title,
    passingScore: test.passingScore,
    questions: coerceQuestionList(test.questionPool),
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
  if (!isModuleTestVisibleToStudents(test)) return null;

  const questions = coerceQuestionList(test.questionPool);
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
