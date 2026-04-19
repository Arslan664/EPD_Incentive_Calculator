"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { IncentiveRecord } from "@/lib/types";

/**
 * Custom hook to fetch dynamic data from Supabase.
 * Connects to the v_dashboard_detailed view which provides the base facts
 * needed for all reporting views, integrating perfectly with the calculation engine.
 */
export function useSupabaseData(fallbackData: IncentiveRecord[]) {
  const [data, setData] = useState<IncentiveRecord[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Only attempt to fetch if URL is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-url")) {
          console.warn("Supabase URL not configured fully. Using fallback data.");
          setData(fallbackData);
          setIsLoading(false);
          return;
        }

        const { data: remoteData, error: fetchError } = await supabase
          .from("v_dashboard_detailed")
          .select("*")
          .order("name", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (remoteData && remoteData.length > 0) {
          // Transform Database format to expected IncentiveRecord structure
          const transformedData: IncentiveRecord[] = remoteData.map((row: any) => ({
            Name: row.name,
            Position: row.position,
            Position_Sum: row.position,
            PromoLine: row.promo_line,
            Quarter: row.quarter,
            Year: row.year?.toString() || "2017",
            Country: row.country || "Kazakhstan", // Currently not in view, you can adjust
            
            // Real fields from db mapped back
            TotalAct: row.total_actual?.toString() || "0",
            TotalPlan: row.total_plan?.toString() || "0",
            
            P1Name: row.p1_name || "Product 1",
            P1Act: row.p1_actual?.toString() || "0",
            P1Plan: row.p1_plan?.toString() || "0",
            
            P2Name: row.p2_name || "Product 2",
            P2Act: row.p2_actual?.toString() || "0",
            P2Plan: row.p2_plan?.toString() || "0",
            
            P3Name: row.p3_name || "Product 3",
            P3Act: row.p3_actual?.toString() || "0",
            P3Plan: row.p3_plan?.toString() || "0",
            
            TCFA_Act: row.tcfa_pct ? `${row.tcfa_pct}%` : "0%",
            
            // To be compatible with old sums handling, just placeholders
            Id_Sum: row.rep_id,
            TargetForQuarter_Sum: row.target_incentive?.toString() || "0",
            ReimbursableMonths_Sum: row.reimbursable_months_pct?.toString() || "100",
            TargetBase_Sum: "0",
            TargetSalesResult_Sum: "0",
            Product1_Sum: "0",
            Product2_Sum: "0",
            Product3_Sum: "0",
            Product4_Sum: "0",
            IncSalesResult_Sum: "0",
            TargetTCFA_Sum: "0",
            TargetCoaching_Sum: "0",
            IncTCFA_Sum: "0",
            IncCoaching_Sum: "0",
            FieldWork_Sum: "0",
            TotalIncentive_Sum: "0",
            Team_Sum: row.promo_line,
          }));

          setData(transformedData);
        } else {
          // If the DB is empty (e.g., prior to seeding), fallback gracefully
          setData(fallbackData);
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(fallbackData); // graceful degradation
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [fallbackData]);

  return { data, isLoading, error };
}
