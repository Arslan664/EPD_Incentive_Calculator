"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, XCircle, Clock } from "lucide-react";
import { DEFAULT_VIOLATIONS, OECViolation, COUNTRIES_LIST } from "@/lib/adminConfig";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const RED = "#B91C1C"; const NAVY = "#0B1F3A";

// Reduction matrix per severity per country
const REDUCTION_MATRIX: Record<string, Record<string, number>> = {
  medium: { Kazakhstan: 10, Uzbekistan: 10, Georgia: 12, Azerbaijan: 10, default: 10 },
  high:   { Kazakhstan: 25, Uzbekistan: 20, Georgia: 25, Azerbaijan: 25, default: 25 },
};

function getReduction(severity: string, country: string): number {
  const matrix = REDUCTION_MATRIX[severity] || {};
  return matrix[country] ?? matrix.default ?? 10;
}

function statusStyle(s: string) {
  if (s === "approved")     return { color: GREEN,  bg: `${GREEN}10`,  border: `${GREEN}30` };
  if (s === "closed")       return { color: T_SUB,  bg: `${T_SUB}10`, border: `${T_SUB}30` };
  if (s === "under_review") return { color: BLUE,   bg: `${BLUE}10`,  border: `${BLUE}30` };
  if (s === "appealed")     return { color: AMBER,  bg: `${AMBER}10`, border: `${AMBER}30` };
  return { color: RED, bg: `${RED}10`, border: `${RED}30` };
}

export default function OECComplianceModule() {
  const [violations, setViolations] = useState<OECViolation[]>(DEFAULT_VIOLATIONS);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newV, setNewV] = useState<Partial<OECViolation>>({
    severity: "medium", country: "Kazakhstan", quarter: "Q2 2025",
  });

  const filtered = violations.filter(v =>
    (filterCountry === "all" || v.country === filterCountry) &&
    (filterSeverity === "all" || v.severity === filterSeverity)
  );

  const updateStatus = (id: string, status: OECViolation["status"]) => {
    setViolations(vs => vs.map(v => v.id === id ? { ...v, status } : v));
  };

  const logViolation = () => {
    if (!newV.repName || !newV.description) return;
    const reduction = getReduction(newV.severity!, newV.country!);
    const violation: OECViolation = {
      id: `V${String(violations.length + 1).padStart(3, "0")}`,
      repName: newV.repName!,
      country: newV.country!,
      quarter: newV.quarter!,
      severity: newV.severity as "medium" | "high",
      description: newV.description!,
      reductionPct: reduction,
      status: "open",
      raisedBy: "Current User",
      raisedAt: new Date().toISOString().split("T")[0],
      managerNotified: false,
    };
    setViolations(vs => [...vs, violation]);
    setNewV({ severity: "medium", country: "Kazakhstan", quarter: "Q2 2025" });
    setShowForm(false);
  };

  const openCount = violations.filter(v => v.status === "open").length;
  const highCount = violations.filter(v => v.severity === "high").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>OEC Compliance Module</h3>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
            Log violations, apply country reduction matrix, manage exception workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${RED}10`, border: `1px solid ${RED}30` }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: RED }} />
            <span className="text-[12px] font-black" style={{ color: RED }}>{openCount} Open</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${AMBER}10`, border: `1px solid ${AMBER}30` }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: AMBER }} />
            <span className="text-[12px] font-black" style={{ color: AMBER }}>{highCount} High</span>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold"
            style={{ background: `linear-gradient(135deg, ${RED}, #7F1D1D)`, color: "#FFF" }}>
            + Log Violation
          </button>
        </div>
      </div>

      {/* New Violation Form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ backgroundColor: "#FFF", border: `1.5px solid ${RED}40` }}>
          <p className="text-[12px] font-black uppercase tracking-wider" style={{ color: RED }}>Log New Violation</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Rep Name", key: "repName", type: "text" },
              { label: "Description", key: "description", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>{f.label}</label>
                <input type={f.type} value={(newV as Record<string, string>)[f.key] || ""}
                  onChange={e => setNewV(v => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] outline-none"
                  style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }} />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Severity</label>
              <select value={newV.severity} onChange={e => setNewV(v => ({ ...v, severity: e.target.value as "medium"|"high" }))}
                className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] outline-none"
                style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>Country</label>
              <select value={newV.country} onChange={e => setNewV(v => ({ ...v, country: e.target.value }))}
                className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] outline-none"
                style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN }}>
                {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>
                Auto Reduction: <strong style={{ color: RED }}>{getReduction(newV.severity!, newV.country!)}%</strong>
              </label>
              <div className="mt-1 rounded-lg px-3 py-2 text-[12px] font-bold"
                style={{ border: `1.5px solid ${BORDER}`, color: RED, backgroundColor: `${RED}06` }}>
                {getReduction(newV.severity!, newV.country!)}% reduction applied automatically
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={logViolation}
              className="px-4 py-2 rounded-lg text-[12px] font-bold"
              style={{ background: `linear-gradient(135deg, ${RED}, #7F1D1D)`, color: "#FFF" }}>
              Submit Violation
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-[12px] font-bold"
              style={{ border: `1px solid ${BORDER}`, color: T_SUB }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          className="rounded-lg px-3 py-2 text-[12px] font-medium outline-none"
          style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF" }}>
          <option value="all">All Countries</option>
          {COUNTRIES_LIST.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="rounded-lg px-3 py-2 text-[12px] font-medium outline-none"
          style={{ border: `1.5px solid ${BORDER}`, color: T_MAIN, backgroundColor: "#FFF" }}>
          <option value="all">All Severities</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Violations Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
        <div className="grid grid-cols-7 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, color: T_SUB }}>
          <span>ID</span><span className="col-span-2">Rep / Description</span>
          <span>Severity</span><span>Reduction</span><span>Status</span><span>Actions</span>
        </div>
        <div className="divide-y" style={{ borderColor: BG, backgroundColor: "#FFF" }}>
          {filtered.map(v => {
            const ss = statusStyle(v.status);
            return (
              <div key={v.id} className="grid grid-cols-7 px-4 py-3.5 items-center transition-colors text-[12px]"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                <span className="font-bold" style={{ color: T_SUB }}>{v.id}</span>
                <div className="col-span-2">
                  <p className="font-bold" style={{ color: T_MAIN }}>{v.repName}</p>
                  <p className="text-[10px] mt-0.5 leading-snug" style={{ color: T_SUB }}>{v.description}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: T_SUB }}>{v.country} · {v.quarter}</p>
                </div>
                <span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: v.severity === "high" ? `${RED}12` : `${AMBER}12`,
                             color: v.severity === "high" ? RED : AMBER,
                             border: `1px solid ${v.severity === "high" ? RED : AMBER}30` }}>
                    {v.severity}
                  </span>
                </span>
                <span className="font-black" style={{ color: RED }}>−{v.reductionPct}%</span>
                <span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                    {v.status.replace("_", " ")}
                  </span>
                </span>
                <div className="flex gap-1">
                  {v.status === "open" && (
                    <>
                      <button onClick={() => updateStatus(v.id, "under_review")} title="Review"
                        className="p-1.5 rounded-lg transition-colors" onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${BLUE}14`)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <Clock className="w-3.5 h-3.5" style={{ color: BLUE }} />
                      </button>
                      <button onClick={() => updateStatus(v.id, "approved")} title="Approve"
                        className="p-1.5 rounded-lg transition-colors" onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${GREEN}14`)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} />
                      </button>
                    </>
                  )}
                  {v.status === "under_review" && (
                    <>
                      <button onClick={() => updateStatus(v.id, "approved")} title="Approve"
                        className="p-1.5 rounded-lg transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: GREEN }} />
                      </button>
                      <button onClick={() => updateStatus(v.id, "appealed")} title="Appeal"
                        className="p-1.5 rounded-lg transition-colors">
                        <AlertTriangle className="w-3.5 h-3.5" style={{ color: AMBER }} />
                      </button>
                    </>
                  )}
                  {(v.status === "approved" || v.status === "appealed") && (
                    <button onClick={() => updateStatus(v.id, "closed")} title="Close"
                      className="p-1.5 rounded-lg transition-colors">
                      <XCircle className="w-3.5 h-3.5" style={{ color: T_SUB }} />
                    </button>
                  )}
                  {v.status === "closed" && (
                    <span className="text-[10px]" style={{ color: T_SUB }}>—</span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: T_SUB, opacity: 0.4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reduction Matrix */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
        <div className="px-4 py-3 text-[11px] font-black uppercase tracking-widest"
          style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, color: T_SUB }}>
          Country Reduction Matrix
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-0 divide-x divide-y" style={{ borderColor: BORDER, backgroundColor: "#FFF" }}>
          {COUNTRIES_LIST.slice(0, 5).map(country => (
            <div key={country} className="px-3 py-3">
              <p className="text-[10px] font-bold" style={{ color: T_SUB }}>{country}</p>
              <div className="flex flex-col gap-1 mt-2">
                {(["medium","high"] as const).map(sev => (
                  <div key={sev} className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold" style={{ color: sev === "high" ? RED : AMBER }}>{sev}</span>
                    <span className="text-[12px] font-black" style={{ color: sev === "high" ? RED : AMBER }}>
                      {REDUCTION_MATRIX[sev][country] ?? REDUCTION_MATRIX[sev].default}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
