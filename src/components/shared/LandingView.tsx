"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Shield,
  Cpu,
  Activity,
  ArrowRight,
  Check,
  Flame,
  Sparkles,
  Clock,
  RotateCcw,
  Trophy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  PlayCircle,
  FileText
} from "lucide-react";
import { AlvestLogo } from "@/components/brand";
import { ROUTES } from "@/constants/routes";

// Define mock interactive quiz questions representing the course topics
const QUIZ_QUESTIONS = [
  {
    category: "Technical Analysis",
    question: "Which chart pattern typically indicates a bullish trend reversal?",
    options: [
      "Head and Shoulders",
      "Double Bottom",
      "Bearish Engulfing",
      "Rising Wedge"
    ],
    correctIndex: 1,
    explanation: "Spot on! A Double Bottom pattern indicates that sellers tried to push the price down twice, failed, and buyers are now driving a bullish reversal."
  },
  {
    category: "Risk Management",
    question: "What is the primary benefit of a Stop-loss order?",
    options: [
      "It guarantees execution at a specific high price",
      "It limits potential losses by exiting automatically",
      "It allows you to trade with borrowed funds",
      "It makes trades execute faster on the exchange"
    ],
    correctIndex: 1,
    explanation: "Exactly! A Stop-loss order automatically triggers a market order once a target price is breached, preventing further downside."
  },
  {
    category: "Forex Basics",
    question: "In the EUR/USD currency pair, which is the base currency?",
    options: [
      "EUR",
      "USD",
      "Both (equally weighted)",
      "Neither (synthetically priced)"
    ],
    correctIndex: 0,
    explanation: "Correct! The first currency in a forex ticker is always the base currency. In EUR/USD, you are pricing the Euro in US Dollars."
  }
];

// Define structured course details for explorer tabs
const COURSES = [
  {
    id: "indian-stocks",
    title: "Indian Stocks & Mutual Funds",
    category: "Indian Stocks",
    level: "Beginner to Pro",
    duration: "8 weeks",
    blurb: "Master NSE/BSE market structure, technical indicators, and portfolio allocation.",
    modules: [
      {
        title: "Financial Markets Foundation",
        lessons: [
          { title: "Welcome to Indian equities", type: "article", duration: "10 mins" },
          { title: "NSE vs BSE & Market Structure", type: "article", duration: "15 mins" },
          { title: "Index Basics: NIFTY, SENSEX", type: "article", duration: "12 mins" },
          { title: "Order Types: Market, Limit, Stop-loss", type: "article", duration: "18 mins" }
        ]
      },
      {
        title: "Technical Analysis Strategist",
        lessons: [
          { title: "Candlestick Patterns & Price Action", type: "video", duration: "15 mins" },
          { title: "Support, Resistance & Trendlines", type: "video", duration: "20 mins" },
          { title: "Moving Averages & RSI Indicators", type: "video", duration: "25 mins" }
        ]
      }
    ],
    skills: ["NSE/BSE Execution", "Technical Indicators", "Risk Hedging"]
  },
  {
    id: "forex",
    title: "Forex Master Track",
    category: "Forex",
    level: "Intermediate",
    duration: "6 weeks",
    blurb: "Understand global currency pairs, major sessions, spread dynamics, and leverage.",
    modules: [
      {
        title: "Forex Fundamentals",
        lessons: [
          { title: "What is the Forex Market?", type: "video", duration: "8 mins" },
          { title: "Major Participants & Market Drivers", type: "video", duration: "12 mins" },
          { title: "Understanding Pips & Spread", type: "video", duration: "14 mins" }
        ]
      },
      {
        title: "Currency Pair Strategy",
        lessons: [
          { title: "Trading Major Currency Pairs", type: "video", duration: "16 mins" },
          { title: "Session Liquidity & Volatility", type: "video", duration: "18 mins" },
          { title: "Position Sizing & Leverage", type: "article", duration: "22 mins" }
        ]
      }
    ],
    skills: ["Pip Calculations", "Spread Arbitrage", "Leverage Management"]
  },
  {
    id: "fno",
    title: "F&O Strategy Program",
    category: "F&O",
    level: "Advanced",
    duration: "10 weeks",
    blurb: "Dive deep into options greeks, futures margin, rollover, and hedging strategies.",
    modules: [
      {
        title: "Options Foundations",
        lessons: [
          { title: "Call & Put Premium Drivers", type: "article", duration: "15 mins" },
          { title: "Moneyness & Intrinsic Value", type: "article", duration: "20 mins" },
          { title: "Introduction to Options Greeks", type: "video", duration: "25 mins" }
        ]
      },
      {
        title: "Hedging & Advanced Playbook",
        lessons: [
          { title: "Futures Rollover & Arbitrage", type: "video", duration: "18 mins" },
          { title: "Spreads: Bull Call & Bear Put", type: "video", duration: "24 mins" },
          { title: "Risk Adjustments during Drawdown", type: "article", duration: "30 mins" }
        ]
      }
    ],
    skills: ["Options Greeks", "Spread Hedging", "Futures Rollovers"]
  }
];

export function LandingView() {
  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [targetFocusIndex, setTargetFocusIndex] = useState(24.85);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(24.85);
  const [shakeQuiz, setShakeQuiz] = useState(false);

  // Course Explorer State
  const [activeCourseId, setActiveCourseId] = useState("indian-stocks");
  const [expandedModuleIdx, setExpandedModuleIdx] = useState<number | null>(0);

  // Study Planner State
  const [studyMins, setStudyMins] = useState(15);

  // Static Feature Cards Content
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

  // Smooth Count-Up Effect for Focus Index
  useEffect(() => {
    if (Math.abs(currentFocusIndex - targetFocusIndex) > 0.01) {
      const step = (targetFocusIndex - currentFocusIndex) * 0.15;
      const timer = setTimeout(() => {
        setCurrentFocusIndex(prev => {
          const next = prev + step;
          return Math.abs(next - targetFocusIndex) < 0.01 ? targetFocusIndex : next;
        });
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [targetFocusIndex, currentFocusIndex]);

  // Quiz Handling
  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const question = QUIZ_QUESTIONS[currentQuestion];
    if (optionIdx === question.correctIndex) {
      setStreak(prev => prev + 1);
      // Increment focus index with a bonus for streaks
      setTargetFocusIndex(prev => prev + 4.5 + (streak * 0.5));
    } else {
      setStreak(0);
      setShakeQuiz(true);
      setTimeout(() => setShakeQuiz(false), 500);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQuestion(prev => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setStreak(0);
    setTargetFocusIndex(24.85);
    setCurrentFocusIndex(24.85);
    setCurrentQuestion(0);
  };

  // Study Goal Simulator Metrics
  const simulatedFocusGrowth = Math.round(studyMins * 1.35 + 8);
  const selectedCourse = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  const estCompletionWeeks = Math.max(2, Math.round(12 - (studyMins / 8)));

  return (
    <div className="min-h-screen bg-appBase text-textPrimary relative overflow-hidden flex flex-col justify-between selection:bg-brand/20 selection:text-brand">
      {/* Background Grids & Blobs */}
      <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-surface/90 backdrop-blur-md border-b border-borderSubtle z-50">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlvestLogo variant="markClear" size={40} priority className="drop-shadow-sm" />
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
              className="bg-brand text-brandForeground font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brandHover hover:shadow-lg active:scale-95 transition-all"
            >
              Start learning
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] text-brand tracking-widest uppercase">
            <Activity className="h-3 w-3 animate-pulse" />
            Interactive Learning Platform
          </div>

          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-textPrimary">
            A calmer way to <br />
            learn, practice, and <span className="text-brand relative inline-block">grow</span>
          </h1>

          <p className="text-textSecondary text-base md:text-lg max-w-xl leading-relaxed">
            Build real skills with a clean, risk-free learning experience designed for focus, clarity, and steady trading progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="flex items-center justify-center gap-2 bg-brand text-brandForeground font-semibold text-sm px-6 py-3.5 rounded-lg hover:bg-brandHover hover:shadow-lg active:scale-95 transition-all shadow-card"
            >
              Enter the classroom
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => document.getElementById("course-explorer")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center border border-borderSubtle hover:border-brand/40 text-textPrimary font-semibold text-sm px-6 py-3.5 rounded-lg hover:bg-overlay-hover transition-all"
            >
              Explore courses
            </button>
          </div>
        </div>

        {/* Column 5: Interactive Quiz Sandbox (Replacing old static Snapshot) */}
        <div className="lg:col-span-5 relative">
          <div className={`glass-panel-stitch p-6 rounded-xl border border-borderSubtle relative z-10 space-y-4 transition-all duration-300 ${shakeQuiz ? "animate-bounce" : ""}`}>
            <div className="flex justify-between items-center border-b border-borderSubtle pb-3">
              <span className="text-[10px] text-textSecondary uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Shield className="h-3.5 w-3.5 text-brand" />
                Interactive Sandbox
              </span>
              <div className="flex gap-1.5 items-center">
                {streak > 0 && (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Flame className="h-3.5 w-3.5 fill-amber-500" />
                    {streak} Streak
                  </span>
                )}
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold text-brand uppercase bg-brand-subtle px-2 py-0.5 rounded tracking-wider">
                  {QUIZ_QUESTIONS[currentQuestion].category}
                </span>
                <h4 className="text-sm font-bold text-textPrimary mt-1.5">
                  {QUIZ_QUESTIONS[currentQuestion].question}
                </h4>
              </div>

              {/* Options Grid */}
              <div className="space-y-2">
                {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === QUIZ_QUESTIONS[currentQuestion].correctIndex;
                  
                  let optionStyle = "border-borderSubtle hover:border-brand/40 text-textSecondary hover:text-textPrimary bg-surface";
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold";
                    } else if (isSelected) {
                      optionStyle = "border-rose-500 bg-rose-500/10 text-rose-700 font-semibold";
                    } else {
                      optionStyle = "border-borderSubtle/50 text-textMuted opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left text-xs p-3 rounded-lg border transition-all active:scale-[0.99] flex items-center justify-between ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanatory / Progress State */}
              {isAnswered && (
                <div className="p-3.5 bg-overlay-subtle border border-borderSubtle rounded-lg text-xs space-y-3 animate-in">
                  <p className="text-textSecondary leading-relaxed">
                    {QUIZ_QUESTIONS[currentQuestion].explanation}
                  </p>
                  <div className="flex gap-2 justify-end">
                    {streak === 0 && (
                      <button
                        onClick={handleResetQuiz}
                        className="text-[10px] uppercase font-bold text-textMuted hover:text-textPrimary flex items-center gap-1 transition"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    )}
                    <button
                      onClick={handleNextQuestion}
                      className="bg-brand text-brandForeground font-semibold text-[10px] px-3.5 py-1.5 rounded hover:bg-brandHover transition flex items-center gap-1 shadow-sm uppercase tracking-wider"
                    >
                      Next Topic
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Focus Index Display with Animated Countup */}
              <div className="p-4 bg-overlay-subtle border border-borderSubtle rounded-xl font-bold text-center text-textPrimary space-y-1 relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="text-[10px] text-textMuted uppercase tracking-wider flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-brand" />
                  Your Focus index
                </div>
                <div className="text-2xl text-brand font-black transition-all">
                  +{currentFocusIndex.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-purple-500 rounded-xl blur opacity-15" />
        </div>
      </main>

      {/* NEW: Interactive Course Curriculum Explorer */}
      <section id="course-explorer" className="w-full bg-surface/40 border-t border-borderSubtle py-20 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-textPrimary">
              Explore Our Curriculum
            </h2>
            <p className="text-textSecondary text-sm mt-2">
              Browse interactive playbooks designed to take you from a complete beginner to market proficiency.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center border-b border-borderSubtle mb-8 max-w-lg mx-auto">
            {COURSES.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setActiveCourseId(course.id);
                  setExpandedModuleIdx(0); // Reset accordion to first module
                }}
                className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all relative ${
                  activeCourseId === course.id
                    ? "text-brand"
                    : "text-textMuted hover:text-textPrimary"
                }`}
              >
                {course.category}
                {activeCourseId === course.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Explorer Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left panel: Course Highlights */}
            <div className="lg:col-span-5 p-6 bg-surface border border-borderSubtle rounded-xl shadow-card space-y-5">
              <div>
                <span className="text-[10px] font-bold text-brand bg-brand-subtle px-2.5 py-1 rounded">
                  {selectedCourse.level}
                </span>
                <h3 className="font-headline text-xl font-bold text-textPrimary mt-3">
                  {selectedCourse.title}
                </h3>
                <p className="text-textSecondary text-xs mt-2 leading-relaxed">
                  {selectedCourse.blurb}
                </p>
              </div>

              <div className="flex gap-4 border-y border-borderSubtle py-3 text-xs text-textSecondary">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand" />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-brand" />
                  <span>{selectedCourse.modules.length} Modules</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-textPrimary mb-3 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  Key Skills Unlocked
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skills.map((skill, i) => (
                    <span key={i} className="text-[10px] bg-overlay-subtle border border-borderSubtle px-2.5 py-1 rounded text-textSecondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={ROUTES.STUDENT.LOGIN}
                className="w-full flex items-center justify-center gap-2 bg-brand text-brandForeground font-semibold text-xs py-3 rounded-lg hover:bg-brandHover active:scale-[0.98] transition-all shadow-sm"
              >
                Enroll & Begin Lesson
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Right panel: Module Accordion */}
            <div className="lg:col-span-7 space-y-3">
              {selectedCourse.modules.map((mod, modIdx) => {
                const isExpanded = expandedModuleIdx === modIdx;
                return (
                  <div
                    key={modIdx}
                    className="border border-borderSubtle rounded-xl bg-surface overflow-hidden transition-all duration-300"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => setExpandedModuleIdx(isExpanded ? null : modIdx)}
                      className="w-full p-4 flex justify-between items-center text-left hover:bg-overlay-hover transition-colors"
                    >
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-textMuted font-bold">
                          Module {modIdx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-textPrimary mt-0.5">{mod.title}</h4>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-textMuted" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-textMuted" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Body */}
                    {isExpanded && (
                      <div className="border-t border-borderSubtle bg-overlay-faint p-4 space-y-2 animate-in">
                        {mod.lessons.map((lesson, lessonIdx) => (
                          <div
                            key={lessonIdx}
                            className="flex justify-between items-center p-2.5 hover:bg-surface border border-transparent hover:border-borderSubtle rounded-lg transition text-xs text-textSecondary group"
                          >
                            <div className="flex items-center gap-2.5">
                              {lesson.type === "video" ? (
                                <PlayCircle className="h-4 w-4 text-brand flex-shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-brand flex-shrink-0" />
                              )}
                              <span className="group-hover:text-textPrimary transition font-medium">
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-textMuted">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Interactive Focus Study Simulator */}
      <section className="w-full bg-overlay-subtle border-t border-borderSubtle py-20 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] text-brand tracking-widest uppercase font-bold">
              <Trophy className="h-3 w-3" />
              Focus Goal Simulator
            </span>

            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-textPrimary leading-tight">
              Design a routine that fits your lifestyle
            </h2>

            <p className="text-textSecondary text-sm max-w-xl">
              Use our interactive planner to see how spending just a few minutes a day studying stock, options, or forex basics accelerates your Focus Index and cuts down total completion time.
            </p>

            {/* Slider Widget */}
            <div className="bg-surface border border-borderSubtle rounded-xl p-6 shadow-sm space-y-4 max-w-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-textPrimary uppercase tracking-wider">Daily Study Time</span>
                <span className="font-bold text-brand bg-brand-subtle px-2.5 py-0.5 rounded">
                  {studyMins} Minutes / day
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={studyMins}
                onChange={(e) => setStudyMins(Number(e.target.value))}
                className="w-full h-1.5 bg-borderSubtle rounded-lg appearance-none cursor-pointer accent-brand"
              />

              <div className="flex justify-between text-[10px] text-textMuted uppercase tracking-wider font-bold">
                <span>5m (Quick Read)</span>
                <span>30m (Target Session)</span>
                <span>60m (Deep Dive)</span>
              </div>
            </div>
          </div>

          {/* Simulated Outputs Dashboard */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-5 bg-surface border border-borderSubtle rounded-xl text-center space-y-1 shadow-sm hover:border-brand/40 transition">
              <div className="text-[10px] text-textMuted uppercase tracking-wider font-bold">
                Weekly Focus Growth
              </div>
              <div className="text-3xl text-brand font-black">
                +{simulatedFocusGrowth}%
              </div>
              <div className="text-[10px] text-textSecondary font-medium">
                predicted improvement
              </div>
            </div>

            <div className="p-5 bg-surface border border-borderSubtle rounded-xl text-center space-y-1 shadow-sm hover:border-brand/40 transition">
              <div className="text-[10px] text-textMuted uppercase tracking-wider font-bold">
                Est. Completion
              </div>
              <div className="text-3xl text-brand font-black">
                {estCompletionWeeks} Weeks
              </div>
              <div className="text-[10px] text-textSecondary font-medium">
                per chosen track
              </div>
            </div>

            <div className="p-5 bg-surface border border-borderSubtle rounded-xl text-center space-y-1 shadow-sm hover:border-brand/40 transition">
              <div className="text-[10px] text-textMuted uppercase tracking-wider font-bold">
                Learner Profile
              </div>
              <div className="text-lg text-textPrimary font-black pt-1">
                {studyMins <= 15 ? "Consistency Builder" : studyMins <= 45 ? "Skill Accelerator" : "Hyper-Focus Mode"}
              </div>
              <div className="text-[10px] text-textSecondary font-medium pt-1">
                {studyMins <= 15 ? "🔥 3-day habits" : studyMins <= 45 ? "🔥 5-day habits" : "🔥 7-day habits"}
              </div>
            </div>

            <div className="p-5 bg-surface border border-borderSubtle rounded-xl text-center space-y-1 shadow-sm hover:border-brand/40 transition flex flex-col justify-center items-center">
              <Link
                href={ROUTES.STUDENT.LOGIN}
                className="w-full flex items-center justify-center gap-1.5 bg-brand text-brandForeground font-bold text-xs py-3 rounded-lg hover:bg-brandHover transition-all shadow-sm active:scale-95"
              >
                Let's Do It
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="bg-surface/70 border-t border-borderSubtle py-16 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item) => (
              <div
                key={item.title}
                className="p-6 bg-surface/80 border border-borderSubtle rounded-xl space-y-3 group hover:border-brand/60 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-card"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-brand/5 border border-brand/20 rounded text-brand group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-textMuted bg-overlay-subtle px-2 py-0.5 rounded font-semibold">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-textPrimary group-hover:text-brand transition-colors">
                  {item.title}
                </h3>
                <p className="text-textSecondary text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-borderSubtle py-6 text-center text-xs text-textMuted z-10 relative bg-surface/50">
        Educational content only - not investment advice. Always do your own due diligence.
      </footer>
    </div>
  );
}
