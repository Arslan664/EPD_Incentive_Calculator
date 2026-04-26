/**
 * Excel → Supabase table parser
 * Maps each supported Excel file type to its DB table + column definitions.
 */
import * as XLSX from "xlsx";

// ─── Supported upload types & their DB table mappings ───────────────────────
export const UPLOAD_TYPES = [
  {
    id: "quarterly_performance",
    label: "Quarterly Performance",
    description: "Rep performance data: actual vs plan, TCFA, achievements per quarter",
    table: "quarterly_performance",
    badge: "Core Data",
    color: "#0057A8",
    requiredColumns: ["Name", "Quarter", "TotalAct", "TotalPlan", "TCFA_Act"],
    columnMap: {
      Name: "rep_name",
      Quarter: "quarter_label",
      TotalAct: "total_actual",
      TotalPlan: "total_plan",
      TCFA_Act: "tcfa_pct",
      Status: "status",
      ReimbursableMonths_Sum: "reimbursable_months_pct",
      TargetForQuarter_Sum: "target_incentive",
    },
  },
  {
    id: "product_performance",
    label: "Product Performance",
    description: "Per-product breakdown: P1/P2/P3 actual, plan values per rep per quarter",
    table: "product_performance",
    badge: "Products",
    color: "#0E7A4F",
    requiredColumns: ["Name", "Quarter", "P1Name", "P1Act", "P1Plan"],
    columnMap: {
      Name: "rep_name",
      Quarter: "quarter_label",
      P1Name: "p1_name",
      P1Act: "p1_actual",
      P1Plan: "p1_plan",
      P2Name: "p2_name",
      P2Act: "p2_actual",
      P2Plan: "p2_plan",
      P3Name: "p3_name",
      P3Act: "p3_actual",
      P3Plan: "p3_plan",
    },
  },
  {
    id: "representatives",
    label: "Staff / Representatives",
    description: "Staff roster: names, positions, promo lines, cities, statuses",
    table: "representatives",
    badge: "HR Data",
    color: "#7C3AED",
    requiredColumns: ["Name", "Position", "PromoLine"],
    columnMap: {
      Name: "name",
      Position: "position_title",
      PromoLine: "promo_line_name",
      Country: "country_name",
      Status: "status",
    },
  },
  {
    id: "tcfa_scores",
    label: "TCFA Scores",
    description: "TCFA personal target % and grand total % per rep per quarter",
    table: "tcfa_scores",
    badge: "TCFA",
    color: "#B45309",
    requiredColumns: ["Name", "Quarter", "TCFA_Act"],
    columnMap: {
      Name: "rep_name",
      Quarter: "quarter_label",
      TCFA_Act: "grand_total_pct",
    },
  },
  {
    id: "quarters",
    label: "Quarters / Exchange Rates",
    description: "Quarter labels, year, quarter number, LC/USD exchange rate",
    table: "quarters",
    badge: "Reference",
    color: "#0E6E9A",
    requiredColumns: ["Quarter", "Year"],
    columnMap: {
      Quarter: "label",
      Year: "year",
      ExchangeRate: "exchange_rate_lc_usd",
    },
  },
] as const;

export type UploadTypeId = (typeof UPLOAD_TYPES)[number]["id"];

// ─── Parse Excel buffer → array of row objects ───────────────────────────────
export function parseExcelFile(buffer: ArrayBuffer): Record<string, unknown>[][] {
  const workbook = XLSX.read(buffer, { type: "array" });
  return workbook.SheetNames.map(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  });
}

// ─── Validate rows against required columns ──────────────────────────────────
export function validateRows(
  rows: Record<string, unknown>[],
  requiredColumns: readonly string[]
): { valid: boolean; missing: string[]; sampleRow: Record<string, unknown> | null } {
  if (!rows.length) return { valid: false, missing: requiredColumns.slice(), sampleRow: null };
  const sampleRow = rows[0];
  const keys = Object.keys(sampleRow);
  const missing = requiredColumns.filter(col => !keys.includes(col));
  return { valid: missing.length === 0, missing, sampleRow };
}

// ─── Map Excel rows to DB column names ──────────────────────────────────────
export function mapRowsToDbColumns(
  rows: Record<string, unknown>[],
  columnMap: Record<string, string>
): Record<string, unknown>[] {
  return rows.map(row => {
    const mapped: Record<string, unknown> = {};
    for (const [excelCol, dbCol] of Object.entries(columnMap)) {
      if (excelCol in row) {
        mapped[dbCol] = row[excelCol];
      }
    }
    return mapped;
  });
}
