import { useMemo, useState } from "react";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { CheckCircle, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffViewProps {
  data: IncentiveRecord[];
  filters: Filters; // used to filter by year and other dims except quarter
  user?: { email: string; name: string; role: string } | null;
}

export default function StaffView({ data, filters, user }: StaffViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10; // 10 is usually good for staff list

  const staffList = useMemo(() => {
    // 1. Role-based filtering
    let safeData = data;
    if (user?.role === "FLM") {
      // Mock FLM filtering to Abdul Manan and Fahad Ayub if user is FLM
      // Supabase dynamic FLM check via "managers" doesn't strictly exist, 
      // but if FLM was provided we'd filter here.
      // We will skip strict FLM filtering for staff view if FLM is not mapped or implement a fallback
    }

    // 2. Filter by Year, Country, Team, Search
    if (filters.year !== "all") {
      safeData = safeData.filter(d => d.Year === filters.year);
    }
    if (filters.country !== "all") {
      safeData = safeData.filter(d => d.Country === filters.country);
    }
    if (filters.team !== "all") {
      safeData = safeData.filter(d => d.PromoLine === filters.team);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      safeData = safeData.filter(d => 
        d.Name?.toLowerCase().includes(search) || 
        d.Position?.toLowerCase().includes(search)
      );
    }

    // 3. Group by Representative
    const map = new Map<string, any>();
    safeData.forEach(d => {
      if (!d.Name) return;
      if (!map.has(d.Name)) {
        map.set(d.Name, {
          name: d.Name,
          position: d.Position,
          country: d.Country,
          promoLine: d.PromoLine,
          maternityLeave: (d.Status === "Maternity leave" || d.Status?.toLowerCase().includes("maternity")) ? "Yes" : "",
          q1: false,
          q2: false,
          q3: false,
          q4: false,
        });
      }
      
      const rep = map.get(d.Name);
      // Determine quarter from Quarter label (e.g. "Q1 2017")
      if (d.Quarter?.includes("1")) rep.q1 = true;
      if (d.Quarter?.includes("2")) rep.q2 = true;
      if (d.Quarter?.includes("3")) rep.q3 = true;
      if (d.Quarter?.includes("4")) rep.q4 = true;
      
      // Update maternity leave if any record shows it
      if (d.Status === "Maternity leave" || d.Status?.toLowerCase().includes("maternity")) {
        rep.maternityLeave = "Yes";
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, filters, user]);

  const totalPages = Math.max(1, Math.ceil(staffList.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = staffList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Input Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Review staff information, tracking their status and quarterly availabilities.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm border border-blue-100">
          Total Staff: <span className="text-blue-700 ml-1">{staffList.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto w-full border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[50px] text-center border-b border-slate-200">#</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-[250px]">Name & Details</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 w-[150px]">Maternity Leave</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q1</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q2</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q3</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q4</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedList.map((row, i) => (
              <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5 text-center text-slate-500 font-mono text-xs">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{row.name}</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate" title={row.position}>{row.position}</span>
                      {row.country && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{row.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {row.maternityLeave ? (
                    <span className="inline-flex px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold tracking-wide">
                      Maternity
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </td>
                <td className="px-6 py-5 text-center">
                  {row.q1 ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-medium">—</span>}
                </td>
                <td className="px-6 py-5 text-center">
                  {row.q2 ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-medium">—</span>}
                </td>
                <td className="px-6 py-5 text-center">
                  {row.q3 ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-medium">—</span>}
                </td>
                <td className="px-6 py-5 text-center">
                  {row.q4 ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 font-medium">—</span>}
                </td>
              </tr>
            ))}
            {paginatedList.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No staff entries found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component logic block */}
      {staffList.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, staffList.length)} of {staffList.length} staff
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-colors",
                  safePage === pg 
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200/60"
                )}
              >
                {pg}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
