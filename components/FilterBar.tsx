/**
 * FilterBar — Renders all dropdown filters and the reset button.
 * Each dropdown is populated from the `options` prop derived by
 * useFilteredData — no data processing happens inside this component.
 */

import type { Filters } from "@/lib/types";

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

export default function FilterBar({
  filters,
  options,
  onFilterChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="filters-bar fade-in">
      {/* Country */}
      <div className="filter-item">
        <label htmlFor="filter-country">Country</label>
        <select
          id="filter-country"
          value={filters.country}
          onChange={(e) => onFilterChange("country", e.target.value)}
        >
          <option value="all">All Countries</option>
          {options.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div className="filter-item">
        <label htmlFor="filter-year">Year</label>
        <select
          id="filter-year"
          value={filters.year}
          onChange={(e) => onFilterChange("year", e.target.value)}
        >
          <option value="all">All Years</option>
          {options.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Quarter */}
      <div className="filter-item">
        <label htmlFor="filter-quarter">Quarter</label>
        <select
          id="filter-quarter"
          value={filters.quarter}
          onChange={(e) => onFilterChange("quarter", e.target.value)}
        >
          <option value="all">All Quarters</option>
          {options.quarters.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      {/* Promo Line / Team */}
      <div className="filter-item">
        <label htmlFor="filter-team">Promo Line</label>
        <select
          id="filter-team"
          value={filters.team}
          onChange={(e) => onFilterChange("team", e.target.value)}
        >
          <option value="all">All Teams</option>
          {options.teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Rep */}
      <div className="filter-item">
        <label htmlFor="filter-rep">Medical Representative</label>
        <select
          id="filter-rep"
          value={filters.rep}
          onChange={(e) => onFilterChange("rep", e.target.value)}
        >
          <option value="all">All Reps</option>
          {options.reps.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* View Selector */}
      <div className="filter-item">
        <label htmlFor="filter-view">View Report Format</label>
        <select
          id="filter-view"
          className="view-select"
          value={filters.view}
          onChange={(e) => onFilterChange("view", e.target.value)}
        >
          <option value="detailed">Actual vs Plan Performance</option>
          <option value="summary">Summary Calculation (Financials)</option>
          <option value="signoff">Statement of Bonuses (Sign-Off)</option>
        </select>
      </div>

      {/* Spacer */}
      <div className="filter-spacer" />

      {/* Reset */}
      <button id="reset-btn" className="reset-btn" onClick={onReset}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Reset
      </button>
    </div>
  );
}
