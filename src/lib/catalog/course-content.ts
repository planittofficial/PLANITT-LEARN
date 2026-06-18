import type { CourseDefinition, CourseModule, Lesson } from "./courses";

function articleLesson(
  id: string,
  title: string,
  summary: string,
  markdown: string,
  durationMinutes = 10,
): Lesson {
  return {
    id,
    title,
    durationMinutes,
    kind: "article",
    summary,
    content: { markdown },
  };
}

function moduleWithIntro(
  id: string,
  title: string,
  summary: string,
  lessonTitle: string,
): CourseModule {
  return {
    id,
    title,
    summary,
    lessons: [
      articleLesson(
        `${id}-l1`,
        lessonTitle,
        `Orientation for ${title}.`,
        `## ${lessonTitle}\n\nWelcome to **${title}**. This is starter content — interns replace this with video lectures and detailed material.\n\n### What you will learn\n\n${summary}\n\n### Your task\n\nExpand this module with additional lessons, quizzes, and video content.`,
      ),
    ],
  };
}

/** Full catalog — metadata matches Planitt Learn marketing pages. */
export const COURSE_CATALOG_DATA: CourseDefinition[] = [
  {
    id: "learn-indian-stocks-pro",
    title: "Indian Stocks + Mutual Fund",
    category: "Indian Stocks",
    level: "Beginner",
    duration: "8 weeks",
    blurb:
      "Master Indian market fundamentals and technical strategy playbooks for real trades.",
    outcomes: [
      "Complete stock market fundamentals",
      "Technical strategy stack with entry and exit rules",
      "Portfolio and swing-trading execution discipline",
    ],
    modules: [
      moduleWithIntro(
        "in-m1",
        "Stock Market Foundations",
        "NSE/BSE structure, indices, and how equities trade in India.",
        "Welcome to Indian equities",
      ),
      moduleWithIntro(
        "in-m2",
        "Chart Reading & Candlesticks",
        "OHLC, timeframes, and basic price-action vocabulary.",
        "Reading your first chart",
      ),
      moduleWithIntro(
        "in-m3",
        "Technical Strategy Stack",
        "Trend, support/resistance, and setup identification.",
        "Building a setup checklist",
      ),
      moduleWithIntro(
        "in-m4",
        "Swing Trading Playbook",
        "Multi-day holds, entry triggers, and invalidation rules.",
        "Swing trade framework",
      ),
      moduleWithIntro(
        "in-m5",
        "Mutual Funds & SIP Strategy",
        "Fund categories, expense ratios, and systematic investing.",
        "Mutual fund basics",
      ),
      moduleWithIntro(
        "in-m6",
        "Sector Rotation & Themes",
        "How macro themes flow into Indian sector leadership.",
        "Sector analysis intro",
      ),
      moduleWithIntro(
        "in-m7",
        "Portfolio & Risk Discipline",
        "Position sizing, drawdown limits, and review routines.",
        "Portfolio rules",
      ),
    ],
  },
  {
    id: "learn-forex-master-track",
    title: "Forex Master Track",
    category: "Forex",
    level: "Intermediate",
    duration: "8 weeks",
    blurb:
      "Complete forex journey with full trading fundamentals and technical strategy execution.",
    outcomes: [
      "Full trading fundamentals for currency markets",
      "Technical strategies for trend, breakout, and pullback",
      "Risk and position sizing framework for consistency",
    ],
    modules: [
{
  id: "fx-m1",
  title: "FX Foundations",
  summary: "How currency markets work.",
  lessons: [
    articleLesson(
      "fx-m1-l1",
      "What moves currency pairs",
      "Introduction to Forex markets",
      "## Forex Basics\n\nCurrencies move because of supply, demand, interest rates and economic conditions."
    ),

    {
      id: "fx-m1-l2",
      title: "Forex Market Overview Video",
      durationMinutes: 12,
      kind: "video",
      summary: "Introduction to global currency markets.",
      content: {
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    },

    articleLesson(
      "fx-m1-l3",
      "Major Currency Pairs",
      "Understanding EUR/USD and other major pairs",
      "## Major Currency Pairs\n\nEUR/USD, GBP/USD and USD/JPY are among the most traded forex pairs."
    ),
  ],
},      moduleWithIntro("fx-m2", "Reading Forex Quotes", "Bid, ask, spread, pip value, and lot sizes.", "Reading a forex quote"),
      moduleWithIntro("fx-m3", "Major Pairs & Sessions", "London, New York, Asia session behavior.", "Session timing edge"),
      moduleWithIntro("fx-m4", "Trend Analysis", "Higher-high / lower-low structure and trend filters.", "Identifying trend direction"),
      moduleWithIntro("fx-m5", "Breakout Setups", "Range breaks, volatility expansion, and confirmation.", "Breakout framework"),
      moduleWithIntro("fx-m6", "Pullback Entries", "Retracements in established trends.", "Pullback entry rules"),
      moduleWithIntro("fx-m7", "Support & Resistance", "Zones, flips, and confluence on FX charts.", "Key levels mapping"),
      moduleWithIntro("fx-m8", "Risk Per Trade", "Fixed fractional risk and stop placement.", "Calculating pip risk"),
      moduleWithIntro("fx-m9", "Position Sizing", "Lot size from account risk percentage.", "Position size worksheet"),
      moduleWithIntro("fx-m10", "Trade Journaling", "Logging setups, outcomes, and emotional notes.", "Journal template walkthrough"),
      moduleWithIntro("fx-m11", "News & Fundamentals", "CPI, rates, and event risk management.", "Trading around news"),
      moduleWithIntro("fx-m12", "Multi-Timeframe Analysis", "Aligning higher TF bias with entry TF.", "MTF confluence"),
      moduleWithIntro("fx-m13", "Live Execution Routine", "Pre-market prep through post-trade review.", "Daily workflow"),
      moduleWithIntro("fx-m14", "Capstone Review", "Integrating all modules into one playbook.", "Course capstone"),
    ],
  },
  {
    id: "learn-fno-strategy-program",
    title: "F&O Strategy Program",
    category: "F&O",
    level: "Advanced",
    duration: "8 weeks",
    blurb:
      "From options basics to advanced technical setups with practical execution workflows.",
    outcomes: [
      "Options and futures fundamentals end-to-end",
      "Technical setups for expiry and directional trades",
      "Hedging, adjustment, and drawdown playbook",
    ],
    modules: [
      moduleWithIntro(
        "fno-m1",
        "Options Foundations",
        "Calls, puts, moneyness, and premium drivers.",
        "Options building blocks",
      ),
      moduleWithIntro(
        "fno-m2",
        "Futures Mechanics",
        "Margin, expiry, rollover, and basis.",
        "Futures essentials",
      ),
      moduleWithIntro(
        "fno-m3",
        "Expiry Week Strategy",
        "Theta decay, pin risk, and weekly setups.",
        "Expiry week playbook",
      ),
      moduleWithIntro(
        "fno-m4",
        "Directional Spreads",
        "Bull/bear spreads and risk-defined directional bets.",
        "Spread structures",
      ),
      moduleWithIntro(
        "fno-m5",
        "Hedging & Adjustments",
        "Protecting equity books and adjusting losers.",
        "Hedging framework",
      ),
    ],
  },
  {
    id: "learn-crypto-technical-edge",
    title: "Crypto Technical Edge",
    category: "Crypto",
    level: "Intermediate",
    duration: "7 weeks",
    blurb:
      "Build a robust crypto process with fundamentals and high-volatility technical systems.",
    outcomes: [
      "Crypto market mechanics and risk fundamentals",
      "Technical setups tuned for 24x7 volatility",
      "Execution routine and capital protection rules",
    ],
    modules: [
      moduleWithIntro(
        "cr-m1",
        "Crypto Market Structure",
        "Exchanges, liquidity, funding, and market cycles.",
        "How crypto markets differ",
      ),
      moduleWithIntro(
        "cr-m2",
        "Volatility Trading Systems",
        "Breakouts, mean reversion, and 24x7 risk controls.",
        "Volatility setup stack",
      ),
    ],
  },
  {
    id: "learn-trader-psychology-intensive",
    title: "Trader Psychology Intensive",
    category: "Psychology",
    level: "Beginner",
    duration: "6 weeks",
    blurb:
      "Strengthen mindset and discipline so technical strategies are executed with consistency.",
    outcomes: [
      "Behavioral fundamentals for trading consistency",
      "Decision frameworks for stressful markets",
      "Journaling and performance review system",
    ],
    modules: [
      moduleWithIntro(
        "psy-m1",
        "Behavioral Foundations",
        "Bias, FOMO, revenge trading, and self-awareness.",
        "Common trader biases",
      ),
      moduleWithIntro(
        "psy-m2",
        "Stress & Decision Making",
        "Protocols for drawdowns and high-volatility days.",
        "Decision under pressure",
      ),
    ],
  },
  {
    id: "learn-algo-trading",
    title: "Algo Trading",
    category: "Algo Trading",
    level: "Advanced",
    duration: "6 weeks",
    blurb:
      "Build, test, and deploy rule-based trading systems from automation basics through live execution.",
    outcomes: [
      "Design rule-based strategies with clear entry and exit logic",
      "Write and debug Pine Script strategies on TradingView",
      "Backtest with realistic assumptions and avoid overfitting",
      "Deploy alerts and monitor live algo performance safely",
    ],
    modules: [
      moduleWithIntro(
        "algo-m1",
        "Automation Basics",
        "Rule-based systems vs discretionary trading.",
        "Why automate",
      ),
      moduleWithIntro(
        "algo-m2",
        "Pine Script Fundamentals",
        "Indicators, conditions, and strategy entries in TradingView.",
        "Your first Pine strategy",
      ),
      moduleWithIntro(
        "algo-m3",
        "Backtesting Workflow",
        "Slippage, fees, curve fitting, and walk-forward basics.",
        "Realistic backtests",
      ),
      moduleWithIntro(
        "algo-m4",
        "Live Deployment",
        "Alerts, monitoring, kill switches, and post-live review.",
        "Going live safely",
      ),
    ],
  },
];
