import type { QuizAnswer, QuizQuestion } from "@/types/quiz.types";

export type UpsertQuizInput = {
  title?: string;
  passingScore?: number;
  questions: QuizQuestion[];
  published?: boolean;
};

function parseQuestions(raw: unknown): QuizQuestion[] | null {
  if (!Array.isArray(raw)) return null;

  const questions: QuizQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const q = item as Record<string, unknown>;
    const id = typeof q.id === "string" ? q.id.trim() : "";
    const prompt = typeof q.prompt === "string" ? q.prompt.trim() : "";
    const correctIndex = Number(q.correctIndex);
    const options = Array.isArray(q.options)
      ? q.options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean)
      : [];

    if (!id || !prompt || options.length < 2 || !Number.isInteger(correctIndex)) return null;
    if (correctIndex < 0 || correctIndex >= options.length) return null;

    questions.push({ id, prompt, options, correctIndex });
  }

  return questions.length > 0 ? questions : null;
}

export function parseUpsertQuiz(body: unknown): UpsertQuizInput | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;
  const questions = parseQuestions(r.questions);
  if (!questions) return null;

  const passingScore = r.passingScore !== undefined ? Number(r.passingScore) : undefined;
  if (passingScore !== undefined && (passingScore < 0 || passingScore > 100)) return null;

  return {
    title: typeof r.title === "string" ? r.title.trim() : undefined,
    passingScore,
    questions,
    published: typeof r.published === "boolean" ? r.published : undefined,
  };
}

export function parseQuizSubmission(body: unknown): QuizAnswer[] | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;
  const raw = r.answers ?? r.items;

  if (!Array.isArray(raw)) return null;

  const answers: QuizAnswer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const a = item as Record<string, unknown>;
    const questionId =
      typeof a.questionId === "string"
        ? a.questionId.trim()
        : typeof a.id === "string"
          ? a.id.trim()
          : "";
    const selectedIndex = Number(a.selectedIndex ?? a.answerIndex);

    if (!questionId || !Number.isInteger(selectedIndex) || selectedIndex < 0) return null;
    answers.push({ questionId, selectedIndex });
  }

  return answers.length > 0 ? answers : null;
}

export function parsePresignUpload(body: unknown): { filename: string; contentType: string } | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;
  const filename = typeof r.filename === "string" ? r.filename.trim() : "";
  const contentType = typeof r.contentType === "string" ? r.contentType.trim() : "video/mp4";
  if (!filename) return null;
  return { filename, contentType };
}
