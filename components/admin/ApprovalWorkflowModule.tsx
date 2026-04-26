"use client";

import { useState } from "react";
import { DEFAULT_WORKFLOWS, ApprovalWorkflow } from "@/lib/adminConfig";
import { CheckCircle2, Clock, XCircle, ChevronRight, FileCheck } from "lucide-react";

const BLUE = "#0057A8"; const BORDER = "#D0DCE8"; const BG = "#F0F4F8";
const T_MAIN = "#0F1827"; const T_SUB = "#6B8499"; const GREEN = "#0E7A4F";
const AMBER = "#B45309"; const RED = "#B91C1C"; const NAVY = "#0B1F3A";

const TYPE_COLORS: Record<string, string> = { ICP: BLUE, Target: AMBER, Payout: GREEN, Exception: RED };

export default function ApprovalWorkflowModule() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(DEFAULT_WORKFLOWS);
  const [selected, setSelected] = useState<string | null>(workflows[0]?.id ?? null);

  const selectedWF = workflows.find(w => w.id === selected);

  const approveStep = (wfId: string, stepIdx: number) => {
    setWorkflows(ws => ws.map(w => {
      if (w.id !== wfId) return w;
      const steps = w.steps.map((s, i) =>
        i === stepIdx ? { ...s, status: "approved" as const, timestamp: new Date().toISOString().split("T")[0] } : s
      );
      const next = steps.findIndex(s => s.status === "pending");
      return { ...w, steps, currentStep: next === -1 ? steps.length : next };
    }));
  };

  const rejectStep = (wfId: string, stepIdx: number) => {
    setWorkflows(ws => ws.map(w => {
      if (w.id !== wfId) return w;
      const steps = w.steps.map((s, i) =>
        i === stepIdx ? { ...s, status: "rejected" as const, timestamp: new Date().toISOString().split("T")[0] } : s
      );
      return { ...w, steps, currentStep: stepIdx };
    }));
  };

  const wfComplete = (wf: ApprovalWorkflow) => wf.steps.every(s => s.status === "approved");
  const wfRejected = (wf: ApprovalWorkflow) => wf.steps.some(s => s.status === "rejected");

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[15px] font-black" style={{ color: T_MAIN }}>Approval Workflow Engine</h3>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: T_SUB }}>
          Country Admin → GM → Regional DVP → Regional CEx Director · Digital audit trail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Workflow list */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: T_SUB }}>Active Workflows</p>
          {workflows.map(wf => {
            const color = TYPE_COLORS[wf.type] ?? BLUE;
            const complete = wfComplete(wf);
            const rejected = wfRejected(wf);
            const progress = wf.steps.filter(s => s.status === "approved").length;
            return (
              <button key={wf.id} onClick={() => setSelected(wf.id)}
                className="text-left rounded-xl p-4 transition-all duration-200"
                style={{
                  backgroundColor: selected === wf.id ? `${color}08` : "#FFF",
                  border: `1.5px solid ${selected === wf.id ? color : BORDER}`,
                  boxShadow: selected === wf.id ? `0 0 0 3px ${color}14` : "none",
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}14`, color, border: `1px solid ${color}30` }}>
                      {wf.type}
                    </span>
                    <p className="text-[12px] font-bold mt-1.5 leading-snug" style={{ color: T_MAIN }}>{wf.subject}</p>
                    <p className="text-[10px] mt-1" style={{ color: T_SUB }}>{wf.country} · {wf.quarter}</p>
                  </div>
                  {complete && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: GREEN }} />}
                  {rejected && <XCircle className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: RED }} />}
                  {!complete && !rejected && <Clock className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: AMBER }} />}
                </div>
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: BG }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(progress / wf.steps.length) * 100}%`,
                               backgroundColor: rejected ? RED : complete ? GREEN : BLUE }} />
                  </div>
                  <p className="text-[9px] font-bold mt-1" style={{ color: T_SUB }}>
                    {progress}/{wf.steps.length} approvals
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedWF && (
          <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ border: `1.5px solid ${BORDER}` }}>
            <div className="px-5 py-4" style={{ background: `linear-gradient(90deg, ${NAVY}, #122D5A)` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(160,191,206,0.70)" }}>
                    {selectedWF.type} · {selectedWF.quarter}
                  </p>
                  <h4 className="font-bold text-sm mt-1" style={{ color: "#FFF" }}>{selectedWF.subject}</h4>
                </div>
                <FileCheck className="w-6 h-6 flex-shrink-0" style={{ color: "rgba(160,191,206,0.60)" }} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                {selectedWF.steps.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= selectedWF.currentStep - 1 ? "" : ""}`}
                    style={{ backgroundColor: selectedWF.steps[i].status === "approved" ? GREEN : selectedWF.steps[i].status === "rejected" ? RED : "rgba(255,255,255,0.18)" }} />
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4" style={{ backgroundColor: "#FFF" }}>
              {selectedWF.steps.map((step, i) => {
                const isActive = i === selectedWF.currentStep;
                const isDone = step.status === "approved";
                const isRejected = step.status === "rejected";
                return (
                  <div key={i} className="flex gap-4 items-start relative">
                    {i < selectedWF.steps.length - 1 && (
                      <div className="absolute left-[15px] top-8 w-px h-[calc(100%+8px)]"
                        style={{ backgroundColor: isDone ? `${GREEN}40` : BORDER }} />
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{
                        backgroundColor: isDone ? `${GREEN}14` : isRejected ? `${RED}14` : isActive ? `${BLUE}14` : BG,
                        border: `2px solid ${isDone ? GREEN : isRejected ? RED : isActive ? BLUE : BORDER}`,
                      }}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} />
                        : isRejected ? <XCircle className="w-4 h-4" style={{ color: RED }} />
                        : isActive ? <Clock className="w-4 h-4" style={{ color: BLUE }} />
                        : <span className="text-[11px] font-black" style={{ color: T_SUB }}>{i + 1}</span>}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: isDone ? GREEN : isRejected ? RED : isActive ? T_MAIN : T_SUB }}>
                            {step.role}
                          </p>
                          <p className="text-[11px]" style={{ color: T_SUB }}>
                            {step.approver}{step.timestamp ? ` · ${step.timestamp}` : ""}
                          </p>
                          {step.comment && <p className="text-[11px] italic mt-0.5" style={{ color: T_SUB }}>"{step.comment}"</p>}
                        </div>
                        {isActive && !wfRejected(selectedWF) && (
                          <div className="flex gap-2">
                            <button onClick={() => approveStep(selectedWF.id, i)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                              style={{ background: `linear-gradient(135deg, ${GREEN}, #0A6040)`, color: "#FFF" }}>
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                            <button onClick={() => rejectStep(selectedWF.id, i)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                              style={{ border: `1px solid ${RED}`, color: RED }}>
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                        {isDone && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${GREEN}12`, color: GREEN, border: `1px solid ${GREEN}30` }}>
                            ✓ Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${RED}12`, color: RED, border: `1px solid ${RED}30` }}>
                            ✗ Rejected
                          </span>
                        )}
                        {!isActive && !isDone && !isRejected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: BG, color: T_SUB, border: `1px solid ${BORDER}` }}>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {wfComplete(selectedWF) && (
                <div className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${GREEN}08`, border: `1px solid ${GREEN}30` }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: GREEN }} />
                  <div>
                    <p className="text-[13px] font-black" style={{ color: GREEN }}>Fully Approved</p>
                    <p className="text-[11px]" style={{ color: T_SUB }}>All 4 levels signed off. Audit trail recorded.</p>
                  </div>
                </div>
              )}
              {wfRejected(selectedWF) && (
                <div className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${RED}08`, border: `1px solid ${RED}30` }}>
                  <XCircle className="w-5 h-5" style={{ color: RED }} />
                  <div>
                    <p className="text-[13px] font-black" style={{ color: RED }}>Rejected — Escalated</p>
                    <p className="text-[11px]" style={{ color: T_SUB }}>Deviation from global guidelines triggers escalated review.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
