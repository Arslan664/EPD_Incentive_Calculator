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

export default function FilterBar({
  filters,
  options,
  onFilterChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-wrap items-end gap-x-6 gap-y-5 shadow-sm w-full">
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
      <FilterItem
        label="Representative"
        value={filters.rep}
        options={options.reps}
        onChange={(v) => onFilterChange("rep", v)}
        widthClass="w-full sm:w-[160px] md:w-[180px]"
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
