"use client";

import { useMemo } from "react";
import type { IncentiveRecord } from "@/lib/types";
import { cleanNum } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import {
  BarChart3,
  Users,
  Package,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity,
  Target,
  DollarSign,
  Globe,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingViewProps {
  data: IncentiveRecord[];
  user: { email: string; name: string; role: string };
  onNavigate: (page: string) => void;
}

const NAV_CARDS = [
  {
    id: "dashboard",
    label: "Performance Dashboard",
    description: "Actual vs Plan breakdowns, product-level performance, incentive calculations and detailed rep-level reporting.",
    icon: BarChart3,
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-200",
    badge: "Core Module",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "staff",
    label: "Staff Input Directory",
    description: "Full staff roster with quarterly availability, maternity leave status, promo line assignments and country breakdown.",
    icon: Users,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-200",
    badge: "HR Data",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "promo",
    label: "Product Promo",
    description: "Product contribution shares, portfolio weights per promo line, and aggregated actual vs planned revenue by product.",
    icon: Package,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-200",
    badge: "Analytics",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
];

function greeting(name: string) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = name.split(" ")[0];
  return `${time}, ${firstName}`;
}

export default function LandingView({ data, user, onNavigate }: LandingViewProps) {
  // Compute top-level KPIs
  const kpis = useMemo(() => {
    let tPlan = 0, tAct = 0, tInc = 0;

    data.forEach(d => {
      tPlan += cleanNum(d.TotalPlan);
      tAct += cleanNum(d.TotalAct);
      const computed = computeSummaryRow(buildPerformanceInputFromRecord(d));
      tInc += computed.totalIncentiveLC;
    });

    const uniqueReps = new Set(data.map(d => d.Name).filter(Boolean)).size;
    const uniqueCountries = new Set(data.map(d => d.Country).filter(Boolean)).size;
    const quarters = new Set(data.map(d => d.Quarter).filter(Boolean));
    const ach = tPlan > 0 ? (tAct / tPlan) * 100 : 0;

    const fmt = (v: number) =>
      v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" :
      v >= 1_000 ? (v / 1_000).toFixed(0) + "K" : v.toFixed(0);

    return {
      reps: uniqueReps,
      countries: uniqueCountries,
      quarters: quarters.size,
      ach: ach.toFixed(1),
      achUp: ach >= 100,
      totalAct: fmt(tAct),
      totalPlan: fmt(tPlan),
      totalInc: fmt(tInc),
    };
  }, [data]);

  // Top performers (by % achievement, at least some data)
  const topPerformers = useMemo(() => {
    const repMap = new Map<string, { act: number; plan: number; line: string }>();
    data.forEach(d => {
      if (!d.Name?.trim()) return;
      const act = cleanNum(d.TotalAct);
      const plan = cleanNum(d.TotalPlan);
      if (act === 0 && plan === 0) return;
      if (!repMap.has(d.Name)) repMap.set(d.Name, { act: 0, plan: 0, line: d.PromoLine || "" });
      const e = repMap.get(d.Name)!;
      e.act += act;
      e.plan += plan;
    });
    return Array.from(repMap.entries())
      .filter(([, v]) => v.plan > 0)
      .map(([name, v]) => ({ name, ach: Math.round((v.act / v.plan) * 100), line: v.line }))
      .sort((a, b) => b.ach - a.ach)
      .slice(0, 5);
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Hero greeting ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl px-8 py-10 shadow-xl shadow-indigo-200/50">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-blue-200 font-semibold text-sm mb-1 uppercase tracking-widest">Abbott EPD — Incentive Calculator</p>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {greeting(user.name)} 👋
            </h1>
            <p className="text-blue-100/80 mt-2 text-sm font-medium max-w-lg">
              Here's a snapshot of the EPD incentive programme. Use the cards below to navigate to any module.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                <Award className="w-3.5 h-3.5" />
                {user.role}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                <Globe className="w-3.5 h-3.5" />
                Kazakhstan
              </span>
            </div>
          </div>

          {/* Achievement ring */}
          <div className="flex-shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(parseFloat(kpis.ach), 150) / 150 * 263.9} 263.9`}
                />
              </svg>
              <div className="text-center z-10">
                <p className="text-3xl font-black text-white leading-none">{kpis.ach}%</p>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mt-1">Achievement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Reps", value: kpis.reps.toString(), icon: Users, color: "from-blue-500 to-indigo-500", shadow: "shadow-blue-100" },
          { label: "Total Actual", value: `${kpis.totalAct} LC`, icon: Activity, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-100" },
          { label: "Total Incentive", value: `${kpis.totalInc} LC`, icon: DollarSign, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-100" },
          { label: "Quarters Tracked", value: kpis.quarters.toString(), icon: Target, color: "from-violet-500 to-purple-500", shadow: "shadow-violet-100" },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center shadow-md ${k.shadow} mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{k.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{k.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Navigation Cards ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NAV_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="group text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 mt-1" />
                </div>

                <div>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", card.badgeColor)}>
                    {card.badge}
                  </span>
                  <h3 className="text-[15px] font-bold text-slate-900 mt-2 leading-snug group-hover:text-blue-700 transition-colors">
                    {card.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className={`mt-auto flex items-center gap-1.5 text-[11px] font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  Open module
                  <ChevronRight className="w-3 h-3" style={{ color: "transparent", backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Top Performers sidebar ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Top Performers</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Ranked by % achievement (all-time)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="divide-y divide-slate-50">
            {topPerformers.map((rep, i) => (
              <div key={rep.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0",
                  i === 0 ? "bg-amber-100 text-amber-700" :
                  i === 1 ? "bg-slate-200 text-slate-600" :
                  i === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-slate-100 text-slate-500"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-800 truncate">{rep.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{rep.line || "—"}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {rep.ach >= 100
                    ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                    : <TrendingDown className="w-3 h-3 text-rose-400" />
                  }
                  <span className={cn(
                    "text-[11px] font-black",
                    rep.ach >= 100 ? "text-emerald-600" : "text-rose-500"
                  )}>
                    {rep.ach}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <button
              onClick={() => onNavigate("dashboard")}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              View full dashboard <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
