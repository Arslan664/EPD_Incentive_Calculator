import type { IncentiveRecord } from "@/lib/types";
import { cleanNum, formatNum, getPct } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import { MapPin } from "lucide-react";

interface DetailedViewProps {
  data: IncentiveRecord[];
}

function ProductBreakdown({ record }: { record: IncentiveRecord }) {
  const products = [
    { name: record.P1Name, act: record.P1Act, plan: record.P1Plan },
    { name: record.P2Name, act: record.P2Act, plan: record.P2Plan },
    { name: record.P3Name, act: record.P3Act, plan: record.P3Plan },
  ];

  const visibleProducts = products.filter(
    (p) => cleanNum(p.plan) > 0 || cleanNum(p.act) > 0
  );

  if (visibleProducts.length === 0) return <span className="text-slate-600">—</span>;

  return (
    <div className="space-y-4 w-full">
      {visibleProducts.map((p, i) => {
        const pAct = cleanNum(p.act);
        const pPlan = cleanNum(p.plan);
        const res = getPct(pAct, pPlan);
        const percent = res ? res.value : 0;
        
        return (
          <div key={i} className="group/prod w-full">
            <div className="flex justify-between items-end mb-1.5 w-full">
              <span className="font-bold text-slate-300 text-[10px] uppercase tracking-widest truncate max-w-[120px]" title={p.name || "Product"}>
                {p.name || "Product"}
              </span>
              <span className={`text-[10px] ${percent >= 100 ? 'text-emerald-400' : 'text-rose-400'} font-bold tabular-nums`}>
                {formatNum(pAct)} <span className="text-slate-600 font-medium px-1">/</span> {formatNum(pPlan)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${percent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gradient-to-r from-rose-500 to-pink-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DetailedView({ data }: DetailedViewProps) {
  return (
    <table className="w-full text-left border-collapse min-w-[1400px]">
      <thead className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-10 border-b border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
        <tr>
          <th className="pl-8 pr-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[240px]">Representative</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[180px]">Team / Period</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[140px]">Plan (LC)</th>
          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[160px]">Actual (LC)</th>
          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[280px]">Product Breakdown</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-[100px]">TCFA %</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[140px]">Target Base</th>
          <th className="pr-8 pl-4 py-4 text-[10px] font-black uppercase tracking-widest text-blue-400 text-right w-[160px]">Final Incentive</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {data.map((rep, idx) => {
          const tAct = cleanNum(rep.TotalAct);
          const tPlan = cleanNum(rep.TotalPlan);
          
          const input = buildPerformanceInputFromRecord(rep);
          const computed = computeSummaryRow(input);
          
          const achRes = getPct(tAct, tPlan);
          const achVal = achRes ? achRes.value : 0;
          
          const tcfaVal = rep.TCFA_Act || "0%";
          const tcfaNum = parseFloat(tcfaVal.replace("%", ""));
          const tarBase = computed.targetBaseLC;
          const tarInc = computed.totalIncentiveLC;

          return (
            <tr key={`${rep.Name}-${idx}`} className="hover:bg-slate-800/40 transition-colors group animate-in fade-in duration-500">
              
              <td className="pl-8 pr-4 py-6 align-top">
                <div className="flex flex-col">
                  <span className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer text-[13px] tracking-wide">{rep.Name}</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5 w-full">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px]" title={rep.Position}>{rep.Position}</span>
                    <span className="text-slate-600">|</span>
                    <span className="truncate max-w-[80px]">{rep.Country}</span>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-6 align-top">
                <div className="flex flex-col gap-2.5 items-start">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 leading-tight tracking-wider">
                    {rep.PromoLine || "Unknown"}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{rep.Quarter} {rep.Year}</span>
                </div>
              </td>
              
              <td className="px-6 py-6 text-right align-top pt-8">
                <span className="font-semibold text-slate-300 text-sm tabular-nums tracking-tight">
                  {formatNum(tPlan)}
                </span>
              </td>
              
              <td className="px-8 py-6 text-right align-top">
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-black text-white text-[1.1rem] tabular-nums tracking-tight">{formatNum(tAct)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    achVal >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    achVal > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {achVal}%
                  </span>
                </div>
              </td>
              
              <td className="px-8 py-6 align-top">
                <ProductBreakdown record={rep} />
              </td>
              
              <td className="px-6 py-6 text-center align-top pt-7">
                <span className={`inline-flex items-center justify-center w-[42px] h-[42px] rounded-full font-bold text-xs border shadow-lg ${
                  tcfaNum >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10'
                }`}>
                  {tcfaVal}
                </span>
              </td>
              
              <td className="px-6 py-6 text-right align-top pt-8">
                <span className="font-semibold text-slate-300 text-sm tabular-nums tracking-tight">
                  {formatNum(tarBase)}
                </span>
              </td>
              
              <td className="pr-8 pl-4 py-6 text-right align-top pt-7">
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-xl font-black tabular-nums tracking-tight drop-shadow-md ${tarInc > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {tarInc > 0 ? formatNum(tarInc) : "0"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">LC</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
