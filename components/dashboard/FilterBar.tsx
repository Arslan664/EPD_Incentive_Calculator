"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Filters } from "@/lib/types";
import { ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Generic plain select filter ─────────────────────────────────────────── */
interface FilterItemProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  widthClass?: string;
}

const FilterItem = ({ label, value, options, onChange, widthClass = "w-full" }: FilterItemProps) => (
  <div className={cn("flex flex-col gap-1.5", widthClass)}>
    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">
      {label}
    </label>
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-3 pr-10 rounded-lg text-[13px] font-medium text-slate-700 transition-all outline-none cursor-pointer shadow-sm"
      >
        <option value="all">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

/* ─── Searchable Rep dropdown ──────────────────────────────────────────────── */
interface RepSearchProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function RepSearchFilter({ value, options, onChange }: RepSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const displayLabel = value === "all" ? "All Representatives" : value;

  const handleSelect = useCallback((v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  }, [onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("all");
    setQuery("");
  }, [onChange]);

  return (
    <div className="flex flex-col gap-1.5 w-full sm:w-[200px] md:w-[220px]" ref={wrapRef}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">
        Representative
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full h-10 flex items-center justify-between pl-3 pr-2.5 rounded-lg text-[13px] font-medium transition-all outline-none shadow-sm border bg-white",
          open
            ? "border-blue-500 ring-1 ring-blue-500 text-slate-800"
            : "border-slate-200 hover:border-slate-300 text-slate-700"
        )}
      >
        <span className="truncate text-left flex-1">
          {value !== "all" ? (
            <span className="text-blue-700 font-semibold">{value}</span>
          ) : (
            <span className="text-slate-400">All Representatives</span>
          )}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value !== "all" && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as any)}
              className="p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-150", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-[74px] w-[220px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rep name…"
                className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-[12px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-[240px] py-1">
            {/* "All" option */}
            <button
              onClick={() => handleSelect("all")}
              className={cn(
                "w-full text-left px-3 py-2 text-[12px] font-medium transition-colors hover:bg-slate-50",
                value === "all" ? "text-blue-600 font-bold bg-blue-50/60" : "text-slate-500"
              )}
            >
              All Representatives
            </button>

            {filtered.length === 0 && (
              <p className="px-3 py-3 text-[11px] text-slate-400 text-center">No matches found</p>
            )}

            {filtered.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={cn(
                  "w-full text-left px-3 py-2 text-[12px] font-medium transition-colors hover:bg-slate-50 truncate",
                  value === opt ? "text-blue-700 font-bold bg-blue-50" : "text-slate-700"
                )}
                title={opt}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Footer hint */}
          {filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/60">
              <span className="text-[10px] text-slate-400 font-medium">
                {filtered.length} of {options.length} reps
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main FilterBar ───────────────────────────────────────────────────────── */
interface FilterBarProps {
  filters: Filters;
  options: {
    countries: string[];
    years: string[];
    quarters: string[];
    teams: string[];
    reps: string[];
  };
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, options, onFilterChange, onReset }: FilterBarProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-end gap-x-6 gap-y-5 shadow-sm w-full relative">
      <FilterItem
        label="Country"
        value={filters.country}
        options={options.countries}
        onChange={(v) => onFilterChange("country", v)}
        widthClass="w-full sm:w-[150px] md:w-[170px]"
      />
      <FilterItem
        label="Year"
        value={filters.year}
        options={options.years}
        onChange={(v) => onFilterChange("year", v)}
        widthClass="w-full sm:w-[120px] md:w-[140px]"
      />
      <FilterItem
        label="Quarter"
        value={filters.quarter}
        options={options.quarters}
        onChange={(v) => onFilterChange("quarter", v)}
        widthClass="w-full sm:w-[130px] md:w-[150px]"
      />
      <FilterItem
        label="Promo Line"
        value={filters.team}
        options={options.teams}
        onChange={(v) => onFilterChange("team", v)}
        widthClass="w-full sm:w-[140px]"
      />

      {/* Searchable Rep filter */}
      <RepSearchFilter
        value={filters.rep}
        options={options.reps}
        onChange={(v) => onFilterChange("rep", v)}
      />

      <div className="flex-1 min-w-[280px]">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1 mb-1.5 block">
          View Format
        </label>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg h-10 border border-slate-200">
          <button
            onClick={() => onFilterChange("view", "detailed")}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center",
              filters.view === "detailed"
                ? "bg-white shadow border border-slate-200 text-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            Actual vs Plan
          </button>
          <button
            onClick={() => onFilterChange("view", "summary")}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center",
              filters.view === "summary"
                ? "bg-white shadow border border-slate-200 text-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            Summary
          </button>
          <button
            onClick={() => onFilterChange("view", "signoff")}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-center",
              filters.view === "signoff"
                ? "bg-white shadow border border-slate-200 text-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            To Sign
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="h-10 px-5 flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 font-semibold text-sm transition-all border border-slate-200 rounded-lg ml-auto shadow-sm"
      >
        <RotateCcw className="w-4 h-4 text-slate-500" />
        Reset
      </button>
    </div>
  );
}
