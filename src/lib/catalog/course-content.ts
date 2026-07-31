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

function videoModule(
  id: string,
  title: string,
  summary: string,
  durationMinutes: number,
): CourseModule {
  return {
    id,
    title,
    summary,
    lessons: [
      {
        id: `${id}-l1`,
        title,
        durationMinutes,
        kind: "video",
        summary,
        // Add the unlisted YouTube URL from the admin lesson editor.
        content: {},
      },
    ],
  };
}

/** Full catalog — metadata matches Alvest Learn marketing pages. */
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
      {
        id: "in-m1",
        title: "Financial Markets Foundation",
        summary: "Build a strong foundation for understanding how financial markets work.",
        lessons: [
          {
            id: "in-m1-video",
            title: "Module 1 — Financial Markets Foundation",
            durationMinutes: 6,
            kind: "video",
            summary: "Introduction to financial markets and the core concepts every investor should understand.",
            // Add the unlisted YouTube URL from the admin lesson editor.
            content: {},
          },
          articleLesson(
            "in-m1-l1",
            "Welcome to Indian equities",
            "What you’ll learn and how to approach this course",
            "## Welcome\n\nIn this module we build the *mental model* for how Indian stocks trade.\n\n### In this lesson\n- What NSE vs BSE means\n- How orders reach the exchange\n- Why liquidity and spread matter\n\n### Outcome\nBy the end, you’ll be able to describe the flow: **broker → exchange → trade**.",
          ),
          articleLesson(
            "in-m1-l2",
            "NSE vs BSE and market structure",
            "How Indian exchanges are organized and how trades match",
            "## NSE vs BSE\n\nBoth are exchanges where orders match, but liquidity and active symbols vary.\n\n### Key concepts\n- Order book (bid/ask)\n- Market makers vs natural liquidity\n- Trading hours and auction sessions\n\n### Quick check\nExplain the difference between **exchange** and **broker** in one line.",
          ),
          articleLesson(
            "in-m1-l3",
            "Index basics: NIFTY, BANKNIFTY, SENSEX",
            "What indices represent and how they’re used by traders",
            "## Indices\n\nAn index is a basket of stocks meant to represent a segment of the market.\n\n### Why indices matter\n- Benchmarking performance\n- Sector strength signals\n- Derivatives liquidity around index products\n\n### Practical\nTrack daily move of NIFTY and one sector index for a week.",
          ),
          articleLesson(
            "in-m1-l4",
            "Order types: Market, Limit, Stop-loss",
            "The three order types you must master before trading",
            "## Order types\n\n### Market\nExecutes immediately at best available price.\n\n### Limit\nExecutes at your price *or better*.\n\n### Stop-loss (SL)\nBecomes a market/limit order after trigger.\n\n### Rule of thumb\nUse **limit** for planned entries, and **stop-loss** for risk control.",
          ),
        ],
      },
      videoModule(
        "in-m2",
        "Indian Stock Market Basics",
        "Understand the Indian stock market and how investors participate in it.",
        4,
      ),
      videoModule(
        "in-m3",
        "Basics of Investing",
        "Learn the core principles every successful investor understands before investing.",
        6,
      ),
      videoModule(
        "in-m4",
        "Fundamental Analysis",
        "Learn how to evaluate companies before investing in them.",
        14,
      ),
      videoModule(
        "in-m5",
        "Technical Analysis",
        "Learn how traders read charts, identify trends, and make data-driven decisions.",
        23,
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
      videoModule("fx-m1", "Definition of Forex Market", "Understand what the forex market is and how currency trading works.", 2),
      videoModule("fx-m2", "Major Participants in the Forex Market — Part 1", "Learn who participates in the forex market and how the market moves.", 4),
      videoModule("fx-m3", "Major Participants in the Forex Market — Part 2", "Continue learning about the institutions and participants that influence forex markets.", 5),
      videoModule("fx-m4", "Major Participants in the Forex Market — Part 3", "Complete the overview of the major participants in the forex market.", 3),
      videoModule("fx-m5", "Key Sessions", "Learn the major forex trading sessions and when the market moves most.", 4),
      videoModule("fx-m6", "Basics of Currency Pairs", "Understand currency pairs and how forex quotes are structured.", 6),
      videoModule("fx-m7", "Pips and Spread", "Learn pips, spreads, and the essential measurement concepts used in forex trading.", 13),
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
      videoModule("cr-m1", "Introduction to Crypto", "Learn what cryptocurrency is and how the crypto market works.", 1),
      videoModule("cr-m2", "Setting up an Account in Exchanges and Buying your first Crypto", "Create an exchange account, complete verification, fund it safely, and buy your first crypto asset.", 3),
      videoModule("cr-m3", "Types of Crypto Trading, Spot and Futures", "Understand the difference between spot trading and futures trading in cryptocurrency.", 3),
      videoModule("cr-m4", "What is Leverage?", "Learn how leverage works in crypto trading and understand its risks.", 3),
      videoModule("cr-m5", "Types of Wallets / Setting up your crypto wallet", "Understand different crypto wallet types and how to set up a wallet safely.", 6),
      videoModule("cr-m6", "Transfer funds between Wallets and Exchanges", "Learn how to transfer cryptocurrency between wallets and exchanges safely.", 2),
      videoModule("cr-m7", "How to manage Risk and Reward ratio?", "Learn risk-reward planning and the importance of risk management in crypto trading.", 6),
      videoModule("cr-m8", "Basic Fundamentals of MemeCoins", "Understand what memecoins are and the basic factors that influence them.", 6),
      videoModule("cr-m9", "Why does Memecoins BlowUP?!", "Learn why memecoins can rise or fall rapidly and understand the risks involved.", 4),
      videoModule("cr-m10", "How to generate profits from Memecoins", "Explore memecoin trading strategies while understanding timing and risk.", 1),
      videoModule("cr-m11", "How to Avoid Rug Pulls?", "Identify common rug-pull warning signs and protect your crypto investments.", 7),
      videoModule("cr-m12", "Useful tools to trade better", "Discover practical tools for research, analysis, risk management, and better crypto decisions.", 10),
      videoModule("cr-m13", "What are Airdrops?", "Understand crypto airdrops, how they work, and how to evaluate them safely.", 2),
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
