"use client";

import { useState, useMemo } from "react";
import { comprehensiveData } from "@/data/comprehensiveData";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import { cleanNum } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const RED = "#B91C1C"; const NAVY = "#0B1F3A";

const BUCKETS = [
  { label: "< 90%",    min: 0,   max: 89  },
  { label: "90–94%",  min: 90,  max: 94  },
  { label: "95–99%",  min: 95,  max: 99  },
  { label: "100–104%",min: 100, max: 104 },
  { label: "105–109%",min: 105, max: 109 },
  { label: "110–119%",min: 110, max: 119 },
  { label: "120%+",   min: 120, max: 9999},
];

export default function AnalyticsModule() {
  const [quarter, setQuarter] = useState("all");

  const quarters = useMemo(() => {
    const qs = new Set<string>();
    comprehensiveData.forEach(d => { if (d.Quarter) qs.add(d.Quarter); });
    return Array.from(qs).sort().reverse();
  }, []);

  const filtered = useMemo(() =>
    comprehensiveData.filter(d => quarter === "all" || d.Quarter === quarter),
  [quarter]);

  const analytics = useMemo(() => {
    const reps: { name: string; ach: number; totalInc: number; promoLine: string }[] = [];
    filtered.forEach(d => {
      if (!d.Name?.trim()) return;
      const tAct = cleanNum(d.TotalAct);
      const tPlan = cleanNum(d.TotalPlan);
      if (!tPlan) return;
      const ach = (tAct / tPlan) * 100;
      const input = buildPerformanceInputFromRecord(d);
      const computed = computeSummaryRow(input);
      reps.push({ name: d.Name, ach, totalInc: computed.totalIncentiveLC, promoLine: d.PromoLine });
    });

    const total = reps.length;
    const avgAch = total > 0 ? reps.reduce((s, r) => s + r.ach, 0) / total : 0;
    const totalInc = reps.reduce((s, r) => s + r.totalInc, 0);

    // Distribution buckets
    const distribution = BUCKETS.map(b => ({
      ...b,
      count: reps.filter(r => r.ach >= b.min && r.ach <= b.max).length,
    }));
    const maxBucket = Math.max(...distribution.map(b => b.count), 1);

    // Top/bottom performers
    const sorted = [...reps].sort((a, b) => b.ach - a.ach);
    const top = sorted.slice(0, 5);
    const bottom = sorted.slice(-5).reverse();

    // Percentile stats (pay differentiation)
    const incSorted = [...reps].sort((a, b) => a.totalInc - b.totalInc);
    const p50 = incSorted[Math.floor(incSorted.length * 0.5)]?.totalInc ?? 0;
    const p90 = incSorted[Math.floor(incSorted.length * 0.9)]?.totalInc ?? 0;
    const payDiff = p50 > 0 ? ((p90 / p50) - 1) * 100 : 0;

    // Boom-bust (high ach / low ach rep count)
    const boom = reps.filter(r => r.ach >= 110).length;
    const bust = reps.filter(r => r.ach < 90).length;

    return { total, avgAch, totalInc, distribution, maxBucket, top, bottom, p50, p90, payDiff, boom, bust };
  }, [filtered]);

  const fmt = (v: number) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : Math.round(v).toString();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>Analytics & Reporting</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            Performance distribution · Pay differentiation · Boom-bust quadrant · Bell curve analysis
          </p>
        </div>
        <select value={quarter} onChange={e => setQuarter(e.target.value)}
          className="rounded-lg px-3 py-2 text-[12px] font-medium outline-none"
          style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF" }}>
          <option value="all">All Quarters</option>
          {quarters.map(q => <option key={q}>{q}</option>)}
        </select>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Reps",    value: analytics.total.toString(),               icon: Users,      color: BLUE   },
          { label: "Avg Achievement",value: `${analytics.avgAch.toFixed(1)}%`,       icon: BarChart3,  color: BLUE   },
          { label: "Total Incentive",value: `${fmt(analytics.totalInc)} LC`,          icon: DollarSign, color: GREEN  },
          { label: "Boom (≥110%)",  value: analytics.boom.toString(),                icon: TrendingUp, color: GREEN  },
          { label: "Bust (<90%)",   value: analytics.bust.toString(),                icon: TrendingDown,color: RED   },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl p-4 flex flex-col" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${k.color}12` }}>
                <Icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
              <p className="text-xl font-black" style={{ color: T_MAIN }}>{k.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: T_SUB }}>{k.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bell Curve / Distribution */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: `linear-gradient(90deg, ${NAVY}, #122D5A)` }}>
            <BarChart3 className="w-4 h-4" style={{ color: "rgba(160,191,206,0.80)" }} />
            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(160,191,206,0.80)" }}>
              Performance Distribution (Bell Curve)
            </p>
          </div>
          <div className="p-5 space-y-3" style={{ backgroundColor: "#FFF" }}>
            {analytics.distribution.map(b => {
              const pct = analytics.maxBucket > 0 ? (b.count / analytics.maxBucket) * 100 : 0;
              const color = b.min >= 110 ? GREEN : b.min >= 100 ? BLUE : b.min >= 90 ? AMBER : RED;
              const repPct = analytics.total > 0 ? ((b.count / analytics.total) * 100).toFixed(0) : "0";
              return (
                <div key={b.label} className="grid grid-cols-[80px_1fr_60px_40px] gap-3 items-center">
                  <span className="text-[11px] font-bold text-right" style={{ color: T_SUB }}>{b.label}</span>
                  <div className="h-7 rounded-lg overflow-hidden relative" style={{ backgroundColor: BG }}>
                    <div className="h-full rounded-lg transition-all duration-700 flex items-center px-2"
                      style={{ width: `${pct}%`, backgroundColor: `${color}20`, border: `1px solid ${color}30` }}>
                    </div>
                    {b.count > 0 && (
                      <div className="absolute inset-0 flex items-center px-3">
                        <div className="h-5 rounded" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.18 }} />
                      </div>
                    )}
                  </div>
                  <div className="h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}>
                    <span className="text-[12px] font-black" style={{ color }}>{b.count}</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: T_SUB }}>{repPct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pay Differentiation + Top/Bottom */}
        <div className="flex flex-col gap-4">
          {/* Pay Diff */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Pay Differentiation</p>
            {[
              { label: "Median (P50)",    value: `${fmt(analytics.p50)} LC`, color: BLUE  },
              { label: "90th Pctl (P90)", value: `${fmt(analytics.p90)} LC`, color: GREEN },
              { label: "P90 vs Median",   value: `+${analytics.payDiff.toFixed(0)}%`, color: analytics.payDiff > 50 ? GREEN : AMBER },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-[11px]" style={{ color: T_SUB }}>{s.label}</span>
                <span className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Top 5 */}
          <div className="rounded-xl overflow-hidden flex-1" style={{ border: `1.5px solid ${BORDER}` }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}` }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: GREEN }} />
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Top 5 Performers</p>
            </div>
            <div className="divide-y" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
              {analytics.top.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2 px-4 py-2.5 text-[11px]">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ backgroundColor: i < 3 ? `${GREEN}14` : BG, color: i < 3 ? GREEN : T_SUB, border: `1px solid ${i < 3 ? GREEN : BORDER}30` }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium truncate" style={{ color: T_MAIN }}>{r.name}</span>
                  <span className="font-black" style={{ color: GREEN }}>{r.ach.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}` }}>
              <TrendingDown className="w-3.5 h-3.5" style={{ color: RED }} />
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Needs Attention</p>
            </div>
            <div className="divide-y" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
              {analytics.bottom.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2 px-4 py-2.5 text-[11px]">
                  <span className="flex-1 font-medium truncate" style={{ color: T_MAIN }}>{r.name}</span>
                  <span className="font-black" style={{ color: RED }}>{r.ach.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
