"use client";

import { useMemo } from "react";
import type { IncentiveRecord } from "@/lib/types";
import { cleanNum } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity,
  Target,
  DollarSign,
  Globe,
  Award,
  Layers,
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
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-300",
    badge: "Core Module",
    badgeBg: "bg-blue-50 text-blue-600 border-blue-100",
    accentText: "text-blue-600",
  },
  {
    id: "staff",
    label: "Staff Input Directory",
    description: "Full staff roster with quarterly availability, maternity leave status, promo line assignments and country breakdown.",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-violet-100",
    hoverBorder: "hover:border-violet-300",
    badge: "HR Data",
    badgeBg: "bg-violet-50 text-violet-600 border-violet-100",
    accentText: "text-violet-600",
  },
  {
    id: "promo",
    label: "Product Promo",
    description: "Product contribution shares, portfolio weights per promo line, and aggregated actual vs planned revenue by product.",
    icon: Package,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
    badge: "Analytics",
    badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accentText: "text-emerald-600",
  },
];

function greeting(name: string) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}`;
}

export default function LandingView({ data, user, onNavigate }: LandingViewProps) {
  const kpis = useMemo(() => {
    let tPlan = 0, tAct = 0, tInc = 0;
    data.forEach(d => {
      tPlan += cleanNum(d.TotalPlan);
      tAct += cleanNum(d.TotalAct);
      tInc += computeSummaryRow(buildPerformanceInputFromRecord(d)).totalIncentiveLC;
    });
    const uniqueReps = new Set(data.map(d => d.Name).filter(Boolean)).size;
    const quarters   = new Set(data.map(d => d.Quarter).filter(Boolean)).size;
    const ach = tPlan > 0 ? (tAct / tPlan) * 100 : 0;
    const fmt = (v: number) =>
      v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" :
      v >= 1_000     ? (v / 1_000).toFixed(0) + "K" : v.toFixed(0);
    return { reps: uniqueReps, quarters, ach: ach.toFixed(1), achUp: ach >= 100, totalAct: fmt(tAct), totalInc: fmt(tInc) };
  }, [data]);

  const topPerformers = useMemo(() => {
    const map = new Map<string, { act: number; plan: number; line: string }>();
    data.forEach(d => {
      if (!d.Name?.trim()) return;
      const act = cleanNum(d.TotalAct), plan = cleanNum(d.TotalPlan);
      if (!act && !plan) return;
      if (!map.has(d.Name)) map.set(d.Name, { act: 0, plan: 0, line: d.PromoLine || "" });
      const e = map.get(d.Name)!;
      e.act += act; e.plan += plan;
    });
    return Array.from(map.entries())
      .filter(([, v]) => v.plan > 0)
      .map(([name, v]) => ({ name, ach: Math.round((v.act / v.plan) * 100), line: v.line }))
      .sort((a, b) => b.ach - a.ach)
      .slice(0, 5);
  }, [data]);

  const rankStyle = (i: number) =>
    i === 0 ? "bg-amber-50 text-amber-600 border border-amber-200" :
    i === 1 ? "bg-slate-100 text-slate-600 border border-slate-200" :
    i === 2 ? "bg-orange-50 text-orange-600 border border-orange-200" :
              "bg-slate-50 text-slate-500 border border-slate-200";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl px-8 py-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Left: greeting + meta */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-100">
                <Award className="w-3 h-3" />
                {user.role}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200">
                <Globe className="w-3 h-3" />
                Kazakhstan
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {greeting(user.name)} 👋
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium max-w-lg leading-relaxed">
              Here's a snapshot of the EPD incentive programme across{" "}
              <span className="font-bold text-slate-700">{kpis.reps} representatives</span> and{" "}
              <span className="font-bold text-slate-700">{kpis.quarters} quarters</span>. Use the
              module cards below to explore detailed reports.
            </p>
          </div>

          {/* Right: achievement badge */}
          <div className={cn(
            "flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-2xl border-2 self-start md:self-center",
            kpis.achUp ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          )}>
            {kpis.achUp
              ? <TrendingUp className="w-7 h-7 text-emerald-500 mb-2" />
              : <TrendingDown className="w-7 h-7 text-amber-500 mb-2" />
            }
            <p className={cn("text-3xl font-black leading-none", kpis.achUp ? "text-emerald-700" : "text-amber-700")}>
              {kpis.ach}%
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1.5">Achievement</p>
          </div>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Reps",      value: kpis.reps.toString(),          icon: Users,     iconBg: "bg-blue-50",    iconColor: "text-blue-600",    border: "border-blue-100"    },
          { label: "Total Actual",     value: `${kpis.totalAct} LC`,         icon: Activity,  iconBg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100" },
          { label: "Total Incentive",  value: `${kpis.totalInc} LC`,         icon: DollarSign,iconBg: "bg-amber-50",   iconColor: "text-amber-600",   border: "border-amber-100"   },
          { label: "Quarters Tracked", value: kpis.quarters.toString(),      icon: Layers,    iconBg: "bg-violet-50",  iconColor: "text-violet-600",  border: "border-violet-100"  },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={cn("bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-300", k.border)}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", k.iconBg)}>
                <Icon className={cn("w-5 h-5", k.iconColor)} />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{k.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Nav cards + Top performers ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Module cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NAV_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={cn(
                  "group text-left bg-white rounded-2xl border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4",
                  card.border, card.hoverBorder
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", card.iconBg)}>
                    <Icon className={cn("w-6 h-6", card.iconColor)} />
                  </div>
                  <ChevronRight className={cn("w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all duration-200 mt-1", `group-hover:${card.accentText}`)} />
                </div>

                <div>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", card.badgeBg)}>
                    {card.badge}
                  </span>
                  <h3 className={cn("text-[14px] font-bold text-slate-900 mt-2 leading-snug transition-colors", `group-hover:${card.accentText}`)}>
                    {card.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className={cn("mt-auto flex items-center gap-1 text-[11px] font-bold", card.accentText)}>
                  Open module <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Top performers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Top Performers</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Ranked by % achievement (all-time)</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {topPerformers.map((rep, i) => (
              <div key={rep.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0", rankStyle(i))}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-slate-800 truncate">{rep.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{rep.line || "—"}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {rep.ach >= 100
                    ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                    : <TrendingDown className="w-3 h-3 text-rose-400" />}
                  <span className={cn("text-[11px] font-black", rep.ach >= 100 ? "text-emerald-600" : "text-rose-500")}>
                    {rep.ach}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
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
