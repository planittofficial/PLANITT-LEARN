export type LessonKind = "video" | "article" | "external";

export type Lesson = {
  id: string;
  title: string;
  durationMinutes: number;
  kind: LessonKind;
  summary: string;
  content: {
    videoUrl?: string;
    markdown?: string;
    externalUrl?: string;
  };
};

export type CourseModule = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export type CourseDefinition = {
  /** Must match appbackend plan_id e.g. learn-forex-master-track */
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  blurb: string;
  outcomes: string[];
  modules: CourseModule[];
};

export const COMBO_PLAN_ID = "learn-all-courses-combo";

export const ALL_COURSE_IDS = [
  "learn-indian-stocks-pro",
  "learn-forex-master-track",
  "learn-fno-strategy-program",
  "learn-crypto-technical-edge",
  "learn-trader-psychology-intensive",
] as const;

/** Starter curriculum — interns extend this file only. */
export const COURSE_CATALOG: CourseDefinition[] = [
  {
    id: "learn-forex-master-track",
    title: "Forex Master Track",
    category: "Forex",
    level: "Intermediate",
    duration: "8 weeks",
    blurb: "Complete forex journey with fundamentals and technical strategy execution.",
    outcomes: [
      "Currency market mechanics",
      "Trend and breakout setups",
      "Risk and position sizing",
    ],
    modules: [
      {
        id: "fx-m1",
        title: "FX Foundations",
        summary: "How currency markets work.",
        lessons: [
          {
            id: "fx-m1-l1",
            title: "What moves currency pairs",
            durationMinutes: 12,
            kind: "article",
            summary: "Intro to drivers of FX price action.",
            content: {
              markdown:
                "## What moves currency pairs\n\nMajor drivers include interest-rate differentials, risk sentiment, and central bank policy.\n\nThis is placeholder content — replace with video or CMS content.",
            },
          },
          {
            id: "fx-m1-l2",
            title: "Reading a forex quote",
            durationMinutes: 10,
            kind: "article",
            summary: "Bid, ask, spread, and pip value.",
            content: {
              markdown:
                "## Reading a forex quote\n\nPractice identifying base vs quote currency and calculating pip risk on a demo account.",
            },
          },
        ],
      },
      {
        id: "fx-m2",
        title: "Technical Strategy Stack",
        summary: "Setups for trend and pullback trades.",
        lessons: [
          {
            id: "fx-m2-l1",
            title: "Trend continuation framework",
            durationMinutes: 18,
            kind: "article",
            summary: "Higher-high structure with defined invalidation.",
            content: {
              markdown:
                "## Trend continuation\n\nDefine entry, stop, and target before execution. Journal every setup.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "learn-indian-stocks-pro",
    title: "Indian Stocks + Mutual Fund",
    category: "Indian Stocks",
    level: "Beginner",
    duration: "7 weeks",
    blurb: "Indian market fundamentals and technical playbooks.",
    outcomes: ["Market structure", "Swing setups", "Portfolio discipline"],
    modules: [
      {
        id: "in-m1",
        title: "Market basics",
        summary: "NSE/BSE and order types.",
        lessons: [
          {
            id: "in-m1-l1",
            title: "Welcome to Indian equities",
            durationMinutes: 8,
            kind: "article",
            summary: "Course orientation.",
            content: { markdown: "## Welcome\n\nPlaceholder lesson — interns add content here." },
          },
        ],
      },
    ],
  },
  {
    id: "learn-fno-strategy-program",
    title: "F&O Strategy Program",
    category: "F&O",
    level: "Advanced",
    duration: "8 weeks",
    blurb: "Options and futures with expiry-aware workflows.",
    outcomes: ["Options basics", "Expiry setups", "Risk playbook"],
    modules: [],
  },
  {
    id: "learn-crypto-technical-edge",
    title: "Crypto Technical Edge",
    category: "Crypto",
    level: "Intermediate",
    duration: "7 weeks",
    blurb: "24x7 volatility-aware technical systems.",
    outcomes: ["Crypto mechanics", "Volatility setups", "Capital protection"],
    modules: [],
  },
  {
    id: "learn-trader-psychology-intensive",
    title: "Trader Psychology Intensive",
    category: "Psychology",
    level: "Beginner",
    duration: "6 weeks",
    blurb: "Mindset and execution discipline.",
    outcomes: ["Behavioral basics", "Stress decisions", "Journaling"],
    modules: [],
  },
];

export function getCourseById(courseId: string): CourseDefinition | undefined {
  return COURSE_CATALOG.find((c) => c.id === courseId);
}

export function getLessonByPath(
  courseId: string,
  moduleId: string,
  lessonId: string,
): { course: CourseDefinition; module: CourseModule; lesson: Lesson } | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) return null;
  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { course, module, lesson };
}
