import type { IncentiveRecord } from "@/lib/types";
import {
  buildPerformanceInputFromRecord,
  computeSummaryRow,
  type ComputedSummaryRow,
} from "@/lib/incentiveCalculations";
import { formatNum } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface SummaryViewProps {
  data: IncentiveRecord[];
  fullData?: IncentiveRecord[];
  startIndex?: number;
}

export default function SummaryView({ data, fullData, startIndex = 0 }: SummaryViewProps) {
  const computedRows: ComputedSummaryRow[] = data
    .filter((d) => d.Name && d.Name.trim() !== "")
    .map((d) => {
      const input = buildPerformanceInputFromRecord(d);
      return computeSummaryRow(input);
    });

  return (
    <table className="w-full text-left border-collapse min-w-[1700px] text-sm">
      <thead className="bg-white sticky top-0 z-10 shadow-[0_1px_0_0_#f1f5f9]">
        <tr>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[50px] text-center">No</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[200px]">Representative</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target Inc (QTR)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Reimb. %</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target Base LC</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target (Sales)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">P1 Val</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">P2 Val</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">P3 Val</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-bg-slate-100/50 text-right text-slate-700">Inc (Sales)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target (TCFA)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Target (TIC)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Inc (TCFA)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Inc (TIC)</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-bg-slate-100/50 text-right text-slate-700">Field Work</th>
          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Total Incentive</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {computedRows.map((row, i) => (
          <tr key={`${row.name}-summary-${i}`} className="hover:bg-slate-50/80 transition-colors animate-in fade-in duration-300">
            <td className="px-6 py-4 text-center text-slate-500 font-mono text-xs">{i + 1 + startIndex}</td>
            
            <td className="px-6 py-4">
               <div className="flex flex-col">
                  <span className="font-bold text-blue-600 hover:underline cursor-pointer text-sm whitespace-nowrap">{row.name}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 max-w-[180px]">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate" title={row.position}>{row.position}</span>
                  </div>
                </div>
            </td>
            
            <td className="px-6 py-4 text-right text-slate-600 font-medium tabular-nums">{formatNum(Math.round(row.targetForQuarterLC))}</td>
            <td className="px-6 py-4 text-center text-slate-500">{row.reimbursablePct}%</td>
            <td className="px-6 py-4 text-right font-medium text-slate-700 tabular-nums">{formatNum(Math.round(row.targetBaseLC))}</td>
            <td className="px-6 py-4 text-right text-slate-600 tabular-nums">{formatNum(Math.round(row.targetSalesResult))}</td>
            <td className="px-6 py-4 text-right text-slate-500 tabular-nums">{formatNum(row.product1Amount)}</td>
            <td className="px-6 py-4 text-right text-slate-500 tabular-nums">{formatNum(row.product2Amount)}</td>
            <td className="px-6 py-4 text-right text-slate-500 tabular-nums">{formatNum(row.product3Amount)}</td>
            
            <td className="px-6 py-4 text-right bg-slate-50/30 font-semibold text-slate-800 tabular-nums">{formatNum(row.incSalesResult)}</td>
            
            <td className="px-6 py-4 text-right text-slate-600 tabular-nums">{formatNum(Math.round(row.targetTCFA))}</td>
            <td className="px-6 py-4 text-right text-slate-600 tabular-nums">{formatNum(Math.round(row.targetCoaching))}</td>
            <td className="px-6 py-4 text-right text-slate-600 tabular-nums">{formatNum(row.incTCFA)}</td>
            <td className="px-6 py-4 text-right text-slate-600 tabular-nums">{formatNum(row.incCoaching)}</td>
            
            <td className="px-6 py-4 text-right bg-slate-50/30 font-semibold text-slate-800 tabular-nums">{formatNum(row.fieldWork)}</td>
            
            <td className="px-6 py-4 text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-[1.1rem] font-black tabular-nums tracking-tight ${row.totalIncentiveLC > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {row.totalIncentiveLC > 0 ? formatNum(row.totalIncentiveLC) : "0"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">LC</span>
                </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
