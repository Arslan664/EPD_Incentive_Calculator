import { useMemo, useState } from "react";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { CheckCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffViewProps {
  data: IncentiveRecord[];
  filters: Filters;
  user?: { email: string; name: string; role: string } | null;
  onCountryChange?: (country: string) => void;
  countryOptions?: string[];
}

export default function StaffView({ data, filters, user, onCountryChange, countryOptions = [] }: StaffViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const PAGE_SIZE = 10;

  const staffList = useMemo(() => {
    let safeData = data.filter(d => d.Name && d.Name.trim() !== "");

    // Country filter (local to staff view)
    if (selectedCountry !== "all") {
      safeData = safeData.filter(d => d.Country === selectedCountry);
    }

    // Team/PromoLine filter from main filters
    if (filters.team !== "all") {
      safeData = safeData.filter(d => d.PromoLine === filters.team);
    }

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      safeData = safeData.filter(d =>
        d.Name?.toLowerCase().includes(search) ||
        d.Position?.toLowerCase().includes(search)
      );
    }

    // Group by Representative name
    const map = new Map<string, any>();
    safeData.forEach(d => {
      if (!d.Name) return;
      if (!map.has(d.Name)) {
        map.set(d.Name, {
          name: d.Name,
          position: d.Position,
          country: d.Country,
          promoLine: d.PromoLine,
          isMaternity: false,
          q1: false,
          q2: false,
          q3: false,
          q4: false,
        });
      }

      const rep = map.get(d.Name);

      // Detect maternity leave from Status field or from the data
      if (
        d.Status === "Maternity leave" ||
        d.Status?.toLowerCase().includes("maternity")
      ) {
        rep.isMaternity = true;
      }

      // Map quarter flags from Quarter label
      const q = d.Quarter || "";
      if (q.includes("Q1")) rep.q1 = true;
      if (q.includes("Q2")) rep.q2 = true;
      if (q.includes("Q3")) rep.q3 = true;
      if (q.includes("Q4")) rep.q4 = true;
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, filters, selectedCountry, user]);

  // Reset page when data changes
  const totalPages = Math.max(1, Math.ceil(staffList.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = staffList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Derive unique countries from data
  const countries = useMemo(() => {
    const set = new Set<string>();
    data.forEach(d => { if (d.Country) set.add(d.Country); });
    return Array.from(set).sort();
  }, [data]);

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Input Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Staff status, maternity leave, and quarterly availability.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Country Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Country</label>
            <select
              value={selectedCountry}
              onChange={e => handleCountryChange(e.target.value)}
              className="h-9 appearance-none bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pl-3 pr-8 rounded-lg text-[13px] font-medium text-slate-700 transition-all outline-none cursor-pointer shadow-sm"
            >
              <option value="all">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm border border-blue-100 self-end">
            {staffList.length} Staff
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[50px] text-center border-b border-slate-200">#</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Name & Position</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">Promo Line</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">Maternity</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q1</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q2</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q3</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center border-b border-slate-200">Q4</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedList.map((row, i) => (
              <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 text-center text-slate-500 font-mono text-xs">{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{row.name}</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{row.position}</span>
                      {row.country && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{row.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-xs font-bold">
                    {row.promoLine || "—"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {row.isMaternity ? (
                    <span className="inline-flex px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">Yes</span>
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </td>
                {[row.q1, row.q2, row.q3, row.q4].map((active, qi) => (
                  <td key={qi} className="px-6 py-4 text-center">
                    {active
                      ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                      : <span className="text-slate-300 font-medium">—</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
            {paginatedList.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No staff entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {staffList.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, staffList.length)} of {staffList.length}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
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
