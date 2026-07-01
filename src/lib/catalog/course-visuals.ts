import type { CourseDefinition } from "@/lib/catalog/courses";

/** Category-based gradient thumbnails (no image assets required). */
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

export function courseThumbnailClass(category: string): string {
  return CATEGORY_THUMBNAILS[category] ?? "from-brand/40 via-brand/20 to-appBase";
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
