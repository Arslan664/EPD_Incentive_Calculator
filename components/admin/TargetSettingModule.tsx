"use client";

import { useState, useRef } from "react";
import { Upload, FileCheck, CheckCircle2, AlertTriangle, Lock, RefreshCw, X } from "lucide-react";
import { comprehensiveData } from "@/data/comprehensiveData";
import { cleanNum } from "@/lib/utils";
import { COUNTRIES_LIST } from "@/lib/adminConfig";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const RED = "#B91C1C"; const NAVY = "#0B1F3A";

// Build target list from comprehensive data
const buildTargets = (country: string, quarter: string) =>
  comprehensiveData
    .filter(d => (country === "all" || d.Country === country || d.Country === undefined)
      && (quarter === "all" || d.Quarter === quarter) && d.Name?.trim())
    .slice(0, 30)
    .map(d => ({
      name: d.Name,
      promoLine: d.PromoLine,
      quarter: d.Quarter,
      plan: cleanNum(d.TotalPlan),
      actual: cleanNum(d.TotalAct),
      customTarget: cleanNum(d.TotalPlan),
      frozen: false,
    }));

type TargetRow = ReturnType<typeof buildTargets>[0] & { frozen: boolean; customTarget: number };

export default function TargetSettingModule() {
  const [country, setCountry] = useState("all");
  const [quarter, setQuarter] = useState("Q1 2025");
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const quarters = [...new Set(comprehensiveData.map(d => d.Quarter).filter(Boolean))].sort().reverse();

  const loadTargets = () => {
    setTargets(buildTargets(country, quarter) as TargetRow[]);
    setLoaded(true);
    setFrozen(false);
  };

  const updateTarget = (idx: number, val: number) => {
    if (frozen) return;
    setTargets(ts => ts.map((t, i) => i === idx ? { ...t, customTarget: val } : t));
  };

  const freezeAll = () => setFrozen(true);

  const totalPlan = targets.reduce((s, t) => s + t.customTarget, 0);
  const totalActual = targets.reduce((s, t) => s + t.actual, 0);

  const fmt = (v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v.toString();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>Target Setting & Bulk Upload</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            Set quarterly sales targets per rep. Territory reassignment, NPI override, pre-quarter freeze with GM sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loaded && !frozen && (
            <button onClick={freezeAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold"
              style={{ background: `linear-gradient(135deg, ${AMBER}, #92400E)`, color: "#FFF" }}>
              <Lock className="w-3.5 h-3.5" /> Freeze & Sign-Off
            </button>
          )}
          {frozen && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: `${GREEN}10`, border: `1px solid ${GREEN}30` }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />
              <span className="text-[12px] font-black" style={{ color: GREEN }}>Frozen — GM Sign-Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Config */}
      <div className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
        style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Country</label>
          <select value={country} onChange={e => setCountry(e.target.value)}
            className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] outline-none"
            style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
            <option value="all">All Countries</option>
            {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Quarter</label>
          <select value={quarter} onChange={e => setQuarter(e.target.value)}
            className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] outline-none"
            style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
            {quarters.map(q => <option key={q}>{q}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Bulk Upload (CSV/Excel)</label>
          <div className="flex gap-2 mt-1">
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-bold transition-colors"
              style={{ border: `1.5px dashed ${BORDER}`, color: T_SUB }}>
              {file ? <><FileCheck className="w-3.5 h-3.5" style={{ color: GREEN }} />{file.name.slice(0, 16)}…</>
                : <><Upload className="w-3.5 h-3.5" /> Choose file</>}
            </button>
            <button onClick={loadTargets}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold"
              style={{ background: `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
              <RefreshCw className="w-3.5 h-3.5" /> Load
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {loaded && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Reps Loaded", value: targets.length.toString(), color: BLUE },
            { label: "Total Plan", value: `${fmt(totalPlan)} LC`, color: AMBER },
            { label: "Total Actual (prev)", value: `${fmt(totalActual)} LC`, color: GREEN },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>{s.label}</p>
              <p className="text-xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Target Table */}
      {loaded && (
        <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
          <div className="grid grid-cols-5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"
            style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, color: T_SUB }}>
            <span className="col-span-2">Representative</span>
            <span>Promo Line</span>
            <span className="text-right">Prior Actual</span>
            <span className="text-right">Q Target (LC) {frozen && <Lock className="w-3 h-3 inline ml-1" />}</span>
          </div>
          <div className="divide-y max-h-[420px] overflow-y-auto" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
            {targets.map((t, i) => (
              <div key={i} className="grid grid-cols-5 px-4 py-2.5 items-center text-[12px] transition-colors"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                <span className="col-span-2 font-bold" style={{ color: T_MAIN }}>{t.name}</span>
                <span className="text-[10px] font-medium" style={{ color: T_SUB }}>{t.promoLine}</span>
                <span className="text-right font-medium" style={{ color: T_SUB }}>{fmt(t.actual)}</span>
                <div className="flex justify-end">
                  <input type="number" value={t.customTarget} disabled={frozen}
                    onChange={e => updateTarget(i, parseFloat(e.target.value) || 0)}
                    className="w-28 rounded-lg px-2 py-1.5 text-[12px] font-bold text-right outline-none transition-all"
                    style={{
                      border: `1.5px solid ${frozen ? BORDER : BLUE}`,
                      color: T_MAIN,
                      backgroundColor: frozen ? BG : "#FFF",
                      cursor: frozen ? "not-allowed" : "text",
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loaded && (
        <div className="rounded-xl p-12 flex flex-col items-center gap-4"
          style={{ backgroundColor: "#FFF", border: `2px dashed ${BORDER}` }}>
          <AlertTriangle className="w-8 h-8" style={{ color: T_SUB }} />
          <p className="text-[13px] font-bold" style={{ color: T_SUB }}>Select country & quarter, then click Load to view targets</p>
        </div>
      )}
    </div>
  );
}
