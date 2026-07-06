export type ParsedQuizQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type ParseQuizPasteResult = {
  ok: true;
  questions: ParsedQuizQuestion[];
  warnings: string[];
};

export type ParseQuizPasteFailure = {
  ok: false;
  error: string;
};

const OPTION_LINE =
  /^(?:\(?\s*([A-Za-z])\s*\)?[\.\)\:\-\]]\s*|[-*•]\s+|\(?\s*(\d+)\s*\)\s*)(.+)$/;

const ANSWER_LINE = /^(?:answer|correct(?:\s+answer)?|key)\s*[\:\-]\s*(.+)$/i;

const QUESTION_START =
  /^(?:(?:Q|Question)\s*\d+[\.\)\:\s]+|\d+[\.\)]\s+)(.+)$/i;

function splitBlocks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const byBlankLine = normalized
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (byBlankLine.length > 1) return byBlankLine;

  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const startsQuestion =
      QUESTION_START.test(trimmed) ||
      /^(?:Q|Question)\s*\d+[\.\)\:\s]/i.test(trimmed) ||
      /^\d+[\.\)]\s+\S/.test(trimmed);

    if (startsQuestion && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [trimmed];
    } else {
      current.push(trimmed);
    }
  }

  if (current.length > 0) blocks.push(current.join("\n"));
  return blocks.length > 0 ? blocks : [normalized];
}

function letterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

function resolveCorrectIndex(
  answerRaw: string,
  options: string[],
): { index: number; warning?: string } {
  const answer = answerRaw.trim();
  if (!answer) return { index: 0 };

  if (/^[A-Za-z]$/.test(answer)) {
    const index = letterToIndex(answer);
    if (index >= 0 && index < options.length) return { index };
    return {
      index: 0,
      warning: `Answer "${answer}" is out of range; defaulted to first option.`,
    };
  }

  const asNumber = Number(answer);
  if (!Number.isNaN(asNumber) && asNumber >= 1 && asNumber <= options.length) {
    return { index: asNumber - 1 };
  }

  const textIndex = options.findIndex(
    (opt) => opt.toLowerCase() === answer.toLowerCase(),
  );
  if (textIndex >= 0) return { index: textIndex };

  const partialIndex = options.findIndex(
    (opt) =>
      opt.toLowerCase().includes(answer.toLowerCase()) ||
      answer.toLowerCase().includes(opt.toLowerCase()),
  );
  if (partialIndex >= 0) return { index: partialIndex };

  return {
    index: 0,
    warning: `Could not match answer "${answer}"; defaulted to first option.`,
  };
}

function stripQuestionPrefix(line: string): string {
  return line
    .replace(/^(?:Q|Question)\s*\d+[\.\)\:\s]+/i, "")
    .replace(/^\d+[\.\)]\s+/, "")
    .trim();
}

function parseBlock(
  block: string,
  blockIndex: number,
): { question: ParsedQuizQuestion; warning?: string } | null {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  let answerRaw: string | null = null;
  const contentLines: string[] = [];

  for (const line of lines) {
    const answerMatch = line.match(ANSWER_LINE);
    if (answerMatch) {
      answerRaw = answerMatch[1].trim();
      continue;
    }
    contentLines.push(line);
  }

  const options: string[] = [];
  const promptLines: string[] = [];

  for (const line of contentLines) {
    const optionMatch = line.match(OPTION_LINE);
    if (optionMatch) {
      options.push(optionMatch[3].trim());
      continue;
    }
    promptLines.push(line);
  }

  let prompt = promptLines.map(stripQuestionPrefix).join(" ").trim();
  if (!prompt && options.length > 0) {
    prompt = `Question ${blockIndex + 1}`;
  }

  if (!prompt || options.length < 2) return null;

  const { index: correctIndex, warning } = resolveCorrectIndex(
    answerRaw ?? "A",
    options,
  );

  return { question: { prompt, options, correctIndex }, warning };
}

export function parseQuizPaste(text: string): ParseQuizPasteResult | ParseQuizPasteFailure {
  const blocks = splitBlocks(text);
  if (blocks.length === 0) {
    return { ok: false, error: "Paste some questions first." };
  }

  const questions: ParsedQuizQuestion[] = [];
  const warnings: string[] = [];

  blocks.forEach((block, index) => {
    const parsed = parseBlock(block, index);
    if (!parsed) {
      warnings.push(`Block ${index + 1} was skipped (need a prompt and at least 2 options).`);
      return;
    }

    if (parsed.warning) {
      warnings.push(`Question ${questions.length + 1}: ${parsed.warning}`);
    }

    questions.push(parsed.question);
  });

  if (questions.length === 0) {
    return {
      ok: false,
      error:
        "No valid questions found. Use numbered questions with lettered options (A), B), …) and an Answer line.",
    };
  }

  return { ok: true, questions, warnings };
}
