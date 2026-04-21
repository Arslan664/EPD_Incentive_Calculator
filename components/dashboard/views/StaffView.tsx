import { useMemo, useState } from "react";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { CheckCircle, MapPin, XCircle } from "lucide-react";
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

    if (selectedCountry !== "all") {
      safeData = safeData.filter(d => d.Country === selectedCountry);
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
          q1: false, q2: false, q3: false, q4: false,
        });
      }
      const rep = map.get(d.Name);
      if (d.Status === "Maternity leave" || d.Status?.toLowerCase().includes("maternity")) {
        rep.isMaternity = true;
      }
      const q = d.Quarter || "";
      if (q.includes("Q1")) rep.q1 = true;
      if (q.includes("Q2")) rep.q2 = true;
      if (q.includes("Q3")) rep.q3 = true;
      if (q.includes("Q4")) rep.q4 = true;
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, filters, selectedCountry, user]);

  const totalPages = Math.max(1, Math.ceil(staffList.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = staffList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
    <div
      className="p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-500"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #DDE2F0",
        boxShadow: "0 2px 12px rgba(0,0,116,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 gap-4"
        style={{ borderBottom: "1.5px solid #DDE2F0" }}
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#0F1827" }}>
            Staff
          </h2>
          <p className="font-medium mt-1" style={{ color: "#5B6A9A" }}>
            Staff status, maternity leave, and quarterly availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Country Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5B6A9A" }}>
              Country
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={e => handleCountryChange(e.target.value)}
                className="h-9 appearance-none rounded-xl pl-3 pr-8 text-[13px] font-semibold transition-all outline-none cursor-pointer"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #DDE2F0",
                  color: selectedCountry === "all" ? "#8FA0C8" : "#0B0B3B",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#2C49E4";
                  e.target.style.boxShadow = "0 0 0 3px rgba(44,73,228,0.12)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#DDE2F0";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="all">All Countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Count badge */}
          <div
            className="px-4 py-2 rounded-xl font-bold text-sm self-end"
            style={{
              backgroundColor: "rgba(11,31,58,0.08)",
              color: "#0B1F3A",
              border: "1px solid rgba(11,31,58,0.14)",
            }}
          >
            {staffList.length} Staff
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto w-full rounded-xl"
        style={{ border: "1.5px solid #D0DCE8" }}
      >
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead style={{ background: "linear-gradient(90deg, #0B1F3A 0%, #122D5A 100%)" }}>
            <tr>
              {["#", "Name & Position", "Promo Line", "Maternity", "Q1", "Q2", "Q3", "Q4"].map((h, i) => (
                <th
                  key={h}
                  className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    color: "rgba(160,191,206,0.80)",
                    textAlign: i === 0 || i >= 3 ? "center" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((row, i) => {
              const isEven = i % 2 === 0;
              return (
                <tr
                  key={row.name}
                  style={{
                    backgroundColor: isEven ? "#FFFFFF" : "#F7FAFC",
                    borderBottom: "1px solid #D0DCE8",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,87,168,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = isEven ? "#FFFFFF" : "#F7FAFC")}
                >
                  <td className="px-5 py-4 text-center font-mono text-xs" style={{ color: "#8FA0C8" }}>
                    {(safePage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm" style={{ color: "#0B0B3B" }}>{row.name}</span>
                      <div className="flex items-center gap-1.5 text-[11px] mt-0.5" style={{ color: "#8FA0C8" }}>
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{row.position}</span>
                        {row.country && (
                          <>
                            <span style={{ color: "#DDE2F0" }}>•</span>
                            <span>{row.country}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(0,87,168,0.08)",
                        color: "#0057A8",
                        border: "1px solid rgba(0,87,168,0.16)",
                      }}
                    >
                      {row.promoLine || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {row.isMaternity ? (
                      <span
                        className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ backgroundColor: "rgba(109,40,217,0.10)", color: "#6D28D9", border: "1px solid rgba(109,40,217,0.20)" }}
                      >
                        Yes
                      </span>
                    ) : (
                      <span style={{ color: "#DDE2F0", fontWeight: 500 }}>—</span>
                    )}
                  </td>
                  {[row.q1, row.q2, row.q3, row.q4].map((active, qi) => (
                    <td key={qi} className="px-5 py-4 text-center">
                      {active
                        ? <CheckCircle className="w-5 h-5 mx-auto" style={{ color: "#0E7A4F" }} />
                        : <span style={{ color: "#DDE2F0", fontWeight: 500 }}>—</span>
                      }
                    </td>
                  ))}
                </tr>
              );
            })}
            {paginatedList.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center font-medium"
                  style={{ color: "#5B6A9A" }}
                >
                  No staff entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {staffList.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: "#5B6A9A" }}>
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, staffList.length)} of {staffList.length}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className="px-3 py-1 text-xs font-bold rounded-lg transition-colors"
                style={
                  safePage === pg
                    ? { backgroundColor: "#000074", color: "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,116,0.25)" }
                    : { backgroundColor: "#FFFFFF", color: "#5B6A9A", border: "1.5px solid #DDE2F0" }
                }
                onMouseEnter={e => {
                  if (safePage !== pg) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#D1D9F3";
                    (e.currentTarget as HTMLElement).style.color = "#000074";
                  }
                }}
                onMouseLeave={e => {
                  if (safePage !== pg) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF";
                    (e.currentTarget as HTMLElement).style.color = "#5B6A9A";
                  }
                }}
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
