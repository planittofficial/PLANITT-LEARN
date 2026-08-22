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
    explanation: "Correct! A Double Bottom pattern shows that buyers are driving a bullish reversal after supporting the asset twice."
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
    explanation: "Correct! A Stop-loss order automatically triggers an exit once a target price is breached, preventing further downside."
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
    explanation: "Correct! The first currency in a forex ticker is the base currency. In EUR/USD, you are pricing the Euro in US Dollars."
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
    modules: [
      {
        title: "Financial Markets Foundation",
        lessons: [
          { title: "Welcome to Indian equities", type: "article", duration: "10m" },
          { title: "NSE vs BSE & Market Structure", type: "article", duration: "15m" },
          { title: "Index Basics: NIFTY, SENSEX", type: "article", duration: "12m" },
          { title: "Order Types: Market, Limit, Stop-loss", type: "article", duration: "18m" }
        ]
      },
      {
        title: "Technical Analysis Strategist",
        lessons: [
          { title: "Candlestick Patterns & Price Action", type: "video", duration: "15m" },
          { title: "Support, Resistance & Trendlines", type: "video", duration: "20m" },
          { title: "Moving Averages & RSI Indicators", type: "video", duration: "25m" }
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
    modules: [
      {
        title: "Forex Fundamentals",
        lessons: [
          { title: "What is the Forex Market?", type: "video", duration: "8m" },
          { title: "Major Participants & Market Drivers", type: "video", duration: "12m" },
          { title: "Understanding Pips & Spread", type: "video", duration: "14m" }
        ]
      },
      {
        title: "Currency Pair Strategy",
        lessons: [
          { title: "Trading Major Currency Pairs", type: "video", duration: "16m" },
          { title: "Session Liquidity & Volatility", type: "video", duration: "18m" },
          { title: "Position Sizing & Leverage", type: "article", duration: "22m" }
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
    modules: [
      {
        title: "Options Foundations",
        lessons: [
          { title: "Call & Put Premium Drivers", type: "article", duration: "15m" },
          { title: "Moneyness & Intrinsic Value", type: "article", duration: "20m" },
          { title: "Introduction to Options Greeks", type: "video", duration: "25m" }
        ]
      },
      {
        title: "Hedging & Advanced Playbook",
        lessons: [
          { title: "Futures Rollover & Arbitrage", type: "video", duration: "18m" },
          { title: "Spreads: Bull Call & Bear Put", type: "video", duration: "24m" },
          { title: "Risk Adjustments during Drawdown", type: "article", duration: "30m" }
        ]
      }
    ],
    skills: ["Options Greeks", "Spread Hedging", "Futures Rollovers"]
  }
];

// Sub-component: Animated high-tech Candlestick trading chart
function AnimatedTradingChart() {
  return (
    <div className="w-full h-36 flex items-end justify-between gap-1 p-3 bg-black/45 rounded-xl border border-brand/20 relative overflow-hidden group shadow-[inset_0_0_12px_rgba(20,184,166,0.05)]">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
        <div className="w-full h-px bg-brand" />
        <div className="w-full h-px bg-brand" />
        <div className="w-full h-px bg-brand" />
      </div>

      {/* Target execution line */}
      <div className="absolute top-[40%] left-0 w-full border-t border-dashed border-brand/30 z-0 flex justify-between items-center px-3 animate-pulse">
        <span className="text-[8px] text-brand/70 font-mono tracking-widest uppercase">Target execution trigger</span>
        <span className="text-[8px] text-brand/70 font-mono font-bold">+18.52%</span>
      </div>
      
      {/* Candlestick Bars */}
      {[
        { h: "h-10", w: "h-5", type: "bull", animation: "animate-[grow-up_0.8s_ease-out_forwards]" },
        { h: "h-14", w: "h-7", type: "bull", animation: "animate-[grow-up_1s_ease-out_forwards]" },
        { h: "h-12", w: "h-4", type: "bear", animation: "animate-[grow-up_1.2s_ease-out_forwards]" },
        { h: "h-20", w: "h-9", type: "bull", animation: "animate-[grow-up_1.4s_ease-out_forwards]" },
        { h: "h-24", w: "h-12", type: "bull", animation: "animate-[grow-up_1.6s_ease-out_forwards]" },
        { h: "h-18", w: "h-6", type: "bear", animation: "animate-[grow-up_1.8s_ease-out_forwards]" },
        { h: "h-28", w: "h-14", type: "bull", animation: "animate-[grow-up_2s_ease-out_forwards]" },
      ].map((bar, i) => (
        <div key={i} className="flex flex-col items-center flex-grow z-10 select-none">
          {/* Upper wick */}
          <div className={`w-0.5 ${bar.w} bg-brand/35`} />
          {/* Real body */}
          <div className={`w-full ${bar.h} rounded-sm transition-all duration-500 hover:scale-x-110 cursor-pointer ${
            bar.type === "bull" 
              ? "bg-brand/80 shadow-[0_0_10px_rgba(20,184,166,0.35)]" 
              : "bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
          }`} />
          {/* Lower wick */}
          <div className="w-0.5 h-4 bg-brand/35" />
        </div>
      ))}
    </div>
  );
}

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

  // Static Feature Cards Content - Minimal copy
  const features = [
    {
      icon: BookOpen,
      title: "Guided Lessons",
      desc: "Structured paths designed for step-by-step clarity.",
      badge: "PATH",
    },
    {
      icon: Shield,
      title: "Safe Practice",
      desc: "Risk-free practice arena without market pressure.",
      badge: "PRACTICE",
    },
    {
      icon: Cpu,
      title: "Smart Progress",
      desc: "Milestones, learning streaks, and habits.",
      badge: "HABIT",
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
      setTargetFocusIndex(prev => prev + 5.15 + (streak * 0.5));
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
  const simulatedFocusGrowth = Math.round(studyMins * 1.45 + 5);
  const selectedCourse = COURSES.find(c => c.id === activeCourseId) || COURSES[0];
  
  // Dynamic Circular Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (simulatedFocusGrowth / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#030706] text-[#E2E8F0] relative overflow-hidden flex flex-col justify-between selection:bg-brand/20 selection:text-brand dark">
      {/* Custom Styles Injection */}
      <style>{`
        @keyframes sweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulse-radial {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        .animate-sweep {
          animation: sweep 8s linear infinite;
        }
        .animate-pulse-radial {
          animation: pulse-radial 10s ease-in-out infinite;
        }
      `}</style>

      {/* Cyber Grid Scanning overlay */}
      <div className="absolute inset-0 radar-grid opacity-[0.08] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
      
      {/* Glowing Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-brand/10 rounded-full blur-[130px] pointer-events-none animate-pulse-radial" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse-radial" />

      {/* Header */}
      <header className="w-full bg-[#030706]/75 backdrop-blur-md border-b border-brand/10 z-50 sticky top-0">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <AlvestLogo variant="markClear" size={36} priority className="drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
            <span className="font-headline text-[18px] font-black text-brand tracking-tight">
              Alvest Learn
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="text-[#94A3B8] hover:text-brand text-xs uppercase tracking-widest transition-colors"
            >
              Login
            </Link>
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="bg-brand text-[#030706] font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-brandBright hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95 transition-all"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10 relative">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[9px] font-mono text-brand tracking-widest uppercase">
            <Activity className="h-3 w-3 animate-pulse" />
            Active Practice Sandbox
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
            Learn. <br />
            Practice. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.1)]">Grow.</span>
          </h1>

          <p className="text-[#94A3B8] text-base font-medium tracking-wide">
            Focus. Clarity. Progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="flex items-center justify-center gap-2 bg-brand text-[#030706] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-brandBright hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] active:scale-95 transition-all"
            >
              Enter Classroom
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center border border-brand/20 hover:border-brand/50 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-lg hover:bg-brand/5 transition-all"
            >
              Curriculum
            </button>
          </div>
        </div>

        {/* Hero Interactive Terminal Widget */}
        <div className="lg:col-span-5 relative">
          <div className={`glass-panel-stitch bg-[#050D0B]/85 p-6 rounded-2xl border border-brand/20 relative z-10 space-y-6 transition-all duration-300 shadow-[0_0_30px_rgba(3,7,6,0.8)] ${
            shakeQuiz ? "animate-bounce border-rose-500/50" : ""
          }`}>
            {/* Header controls */}
            <div className="flex justify-between items-center border-b border-brand/10 pb-4">
              <span className="text-[10px] font-mono text-brand uppercase tracking-widest flex items-center gap-2 font-bold">
                <Shield className="h-4 w-4 text-brand animate-pulse" />
                Console_
              </span>
              <div className="flex gap-2 items-center">
                {streak > 0 && (
                  <span className="text-[10px] font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Flame className="h-3.5 w-3.5 fill-[#F59E0B]" />
                    {streak} STREAK
                  </span>
                )}
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 animate-ping absolute" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 relative" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand/80" />
              </div>
            </div>

            {/* Embedded Live Chart */}
            <AnimatedTradingChart />

            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[9px] font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  {QUIZ_QUESTIONS[currentQuestion].category}
                </span>
                <h4 className="text-sm font-bold text-white mt-2 font-headline leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuestion].question}
                </h4>
              </div>

              {/* Options Grid */}
              <div className="space-y-2">
                {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === QUIZ_QUESTIONS[currentQuestion].correctIndex;
                  
                  let optionStyle = "border-brand/10 hover:border-brand/40 text-[#94A3B8] hover:text-white bg-[#030706]/40 hover:bg-brand/5";
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                    } else if (isSelected) {
                      optionStyle = "border-rose-500/60 bg-rose-500/10 text-rose-300 font-semibold shadow-[0_0_15px_rgba(244,63,94,0.15)]";
                    } else {
                      optionStyle = "border-brand/5 text-slate-500 opacity-40";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left text-xs p-3 rounded-xl border transition-all active:scale-[0.98] flex items-center justify-between font-mono ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrect && <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and next prompt */}
              {isAnswered && (
                <div className="p-4 bg-brand/5 border border-brand/10 rounded-xl text-xs space-y-4 animate-in">
                  <p className="text-[#94A3B8] leading-relaxed font-mono">
                    {QUIZ_QUESTIONS[currentQuestion].explanation}
                  </p>
                  <div className="flex gap-3 justify-end">
                    {streak === 0 && (
                      <button
                        onClick={handleResetQuiz}
                        className="text-[10px] font-mono uppercase font-bold text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    )}
                    <button
                      onClick={handleNextQuestion}
                      className="bg-brand text-[#030706] font-bold text-[10px] px-4 py-2 rounded-lg hover:bg-brandBright hover:shadow-[0_0_12px_rgba(20,184,166,0.3)] transition-all flex items-center gap-1.5 uppercase tracking-widest"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Focus Index Panel */}
              <div className="p-4 bg-[#030706]/60 border border-brand/15 rounded-xl font-bold text-center space-y-1 relative overflow-hidden group">
                <div className="text-[10px] text-brand uppercase tracking-widest font-mono flex items-center justify-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Focus Index
                </div>
                <div className="text-3xl text-white font-black tracking-tight drop-shadow-[0_0_10px_rgba(20,184,166,0.15)]">
                  +{currentFocusIndex.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          {/* Neon outer ambient glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-indigo-500 rounded-2xl blur opacity-20 pointer-events-none" />
        </div>
      </main>

      {/* Curriculum Explorer */}
      <section id="curriculum" className="w-full bg-[#030706]/35 border-t border-brand/10 py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Curriculum Explorer
            </h2>
            <div className="h-0.5 w-12 bg-brand mx-auto rounded" />
          </div>

          {/* Glowing Tab list */}
          <div className="flex justify-center border-b border-brand/10 mb-12 max-w-lg mx-auto">
            {COURSES.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setActiveCourseId(course.id);
                  setExpandedModuleIdx(0);
                }}
                className={`px-6 py-4 text-xs font-mono uppercase tracking-widest font-bold transition-all relative ${
                  activeCourseId === course.id
                    ? "text-brand"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                {course.category}
                {activeCourseId === course.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand rounded-t shadow-[0_-3px_8px_rgba(20,184,166,0.6)]" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Highlights Console */}
            <div className="lg:col-span-5 p-6 bg-[#050D0B]/70 border border-brand/15 rounded-2xl shadow-[0_0_20px_rgba(3,7,6,0.6)] space-y-6">
              <div>
                <span className="text-[9px] font-mono font-bold text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded">
                  {selectedCourse.level}
                </span>
                <h3 className="font-headline text-2xl font-black text-white mt-4">
                  {selectedCourse.title}
                </h3>
              </div>

              <div className="flex gap-5 border-y border-brand/10 py-4 text-xs text-[#94A3B8] font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand" />
                  <span>{selectedCourse.modules.length} Modules</span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase text-brand tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Skills_
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skills.map((skill, i) => (
                    <span key={i} className="text-[9px] font-mono bg-[#030706]/40 border border-brand/10 px-3 py-1 rounded text-[#94A3B8]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={ROUTES.STUDENT.LOGIN}
                className="w-full flex items-center justify-center gap-2 bg-brand text-[#030706] font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-brandBright hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-[0.98] transition-all"
              >
                Enroll & Launch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Accordion Panels */}
            <div className="lg:col-span-7 space-y-4">
              {selectedCourse.modules.map((mod, modIdx) => {
                const isExpanded = expandedModuleIdx === modIdx;
                return (
                  <div
                    key={modIdx}
                    className="border border-brand/10 rounded-2xl bg-[#050D0B]/40 overflow-hidden transition-all duration-300 hover:border-brand/30"
                  >
                    <button
                      onClick={() => setExpandedModuleIdx(isExpanded ? null : modIdx)}
                      className="w-full p-5 flex justify-between items-center text-left hover:bg-brand/5 transition-all"
                    >
                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold">
                          MODULE_0{modIdx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1 font-headline">{mod.title}</h4>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-brand" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-brand" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-brand/10 bg-[#030706]/30 p-5 space-y-3 animate-in">
                        {mod.lessons.map((lesson, lessonIdx) => (
                          <div
                            key={lessonIdx}
                            className="flex justify-between items-center p-3 hover:bg-[#050D0B]/60 border border-brand/5 hover:border-brand/20 rounded-xl transition-all text-xs text-[#94A3B8] group"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === "video" ? (
                                <PlayCircle className="h-4 w-4 text-brand flex-shrink-0 group-hover:scale-115 transition-transform" />
                              ) : (
                                <FileText className="h-4 w-4 text-brand flex-shrink-0 group-hover:scale-115 transition-transform" />
                              )}
                              <span className="group-hover:text-white transition-colors font-mono">
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-brand bg-brand/5 border border-brand/10 px-2 py-0.5 rounded">
                              {lesson.duration}
                            </span>
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

      {/* Simulator Section */}
      <section className="w-full bg-[#050D0B]/10 border-t border-brand/10 py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[9px] font-mono text-brand tracking-widest uppercase font-bold">
              <Trophy className="h-3 w-3" />
              Focus Planner
            </span>

            <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Design your routine
            </h2>

            {/* Slider Widget */}
            <div className="bg-[#050D0B]/70 border border-brand/15 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-[#94A3B8] uppercase tracking-widest">Goal_</span>
                <span className="font-bold text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded">
                  {studyMins} MINS/DAY
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={studyMins}
                onChange={(e) => setStudyMins(Number(e.target.value))}
                className="w-full h-1 bg-brand/10 border border-brand/20 rounded-lg appearance-none cursor-pointer accent-brand"
              />

              <div className="flex justify-between text-[8px] text-slate-500 font-mono tracking-widest uppercase">
                <span>Quick Read</span>
                <span>Target</span>
                <span>Deep Session</span>
              </div>
            </div>
          </div>

          {/* Dynamic Circular SVG Progress gauge */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-center justify-center gap-8 bg-[#050D0B]/40 border border-brand/10 rounded-3xl p-8 shadow-2xl">
            {/* SVG Circular Progress Gauge */}
            <div className="relative flex items-center justify-center select-none">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-[#030706]"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-brand transition-all duration-300"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(20,184,166,0.4))" }}
                />
              </svg>
              {/* Inner Text overlay */}
              <div className="absolute text-center">
                <div className="text-2xl font-black text-white font-mono">
                  +{simulatedFocusGrowth}%
                </div>
                <div className="text-[8px] text-brand font-mono font-bold uppercase tracking-widest">
                  Focus Growth
                </div>
              </div>
            </div>

            {/* Metrics console */}
            <div className="space-y-4 flex-grow w-full">
              <div className="p-4 bg-[#030706]/40 border border-brand/10 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">Mode:</span>
                <span className="text-xs font-bold text-white font-mono uppercase">
                  {studyMins <= 15 ? "Consistency" : studyMins <= 45 ? "Accelerator" : "Hyper-Focus"}
                </span>
              </div>

              <div className="p-4 bg-[#030706]/40 border border-brand/10 rounded-2xl flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">Habit Build:</span>
                <span className="text-xs font-bold text-brand font-mono flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 fill-brand animate-pulse" />
                  {studyMins <= 15 ? "3-Day Goals" : studyMins <= 45 ? "5-Day Goals" : "7-Day Goals"}
                </span>
              </div>

              <Link
                href={ROUTES.STUDENT.LOGIN}
                className="w-full flex items-center justify-center gap-2 bg-brand text-[#030706] font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-brandBright hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all"
              >
                Enroll Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges Section - simplified content */}
      <section className="bg-[#030706]/85 border-t border-brand/10 py-16 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item) => (
              <div
                key={item.title}
                className="p-6 bg-[#050D0B]/60 border border-brand/10 rounded-2xl space-y-4 group hover:border-brand/40 hover:-translate-y-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(3,7,6,0.3)]"
              >
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-brand/5 border border-brand/10 rounded-xl text-brand group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-mono text-brand bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-white group-hover:text-brand transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#94A3B8] text-xs leading-relaxed font-mono">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand/10 py-6 text-center text-[10px] font-mono text-[#94A3B8] z-10 relative bg-[#030706]">
        Educational content only - not investment advice. Always do your own due diligence.
      </footer>
    </div>
  );
}
