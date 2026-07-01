"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { cn } from "@/lib/utils";

type TradingTerminalWidgetProps = {
  courseStats: Array<{
    course: CourseDefinition;
    completed: number;
    total: number;
    percent: number;
  }>;
  totalXp: number;
  streak: number;
};

type Trade = {
  id: string;
  user: string;
  courseTicker: string;
  xp: number;
  type: "BUY" | "EXECUTE";
  time: string;
};

const MOCK_USERS = [
  "TraderRaj 💸", "ScalperAnya 📈", "ForexGuru 💱", "BullishDev 🤖", "OptionKing 📊",
  "NiftyNinja 🥋", "CryptoQueen ₿", "LimitOrder 📉", "DeltaForce ⚡", "HedgerHari 🧠"
];

const TICKERS = ["$IND_STX", "$FX_MAST", "$FNO_VOL", "$CRYP_MOON", "$PSY_CTRL", "$ALGO_ALPHA"];

export function TradingTerminalWidget({ courseStats, totalXp, streak }: TradingTerminalWidgetProps) {
  const [liveTrades, setLiveTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<"positions" | "orderbook">("positions");
  const [chartPeriod, setChartPeriod] = useState<"7D" | "30D">("7D");

  // Generate simulated live trades
  useEffect(() => {
    const initialTrades: Trade[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `trade-${i}`,
      user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
      courseTicker: TICKERS[Math.floor(Math.random() * TICKERS.length)],
      xp: [50, 100, 150, 200, 250][Math.floor(Math.random() * 5)],
      type: Math.random() > 0.3 ? "EXECUTE" : "BUY",
      time: `${i + 1}m ago`,
    }));
    setLiveTrades(initialTrades);

    const interval = setInterval(() => {
      setLiveTrades((prev) => {
        const newTrade: Trade = {
          id: `trade-${Date.now()}`,
          user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
          courseTicker: TICKERS[Math.floor(Math.random() * TICKERS.length)],
          xp: [50, 100, 150, 200, 250][Math.floor(Math.random() * 5)],
          type: Math.random() > 0.4 ? "EXECUTE" : "BUY",
          time: "Just now",
        };
        // Age older trades
        const updated = prev.map((t) => {
          if (t.time === "Just now") return { ...t, time: "1m ago" };
          if (t.time.endsWith("m ago")) {
            const m = parseInt(t.time) + 1;
            return { ...t, time: `${m}m ago` };
          }
          return t;
        });
        return [newTrade, ...updated.slice(0, 4)];
      });
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Compute mock portfolio values for the chart
  const portfolioData = useMemo(() => {
    const days = chartPeriod === "7D" ? 7 : 30;
    const baseValue = Math.max(1000, totalXp - 800);
    const dataPoints: { day: string; val: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Calculate growth trend leading up to totalXp
      const ratio = 1 - i / (days - 1 || 1);
      const randomVariance = Math.sin(i * 1.5) * (totalXp * 0.03);
      const val = Math.round(baseValue + (totalXp - baseValue) * ratio + randomVariance);
      
      dataPoints.push({ day: label, val: Math.min(val, totalXp) });
    }
    // Make sure last value is exactly totalXp
    dataPoints[dataPoints.length - 1].val = totalXp;
    return dataPoints;
  }, [totalXp, chartPeriod]);

  // Chart coordinates
  const svgWidth = 500;
  const svgHeight = 120;
  const vals = portfolioData.map((d) => d.val);
  const minVal = Math.min(...vals) * 0.98;
  const maxVal = Math.max(...vals) * 1.02;
  const valRange = maxVal - minVal || 1;

  const points = portfolioData
    .map((d, i) => {
      const x = (i / (portfolioData.length - 1)) * svgWidth;
      const y = svgHeight - ((d.val - minVal) / valRange) * (svgHeight - 16) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  // Gradient fill area
  const areaPoints = `${svgWidth},${svgHeight} 0,${svgHeight} ${points}`;

  const isUp = totalXp > 0;

  return (
    <div className="rounded-2xl border border-borderSubtle bg-surface shadow-theme overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-borderSubtle bg-overlay-subtle px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-textSecondary">
            PLANITT LIVE KNOWLEDGE TERMINAL v1.0.8
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-textMuted font-mono">
          <span>PORTFOLIO ACCURACY: <span className="text-emerald-600 dark:text-emerald-400 font-bold">98.4%</span></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">LEVERAGE: <span className="text-orange-500 font-bold">10X FOCUS</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-borderSubtle">
        {/* Left Column: Knowledge Portfolio Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Knowledge Net Worth</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight">
                  {totalXp.toLocaleString()} <span className="text-sm font-bold text-textMuted font-sans">XP</span>
                </span>
                <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +12.4% Yield
                </span>
              </div>
            </div>
            {/* Chart toggle periods */}
            <div className="flex rounded-lg bg-overlay-subtle p-0.5 text-[10px] font-bold">
              {(["7D", "30D"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition",
                    chartPeriod === period
                      ? "bg-surface text-textPrimary shadow-sm"
                      : "text-textMuted hover:text-textPrimary"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative mt-6 h-32 w-full trading-grid-bg rounded-lg border border-borderSubtle/30 overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="var(--border-subtle)" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="var(--border-subtle)" strokeDasharray="3,3" strokeWidth="0.5" />
              <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="var(--border-subtle)" strokeDasharray="3,3" strokeWidth="0.5" />

              {/* Area fill */}
              <polygon points={areaPoints} fill="url(#chartGradient)" />

              {/* Line path */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Final glow dot */}
              {portfolioData.length > 0 && (
                <circle
                  cx={svgWidth}
                  cy={svgHeight - ((portfolioData[portfolioData.length - 1].val - minVal) / valRange) * (svgHeight - 16) - 8}
                  r="4"
                  fill="#10b981"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>

          {/* X-Axis labels */}
          <div className="flex justify-between mt-2 text-[9px] font-mono text-textMuted uppercase tracking-wider">
            <span>{portfolioData[0]?.day}</span>
            <span>{portfolioData[Math.floor(portfolioData.length / 2)]?.day}</span>
            <span>Today (Live)</span>
          </div>
        </div>

        {/* Right Column: Mini tabs for Orders or Live feed */}
        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex border-b border-borderSubtle text-xs font-bold mb-4">
              <button
                onClick={() => setActiveTab("positions")}
                className={cn(
                  "pb-2 mr-4 border-b-2 transition",
                  activeTab === "positions"
                    ? "border-brand text-textPrimary"
                    : "border-transparent text-textMuted hover:text-textPrimary"
                )}
              >
                Risk Profile
              </button>
              <button
                onClick={() => setActiveTab("orderbook")}
                className={cn(
                  "pb-2 border-b-2 transition flex items-center gap-1.5",
                  activeTab === "orderbook"
                    ? "border-brand text-textPrimary"
                    : "border-transparent text-textMuted hover:text-textPrimary"
                )}
              >
                Live Orders
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </button>
            </div>

            {activeTab === "positions" ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-textMuted">Trading Strategy</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Knowledge Long-Only</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-textMuted">Active Leverage</span>
                  <span className="font-bold text-textPrimary">10.0x Focus Factor</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-textMuted">Consecutive Streak</span>
                  <Badge variant="warning">{streak} Days 🔥</Badge>
                </div>
                <div className="rounded-xl border border-borderSubtle bg-overlay-faint p-3 flex items-start gap-2.5 mt-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-brand shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-textPrimary uppercase">Capital Protection</p>
                    <p className="text-[9px] text-textMuted mt-0.5 leading-relaxed">
                      Stop-Loss is automatically locked at 0XP loss. Your cognitive asset value is fully secured.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {liveTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between text-xs animate-in fade-in">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] font-bold bg-overlay-strong text-textSecondary px-1 rounded truncate max-w-[80px]">
                          {trade.user}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold px-1 rounded",
                          trade.type === "BUY" ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400" : "text-sky-700 bg-sky-500/10 dark:text-sky-400"
                        )}>
                          {trade.type === "BUY" ? "BUY ORDER" : "EXECUTE"}
                        </span>
                      </div>
                      <p className="text-[10px] text-textMuted mt-0.5 font-mono truncate">{trade.courseTicker} lesson completed</p>
                    </div>
                    <div className="text-right ml-2">
                      <span className="font-mono font-bold text-emerald-700 dark:text-brand">+{trade.xp} XP</span>
                      <p className="text-[8px] text-textMuted font-mono mt-0.5">{trade.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-borderSubtle flex justify-between items-center text-[10px] text-textMuted font-mono">
            <span>FEED STATUS: NOMINAL</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-textPrimary transition">
              <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
              AUTOPILOT
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Table: Open Positions (Actual Enrolled Courses) */}
      {courseStats.length > 0 && (
        <div className="border-t border-borderSubtle overflow-x-auto">
          <table className="w-full text-left text-xs font-normal border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-overlay-faint text-textMuted uppercase font-bold text-[9px] tracking-wider border-b border-borderSubtle font-mono">
                <th className="px-5 py-3">Asset Ticker</th>
                <th className="px-5 py-3">Open Position (Course)</th>
                <th className="px-5 py-3">Yield / Progress</th>
                <th className="px-5 py-3 text-right">XP Capital</th>
                <th className="px-5 py-3 text-right">Yield PnL</th>
                <th className="px-5 py-3 text-center">Leverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSubtle/60">
              {courseStats.map(({ course, completed, total, percent }) => {
                const categoryCodes: Record<string, string> = {
                  "Indian Stocks": "$IND_STX",
                  Forex: "$FX_MAST",
                  "F&O": "$FNO_VOL",
                  Crypto: "$CRYP_MN",
                  Psychology: "$PSY_CTL",
                  "Algo Trading": "$ALGO_AL",
                };
                const ticker = categoryCodes[course.category] ?? "$PLNT_LRN";
                const isCompleted = percent === 100;
                
                return (
                  <tr key={course.id} className="hover:bg-overlay-faint/50 transition">
                    <td className="px-5 py-3 font-mono font-bold text-textPrimary">
                      <span className="bg-brand/10 text-emerald-700 dark:bg-brand/15 dark:text-brand px-1.5 py-0.5 rounded text-[10px]">
                        {ticker}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-textPrimary">{course.title}</td>
                    <td className="px-5 py-3 w-48">
                      <ProgressBar value={percent} size="sm" showLabel={false} />
                      <span className="text-[10px] text-textMuted mt-1 block">
                        {completed}/{total} modules ({percent}%)
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-semibold">
                      {(total * 100).toLocaleString()} <span className="text-[10px] text-textMuted">MAX</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      <span className={cn(
                        "font-bold",
                        percent > 0 ? "text-emerald-700 dark:text-brand" : "text-textMuted"
                      )}>
                        {percent > 0 ? `+${(completed * 100).toLocaleString()}` : "0"} XP
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono">
                        {isCompleted ? "Closed" : "10x Focus"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
