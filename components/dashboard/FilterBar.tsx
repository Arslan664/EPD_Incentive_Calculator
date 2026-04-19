"use client";

import type { Filters } from "@/lib/types";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface FilterItemProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  widthClass?: string;
}

const FilterItem = ({ label, value, options, onChange, widthClass = "w-full" }: FilterItemProps) => (
  <div className={cn("flex flex-col gap-2", widthClass)}>
    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">
      {label}
    </label>
    <div className="group relative w-full">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="relative w-full h-[42px] appearance-none bg-slate-900/60 border border-white/10 hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:bg-slate-800/80 pl-4 pr-10 rounded-xl text-[13px] font-medium text-slate-300 transition-all outline-none cursor-pointer backdrop-blur-sm block shadow-inner"
      >
        <option value="all" className="bg-slate-800 text-slate-300">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-800 text-slate-300">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-blue-400 transition-colors" />
    </div>
  </div>
);

export default function FilterBar({
  filters,
  options,
  onFilterChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="relative group/filter">
      <div className="absolute -inset-1 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-3xl blur opacity-50 group-hover/filter:opacity-100 transition duration-1000"></div>
      <div className="relative bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-wrap items-end gap-x-6 gap-y-5 shadow-2xl shadow-black/40">
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
          widthClass="w-full sm:w-[160px] md:w-[180px]"
        />

        <div className="flex-1 min-w-[280px]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1 mb-2 block">
            View Format
          </label>
          <div className="flex items-center bg-slate-950/50 p-1.5 rounded-xl h-[42px] border border-white/5 backdrop-blur-sm">
            <button
              onClick={() => onFilterChange("view", "detailed")}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center",
                filters.view === "detailed"
                  ? "bg-slate-800 shadow-lg text-blue-400 border border-white/10"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              Actual vs Plan
            </button>
            <button
              onClick={() => onFilterChange("view", "summary")}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center",
                filters.view === "summary"
                  ? "bg-slate-800 shadow-lg text-blue-400 border border-white/10"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              Regional Overview
            </button>
            <button
              onClick={() => onFilterChange("view", "signoff")}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center",
                filters.view === "signoff"
                  ? "bg-slate-800 shadow-lg text-blue-400 border border-white/10"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              Sign-Off
            </button>
          </div>
        </div>

        <button
          onClick={onReset}
          className="h-[42px] px-5 flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-white/20 font-semibold text-sm transition-all border border-white/5 rounded-xl ml-auto bg-slate-900/50"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          Reset
        </button>
      </div>
    </div>
  );
}
