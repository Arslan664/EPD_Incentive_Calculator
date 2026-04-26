"use client";

import { useState } from "react";
import { Plus, Trash2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { DEFAULT_KPIS, QualKPI, ROLES_LIST } from "@/lib/adminConfig";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const RED = "#B91C1C"; const NAVY = "#0B1F3A";
const PURPLE = "#7C3AED";

const KPI_TYPES = ["TCFA", "CPA", "Coaching", "Custom"] as const;
const TYPE_COLORS: Record<string, string> = { TCFA: BLUE, CPA: GREEN, Coaching: AMBER, Custom: PURPLE };

export default function QualKPIModule() {
  const [kpis, setKpis] = useState<QualKPI[]>([...DEFAULT_KPIS]);
  const [saved, setSaved] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  const filtered = kpis.filter(k => filterRole === "all" || k.role === filterRole);

  // Per-role totals
  const roleTotals = ROLES_LIST.reduce((acc, role) => {
    acc[role] = kpis.filter(k => k.role === role).reduce((s, k) => s + k.weight, 0);
    return acc;
  }, {} as Record<string, number>);

  const totalForFilter = filterRole === "all" ? undefined :
    kpis.filter(k => k.role === filterRole).reduce((s, k) => s + k.weight, 0);

  const addKPI = () => {
    const role = filterRole === "all" ? "Medical Representative" : filterRole;
    const existing = kpis.filter(k => k.role === role);
    if (existing.length >= 3) return;
    setKpis(ks => [...ks, {
      id: `K${ks.length + 1}`,
      name: "New KPI", type: "Custom", target: 80, weight: 5, role, effortBased: false,
    }]);
  };

  const updateKPI = (id: string, field: keyof QualKPI, value: unknown) =>
    setKpis(ks => ks.map(k => k.id === id ? { ...k, [field]: value } : k));

  const deleteKPI = (id: string) => setKpis(ks => ks.filter(k => k.id !== id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>Qualitative KPI Management</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            Configure ≤3 KPIs per role · Each ≥5% weight · Total qualitative split = role's qual %
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="rounded-lg px-3 py-2 text-[12px] font-medium outline-none"
            style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF" }}>
            <option value="all">All Roles</option>
            {ROLES_LIST.map(r => <option key={r}>{r}</option>)}
          </select>
          <button onClick={addKPI}
            disabled={filterRole !== "all" && kpis.filter(k => k.role === filterRole).length >= 3}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${BLUE}, #004A91)`, color: "#FFF" }}>
            <Plus className="w-3.5 h-3.5" /> Add KPI
          </button>
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold"
            style={{ background: saved ? `linear-gradient(135deg, ${GREEN}, #0A6040)` : `linear-gradient(135deg, ${AMBER}, #92400E)`, color: "#FFF" }}>
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save KPIs"}
          </button>
        </div>
      </div>

      {/* Role weight summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["Medical Representative", "Pharm Representative", "Regional Manager"].map(role => {
          const total = roleTotals[role] || 0;
          const count = kpis.filter(k => k.role === role).length;
          const ok = total <= 20 && count <= 3;
          return (
            <div key={role} className="rounded-xl p-3" style={{ backgroundColor: "#FFF", border: `1.5px solid ${ok ? BORDER : RED}` }}>
              <p className="text-[10px] font-bold leading-tight" style={{ color: T_SUB }}>{role}</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-lg font-black" style={{ color: ok ? T_MAIN : RED }}>{total}%</p>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: ok ? `${GREEN}10` : `${RED}10`, color: ok ? GREEN : RED }}>
                  {count}/3 KPIs
                </span>
              </div>
              <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: BG }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(total / 20 * 100, 100)}%`, backgroundColor: ok ? GREEN : RED }} />
              </div>
            </div>
          );
        })}
        {totalForFilter !== undefined && (
          <div className="rounded-xl p-3" style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
            <p className="text-[10px] font-bold" style={{ color: T_SUB }}>Selected Role Total</p>
            <p className="text-lg font-black mt-2" style={{ color: totalForFilter <= 20 ? T_MAIN : RED }}>{totalForFilter}%</p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(kpi => {
          const color = TYPE_COLORS[kpi.type] || T_SUB;
          const weightOk = kpi.weight >= 5;
          return (
            <div key={kpi.id} className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: "#FFF", border: `1.5px solid ${BORDER}` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}14`, color, border: `1px solid ${color}30` }}>
                    {kpi.type}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: T_SUB }}>{kpi.role}</span>
                </div>
                <button onClick={() => deleteKPI(kpi.id)} className="p-1 rounded-lg transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${RED}10`)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: RED }} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>KPI Name</label>
                  <input value={kpi.name} onChange={e => updateKPI(kpi.id, "name", e.target.value)}
                    className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] font-bold outline-none"
                    style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Type</label>
                  <select value={kpi.type} onChange={e => updateKPI(kpi.id, "type", e.target.value)}
                    className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] font-medium outline-none"
                    style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
                    {KPI_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>
                    Target % <span style={{ color: kpi.target >= 80 ? GREEN : RED }}>({kpi.target >= 80 ? "Valid" : "Min 80"})</span>
                  </label>
                  <input type="number" min={50} max={100} value={kpi.target}
                    onChange={e => updateKPI(kpi.id, "target", parseInt(e.target.value) || 0)}
                    className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] font-bold outline-none"
                    style={{ border: `1.5px solid ${kpi.target >= 80 ? BORDER : RED}`, color: T_MAIN }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>
                    Weight % {!weightOk && <span style={{ color: RED }}>(Min 5%)</span>}
                  </label>
                  <input type="number" min={5} max={50} value={kpi.weight}
                    onChange={e => updateKPI(kpi.id, "weight", parseInt(e.target.value) || 0)}
                    className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] font-bold outline-none"
                    style={{ border: `1.5px solid ${weightOk ? BORDER : RED}`, color: T_MAIN }} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={kpi.effortBased}
                    onChange={e => updateKPI(kpi.id, "effortBased", e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-[11px] font-medium" style={{ color: T_SUB }}>Effort-based validation</span>
                </label>
                {!weightOk && (
                  <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: RED }}>
                    <AlertTriangle className="w-3 h-3" /> Weight too low
                  </span>
                )}
              </div>

              {/* KPI bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(kpi.weight / 20) * 100}%`, backgroundColor: color }} />
                </div>
                <span className="text-[11px] font-black" style={{ color }}>{kpi.weight}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
