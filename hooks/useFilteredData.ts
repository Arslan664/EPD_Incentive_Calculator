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
  filters: Filters
) {
  // Augment data (mirrors the original mock Country/Year logic from app.js)
  const augmentedData = useMemo(() => {
    return rawData.map((d, index) => ({
      ...d,
      Country: index % 3 === 0 ? "Kazakhstan" : "Georgia",
      Year: index < 50 ? "2017" : "2018",
    }));
  }, [rawData]);

  // Dropdown options — only recomputed when the source data changes
  const options = useMemo(() => {
    const unique = (key: keyof IncentiveRecord) =>
      [...new Set(augmentedData.map((d) => d[key] as string).filter(Boolean))].sort();

    return {
      countries: unique("Country"),
      years: unique("Year"),
      quarters: unique("Quarter"),
      teams: unique("PromoLine"),
      reps: unique("Name"),
    };
  }, [augmentedData]);

  // Filtered data — only recomputed when filters change
  const filteredData = useMemo(() => {
    let result = augmentedData;
    const search = filters.search.toLowerCase();

    if (search) {
      result = result.filter(
        (d) =>
          d.Name?.toLowerCase().includes(search) ||
          d.PromoLine?.toLowerCase().includes(search)
      );
    }

    if (filters.country !== "all")
      result = result.filter((d) => d.Country === filters.country);
    if (filters.year !== "all")
      result = result.filter((d) => d.Year === filters.year);
    if (filters.quarter !== "all")
      result = result.filter((d) => d.Quarter === filters.quarter);
    if (filters.team !== "all")
      result = result.filter((d) => d.PromoLine === filters.team);
    if (filters.rep !== "all")
      result = result.filter((d) => d.Name === filters.rep);

    return result;
  }, [augmentedData, filters]);

  return { filteredData, options };
}
