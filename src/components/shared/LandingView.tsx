"use client";

import Link from "next/link";
import { BookOpen, Shield, Cpu, Activity, ArrowRight, TrendingUp } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function LandingView() {
  const features = [
    {
      icon: BookOpen,
      title: "Guided Lessons",
      desc: "Structured modules that help learners build confidence step by step.",
      badge: "CLEAR_PATH",
    },
    {
      icon: Shield,
      title: "Safe Practice",
      desc: "Practice concepts in a low-pressure environment before moving forward.",
      badge: "SAFE_MODE",
    },
    {
      icon: Cpu,
      title: "Smart Progress",
      desc: "Track progress, streaks, and milestones with a clean, readable interface.",
      badge: "PROGRESS",
    },
  ];

  return (
    <div className="min-h-screen bg-appBase text-textPrimary relative overflow-hidden flex flex-col justify-between selection:bg-brand/20 selection:text-brand">
      <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="w-full bg-surface/90 backdrop-blur-md border-b border-borderSubtle z-50">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
              <TrendingUp className="h-5 w-5 text-brand" />
            </div>
            <span className="font-headline text-[20px] font-black text-brand tracking-tight">
              Alvest Learn
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="text-textSecondary hover:text-brand text-xs uppercase tracking-wider transition"
            >
              Login
            </Link>
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="bg-brand text-brandForeground font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brandHover active:scale-95 transition-all shadow-card"
            >
              Start learning
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] text-brand tracking-widest uppercase">
            <Activity className="h-3 w-3 animate-pulse" />
            Learning platform
          </div>

          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-textPrimary">
            A calmer way to <br />
            learn, practice, and <span className="text-brand">grow</span>
          </h1>

          <p className="text-textSecondary text-base md:text-lg max-w-xl leading-relaxed">
            Build real skills with a clean learning experience designed for focus, clarity, and steady progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="flex items-center justify-center gap-2 bg-brand text-brandForeground font-semibold text-sm px-6 py-3.5 rounded-lg hover:bg-brandHover active:scale-95 transition-all shadow-card"
            >
              Enter the classroom
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="flex items-center justify-center border border-borderSubtle hover:border-brand/40 text-textPrimary font-semibold text-sm px-6 py-3.5 rounded-lg hover:bg-overlay-hover transition"
            >
              Explore courses
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="glass-panel-stitch p-6 rounded-xl border border-borderSubtle relative z-10 space-y-4">
            <div className="flex justify-between items-center border-b border-borderSubtle pb-3">
              <span className="text-[10px] text-textSecondary uppercase tracking-widest">Learning snapshot</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              </div>
            </div>

            <div className="space-y-3 text-xs text-textSecondary leading-relaxed">
              <p className="text-brand">&gt; Personalized study path ready.</p>
              <p>&gt; Course progress is synced across devices.</p>
              <p>&gt; Lessons, notes, and milestones in one place.</p>
              <div className="p-4 bg-overlay-subtle border border-borderSubtle rounded-xl font-bold text-center text-textPrimary space-y-1">
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Focus index</div>
                <div className="text-2xl text-brand font-black">+24.85%</div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-purple-500 rounded-xl blur opacity-15" />
        </div>
      </main>

      <section className="bg-surface/70 border-t border-borderSubtle py-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item) => (
              <div key={item.title} className="p-6 bg-surface/80 border border-borderSubtle rounded-xl space-y-3 group hover:border-brand/40 transition shadow-card">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-brand/5 border border-brand/20 rounded text-brand">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-textMuted bg-overlay-subtle px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-textPrimary">{item.title}</h3>
                <p className="text-textSecondary text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-borderSubtle py-6 text-center text-xs text-textMuted z-10 relative">
        Educational content only - not investment advice. Always do your own due diligence.
      </footer>
    </div>
  );
}
