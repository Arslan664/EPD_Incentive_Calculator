"use client";

import { useState } from "react";
import { comprehensiveData } from "@/data/comprehensiveData";
import { Plus, Save, CheckCircle2, Users, MapPin } from "lucide-react";
import { COUNTRIES_LIST, PROMO_LINES, ROLES_LIST } from "@/lib/adminConfig";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const RED = "#B91C1C";

// Extract unique reps from comprehensiveData 
const BASE_REPS = (() => {
  const seen = new Set<string>();
  return comprehensiveData
    .filter(d => d.Name?.trim() && d.Position?.trim())
    .filter(d => { const k = d.Name; if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 40)
    .map((d, i) => ({
      id: `U${String(i + 1).padStart(3, "0")}`,
      name: d.Name,
      role: d.Position || "Medical Representative",
      country: "Kazakhstan",
      grade: Math.floor(Math.random() * 4) + 14,
      eligible: true,
      territory: d.PromoLine || "Line 1",
      promoLine: d.PromoLine || "Line 1",
      proRatedMonths: 3,
    }));
})();

type Rep = typeof BASE_REPS[0];

export default function UserTerritoryModule() {
  const [reps, setReps] = useState<Rep[]>(BASE_REPS);
  const [filter, setFilter] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = reps.filter(r =>
    (filterCountry === "all" || r.country === filterCountry) &&
    (!filter || r.name.toLowerCase().includes(filter.toLowerCase()))
  );

  const updateRep = (id: string, field: keyof Rep, value: unknown) =>
    setReps(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));

  const eligible = reps.filter(r => r.eligible && r.grade <= 17).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>User & Territory Management</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            All 8 commercial function types · Grade 17 and below eligible · Territory assignments & pro-rating
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${BLUE}10`, border: `1px solid ${BLUE}30` }}>
            <Users className="w-3.5 h-3.5" style={{ color: BLUE }} />
            <span className="text-[12px] font-black" style={{ color: BLUE }}>{eligible} Eligible</span>
          </div>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold"
            style={{ background: saved ? `linear-gradient(135deg, ${GREEN}, #0A6040)` : `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Search representative…" value={filter} onChange={e => setFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-[12px] outline-none flex-1 min-w-48"
          style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF" }} />
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="rounded-lg px-3 py-2 text-[12px] outline-none"
          style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF" }}>
          <option value="all">All Countries</option>
          {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
        <div className="grid grid-cols-7 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, color: T_SUB }}>
          <span className="col-span-2">Name</span>
          <span>Role / Grade</span>
          <span>Territory</span>
          <span>Pro-Rate</span>
          <span>Eligible</span>
          <span>Country</span>
        </div>
        <div className="divide-y max-h-[500px] overflow-y-auto" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
          {filtered.map(r => (
            <div key={r.id} className="grid grid-cols-7 px-4 py-2.5 items-center text-[12px] transition-colors"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => setEditing(editing === r.id ? null : r.id)}>
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ backgroundColor: `${BLUE}14`, color: BLUE }}>
                  {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <span className="font-bold truncate" style={{ color: T_MAIN }}>{r.name}</span>
              </div>
              <div>
                {editing === r.id ? (
                  <select value={r.role} onChange={e => updateRep(r.id, "role", e.target.value)} onClick={e => e.stopPropagation()}
                    className="w-full rounded px-1 py-1 text-[11px] outline-none"
                    style={{ border: `1px solid ${BLUE}`, color: T_MAIN }}>
                    {ROLES_LIST.map(rl => <option key={rl}>{rl}</option>)}
                  </select>
                ) : (
                  <div>
                    <p className="text-[11px] font-medium" style={{ color: T_MAIN }}>{r.role.split(" ").slice(-1)[0]}</p>
                    <p className="text-[10px]" style={{ color: r.grade <= 17 ? GREEN : RED }}>Gr {r.grade}</p>
                  </div>
                )}
              </div>
              <div>
                {editing === r.id ? (
                  <select value={r.promoLine} onChange={e => { updateRep(r.id, "promoLine", e.target.value); updateRep(r.id, "territory", e.target.value); }} onClick={e => e.stopPropagation()}
                    className="w-full rounded px-1 py-1 text-[11px] outline-none"
                    style={{ border: `1px solid ${BLUE}`, color: T_MAIN }}>
                    {PROMO_LINES.map(pl => <option key={pl}>{pl}</option>)}
                  </select>
                ) : (
                  <span className="text-[11px]" style={{ color: T_SUB }}>{r.promoLine.replace(" (big cities)", "*")}</span>
                )}
              </div>
              <div>
                {editing === r.id ? (
                  <select value={r.proRatedMonths} onChange={e => updateRep(r.id, "proRatedMonths", parseInt(e.target.value))} onClick={e => e.stopPropagation()}
                    className="w-full rounded px-1 py-1 text-[11px] outline-none"
                    style={{ border: `1px solid ${BLUE}`, color: T_MAIN }}>
                    {[1,2,3].map(m => <option key={m}>{m}</option>)}
                  </select>
                ) : (
                  <span className="text-[11px] font-bold" style={{ color: T_MAIN }}>{r.proRatedMonths}/3</span>
                )}
              </div>
              <div onClick={e => e.stopPropagation()}>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={r.eligible}
                    onChange={e => updateRep(r.id, "eligible", e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-[11px] font-bold" style={{ color: r.eligible ? GREEN : RED }}>
                    {r.eligible ? "Yes" : "No"}
                  </span>
                </label>
              </div>
              <div>
                {editing === r.id ? (
                  <select value={r.country} onChange={e => updateRep(r.id, "country", e.target.value)} onClick={e => e.stopPropagation()}
                    className="w-full rounded px-1 py-1 text-[11px] outline-none"
                    style={{ border: `1px solid ${BLUE}`, color: T_MAIN }}>
                    {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : (
                  <span className="text-[10px] font-medium" style={{ color: T_SUB }}>{r.country}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-center" style={{ color: T_SUB }}>
        Click any row to expand inline editing · Grade ≤17 eligible · Pro-rate sets reimbursable months
      </p>
    </div>
  );
}
