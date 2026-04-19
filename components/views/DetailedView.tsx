/**
 * DetailedView — Renders the "Actual vs Plan Performance" table.
 * Each row is its own React element (no innerHTML), so React's
 * virtual DOM diffing handles updates efficiently.
 */

import type { IncentiveRecord } from "@/lib/types";
import { cleanNum, formatNum, getPct } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";

interface DetailedViewProps {
  data: IncentiveRecord[];
}

function PercentBadge({
  actual,
  plan,
  large,
}: {
  actual: number;
  plan: number;
  large?: boolean;
}) {
  const result = getPct(actual, plan);
  if (!result) return null;
  return (
    <span
      className={`percent-badge ${result.isGood ? "pct-good" : "pct-bad"} ${
        large ? "pct-badge-large" : ""
      }`}
    >
      {result.value}%
    </span>
  );
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

  if (visibleProducts.length === 0) return <span className="val-plan">—</span>;

  return (
    <div className="prod-list">
      {visibleProducts.map((p, i) => {
        const pAct = cleanNum(p.act);
        const pPlan = cleanNum(p.plan);
        return (
          <div key={i} className="prod-item">
            <span className="prod-name" title={p.name || "Product"}>
              {p.name || "Product"}
            </span>
            <span className="prod-values">
              {formatNum(pAct)} / {formatNum(pPlan)}
              <PercentBadge actual={pAct} plan={pPlan} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DetailedView({ data }: DetailedViewProps) {
  return (
    <>
      <thead>
        <tr>
          <th>Rep Name</th>
          <th>Position &amp; Team</th>
          <th>Total Plan (LC)</th>
          <th>Total Actual (LC)</th>
          <th>Product Breakdown (Act vs Plan)</th>
          <th>TCFA (Actual)</th>
          <th>Target Base (LC)</th>
          <th className="highlight-col">Final Incentive (LC)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, idx) => {
          const tAct = cleanNum(d.TotalAct);
          const tPlan = cleanNum(d.TotalPlan);
          
          // Leverage the computation engine to guarantee dynamic sync
          const input = buildPerformanceInputFromRecord(d);
          const computed = computeSummaryRow(input);
          
          const tcfaVal = d.TCFA_Act || "0%";
          const tcfaNum = parseFloat(tcfaVal.replace("%", ""));
          const tarBase = computed.targetBaseLC;
          const tarInc = computed.totalIncentiveLC;

          return (
            <tr key={`${d.Name}-${idx}`} className="fade-in">
              {/* Name */}
              <td>
                <span className="rep-name">{d.Name}</span>
                <span className="rep-meta">
                  {d.Position || "Rep"} | {d.Country}
                </span>
              </td>

              {/* Team & Quarter */}
              <td>
                <span className="team-badge">{d.PromoLine || "Unknown"}</span>
                <br />
                <span className="quarter-label">
                  {d.Quarter} {d.Year}
                </span>
              </td>

              {/* Total Plan */}
              <td>
                <div className="val-plan">{formatNum(tPlan)}</div>
              </td>

              {/* Total Actual */}
              <td>
                <div className="val-act">{formatNum(tAct)}</div>
                <PercentBadge actual={tAct} plan={tPlan} />
              </td>

              {/* Product Breakdown */}
              <td>
                <ProductBreakdown record={d} />
              </td>

              {/* TCFA */}
              <td>
                <span
                  className={`percent-badge pct-badge-large ${
                    tcfaNum >= 95 ? "pct-good" : "pct-bad"
                  }`}
                >
                  {tcfaVal}
                </span>
              </td>

              {/* Target Base */}
              <td>
                <div className="val-plan">{formatNum(tarBase)}</div>
              </td>

              {/* Final Incentive */}
              <td className="highlight-col">
                <div className="final-incentive">{formatNum(tarInc)}</div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </>
  );
}
