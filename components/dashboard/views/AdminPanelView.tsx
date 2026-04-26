"use client";

import { useState } from "react";
import DataUploader from "./DataUploader";
import ICPConfigModule from "@/components/admin/ICPConfigModule";
import PayoutGridModule from "@/components/admin/PayoutGridModule";
import OECComplianceModule from "@/components/admin/OECComplianceModule";
import QualKPIModule from "@/components/admin/QualKPIModule";
import AnalyticsModule from "@/components/admin/AnalyticsModule";
import ApprovalWorkflowModule from "@/components/admin/ApprovalWorkflowModule";
import CountryOnboardingWizard from "@/components/admin/CountryOnboardingWizard";
import UserTerritoryModule from "@/components/admin/UserTerritoryModule";
import TargetSettingModule from "@/components/admin/TargetSettingModule";
import {
  Settings, Users, Target, Shield, FileCheck, Bell,
  ChevronRight, Globe, Lock, ClipboardList, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Layers, BarChart3,
  Building2, UserCog, Sliders, BadgeCheck, FileCog, Upload,
  MapPin, BarChart2, Workflow, Wand2,
} from "lucide-react";

/* ── Design Tokens (matches project palette) ──────────────────── */
const NAVY   = "#0B1F3A";
const NAVY2  = "#122D5A";
const BLUE   = "#0057A8";
const BORDER = "#D0DCE8";
const BG     = "#F0F4F8";
const T_MAIN = "#0F1827";
const T_MUT  = "#3D5875";
const T_SUB  = "#6B8499";
const GREEN  = "#0E7A4F";
const AMBER  = "#B45309";

/* ── Static role definitions ──────────────────────────────────── */
const ROLES = [
  {
    id: "cex",
    label: "Country CEx Lead",
    icon: Building2,
    color: BLUE,
    bg: "rgba(0,87,168,0.08)",
    border: "rgba(0,87,168,0.18)",
    permissions: ["Plan Configuration", "Target Setting", "Payout Approval", "Quarterly Review"],
    badge: "Strategic",
    badgeBg: "rgba(0,87,168,0.09)",
    badgeColor: BLUE,
  },
  {
    id: "hr",
    label: "HR / C&B",
    icon: UserCog,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.18)",
    permissions: ["Staff Management", "Compensation Bands", "Leave Governance", "Headcount Review"],
    badge: "People Ops",
    badgeBg: "rgba(124,58,237,0.08)",
    badgeColor: "#7C3AED",
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: GREEN,
    bg: "rgba(14,122,79,0.07)",
    border: "rgba(14,122,79,0.18)",
    permissions: ["Payout Governance", "Budget Tracking", "LC Validation", "Accrual Reports"],
    badge: "Financial Control",
    badgeBg: "rgba(14,122,79,0.08)",
    badgeColor: GREEN,
  },
  {
    id: "oec",
    label: "OEC Representative",
    icon: Shield,
    color: AMBER,
    bg: "rgba(180,83,9,0.07)",
    border: "rgba(180,83,9,0.18)",
    permissions: ["Compliance Review", "Audit Trail", "Policy Enforcement", "Exception Handling"],
    badge: "Compliance",
    badgeBg: "rgba(180,83,9,0.08)",
    badgeColor: AMBER,
  },
];

/* ── Admin module cards ───────────────────────────────────────── */
const MODULES = [
  {
    id: "plan-config",
    label: "Plan Configuration",
    description: "Define incentive plan parameters, thresholds, promo line assignments, and product weightings per quarter.",
    icon: Sliders,
    accent: BLUE,
    accentBg: "rgba(0,87,168,0.07)",
    accentBorder: "rgba(0,87,168,0.18)",
    badge: "CEx / Finance",
    status: "Active",
    statusColor: GREEN,
  },
  {
    id: "target-setting",
    label: "Target Setting",
    description: "Upload and validate individual representative targets. Cross-check plan versus historical actuals per country.",
    icon: Target,
    accent: "#7C3AED",
    accentBg: "rgba(124,58,237,0.07)",
    accentBorder: "rgba(124,58,237,0.18)",
    badge: "CEx / HR",
    status: "Active",
    statusColor: GREEN,
  },
  {
    id: "payout-governance",
    label: "Payout Governance",
    description: "Review, approve, or flag incentive payouts before release. Enforce dual-control authorization across Finance and CEx.",
    icon: FileCheck,
    accent: GREEN,
    accentBg: "rgba(14,122,79,0.07)",
    accentBorder: "rgba(14,122,79,0.18)",
    badge: "Finance / CEx",
    status: "Pending Review",
    statusColor: AMBER,
  },
  {
    id: "compliance",
    label: "Compliance Management",
    description: "Monitor policy adherence, exception requests, audit logs and OEC sign-off requirements per payout cycle.",
    icon: Shield,
    accent: AMBER,
    accentBg: "rgba(180,83,9,0.07)",
    accentBorder: "rgba(180,83,9,0.18)",
    badge: "OEC",
    status: "Active",
    statusColor: GREEN,
  },
  {
    id: "access-control",
    label: "Access & Role Control",
    description: "Assign system roles (CEx, HR, Finance, OEC) and manage country-level data access scopes per user.",
    icon: Lock,
    accent: NAVY,
    accentBg: "rgba(11,31,58,0.06)",
    accentBorder: "rgba(11,31,58,0.16)",
    badge: "Admin Only",
    status: "Restricted",
    statusColor: "#B91C1C",
  },
  {
    id: "audit-trail",
    label: "Audit Trail",
    description: "End-to-end immutable log of all configuration changes, target edits, payout approvals and access events.",
    icon: ClipboardList,
    accent: "#0E6E9A",
    accentBg: "rgba(14,110,154,0.07)",
    accentBorder: "rgba(14,110,154,0.18)",
    badge: "OEC / Finance",
    status: "Active",
    statusColor: GREEN,
  },
];

/* ── Governance timeline events ──────────────────────────────── */
const TIMELINE = [
  { label: "Q1 Plan Locked", date: "Jan 5, 2026",  done: true,  icon: CheckCircle2,  color: GREEN },
  { label: "Q1 Targets Uploaded", date: "Jan 10, 2026", done: true, icon: CheckCircle2, color: GREEN },
  { label: "Q1 OEC Review", date: "Jan 15, 2026", done: true,  icon: CheckCircle2,  color: GREEN },
  { label: "Q1 Payout Approved", date: "Apr 10, 2026", done: true, icon: CheckCircle2, color: GREEN },
  { label: "Q2 Plan Configuration", date: "Apr 20, 2026", done: false, icon: Clock, color: BLUE },
  { label: "Q2 Target Setting", date: "May 1, 2026",   done: false, icon: Clock, color: AMBER },
  { label: "Q2 Finance Review",  date: "May 15, 2026",  done: false, icon: AlertTriangle, color: AMBER },
  { label: "Q2 Payout Release",  date: "Jun 30, 2026",  done: false, icon: Clock, color: T_SUB },
];

/* ── Pending actions ─────────────────────────────────────────── */
const PENDING = [
  { label: "Q2 budget overallocation flag in KZ", severity: "high",   owner: "Finance" },
  { label: "3 reps missing TCFA compliance acknowledgement", severity: "medium", owner: "OEC" },
  { label: "Promo Line B target uplift request pending CEx sign-off", severity: "medium", owner: "CEx" },
  { label: "New rep onboarding — access provisioning incomplete", severity: "low",    owner: "HR" },
];

const TABS = [
  { id: "overview",   label: "Overview",            icon: Settings     },
  { id: "icp",        label: "ICP Config",           icon: Sliders      },
  { id: "targets",    label: "Target Setting",       icon: Target       },
  { id: "payout",     label: "Payout Grid",          icon: BarChart2    },
  { id: "oec",        label: "OEC Compliance",       icon: Shield       },
  { id: "kpis",       label: "Qualitative KPIs",     icon: FileCheck    },
  { id: "analytics",  label: "Analytics",            icon: BarChart3    },
  { id: "onboarding", label: "Country Wizard",        icon: Wand2        },
  { id: "users",      label: "Users & Territories",  icon: MapPin       },
  { id: "workflow",   label: "Approval Workflows",   icon: Workflow     },
  { id: "uploader",   label: "Data Uploader",        icon: Upload       },
];

export default function AdminPanelView() {
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState("overview");

  const severityStyle = (s: string) => {
    if (s === "high")   return { color: "#B91C1C", bg: "rgba(185,28,28,0.08)",   border: "rgba(185,28,28,0.20)" };
    if (s === "medium") return { color: AMBER,     bg: "rgba(180,83,9,0.08)",    border: "rgba(180,83,9,0.22)" };
    return                     { color: T_SUB,     bg: "rgba(107,132,153,0.08)", border: "rgba(107,132,153,0.20)" };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 60%, #152F60 100%)`,
          boxShadow: "0 8px 40px rgba(11,31,58,0.30)",
        }}
      >
        {/* Subtle radial glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,87,168,0.18) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(160,191,206,0.08) 0%, transparent 70%)" }} />
        {/* Fine grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }} />

        <div className="relative px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,87,168,0.28)", color: "#A0BFCE", border: "1px solid rgba(0,87,168,0.35)" }}>
                <Settings className="w-3 h-3" /> Admin Panel
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#A0BFCE", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Globe className="w-3 h-3" /> All Countries
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(14,122,79,0.18)", color: "#86EFAC", border: "1px solid rgba(14,122,79,0.28)" }}>
                <BadgeCheck className="w-3 h-3" /> Governance Module
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-tight" style={{ color: "#FFFFFF" }}>
              Admin Panel
            </h1>
            <p className="mt-2 text-sm font-medium max-w-2xl leading-relaxed" style={{ color: "rgba(160,191,206,0.70)" }}>
              Used by <span className="font-bold text-white">Country CEx Leads</span>,{" "}
              <span className="font-bold text-white">HR / C&B</span>,{" "}
              <span className="font-bold text-white">Finance</span> and{" "}
              <span className="font-bold text-white">OEC Representatives</span> for plan configuration,
              target setting, payout governance and compliance management.
            </p>
          </div>

          {/* Stats pill */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 self-start md:self-center">
            {[
              { label: "Modules",     value: "9",       icon: Layers },
              { label: "Pending",     value: PENDING.length.toString(), icon: Bell },
              { label: "Roles",       value: "4",       icon: Users },
              { label: "Q2 Status",   value: "In Prog", icon: BarChart3 },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label}
                  className="flex flex-col items-center justify-center w-24 h-20 rounded-xl border"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(160,191,206,0.18)" }}
                >
                  <Icon className="w-4 h-4 mb-1" style={{ color: "rgba(160,191,206,0.70)" }} />
                  <p className="text-xl font-black leading-none" style={{ color: "#FFFFFF" }}>{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: "rgba(160,191,206,0.45)" }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Switcher (scrollable) ────────────────────────────── */}
      <div className="flex gap-1.5 p-1.5 rounded-xl overflow-x-auto" style={{ backgroundColor: BG, border: `1px solid ${BORDER}` }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0"
              style={isActive
                ? { backgroundColor: "#FFFFFF", color: BLUE, boxShadow: "0 1px 8px rgba(11,31,58,0.10)", border: `1px solid ${BORDER}` }
                : { color: T_SUB, border: "1px solid transparent" }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Functional Module Tabs ───────────────────────────────── */}
      {activeTab === "icp"        && <ICPConfigModule />}
      {activeTab === "targets"    && <TargetSettingModule />}
      {activeTab === "payout"     && <PayoutGridModule />}
      {activeTab === "oec"        && <OECComplianceModule />}
      {activeTab === "kpis"       && <QualKPIModule />}
      {activeTab === "analytics"  && <AnalyticsModule />}
      {activeTab === "onboarding" && <CountryOnboardingWizard />}
      {activeTab === "users"      && <UserTerritoryModule />}
      {activeTab === "workflow"   && <ApprovalWorkflowModule />}
      {activeTab === "uploader"   && <DataUploader />}

      {/* ── Tab: Overview content ───────────────────────────────── */}
      {activeTab === "overview" && <>

      {/* ── Role Cards ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: T_SUB }}>
          Role Permissions Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map(role => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(isActive ? null : role.id)}
                className="text-left rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300"
                style={{
                  backgroundColor: isActive ? role.bg : "#FFFFFF",
                  border: `1.5px solid ${isActive ? role.border : BORDER}`,
                  boxShadow: isActive ? `0 8px 32px ${role.bg}` : "0 1px 4px rgba(11,31,58,0.05)",
                  transform: isActive ? "translateY(-2px)" : "translateY(0)",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(11,31,58,0.10)";
                    (e.currentTarget as HTMLElement).style.borderColor = role.border;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(11,31,58,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: role.bg, border: `1px solid ${role.border}` }}>
                    <Icon className="w-5 h-5" style={{ color: role.color }} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: role.badgeBg, color: role.badgeColor, border: `1px solid ${role.border}` }}>
                    {role.badge}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-bold leading-snug" style={{ color: T_MAIN }}>{role.label}</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {role.permissions.map(p => (
                      <li key={p} className="flex items-center gap-2 text-[11px] font-medium" style={{ color: T_MUT }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto flex items-center gap-1 text-[11px] font-bold" style={{ color: role.color }}>
                  {isActive ? "Selected" : "View details"} <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Admin Modules + Pending Actions ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Module Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: T_SUB }}>
            Admin Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULES.map(mod => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1.5px solid ${BORDER}`,
                    boxShadow: "0 1px 4px rgba(11,31,58,0.05)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(11,31,58,0.10)";
                    (e.currentTarget as HTMLElement).style.borderColor = mod.accentBorder;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(11,31,58,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: mod.accentBg, border: `1px solid ${mod.accentBorder}` }}>
                      <Icon className="w-5 h-5" style={{ color: mod.accent }} />
                    </div>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: `${mod.statusColor}14`, color: mod.statusColor, border: `1px solid ${mod.statusColor}30` }}
                    >
                      <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: mod.statusColor }} />
                      {mod.status}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: mod.accentBg, color: mod.accent, border: `1px solid ${mod.accentBorder}` }}>
                        {mod.badge}
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold mt-1.5" style={{ color: T_MAIN }}>{mod.label}</h3>
                    <p className="text-[11px] font-medium mt-1 leading-relaxed" style={{ color: T_MUT }}>{mod.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-[11px] font-bold group-hover:gap-2 transition-all duration-200"
                    style={{ color: mod.accent }}>
                    Configure <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pending Actions + Timeline */}
        <div className="flex flex-col gap-5">

          {/* Pending Actions */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
              <div>
                <h3 className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Pending Actions</h3>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.65)" }}>Requires attention</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)", boxShadow: "0 2px 10px rgba(185,28,28,0.40)" }}>
                <Bell className="w-4 h-4" style={{ color: "#FFFFFF" }} />
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: BG }}>
              {PENDING.map((item, i) => {
                const s = severityStyle(item.severity);
                return (
                  <div key={i} className="px-5 py-3.5 transition-colors flex flex-col gap-1.5"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = BG)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                      <p className="text-[11px] font-semibold leading-snug" style={{ color: T_MAIN }}>{item.label}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-5">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {item.severity}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T_SUB }}>
                        → {item.owner}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Governance Timeline */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 1px 4px rgba(11,31,58,0.05)" }}>
            <div className="px-5 py-4"
              style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY2} 100%)` }}>
              <h3 className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Governance Timeline</h3>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "rgba(160,191,206,0.65)" }}>Quarterly cycle milestones</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-1">
              {TIMELINE.map((evt, i) => {
                const Icon = evt.icon;
                return (
                  <div key={i} className="flex items-start gap-3 py-2 relative">
                    {i < TIMELINE.length - 1 && (
                      <div className="absolute left-[13px] top-7 w-[1.5px] h-[calc(100%-4px)]"
                        style={{ backgroundColor: evt.done ? `${GREEN}30` : `${BORDER}` }} />
                    )}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{ backgroundColor: evt.done ? "rgba(14,122,79,0.10)" : BG, border: `1.5px solid ${evt.color}40`, marginTop: "1px" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: evt.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-bold leading-snug ${evt.done ? "" : "opacity-60"}`}
                        style={{ color: evt.done ? T_MAIN : T_MUT }}>
                        {evt.label}
                      </p>
                      <p className="text-[10px] font-medium mt-0.5" style={{ color: T_SUB }}>{evt.date}</p>
                    </div>
                    {evt.done && (
                      <FileCog className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: `${GREEN}80` }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Coming Soon Banner ───────────────────────────────────── */}
      <div
        className="rounded-2xl px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY2} 100%)`, border: `1px solid rgba(160,191,206,0.12)` }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(14,122,79,0.22)", color: "#86EFAC", border: "1px solid rgba(14,122,79,0.35)" }}>
              <Clock className="w-3 h-3" /> Roadmap · Phase 2
            </span>
          </div>
          <h3 className="text-lg font-black" style={{ color: "#FFFFFF" }}>Full Admin Controls Coming in Phase 2</h3>
          <p className="text-[12px] font-medium mt-1 max-w-lg leading-relaxed" style={{ color: "rgba(160,191,206,0.65)" }}>
            Interactive plan configuration, real-time target uploads, multi-level payout approval workflows
            and OEC compliance dashboards are under active development.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-default select-none"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(160,191,206,0.80)", border: "1.5px solid rgba(160,191,206,0.18)" }}>
          <Lock className="w-4 h-4" /> Configuration Locked
        </div>
      </div>

      </> /* end overview tab */}

    </div>
  );
}
