/**
 * Type definitions for the EPD Incentive data records.
 */

export interface IncentiveRecord {
  // Identity
  Name: string;
  Position: string;
  Position_Sum: string;
  PromoLine: string;
  Quarter: string;
  Country?: string;
  Year?: string;

  // Performance (Actual vs Plan)
  TotalAct: string;
  TotalPlan: string;
  P1Name: string;
  P1Act: string;
  P1Plan: string;
  P2Name: string;
  P2Act: string;
  P2Plan: string;
  P3Name: string;
  P3Act: string;
  P3Plan: string;

  // TCFA
  TCFA_Act: string;

  // Summary / Financials
  Id_Sum: string;
  TargetForQuarter_Sum: string;
  ReimbursableMonths_Sum: string;
  TargetBase_Sum: string;
  TargetSalesResult_Sum: string;
  Product1_Sum: string;
  Product2_Sum: string;
  Product3_Sum: string;
  Product4_Sum: string;
  IncSalesResult_Sum: string;
  TargetTCFA_Sum: string;
  TargetCoaching_Sum: string;
  IncTCFA_Sum: string;
  IncCoaching_Sum: string;
  FieldWork_Sum: string;
  TotalIncentive_Sum: string;
  Team_Sum: string | null;

  // Legacy aliases
  TotalTarget?: string;
  TotalIncentive?: string;
}

/**
 * Filter state for the dashboard.
 * Views: "detailed" (Actual vs Plan), "summary" (Financials), "signoff" (Statement of Bonuses)
 */
export interface Filters {
  country: string;
  year: string;
  quarter: string;
  team: string;
  rep: string;
  search: string;
  view: "detailed" | "summary" | "signoff";
}

/**
 * Sign-Off / Statement of Bonuses record.
 * Computed dynamically from performance data + exchange rate.
 */
export interface SignOffRecord {
  rowNum: number;
  name: string;
  position: string;
  targetIncentiveLC: number;
  targetIncentiveUSD: number;
  incSalesResultLC: number;
  incFieldWorkLC: number;
  totalIncentiveLC: number;
  totalIncentiveUSD: number;
  payoutVsTargetPct: number;
}
