"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

import type { CourseDefinition } from "@/lib/catalog/courses";
import { getContinueLessonUrl } from "@/lib/learning/course-progress";
import { cn } from "@/lib/utils";

type ContinueLearningCardProps = {
  course: CourseDefinition;
  userId: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
};

export function ContinueLearningCard({
  course,
  userId,
  progressPercent,
  completedLessons,
  totalLessons,
}: ContinueLearningCardProps) {
  const continueUrl = getContinueLessonUrl(userId, course);
  if (!continueUrl) return null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-borderSubtle bg-surface min-h-[320px] flex flex-col md:flex-row shadow-2xl transition-all duration-300 hover:border-brand/35">
      <div className="relative z-10 flex-1 p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-[1px] bg-brand"></span>
            <span className="font-mono text-[10px] text-brand font-bold uppercase tracking-widest">Active Intelligence</span>
          </div>
          <h3 className="font-headline text-2xl md:text-3xl font-bold text-textPrimary mb-3 leading-tight">
            {course.title}
          </h3>
          <p className="font-sans text-textSecondary max-w-md text-sm leading-relaxed">
            {course.blurb || "Systematic analysis of market imbalances and quantitative portfolios."}
          </p>
        </div>
        <div className="flex items-center gap-6 mt-8">
          <Link
            href={continueUrl}
            className="bg-brand text-brandForeground px-6 py-3 rounded font-mono text-xs font-bold transition-all hover:brightness-110 active:scale-95 flex items-center gap-2 tracking-tighter"
          >
            INITIALIZE_LESSON <Zap className="h-3 w-3 fill-current" />
          </Link>
          <span className="font-mono text-[11px] text-textSecondary flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            {progressPercent}% completed ({completedLessons}/{totalLessons} lessons)
          </span>
        </div>
      </div>
      <div className="relative w-full md:w-2/5 min-h-[200px] md:min-h-full border-l border-borderSubtle overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-85 transition-all duration-700"
          alt="Technical Chart"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1bc_1Pc7nVTaOGr8IEvdoqAu2RxbkMyshu44eVgFNjLvZQg2bbK9KlDjaw9lpg42gDOHyKUtelzK1hnNkps0fupE-QwHf12pwvPm1Pp_4AmXTWpDdZhYBkWqvOCI-TOXkKH6ue5D2yVNnGUcDmGoxCShHT6CciSN92IrnBpLCWetM5AZrGix-SKeRtiMvOfqMswUhqg_R4NYyVHYJ0gk51chL7xPrIMZagUTtqh0xx50zFRjAePcPDvqJ0qepCf3635tvn7SpBTU"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/40 to-transparent" />
      </div>
    </div>
  );
}
