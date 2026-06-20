export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type QuizAnswer = {
  questionId: string;
  selectedIndex: number;
};

export type QuizPublicView = {
  id: string;
  lessonId?: string;
  moduleId?: string;
  title: string | null;
  passingScore: number;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
  }>;
};

export type QuizAttemptResult = {
  score: number;
  maxScore: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  totalScore: number;
  completionPercent: number;
  lessonsCompleted: number;
};
