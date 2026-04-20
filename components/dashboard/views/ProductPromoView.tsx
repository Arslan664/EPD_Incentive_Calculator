"use client";

import { useMemo, useState } from "react";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { cleanNum, formatNum } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Package, Layers, BarChart3, ChevronDown } from "lucide-react";

// Portfolio configuration from Input Assumptions sheet (share %)
const PROMO_LINE_PORTFOLIOS: Record<string, Array<{ products: string[]; share: number; color: string }>> = {
  "Line 1": [
    { products: ["CREON", "DUPHALAC"], share: 50, color: "#3b82f6" },
    { products: ["HEPTRAL", "DUSPATALIN"], share: 25, color: "#10b981" },
    { products: ["IRS 19", "IMUDON"], share: 10, color: "#f59e0b" },
    { products: ["GANATON"], share: 15, color: "#8b5cf6" },
  ],
  "Line 2": [
    { products: ["DUPHASTON", "FEMOSTON"], share: 30, color: "#3b82f6" },
    { products: ["PHYSIOTENS", "TRICOR /LIPANTHYL", "OMACOR"], share: 25, color: "#10b981" },
    { products: ["HEPTRAL"], share: 25, color: "#f59e0b" },
    { products: ["BETASERC", "DUPHALAC", "CREON"], share: 20, color: "#8b5cf6" },
  ],
  "Line 2 (big cities)": [
    { products: ["CREON", "DUPHALAC"], share: 10, color: "#3b82f6" },
    { products: ["PHYSIOTENS", "TRICOR /LIPANTHYL", "OMACOR"], share: 30, color: "#10b981" },
    { products: ["HEPTRAL"], share: 30, color: "#f59e0b" },
    { products: ["BETASERC"], share: 30, color: "#8b5cf6" },
  ],
  "Line 3 (big cities)": [
    { products: ["DUPHASTON"], share: 45, color: "#3b82f6" },
    { products: ["FEMOSTON"], share: 25, color: "#10b981" },
    { products: ["DUPHALAC", "OVATEL"], share: 25, color: "#f59e0b" },
    { products: ["CREON"], share: 5, color: "#8b5cf6" },
  ],
  "Pharma line": [
    { products: ["CREON"], share: 40, color: "#3b82f6" },
    { products: ["DUPHALAC"], share: 35, color: "#10b981" },
    { products: ["IRS 19", "IMUDON"], share: 25, color: "#f59e0b" },
  ],
  "Regional Manager-1": [
    { products: ["GASTRO"], share: 50, color: "#3b82f6" },
    { products: ["GYNECOLOGY"], share: 25, color: "#10b981" },
    { products: ["CARDIO-NEURO"], share: 20, color: "#f59e0b" },
    { products: ["IMMUNOLOGY"], share: 5, color: "#8b5cf6" },
  ],
};

interface ProductPromoViewProps {
  data: IncentiveRecord[];
  filters: Filters;
}

export default function ProductPromoView({ data, filters }: ProductPromoViewProps) {
  const [selectedLine, setSelectedLine] = useState("all");
  const [sortBy, setSortBy] = useState<"plan" | "act" | "ach">("plan");

  // Aggregate actual vs plan per product from records
  const productTotals = useMemo(() => {
    const map = new Map<string, { act: number; plan: number; lines: Set<string> }>();

    data.forEach(d => {
      if (!d.Name?.trim()) return;
      const prods = [
        { name: d.P1Name, act: d.P1Act, plan: d.P1Plan },
        { name: d.P2Name, act: d.P2Act, plan: d.P2Plan },
        { name: d.P3Name, act: d.P3Act, plan: d.P3Plan },
      ];
      prods.forEach(p => {
        const name = p.name?.trim();
        if (!name) return;
        const act = cleanNum(p.act);
        const plan = cleanNum(p.plan);
        if (act === 0 && plan === 0) return;
        if (!map.has(name)) map.set(name, { act: 0, plan: 0, lines: new Set() });
        const e = map.get(name)!;
        e.act += act;
        e.plan += plan;
        if (d.PromoLine) e.lines.add(d.PromoLine);
      });
    });

    const rows = Array.from(map.entries()).map(([name, v]) => ({
      name,
      act: v.act,
      plan: v.plan,
      ach: v.plan > 0 ? Math.round((v.act / v.plan) * 100) : 0,
      lines: Array.from(v.lines).sort(),
    }));

    const totalPlan = rows.reduce((s, r) => s + r.plan, 0);
    return rows
      .map(r => ({ ...r, share: totalPlan > 0 ? Math.round((r.plan / totalPlan) * 1000) / 10 : 0 }))
      .sort((a, b) => {
        if (sortBy === "act") return b.act - a.act;
        if (sortBy === "ach") return b.ach - a.ach;
        return b.plan - a.plan;
      });
  }, [data, sortBy]);

  const totalAct  = productTotals.reduce((s, r) => s + r.act,  0);
  const totalPlan = productTotals.reduce((s, r) => s + r.plan, 0);
  const overallAch = totalPlan > 0 ? Math.round((totalAct / totalPlan) * 100) : 0;

  const promoLines = Object.keys(PROMO_LINE_PORTFOLIOS);
  const activeLines = selectedLine === "all" ? promoLines : [selectedLine];

  const achColor = (p: number) =>
    p >= 100 ? "text-emerald-600" : p >= 90 ? "text-amber-600" : "text-rose-600";
  const achBg = (p: number) =>
    p >= 100 ? "bg-emerald-500" : p >= 90 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* Hero Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: String(productTotals.length), sub: "tracked", icon: Package, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-200" },
          { label: "Total Plan (LC)", value: totalPlan >= 1e6 ? (totalPlan/1e6).toFixed(1)+"M" : (totalPlan/1e3).toFixed(0)+"K", sub: "planned revenue", icon: BarChart3, color: "from-slate-600 to-slate-800", shadow: "shadow-slate-200" },
          { label: "Total Actual (LC)", value: totalAct >= 1e6 ? (totalAct/1e6).toFixed(1)+"M" : (totalAct/1e3).toFixed(0)+"K", sub: "actual revenue", icon: TrendingUp, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-200" },
          { label: "Overall Achievement", value: `${overallAch}%`, sub: overallAch >= 100 ? "above target 🎯" : "below target", icon: overallAch >= 100 ? TrendingUp : TrendingDown, color: overallAch >= 100 ? "from-emerald-500 to-green-600" : "from-amber-500 to-orange-600", shadow: overallAch >= 100 ? "shadow-emerald-200": "shadow-amber-200" },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md ${card.shadow}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{card.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Product Performance Breakdown</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Actual vs Planned sales by product across all filtered records</p>
          </div>
          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sort by:</span>
            {[["plan","Plan"] as const, ["act","Actual"] as const, ["ach","Achiev."] as const].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors border",
                  sortBy === k
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[820px]">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 w-[40px]">#</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Product</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Promo Lines</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">Plan (LC)</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-right">Actual (LC)</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 text-center">Achievement</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">Portfolio Share</th>
              </tr>
            </thead>
            <tbody>
              {productTotals.map((row, i) => (
                <tr key={row.name} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{row.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {row.lines.map(l => (
                        <span key={l} className="inline-flex px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-semibold whitespace-nowrap">
                          {l.replace("Regional Manager-1", "RM-1")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-slate-600 font-medium tabular-nums text-sm">{formatNum(Math.round(row.plan))}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-bold tabular-nums text-sm ${row.act >= row.plan ? "text-emerald-700" : "text-slate-800"}`}>
                      {formatNum(Math.round(row.act))}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-black",
                        row.ach >= 100 ? "bg-emerald-100 text-emerald-700" :
                        row.ach >= 90 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {row.ach}%
                      </span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", achBg(row.ach))}
                          style={{ width: `${Math.min(row.ach, 150) / 1.5}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 min-w-[80px]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                          style={{ width: `${Math.min(row.share * 5, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 tabular-nums w-[40px] text-right">{row.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {productTotals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                    No product data available for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio Share Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Portfolio Share Configuration</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Product portfolio weights per Promo Line — from Input Assumptions sheet</p>
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedLine}
              onChange={e => setSelectedLine(e.target.value)}
              className="appearance-none h-9 pl-3 pr-9 bg-white border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-[13px] font-medium text-slate-700 shadow-sm cursor-pointer"
            >
              <option value="all">All Promo Lines</option>
              {promoLines.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeLines.map(line => (
            <div key={line} className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all duration-200">
              {/* Line Header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{line}</span>
              </div>

              {/* Stacked bar visualization */}
              <div className="px-5 py-3">
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {PROMO_LINE_PORTFOLIOS[line]?.map((p, pi) => (
                    <div
                      key={pi}
                      className="h-full rounded-sm first:rounded-l-full last:rounded-r-full transition-all"
                      style={{ width: `${p.share}%`, background: p.color, opacity: 0.85 }}
                      title={`Portfolio ${pi+1}: ${p.products.join(", ")} — ${p.share}%`}
                    />
                  ))}
                </div>
              </div>

              {/* Portfolio breakdown */}
              <div className="px-5 pb-4 space-y-3">
                {PROMO_LINE_PORTFOLIOS[line]?.map((portfolio, pi) => (
                  <div key={pi} className="flex items-start gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-sm mt-1 flex-shrink-0"
                      style={{ background: portfolio.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Portfolio {pi + 1}</span>
                        <span className="text-[11px] font-black" style={{ color: portfolio.color }}>{portfolio.share}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {portfolio.products.map(p => (
                          <span key={p} className="inline-flex px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
