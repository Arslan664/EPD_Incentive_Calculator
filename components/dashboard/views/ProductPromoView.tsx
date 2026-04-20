"use client";

import { useMemo, useState } from "react";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { cleanNum, formatNum } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Static promo line → product portfolio configuration derived from Input_Assumptions sheet
// Each entry maps promo line name → portfolios with products and their % share
const PROMO_LINE_PORTFOLIOS: Record<string, Array<{ products: string[]; share: number }>> = {
  "Line 1": [
    { products: ["CREON", "DUPHALAC"], share: 50 },
    { products: ["HEPTRAL", "DUSPATALIN"], share: 25 },
    { products: ["IRS 19", "IMUDON"], share: 10 },
    { products: ["GANATON"], share: 15 },
  ],
  "Line 2": [
    { products: ["DUPHASTON", "FEMOSTON"], share: 30 },
    { products: ["PHYSIOTENS", "TRICOR /LIPANTHYL", "OMACOR"], share: 25 },
    { products: ["HEPTRAL"], share: 25 },
    { products: ["BETASERC", "DUPHALAC", "CREON"], share: 20 },
  ],
  "Line 2 (big cities)": [
    { products: ["CREON", "DUPHALAC"], share: 10 },
    { products: ["PHYSIOTENS", "TRICOR /LIPANTHYL", "OMACOR"], share: 30 },
    { products: ["HEPTRAL"], share: 30 },
    { products: ["BETASERC"], share: 30 },
  ],
  "Line 3 (big cities)": [
    { products: ["DUPHASTON"], share: 45 },
    { products: ["FEMOSTON"], share: 25 },
    { products: ["DUPHALAC", "OVATEL"], share: 25 },
    { products: ["CREON"], share: 5 },
  ],
  "Pharma line": [
    { products: ["CREON"], share: 40 },
    { products: ["DUPHALAC"], share: 35 },
    { products: ["IRS 19", "IMUDON"], share: 25 },
  ],
  "Regional Manager-1": [
    { products: ["GASTRO"], share: 50 },
    { products: ["GYNECOLOGY"], share: 25 },
    { products: ["CARDIO-NEURO"], share: 20 },
    { products: ["IMMUNOLOGY"], share: 5 },
  ],
};

interface ProductPromoViewProps {
  data: IncentiveRecord[];
  filters: Filters;
}

export default function ProductPromoView({ data, filters }: ProductPromoViewProps) {
  const [selectedLine, setSelectedLine] = useState("all");

  // Aggregate actual vs plan per product across all records
  const productTotals = useMemo(() => {
    const map = new Map<string, { act: number; plan: number; lines: Set<string> }>();

    data.forEach(d => {
      if (!d.Name) return;

      const products = [
        { name: d.P1Name, act: d.P1Act, plan: d.P1Plan },
        { name: d.P2Name, act: d.P2Act, plan: d.P2Plan },
        { name: d.P3Name, act: d.P3Act, plan: d.P3Plan },
      ];

      products.forEach(p => {
        if (!p.name || !p.name.trim()) return;
        const name = p.name.trim();
        const act = cleanNum(p.act);
        const plan = cleanNum(p.plan);
        if (act === 0 && plan === 0) return;

        if (!map.has(name)) {
          map.set(name, { act: 0, plan: 0, lines: new Set() });
        }
        const entry = map.get(name)!;
        entry.act += act;
        entry.plan += plan;
        if (d.PromoLine) entry.lines.add(d.PromoLine);
      });
    });

    return Array.from(map.entries())
      .map(([name, vals]) => ({
        name,
        act: vals.act,
        plan: vals.plan,
        ach: vals.plan > 0 ? Math.round((vals.act / vals.plan) * 100) : 0,
        lines: Array.from(vals.lines).sort(),
      }))
      .sort((a, b) => b.plan - a.plan);
  }, [data]);

  // Promo line portfolio shares
  const promoLines = Object.keys(PROMO_LINE_PORTFOLIOS);
  const activeLines = selectedLine === "all" ? promoLines : [selectedLine];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Product Performance Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Performance</h2>
            <p className="text-slate-500 font-medium mt-1">Actual vs planned sales by product, across all filtered records.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm border border-blue-100 self-end">
            {productTotals.length} Products
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">#</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Product</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Promo Lines</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right border-b border-slate-200">Plan (LC)</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right border-b border-slate-200">Actual (LC)</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Achievement</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-[200px]">Share Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productTotals.map((row, i) => {
                const totalPlan = productTotals.reduce((s, r) => s + r.plan, 0);
                const share = totalPlan > 0 ? Math.round((row.plan / totalPlan) * 100) : 0;
                return (
                  <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{i + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-sm">{row.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.lines.map(l => (
                          <span key={l} className="inline-flex px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 font-medium tabular-nums text-sm">{formatNum(Math.round(row.plan))}</td>
                    <td className="px-6 py-4 text-right text-slate-800 font-semibold tabular-nums text-sm">{formatNum(Math.round(row.act))}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded text-[10px] font-bold",
                        row.ach >= 100 ? "bg-emerald-100 text-emerald-700" :
                        row.ach > 0 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {row.ach}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(share * 3, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 tabular-nums w-[32px]">{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {productTotals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No product data available for current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portfolio Share Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Share by Promo Line</h2>
            <p className="text-slate-500 text-sm mt-1">Product portfolio weights configured per promo line (from Input Assumptions sheet).</p>
          </div>
          <select
            value={selectedLine}
            onChange={e => setSelectedLine(e.target.value)}
            className="h-9 appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 pl-3 pr-8 rounded-lg text-[13px] font-medium text-slate-700 outline-none cursor-pointer shadow-sm"
          >
            <option value="all">All Lines</option>
            {promoLines.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeLines.map(line => (
            <div key={line} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{line}</span>
              </div>
              <div className="p-4 space-y-3">
                {PROMO_LINE_PORTFOLIOS[line]?.map((portfolio, pi) => (
                  <div key={pi}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                        Portfolio {pi + 1} — {portfolio.share}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${portfolio.share}%`,
                          background: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][pi % 4]
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {portfolio.products.map(p => (
                        <span key={p} className="inline-flex px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                          {p}
                        </span>
                      ))}
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
