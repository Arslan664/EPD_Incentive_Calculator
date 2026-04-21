"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Filters } from "@/lib/types";
import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Token shorthands ──────────────────────────────────────── */
const BLUE        = "#0057A8";
const BG_LIGHT    = "#F0F4F8";
const BORDER      = "#D0DCE8";
const TEXT_MAIN   = "#0F1827";
const TEXT_MUTED  = "#3D5875";
const TEXT_SUBTLE = "#6B8499";
const BLUE_RING   = "rgba(0,87,168,0.12)";
const FOCUS_STYLE = { borderColor: BLUE, boxShadow: `0 0 0 3px ${BLUE_RING}` };
const BLUR_STYLE  = { borderColor: BORDER, boxShadow: "none" };

/* ── FilterItem ────────────────────────────────────────────── */
interface FilterItemProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  widthClass?: string;
}

const FilterItem = ({ label, value, options, onChange, widthClass = "w-full" }: FilterItemProps) => (
  <div className={cn("flex flex-col gap-1.5", widthClass)}>
    <label className="text-[10px] font-bold uppercase tracking-[0.10em] pl-0.5" style={{ color: TEXT_SUBTLE }}>
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-10 appearance-none rounded-xl pl-3 pr-9 text-[13px] font-semibold outline-none cursor-pointer transition-all"
        style={{
          backgroundColor: "#FFFFFF",
          border: `1.5px solid ${BORDER}`,
          color: value === "all" ? TEXT_SUBTLE : TEXT_MAIN,
        }}
        onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
        onBlur={e => Object.assign(e.target.style, BLUR_STYLE)}
      >
        <option value="all">All</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: TEXT_SUBTLE }} />
    </div>
  </div>
);

/* ── Searchable Rep dropdown ───────────────────────────────── */
function RepSearchFilter({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const select = useCallback((v: string) => { onChange(v); setOpen(false); setQuery(""); }, [onChange]);
  const clear  = useCallback((e: React.MouseEvent) => { e.stopPropagation(); onChange("all"); setQuery(""); }, [onChange]);

  return (
    <div className="flex flex-col gap-1.5 w-full sm:w-[210px]" ref={wrapRef}>
      <label className="text-[10px] font-bold uppercase tracking-[0.10em] pl-0.5" style={{ color: TEXT_SUBTLE }}>
        Representative
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 flex items-center pl-3 pr-2.5 rounded-xl text-[13px] font-semibold transition-all outline-none"
        style={{
          backgroundColor: "#FFFFFF",
          border: `1.5px solid ${open ? BLUE : BORDER}`,
          boxShadow: open ? `0 0 0 3px ${BLUE_RING}` : "none",
          color: value !== "all" ? TEXT_MAIN : TEXT_SUBTLE,
        }}
      >
        <span className="truncate text-left flex-1">
          {value !== "all" ? <span style={{ color: BLUE, fontWeight: 700 }}>{value}</span> : "All Representatives"}
        </span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {value !== "all" && (
            <span role="button" onClick={clear} className="p-0.5 rounded cursor-pointer" style={{ color: TEXT_SUBTLE }}>
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-150", open && "rotate-180")} style={{ color: TEXT_SUBTLE }} />
        </div>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-[74px] w-[224px] rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: `1.5px solid ${BORDER}`,
            boxShadow: "0 8px 32px rgba(11,31,58,0.14)",
          }}
        >
          <div className="p-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: TEXT_SUBTLE }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search rep name…"
                className="w-full h-8 rounded-lg pl-8 pr-3 text-[12px] font-medium outline-none transition-all"
                style={{ backgroundColor: BG_LIGHT, border: `1.5px solid ${BORDER}`, color: TEXT_MAIN }}
                onFocus={e => Object.assign(e.target.style, FOCUS_STYLE)}
                onBlur={e => Object.assign(e.target.style, BLUR_STYLE)}
              />
              {query && <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: TEXT_SUBTLE }}><X className="w-3 h-3" /></button>}
            </div>
          </div>
          <div className="overflow-y-auto max-h-[240px] py-1">
            <button onClick={() => select("all")} className="w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors"
              style={value === "all" ? { color: BLUE, backgroundColor: "rgba(0,87,168,0.06)" } : { color: TEXT_MUTED }}
              onMouseEnter={e => { if (value !== "all") (e.currentTarget as HTMLElement).style.backgroundColor = BG_LIGHT; }}
              onMouseLeave={e => { if (value !== "all") (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >All Representatives</button>

            {filtered.length === 0 && <p className="px-3 py-3 text-[11px] text-center" style={{ color: TEXT_SUBTLE }}>No matches found</p>}

            {filtered.map(opt => (
              <button key={opt} onClick={() => select(opt)} title={opt}
                className="w-full text-left px-3 py-2 text-[12px] font-semibold transition-colors truncate"
                style={value === opt ? { color: BLUE, backgroundColor: "rgba(0,87,168,0.06)", fontWeight: 700 } : { color: TEXT_MAIN }}
                onMouseEnter={e => { if (value !== opt) (e.currentTarget as HTMLElement).style.backgroundColor = BG_LIGHT; }}
                onMouseLeave={e => { if (value !== opt) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >{opt}</button>
            ))}
          </div>
          <div className="px-3 py-1.5" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT }}>
            <span className="text-[10px] font-semibold" style={{ color: TEXT_SUBTLE }}>{filtered.length} of {options.length} reps</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main FilterBar ────────────────────────────────────────── */
interface FilterBarProps {
  filters: Filters;
  options: { countries: string[]; years: string[]; quarters: string[]; teams: string[]; reps: string[] };
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, options, onFilterChange, onReset }: FilterBarProps) {
  return (
    <div
      className="p-5 rounded-2xl flex flex-wrap items-end gap-x-5 gap-y-4 w-full relative"
      style={{
        backgroundColor: "#FFFFFF",
        border: `1.5px solid ${BORDER}`,
        boxShadow: "0 1px 8px rgba(11,31,58,0.05)",
      }}
    >
      {/* Navy left accent bar */}
      <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full" style={{ backgroundColor: "#0B1F3A" }} />
      <div className="pl-3 w-full -mb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#0B1F3A" }}>Filter Data</p>
      </div>

      <FilterItem label="Country"    value={filters.country} options={options.countries} onChange={v => onFilterChange("country", v)} widthClass="w-full sm:w-[150px]" />
      <FilterItem label="Year"       value={filters.year}    options={options.years}     onChange={v => onFilterChange("year", v)}    widthClass="w-full sm:w-[110px]" />
      <FilterItem label="Quarter"    value={filters.quarter} options={options.quarters}  onChange={v => onFilterChange("quarter", v)} widthClass="w-full sm:w-[125px]" />
      <FilterItem label="Promo Line" value={filters.team}    options={options.teams}     onChange={v => onFilterChange("team", v)}    widthClass="w-full sm:w-[140px]" />
      <RepSearchFilter value={filters.rep} options={options.reps} onChange={v => onFilterChange("rep", v)} />

      {/* View toggle */}
      <div className="flex-1 min-w-[280px]">
        <label className="text-[10px] font-bold uppercase tracking-[0.10em] pl-0.5 mb-1.5 block" style={{ color: TEXT_SUBTLE }}>
          View Format
        </label>
        <div className="flex items-center p-1 rounded-xl h-10" style={{ backgroundColor: BG_LIGHT, border: `1.5px solid ${BORDER}` }}>
          {[
            { id: "detailed", label: "Actual vs Plan" },
            { id: "summary",  label: "Summary" },
            { id: "signoff",  label: "To Sign" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onFilterChange("view", tab.id)}
              className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center"
              style={
                filters.view === tab.id
                  ? { backgroundColor: "#FFFFFF", color: BLUE, boxShadow: "0 1px 6px rgba(11,31,58,0.10)", border: `1px solid ${BORDER}` }
                  : { color: TEXT_MUTED, border: "1px solid transparent" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="h-10 px-5 flex items-center gap-2 text-sm font-bold transition-all rounded-xl ml-auto"
        style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, color: TEXT_MUTED }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#EAF2FA";
          (e.currentTarget as HTMLElement).style.borderColor = "#A8BFCE";
          (e.currentTarget as HTMLElement).style.color = "#0B1F3A";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF";
          (e.currentTarget as HTMLElement).style.borderColor = BORDER;
          (e.currentTarget as HTMLElement).style.color = TEXT_MUTED;
        }}
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
    </div>
  );
}
