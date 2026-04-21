"use client";

import { useMemo } from "react";
import type { IncentiveRecord } from "@/lib/types";
import { cleanNum } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import {
  BarChart3, Users, Package, TrendingUp, TrendingDown,
  ChevronRight, Activity, Target, DollarSign, Globe,
  Award, Layers, Sparkles, ArrowRight,
} from "lucide-react";

/* ── Design Tokens ─────────────────────────────────────────── */
const NAVY   = "#0B1F3A";
const NAVY2  = "#122D5A";
const BLUE   = "#0057A8";
const BLUE_H = "#004A91";
const BORDER = "#D0DCE8";
const BG     = "#F0F4F8";
const T_MAIN = "#0F1827";
const T_MUT  = "#3D5875";
const T_SUB  = "#6B8499";
const T_PALE = "#9BAFBE";

const NAV_CARDS = [
  {
    id: "dashboard", label: "Performance Dashboard",
    description: "Actual vs Plan breakdowns, product-level performance, incentive calculations and detailed rep-level reporting.",
    icon: BarChart3, accentColor: BLUE, accentBg: "rgba(0,87,168,0.07)", accentBorder: "rgba(0,87,168,0.18)",
    badge: "Core Module", badgeBg: "rgba(0,87,168,0.09)", badgeColor: BLUE, badgeBorder: "rgba(0,87,168,0.18)",
  },
  {
    id: "staff", label: "Staff Directory",
    description: "Full staff roster with quarterly availability, maternity leave status, promo line assignments and country breakdown.",
    icon: Users, accentColor: NAVY, accentBg: "rgba(11,31,58,0.06)", accentBorder: "rgba(11,31,58,0.16)",
    badge: "HR Data", badgeBg: "rgba(11,31,58,0.07)", badgeColor: NAVY, badgeBorder: "rgba(11,31,58,0.16)",
  },
  {
    id: "promo", label: "Product Promo",
    description: "Product contribution shares, portfolio weights per promo line, and aggregated actual vs planned revenue by product.",
    icon: Package, accentColor: "#0E7A4F", accentBg: "rgba(14,122,79,0.07)", accentBorder: "rgba(14,122,79,0.18)",
    badge: "Analytics", badgeBg: "rgba(14,122,79,0.07)", badgeColor: "#0E7A4F", badgeBorder: "rgba(14,122,79,0.18)",
  },
];

function greeting(name: string) {
  const h = new Date().getHours();
  return `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${name.split(" ")[0]}`;
}

interface LandingViewProps {
  data: IncentiveRecord[];
  user: { email: string; name: string; role: string };
  onNavigate: (page: string) => void;
}

export default function LandingView({ data, user, onNavigate }: LandingViewProps) {
  const kpis = useMemo(() => {
    let tPlan = 0, tAct = 0, tInc = 0;
    data.forEach(d => {
      tPlan += cleanNum(d.TotalPlan);
      tAct  += cleanNum(d.TotalAct);
      tInc  += computeSummaryRow(buildPerformanceInputFromRecord(d)).totalIncentiveLC;
    });
    const uniqueReps = new Set(data.map(d => d.Name).filter(Boolean)).size;
    const quarters   = new Set(data.map(d => d.Quarter).filter(Boolean)).size;
    const ach = tPlan > 0 ? (tAct / tPlan) * 100 : 0;
    const fmt = (v: number) => v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" : v >= 1_000 ? (v / 1_000).toFixed(0) + "K" : v.toFixed(0);
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 60%, #152F60 100%)`,
          boxShadow: "0 8px 40px rgba(11,31,58,0.30)",
        }}
      >
        {/* Subtle radial glow — not neon, just depth */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,87,168,0.18) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(160,191,206,0.08) 0%, transparent 70%)" }} />
        {/* Fine grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }} />

        <div className="relative px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,87,168,0.28)", color: "#A0BFCE", border: "1px solid rgba(0,87,168,0.35)" }}>
                <Award className="w-3 h-3" /> {user.role}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#A0BFCE", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Globe className="w-3 h-3" /> Kazakhstan
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(14,122,79,0.18)", color: "#86EFAC", border: "1px solid rgba(14,122,79,0.28)" }}>
                <Sparkles className="w-3 h-3" /> EPD Programme
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight" style={{ color: "#FFFFFF" }}>
              {greeting(user.name)} 👋
            </h1>
            <p className="mt-2 text-sm font-medium max-w-lg leading-relaxed" style={{ color: "rgba(160,191,206,0.70)" }}>
              Incentive programme across{" "}
              <span className="font-bold" style={{ color: "#FFFFFF" }}>{kpis.reps} representatives</span> and{" "}
              <span className="font-bold" style={{ color: "#FFFFFF" }}>{kpis.quarters} quarters</span>.
              Use the cards below to explore detailed reports.
            </p>
            <button
              onClick={() => onNavigate("dashboard")}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 group"
              style={{ background: "linear-gradient(135deg, #0057A8 0%, #004A91 100%)", color: "#FFFFFF", boxShadow: "0 4px 16px rgba(0,87,168,0.40)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,87,168,0.55)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,87,168,0.40)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              Open Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* Achievement badge */}
          <div
            className="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 rounded-2xl border-2 self-start md:self-center"
            style={kpis.achUp
              ? { backgroundColor: "rgba(14,122,79,0.14)", borderColor: "rgba(14,122,79,0.38)" }
              : { backgroundColor: "rgba(180,83,9,0.14)", borderColor: "rgba(180,83,9,0.38)" }
            }
          >
            {kpis.achUp
              ? <TrendingUp className="w-7 h-7 mb-2" style={{ color: "#86EFAC" }} />
              : <TrendingDown className="w-7 h-7 mb-2" style={{ color: "#FCD34D" }} />
            }
            <p className="text-3xl font-black leading-none" style={{ color: kpis.achUp ? "#86EFAC" : "#FCD34D" }}>{kpis.ach}%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1.5" style={{ color: "rgba(160,191,206,0.50)" }}>Achievement</p>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Reps",      value: kpis.reps.toString(),    icon: Users,      accent: BLUE },
          { label: "Total Actual",     value: `${kpis.totalAct} LC`,   icon: Activity,   accent: "#0E7A4F" },
          { label: "Total Incentive",  value: `${kpis.totalInc} LC`,   icon: DollarSign, accent: "#B45309" },
          { label: "Quarters Tracked", value: kpis.quarters.toString(), icon: Layers,     accent: NAVY },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label}
              className="rounded-2xl p-5 flex flex-col transition-all duration-300 overflow-hidden"
              style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(11,31,58,0.10)"; (e.currentTarget as HTMLElement).style.borderColor = "#A8BFCE"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(11,31,58,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div className="h-[3px] w-10 rounded-full mb-4" style={{ backgroundColor: k.accent }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${k.accent}12` }}>
                <Icon className="w-5 h-5" style={{ color: k.accent }} />
              </div>
              <p className="text-2xl font-black tracking-tight" style={{ color: T_MAIN }}>{k.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.10em] mt-1" style={{ color: T_SUB }}>{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Module cards + Top performers ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module nav cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {NAV_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button key={card.id} onClick={() => onNavigate(card.id)}
                className="group text-left rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
                style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(11,31,58,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = card.accentBorder; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(11,31,58,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: card.accentBg, border: `1px solid ${card.accentBorder}` }}>
                  <Icon className="w-6 h-6" style={{ color: card.accentColor }} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: card.badgeBg, color: card.badgeColor, border: `1px solid ${card.badgeBorder}` }}>
                    {card.badge}
                  </span>
                  <h3 className="text-[14px] font-bold mt-2.5 leading-snug" style={{ color: T_MAIN }}>{card.label}</h3>
                  <p className="text-[11px] font-medium mt-1.5 leading-relaxed" style={{ color: T_MUT }}>{card.description}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-[11px] font-bold" style={{ color: card.accentColor }}>
                  Open module <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Top performers */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
            <div>
              <h3 className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Top Performers</h3>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.65)" }}>Ranked by % achievement</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)", boxShadow: "0 2px 10px rgba(180,83,9,0.40)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#FFFFFF" }} />
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: BG }}>
            {topPerformers.map((rep, i) => (
              <div key={rep.name} className="flex items-center gap-3 px-5 py-3.5 transition-colors"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={
                    i === 0 ? { backgroundColor: "#FEF3C7", color: "#B45309", border: "1.5px solid #FCD34D" } :
                    i === 1 ? { backgroundColor: BG, color: T_MUT, border: `1.5px solid ${BORDER}` } :
                    i === 2 ? { backgroundColor: "#FFF7ED", color: "#92400E", border: "1.5px solid #FDE68A" } :
                               { backgroundColor: BG, color: T_PALE, border: `1.5px solid ${BORDER}` }
                  }>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: T_MAIN }}>{rep.name}</p>
                  <p className="text-[10px] font-medium truncate" style={{ color: T_PALE }}>{rep.line || "—"}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {rep.ach >= 100
                    ? <TrendingUp className="w-3 h-3" style={{ color: "#0E7A4F" }} />
                    : <TrendingDown className="w-3 h-3" style={{ color: "#B91C1C" }} />
                  }
                  <span className="text-[11px] font-black" style={{ color: rep.ach >= 100 ? "#0E7A4F" : "#B91C1C" }}>
                    {rep.ach}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}>
            <button onClick={() => onNavigate("dashboard")}
              className="text-[11px] font-bold flex items-center gap-1 transition-colors"
              style={{ color: BLUE }}
              onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
              onMouseLeave={e => (e.currentTarget.style.color = BLUE)}
            >
              View full dashboard <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
