"use client";

import Link from "next/link";
import { TrendingUp, Terminal, BookOpen, Shield, Cpu, Activity, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function LandingView() {
  const features = [
    {
      icon: Terminal,
      title: "Algorithmic Foundations",
      desc: "Master the core principles of quantitative modeling and systematic execution architecture.",
      badge: "CORE_SYSTEM"
    },
    {
      icon: Shield,
      title: "Risk Vector Analysis",
      desc: "Advanced volatility hedging strategies and multi-asset risk mitigation frameworks.",
      badge: "RISK_CONTROL"
    },
    {
      icon: Cpu,
      title: "HFT Logic Gates",
      desc: "Understanding the mechanics of sub-millisecond execution and order flow imbalances.",
      badge: "HFT_MODULE"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#e5e2e1] relative overflow-hidden flex flex-col justify-between selection:bg-brand/35 selection:text-brand">
      {/* Background patterns */}
      <div className="absolute inset-0 radar-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="w-full bg-[#0A0A0A]/60 backdrop-blur-md border-b border-white/5 z-50">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
              <TrendingUp className="h-5 w-5 text-brand" />
            </div>
            <span className="font-headline text-[20px] font-black text-brand tracking-tighter uppercase">
              TRDR_PRO
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="text-textSecondary hover:text-brand font-mono text-xs uppercase tracking-wider transition"
            >
              Login
            </Link>
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="bg-brand text-black font-mono font-bold text-xs uppercase tracking-widest px-4 py-2 rounded hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)]"
            >
              Access Terminal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 font-mono text-[10px] text-brand tracking-widest uppercase">
            <Activity className="h-3 w-3 animate-pulse" />
            SYSTEM_STATUS: ONLINE
          </div>

          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-textPrimary">
            The Institutional Standard <br/>
            For Modern <span className="text-brand">Traders</span>
          </h1>

          <p className="text-textSecondary text-base md:text-lg max-w-xl leading-relaxed">
            Master the markets with our elite tier modular curriculum. Engineered for professional, high-performance execution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="flex items-center justify-center gap-2 bg-brand text-black font-mono font-bold text-sm tracking-widest px-6 py-3.5 rounded hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]"
            >
              ENTER LEARNING TERMINAL
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.STUDENT.LOGIN}
              className="flex items-center justify-center border border-white/10 hover:border-brand/40 text-textPrimary font-mono font-bold text-sm tracking-widest px-6 py-3.5 rounded hover:bg-white/5 transition"
            >
              EXPLORE CURRICULUM
            </Link>
          </div>
        </div>

        {/* Hero Right Widget (Interactive Terminal Look) */}
        <div className="lg:col-span-5 relative">
          <div className="glass-panel-stitch p-6 rounded-xl border border-white/5 relative z-10 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-mono text-[10px] text-textSecondary uppercase tracking-widest">TRDR_SYS_STATUS</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs text-textSecondary leading-relaxed">
              <p className="text-brand">&gt; Initializing neural analytics...</p>
              <p>&gt; Connection established on port 3001</p>
              <p>&gt; Catalog modules count: 6</p>
              <p>&gt; Risk matrix checks: <span className="text-brand">PASSED</span></p>
              <div className="p-4 bg-black/40 border border-white/5 rounded font-bold text-center text-textPrimary space-y-1">
                <div className="text-[10px] text-textMuted uppercase tracking-wider">Estimated Yield Index</div>
                <div className="text-2xl text-brand font-black">+24.85%</div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-brand to-purple-500 rounded-xl blur opacity-15" />
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-black/60 border-t border-white/5 py-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((item) => (
              <div key={item.title} className="p-6 bg-[#131313]/60 border border-white/5 rounded-xl space-y-3 group hover:border-brand/40 transition">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-brand/5 border border-brand/20 rounded text-brand">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[9px] text-textMuted uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-textMuted font-mono z-10 relative">
        Educational content only — not investment advice. Always perform your own due diligence.
      </footer>
    </div>
  );
}
