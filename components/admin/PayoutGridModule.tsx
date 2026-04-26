"use client";

import { useState } from "react";
import { Save, CheckCircle2, BarChart3 } from "lucide-react";
import { DEFAULT_PAYOUT_GRID, PayoutBand } from "@/lib/adminConfig";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const NAVY = "#0B1F3A"; const AMBER = "#B45309"; const RED = "#B91C1C";

function getBandColor(coeff: number) {
  if (coeff === 0)   return RED;
  if (coeff < 1.0)   return AMBER;
  if (coeff === 1.0) return BLUE;
  if (coeff <= 1.5)  return "#059669";
  return GREEN;
}

export default function PayoutGridModule() {
  const [grid, setGrid] = useState<PayoutBand[]>(JSON.parse(JSON.stringify(DEFAULT_PAYOUT_GRID)));
  const [saved, setSaved] = useState(false);
  const [simAch, setSimAch] = useState(103);

  const updateBand = (idx: number, field: keyof PayoutBand, val: number) => {
    setGrid(g => g.map((b, i) => i === idx ? { ...b, [field]: val } : b));
  };

  const simBand = grid.find(b => simAch >= b.minAch && simAch <= b.maxAch);
  const simCoeff = simBand?.coefficient ?? 0;
  const sampleBase = 395525;
  const sampleSalesTarget = sampleBase * 0.8;
  const simPayout = sampleSalesTarget * simCoeff + sampleBase * 0.2;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>Payout Grid Management</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            Configure achievement % → payout coefficient mapping. Hard cap: 250% at 120%+.
          </p>
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold"
          style={{ background: saved ? `linear-gradient(135deg, ${GREEN}, #0A6040)` : `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Saved!" : "Save Grid"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Grid Table */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
          <div className="px-4 py-3 grid grid-cols-4 gap-2 text-[10px] font-black uppercase tracking-widest"
            style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, color: T_SUB }}>
            <span>Min ACH %</span><span>Max ACH %</span><span>Coefficient</span><span>Payout %</span>
          </div>
          <div className="divide-y" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
            {grid.map((band, i) => {
              const color = getBandColor(band.coefficient);
              return (
                <div key={i} className="px-4 py-2.5 grid grid-cols-4 gap-2 items-center transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <input type="number" value={band.minAch}
                    onChange={e => updateBand(i, "minAch", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg px-2 py-1 text-[12px] font-bold text-center outline-none"
                    style={{ border: `1px solid ${BORDER}`, color: T_MAIN }} />
                  <input type="number" value={band.maxAch}
                    onChange={e => updateBand(i, "maxAch", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg px-2 py-1 text-[12px] font-bold text-center outline-none"
                    style={{ border: `1px solid ${BORDER}`, color: T_MAIN }} />
                  <input type="number" step="0.01" value={band.coefficient}
                    onChange={e => updateBand(i, "coefficient", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg px-2 py-1 text-[12px] font-bold text-center outline-none"
                    style={{ border: `1px solid ${BORDER}`, color: T_MAIN }} />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((band.coefficient / 2.5) * 100, 100)}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[11px] font-black w-10 text-right" style={{ color }}>
                      {Math.round(band.coefficient * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Simulator + Visual curve */}
        <div className="flex flex-col gap-4">
          {/* Simulator */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
            <div className="px-4 py-3" style={{ background: `linear-gradient(90deg, ${NAVY}, #122D5A)` }}>
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(160,191,206,0.80)" }}>Payout Simulator</p>
            </div>
            <div className="p-4 space-y-4" style={{ backgroundColor: "#FFF" }}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Achievement %</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input type="range" min={0} max={150} value={simAch} onChange={e => setSimAch(parseInt(e.target.value))}
                    className="flex-1" />
                  <span className="text-[14px] font-black w-12 text-right" style={{ color: T_MAIN }}>{simAch}%</span>
                </div>
              </div>
              {[
                { label: "Coefficient",     value: `×${simCoeff.toFixed(2)}` },
                { label: "Target Base",     value: `${sampleBase.toLocaleString()} LC` },
                { label: "Sales Payout",    value: `${Math.round(sampleSalesTarget * simCoeff).toLocaleString()} LC` },
                { label: "Total Incentive", value: `${Math.round(simPayout).toLocaleString()} LC` },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center text-[12px]">
                  <span style={{ color: T_SUB }}>{s.label}</span>
                  <span className="font-black" style={{ color: T_MAIN }}>{s.value}</span>
                </div>
              ))}
              <div className="rounded-lg p-3 text-center"
                style={{ backgroundColor: `${getBandColor(simCoeff)}10`, border: `1px solid ${getBandColor(simCoeff)}30` }}>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: T_SUB }}>Payout Rate</p>
                <p className="text-2xl font-black" style={{ color: getBandColor(simCoeff) }}>
                  {Math.round(simCoeff * 100)}%
                </p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: T_SUB }}>
                  {simBand?.label ?? "No payout"}
                </p>
              </div>
            </div>
          </div>

          {/* Visual curve summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4" style={{ color: T_SUB }} />
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Curve Summary</p>
            </div>
            {[
              { range: "< 90%",   pct: 0,   color: RED   },
              { range: "90–94%",  pct: 70,  color: AMBER },
              { range: "95–99%",  pct: 85,  color: AMBER },
              { range: "100%",    pct: 100, color: BLUE  },
              { range: "101–110%",pct: 145, color: GREEN },
              { range: "111–120%",pct: 215, color: GREEN },
              { range: "120%+",   pct: 250, color: GREEN },
            ].map(s => (
              <div key={s.range} className="flex items-center gap-2 text-[10px]">
                <span className="w-16 font-bold flex-shrink-0" style={{ color: T_SUB }}>{s.range}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct / 2.5}%`, backgroundColor: s.color }} />
                </div>
                <span className="w-10 text-right font-black" style={{ color: s.color }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
