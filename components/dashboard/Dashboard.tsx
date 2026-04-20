"use client";

import { useState, useCallback, useMemo } from "react";
import { comprehensiveData } from "@/data/comprehensiveData";
import { useFilteredData } from "@/hooks/useFilteredData";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import type { Filters } from "@/lib/types";
import { cleanNum, formatNum } from "@/lib/utils";
import { buildPerformanceInputFromRecord, computeSummaryRow } from "@/lib/incentiveCalculations";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import FilterBar from "@/components/dashboard/FilterBar";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Login from "@/components/auth/Login";
import StaffView from "@/components/dashboard/views/StaffView";
import ProductPromoView from "@/components/dashboard/views/ProductPromoView";
import LandingView from "@/components/dashboard/views/LandingView";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";

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
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("landing");

  // Dynamic fetch (falls back to static if Supabase not configured)
  const { data: dbData } = useSupabaseData(comprehensiveData);
  const { filteredData, options } = useFilteredData(dbData, filters, user);

  const handleLogout = useCallback(() => {
    setUser(null);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "year") {
        next.quarter = "all";
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  // Compute live KPI Stats based on current filtered data
  const stats = useMemo(() => {
    let tPlan = 0;
    let tAct = 0;
    let tInc = 0;
    let tBase = 0;

    filteredData.forEach(d => {
      tPlan += cleanNum(d.TotalPlan);
      tAct += cleanNum(d.TotalAct);
      
      const input = buildPerformanceInputFromRecord(d);
      const computed = computeSummaryRow(input);
      tInc += computed.totalIncentiveLC;
      tBase += computed.targetBaseLC;
    });

    // Active Reps = unique names (avoids double-counting Q1+Q2 for same person)
    const activeReps = new Set(filteredData.map(d => d.Name).filter(Boolean)).size;
    const overallAch = tPlan > 0 ? (tAct / tPlan) * 100 : 0;
    const avgBase = activeReps > 0 ? (tBase / activeReps) : 0;

    // Formatting for display
    const formatMill = (val: number) => val >= 1000000 ? (val / 1000000).toFixed(2) + "M" : val >= 1000 ? (val / 1000).toFixed(0) + "K" : val.toFixed(0);

    return {
      activeReps,
      overallAch: overallAch.toFixed(1) + "%",
      isUp: overallAch >= 100,
      totalInc: formatMill(tInc),
      avgBase: formatMill(avgBase),
    };
  }, [filteredData]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent font-sans selection:bg-blue-500/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activePage={activePage} 
        onPageChange={setActivePage} 
      />
      
      <Header 
        searchValue={filters.search} 
        onSearchChange={handleSearchChange} 
        user={user} 
        onLogout={handleLogout} 
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main className="max-w-[1600px] mx-auto w-full p-6 space-y-6">
        
        {activePage === "landing" ? (
          <LandingView data={dbData} user={user} onNavigate={setActivePage} />
        ) : activePage === "staff" ? (
          <StaffView data={dbData} filters={filters} user={user} />
        ) : activePage === "promo" ? (
          <ProductPromoView data={filteredData} filters={filters} />
        ) : (
          <>
            {/* Title & Stats Overview */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Medical Representatives Performance
            </h2>
            <p className="text-slate-500 font-medium">
              Detailed comparison of Actual vs. Planned achievements and incentives.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
            <StatCard 
              title="Overall Achievement" 
              value={stats.overallAch} 
              icon={TrendingUp} 
              trend={stats.isUp ? "up" : "down"} 
              trendValue={stats.overallAch} 
              color="bg-blue-500" 
            />
            <StatCard 
              title="Total Incentive" 
              value={`${stats.totalInc} LC`} 
              icon={DollarSign} 
              color="bg-emerald-500" 
            />
            <StatCard 
              title="Active Reps" 
              value={stats.activeReps.toString()} 
              icon={Users} 
              color="bg-indigo-500" 
            />
            <StatCard 
              title="Avg Target Base" 
              value={`${stats.avgBase} LC`} 
              icon={Target} 
              color="bg-amber-500" 
            />
          </div>
        </div>

        {/* Filters & Data */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-6">
          <FilterBar
            filters={filters}
            options={options}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
          <DataTable data={filteredData} view={filters.view} filters={filters} />
        </div>
        </>
        )}

      </main>
    </div>
  );
}
