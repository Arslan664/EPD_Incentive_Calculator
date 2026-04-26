"use client";

import { useState } from "react";
import type { IncentiveRecord } from "@/lib/types";
import { cleanNum, formatNum, getPct } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";
import { MapPin, ChevronUp, ChevronDown } from "lucide-react";

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

  if (visibleProducts.length === 0) return <span style={{ color: "#8FA0C8" }}>—</span>;

  return (
    <div className="space-y-4 w-full">
      {visibleProducts.map((p, i) => {
        const pAct = cleanNum(p.act);
        const pPlan = cleanNum(p.plan);
        const res = getPct(pAct, pPlan);
        const percent = res ? res.value : 0;

        return (
          <div key={i} className="w-full">
            <div className="flex justify-between items-end mb-1.5 w-full">
              <span
                className="font-bold text-[10px] uppercase tracking-widest truncate max-w-[120px]"
                title={p.name || "Product"}
                style={{ color: "#5B6A9A" }}
              >
                {p.name || "Product"}
              </span>
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: percent >= 100 ? "#0E7A4F" : "#B91C1C" }}
              >
                {formatNum(pAct)} <span style={{ color: "#8FA0C8", fontWeight: 500 }}>/</span> {formatNum(pPlan)}
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden relative"
              style={{ backgroundColor: "#DDE2F0" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(percent, 100)}%`,
                  backgroundColor: percent >= 100 ? "#0E7A4F" : "#B91C1C",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type SortDir = "asc" | "desc";

export default function DetailedView({ data }: DetailedViewProps) {
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = () => setSortDir(prev => prev === "asc" ? "desc" : "asc");

  const sorted = [...data].sort((a, b) => {
    const nameA = (a.Name || "").toLowerCase();
    const nameB = (b.Name || "").toLowerCase();
    if (nameA < nameB) return sortDir === "asc" ? -1 : 1;
    if (nameA > nameB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Abbott-styled header
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

  return (
    <table className="w-full text-left border-collapse min-w-[1400px]">
      <thead
        className="sticky top-0 z-10"
        style={{ background: "linear-gradient(90deg, #0B1F3A 0%, #122D5A 100%)" }}
      >
        <tr>
          <th style={{ ...thStyle, paddingLeft: "32px", width: "240px" }}>
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 transition-colors cursor-pointer select-none"
              style={{ color: "rgba(255,255,255,0.80)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(160,191,206,0.90)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "rgba(160,191,206,0.80)";
              }}
              title={`Sort ${sortDir === "asc" ? "Z → A" : "A → Z"}`}
            >
              Representative
              <span className="flex flex-col gap-px ml-0.5">
                <ChevronUp
                  className="w-2.5 h-2.5"
                  style={{ color: sortDir === "asc" ? "rgba(160,191,206,0.90)" : "rgba(160,191,206,0.28)" }}
                />
                <ChevronDown
                  className="w-2.5 h-2.5"
                  style={{ color: sortDir === "desc" ? "rgba(160,191,206,0.90)" : "rgba(160,191,206,0.28)" }}
                />
              </span>
            </button>
          </th>
          <th style={{ ...thStyle, width: "180px" }}>Team / Period</th>
          <th style={{ ...thStyle, textAlign: "right", width: "140px" }}>Plan (LC)</th>
          <th style={{ ...thStyle, textAlign: "right", width: "160px" }}>Actual (LC)</th>
          <th style={{ ...thStyle, width: "280px" }}>Product Breakdown</th>
          <th style={{ ...thStyle, textAlign: "center", width: "100px" }}>TCFA %</th>
          <th style={{ ...thStyle, textAlign: "right", width: "140px" }}>Target Base</th>
          <th style={{ ...thStyle, textAlign: "right", width: "160px", color: "#D1D9F3", paddingRight: "32px" }}>
            Final Incentive
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((rep, idx) => {
          const tAct = cleanNum(rep.TotalAct);
          const tPlan = cleanNum(rep.TotalPlan);

          const input = buildPerformanceInputFromRecord(rep);
          const computed = computeSummaryRow(input);

          const achRes = getPct(tAct, tPlan);
          const achVal = achRes ? achRes.value : 0;

          const tcfaVal = rep.TCFA_Act || "0%";
          const tcfaNum = Math.round(parseFloat(tcfaVal.replace("%", "")));
          const tcfaDisplay = `${tcfaNum}%`;
          const tarBase = computed.targetBaseLC;
          const tarInc = computed.totalIncentiveLC;
          const isEven = idx % 2 === 0;

          return (
            <tr
              key={`${rep.Name}-${idx}`}
              className="animate-in fade-in duration-500"
              style={{
                backgroundColor: isEven ? "#FFFFFF" : "#F7FAFC",
                borderBottom: "1px solid #D0DCE8",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,87,168,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = isEven ? "#FFFFFF" : "#F7FAFC")}
            >
              <td style={{ paddingLeft: "32px", paddingRight: "16px", paddingTop: "20px", paddingBottom: "20px", verticalAlign: "top" }}>
                <div className="flex flex-col">
                  <span
                    className="font-bold text-[13px] tracking-wide cursor-pointer hover:underline"
                    style={{ color: "#0057A8" }}
                  >
                    {rep.Name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] mt-1.5 w-full" style={{ color: "#8FA0C8" }}>
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px]" title={rep.Position}>{rep.Position}</span>
                    <span style={{ color: "#DDE2F0" }}>|</span>
                    <span className="truncate max-w-[80px]">{rep.Country}</span>
                  </div>
                </div>
              </td>

              <td style={{ padding: "20px 24px", verticalAlign: "top" }}>
                <div className="flex flex-col gap-2 items-start">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold leading-tight tracking-wider"
                    style={{
                      backgroundColor: "rgba(0,87,168,0.08)",
                      color: "#0057A8",
                      border: "1px solid rgba(0,87,168,0.16)",
                    }}
                  >
                    {rep.PromoLine || "Unknown"}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8FA0C8" }}>
                    {rep.Quarter}
                  </span>
                </div>
              </td>

              <td style={{ padding: "20px 24px", textAlign: "right", verticalAlign: "top", paddingTop: "28px" }}>
                <span className="text-sm tabular-nums tracking-tight font-medium" style={{ color: "#5B6A9A" }}>
                  {formatNum(tPlan)}
                </span>
              </td>

              <td style={{ padding: "20px 32px", textAlign: "right", verticalAlign: "top" }}>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[1.05rem] tabular-nums tracking-tight font-medium" style={{ color: "#0B0B3B" }}>
                    {formatNum(tAct)}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={
                      achVal >= 100
                        ? { backgroundColor: "rgba(14,122,79,0.10)", color: "#0E7A4F", border: "1px solid rgba(14,122,79,0.20)" }
                        : achVal > 0
                        ? { backgroundColor: "rgba(180,83,9,0.08)", color: "#B45309", border: "1px solid rgba(180,83,9,0.20)" }
                        : { backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C", border: "1px solid rgba(185,28,28,0.18)" }
                    }
                  >
                    {achVal}%
                  </span>
                </div>
              </td>

              <td style={{ padding: "20px 32px", verticalAlign: "top" }}>
                <ProductBreakdown record={rep} />
              </td>

              <td style={{ padding: "20px 24px", textAlign: "center", verticalAlign: "top", paddingTop: "24px" }}>
                <span
                  className="inline-flex items-center justify-center w-[42px] h-[42px] rounded-full font-bold text-xs border"
                  style={
                    tcfaNum >= 90
                      ? { backgroundColor: "rgba(14,122,79,0.10)", color: "#0E7A4F", border: "1.5px solid rgba(14,122,79,0.25)" }
                      : { backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C", border: "1.5px solid rgba(185,28,28,0.20)" }
                  }
                >
                  {tcfaDisplay}
                </span>
              </td>

              <td style={{ padding: "20px 24px", textAlign: "right", verticalAlign: "top", paddingTop: "28px" }}>
                <span className="font-medium text-sm tabular-nums tracking-tight" style={{ color: "#5B6A9A" }}>
                  {formatNum(tarBase)}
                </span>
              </td>

              <td style={{ paddingLeft: "16px", paddingRight: "32px", paddingTop: "24px", paddingBottom: "20px", textAlign: "right", verticalAlign: "top" }}>
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className="text-xl font-black tabular-nums tracking-tight"
                    style={{ color: tarInc > 0 ? "#0E7A4F" : "#5B6A9A" }}
                  >
                    {tarInc > 0 ? formatNum(tarInc) : "0"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest leading-none" style={{ color: "#8FA0C8" }}>
                    LC
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
