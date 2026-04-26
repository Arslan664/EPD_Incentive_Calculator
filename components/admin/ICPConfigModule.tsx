"use client";

import { useState } from "react";
import { Sliders, Save, CheckCircle2, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";
import {
  DEFAULT_ICP, ICPConfig, BrandWeight, COUNTRIES_LIST, PROMO_LINES, ROLES_LIST,
} from "@/lib/adminConfig";
import { getPaymentCoefficient } from "@/lib/incentiveCalculations";

const NAVY = "#0B1F3A"; const BLUE = "#0057A8"; const BORDER = "#D0DCE8";
const BG = "#F0F4F8"; const T_MAIN = "#0F1827"; const T_SUB = "#6B8499";
const GREEN = "#0E7A4F"; const AMBER = "#B45309";

function NumInput({ label, value, onChange, min = 0, max = 100, step = 1, unit = "%" }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg px-3 py-2 text-sm font-bold outline-none transition-all"
          style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, color: T_MAIN }}
          onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(0,87,168,0.10)"; }}
          onBlur={e => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }}
        />
        <span className="text-[12px] font-bold flex-shrink-0" style={{ color: T_SUB }}>{unit}</span>
      </div>
    </div>
  );
}

export default function ICPConfigModule() {
  const [config, setConfig] = useState<ICPConfig>({ ...DEFAULT_ICP, brandWeights: [...DEFAULT_ICP.brandWeights] });
  const [saved, setSaved] = useState(false);
  const [activePromo, setActivePromo] = useState("Line 1");

  const filteredWeights = config.brandWeights.filter(w => w.promoLine === activePromo);
  const totalWeight = filteredWeights.reduce((s, w) => s + w.weight, 0);
  const splitOk = config.salesSplitPct + config.qualitativeSplitPct === 100;

  const updateWeight = (product: string, weight: number) => {
    setConfig(c => ({
      ...c,
      brandWeights: c.brandWeights.map(w =>
        w.product === product && w.promoLine === activePromo ? { ...w, weight } : w
      ),
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Live preview — calculate sample incentive with current config
  const sampleTargetBase = 395525;
  const sampleAch = 103;
  const coeff = getPaymentCoefficient(sampleAch);
  const salesShare = config.salesSplitPct / 100;
  const salesResult = sampleTargetBase * salesShare;
  const sampleInc = salesResult * coeff + sampleTargetBase * (config.qualitativeSplitPct / 100);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>ICP Configuration Engine</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            Configure plan parameters per country / role. Changes require approval workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setConfig({ ...DEFAULT_ICP, brandWeights: [...DEFAULT_ICP.brandWeights] })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-colors"
            style={{ color: T_SUB, border: `1px solid ${BORDER}` }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all"
            style={{ background: saved ? `linear-gradient(135deg, ${GREEN}, #0A6040)` : `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save Config"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Plan Parameters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Context */}
          <div className="rounded-xl p-4 grid grid-cols-2 gap-3" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Country</label>
              <select value={config.country} onChange={e => setConfig(c => ({ ...c, country: e.target.value }))}
                className="w-full mt-1 rounded-lg px-3 py-2 text-sm font-medium outline-none"
                style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
                {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Role</label>
              <select value={config.role} onChange={e => setConfig(c => ({ ...c, role: e.target.value }))}
                className="w-full mt-1 rounded-lg px-3 py-2 text-sm font-medium outline-none"
                style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
                {ROLES_LIST.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Split Config */}
          <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Incentive Split</p>
              {!splitOk && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: "rgba(185,28,28,0.08)", color: "#B91C1C", border: "1px solid rgba(185,28,28,0.20)" }}>
                  <AlertTriangle className="w-3 h-3" /> Must total 100%
                </span>
              )}
              {splitOk && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: "rgba(14,122,79,0.08)", color: GREEN, border: "1px solid rgba(14,122,79,0.20)" }}>
                  <CheckCircle2 className="w-3 h-3" /> Valid split
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumInput label="Sales Result %" value={config.salesSplitPct}
                onChange={v => setConfig(c => ({ ...c, salesSplitPct: v, qualitativeSplitPct: 100 - v }))} />
              <NumInput label="Qualitative %" value={config.qualitativeSplitPct}
                onChange={v => setConfig(c => ({ ...c, qualitativeSplitPct: v, salesSplitPct: 100 - v }))} />
            </div>
            {/* Split bar */}
            <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: BG }}>
              <div style={{ width: `${config.salesSplitPct}%`, background: `linear-gradient(90deg, ${BLUE}, #004A91)` }} className="h-full rounded-l-full transition-all duration-300" />
              <div style={{ width: `${config.qualitativeSplitPct}%`, background: `linear-gradient(90deg, ${AMBER}, #92400E)` }} className="h-full rounded-r-full transition-all duration-300" />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: BLUE }} /><span style={{ color: T_SUB }}>Sales Result {config.salesSplitPct}%</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: AMBER }} /><span style={{ color: T_SUB }}>Qualitative {config.qualitativeSplitPct}%</span></span>
            </div>
          </div>

          {/* Thresholds */}
          <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <p className="col-span-full text-[11px] font-black uppercase tracking-widest pb-1" style={{ color: T_SUB, borderBottom: `1px solid ${BORDER}` }}>Thresholds & Caps</p>
            <NumInput label="NPI Min %" value={config.npiThresholdMin} onChange={v => setConfig(c => ({ ...c, npiThresholdMin: v }))} min={1} max={20} />
            <NumInput label="NPI Max %" value={config.npiThresholdMax} onChange={v => setConfig(c => ({ ...c, npiThresholdMax: v }))} min={1} max={30} />
            <NumInput label="Payout Cap %" value={config.payoutCap} onChange={v => setConfig(c => ({ ...c, payoutCap: v }))} min={100} max={300} />
            <NumInput label="TCFA Target %" value={config.tcfaTarget} onChange={v => setConfig(c => ({ ...c, tcfaTarget: v }))} />
            <NumInput label="CPA Target %" value={config.cpaTarget} onChange={v => setConfig(c => ({ ...c, cpaTarget: v }))} />
            <NumInput label="Coaching TIC %" value={config.coachingThreshold} onChange={v => setConfig(c => ({ ...c, coachingThreshold: v }))} />
          </div>

          {/* Brand Weights */}
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: BG }}>
              <Sliders className="w-4 h-4" style={{ color: T_SUB }} />
              <p className="text-[11px] font-black uppercase tracking-widest flex-1" style={{ color: T_SUB }}>Brand Weights</p>
              <div className="flex gap-1">
                {PROMO_LINES.map(pl => (
                  <button key={pl} onClick={() => setActivePromo(pl)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={activePromo === pl
                      ? { backgroundColor: BLUE, color: "#FFF" }
                      : { backgroundColor: "transparent", color: T_SUB, border: `1px solid ${BORDER}` }}>
                    {pl.replace("Line ", "L").replace(" (big cities)", "*")}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {filteredWeights.length === 0 && (
                <p className="text-[12px] text-center py-4" style={{ color: T_SUB }}>No brands configured for this promo line.</p>
              )}
              {filteredWeights.map(w => (
                <div key={w.product} className="flex items-center gap-3">
                  <span className="text-[12px] font-bold w-28 flex-shrink-0" style={{ color: T_MAIN }}>{w.product}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${w.weight}%`, background: `linear-gradient(90deg, ${BLUE}, #004A91)` }} />
                  </div>
                  <input type="number" min={0} max={100} value={w.weight}
                    onChange={e => updateWeight(w.product, parseFloat(e.target.value) || 0)}
                    className="w-16 rounded-lg px-2 py-1.5 text-[12px] font-bold text-center outline-none"
                    style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }} />
                  <span className="text-[11px] font-bold" style={{ color: T_SUB }}>%</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                <span className="text-[11px] font-bold" style={{ color: T_SUB }}>Total Weight</span>
                <span className="text-[13px] font-black" style={{ color: totalWeight === 100 ? GREEN : "#B91C1C" }}>
                  {totalWeight}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview + Status */}
        <div className="flex flex-col gap-4">
          {/* Live calc preview */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
            <div className="px-4 py-3" style={{ background: `linear-gradient(90deg, ${NAVY}, #122D5A)` }}>
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(160,191,206,0.80)" }}>Live Calculation Preview</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(160,191,206,0.55)" }}>Sample rep · 103% ACH · Full months</p>
            </div>
            <div className="p-4 space-y-3" style={{ backgroundColor: "#FFF" }}>
              {[
                { label: "Target Base", value: `${(sampleTargetBase).toLocaleString()} LC` },
                { label: "Sales Result (80%)", value: `${salesResult.toLocaleString(undefined, { maximumFractionDigits: 0 })} LC` },
                { label: "Achievement", value: `${sampleAch}%` },
                { label: "Payout Coeff", value: `×${coeff}` },
                { label: "Total Incentive", value: `${Math.round(sampleInc).toLocaleString()} LC` },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[11px] font-medium" style={{ color: T_SUB }}>{s.label}</span>
                  <span className="text-[12px] font-black" style={{ color: T_MAIN }}>{s.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: T_SUB }}>Effective Split</span>
                <span className="text-[12px] font-black" style={{ color: BLUE }}>{config.salesSplitPct}/{config.qualitativeSplitPct}</span>
              </div>
            </div>
          </div>

          {/* Approval status */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Approval Status</p>
            {[
              { step: "Country Admin",    done: true  },
              { step: "General Manager",  done: false },
              { step: "Regional DVP",     done: false },
              { step: "CEx Director",     done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.done ? "rgba(14,122,79,0.12)" : BG, border: `1.5px solid ${s.done ? GREEN : BORDER}` }}>
                  {s.done && <CheckCircle2 className="w-3 h-3" style={{ color: GREEN }} />}
                </div>
                <span className="text-[11px] font-medium" style={{ color: s.done ? T_MAIN : T_SUB }}>{s.step}</span>
                {i === 1 && !s.done && (
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(180,83,9,0.08)", color: AMBER, border: "1px solid rgba(180,83,9,0.20)" }}>
                    Awaiting
                  </span>
                )}
              </div>
            ))}
            <button className="w-full mt-2 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5"
              style={{ background: `linear-gradient(135deg, ${AMBER}, #92400E)`, color: "#FFF" }}>
              Submit for Approval <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
