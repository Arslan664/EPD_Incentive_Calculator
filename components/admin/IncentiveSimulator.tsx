"use client";

import { useState, useMemo } from "react";
import {
  Calculator, RefreshCw, TrendingUp, DollarSign,
  CheckCircle2, AlertTriangle, Info,
} from "lucide-react";
import {
  getPaymentCoefficient,
  getTCFACoefficient,
  getTICCoefficient,
  isRegionalManager,
} from "@/lib/incentiveCalculations";

/* ── Design tokens ─────────────────────────────────────────────── */
const NAVY   = "#0B1F3A";
const NAVY2  = "#122D5A";
const BLUE   = "#0057A8";
const BORDER = "#D0DCE8";
const BG     = "#F0F4F8";
const T_MAIN = "#0F1827";
const T_SUB  = "#6B8499";
const T_MUT  = "#3D5875";
const GREEN  = "#0E7A4F";
const AMBER  = "#B45309";
const RED    = "#B91C1C";

/* ── Promo line → products + weights ──────────────────────────── */
const PROMO_CONFIGS: Record<string, { product: string; weight: number }[]> = {
  "Line 1": [
    { product: "CREON",    weight: 50 },
    { product: "HEPTRAL",  weight: 25 },
    { product: "IRS 19",   weight: 10 },
    { product: "DUPHALAC", weight: 15 },
  ],
  "Line 2": [
    { product: "DUPHASTON",  weight: 30 },
    { product: "PHYSIOTENS", weight: 25 },
    { product: "HEPTRAL",    weight: 25 },
    { product: "IRS 19",     weight: 20 },
  ],
  "Line 2 (big cities)": [
    { product: "DUPHASTON",  weight: 10 },
    { product: "PHYSIOTENS", weight: 30 },
    { product: "HEPTRAL",    weight: 30 },
    { product: "IRS 19",     weight: 30 },
  ],
  "Line 3 (big cities)": [
    { product: "DUPHASTON",  weight: 45 },
    { product: "FEMOSTON",   weight: 25 },
    { product: "DUPHALAC",   weight: 25 },
    { product: "PHYSIOTENS", weight: 5  },
  ],
  "Pharma line": [
    { product: "CREON",    weight: 40 },
    { product: "DUPHALAC", weight: 35 },
    { product: "IRS 19",   weight: 25 },
    { product: "—",        weight: 0  },
  ],
  "Regional Manager": [
    { product: "Portfolio 1", weight: 50 },
    { product: "Portfolio 2", weight: 25 },
    { product: "Portfolio 3", weight: 20 },
    { product: "Portfolio 4", weight: 5  },
  ],
};

const POSITIONS   = ["Medical Representative", "Pharm Representative", "Regional Manager"];
const PROMO_LINES = Object.keys(PROMO_CONFIGS).filter(k => k !== "Regional Manager");
const QUARTERS    = ["Q1", "Q2", "Q3", "Q4"];
const QCOLORS     = [BLUE, "#7C3AED", GREEN, AMBER];

const TARGET_INCENTIVE: Record<string, number> = {
  "Medical Representative": 395525,
  "Pharm Representative":   395525,
  "Regional Manager":       726000,
};

const EXCHANGE_RATES: Record<string, number> = {
  Kazakhstan: 332.7,
  Uzbekistan: 12800,
  Georgia:    2.7,
  Azerbaijan: 1.7,
  Armenia:    390,
};

/* ── Types ─────────────────────────────────────────────────────── */
interface ProductInput { actual: string; plan: string; }

interface QuarterInput {
  reimbursableMonths: string;
  tcfaPct: string;
  ticPct: string;
  products: ProductInput[];
}

type YearInputs = Record<string, QuarterInput>;

interface QuarterResult {
  targetBase: number;
  targetSalesResult: number;
  targetTCFA: number;
  targetCoaching: number;
  productAmounts: number[];
  incSalesResult: number;
  incTCFA: number;
  incCoaching: number;
  fieldWork: number;
  totalLC: number;
  totalUSD: number;
  achievementPct: number;
  payoutCoeff: number;
  payoutVsTarget: number;
}

/* ── Tiny helpers ─────────────────────────────────────────────── */
const n   = (s: string)           => parseFloat(s) || 0;
const pct = (a: number, p: number) => (a > 0 ? (p / a) * 100 : 0);
const fmt = (v: number, dec = 0)  =>
  v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtLC  = (v: number) => `${fmt(Math.round(v))} LC`;
const fmtUSD = (v: number) => `$${fmt(v, 0)}`;

function achColor(p: number) {
  if (p >= 110) return GREEN;
  if (p >= 100) return BLUE;
  if (p >= 90)  return AMBER;
  return RED;
}

/* ── Calculation logic (unchanged) ───────────────────────────── */
function calcQuarter(
  qi: QuarterInput,
  position: string,
  promoLine: string,
  tiLC: number,
  exRate: number,
): QuarterResult {
  const isRM       = isRegionalManager(position);
  const months     = Math.min(Math.max(n(qi.reimbursableMonths), 1), 3);
  const reimbPct   = (months / 3) * 100;
  const targetBase = tiLC * (reimbPct / 100);

  const targetSalesResult = targetBase * 0.8;
  const tcfaShare         = isRM ? 0.10 : 0.20;
  const coachShare        = isRM ? 0.10 : 0;
  const targetTCFA        = targetBase * tcfaShare;
  const targetCoaching    = targetBase * coachShare;

  const config = isRM
    ? PROMO_CONFIGS["Regional Manager"]
    : (PROMO_CONFIGS[promoLine] ?? PROMO_CONFIGS["Line 1"]);

  const productAmounts = config.map((c, i) => {
    const p      = qi.products[i] || { actual: "0", plan: "0" };
    const achPct = n(p.plan) > 0 ? (n(p.actual) / n(p.plan)) * 100 : 0;
    const coeff  = getPaymentCoefficient(achPct);
    return targetSalesResult * (c.weight / 100) * coeff;
  });

  const incSalesResult  = productAmounts.reduce((s, v) => s + v, 0);
  const totalActual     = qi.products.reduce((s, p) => s + n(p.actual), 0);
  const totalPlan       = qi.products.reduce((s, p) => s + n(p.plan),   0);
  const achievementPct  = pct(totalPlan, totalActual);

  const tcfaCoeff   = getTCFACoefficient(n(qi.tcfaPct));
  const incTCFA     = targetTCFA * tcfaCoeff;
  const ticCoeff    = isRM ? getTICCoefficient(n(qi.ticPct)) : 0;
  const incCoaching = targetCoaching * ticCoeff;

  const fieldWork      = incTCFA + incCoaching;
  const totalLC        = incSalesResult + fieldWork;
  const totalUSD       = exRate > 0 ? totalLC / exRate : 0;
  const overallCoeff   = getPaymentCoefficient(achievementPct);
  const payoutVsTarget = targetBase > 0 ? (totalLC / targetBase) * 100 : 0;

  return {
    targetBase, targetSalesResult, targetTCFA, targetCoaching,
    productAmounts, incSalesResult, incTCFA, incCoaching,
    fieldWork, totalLC, totalUSD, achievementPct,
    payoutCoeff: overallCoeff, payoutVsTarget,
  };
}

/* ── Shared input style helper ───────────────────────────────── */
function inputCls(accentColor = BLUE) {
  return {
    border: `1.5px solid ${BORDER}`,
    backgroundColor: "#FFF",
    color: T_MAIN,
    borderRadius: "10px",
    padding: "9px 12px",
    fontSize: "13px",
    fontWeight: "700",
    outline: "none",
    width: "100%",
    transition: "border-color .15s, box-shadow .15s",
    accentColor,
  } as React.CSSProperties;
}

function focusHandlers(col = BLUE) {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      (e.target as HTMLElement).style.borderColor = col;
      (e.target as HTMLElement).style.boxShadow  = `0 0 0 3px ${col}18`;
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      (e.target as HTMLElement).style.borderColor = BORDER;
      (e.target as HTMLElement).style.boxShadow  = "none";
    },
  };
}

/* ── Main component ──────────────────────────────────────────── */
export default function IncentiveSimulator() {
  const [position,  setPosition]  = useState("Medical Representative");
  const [promoLine, setPromoLine] = useState("Line 1");
  const [country,   setCountry]   = useState("Kazakhstan");
  const [customTI,  setCustomTI]  = useState("");
  const [customFX,  setCustomFX]  = useState("");

  const isRM   = isRegionalManager(position);
  const ti     = n(customTI) > 0 ? n(customTI) : (TARGET_INCENTIVE[position] ?? 395525);
  const exRate = n(customFX) > 0 ? n(customFX) : (EXCHANGE_RATES[country]    ?? 332.7);
  const config = isRM
    ? PROMO_CONFIGS["Regional Manager"]
    : (PROMO_CONFIGS[promoLine] ?? PROMO_CONFIGS["Line 1"]);

  const initQtr = (): QuarterInput => ({
    reimbursableMonths: "3",
    tcfaPct:            "95",
    ticPct:             "70",
    products:           config.map(() => ({ actual: "", plan: "" })),
  });

  const [inputs, setInputs] = useState<YearInputs>({
    Q1: initQtr(), Q2: initQtr(), Q3: initQtr(), Q4: initQtr(),
  });

  const resetAll = () =>
    setInputs({ Q1: initQtr(), Q2: initQtr(), Q3: initQtr(), Q4: initQtr() });

  const updateQtrField = (
    q: string,
    field: keyof Omit<QuarterInput, "products">,
    val: string,
  ) => setInputs(prev => ({ ...prev, [q]: { ...prev[q], [field]: val } }));

  const updateProduct = (
    q: string, pi: number, field: keyof ProductInput, val: string,
  ) => setInputs(prev => ({
    ...prev,
    [q]: {
      ...prev[q],
      products: prev[q].products.map((p, i) => i === pi ? { ...p, [field]: val } : p),
    },
  }));

  const handlePositionChange = (pos: string) => {
    setPosition(pos);
    setCustomTI("");
    resetAll();
  };

  const handlePromoLineChange = (pl: string) => {
    setPromoLine(pl);
    resetAll();
  };

  /* Real-time computed results */
  const results = useMemo(
    () => Object.fromEntries(
      QUARTERS.map(q => [q, calcQuarter(inputs[q], position, promoLine, ti, exRate)])
    ) as Record<string, QuarterResult>,
    [inputs, position, promoLine, ti, exRate],
  );

  const annual = useMemo(() => ({
    totalLC:    QUARTERS.reduce((s, q) => s + results[q].totalLC,         0),
    totalUSD:   QUARTERS.reduce((s, q) => s + results[q].totalUSD,        0),
    incSales:   QUARTERS.reduce((s, q) => s + results[q].incSalesResult,  0),
    fieldWork:  QUARTERS.reduce((s, q) => s + results[q].fieldWork,       0),
    targetBase: QUARTERS.reduce((s, q) => s + results[q].targetBase,      0),
  }), [results]);

  const annualPayout =
    annual.targetBase > 0 ? (annual.totalLC / annual.targetBase) * 100 : 0;

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ────────────────── HERO HEADER ────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-7"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 60%, #152F60 100%)`,
          boxShadow: "0 8px 40px rgba(11,31,58,0.28)",
        }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,87,168,0.22) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }} />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,87,168,0.28)", color: "#A0BFCE", border: "1px solid rgba(0,87,168,0.35)" }}>
                <Calculator className="w-3 h-3" /> Incentive Simulator
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(14,122,79,0.20)", color: "#86EFAC", border: "1px solid rgba(14,122,79,0.30)" }}>
                Live Calculation
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "#FFFFFF" }}>
              Annual Incentive Calculator
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed max-w-lg"
              style={{ color: "rgba(160,191,206,0.70)" }}>
              Fill in all fields for each quarter. Results update instantly — no save needed.
            </p>
          </div>

          {/* Live annual summary pills */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3">
            {[
              { label: "Annual LC",  value: fmtLC(annual.totalLC),        icon: Calculator,  c: "#A0BFCE" },
              { label: "Annual USD", value: fmtUSD(annual.totalUSD),       icon: DollarSign,  c: "#86EFAC" },
              { label: "Sales Inc",  value: fmtLC(annual.incSales),        icon: TrendingUp,  c: "#A0BFCE" },
              { label: "Payout %",   value: `${annualPayout.toFixed(0)}%`, icon: CheckCircle2,
                c: annualPayout >= 100 ? "#86EFAC" : annualPayout >= 90 ? "#FCD34D" : "#FCA5A5" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(160,191,206,0.18)" }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.c }} />
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: "rgba(160,191,206,0.50)" }}>{s.label}</p>
                    <p className="text-[14px] font-black leading-tight" style={{ color: "#FFF" }}>{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ────────────────── CONFIGURATION PANEL ────────────────── */}
      <div className="rounded-2xl p-6"
        style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[13px] font-black" style={{ color: T_MAIN }}>Configuration</h3>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
              All fields are editable — change any value to recalculate instantly
            </p>
          </div>
          <button
            onClick={() => { resetAll(); setCustomTI(""); setCustomFX(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-colors"
            style={{ border: `1.5px solid ${BORDER}`, color: T_SUB }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          {/* Position */}
          <div className="lg:col-span-2 flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Position</label>
            <select
              value={position}
              onChange={e => handlePositionChange(e.target.value)}
              style={inputCls()}
              {...focusHandlers()}
            >
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Promo Line — hidden for RM */}
          {!isRM ? (
            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Promo Line</label>
              <select
                value={promoLine}
                onChange={e => handlePromoLineChange(e.target.value)}
                style={inputCls()}
                {...focusHandlers()}
              >
                {PROMO_LINES.map(pl => <option key={pl}>{pl}</option>)}
              </select>
            </div>
          ) : (
            <div className="lg:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Portfolio</label>
              <div className="rounded-xl px-3 py-2.5 text-[13px] font-bold"
                style={{ backgroundColor: BG, border: `1.5px solid ${BORDER}`, color: T_MUT }}>
                Regional Manager Portfolio
              </div>
            </div>
          )}

          {/* Country */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Country</label>
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              style={inputCls()}
              {...focusHandlers()}
            >
              {Object.keys(EXCHANGE_RATES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Target Incentive */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>
              Target Incentive <span className="font-medium text-[9px]">(LC)</span>
            </label>
            <input
              type="number"
              min={0}
              placeholder={fmt(TARGET_INCENTIVE[position] ?? 395525)}
              value={customTI}
              onChange={e => setCustomTI(e.target.value)}
              style={inputCls()}
              {...focusHandlers()}
            />
            <p className="text-[9px] font-medium" style={{ color: T_SUB }}>
              Default: {fmt(ti)} LC
            </p>
          </div>

          {/* FX Rate */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>
              FX Rate <span className="font-medium text-[9px]">(LC / USD)</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder={`${exRate}`}
              value={customFX}
              onChange={e => setCustomFX(e.target.value)}
              style={inputCls()}
              {...focusHandlers()}
            />
            <p className="text-[9px] font-medium" style={{ color: T_SUB }}>
              Default: {exRate} LC/USD
            </p>
          </div>
        </div>

        {/* Product legend */}
        <div className="mt-5 rounded-xl px-4 py-3 flex flex-wrap gap-2 items-center"
          style={{ backgroundColor: "rgba(0,87,168,0.04)", border: "1px solid rgba(0,87,168,0.12)" }}>
          <Info className="w-4 h-4 flex-shrink-0" style={{ color: BLUE }} />
          <span className="text-[11px] font-bold" style={{ color: BLUE }}>
            Products for <strong>{isRM ? "Regional Manager" : promoLine}</strong>:
          </span>
          {config.map(c => (
            <span key={c.product}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${BLUE}10`, color: BLUE, border: `1px solid ${BLUE}20` }}>
              {c.product} — {c.weight}%
            </span>
          ))}
        </div>
      </div>

      {/* ────────────────── QUARTER CARDS (all 4 expanded) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {QUARTERS.map((q, qi) => {
          const inp    = inputs[q];
          const res    = results[q];
          const col    = QCOLORS[qi];
          const achPct = res.achievementPct;

          return (
            <div key={q} className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${BORDER}`, boxShadow: "0 2px 16px rgba(11,31,58,0.08)" }}>

              {/* ── Quarter header ── */}
              <div className="px-5 py-4 flex items-center justify-between"
                style={{
                  background: `linear-gradient(135deg, ${col}18 0%, ${col}06 100%)`,
                  borderBottom: `1px solid ${col}22`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-[16px] text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${col}, ${col}CC)` }}>
                    {q}
                  </div>
                  <div>
                    <p className="text-[14px] font-black" style={{ color: T_MAIN }}>{q} — 2026</p>
                    <p className="text-[10px] font-medium" style={{ color: T_SUB }}>
                      Enter actuals & targets per product
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[22px] font-black leading-none"
                    style={{ color: achColor(achPct) }}>
                    {achPct.toFixed(0)}%
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color: T_SUB }}>
                    Achievement
                  </p>
                </div>
              </div>

              {/* Thin achievement bar */}
              <div style={{ backgroundColor: `${col}18`, height: "5px" }}>
                <div className="h-full transition-all duration-500"
                  style={{ width: `${Math.min(achPct, 130) / 1.3}%`, backgroundColor: achColor(achPct) }} />
              </div>

              <div className="p-5 space-y-5" style={{ backgroundColor: "#FFF" }}>

                {/* ── Quarter-level inputs ── */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T_SUB }}>
                    Quarter Parameters
                  </p>
                  <div className={`grid gap-4 ${isRM ? "grid-cols-3" : "grid-cols-2"}`}>

                    {/* Reimbursable months */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>
                        Reimb. Months
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={3}
                        value={inp.reimbursableMonths}
                        placeholder="3"
                        onChange={e => updateQtrField(q, "reimbursableMonths", e.target.value)}
                        style={{ ...inputCls(col), textAlign: "center" as const }}
                        {...focusHandlers(col)}
                      />
                      <p className="text-[9px] font-medium" style={{ color: T_SUB }}>Enter 1, 2 or 3</p>
                    </div>

                    {/* TCFA % */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>
                        TCFA %
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={inp.tcfaPct}
                        placeholder="95"
                        onChange={e => updateQtrField(q, "tcfaPct", e.target.value)}
                        style={{
                          ...inputCls(col),
                          textAlign: "center" as const,
                          color: getTCFACoefficient(n(inp.tcfaPct)) > 0 ? GREEN : RED,
                        }}
                        {...focusHandlers(col)}
                      />
                      <p className="text-[9px] font-medium" style={{ color: T_SUB }}>
                        Coeff: ×{getTCFACoefficient(n(inp.tcfaPct)).toFixed(2)}
                      </p>
                    </div>

                    {/* Coaching TIC % — RM only */}
                    {isRM && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>
                          Coaching TIC %
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={inp.ticPct}
                          placeholder="70"
                          onChange={e => updateQtrField(q, "ticPct", e.target.value)}
                          style={{
                            ...inputCls(col),
                            textAlign: "center" as const,
                            color: getTICCoefficient(n(inp.ticPct)) > 0 ? GREEN : RED,
                          }}
                          {...focusHandlers(col)}
                        />
                        <p className="text-[9px] font-medium" style={{ color: T_SUB }}>
                          Coeff: ×{getTICCoefficient(n(inp.ticPct)).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Product inputs table ── */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T_SUB }}>
                    Product Sales
                  </p>

                  {/* Column headers */}
                  <div className="grid grid-cols-12 gap-2 px-1 mb-2">
                    <p className="col-span-4 text-[9px] font-black uppercase tracking-wider" style={{ color: T_SUB }}>Product</p>
                    <p className="col-span-2 text-[9px] font-black uppercase tracking-wider text-center" style={{ color: T_SUB }}>Wt%</p>
                    <p className="col-span-3 text-[9px] font-black uppercase tracking-wider text-right" style={{ color: T_SUB }}>Actual</p>
                    <p className="col-span-3 text-[9px] font-black uppercase tracking-wider text-right" style={{ color: T_SUB }}>Target</p>
                  </div>

                  <div className="space-y-2.5">
                    {config.map((c, pi) => {
                      const p    = inp.products[pi] || { actual: "", plan: "" };
                      const pAch = n(p.plan) > 0 ? (n(p.actual) / n(p.plan)) * 100 : 0;
                      const pAmt = res.productAmounts[pi] || 0;

                      return (
                        <div key={pi} className="rounded-xl p-3 space-y-2"
                          style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>

                          {/* Product row */}
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <p className="text-[11px] font-bold leading-tight" style={{ color: T_MAIN }}>{c.product}</p>
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: `${col}18`, color: col }}>
                                {c.weight}%
                              </span>
                            </div>
                            {/* Actual input */}
                            <div className="col-span-3">
                              <input
                                type="number"
                                min={0}
                                value={p.actual}
                                placeholder="0"
                                onChange={e => updateProduct(q, pi, "actual", e.target.value)}
                                className="w-full rounded-lg px-2 py-1.5 text-[12px] font-bold text-right outline-none"
                                style={{ border: `1.5px solid ${BORDER}`, backgroundColor: "#FFF", color: T_MAIN }}
                                onFocus={e => { e.target.style.borderColor = col; e.target.style.boxShadow = `0 0 0 2px ${col}20`; }}
                                onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }}
                              />
                            </div>
                            {/* Target input */}
                            <div className="col-span-3">
                              <input
                                type="number"
                                min={0}
                                value={p.plan}
                                placeholder="0"
                                onChange={e => updateProduct(q, pi, "plan", e.target.value)}
                                className="w-full rounded-lg px-2 py-1.5 text-[12px] font-bold text-right outline-none"
                                style={{ border: `1.5px solid ${col}50`, backgroundColor: `${col}08`, color: T_MAIN }}
                                onFocus={e => { e.target.style.borderColor = col; e.target.style.boxShadow = `0 0 0 2px ${col}20`; }}
                                onBlur={e => { e.target.style.borderColor = `${col}50`; e.target.style.boxShadow = "none"; }}
                              />
                            </div>
                          </div>

                          {/* Mini progress + incentive result */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BORDER }}>
                              <div className="h-full rounded-full transition-all duration-400"
                                style={{ width: `${Math.min(pAch, 130) / 1.3}%`, backgroundColor: achColor(pAch) }} />
                            </div>
                            <span className="text-[9px] font-black w-8 text-right flex-shrink-0"
                              style={{ color: achColor(pAch) }}>
                              {pAch.toFixed(0)}%
                            </span>
                            <span className="text-[10px] font-black flex-shrink-0 w-24 text-right"
                              style={{ color: col }}>
                              → {fmtLC(pAmt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Quarter results strip ── */}
                <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                  style={{ backgroundColor: `${col}08`, border: `1.5px solid ${col}20` }}>
                  {[
                    { label: "Total LC",   value: fmtLC(res.totalLC),        color: col   },
                    { label: "Total USD",  value: fmtUSD(res.totalUSD),       color: GREEN },
                    { label: "Sales Inc",  value: fmtLC(res.incSalesResult),  color: T_MUT },
                    { label: "TCFA Inc",   value: fmtLC(res.incTCFA),         color: T_MUT },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col gap-0.5">
                      <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: T_SUB }}>{s.label}</p>
                      <p className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Payout vs target */}
                <div className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: `${achColor(res.payoutVsTarget)}10`,
                    border: `1.5px solid ${achColor(res.payoutVsTarget)}28`,
                  }}>
                  <div>
                    <p className="text-[11px] font-bold" style={{ color: T_SUB }}>Payout vs Target</p>
                    <p className="text-[10px] font-medium" style={{ color: T_SUB }}>
                      Target base: {fmtLC(res.targetBase)}
                    </p>
                  </div>
                  <p className="text-[22px] font-black" style={{ color: achColor(res.payoutVsTarget) }}>
                    {res.payoutVsTarget.toFixed(0)}%
                  </p>
                </div>

              </div>{/* /card body */}
            </div>
          );
        })}
      </div>

      {/* ────────────────── ANNUAL SUMMARY TABLE ────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>

        <div className="px-6 py-4"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[15px]" style={{ color: "#FFF" }}>Annual Summary</h3>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.70)" }}>
                Full-year projected incentive · {position} · {isRM ? "Regional Manager portfolio" : promoLine}
              </p>
            </div>
            <span className="text-[12px] font-black px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.10)", color: "#FFF" }}>
              FX: {exRate} LC / USD
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: BG }}>
                {["Quarter","Months","TCFA %","Achievement","Sales Inc LC","TCFA Inc LC","Field Work LC","Total LC","Total USD","Payout %"].map(h => (
                  <th key={h}
                    className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                    style={{ color: T_SUB, borderBottom: `1px solid ${BORDER}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {QUARTERS.map((q, qi) => {
                const r   = results[q];
                const inp = inputs[q];
                const col = QCOLORS[qi];
                return (
                  <tr key={q}
                    style={{ borderBottom: `1px solid ${BG}` }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black"
                          style={{ backgroundColor: `${col}18`, color: col }}>{q}</div>
                        <span className="text-[12px] font-bold" style={{ color: T_MAIN }}>{q} 2026</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold" style={{ color: T_MUT }}>
                      {inp.reimbursableMonths || 0}/3
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-bold"
                        style={{ color: getTCFACoefficient(n(inp.tcfaPct)) > 0 ? GREEN : RED }}>
                        {inp.tcfaPct || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-bold" style={{ color: achColor(r.achievementPct) }}>
                        {r.achievementPct.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] font-bold" style={{ color: T_MAIN }}>{fmtLC(r.incSalesResult)}</td>
                    <td className="px-4 py-3 text-[12px] font-bold" style={{ color: T_MAIN }}>{fmtLC(r.incTCFA)}</td>
                    <td className="px-4 py-3 text-[12px] font-bold" style={{ color: T_MAIN }}>{fmtLC(r.fieldWork)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-black" style={{ color: col }}>{fmtLC(r.totalLC)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-black" style={{ color: GREEN }}>{fmtUSD(r.totalUSD)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${Math.min(r.payoutVsTarget, 250) / 2.5}%`, backgroundColor: achColor(r.payoutVsTarget) }} />
                        </div>
                        <span className="text-[12px] font-black" style={{ color: achColor(r.payoutVsTarget) }}>
                          {r.payoutVsTarget.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: `${BLUE}06`, borderTop: `2px solid ${BLUE}25` }}>
                <td className="px-4 py-4 text-[13px] font-black" colSpan={4} style={{ color: T_MAIN }}>
                  Annual Total
                </td>
                <td className="px-4 py-4 text-[12px] font-bold" style={{ color: T_MAIN }}>{fmtLC(annual.incSales)}</td>
                <td className="px-4 py-4" colSpan={2}>
                  <span className="text-[12px] font-bold" style={{ color: T_MAIN }}>{fmtLC(annual.fieldWork)}</span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-[15px] font-black" style={{ color: BLUE }}>{fmtLC(annual.totalLC)}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-[15px] font-black" style={{ color: GREEN }}>{fmtUSD(annual.totalUSD)}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[14px] font-black" style={{ color: achColor(annualPayout) }}>
                    {annualPayout.toFixed(0)}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 flex flex-wrap items-center gap-4"
          style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG }}>
          {[
            { icon: CheckCircle2,  color: GREEN, text: "≥ 100% ACH: Full payout + progressive uplift" },
            { icon: AlertTriangle, color: AMBER, text: "90–99% ACH: Graduated payout 70–96%" },
            { icon: AlertTriangle, color: RED,   text: "< 90% ACH: No sales incentive payout" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.text} className="flex items-center gap-1.5">
                <Icon className="w-3 h-3 flex-shrink-0" style={{ color: s.color }} />
                <span className="text-[10px] font-medium" style={{ color: T_SUB }}>{s.text}</span>
              </div>
            );
          })}
          <div className="ml-auto text-[10px] font-bold" style={{ color: T_SUB }}>
            Cap: 250% payout at 120%+ ACH
          </div>
        </div>
      </div>

    </div>
  );
}
