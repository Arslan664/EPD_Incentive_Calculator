/**
 * SummaryView — Renders the "Summary Calculation (Financials)" table.
 *
 * All values are now computed dynamically using the incentive calculation engine
 * instead of reading pre-computed _Sum fields from static data.
 */

import type { IncentiveRecord } from "@/lib/types";
import {
  buildPerformanceInputFromRecord,
  computeSummaryRow,
  type ComputedSummaryRow,
} from "@/lib/incentiveCalculations";
import { formatNum } from "@/lib/utils";

interface SummaryViewProps {
  data: IncentiveRecord[];
}

export default function SummaryView({ data }: SummaryViewProps) {
  // Compute all rows dynamically from raw performance data
  const computedRows: ComputedSummaryRow[] = data
    .filter((d) => d.Name && d.Name.trim() !== "")
    .map((d) => {
      const input = buildPerformanceInputFromRecord(d);
      return computeSummaryRow(input);
    });

  return (
    <>
      <thead>
        <tr>
          <th>No</th>
          <th>Name</th>
          <th>Position</th>
          <th>Target Incentive for Quarter, LC</th>
          <th>Reimbursable months, %</th>
          <th>Target Base, LC</th>
          <th>Target Inc (Sales Result)</th>
          <th>Product 1</th>
          <th>Product 2</th>
          <th>Product 3</th>
          <th>Product 4</th>
          <th>Inc Amount (Sales Result)</th>
          <th>Target Inc (TCFA)</th>
          <th>Target Inc (Coaching)</th>
          <th>Inc Amount (TCFA)</th>
          <th>Inc Amount (Coaching)</th>
          <th>Amount Field Work</th>
          <th className="highlight-col">Total Incentive, LC</th>
        </tr>
      </thead>
      <tbody>
        {computedRows.map((row, i) => (
          <tr key={`${row.name}-summary-${i}`} className="fade-in">
            <td>{i + 1}</td>
            <td className="summary-name">{row.name}</td>
            <td className="summary-position">{row.position}</td>
            <td>{formatNum(Math.round(row.targetForQuarterLC))}</td>
            <td>{row.reimbursablePct}%</td>
            <td>{formatNum(Math.round(row.targetBaseLC))}</td>
            <td>{formatNum(Math.round(row.targetSalesResult))}</td>
            <td>{formatNum(row.product1Amount)}</td>
            <td>{formatNum(row.product2Amount)}</td>
            <td>{formatNum(row.product3Amount)}</td>
            <td>{formatNum(row.product4Amount)}</td>
            <td className="summary-highlight">
              {formatNum(row.incSalesResult)}
            </td>
            <td>{formatNum(Math.round(row.targetTCFA))}</td>
            <td>{formatNum(Math.round(row.targetCoaching))}</td>
            <td>{formatNum(row.incTCFA)}</td>
            <td>{formatNum(row.incCoaching)}</td>
            <td className="summary-highlight">
              {formatNum(row.fieldWork)}
            </td>
            <td className="highlight-col summary-total">
              {formatNum(row.totalIncentiveLC)}
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
