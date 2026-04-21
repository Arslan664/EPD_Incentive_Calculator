import type { IncentiveRecord, Filters } from "@/lib/types";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import { formatNum } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SignOffViewProps {
  data: IncentiveRecord[];
  filters: Filters;
  fullData?: IncentiveRecord[];
  startIndex?: number;
}

const thStyle: React.CSSProperties = {
  padding: "14px 20px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(160,191,206,0.80)",
  whiteSpace: "nowrap",
};

export default function SignOffView({ data, filters, fullData, startIndex = 0 }: SignOffViewProps) {
  const computedRows = data
    .filter((d) => d.Name && d.Name.trim() !== "")
    .map((d, i) => {
      const input = buildPerformanceInputFromRecord(d);
      const computed = computeSummaryRow(input);
      return {
        rowNum: i + 1 + startIndex,
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

  const totalSource = fullData || data;
  const computedTotals = totalSource
    .filter((d) => d.Name && d.Name.trim() !== "")
    .map((d) => {
      const input = buildPerformanceInputFromRecord(d);
      return computeSummaryRow(input);
    });

  const totals = computedTotals.reduce((acc, row) => ({
      targetIncentiveLC: acc.targetIncentiveLC + row.targetBaseLC,
      targetIncentiveUSD: acc.targetIncentiveUSD + row.targetIncentiveUSD,
      incSalesResultLC: acc.incSalesResultLC + row.incSalesResult,
      incFieldWorkLC: acc.incFieldWorkLC + row.fieldWork,
      totalIncentiveLC: acc.totalIncentiveLC + row.totalIncentiveLC,
      totalIncentiveUSD: acc.totalIncentiveUSD + row.totalIncentiveUSD,
    }), {
      targetIncentiveLC: 0, targetIncentiveUSD: 0, incSalesResultLC: 0, incFieldWorkLC: 0, totalIncentiveLC: 0, totalIncentiveUSD: 0,
  });

  const totalPayoutPct = totals.targetIncentiveLC > 0
    ? Math.round((totals.totalIncentiveLC / totals.targetIncentiveLC) * 100)
    : 0;

  return (
    <div className="flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>

      {/* Corporate Document Header */}
      <div
        className="px-8 py-8"
        style={{ borderBottom: "3px solid #000074" }}
      >
        <div className="flex justify-between items-start">
          <div>
            {/* Abbott "A" mark */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0B1F3A 0%, #122D5A 100%)",
                  color: "#FFFFFF",
                  letterSpacing: "-0.05em",
                }}
              >
                A
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.20em]" style={{ color: "#0B1F3A" }}>
                  Abbott Laboratories
                </p>
                <p className="text-[12px] font-semibold" style={{ color: "#0057A8" }}>
                  Established Pharmaceuticals Division
                </p>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#0B0B3B" }}>
              Statement of Bonuses
            </h2>
          </div>
          <div
            className="flex flex-col items-end gap-1 px-5 py-3 rounded-xl"
            style={{ backgroundColor: "#F4F6FC", border: "1.5px solid #DDE2F0" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5B6A9A" }}>Region / Period</span>
            <span className="font-bold text-lg" style={{ color: "#0B0B3B" }}>
              {filters.country === "all" ? "All Regions" : filters.country}
              <span style={{ color: "#DDE2F0", margin: "0 8px" }}>•</span>
              {filters.quarter === "all"
                ? data.length > 0 ? data[0].Quarter || "All Quarters" : "All Quarters"
                : filters.quarter}
            </span>
          </div>
        </div>
      </div>

      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead
          className="sticky top-0 z-10"
          style={{ background: "linear-gradient(90deg, #0B1F3A 0%, #122D5A 100%)", borderBottom: "none" }}
        >
          <tr>
            <th style={{ ...thStyle, textAlign: "center", width: "50px" }}>#</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Position</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Target Inc, LC</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Target Inc, USD</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Inc (Sales), LC</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Inc (Fld Work), LC</th>
            <th style={{ ...thStyle, textAlign: "right", color: "#D1D9F3" }}>Total Inc, LC</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Total Inc, USD</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Payout vs Target</th>
          </tr>
        </thead>
        <tbody>
          {computedRows.map((row, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <tr
                key={`signoff-${row.rowNum}`}
                className="text-sm animate-in fade-in duration-300"
                style={{
                  backgroundColor: isEven ? "#FFFFFF" : "#F7FAFC",
                  borderBottom: "1px solid #D0DCE8",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,87,168,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = isEven ? "#FFFFFF" : "#F7FAFC")}
              >
                <td className="px-5 py-4 text-center font-mono text-xs" style={{ color: "#8FA0C8" }}>{row.rowNum}</td>
                <td className="px-5 py-4 font-bold whitespace-nowrap" style={{ color: "#2C49E4" }}>{row.name}</td>
                <td className="px-5 py-4 text-xs truncate max-w-[160px]" title={row.position} style={{ color: "#5B6A9A" }}>
                  {row.position}
                </td>
                <td className="px-5 py-4 text-right tabular-nums font-medium" style={{ color: "#5B6A9A" }}>
                  {formatNum(Math.round(row.targetIncentiveLC))}
                </td>
                <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#5B6A9A" }}>
                  {formatNum(Math.round(row.targetIncentiveUSD))}
                </td>
                <td className="px-5 py-4 text-right tabular-nums font-medium" style={{ color: "#0B0B3B" }}>
                  {formatNum(row.incSalesResultLC)}
                </td>
                <td className="px-5 py-4 text-right tabular-nums font-medium" style={{ color: "#0B0B3B" }}>
                  {formatNum(row.incFieldWorkLC)}
                </td>
                <td className="px-5 py-4 text-right" style={{ backgroundColor: "rgba(0,87,168,0.04)" }}>
                  <span
                    className="text-[1.05rem] font-black tracking-tight tabular-nums"
                    style={{ color: row.totalIncentiveLC > 0 ? "#0E7A4F" : "#5B6A9A" }}
                  >
                    {row.totalIncentiveLC > 0 ? formatNum(row.totalIncentiveLC) : "0"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right tabular-nums font-medium" style={{ color: "#5B6A9A" }}>
                  {formatNum(row.totalIncentiveUSD)}
                </td>
                <td className="px-5 py-4 text-center">
                  <span
                    className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold"
                    style={
                      row.payoutVsTargetPct >= 100
                        ? { backgroundColor: "rgba(14,122,79,0.10)", color: "#0E7A4F" }
                        : row.payoutVsTargetPct > 0
                        ? { backgroundColor: "rgba(180,83,9,0.08)", color: "#B45309" }
                        : { backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C" }
                    }
                  >
                    {row.payoutVsTargetPct}%
                  </span>
                </td>
              </tr>
            );
          })}

          {/* Totals row */}
          <tr style={{ backgroundColor: "#0B1F3A", borderTop: "2px solid #0B1F3A" }}>
            <td></td>
            <td className="px-5 py-5 font-black text-sm" style={{ color: "#FFFFFF" }}>TOTAL SUMMARY</td>
            <td></td>
            <td className="px-5 py-5 text-right font-bold tabular-nums" style={{ color: "#D1D9F3" }}>
              {formatNum(Math.round(totals.targetIncentiveLC))}
            </td>
            <td className="px-5 py-5 text-right font-bold tabular-nums" style={{ color: "#D1D9F3" }}>
              {formatNum(Math.round(totals.targetIncentiveUSD))}
            </td>
            <td className="px-5 py-5 text-right font-bold tabular-nums" style={{ color: "#D1D9F3" }}>
              {formatNum(Math.round(totals.incSalesResultLC))}
            </td>
            <td className="px-5 py-5 text-right font-bold tabular-nums" style={{ color: "#D1D9F3" }}>
              {formatNum(Math.round(totals.incFieldWorkLC))}
            </td>
            <td className="px-5 py-5 text-right" style={{ backgroundColor: "rgba(0,87,168,0.20)" }}>
              <span className="text-[1.1rem] font-black tabular-nums tracking-tight" style={{ color: "#86EFAC" }}>
                {formatNum(Math.round(totals.totalIncentiveLC))}
              </span>
            </td>
            <td className="px-5 py-5 text-right font-bold tabular-nums" style={{ color: "#D1D9F3" }}>
              {formatNum(Math.round(totals.totalIncentiveUSD))}
            </td>
            <td className="px-5 py-5 text-center">
              <span
                className="inline-flex px-3 py-1 rounded-md text-xs font-bold"
                style={{ backgroundColor: "rgba(14,122,79,0.25)", color: "#86EFAC" }}
              >
                {totalPayoutPct}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature Area */}
      <div className="p-8" style={{ borderTop: "1px solid #DDE2F0" }}>
        <div className="flex items-center gap-2 mb-8">
          <div className="h-px flex-1" style={{ backgroundColor: "#DDE2F0" }} />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#5B6A9A" }}>
            Signatures Required For Approval
          </h3>
          <div className="h-px flex-1" style={{ backgroundColor: "#DDE2F0" }} />
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-10">
          {[
            "National Sales Manager",
            "General Manager",
            "Regional Sales Force Effectiveness Director Turkey & CIS",
            "HR Manager",
            "CIS Finance Director EPD"
          ].map((role) => (
            <div key={role} className="flex min-w-[200px] flex-col gap-2 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider leading-normal" style={{ color: "#5B6A9A" }}>
                {role}
              </span>
              <div className="h-2" style={{ borderBottom: "2px solid #0B1F3A" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
