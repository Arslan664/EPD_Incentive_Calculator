"use client";

import { useMemo } from "react";
import type { IncentiveRecord, Filters } from "@/lib/types";

/**
 * Custom hook that augments raw data with derived Country/Year fields
 * (matching the original app.js mock logic) and returns memoized
 * filtered results plus unique dropdown option lists.
 *
 * useMemo ensures the expensive filtering only re-runs when the
 * filters or source data actually change — not on every render.
 */
export function useFilteredData(
  rawData: IncentiveRecord[],
  filters: Filters,
  user?: { email: string; name: string; role: string } | null
) {
  const augmentedData = useMemo(() => {
    return rawData.map((d, index) => {
      // Create fallbacks only if fields are missing
      let existingYear = d.Year;
      if (!existingYear && d.Quarter) {
        const match = d.Quarter.match(/\d{4}/);
        if (match) {
          existingYear = match[0];
        }
      }
      const fallbackYearStr = index < 50 ? "2017" : "2018";
      const finalYear = existingYear || fallbackYearStr;

      return {
        ...d,
        Country: d.Country || (index % 3 === 0 ? "Kazakhstan" : "Georgia"),
        Year: finalYear,
        Quarter: d.Quarter || `Q2 ${finalYear}`,
        FLM: d.FLM || (index < 40 ? "Fahad Ayub" : "Abdul Manan")
      };
    });
  }, [rawData]);

  // Apply Role filtering based on User Authentication
  const roleFilteredData = useMemo(() => {
    if (user?.role === "FLM") {
      // strict check so Abdul Manan only sees his reps, etc.
      return augmentedData.filter(d => d.FLM === user.name);
    }
    // DVP (Arslan Sohail) sees all
    return augmentedData;
  }, [augmentedData, user]);

  // Dropdown options — recomputed when data or relevant filters change
  const options = useMemo(() => {
    const unique = (key: string, source = roleFilteredData) =>
      [...new Set(source.map((d: any) => d[key] as string).filter(Boolean))].sort();

    const yearFilteredData = filters.year !== "all" 
      ? roleFilteredData.filter((d: any) => d.Year === filters.year)
      : roleFilteredData;

    return {
      countries: unique("Country"),
      years: unique("Year"),
      quarters: unique("Quarter", yearFilteredData),
      teams: unique("PromoLine"),
      reps: unique("Name"),
    };
  }, [roleFilteredData, filters.year]);

  // Filtered data — only recomputed when filters change
  const filteredData = useMemo(() => {
    let result = roleFilteredData;
    const search = filters.search.toLowerCase();

    if (search) {
      result = result.filter(
        (d) =>
          d.Name?.toLowerCase().includes(search) ||
          d.PromoLine?.toLowerCase().includes(search)
      );
    }

    if (filters.country !== "all")
      result = result.filter((d: any) => d.Country === filters.country);
    if (filters.year !== "all")
      result = result.filter((d: any) => d.Year === filters.year);
    if (filters.quarter !== "all")
      result = result.filter((d: any) => d.Quarter === filters.quarter);
    if (filters.team !== "all")
      result = result.filter((d: any) => d.PromoLine === filters.team);
    if (filters.rep !== "all")
      result = result.filter((d: any) => d.Name === filters.rep);

    return result as IncentiveRecord[];
  }, [roleFilteredData, filters]);

  return { filteredData, options };
}
