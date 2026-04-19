/**
 * SignOffView — Renders the "Statement of Bonuses" table.
 * Matches the To_sign.csv format from the original Excel.
 *
 * All values are computed dynamically using the incentive calculation engine.
 */

import type { IncentiveRecord } from "@/lib/types";
import {
  buildPerformanceInputFromRecord,
  computeSummaryRow,
} from "@/lib/incentiveCalculations";
import { formatNum } from "@/lib/utils";

interface SignOffViewProps {
  data: IncentiveRecord[];
}

export default function SignOffView({ data }: SignOffViewProps) {
  // Compute all rows dynamically
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

  // Totals
  const totals = computedRows.reduce(
    (acc, row) => ({
      targetIncentiveLC: acc.targetIncentiveLC + row.targetIncentiveLC,
      targetIncentiveUSD: acc.targetIncentiveUSD + row.targetIncentiveUSD,
      incSalesResultLC: acc.incSalesResultLC + row.incSalesResultLC,
      incFieldWorkLC: acc.incFieldWorkLC + row.incFieldWorkLC,
      totalIncentiveLC: acc.totalIncentiveLC + row.totalIncentiveLC,
      totalIncentiveUSD: acc.totalIncentiveUSD + row.totalIncentiveUSD,
    }),
    {
      targetIncentiveLC: 0,
      targetIncentiveUSD: 0,
      incSalesResultLC: 0,
      incFieldWorkLC: 0,
      totalIncentiveLC: 0,
      totalIncentiveUSD: 0,
    }
  );

  const totalPayoutPct =
    totals.targetIncentiveLC > 0
      ? Math.round(
          (totals.totalIncentiveLC / totals.targetIncentiveLC) * 100
        )
      : 0;

  return (
    <>
      {/* Header */}
      <div className="signoff-header">
        <div className="signoff-company">Abbott</div>
        <div className="signoff-division">
          Established Pharmaceuticals Division
        </div>
        <div className="signoff-title">Statement of bonuses</div>
        <div className="signoff-meta">
          <span>87 Georgia</span>
          <span className="signoff-separator">•</span>
          <span>
            {data.length > 0 ? data[0].Quarter || "Q2 2017" : "Q2 2017"}
          </span>
        </div>
      </div>

      {/* Table */}
      <table className="data-table signoff-table" id="signoff-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th>Target Incentive Amount, LC</th>
            <th>Target Incentive Amount, USD</th>
            <th>Incentive Amount for Sales Result, LC</th>
            <th>Incentive Amount for Field Work Achievement, LC</th>
            <th className="highlight-col">Total Incentive Amount, LC</th>
            <th>Total Incentive Amount, USD</th>
            <th>Payout vs Target Incentive, %</th>
          </tr>
        </thead>
        <tbody>
          {computedRows.map((row) => {
            const payoutClass =
              row.payoutVsTargetPct >= 100
                ? "pct-good"
                : row.payoutVsTargetPct > 0
                ? "pct-warn"
                : "pct-zero";

            return (
              <tr key={`signoff-${row.rowNum}`} className="fade-in">
                <td>{row.rowNum}</td>
                <td className="summary-name">{row.name}</td>
                <td className="summary-position">{row.position}</td>
                <td>{formatNum(Math.round(row.targetIncentiveLC))}</td>
                <td>{formatNum(Math.round(row.targetIncentiveUSD))}</td>
                <td>{formatNum(row.incSalesResultLC)}</td>
                <td>{formatNum(row.incFieldWorkLC)}</td>
                <td className="highlight-col summary-total">
                  {formatNum(row.totalIncentiveLC)}
                </td>
                <td>{formatNum(row.totalIncentiveUSD)}</td>
                <td>
                  <span className={`percent-badge ${payoutClass}`}>
                    {row.payoutVsTargetPct}%
                  </span>
                </td>
              </tr>
            );
          })}

          {/* Total row */}
          <tr className="signoff-total-row">
            <td></td>
            <td className="summary-name" style={{ fontWeight: 700 }}>
              TOTAL
            </td>
            <td></td>
            <td style={{ fontWeight: 700 }}>
              {formatNum(Math.round(totals.targetIncentiveLC))}
            </td>
            <td style={{ fontWeight: 700 }}>
              {formatNum(Math.round(totals.targetIncentiveUSD))}
            </td>
            <td style={{ fontWeight: 700 }}>
              {formatNum(Math.round(totals.incSalesResultLC))}
            </td>
            <td style={{ fontWeight: 700 }}>
              {formatNum(Math.round(totals.incFieldWorkLC))}
            </td>
            <td
              className="highlight-col"
              style={{ fontWeight: 700 }}
            >
              {formatNum(Math.round(totals.totalIncentiveLC))}
            </td>
            <td style={{ fontWeight: 700 }}>
              {formatNum(Math.round(totals.totalIncentiveUSD))}
            </td>
            <td>
              <span className="percent-badge pct-good">
                {totalPayoutPct}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature section */}
      <div className="signoff-signatures">
        <div className="signoff-signature-item">
          <span className="signoff-role">National Sales Manager</span>
          <span className="signoff-line">
            __________________________________________________________
          </span>
        </div>
        <div className="signoff-signature-item">
          <span className="signoff-role">General Manager</span>
          <span className="signoff-line">
            __________________________________________________________
          </span>
        </div>
        <div className="signoff-signature-item">
          <span className="signoff-role">
            Regional Sales Force Effectiveness Director Turkey &amp; CIS
          </span>
          <span className="signoff-line">
            __________________________________________________________
          </span>
        </div>
        <div className="signoff-signature-item">
          <span className="signoff-role">HR Manager</span>
          <span className="signoff-line">
            __________________________________________________________
          </span>
        </div>
        <div className="signoff-signature-item">
          <span className="signoff-role">CIS Finance Director EPD</span>
          <span className="signoff-line">
            __________________________________________________________
          </span>
        </div>
      </div>
    </>
  );
}
