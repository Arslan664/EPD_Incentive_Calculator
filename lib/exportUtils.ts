import { IncentiveRecord } from "./types";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "./incentiveCalculations";

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSummaryViewToCSV = (data: IncentiveRecord[]) => {
  if (data.length === 0) return;

  const validData = data.filter((d) => d.Name && d.Name.trim() !== "");

  const headers = [
    "Representative",
    "Position",
    "Target Inc LC",
    "Target Inc USD",
    "Inc (Sales) LC",
    "Inc (Fld Work)",
    "Total Inc LC",
    "Total Inc USD",
    "Payout vs Target %"
  ];

  const rows = validData.map((d) => {
    const input = buildPerformanceInputFromRecord(d);
    const computed = computeSummaryRow(input);
    return [
      `"${computed.name}"`,
      `"${computed.position}"`,
      computed.targetBaseLC,
      computed.targetIncentiveUSD,
      computed.incSalesResult,
      computed.fieldWork,
      computed.totalIncentiveLC,
      computed.totalIncentiveUSD,
      `${computed.payoutVsTargetPct}%`
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadCSV(csvContent, "Incentive_Summary.csv");
};

export const exportSignOffViewToCSV = (data: IncentiveRecord[], region: string, period: string) => {
  if (data.length === 0) return;

  const validData = data.filter((d) => d.Name && d.Name.trim() !== "");

  const headers = [
    "Row",
    "Name",
    "Position",
    "Target Inc LC",
    "Target Inc USD",
    "Inc (Sales) LC",
    "Inc (Fld Work) LC",
    "Total Inc LC",
    "Total Inc USD",
    "Payout vs Target"
  ];

  const rows = validData.map((d, i) => {
    const input = buildPerformanceInputFromRecord(d);
    const computed = computeSummaryRow(input);
    return [
      i + 1,
      `"${computed.name}"`,
      `"${computed.position}"`,
      computed.targetBaseLC,
      computed.targetIncentiveUSD,
      computed.incSalesResult,
      computed.fieldWork,
      computed.totalIncentiveLC,
      computed.totalIncentiveUSD,
      `${computed.payoutVsTargetPct}%`
    ].join(",");
  });

  // Adding an intro row for the corporate header
  const titleRow = `"Abbott Established Pharmaceuticals Division - Statement of Bonuses for ${region} - ${period}"${",".repeat(headers.length - 1)}`;
  
  const csvContent = [titleRow, "", headers.join(","), ...rows].join("\n");
  downloadCSV(csvContent, "SignOff_Statement.csv");
};
