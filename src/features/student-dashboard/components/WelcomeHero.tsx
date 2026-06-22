"use client";

import { Flame, Sparkles, Target, Trophy } from "lucide-react";

import { useAuth } from "@/context/auth-context";

type WelcomeHeroProps = {
  enrolledCount: number;
  lessonsCompleted: number;
  avgProgress: number;
};

const TIPS = [
  "Complete 75% of a video to mark it done — stay focused!",
  "Take the lesson quiz to lock in what you learned.",
  "Climb the leaderboard by finishing modules faster.",
  "Consistency beats intensity — one lesson a day adds up.",
];

export function WelcomeHero({ enrolledCount, lessonsCompleted, avgProgress }: WelcomeHeroProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Learner";
  const tip = TIPS[new Date().getDate() % TIPS.length];

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/10 via-surface to-base p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-brand">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest">Your learning hub</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Hey {firstName},{" "}
          <span className="bg-gradient-to-r from-brand to-emerald-300 bg-clip-text text-transparent">
            keep going!
          </span>
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-textSecondary">{tip}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-borderSubtle/80 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
            <Target className="h-4 w-4 text-brand" />
            <span className="text-sm">
              <strong className="text-textPrimary">{enrolledCount}</strong>{" "}
              <span className="text-textMuted">courses</span>
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-borderSubtle/80 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm">
              <strong className="text-textPrimary">{lessonsCompleted}</strong>{" "}
              <span className="text-textMuted">lessons done</span>
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-borderSubtle/80 bg-black/20 px-4 py-2.5 backdrop-blur-sm">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-sm">
              <strong className="text-textPrimary">{avgProgress}%</strong>{" "}
              <span className="text-textMuted">avg progress</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
