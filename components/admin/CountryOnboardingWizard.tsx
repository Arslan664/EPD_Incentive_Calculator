"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Globe, Sparkles, ArrowRight } from "lucide-react";
import { COUNTRIES_LIST, PROMO_LINES, DEFAULT_ICP } from "@/lib/adminConfig";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const NAVY = "#0B1F3A"; const NAVY2 = "#122D5A";

const STEPS = [
  { id: 1, label: "Select Country",        desc: "Choose new Phase 2–4 country to onboard" },
  { id: 2, label: "Pre-populate Template", desc: "Global template auto-applied, review defaults" },
  { id: 3, label: "Country Specifics",     desc: "Set TI amounts, reduction matrix, local KPIs" },
  { id: 4, label: "Promo Line Config",     desc: "Assign promo lines, brand weights, NPI targets" },
  { id: 5, label: "Review & Submit",       desc: "Submit for Country Admin → GM approval" },
];

export default function CountryOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const [tiMedRep, setTiMedRep] = useState(395525);
  const [tiRM, setTiRM] = useState(726000);
  const [exchangeRate, setExchangeRate] = useState(332.7);
  const [selectedPromoLines, setSelectedPromoLines] = useState<string[]>(["Line 1", "Line 2"]);
  const [submitted, setSubmitted] = useState(false);

  const togglePromo = (pl: string) =>
    setSelectedPromoLines(ps => ps.includes(pl) ? ps.filter(p => p !== pl) : [...ps, pl]);

  const canNext = step === 1 ? !!country : true;

  if (submitted) return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${GREEN}, #0A6040)`, boxShadow: `0 8px 32px ${GREEN}40` }}>
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black" style={{ color: T_MAIN }}>{country} Onboarded!</h3>
        <p className="text-[13px] mt-2" style={{ color: T_SUB }}>
          Configuration submitted for Country Admin → GM approval. Audit trail created.
        </p>
      </div>
      <button onClick={() => { setStep(1); setCountry(""); setSubmitted(false); }}
        className="px-6 py-3 rounded-xl text-[13px] font-bold"
        style={{ background: `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
        Onboard Another Country
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>Country Onboarding Wizard</h3>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
          Guided setup for new Phase 2–4 countries. Pre-populated from global template.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button onClick={() => step > s.id && setStep(s.id)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              style={{ cursor: step > s.id ? "pointer" : "default" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black transition-all"
                style={{
                  backgroundColor: s.id < step ? GREEN : s.id === step ? BLUE : BG,
                  color: s.id <= step ? "#FFF" : T_SUB,
                  border: `2px solid ${s.id < step ? GREEN : s.id === step ? BLUE : BORDER}`,
                }}>
                {s.id < step ? "✓" : s.id}
              </div>
              <span className="text-[9px] font-bold text-center hidden sm:block" style={{ color: s.id === step ? BLUE : T_SUB, maxWidth: 64 }}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1 transition-all" style={{ backgroundColor: step > s.id ? GREEN : BORDER }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl p-6 space-y-5" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-[14px] font-black" style={{ color: T_MAIN }}>Select Country to Onboard</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COUNTRIES_LIST.map(c => (
                <button key={c} onClick={() => setCountry(c)}
                  className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: country === c ? `${BLUE}08` : BG,
                    border: `1.5px solid ${country === c ? BLUE : BORDER}`,
                    color: T_MAIN,
                  }}>
                  <Globe className="w-4 h-4 flex-shrink-0" style={{ color: country === c ? BLUE : T_SUB }} />
                  <div>
                    <p className="text-[12px] font-bold">{c}</p>
                    <p className="text-[9px] font-medium mt-0.5" style={{ color: T_SUB }}>Phase 2</p>
                  </div>
                  {country === c && <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: BLUE }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: BLUE }} />
              <h4 className="text-[14px] font-black" style={{ color: T_MAIN }}>Global Template Applied — {country}</h4>
            </div>
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: BG }}>
              {[
                { label: "Sales / Qualitative Split",   value: `${DEFAULT_ICP.salesSplitPct}% / ${DEFAULT_ICP.qualitativeSplitPct}%` },
                { label: "TCFA Target",                 value: `${DEFAULT_ICP.tcfaTarget}%` },
                { label: "CPA Target",                  value: `${DEFAULT_ICP.cpaTarget}%` },
                { label: "NPI Threshold",               value: `${DEFAULT_ICP.npiThresholdMin}–${DEFAULT_ICP.npiThresholdMax}%` },
                { label: "Payout Cap",                  value: `${DEFAULT_ICP.payoutCap}%` },
                { label: "Coaching TIC Threshold",      value: `${DEFAULT_ICP.coachingThreshold}%` },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-[12px]">
                  <span style={{ color: T_SUB }}>{s.label}</span>
                  <span className="font-black" style={{ color: T_MAIN }}>{s.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: T_SUB }}>Review defaults above. You may adjust country-specific values in the next step.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-[14px] font-black" style={{ color: T_MAIN }}>Country-Specific Configuration — {country}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "TI — Medical Rep (LC)", value: tiMedRep, set: setTiMedRep },
                { label: "TI — Regional Manager (LC)", value: tiRM, set: setTiRM },
                { label: "Exchange Rate (LC/USD)", value: exchangeRate, set: setExchangeRate },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>{f.label}</label>
                  <input type="number" value={f.value} onChange={e => f.set(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 rounded-lg px-3 py-2 text-[13px] font-bold outline-none"
                    style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }} />
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3"
              style={{ backgroundColor: `${AMBER}08`, border: `1px solid ${AMBER}25` }}>
              <p className="text-[11px] font-bold" style={{ color: AMBER }}>
                Reduction matrix inherits global defaults. Override in OEC Compliance module after onboarding.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h4 className="text-[14px] font-black" style={{ color: T_MAIN }}>Promo Line Assignment — {country}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROMO_LINES.map(pl => (
                <button key={pl} onClick={() => togglePromo(pl)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: selectedPromoLines.includes(pl) ? `${BLUE}08` : BG,
                    border: `1.5px solid ${selectedPromoLines.includes(pl) ? BLUE : BORDER}`,
                  }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: selectedPromoLines.includes(pl) ? BLUE : "#FFF", border: `1.5px solid ${selectedPromoLines.includes(pl) ? BLUE : BORDER}` }}>
                    {selectedPromoLines.includes(pl) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: T_MAIN }}>{pl}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: T_SUB }}>
              Brand weights for selected promo lines will be configurable via ICP Config Engine post-onboarding.
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h4 className="text-[14px] font-black" style={{ color: T_MAIN }}>Review & Submit — {country}</h4>
            <div className="space-y-2">
              {[
                { label: "Country",              value: country },
                { label: "Phase",                value: "Phase 2 Onboarding" },
                { label: "TI (Med Rep)",         value: `${tiMedRep.toLocaleString()} LC` },
                { label: "TI (Regional Manager)",value: `${tiRM.toLocaleString()} LC` },
                { label: "Exchange Rate",        value: `${exchangeRate} LC/USD` },
                { label: "Promo Lines",          value: selectedPromoLines.join(", ") || "None selected" },
                { label: "Template",             value: "Global Standard (80/20, Cap 250%)" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-[12px] py-1.5" style={{ borderBottom: `1px solid ${BG}` }}>
                  <span style={{ color: T_SUB }}>{s.label}</span>
                  <span className="font-bold" style={{ color: T_MAIN }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: `${GREEN}08`, border: `1px solid ${GREEN}25` }}>
              <p className="text-[11px] font-bold" style={{ color: GREEN }}>
                Submission triggers Country Admin → GM approval workflow. Full audit trail will be recorded.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button disabled={step === 1} onClick={() => setStep(s => s - 1)}
          className="px-4 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40 transition-colors"
          style={{ border: `1px solid ${BORDER}`, color: T_SUB }}>
          ← Back
        </button>
        {step < 5 ? (
          <button onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setSubmitted(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold"
            style={{ background: `linear-gradient(135deg, ${GREEN}, #0A6040)`, color: "#FFF" }}>
            <CheckCircle2 className="w-4 h-4" /> Submit for Approval
          </button>
        )}
      </div>
    </div>
  );
}
