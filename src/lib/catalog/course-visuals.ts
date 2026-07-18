import type { CourseDefinition } from "@/lib/catalog/courses";

/** Category-based gradient fallbacks (used under covers / if cover missing). */
export const CATEGORY_THUMBNAILS: Record<string, string> = {
  "Indian Stocks": "from-emerald-600/80 via-teal-700/60 to-appBase",
  Forex: "from-sky-600/80 via-blue-800/60 to-appBase",
  "F&O": "from-violet-600/80 via-purple-800/60 to-appBase",
  Crypto: "from-amber-500/80 via-orange-700/60 to-appBase",
  Psychology: "from-rose-500/80 via-pink-800/60 to-appBase",
  "Algo Trading": "from-indigo-600/80 via-blue-900/60 to-appBase",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Indian Stocks": "📈",
  Forex: "💱",
  "F&O": "📊",
  Crypto: "₿",
  Psychology: "🧠",
  "Algo Trading": "🤖",
};

/** Illustrated cover art for course card thumbnails. */
export const CATEGORY_COVERS: Record<string, string> = {
  "Indian Stocks": "/course-covers/indian-stocks.svg",
  Forex: "/course-covers/forex.svg",
  "F&O": "/course-covers/fno.svg",
  Crypto: "/course-covers/crypto.svg",
  Psychology: "/course-covers/psychology.svg",
  "Algo Trading": "/course-covers/algo-trading.svg",
};

export function courseThumbnailClass(category: string): string {
  return CATEGORY_THUMBNAILS[category] ?? "from-brand/40 via-brand/20 to-appBase";
}

export function courseCoverSrc(category: string): string | undefined {
  return CATEGORY_COVERS[category];
}

export function courseIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "📚";
}

export function courseInitials(title: string): string {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function courseCoverAlt(course: CourseDefinition): string {
  return `${course.title} cover`;
}
