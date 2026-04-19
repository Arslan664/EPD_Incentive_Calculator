/**
 * Incentive Calculation Engine
 *
 * Implements the exact Excel formulas from "EPD New Incentive File.xlsx"
 * to compute Summary Calculation values dynamically at runtime.
 *
 * Source formulas reverse-engineered from:
 *  - INPUT_ASSUMPTIONS_CALC.csv (achievement %, payment coefficients)
 *  - Summary_calculation.csv    (target splits, product amounts, totals)
 *
 * Key splits by position:
 *  Medical/Pharm Rep:  Sales Result 80%, TCFA 20%, Coaching 0%
 *  Regional Manager:   Sales Result 80%, TCFA 10%, Coaching 10%
 */

import { cleanNum } from "./utils";
import type { IncentiveRecord } from "./types";

// ─────────────────────────────────────────────────
// 1. PAYMENT COEFFICIENT LOOKUP TABLE
// ─────────────────────────────────────────────────

/**
 * Achievement % → Payment multiplier.
 * Extracted from the "Payment coefficient" columns in INPUT_ASSUMPTIONS_CALC.csv
 *
 * Rules:
 *  < 90%  → 0   (no payout — "dash" in Excel)
 *  90-99% → graduated scale
 *  100%   → 1.00
 *  101%+  → progressive multiplier up to max 2.50
 */
const PAYOUT_SCALE: { min: number; max: number; coeff: number }[] = [
  { min: 0, max: 89, coeff: 0 },
  { min: 90, max: 90, coeff: 0.7 },
  { min: 91, max: 91, coeff: 0.7 },
  { min: 92, max: 92, coeff: 0.7 },
  { min: 93, max: 93, coeff: 0.7 },
  { min: 94, max: 94, coeff: 0.7 },
  { min: 95, max: 95, coeff: 0.8 },
  { min: 96, max: 96, coeff: 0.82 },
  { min: 97, max: 97, coeff: 0.85 },
  { min: 98, max: 98, coeff: 0.9 },
  { min: 99, max: 99, coeff: 0.96 },
  { min: 100, max: 100, coeff: 1.0 },
  { min: 101, max: 101, coeff: 1.1 },
  { min: 102, max: 102, coeff: 1.2 },
  { min: 103, max: 103, coeff: 1.3 },
  { min: 104, max: 104, coeff: 1.4 },
  { min: 105, max: 105, coeff: 1.4 },
  { min: 106, max: 106, coeff: 1.6 },
  { min: 107, max: 107, coeff: 1.7 },
  { min: 108, max: 108, coeff: 1.8 },
  { min: 109, max: 109, coeff: 1.8 },
  { min: 110, max: 114, coeff: 2.0 },
  { min: 115, max: 119, coeff: 2.15 },
  { min: 120, max: 124, coeff: 2.3 },
  { min: 125, max: 129, coeff: 2.5 },
  { min: 130, max: 9999, coeff: 2.5 },
];

/**
 * TCFA Incentive payout scale (TCFA % → Multiplier)
 * Based on the data patterns:
 *  < 80%  → 0
 *  80-89% → 0.50
 *  90-94% → 0.50
 *  95-100% → 1.00
 */
const TCFA_SCALE: { min: number; max: number; coeff: number }[] = [
  { min: 0, max: 79, coeff: 0 },
  { min: 80, max: 89, coeff: 0.5 },
  { min: 90, max: 94, coeff: 0.5 },
  { min: 95, max: 100, coeff: 1.0 },
];

/**
 * Time-in-Coaching scale (TIC % → Multiplier)
 * Regional Managers only.
 *  < 60%  → 0
 *  60-79% → 1.0
 *  80%+   → 1.0
 */
const TIC_SCALE: { min: number; max: number; coeff: number }[] = [
  { min: 0, max: 59, coeff: 0 },
  { min: 60, max: 100, coeff: 1.0 },
];

// ─────────────────────────────────────────────────
// 2. LOOKUP HELPERS
// ─────────────────────────────────────────────────

function lookupCoefficient(
  scale: { min: number; max: number; coeff: number }[],
  pct: number
): number {
  const rounded = Math.round(pct);
  for (const band of scale) {
    if (rounded >= band.min && rounded <= band.max) {
      return band.coeff;
    }
  }
  return 0;
}

/** Get payment coefficient for a given product achievement % */
export function getPaymentCoefficient(achievementPct: number): number {
  return lookupCoefficient(PAYOUT_SCALE, achievementPct);
}

/** Get TCFA payout coefficient */
export function getTCFACoefficient(tcfaPct: number): number {
  return lookupCoefficient(TCFA_SCALE, tcfaPct);
}

/** Get TIC (coaching) payout coefficient */
export function getTICCoefficient(ticPct: number): number {
  return lookupCoefficient(TIC_SCALE, ticPct);
}

// ─────────────────────────────────────────────────
// 3. CORE CALCULATION FUNCTIONS
// ─────────────────────────────────────────────────

/** Whether a position is Regional Manager */
export function isRegionalManager(position: string): boolean {
  return position?.toLowerCase().includes("regional manager");
}

/**
 * Target Base = Target Incentive × (Reimbursable months / 100)
 */
export function calculateTargetBase(
  targetIncentive: number,
  reimbursablePct: number
): number {
  return targetIncentive * (reimbursablePct / 100);
}

/**
 * Target for Sales Result = Target Base × 80%
 */
export function calculateTargetSalesResult(targetBase: number): number {
  return targetBase * 0.8;
}

/**
 * Target for TCFA:
 *  Medical/Pharm Rep: Target Base × 20%
 *  Regional Manager:  Target Base × 10%
 */
export function calculateTargetTCFA(
  targetBase: number,
  position: string
): number {
  return targetBase * (isRegionalManager(position) ? 0.1 : 0.2);
}

/**
 * Target for Coaching (RM only):
 *  Regional Manager:  Target Base × 10%
 *  Others:            0
 */
export function calculateTargetCoaching(
  targetBase: number,
  position: string
): number {
  return isRegionalManager(position) ? targetBase * 0.1 : 0;
}

/**
 * Product amount = Target Sales Result × Portfolio Share × Payment Coefficient
 */
export function calculateProductAmount(
  targetSalesResult: number,
  portfolioSharePct: number,
  achievementPct: number
): number {
  const coeff = getPaymentCoefficient(achievementPct);
  return targetSalesResult * (portfolioSharePct / 100) * coeff;
}

/**
 * Incentive Amount for TCFA = Target TCFA × TCFA Coefficient
 */
export function calculateTCFAIncentive(
  targetTCFA: number,
  tcfaActualPct: number
): number {
  const coeff = getTCFACoefficient(tcfaActualPct);
  return targetTCFA * coeff;
}

/**
 * Incentive Amount for Coaching = Target Coaching × TIC Coefficient
 * (Regional Managers only)
 */
export function calculateCoachingIncentive(
  targetCoaching: number,
  ticActualPct: number
): number {
  if (targetCoaching === 0) return 0;
  const coeff = getTICCoefficient(ticActualPct);
  return targetCoaching * coeff;
}

// ─────────────────────────────────────────────────
// 4. COMPLETE ROW COMPUTATION
// ─────────────────────────────────────────────────

/** Input structure for computing a summary row */
export interface PerformanceInput {
  name: string;
  position: string;
  promoLine: string;
  quarter: string;
  targetIncentive: number; // from quarterly_performance.target_incentive
  reimbursablePct: number; // e.g. 100, 67, 33, 0
  tcfaActualPct: number; // from TCFA scores
  ticActualPct: number; // Time in Coaching (RM only), 0 for others
  // Per-portfolio achievement %
  portfolio1SharePct: number;
  portfolio1AchievementPct: number;
  portfolio2SharePct: number;
  portfolio2AchievementPct: number;
  portfolio3SharePct: number;
  portfolio3AchievementPct: number;
  portfolio4SharePct: number;
  portfolio4AchievementPct: number;
  // Raw performance data for display
  totalActual: number;
  totalPlan: number;
  overallAchievementPct: number;
  // Exchange rate for USD conversion
  exchangeRate?: number;
}

/** Computed summary row output */
export interface ComputedSummaryRow {
  name: string;
  position: string;
  promoLine: string;
  quarter: string;
  targetForQuarterLC: number;
  reimbursablePct: number;
  targetBaseLC: number;
  targetSalesResult: number;
  product1Amount: number;
  product2Amount: number;
  product3Amount: number;
  product4Amount: number;
  incSalesResult: number;
  targetTCFA: number;
  targetCoaching: number;
  incTCFA: number;
  incCoaching: number;
  fieldWork: number;
  totalIncentiveLC: number;
  // Sign-off fields
  targetIncentiveUSD: number;
  totalIncentiveUSD: number;
  payoutVsTargetPct: number;
  incSalesResultForSignOff: number;
  fieldWorkForSignOff: number;
}

/**
 * Compute a complete Summary Calculation row from raw performance inputs.
 * Implements the exact Excel logic.
 */
export function computeSummaryRow(input: PerformanceInput): ComputedSummaryRow {
  const targetBase = calculateTargetBase(
    input.targetIncentive,
    input.reimbursablePct
  );
  const targetSalesResult = calculateTargetSalesResult(targetBase);
  const targetTCFA = calculateTargetTCFA(targetBase, input.position);
  const targetCoaching = calculateTargetCoaching(targetBase, input.position);

  // Product amounts
  const product1Amount = calculateProductAmount(
    targetSalesResult,
    input.portfolio1SharePct,
    input.portfolio1AchievementPct
  );
  const product2Amount = calculateProductAmount(
    targetSalesResult,
    input.portfolio2SharePct,
    input.portfolio2AchievementPct
  );
  const product3Amount = calculateProductAmount(
    targetSalesResult,
    input.portfolio3SharePct,
    input.portfolio3AchievementPct
  );
  const product4Amount = calculateProductAmount(
    targetSalesResult,
    input.portfolio4SharePct,
    input.portfolio4AchievementPct
  );

  const incSalesResult =
    product1Amount + product2Amount + product3Amount + product4Amount;

  // TCFA & Coaching incentives
  const incTCFA = calculateTCFAIncentive(targetTCFA, input.tcfaActualPct);
  const incCoaching = calculateCoachingIncentive(
    targetCoaching,
    input.ticActualPct
  );

  // Field Work = TCFA incentive + Coaching incentive
  const fieldWork = incTCFA + incCoaching;

  // Total Incentive
  const totalIncentiveLC = incSalesResult + fieldWork;

  // USD conversion
  const exchangeRate = input.exchangeRate || 332.7;
  const targetIncentiveUSD = targetBase > 0 ? targetBase / exchangeRate : 0;
  const totalIncentiveUSD =
    totalIncentiveLC > 0 ? totalIncentiveLC / exchangeRate : 0;

  // Payout vs Target
  const payoutVsTargetPct =
    targetBase > 0
      ? Math.round((totalIncentiveLC / targetBase) * 100)
      : 0;

  return {
    name: input.name,
    position: input.position,
    promoLine: input.promoLine,
    quarter: input.quarter,
    targetForQuarterLC: input.targetIncentive,
    reimbursablePct: input.reimbursablePct,
    targetBaseLC: targetBase,
    targetSalesResult,
    product1Amount: Math.round(product1Amount),
    product2Amount: Math.round(product2Amount),
    product3Amount: Math.round(product3Amount),
    product4Amount: Math.round(product4Amount),
    incSalesResult: Math.round(incSalesResult),
    targetTCFA,
    targetCoaching,
    incTCFA: Math.round(incTCFA),
    incCoaching: Math.round(incCoaching),
    fieldWork: Math.round(fieldWork),
    totalIncentiveLC: Math.round(totalIncentiveLC),
    targetIncentiveUSD: Math.round(targetIncentiveUSD),
    totalIncentiveUSD: Math.round(totalIncentiveUSD),
    payoutVsTargetPct,
    incSalesResultForSignOff: Math.round(incSalesResult),
    fieldWorkForSignOff: Math.round(fieldWork),
  };
}

// ─────────────────────────────────────────────────
// 5. BULK COMPUTATION FROM comprehensiveData
// ─────────────────────────────────────────────────

/**
 * Build PerformanceInput from the existing flat IncentiveRecord
 * (the comprehensive_data.ts format).
 *
 * This bridges the legacy data format to the calculation engine,
 * so the Summary and Sign-Off views display computed values.
 */
export function buildPerformanceInputFromRecord(
  record: IncentiveRecord
): PerformanceInput {
  const position = record.Position_Sum || record.Position || "";
  const isRM = isRegionalManager(position);

  const totalAct = cleanNum(record.TotalAct);
  const totalPlan = cleanNum(record.TotalPlan);
  const overallAchievement = totalPlan > 0 ? (totalAct / totalPlan) * 100 : 0;

  // Parse TCFA %
  const tcfaStr = record.TCFA_Act || "0%";
  const tcfaPct = parseFloat(tcfaStr.replace("%", "")) || 0;

  // Target incentive based on position
  const targetIncentive = isRM ? 726000 : 395525;

  // Reimbursable months %
  const reimbStr = record.ReimbursableMonths_Sum || "100%";
  const reimbPct = parseFloat(reimbStr.replace("%", "")) || 0;

  // Per-portfolio actuals and plans
  const p1Act = cleanNum(record.P1Act);
  const p1Plan = cleanNum(record.P1Plan);
  const p2Act = cleanNum(record.P2Act);
  const p2Plan = cleanNum(record.P2Plan);
  const p3Act = cleanNum(record.P3Act);
  const p3Plan = cleanNum(record.P3Plan);

  // Compute per-portfolio achievement %
  const p1Achievement = p1Plan > 0 ? (p1Act / p1Plan) * 100 : 0;
  const p2Achievement = p2Plan > 0 ? (p2Act / p2Plan) * 100 : 0;
  const p3Achievement = p3Plan > 0 ? (p3Act / p3Plan) * 100 : 0;
  // P4 — derive from overall if available, else 0
  // For P4, we use the overall achievement as proxy when P4 data is missing
  const p4Achievement = overallAchievement;

  // Portfolio shares depend on promo line and position
  let shares = getPortfolioShares(record.PromoLine, position);

  return {
    name: record.Name,
    position,
    promoLine: record.PromoLine,
    quarter: record.Quarter,
    targetIncentive,
    reimbursablePct: reimbPct,
    tcfaActualPct: tcfaPct,
    ticActualPct: 0, // TIC data not in the flat record — would come from TIC.csv
    portfolio1SharePct: shares[0],
    portfolio1AchievementPct: p1Achievement,
    portfolio2SharePct: shares[1],
    portfolio2AchievementPct: p2Achievement,
    portfolio3SharePct: shares[2],
    portfolio3AchievementPct: p3Achievement,
    portfolio4SharePct: shares[3],
    portfolio4AchievementPct: p4Achievement,
    totalActual: totalAct,
    totalPlan: totalPlan,
    overallAchievementPct: overallAchievement,
  };
}

/**
 * Get portfolio share percentages based on promo line.
 * These are the standard shares defined in Promo_Product_Input.csv
 */
function getPortfolioShares(
  promoLine: string,
  position: string
): [number, number, number, number] {
  const line = (promoLine || "").toLowerCase();

  if (isRegionalManager(position)) {
    // Regional Managers: 50%, 25%, 20%, 5%
    return [50, 25, 20, 5];
  }

  if (line.includes("line 1")) {
    // Line 1: 50%, 25%, 10%, 15%
    return [50, 25, 10, 15];
  }

  if (line.includes("line 2") && line.includes("big")) {
    // Line 2 (big cities): 10%, 30%, 30%, 30%
    return [10, 30, 30, 30];
  }

  if (line.includes("line 2")) {
    // Line 2: 30%, 25%, 25%, 20%
    return [30, 25, 25, 20];
  }

  if (line.includes("line 3")) {
    // Line 3 (big cities): 45%, 25%, 25%, 5%
    return [45, 25, 25, 5];
  }

  if (line.includes("pharma")) {
    // Pharma line: 40%, 35%, 25%, 0%
    return [40, 35, 25, 0];
  }

  // Default fallback
  return [50, 25, 15, 10];
}
