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

        // Native relational fetch! No SQL View required!
        const { data: remoteData, error: fetchError } = await supabase
          .from("quarterly_performance")
          .select(`
            total_actual,
            total_plan,
            tcfa_pct,
            time_in_coaching_pct,
            reimbursable_months_pct,
            target_incentive,
            status,
            representatives!inner(
              name,
              positions(title),
              promo_lines(name),
              cities(name)
            ),
            quarters!inner(
              label,
              year,
              quarter_num,
              exchange_rate_lc_usd
            ),
            product_performance(
              portfolio_num,
              actual_value,
              plan_value,
              products(name)
            )
          `);

        if (fetchError) {
          throw fetchError;
        }

        if (remoteData && remoteData.length > 0) {
          // Transform Database format to expected IncentiveRecord structure
          const transformedData: IncentiveRecord[] = remoteData.map((row: any) => {
            const rep = row.representatives;
            const qrt = row.quarters;
            const posTitle = rep.positions?.title || "Unknown";
            const pLineName = rep.promo_lines?.name || "Unknown";
            
            // Unpack dynamic nested products
            const prods = row.product_performance || [];
            const getP = (num: number) => prods.find((p: any) => p.portfolio_num === num);
            
            const p1 = getP(1);
            const p2 = getP(2);
            const p3 = getP(3);
            const p4 = getP(4);

            return {
              Name: rep.name,
              Position: posTitle,
              Position_Sum: posTitle,
              PromoLine: pLineName,
              Quarter: qrt.label,
              Year: qrt.year?.toString() || "2017",
              Country: rep.cities?.name || "Kazakhstan", 
              
              TotalAct: row.total_actual?.toString() || "0",
              TotalPlan: row.total_plan?.toString() || "0",
              
              P1Name: p1?.products?.name || "",
              P1Act: p1?.actual_value?.toString() || "0",
              P1Plan: p1?.plan_value?.toString() || "0",
              
              P2Name: p2?.products?.name || "",
              P2Act: p2?.actual_value?.toString() || "0",
              P2Plan: p2?.plan_value?.toString() || "0",
              
              P3Name: p3?.products?.name || "",
              P3Act: p3?.actual_value?.toString() || "0",
              P3Plan: p3?.plan_value?.toString() || "0",
              
              TCFA_Act: row.tcfa_pct ? `${row.tcfa_pct}%` : "0%",
            
            // To be compatible with old sums handling, just placeholders
            Id_Sum: "0",
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
            Team_Sum: pLineName,
            };
          });

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
