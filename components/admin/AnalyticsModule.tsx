"use client";

import { useState, useMemo } from "react";
import { comprehensiveData } from "@/data/comprehensiveData";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import { cleanNum } from "@/lib/utils";
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Activity,
  GitCompare, Crosshair, Award, AlertTriangle, CheckCircle2, Layers,
  Calendar, ChevronRight, Target, Zap, PieChart, Sigma,
} from "lucide-react";

/* ── Tokens ─────────────────────────────────────────────────────── */
const NAVY   = "#0B1F3A";
const NAVY2  = "#122D5A";
const BLUE   = "#0057A8";
const BORDER = "#D0DCE8";
const BG     = "#F0F4F8";
const T_MAIN = "#0F1827";
const T_SUB  = "#6B8499";
const T_MUT  = "#3D5875";
const GREEN  = "#0E7A4F";
const AMBER  = "#B45309";
const RED    = "#B91C1C";
const PURPLE = "#7C3AED";

/* ── ACH buckets ─────────────────────────────────────────────────── */
const BUCKETS = [
  { label: "< 70%",   min: 0,   max: 69,  tag: "Critical" },
  { label: "70–80%",  min: 70,  max: 79,  tag: "Below"    },
  { label: "80–90%",  min: 80,  max: 89,  tag: "Below"    },
  { label: "90–100%", min: 90,  max: 99,  tag: "Near"     },
  { label: "100–110%",min: 100, max: 109, tag: "On Plan"  },
  { label: "110–120%",min: 110, max: 119, tag: "Above"    },
  { label: "> 120%",  min: 120, max: 9999,tag: "Star"     },
];

function bucketColor(min: number) {
  if (min >= 120) return GREEN;
  if (min >= 110) return "#059669";
  if (min >= 100) return BLUE;
  if (min >= 90)  return AMBER;
  if (min >= 80)  return "#D97706";
  return RED;
}

function achColor(p: number) {
  if (p >= 110) return GREEN;
  if (p >= 100) return BLUE;
  if (p >= 90)  return AMBER;
  return RED;
}

const fmt  = (v: number, d = 0) =>
  v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtM = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
  : `${Math.round(v)}`;

/* ── Bookmarks / sections ───────────────────────────────────────── */
const SECTIONS = [
  { id: "kpis",        label: "KPI Summary",           icon: BarChart3   },
  { id: "dist",        label: "Performance Distribution", icon: Activity  },
  { id: "composition", label: "Composition Analysis",  icon: PieChart    },
  { id: "regression",  label: "Regression Analysis",   icon: Crosshair   },
  { id: "paydiff",     label: "Pay Differentiation",   icon: Sigma       },
  { id: "boombust",    label: "Boom-Bust Analysis",     icon: GitCompare  },
  { id: "equity",      label: "Role Equity",            icon: Layers      },
  { id: "timeline",    label: "IC Timeline",            icon: Calendar    },
];

/* ════════════════════════════════════════════════════════════════ */
export default function AnalyticsModule() {
  const [activeSection, setActiveSection] = useState("kpis");
  const [quarter,       setQuarter]       = useState("all");
  const [year,          setYear]          = useState("all");

  /* ── derive available quarters/years ── */
  const { quarters, years } = useMemo(() => {
    const qs = new Set<string>();
    const ys = new Set<string>();
    comprehensiveData.forEach(d => {
      if (d.Quarter) {
        qs.add(d.Quarter);
        const yr = d.Quarter.split(" ")[1];
        if (yr) ys.add(yr);
      }
    });
    return {
      quarters: Array.from(qs).sort().reverse(),
      years:    Array.from(ys).sort().reverse(),
    };
  }, []);

  const filtered = useMemo(() => {
    return comprehensiveData.filter(d => {
      if (!d.Name?.trim() || !cleanNum(d.TotalPlan)) return false;
      const qMatch = quarter === "all" || d.Quarter === quarter;
      const yMatch = year    === "all" || (d.Quarter ?? "").includes(year);
      return qMatch && yMatch;
    });
  }, [quarter, year]);

  /* ── core rep metrics ── */
  const reps = useMemo(() => {
    return filtered.map(d => {
      const tAct  = cleanNum(d.TotalAct);
      const tPlan = cleanNum(d.TotalPlan);
      const ach   = tPlan > 0 ? (tAct / tPlan) * 100 : 0;
      const input   = buildPerformanceInputFromRecord(d);
      const computed = computeSummaryRow(input);
      const tcfa  = parseInt((d.TCFA_Act ?? "0%").replace("%", "")) || 0;
      return {
        name:     d.Name ?? "",
        ach,
        totalInc: computed.totalIncentiveLC,
        targetInc:cleanNum(d.TargetBase_Sum),
        promoLine:d.PromoLine ?? "",
        position: d.Position ?? "",
        quarter:  d.Quarter  ?? "",
        tcfa,
        tAct,
        tPlan,
      };
    });
  }, [filtered]);

  /* ── kpi summary ── */
  const kpis = useMemo(() => {
    const total     = reps.length;
    const avgAch    = total > 0 ? reps.reduce((s, r) => s + r.ach, 0) / total : 0;
    const totalInc  = reps.reduce((s, r) => s + r.totalInc, 0);
    const boom      = reps.filter(r => r.ach >= 110).length;
    const bust      = reps.filter(r => r.ach < 90).length;
    const onPlan    = reps.filter(r => r.ach >= 100 && r.ach < 110).length;
    const atOrAbove = reps.filter(r => r.ach >= 100).length;
    const pctAbove  = total > 0 ? (atOrAbove / total) * 100 : 0;
    return { total, avgAch, totalInc, boom, bust, onPlan, atOrAbove, pctAbove };
  }, [reps]);

  /* ── distribution ── */
  const distribution = useMemo(() => {
    const buckets = BUCKETS.map(b => ({
      ...b,
      count: reps.filter(r => r.ach >= b.min && r.ach <= b.max).length,
    }));
    const maxCount = Math.max(...buckets.map(b => b.count), 1);
    return { buckets, maxCount };
  }, [reps]);

  /* ── composition (quartiles by incentive earned) ── */
  const composition = useMemo(() => {
    const sorted = [...reps].sort((a, b) => a.totalInc - b.totalInc);
    const n = sorted.length;
    const q4 = sorted.slice(0, Math.floor(n * 0.25));
    const q3 = sorted.slice(Math.floor(n * 0.25), Math.floor(n * 0.5));
    const q2 = sorted.slice(Math.floor(n * 0.5), Math.floor(n * 0.75));
    const q1 = sorted.slice(Math.floor(n * 0.75));
    const avg = (arr: typeof reps) =>
      arr.length ? arr.reduce((s, r) => s + r.totalInc, 0) / arr.length : 0;
    const maxAvg = Math.max(avg(q1), avg(q2), avg(q3), avg(q4), 1);
    return [
      { label: "Q1 (Top 25%)", avg: avg(q1), color: GREEN,  count: q1.length, pct: avg(q1) / maxAvg },
      { label: "Q2 (50–75%)", avg: avg(q2), color: BLUE,   count: q2.length, pct: avg(q2) / maxAvg },
      { label: "Q3 (25–50%)", avg: avg(q3), color: AMBER,  count: q3.length, pct: avg(q3) / maxAvg },
      { label: "Q4 (Bot 25%)", avg: avg(q4), color: RED,    count: q4.length, pct: avg(q4) / maxAvg },
    ];
  }, [reps]);

  /* ── regression (achievement vs incentive, sampled for clarity) ── */
  const regression = useMemo(() => {
    const pts = reps
      .filter(r => r.ach > 0 && r.ach < 300 && r.totalInc > 0)
      .map(r => ({ x: Math.min(r.ach, 200), y: r.totalInc, name: r.name }));
    // Normalize for SVG
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs, 50);  const maxX = Math.max(...xs, 150);
    const minY = Math.min(...ys, 0);   const maxY = Math.max(...ys, 1);
    // Linear regression line
    const n = pts.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    pts.forEach(p => { sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x; });
    const slope = n > 0 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;
    // R²
    const meanY = sumY / n;
    let ssTot = 0, ssRes = 0;
    pts.forEach(p => { const pred = slope * p.x + intercept; ssTot += (p.y - meanY) ** 2; ssRes += (p.y - pred) ** 2; });
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
    const toSvg = (x: number, y: number, W: number, H: number) => ({
      cx: ((x - minX) / (maxX - minX)) * W,
      cy: H - ((y - minY) / (maxY - minY)) * H,
    });
    const lineX1 = minX; const lineY1 = slope * minX + intercept;
    const lineX2 = maxX; const lineY2 = slope * maxX + intercept;
    return { pts, r2, lineX1, lineX2, lineY1, lineY2, minX, maxX, minY, maxY, toSvg };
  }, [reps]);

  /* ── pay differentiation ── */
  const payDiff = useMemo(() => {
    const sorted  = [...reps].sort((a, b) => a.totalInc - b.totalInc);
    const n = sorted.length;
    const p10 = sorted[Math.floor(n * 0.10)]?.totalInc ?? 0;
    const p25 = sorted[Math.floor(n * 0.25)]?.totalInc ?? 0;
    const p50 = sorted[Math.floor(n * 0.50)]?.totalInc ?? 0;
    const p75 = sorted[Math.floor(n * 0.75)]?.totalInc ?? 0;
    const p90 = sorted[Math.floor(n * 0.90)]?.totalInc ?? 0;
    const ratio90to50 = p50 > 0 ? p90 / p50 : 0;
    const bestPractice = ratio90to50 >= 2 && ratio90to50 <= 3;
    const top5  = [...reps].sort((a, b) => b.totalInc - a.totalInc).slice(0, 5);
    const bot5  = [...reps].sort((a, b) => a.totalInc - b.totalInc).slice(0, 5);
    const top5ach = top5.reduce((s, r) => s + r.ach, 0) / (top5.length || 1);
    const bot5ach = bot5.reduce((s, r) => s + r.ach, 0) / (bot5.length || 1);
    return { p10, p25, p50, p75, p90, ratio90to50, bestPractice, top5, bot5, top5ach, bot5ach };
  }, [reps]);

  /* ── boom-bust (needs two consecutive periods) ── */
  const boomBust = useMemo(() => {
    // Group by name, compute avg ach per period (first half vs second half of quarters)
    const byName: Record<string, { ach: number; q: string }[]> = {};
    reps.forEach(r => {
      if (!byName[r.name]) byName[r.name] = [];
      byName[r.name].push({ ach: r.ach, q: r.quarter });
    });
    const qSorted = [...quarters].sort();
    const halfIdx = Math.floor(qSorted.length / 2);
    const period1 = new Set(qSorted.slice(0, halfIdx));
    const period2 = new Set(qSorted.slice(halfIdx));
    const points: { name: string; y1: number; y2: number; quad: number }[] = [];
    Object.entries(byName).forEach(([name, records]) => {
      const r1 = records.filter(r => period1.has(r.q));
      const r2 = records.filter(r => period2.has(r.q));
      if (!r1.length || !r2.length) return;
      const y1 = r1.reduce((s, r) => s + r.ach, 0) / r1.length;
      const y2 = r2.reduce((s, r) => s + r.ach, 0) / r2.length;
      let quad = 0;
      if (y1 >= 100 && y2 >= 100) quad = 2; // Consistently above
      else if (y1 < 100 && y2 >= 100) quad = 1; // Improved (Boom)
      else if (y1 >= 100 && y2 < 100) quad = 3; // Declined (Bust)
      else quad = 4; // Consistently below
      points.push({ name, y1, y2, quad });
    });
    const counts = [0,1,2,3,4].map(q => points.filter(p => p.quad === q).length);
    return { points, counts, period1Label: "Earlier Periods", period2Label: "Recent Periods" };
  }, [reps, quarters]);

  /* ── role equity ── */
  const roleEquity = useMemo(() => {
    const posMap: Record<string, { inc: number[]; ach: number[]; count: number }> = {};
    const lineMap: Record<string, { inc: number[]; ach: number[] }> = {};
    reps.forEach(r => {
      if (!posMap[r.position]) posMap[r.position] = { inc: [], ach: [], count: 0 };
      posMap[r.position].inc.push(r.totalInc);
      posMap[r.position].ach.push(r.ach);
      posMap[r.position].count++;
      if (!lineMap[r.promoLine]) lineMap[r.promoLine] = { inc: [], ach: [] };
      lineMap[r.promoLine].inc.push(r.totalInc);
      lineMap[r.promoLine].ach.push(r.ach);
    });
    const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
    const byPos = Object.entries(posMap).map(([pos, d]) => ({
      pos, avgInc: avg(d.inc), avgAch: avg(d.ach), count: d.count,
    })).sort((a, b) => b.avgInc - a.avgInc);
    const byLine = Object.entries(lineMap).map(([line, d]) => ({
      line, avgInc: avg(d.inc), avgAch: avg(d.ach), count: d.inc.length,
    })).sort((a, b) => b.avgInc - a.avgInc);
    const maxPosInc  = Math.max(...byPos.map(p => p.avgInc), 1);
    const maxLineInc = Math.max(...byLine.map(l => l.avgInc), 1);
    return { byPos, byLine, maxPosInc, maxLineInc };
  }, [reps]);

  /* ════ RENDER ══════════════════════════════════════════════════ */
  const selectStyle = {
    border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF",
    borderRadius: "10px", padding: "7px 12px", fontSize: "12px",
    fontWeight: "700", outline: "none",
  } as React.CSSProperties;

  return (
    <div className="space-y-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl px-7 py-6"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 60%, #152F60 100%)`, boxShadow: "0 8px 40px rgba(11,31,58,0.28)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,87,168,0.28)", color: "#A0BFCE", border: "1px solid rgba(0,87,168,0.35)" }}>
                <BarChart3 className="w-3 h-3" /> Analytics & Reporting
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(14,122,79,0.22)", color: "#86EFAC", border: "1px solid rgba(14,122,79,0.30)" }}>
                ICP Framework
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "#FFF" }}>
              Executive Incentive Analytics
            </h2>
            <p className="mt-1 text-sm font-medium" style={{ color: "rgba(160,191,206,0.70)" }}>
              Performance distribution · Pay differentiation · Boom-bust · Regression · Role equity
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <select value={year}    onChange={e => setYear(e.target.value)}    style={{ ...selectStyle, backgroundColor: "rgba(255,255,255,0.10)", color: "#FFF", border: "1.5px solid rgba(160,191,206,0.25)" }}>
              <option value="all">All Years</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
            <select value={quarter} onChange={e => setQuarter(e.target.value)} style={{ ...selectStyle, backgroundColor: "rgba(255,255,255,0.10)", color: "#FFF", border: "1.5px solid rgba(160,191,206,0.25)" }}>
              <option value="all">All Quarters</option>
              {quarters.map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Bookmark Navigation ── */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
        {SECTIONS.map(sec => {
          const Icon = sec.icon;
          const active = activeSection === sec.id;
          return (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200"
              style={active
                ? { backgroundColor: "#FFF", color: BLUE, boxShadow: "0 1px 8px rgba(11,31,58,0.10)", border: `1px solid ${BORDER}` }
                : { color: T_SUB, border: "1px solid transparent" }
              }>
              <Icon className="w-3.5 h-3.5" />{sec.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION: KPI Summary
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "kpis" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "Total Reps",      value: kpis.total.toString(),          icon: Users,       color: BLUE   },
              { label: "Avg Achievement", value: `${kpis.avgAch.toFixed(1)}%`,   icon: Target,      color: BLUE   },
              { label: "Total Incentive", value: `${fmtM(kpis.totalInc)} LC`,    icon: DollarSign,  color: GREEN  },
              { label: "≥ 100% ACH",      value: kpis.atOrAbove.toString(),      icon: CheckCircle2,color: GREEN  },
              { label: "% At/Above",      value: `${kpis.pctAbove.toFixed(0)}%`, icon: TrendingUp,  color: GREEN  },
              { label: "Boom (≥110%)",    value: kpis.boom.toString(),           icon: Zap,         color: AMBER  },
              { label: "Bust (<90%)",     value: kpis.bust.toString(),           icon: TrendingDown,color: RED    },
            ].map(k => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="rounded-xl p-4 flex flex-col"
                  style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${k.color}12` }}>
                    <Icon className="w-4 h-4" style={{ color: k.color }} />
                  </div>
                  <p className="text-xl font-black" style={{ color: T_MAIN }}>{k.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: T_SUB }}>{k.label}</p>
                </div>
              );
            })}
          </div>

          {/* Best practice benchmark */}
          <div className="rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T_SUB }}>ICP Best Practice Benchmarks</p>
              {[
                { label: "At/Above 100%", val: `${kpis.pctAbove.toFixed(0)}%`, target: "60–70%", ok: kpis.pctAbove >= 60 && kpis.pctAbove <= 70 },
                { label: "Top 10% (Boom)", val: `${kpis.total > 0 ? ((kpis.boom / kpis.total) * 100).toFixed(0) : 0}%`, target: "~10%", ok: kpis.total > 0 && (kpis.boom / kpis.total) * 100 <= 15 },
                { label: "Bust (<90%)",    val: `${kpis.total > 0 ? ((kpis.bust / kpis.total) * 100).toFixed(0) : 0}%`, target: "~10%", ok: kpis.total > 0 && (kpis.bust / kpis.total) * 100 <= 15 },
              ].map(b => (
                <div key={b.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: BG }}>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: T_MAIN }}>{b.label}</p>
                    <p className="text-[9px] font-medium" style={{ color: T_SUB }}>Target: {b.target}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black" style={{ color: b.ok ? GREEN : AMBER }}>{b.val}</span>
                    {b.ok
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />
                      : <AlertTriangle className="w-4 h-4" style={{ color: AMBER }} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T_SUB }}>Distribution Shape Guide</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Ideal (Bell Curve)", desc: "30–40% at target. 60–70% close to target. ~10% top performers.", color: GREEN },
                  { title: "Skewed Below Quota", desc: "Majority below 100%. Quotas may be too high. Reassess targets.", color: AMBER },
                  { title: "Skewed Above Quota", desc: "Most overachieving. Quotas too low or double-crediting issues.", color: PURPLE },
                  { title: "Bi-Modal (Issues)", desc: "Two peaks. Employees in different jobs or quota allocation problems.", color: RED },
                ].map(g => (
                  <div key={g.title} className="rounded-lg p-3" style={{ backgroundColor: `${g.color}08`, border: `1px solid ${g.color}22` }}>
                    <p className="text-[11px] font-black" style={{ color: g.color }}>{g.title}</p>
                    <p className="text-[10px] font-medium mt-1" style={{ color: T_MUT }}>{g.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: Performance Distribution
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "dist" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Main distribution chart */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${BORDER}`, boxShadow: "0 2px 16px rgba(11,31,58,0.07)" }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <div>
                  <p className="text-[14px] font-black text-white">Performance Distribution</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                    Bell curve analysis · {reps.length} reps · Is the plan rewarding performance correctly?
                  </p>
                </div>
                <Activity className="w-5 h-5" style={{ color: "rgba(160,191,206,0.70)" }} />
              </div>
              <div className="p-6 space-y-3" style={{ backgroundColor: "#FFF" }}>
                {distribution.buckets.map(b => {
                  const pct = (b.count / distribution.maxCount) * 100;
                  const repPct = reps.length > 0 ? ((b.count / reps.length) * 100).toFixed(0) : "0";
                  const col = bucketColor(b.min);
                  return (
                    <div key={b.label} className="grid items-center gap-3" style={{ gridTemplateColumns: "90px 1fr 52px 40px" }}>
                      <span className="text-[11px] font-bold text-right" style={{ color: T_SUB }}>{b.label}</span>
                      <div className="relative h-8 rounded-xl overflow-hidden" style={{ backgroundColor: BG }}>
                        <div className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: `${col}25`, border: `1px solid ${col}35` }} />
                        <div className="absolute inset-y-1 left-0 rounded-lg transition-all duration-700"
                          style={{ width: `${pct * 0.85}%`, background: `linear-gradient(90deg, ${col}55, ${col}20)` }} />
                        <div className="absolute inset-0 flex items-center px-3">
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: col, opacity: 0.70 }} />
                        </div>
                      </div>
                      <div className="h-8 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${col}12`, border: `1px solid ${col}28` }}>
                        <span className="text-[12px] font-black" style={{ color: col }}>{b.count}</span>
                      </div>
                      <span className="text-[10px] font-bold text-center" style={{ color: T_SUB }}>{repPct}%</span>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-3 flex flex-wrap gap-4"
                style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}>
                {[
                  { label: "< 90% (Below)", color: RED },
                  { label: "90–100% (Near)", color: AMBER },
                  { label: "100–110% (On Plan)", color: BLUE },
                  { label: "> 110% (Star)", color: GREEN },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[10px] font-medium" style={{ color: T_SUB }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats panel */}
            <div className="space-y-4">
              {/* Percentile breakdown */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: T_SUB }}>
                  Percentile Snapshot
                </p>
                {[
                  { pct: "10th", val: reps.length > 0 ? [...reps].sort((a, b) => a.ach - b.ach)[Math.floor(reps.length * 0.10)]?.ach ?? 0 : 0 },
                  { pct: "25th", val: reps.length > 0 ? [...reps].sort((a, b) => a.ach - b.ach)[Math.floor(reps.length * 0.25)]?.ach ?? 0 : 0 },
                  { pct: "50th", val: reps.length > 0 ? [...reps].sort((a, b) => a.ach - b.ach)[Math.floor(reps.length * 0.50)]?.ach ?? 0 : 0 },
                  { pct: "75th", val: reps.length > 0 ? [...reps].sort((a, b) => a.ach - b.ach)[Math.floor(reps.length * 0.75)]?.ach ?? 0 : 0 },
                  { pct: "90th", val: reps.length > 0 ? [...reps].sort((a, b) => a.ach - b.ach)[Math.floor(reps.length * 0.90)]?.ach ?? 0 : 0 },
                ].map(p => {
                  const col = achColor(p.val);
                  const barW = Math.min(p.val, 150) / 1.5;
                  return (
                    <div key={p.pct} className="mb-3">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span style={{ color: T_SUB }}>{p.pct} Percentile</span>
                        <span style={{ color: col }}>{p.val.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barW}%`, backgroundColor: col }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 90th % guideline */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: T_SUB }}>
                  90th Pctl Benchmark
                </p>
                <div className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: `${BLUE}08`, border: `1px solid ${BLUE}20` }}>
                  <p className="text-[28px] font-black" style={{ color: BLUE }}>
                    {reps.length > 0
                      ? `${([...reps].sort((a, b) => a.ach - b.ach)[Math.floor(reps.length * 0.90)]?.ach ?? 0).toFixed(0)}%`
                      : "—"}
                  </p>
                  <p className="text-[10px] font-bold mt-1" style={{ color: T_SUB }}>90th Percentile ACH</p>
                </div>
                <p className="text-[10px] font-medium mt-3 leading-relaxed" style={{ color: T_MUT }}>
                  ICP Best Practice: Note where 90th percentile ranks. Ideally 65%+ of reps meet or exceed quota.
                </p>
              </div>
            </div>
          </div>

          {/* Top / Bottom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "Top 10 Performers", data: [...reps].sort((a, b) => b.ach - a.ach).slice(0, 10), isTop: true },
              { title: "Needs Attention (Bottom 10)", data: [...reps].sort((a, b) => a.ach - b.ach).slice(0, 10), isTop: false },
            ].map(panel => (
              <div key={panel.title} className="rounded-2xl overflow-hidden"
                style={{ border: `1.5px solid ${BORDER}` }}>
                <div className="px-4 py-3 flex items-center gap-2"
                  style={{ backgroundColor: panel.isTop ? `${GREEN}10` : `${RED}10`, borderBottom: `1px solid ${BORDER}` }}>
                  {panel.isTop ? <TrendingUp className="w-4 h-4" style={{ color: GREEN }} /> : <TrendingDown className="w-4 h-4" style={{ color: RED }} />}
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: panel.isTop ? GREEN : RED }}>{panel.title}</p>
                </div>
                <div className="divide-y" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
                  {panel.data.map((r, i) => (
                    <div key={r.name + i} className="flex items-center gap-3 px-4 py-2.5"
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                        style={{ backgroundColor: i < 3 ? `${panel.isTop ? GREEN : RED}14` : BG, color: panel.isTop ? GREEN : RED, border: `1px solid ${panel.isTop ? GREEN : RED}30` }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-[11px] font-medium truncate" style={{ color: T_MAIN }}>{r.name}</span>
                      <span className="text-[11px] font-bold text-right" style={{ color: T_SUB }}>{r.promoLine}</span>
                      <span className="text-[12px] font-black w-12 text-right" style={{ color: achColor(r.ach) }}>
                        {r.ach.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: Composition Analysis
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "composition" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Quartile composition bars */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <p className="text-[14px] font-black text-white">Pay Composition by Quartile</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                  Avg incentive LC earned per earnings quartile
                </p>
              </div>
              <div className="p-6 space-y-4" style={{ backgroundColor: "#FFF" }}>
                {composition.map(q => (
                  <div key={q.label}>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span style={{ color: T_MAIN }}>{q.label}</span>
                      <span style={{ color: q.color }}>{fmtM(q.avg)} LC avg · {q.count} reps</span>
                    </div>
                    <div className="h-8 rounded-xl overflow-hidden relative" style={{ backgroundColor: BG }}>
                      <div className="h-full rounded-xl transition-all duration-700 flex items-center px-3"
                        style={{ width: `${q.pct * 100}%`, background: `linear-gradient(90deg, ${q.color}, ${q.color}AA)` }}>
                        <span className="text-[10px] font-black text-white truncate">
                          {fmtM(q.avg)} LC
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: BG }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: T_SUB }}>
                    What This Tells Us
                  </p>
                  <p className="text-[11px] font-medium leading-relaxed" style={{ color: T_MUT }}>
                    Composition analysis shows how your sales force earns incentive dollars across performance quartiles.
                    Top quartile should earn significantly more than bottom to reward excellence.
                  </p>
                </div>
              </div>
            </div>

            {/* By promo line */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <p className="text-[14px] font-black text-white">Avg Incentive by Promo Line</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                  Cross-line incentive equity comparison
                </p>
              </div>
              <div className="p-5 space-y-3" style={{ backgroundColor: "#FFF" }}>
                {roleEquity.byLine.map((l, i) => {
                  const cols = [BLUE, GREEN, PURPLE, AMBER, RED, T_MUT];
                  const col = cols[i % cols.length];
                  const pct = (l.avgInc / roleEquity.maxLineInc) * 100;
                  return (
                    <div key={l.line}>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span style={{ color: T_MAIN }}>{l.line || "—"}</span>
                        <span style={{ color: col }}>{fmtM(l.avgInc)} LC · {l.avgAch.toFixed(0)}% ACH</span>
                      </div>
                      <div className="h-6 rounded-lg overflow-hidden" style={{ backgroundColor: BG }}>
                        <div className="h-full rounded-lg transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: `${col}70` }} />
                      </div>
                      <p className="text-[9px] font-medium mt-0.5" style={{ color: T_SUB }}>{l.count} reps</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* TCFA Composition */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <p className="text-[13px] font-black mb-4" style={{ color: T_MAIN }}>TCFA Score Distribution</p>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "< 80%", min: 0, max: 79, color: RED },
                { label: "80–89%", min: 80, max: 89, color: AMBER },
                { label: "90–94%", min: 90, max: 94, color: "#D97706" },
                { label: "95–99%", min: 95, max: 99, color: BLUE },
                { label: "100%", min: 100, max: 100, color: GREEN },
              ].map(b => {
                const count = reps.filter(r => r.tcfa >= b.min && r.tcfa <= b.max).length;
                const pct = reps.length > 0 ? ((count / reps.length) * 100).toFixed(0) : "0";
                return (
                  <div key={b.label} className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: `${b.color}08`, border: `1.5px solid ${b.color}25` }}>
                    <p className="text-[22px] font-black" style={{ color: b.color }}>{count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: T_SUB }}>{b.label}</p>
                    <p className="text-[10px] font-medium" style={{ color: T_MUT }}>{pct}% of reps</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: Regression Analysis
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "regression" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Scatter plot (SVG) */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <div>
                  <p className="text-[14px] font-black text-white">Regression: ACH% vs Incentive LC</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                    Tighter cluster = stronger pay-performance correlation
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg text-[11px] font-black"
                  style={{ backgroundColor: regression.r2 >= 0.6 ? `${GREEN}28` : `${AMBER}28`, color: regression.r2 >= 0.6 ? "#86EFAC" : "#FCD34D" }}>
                  R² = {regression.r2.toFixed(2)}
                </div>
              </div>
              <div className="p-5" style={{ backgroundColor: "#FFF" }}>
                <svg viewBox="0 0 560 300" className="w-full" style={{ height: "280px" }}>
                  {/* Grid lines */}
                  {[0,1,2,3,4].map(i => (
                    <line key={i} x1="40" y1={40 + i * 50} x2="540" y2={40 + i * 50}
                      stroke={BORDER} strokeWidth="1" strokeDasharray="4,4" />
                  ))}
                  {[0,1,2,3,4,5,6].map(i => (
                    <line key={i} x1={40 + i * 71} y1="40" x2={40 + i * 71} y2="280"
                      stroke={BORDER} strokeWidth="1" strokeDasharray="4,4" />
                  ))}
                  {/* Regression line */}
                  {regression.pts.length > 2 && (() => {
                    const W = 500; const H = 240;
                    const sx1 = 40 + ((regression.lineX1 - regression.minX) / Math.max(regression.maxX - regression.minX, 1)) * W;
                    const sy1 = 280 - ((Math.max(regression.lineY1, regression.minY) - regression.minY) / Math.max(regression.maxY - regression.minY, 1)) * H;
                    const sx2 = 40 + ((regression.lineX2 - regression.minX) / Math.max(regression.maxX - regression.minX, 1)) * W;
                    const sy2 = 280 - ((Math.max(regression.lineY2, regression.minY) - regression.minY) / Math.max(regression.maxY - regression.minY, 1)) * H;
                    return <line x1={sx1} y1={Math.max(40, Math.min(280, sy1))} x2={sx2} y2={Math.max(40, Math.min(280, sy2))} stroke={BLUE} strokeWidth="2" strokeDasharray="6,3" />;
                  })()}
                  {/* Data points */}
                  {regression.pts.slice(0, 200).map((p, i) => {
                    const W = 500; const H = 240;
                    const cx = 40 + ((p.x - regression.minX) / Math.max(regression.maxX - regression.minX, 1)) * W;
                    const cy = 280 - ((p.y - regression.minY) / Math.max(regression.maxY - regression.minY, 1)) * H;
                    const col = achColor(p.x);
                    return (
                      <circle key={i} cx={Math.min(540, Math.max(40, cx))} cy={Math.min(280, Math.max(40, cy))}
                        r="4" fill={col} fillOpacity="0.55" stroke={col} strokeWidth="1" strokeOpacity="0.8">
                        <title>{p.name}: ACH {p.x.toFixed(0)}%</title>
                      </circle>
                    );
                  })}
                  {/* Axis labels */}
                  <text x="300" y="296" textAnchor="middle" fontSize="9" fill={T_SUB}>Achievement % of Target</text>
                  <text x="12" y="160" textAnchor="middle" fontSize="9" fill={T_SUB} transform="rotate(-90,12,160)">Incentive LC</text>
                  {/* 100% line */}
                  {(() => {
                    const W = 500;
                    const cx = 40 + ((100 - regression.minX) / Math.max(regression.maxX - regression.minX, 1)) * W;
                    return cx >= 40 && cx <= 540 ? (
                      <line x1={cx} y1="40" x2={cx} y2="280" stroke={GREEN} strokeWidth="1.5" strokeDasharray="3,3" />
                    ) : null;
                  })()}
                </svg>
                <p className="text-[10px] font-medium mt-2 text-center" style={{ color: T_SUB }}>
                  Green dashed = 100% target. Blue dashed = trend line. R² {regression.r2 >= 0.6 ? "≥ 0.6 indicates strong correlation ✓" : "< 0.6 — review plan parameters"}
                </p>
              </div>
            </div>

            {/* Regression insights */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: T_SUB }}>
                  Correlation Strength
                </p>
                <div className="text-center py-4">
                  <p className="text-[40px] font-black" style={{ color: regression.r2 >= 0.6 ? GREEN : AMBER }}>
                    {regression.r2.toFixed(2)}
                  </p>
                  <p className="text-[11px] font-bold" style={{ color: T_SUB }}>R² Coefficient</p>
                  <p className="text-[10px] font-medium mt-1"
                    style={{ color: regression.r2 >= 0.6 ? GREEN : AMBER }}>
                    {regression.r2 >= 0.8 ? "Very Strong" : regression.r2 >= 0.6 ? "Strong" : regression.r2 >= 0.4 ? "Moderate" : "Weak"}
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { range: "0.80–1.00", label: "Very Strong", color: GREEN },
                    { range: "0.60–0.79", label: "Strong",      color: BLUE  },
                    { range: "0.40–0.59", label: "Moderate",    color: AMBER },
                    { range: "< 0.40",   label: "Weak",         color: RED   },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between rounded-lg px-3 py-2"
                      style={{ backgroundColor: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                      <span className="text-[10px] font-bold" style={{ color: T_SUB }}>{s.range}</span>
                      <span className="text-[10px] font-black" style={{ color: s.color }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: T_SUB }}>
                  Interpretation Guide
                </p>
                <p className="text-[10px] font-medium leading-relaxed" style={{ color: T_MUT }}>
                  Points should cluster in a linear fashion. Data points "off the line" should be investigated — they indicate individuals being paid outside plan parameters.
                </p>
                <div className="mt-3 rounded-xl p-3"
                  style={{ backgroundColor: regression.r2 >= 0.6 ? `${GREEN}08` : `${AMBER}08`, border: `1px solid ${regression.r2 >= 0.6 ? GREEN : AMBER}22` }}>
                  <p className="text-[11px] font-bold" style={{ color: regression.r2 >= 0.6 ? GREEN : AMBER }}>
                    {regression.r2 >= 0.6 ? "✓ Pay-performance link is strong" : "⚠ Review plan parameters"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: Pay Differentiation
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "paydiff" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Percentile waterfall */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <p className="text-[14px] font-black text-white">Pay Differentiation Analysis</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                  Best practice: 90th percentile earns 2–3× the median (P50)
                </p>
              </div>
              <div className="p-6" style={{ backgroundColor: "#FFF" }}>
                {[
                  { label: "P10 (10th Pctl)", val: payDiff.p10, color: RED,    pct: payDiff.p50 > 0 ? payDiff.p10 / payDiff.p90 : 0 },
                  { label: "P25 (25th Pctl)", val: payDiff.p25, color: AMBER,  pct: payDiff.p50 > 0 ? payDiff.p25 / payDiff.p90 : 0 },
                  { label: "P50 (Median)",    val: payDiff.p50, color: BLUE,   pct: payDiff.p50 > 0 ? payDiff.p50 / payDiff.p90 : 0 },
                  { label: "P75 (75th Pctl)", val: payDiff.p75, color: "#059669", pct: payDiff.p50 > 0 ? payDiff.p75 / payDiff.p90 : 0 },
                  { label: "P90 (Top 10%)",   val: payDiff.p90, color: GREEN,  pct: 1 },
                ].map(p => (
                  <div key={p.label} className="mb-4">
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span style={{ color: T_MAIN }}>{p.label}</span>
                      <span style={{ color: p.color }}>{fmtM(p.val)} LC</span>
                    </div>
                    <div className="h-8 rounded-xl overflow-hidden" style={{ backgroundColor: BG }}>
                      <div className="h-full rounded-xl transition-all duration-700 flex items-center px-3"
                        style={{ width: `${p.pct * 100}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}AA)` }}>
                        <span className="text-[10px] font-black text-white">
                          {fmtM(p.val)} LC
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* P90/P50 ratio badge */}
                <div className="mt-5 rounded-xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: payDiff.bestPractice ? `${GREEN}08` : `${AMBER}08`, border: `1.5px solid ${payDiff.bestPractice ? GREEN : AMBER}28` }}>
                  <div>
                    <p className="text-[13px] font-black" style={{ color: payDiff.bestPractice ? GREEN : AMBER }}>
                      P90/P50 Ratio: {payDiff.ratio90to50.toFixed(1)}×
                    </p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: T_MUT }}>
                      {payDiff.bestPractice ? "✓ Within best practice range (2–3×)" : "Best practice: 2–3× ratio recommended"}
                    </p>
                  </div>
                  {payDiff.bestPractice
                    ? <CheckCircle2 className="w-6 h-6" style={{ color: GREEN }} />
                    : <AlertTriangle className="w-6 h-6" style={{ color: AMBER }} />}
                </div>
              </div>
            </div>

            {/* Top/Bottom earners */}
            <div className="space-y-4">
              {[
                { title: "Top 5 Earners",    data: payDiff.top5, isTop: true,  avgAch: payDiff.top5ach },
                { title: "Bottom 5 Earners", data: payDiff.bot5, isTop: false, avgAch: payDiff.bot5ach },
              ].map(panel => (
                <div key={panel.title} className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
                  <div className="px-4 py-3 flex items-center gap-2"
                    style={{ backgroundColor: panel.isTop ? `${GREEN}10` : `${RED}10`, borderBottom: `1px solid ${BORDER}` }}>
                    {panel.isTop ? <Award className="w-4 h-4" style={{ color: GREEN }} /> : <TrendingDown className="w-4 h-4" style={{ color: RED }} />}
                    <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: panel.isTop ? GREEN : RED }}>{panel.title}</p>
                  </div>
                  <div className="divide-y" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
                    {panel.data.map((r, i) => (
                      <div key={r.name + i} className="flex items-center gap-2 px-4 py-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                          style={{ backgroundColor: `${panel.isTop ? GREEN : RED}14`, color: panel.isTop ? GREEN : RED }}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-[11px] font-medium truncate" style={{ color: T_MAIN }}>{r.name}</span>
                        <span className="text-[11px] font-black" style={{ color: panel.isTop ? GREEN : RED }}>
                          {fmtM(r.totalInc)} LC
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between"
                    style={{ backgroundColor: BG, borderTop: `1px solid ${BORDER}` }}>
                    <span className="text-[10px] font-bold" style={{ color: T_SUB }}>Avg ACH</span>
                    <span className="text-[12px] font-black" style={{ color: achColor(panel.avgAch) }}>
                      {panel.avgAch.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: Boom-Bust Analysis
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "boombust" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Quadrant scatter */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <p className="text-[14px] font-black text-white">Boom-Bust Quadrant Chart</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                  Earlier periods (X) vs Recent periods (Y) · Target line = 100%
                </p>
              </div>
              <div className="p-5" style={{ backgroundColor: "#FFF" }}>
                <svg viewBox="0 0 520 320" className="w-full" style={{ height: "300px" }}>
                  {/* Quadrant backgrounds */}
                  <rect x="50" y="30" width="220" height="130" fill={`${RED}06`} />
                  <rect x="270" y="30" width="220" height="130" fill={`${GREEN}06`} />
                  <rect x="50" y="160" width="220" height="130" fill={`${RED}04`} />
                  <rect x="270" y="160" width="220" height="130" fill={`${BLUE}06`} />
                  {/* Grid */}
                  <line x1="50" y1="160" x2="490" y2="160" stroke={NAVY} strokeWidth="1.5" />
                  <line x1="270" y1="30" x2="270" y2="290" stroke={NAVY} strokeWidth="1.5" />
                  {/* Quadrant labels */}
                  {[
                    { x: 160, y: 45, text: "III — Declined", color: RED },
                    { x: 380, y: 45, text: "II — Consistently Above", color: GREEN },
                    { x: 160, y: 280, text: "IV — Consistently Below", color: T_SUB },
                    { x: 380, y: 280, text: "I — Improved (Boom)", color: BLUE },
                  ].map(l => (
                    <text key={l.text} x={l.x} y={l.y} textAnchor="middle" fontSize="8.5" fill={l.color} fontWeight="700">{l.text}</text>
                  ))}
                  {/* Points */}
                  {boomBust.points.slice(0, 150).map((p, i) => {
                    const cx = 50  + ((Math.min(p.y1, 200)) / 200) * 440;
                    const cy = 290 - ((Math.min(p.y2, 200)) / 200) * 260;
                    const col = p.quad === 2 ? GREEN : p.quad === 1 ? BLUE : p.quad === 3 ? RED : T_MUT;
                    return (
                      <circle key={i} cx={Math.min(490, Math.max(50, cx))} cy={Math.min(290, Math.max(30, cy))}
                        r="4.5" fill={col} fillOpacity="0.55" stroke={col} strokeWidth="1">
                        <title>{p.name}: Yr1 {p.y1.toFixed(0)}% → Yr2 {p.y2.toFixed(0)}%</title>
                      </circle>
                    );
                  })}
                  <text x="270" y="308" textAnchor="middle" fontSize="9" fill={T_SUB}>Earlier Period % of Target</text>
                  <text x="18" y="165" textAnchor="middle" fontSize="9" fill={T_SUB} transform="rotate(-90,18,165)">Recent Period % of Target</text>
                </svg>
              </div>
            </div>

            {/* Quadrant summary */}
            <div className="space-y-4">
              {[
                { quad: 2, label: "Consistently Above", sublabel: "Star performers", color: GREEN,  icon: Award        },
                { quad: 1, label: "Improved (Boom)",    sublabel: "Rising reps",     color: BLUE,   icon: TrendingUp   },
                { quad: 3, label: "Declined (Bust)",    sublabel: "Needs coaching",  color: RED,    icon: TrendingDown },
                { quad: 4, label: "Consistently Below", sublabel: "Intervention",    color: T_MUT,  icon: AlertTriangle},
              ].map(q => {
                const count = boomBust.points.filter(p => p.quad === q.quad).length;
                const pct = boomBust.points.length > 0 ? ((count / boomBust.points.length) * 100).toFixed(0) : "0";
                const Icon = q.icon;
                return (
                  <div key={q.quad} className="rounded-xl p-4 flex items-center gap-4"
                    style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${q.color}12`, border: `1px solid ${q.color}28` }}>
                      <Icon className="w-5 h-5" style={{ color: q.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black" style={{ color: T_MAIN }}>{q.label}</p>
                      <p className="text-[10px] font-medium" style={{ color: T_SUB }}>{q.sublabel}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[20px] font-black" style={{ color: q.color }}>{count}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T_SUB }}>{pct}%</p>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-xl p-4" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: T_SUB }}>
                  What This Tells Us
                </p>
                <p className="text-[10px] font-medium leading-relaxed" style={{ color: T_MUT }}>
                  Consistent year-over-year performance lands in Quadrants II and IV. Points in I/III indicate inconsistency — investigate whether the plan rewards consistent results.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: Role Equity
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "equity" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* By Position */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <p className="text-[14px] font-black text-white">Pay by Position (Internal Equity)</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                  As roles go senior, pay should naturally progress
                </p>
              </div>
              <div className="p-5 space-y-5" style={{ backgroundColor: "#FFF" }}>
                {roleEquity.byPos.map((p, i) => {
                  const cols = [GREEN, BLUE, AMBER, PURPLE];
                  const col = cols[i % cols.length];
                  const barW = (p.avgInc / roleEquity.maxPosInc) * 100;
                  return (
                    <div key={p.pos}>
                      <div className="flex justify-between items-baseline mb-2">
                        <p className="text-[12px] font-black" style={{ color: T_MAIN }}>{p.pos}</p>
                        <p className="text-[11px] font-bold" style={{ color: col }}>{fmtM(p.avgInc)} LC avg</p>
                      </div>
                      <div className="h-8 rounded-xl overflow-hidden" style={{ backgroundColor: BG }}>
                        <div className="h-full rounded-xl transition-all duration-700 flex items-center px-3"
                          style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${col}, ${col}AA)` }}>
                          <span className="text-[10px] font-black text-white">{fmtM(p.avgInc)} LC</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-1.5">
                        <p className="text-[10px] font-medium" style={{ color: T_SUB }}>{p.count} reps</p>
                        <p className="text-[10px] font-medium" style={{ color: T_SUB }}>Avg ACH: {p.avgAch.toFixed(0)}%</p>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-xl p-4 mt-2" style={{ backgroundColor: BG }}>
                  <p className="text-[10px] font-medium leading-relaxed" style={{ color: T_MUT }}>
                    As roles progress from Medical Rep → Regional Manager, there should be a natural progression in both target incentive and actual earnings.
                  </p>
                </div>
              </div>
            </div>

            {/* By Promo Line */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
              <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})` }}>
                <p className="text-[14px] font-black text-white">Pay Equity by Promo Line</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                  Cross-line parity check — similar effort should yield similar reward
                </p>
              </div>
              <div className="p-5 space-y-5" style={{ backgroundColor: "#FFF" }}>
                {roleEquity.byLine.map((l, i) => {
                  const cols = [BLUE, GREEN, PURPLE, AMBER, RED, T_MUT];
                  const col = cols[i % cols.length];
                  const barW = (l.avgInc / roleEquity.maxLineInc) * 100;
                  return (
                    <div key={l.line}>
                      <div className="flex justify-between items-baseline mb-2">
                        <p className="text-[12px] font-black" style={{ color: T_MAIN }}>{l.line || "—"}</p>
                        <p className="text-[11px] font-bold" style={{ color: col }}>{fmtM(l.avgInc)} LC avg</p>
                      </div>
                      <div className="h-8 rounded-xl overflow-hidden" style={{ backgroundColor: BG }}>
                        <div className="h-full rounded-xl transition-all duration-700 flex items-center px-3"
                          style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${col}, ${col}AA)` }}>
                          <span className="text-[10px] font-black text-white">{fmtM(l.avgInc)} LC</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-1.5">
                        <p className="text-[10px] font-medium" style={{ color: T_SUB }}>{l.count} reps</p>
                        <p className="text-[10px] font-medium" style={{ color: T_SUB }}>Avg ACH: {l.avgAch.toFixed(0)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION: IC Timeline
      ═══════════════════════════════════════════════════════════ */}
      {activeSection === "timeline" && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
            <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
              <p className="text-[16px] font-black text-white">IC Process Timeline</p>
              <p className="text-[11px] font-medium mt-1" style={{ color: "rgba(160,191,206,0.70)" }}>
                Annual incentive cycle milestones — per ICP framework
              </p>
            </div>
            <div className="p-6" style={{ backgroundColor: "#FFF" }}>

              {/* Month grid */}
              <div className="grid grid-cols-12 gap-2 mb-6">
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <div key={m} className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: T_SUB }}>{m}</p>
                    <div className="h-8 rounded-xl" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
                      <p className="text-[9px] font-bold flex items-center justify-center h-full" style={{ color: T_MUT }}>Q{Math.ceil((i+1)/3)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline events */}
              <div className="space-y-4">
                {[
                  {
                    activity: "Sales Quotas & SFE KPIs Target Setting & Communication",
                    timing: "By the beginning of each quarter",
                    months: [0, 3, 6, 9], // Jan, Apr, Jul, Oct
                    color: BLUE,
                    icon: Target,
                    detail: "Targets should be set and communicated to the sales force before each quarter begins.",
                  },
                  {
                    activity: "Sales & SFE KPIs Performance IC Evaluation",
                    timing: "By end of the month following previous quarter",
                    months: [1, 4, 7, 10], // Feb, May, Aug, Nov
                    color: PURPLE,
                    icon: Activity,
                    detail: "Evaluate previous quarter results. Compare actuals to targets across all measures.",
                  },
                  {
                    activity: "IC Analysis Communication & Q&A / Feedback Collection",
                    timing: "Within last month of each quarter",
                    months: [2, 5, 8, 11], // Mar, Jun, Sep, Dec
                    color: AMBER,
                    icon: Users,
                    detail: "Share results with sales force. Collect feedback and answer questions about calculations.",
                  },
                  {
                    activity: "Incentives Payout",
                    timing: "Within 60 days after quarter-end, or 30 days from In-Market data availability",
                    months: [2, 5, 8, 11],
                    color: GREEN,
                    icon: DollarSign,
                    detail: "Process and distribute incentive payments. Confirm all compliance requirements met.",
                  },
                ].map(evt => {
                  const Icon = evt.icon;
                  return (
                    <div key={evt.activity} className="rounded-xl overflow-hidden"
                      style={{ border: `1.5px solid ${evt.color}28` }}>
                      <div className="px-5 py-3 flex items-center gap-4"
                        style={{ backgroundColor: `${evt.color}08` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${evt.color}18`, border: `1px solid ${evt.color}30` }}>
                          <Icon className="w-4.5 h-4.5" style={{ color: evt.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-black" style={{ color: T_MAIN }}>{evt.activity}</p>
                          <p className="text-[10px] font-medium" style={{ color: T_SUB }}>{evt.timing}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {evt.months.map(m => (
                            <span key={m} className="text-[9px] font-black px-2 py-1 rounded-md"
                              style={{ backgroundColor: `${evt.color}20`, color: evt.color }}>
                              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="px-5 py-2.5" style={{ backgroundColor: "#FFF" }}>
                        <p className="text-[10px] font-medium" style={{ color: T_MUT }}>{evt.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quarterly cycle summary */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"].map((q, i) => {
                  const qReps = reps.filter(r => r.quarter?.startsWith(`Q${i+1}`));
                  const avgAch = qReps.length > 0 ? qReps.reduce((s, r) => s + r.ach, 0) / qReps.length : 0;
                  const totalInc = qReps.reduce((s, r) => s + r.totalInc, 0);
                  const col = [BLUE, PURPLE, GREEN, AMBER][i];
                  return (
                    <div key={q} className="rounded-xl p-4" style={{ backgroundColor: `${col}08`, border: `1.5px solid ${col}25` }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: col }}>{q}</p>
                      <p className="text-[18px] font-black" style={{ color: T_MAIN }}>{avgAch.toFixed(0)}%</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T_SUB }}>Avg ACH</p>
                      <p className="text-[11px] font-bold mt-1" style={{ color: col }}>{fmtM(totalInc)} LC</p>
                      <p className="text-[9px] font-medium" style={{ color: T_SUB }}>Total Incentive · {qReps.length} reps</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
