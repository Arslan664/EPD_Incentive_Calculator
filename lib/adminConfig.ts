/**
 * Admin Panel — Shared Config Types & Default State
 * Central store for all Admin module configurations.
 */

// ── ICP Config ─────────────────────────────────────────────────────────────
export interface ICPConfig {
  country: string;
  role: string;
  salesSplitPct: number;       // 80 (sales result) or 85
  qualitativeSplitPct: number; // 20 (TCFA+coaching) or 15
  npiThresholdMin: number;     // 5
  npiThresholdMax: number;     // 10
  payoutCap: number;           // 250
  tcfaTarget: number;          // 80
  cpaTarget: number;           // 90
  coachingThreshold: number;   // 60
  brandWeights: BrandWeight[];
  approvalStatus: "draft" | "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
}

export interface BrandWeight {
  product: string;
  weight: number;
  promoLine: string;
}

// Default ICP from data (Line 1: 50/25/10/15, Line 2: 30/25/25/20, etc.)
export const DEFAULT_BRAND_WEIGHTS: BrandWeight[] = [
  { product: "CREON",      weight: 50, promoLine: "Line 1" },
  { product: "HEPTRAL",    weight: 25, promoLine: "Line 1" },
  { product: "IRS 19",     weight: 10, promoLine: "Line 1" },
  { product: "DUPHALAC",   weight: 15, promoLine: "Line 1" },
  { product: "DUPHASTON",  weight: 30, promoLine: "Line 2" },
  { product: "PHYSIOTENS", weight: 25, promoLine: "Line 2" },
  { product: "HEPTRAL",    weight: 25, promoLine: "Line 2" },
  { product: "IRS 19",     weight: 20, promoLine: "Line 2" },
];

export const DEFAULT_ICP: ICPConfig = {
  country: "Kazakhstan",
  role: "Medical Representative",
  salesSplitPct: 80,
  qualitativeSplitPct: 20,
  npiThresholdMin: 5,
  npiThresholdMax: 10,
  payoutCap: 250,
  tcfaTarget: 80,
  cpaTarget: 90,
  coachingThreshold: 60,
  brandWeights: DEFAULT_BRAND_WEIGHTS,
  approvalStatus: "approved",
};

// ── Payout Grid ─────────────────────────────────────────────────────────────
export interface PayoutBand {
  minAch: number;
  maxAch: number;
  coefficient: number;
  label: string;
}

// From PAYOUT_SCALE in incentiveCalculations.ts
export const DEFAULT_PAYOUT_GRID: PayoutBand[] = [
  { minAch: 0,   maxAch: 89,  coefficient: 0,    label: "< 90% — No Payout" },
  { minAch: 90,  maxAch: 94,  coefficient: 0.70, label: "90–94% — 70%" },
  { minAch: 95,  maxAch: 95,  coefficient: 0.80, label: "95% — 80%" },
  { minAch: 96,  maxAch: 96,  coefficient: 0.82, label: "96% — 82%" },
  { minAch: 97,  maxAch: 97,  coefficient: 0.85, label: "97% — 85%" },
  { minAch: 98,  maxAch: 98,  coefficient: 0.90, label: "98% — 90%" },
  { minAch: 99,  maxAch: 99,  coefficient: 0.96, label: "99% — 96%" },
  { minAch: 100, maxAch: 100, coefficient: 1.00, label: "100% — 100%" },
  { minAch: 101, maxAch: 101, coefficient: 1.10, label: "101% — 110% (+10%)" },
  { minAch: 102, maxAch: 102, coefficient: 1.20, label: "102% — 120% (+10%)" },
  { minAch: 103, maxAch: 103, coefficient: 1.30, label: "103% — 130% (+10%)" },
  { minAch: 104, maxAch: 104, coefficient: 1.40, label: "104% — 140% (+10%)" },
  { minAch: 105, maxAch: 105, coefficient: 1.40, label: "105% — 140%" },
  { minAch: 106, maxAch: 106, coefficient: 1.60, label: "106% — 160%" },
  { minAch: 107, maxAch: 107, coefficient: 1.70, label: "107% — 170%" },
  { minAch: 108, maxAch: 109, coefficient: 1.80, label: "108–109% — 180%" },
  { minAch: 110, maxAch: 114, coefficient: 2.00, label: "110–114% — 200%" },
  { minAch: 115, maxAch: 119, coefficient: 2.15, label: "115–119% — 215%" },
  { minAch: 120, maxAch: 124, coefficient: 2.30, label: "120–124% — 230%" },
  { minAch: 125, maxAch: 250, coefficient: 2.50, label: "125%+ — 250% (Cap)" },
];

// ── OEC Violations ──────────────────────────────────────────────────────────
export interface OECViolation {
  id: string;
  repName: string;
  country: string;
  quarter: string;
  severity: "medium" | "high";
  description: string;
  reductionPct: number;
  status: "open" | "under_review" | "approved" | "appealed" | "closed";
  raisedBy: string;
  raisedAt: string;
  managerNotified: boolean;
}

export const DEFAULT_VIOLATIONS: OECViolation[] = [
  {
    id: "V001",
    repName: "Abasheva Anna",
    country: "Kazakhstan",
    quarter: "Q1 2025",
    severity: "medium",
    description: "Missed CPA training acknowledgement deadline",
    reductionPct: 10,
    status: "approved",
    raisedBy: "OEC KZ",
    raisedAt: "2025-01-20",
    managerNotified: true,
  },
  {
    id: "V002",
    repName: "Aliyev Askar",
    country: "Kazakhstan",
    quarter: "Q1 2025",
    severity: "high",
    description: "Policy breach — unapproved third-party engagement",
    reductionPct: 25,
    status: "under_review",
    raisedBy: "OEC KZ",
    raisedAt: "2025-02-05",
    managerNotified: true,
  },
  {
    id: "V003",
    repName: "Bakisheva Aliya",
    country: "Kazakhstan",
    quarter: "Q2 2025",
    severity: "medium",
    description: "Late submission of field activity log",
    reductionPct: 10,
    status: "open",
    raisedBy: "OEC KZ",
    raisedAt: "2025-04-12",
    managerNotified: false,
  },
];

// ── Qualitative KPIs ────────────────────────────────────────────────────────
export interface QualKPI {
  id: string;
  name: string;
  type: "TCFA" | "CPA" | "Coaching" | "Custom";
  target: number;
  weight: number;
  role: string;
  effortBased: boolean;
}

export const DEFAULT_KPIS: QualKPI[] = [
  { id: "K1", name: "TCFA",          type: "TCFA",     target: 80, weight: 20, role: "Medical Representative", effortBased: false },
  { id: "K2", name: "Coaching KPI",  type: "Coaching", target: 60, weight: 10, role: "Regional Manager",       effortBased: true  },
  { id: "K3", name: "CPA Score",     type: "CPA",      target: 90, weight: 10, role: "Regional Manager",       effortBased: false },
  { id: "K4", name: "Field Goals",   type: "Custom",   target: 80, weight: 10, role: "Medical Representative", effortBased: true  },
];

// ── Approval Workflows ──────────────────────────────────────────────────────
export interface ApprovalStep {
  role: string;
  approver: string;
  status: "pending" | "approved" | "rejected";
  timestamp?: string;
  comment?: string;
}

export interface ApprovalWorkflow {
  id: string;
  subject: string;
  country: string;
  quarter: string;
  type: "ICP" | "Target" | "Payout" | "Exception";
  currentStep: number;
  steps: ApprovalStep[];
  createdAt: string;
}

export const DEFAULT_WORKFLOWS: ApprovalWorkflow[] = [
  {
    id: "WF001",
    subject: "Q2 2025 ICP Configuration — Kazakhstan",
    country: "Kazakhstan",
    quarter: "Q2 2025",
    type: "ICP",
    currentStep: 1,
    steps: [
      { role: "Country Admin",        approver: "Arslan Sohail",    status: "approved", timestamp: "2025-04-01", comment: "Initial config looks correct" },
      { role: "General Manager",      approver: "GM Kazakhstan",    status: "pending" },
      { role: "Regional DVP",         approver: "DVP MEAC",         status: "pending" },
      { role: "Regional CEx Director",approver: "CEx Director EM",  status: "pending" },
    ],
    createdAt: "2025-04-01",
  },
  {
    id: "WF002",
    subject: "Q2 2025 Payout Release — Kazakhstan",
    country: "Kazakhstan",
    quarter: "Q2 2025",
    type: "Payout",
    currentStep: 0,
    steps: [
      { role: "Country Admin",        approver: "Arslan Sohail",    status: "pending" },
      { role: "General Manager",      approver: "GM Kazakhstan",    status: "pending" },
      { role: "Regional DVP",         approver: "DVP MEAC",         status: "pending" },
      { role: "Regional CEx Director",approver: "CEx Director EM",  status: "pending" },
    ],
    createdAt: "2025-04-15",
  },
];

// ── Country Users ────────────────────────────────────────────────────────────
export interface SystemUser {
  id: string;
  name: string;
  role: "CEx Lead" | "HR/C&B" | "Finance" | "OEC" | "GM" | "DVP" | "Rep" | "Admin";
  country: string;
  grade: number;
  eligible: boolean;
  territory: string;
  promoLine: string;
  proRatedMonths: number;
}

export const COUNTRIES_LIST = [
  "Kazakhstan", "Uzbekistan", "Georgia",
  "Azerbaijan", "Armenia", "Kyrgyzstan", "Tajikistan", "Turkmenistan",
];

export const PROMO_LINES = [
  "Line 1", "Line 2", "Line 2 (big cities)",
  "Line 3 (big cities)", "Pharma line",
];

export const ROLES_LIST = [
  "Medical Representative", "Pharm Representative", "Regional Manager",
  "CEx Lead", "HR/C&B", "Finance", "OEC", "GM",
];
