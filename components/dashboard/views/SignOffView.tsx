import type { IncentiveRecord } from "@/lib/types";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import { formatNum } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SignOffViewProps {
  data: IncentiveRecord[];
}

export default function SignOffView({ data }: SignOffViewProps) {
  const computedRows = data
    .filter((d) => d.Name && d.Name.trim() !== "")
    .map((d, i) => {
      const input = buildPerformanceInputFromRecord(d);
      const computed = computeSummaryRow(input);
      return {
        rowNum: i + 1,
        name: computed.name,
        position: computed.position,
        targetIncentiveLC: computed.targetBaseLC,
        targetIncentiveUSD: computed.targetIncentiveUSD,
        incSalesResultLC: computed.incSalesResult,
        incFieldWorkLC: computed.fieldWork,
        totalIncentiveLC: computed.totalIncentiveLC,
        totalIncentiveUSD: computed.totalIncentiveUSD,
        payoutVsTargetPct: computed.payoutVsTargetPct,
      };
    });

  const totals = computedRows.reduce((acc, row) => ({
      targetIncentiveLC: acc.targetIncentiveLC + row.targetIncentiveLC,
      targetIncentiveUSD: acc.targetIncentiveUSD + row.targetIncentiveUSD,
      incSalesResultLC: acc.incSalesResultLC + row.incSalesResultLC,
      incFieldWorkLC: acc.incFieldWorkLC + row.incFieldWorkLC,
      totalIncentiveLC: acc.totalIncentiveLC + row.totalIncentiveLC,
      totalIncentiveUSD: acc.totalIncentiveUSD + row.totalIncentiveUSD,
    }), {
      targetIncentiveLC: 0, targetIncentiveUSD: 0, incSalesResultLC: 0, incFieldWorkLC: 0, totalIncentiveLC: 0, totalIncentiveUSD: 0,
  });

  const totalPayoutPct = totals.targetIncentiveLC > 0
    ? Math.round((totals.totalIncentiveLC / totals.targetIncentiveLC) * 100)
    : 0;

  return (
    <div className="flex flex-col">
      {/* Corporate Header */}
      <div className="bg-[#0a2540] px-8 py-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/80 mb-2">Abbott</div>
            <div className="text-sm font-medium tracking-wide text-blue-100/90 mb-4">Established Pharmaceuticals Division</div>
            <h2 className="text-3xl font-extrabold tracking-tight">Statement of Bonuses</h2>
          </div>
          <div className="flex flex-col items-end gap-1 bg-white/10 px-5 py-3 rounded-lg backdrop-blur-md border border-white/5">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Region / Period</span>
            <span className="font-bold text-lg">87 Georgia <span className="text-white/30 mx-2">•</span> {data.length > 0 ? data[0].Quarter || "Q2 2017" : "Q2 2017"}</span>
          </div>
        </div>
      </div>

      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center w-[50px]">#</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Name</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Position</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target Inc, LC</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target Inc, USD</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Inc (Sales), LC</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Inc (Fld Work), LC</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-900 text-right bg-blue-50/50">Total Inc, LC</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Total Inc, USD</th>
            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Payout vs Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {computedRows.map((row) => (
            <tr key={`signoff-${row.rowNum}`} className="text-sm hover:bg-slate-50/80 transition-colors animate-in fade-in duration-300">
              <td className="px-6 py-4 text-center text-slate-400 font-mono text-xs">{row.rowNum}</td>
              <td className="px-6 py-4 font-bold text-blue-600 whitespace-nowrap">{row.name}</td>
              <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[160px]" title={row.position}>{row.position}</td>
              <td className="px-6 py-4 text-right text-slate-600 font-medium tabular-nums">{formatNum(Math.round(row.targetIncentiveLC))}</td>
              <td className="px-6 py-4 text-right text-slate-600 tabular-nums">{formatNum(Math.round(row.targetIncentiveUSD))}</td>
              <td className="px-6 py-4 text-right font-medium text-slate-800 tabular-nums">{formatNum(row.incSalesResultLC)}</td>
              <td className="px-6 py-4 text-right font-medium text-slate-800 tabular-nums">{formatNum(row.incFieldWorkLC)}</td>
              <td className="px-6 py-4 text-right bg-blue-50/20">
                <span className={`text-[1.05rem] font-black tracking-tight tabular-nums ${row.totalIncentiveLC > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {row.totalIncentiveLC > 0 ? formatNum(row.totalIncentiveLC) : "0"}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-slate-700 font-medium tabular-nums">{formatNum(row.totalIncentiveUSD)}</td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                  row.payoutVsTargetPct >= 100 ? 'bg-emerald-100/80 text-emerald-700' : 
                  row.payoutVsTargetPct > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100/80 text-rose-700'
                }`}>
                  {row.payoutVsTargetPct}%
                </span>
              </td>
            </tr>
          ))}
          
          <tr className="bg-slate-50 border-t-2 border-slate-200">
            <td></td>
            <td className="px-6 py-5 font-black text-slate-900 text-sm">TOTAL SUMMARY</td>
            <td></td>
            <td className="px-6 py-5 text-right font-bold text-slate-800 tabular-nums">{formatNum(Math.round(totals.targetIncentiveLC))}</td>
            <td className="px-6 py-5 text-right font-bold text-slate-800 tabular-nums">{formatNum(Math.round(totals.targetIncentiveUSD))}</td>
            <td className="px-6 py-5 text-right font-bold text-slate-800 tabular-nums">{formatNum(Math.round(totals.incSalesResultLC))}</td>
            <td className="px-6 py-5 text-right font-bold text-slate-800 tabular-nums">{formatNum(Math.round(totals.incFieldWorkLC))}</td>
            <td className="px-6 py-5 text-right bg-blue-50">
              <span className="text-[1.1rem] font-black text-emerald-700 tabular-nums tracking-tight">{formatNum(Math.round(totals.totalIncentiveLC))}</span>
            </td>
            <td className="px-6 py-5 text-right font-bold text-slate-800 tabular-nums">{formatNum(Math.round(totals.totalIncentiveUSD))}</td>
            <td className="px-6 py-5 text-center">
              <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold shadow-sm">
                {totalPayoutPct}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature Area */}
      <div className="p-8 bg-slate-50/50 border-t border-slate-100">
        <h3 className="mb-10 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Signatures Required For Approval</h3>
        <div className="flex flex-wrap gap-x-12 gap-y-12">
          {[
            "National Sales Manager",
            "General Manager",
            "Regional Sales Force Effectiveness Director Turkey & CIS",
            "HR Manager",
            "CIS Finance Director EPD"
          ].map((role) => (
            <div key={role} className="flex min-w-[200px] flex-col gap-2 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 leading-normal">
                {role}
              </span>
              <div className="mt-8 border-b-2 border-slate-300 h-2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
