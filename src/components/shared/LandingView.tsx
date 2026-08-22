"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Shield,
  Cpu,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AlvestLogo } from "@/components/brand";
import { ROUTES } from "@/constants/routes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { COURSE_CATALOG_DATA } from "@/lib/catalog/course-content";
import { cn } from "@/lib/utils";

const SANDBOX_QUESTIONS = [
  {
    category: "TECHNICAL ANALYSIS",
    question: "Which chart pattern typically indicates a bullish trend reversal?",
    options: [
      "Head and Shoulders",
      "Double Bottom",
      "Bearish Engulfing",
      "Rising Wedge",
    ],
    correctAnswer: 1, // Double Bottom
    explanation: "Correct! A Double Bottom pattern resembles a 'W' shape and indicates that the selling momentum has exhausted, leading to a bullish reversal.",
  },
  {
    category: "RISK MANAGEMENT",
    question: "What is the recommended maximum capital risk per single trade for beginners?",
    options: [
      "1% - 2%",
      "5% - 10%",
      "15% - 20%",
      "50%",
    ],
    correctAnswer: 0, // 1% - 2%
    explanation: "Correct! Risking only 1% to 2% of capital per trade ensures that a run of bad trades won't wipe out your account, letting you survive long term.",
  },
  {
    category: "MARKET ESSENTIALS",
    question: "Which indicator is best suited for identifying overbought or oversold conditions?",
    options: [
      "Moving Average",
      "Volume Profile",
      "Relative Strength Index (RSI)",
      "Fibonacci Retracement",
    ],
    correctAnswer: 2, // RSI
    explanation: "Correct! The Relative Strength Index (RSI) is a momentum oscillator from 0 to 100 where values above 70 indicate overbought, and below 30 indicate oversold.",
  },
];

export function LandingView() {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [focusIndex, setFocusIndex] = useState(24.85);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

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

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === SANDBOX_QUESTIONS[currentQuestionIdx].correctAnswer;
    setIsCorrect(correct);
    setHasSubmitted(true);
    if (correct) {
      setFocusIndex((prev) => prev + 1.0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(null);
    if (currentQuestionIdx < SANDBOX_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setCurrentQuestionIdx(0);
      setFocusIndex(24.85); // reset
    }
  };

  // Get unique categories for curriculum tabs
  const categories = ["All", ...Array.from(new Set(COURSE_CATALOG_DATA.map((c) => c.category)))];

  // Filter courses based on tab selection
  const filteredCourses = selectedCategory === "All"
    ? COURSE_CATALOG_DATA
    : COURSE_CATALOG_DATA.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-appBase text-textPrimary relative overflow-hidden flex flex-col justify-between selection:bg-brand/20 selection:text-brand">
      <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="w-full bg-surface/90 backdrop-blur-md border-b border-borderSubtle z-50">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlvestLogo variant="markClear" size={40} priority className="drop-shadow-sm" />
            <span className="font-headline text-[20px] font-black text-brand tracking-tight">
              Alvest Learn
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle className="mr-2" />
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
          <div className="glass-panel-stitch p-6 rounded-xl border border-borderSubtle relative z-10 space-y-4 shadow-card bg-surface/60 backdrop-blur-md">
            <div className="flex justify-between items-center border-b border-borderSubtle pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-brand animate-pulse" />
                <span className="text-[10px] font-bold text-textPrimary uppercase tracking-widest">
                  Interactive Sandbox
                </span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] px-2 py-0.5 rounded bg-brand/10 border border-brand/20 font-bold text-brand uppercase tracking-wider">
                  {SANDBOX_QUESTIONS[currentQuestionIdx].category}
                </span>
                <span className="text-[10px] text-textMuted font-mono">
                  Q: {currentQuestionIdx + 1} / {SANDBOX_QUESTIONS.length}
                </span>
              </div>

              <p className="text-xs font-semibold text-textPrimary leading-snug">
                {SANDBOX_QUESTIONS[currentQuestionIdx].question}
              </p>

              <div className="space-y-2">
                {SANDBOX_QUESTIONS[currentQuestionIdx].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === SANDBOX_QUESTIONS[currentQuestionIdx].correctAnswer;

                  let optionStyles = "border-borderSubtle hover:border-brand/40 text-textSecondary hover:text-textPrimary bg-transparent";
                  if (hasSubmitted) {
                    if (isCorrectAnswer) {
                      optionStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                    } else if (isSelected) {
                      optionStyles = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                    } else {
                      optionStyles = "border-borderSubtle/50 text-textMuted opacity-50";
                    }
                  } else if (isSelected) {
                    optionStyles = "border-brand text-brand bg-brand/5 font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border text-xs transition-all duration-200 focus:outline-none flex justify-between items-center",
                        optionStyles
                      )}
                    >
                      <span>{option}</span>
                      {hasSubmitted && isCorrectAnswer && (
                        <span className="text-emerald-500 font-mono text-[10px] font-bold">✔ Correct</span>
                      )}
                      {hasSubmitted && isSelected && !isCorrectAnswer && (
                        <span className="text-red-500 font-mono text-[10px] font-bold">✘ Incorrect</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {hasSubmitted && (
                <div className="p-3 rounded-lg bg-overlay-subtle border border-borderSubtle/50 text-[11px] text-textSecondary leading-normal animate-in">
                  {selectedOption === SANDBOX_QUESTIONS[currentQuestionIdx].correctAnswer ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-bold">✗ </span>
                  )}
                  {SANDBOX_QUESTIONS[currentQuestionIdx].explanation}
                </div>
              )}

              <div className="flex gap-2 items-center justify-between pt-3 border-t border-borderSubtle">
                <div className="flex items-center gap-1.5">
                  <div className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Your Focus Index:</div>
                  <div className={cn(
                    "text-sm font-black transition-all duration-300",
                    isCorrect === true ? "text-emerald-500 animate-bounce" : isCorrect === false ? "text-red-400" : "text-brand"
                  )}>
                    +{focusIndex.toFixed(2)}%
                  </div>
                </div>

                {!hasSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand text-brandForeground hover:bg-brandHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border border-brand text-brand hover:bg-brand/5 transition"
                  >
                    {currentQuestionIdx < SANDBOX_QUESTIONS.length - 1 ? "Next Question" : "Try Again"}
                  </button>
                )}
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

      {/* Explore Our Curriculum Section */}
      <section className="border-t border-borderSubtle py-16 md:py-24 z-10 relative bg-elevated/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 mb-12 animate-in">
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-textPrimary">
              Explore Our Curriculum
            </h2>
            <p className="text-textSecondary text-sm max-w-2xl mx-auto">
              Browse interactive playbooks designed to take you from a complete beginner to market proficiency.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200",
                    selectedCategory === cat
                      ? "bg-brand text-brandForeground border-brand shadow-card"
                      : "bg-surface text-textSecondary border-borderSubtle hover:border-brand/40 hover:text-textPrimary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {filteredCourses.map((course) => {
              const isExpanded = expandedCourseId === course.id;
              return (
                <div
                  key={course.id}
                  className="bg-surface/80 border border-borderSubtle rounded-xl overflow-hidden shadow-card transition-all duration-300 hover:border-brand/30"
                >
                  {/* Course Header Bar */}
                  <button
                    type="button"
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="w-full text-left p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-overlay-faint transition duration-150"
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-brand/10 border border-brand/20 font-bold text-brand uppercase tracking-wider">
                          {course.category}
                        </span>
                        <span className="text-[10px] text-textMuted bg-overlay-subtle px-2 py-0.5 rounded font-medium">
                          {course.level}
                        </span>
                        <span className="text-[10px] text-textMuted bg-overlay-subtle px-2 py-0.5 rounded font-medium">
                          {course.duration}
                        </span>
                      </div>
                      <h3 className="font-headline text-xl font-bold text-textPrimary">
                        {course.title}
                      </h3>
                      <p className="text-textSecondary text-xs leading-relaxed max-w-2xl">
                        {course.blurb}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <span className="text-xs text-brand font-semibold hidden md:inline">
                        {isExpanded ? "Hide Curriculum" : "View Curriculum"}
                      </span>
                      <div className="p-2 rounded-lg bg-overlay-subtle border border-borderSubtle text-textSecondary">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Modules Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-borderSubtle bg-overlay-faint/30 p-6 space-y-4 animate-in">
                      <div className="text-[11px] font-bold text-textMuted uppercase tracking-wider mb-2">
                        Playbook Modules ({course.modules.length})
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {course.modules.map((mod, modIdx) => (
                          <div
                            key={mod.id}
                            className="p-4 bg-surface/90 border border-borderSubtle/60 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-brand/20 transition-all duration-200"
                          >
                            <div className="space-y-1">
                              <div className="text-[10px] text-brand font-mono font-bold">
                                MODULE {modIdx + 1}
                              </div>
                              <h4 className="text-sm font-bold text-textPrimary">
                                {mod.title}
                              </h4>
                              <p className="text-xs text-textSecondary leading-normal">
                                {mod.summary}
                              </p>
                            </div>
                            <span className="text-[10px] text-textMuted font-medium px-2 py-1 rounded bg-overlay-subtle self-start border border-borderSubtle/40 whitespace-nowrap">
                              {mod.lessons.length} {mod.lessons.length === 1 ? "lesson" : "lessons"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Link
                          href={ROUTES.STUDENT.LOGIN}
                          className="inline-flex items-center gap-2 bg-brand text-brandForeground font-bold text-xs px-4 py-2 rounded-lg hover:bg-brandHover active:scale-95 transition-all shadow-card"
                        >
                          Enroll in Course
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-borderSubtle py-6 text-center text-xs text-textMuted z-10 relative">
        Educational content only - not investment advice. Always do your own due diligence.
      </footer>
    </div>
  );
}

