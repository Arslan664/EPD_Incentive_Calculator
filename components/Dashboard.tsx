"use client";

/**
 * Dashboard — The core orchestrator Client Component.
 *
 * This is the ONLY component that holds interactive state.
 * It manages filter state and delegates rendering to child components:
 *   - Navbar (search input)
 *   - FilterBar (dropdowns)
 *   - DataTable -> DetailedView | SummaryView
 *
 * The useFilteredData hook ensures memoized filtering —
 * critical for performance with the 90+ record dataset.
 */

import { useState, useCallback } from "react";
import { comprehensiveData } from "@/data/comprehensiveData";
import { useFilteredData } from "@/hooks/useFilteredData";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import type { Filters } from "@/lib/types";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import DataTable from "@/components/DataTable";

const DEFAULT_FILTERS: Filters = {
  country: "all",
  year: "all",
  quarter: "all",
  team: "all",
  rep: "all",
  search: "",
  view: "detailed",
};

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Dynamic fetch (falls back to comprehensiveData if Supabase not configured)
  const { data: dbData, isLoading } = useSupabaseData(comprehensiveData);

  const { filteredData, options } = useFilteredData(dbData, filters);

  // Memoized handler — prevents unnecessary child re-renders
  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  return (
    <div className="app-container">
      <Navbar searchValue={filters.search} onSearchChange={handleSearchChange} />

      <main className="main-content">
        <div className="header-section fade-in">
          <h1>Medical Representatives Performance</h1>
          <p>Detailed Actual vs Plan Achievement &amp; Incentive Output</p>
        </div>

        <FilterBar
          filters={filters}
          options={options}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        <DataTable data={filteredData} view={filters.view} />
      </main>
    </div>
  );
}
