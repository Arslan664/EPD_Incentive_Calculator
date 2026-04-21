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

const thStyle: React.CSSProperties = {
  padding: "14px 20px",
  fontSize: "10px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(160,191,206,0.80)",
  whiteSpace: "nowrap",
  background: "transparent",
};

export default function SummaryView({ data, fullData, startIndex = 0 }: SummaryViewProps) {
  const computedRows: ComputedSummaryRow[] = data
    .filter((d) => d.Name && d.Name.trim() !== "")
    .map((d) => {
      const input = buildPerformanceInputFromRecord(d);
      return computeSummaryRow(input);
    });

  return (
    <table className="w-full text-left border-collapse min-w-[1700px] text-sm">
      <thead
        className="sticky top-0 z-10"
        style={{ background: "linear-gradient(90deg, #0B1F3A 0%, #122D5A 100%)" }}
      >
        <tr>
          <th style={{ ...thStyle, textAlign: "center", width: "50px" }}>No</th>
          <th style={{ ...thStyle, width: "200px" }}>Representative</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Target Inc (QTR)</th>
          <th style={{ ...thStyle, textAlign: "center" }}>Reimb. %</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Target Base LC</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Target (Sales)</th>
          <th style={{ ...thStyle, textAlign: "right" }}>P1 Val</th>
          <th style={{ ...thStyle, textAlign: "right" }}>P2 Val</th>
          <th style={{ ...thStyle, textAlign: "right" }}>P3 Val</th>
          <th style={{ ...thStyle, textAlign: "right", color: "#D1D9F3" }}>Inc (Sales)</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Target (TCFA)</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Target (TIC)</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Inc (TCFA)</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Inc (TIC)</th>
          <th style={{ ...thStyle, textAlign: "right", color: "#D1D9F3" }}>Field Work</th>
          <th style={{ ...thStyle, textAlign: "right", color: "#D1D9F3" }}>Total Incentive</th>
        </tr>
      </thead>
      <tbody>
        {computedRows.map((row, i) => {
          const isEven = i % 2 === 0;
          return (
            <tr
              key={`${row.name}-summary-${i}`}
              className="animate-in fade-in duration-300"
              style={{
                backgroundColor: isEven ? "#FFFFFF" : "#F7FAFC",
                borderBottom: "1px solid #D0DCE8",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,87,168,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = isEven ? "#FFFFFF" : "#F7FAFC")}
            >
              <td className="px-5 py-4 text-center font-mono text-xs" style={{ color: "#8FA0C8" }}>
                {i + 1 + startIndex}
              </td>

              <td className="px-5 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-sm whitespace-nowrap cursor-pointer hover:underline" style={{ color: "#2C49E4" }}>
                    {row.name}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] mt-1 max-w-[180px]" style={{ color: "#8FA0C8" }}>
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate" title={row.position}>{row.position}</span>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4 text-right tabular-nums font-medium" style={{ color: "#5B6A9A" }}>
                {formatNum(Math.round(row.targetForQuarterLC))}
              </td>
              <td className="px-5 py-4 text-center" style={{ color: "#5B6A9A" }}>{row.reimbursablePct}%</td>
              <td className="px-5 py-4 text-right tabular-nums font-semibold" style={{ color: "#0B0B3B" }}>
                {formatNum(Math.round(row.targetBaseLC))}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#5B6A9A" }}>
                {formatNum(Math.round(row.targetSalesResult))}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#8FA0C8" }}>
                {formatNum(row.product1Amount)}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#8FA0C8" }}>
                {formatNum(row.product2Amount)}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#8FA0C8" }}>
                {formatNum(row.product3Amount)}
              </td>

              <td
                className="px-5 py-4 text-right tabular-nums font-semibold"
                style={{ backgroundColor: "rgba(0,87,168,0.04)", color: "#0F1827" }}
              >
                {formatNum(row.incSalesResult)}
              </td>

              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#5B6A9A" }}>
                {formatNum(Math.round(row.targetTCFA))}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#5B6A9A" }}>
                {formatNum(Math.round(row.targetCoaching))}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#5B6A9A" }}>
                {formatNum(row.incTCFA)}
              </td>
              <td className="px-5 py-4 text-right tabular-nums" style={{ color: "#5B6A9A" }}>
                {formatNum(row.incCoaching)}
              </td>

              <td
                className="px-5 py-4 text-right tabular-nums font-semibold"
                style={{ backgroundColor: "rgba(0,87,168,0.04)", color: "#0F1827" }}
              >
                {formatNum(row.fieldWork)}
              </td>

              <td className="px-5 py-4 text-right">
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className="text-[1.1rem] font-black tabular-nums tracking-tight"
                    style={{ color: "#0057A8" }}
                  >
                    {row.totalIncentiveLC > 0 ? formatNum(row.totalIncentiveLC) : "0"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#8FA0C8" }}>LC</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
