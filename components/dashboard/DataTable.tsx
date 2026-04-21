"use client";

import { useState, useEffect } from "react";
import DetailedView from "./views/DetailedView";
import SummaryView  from "./views/SummaryView";
import SignOffView  from "./views/SignOffView";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { LayoutList, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { exportSummaryViewToCSV, exportSignOffViewToCSV } from "@/lib/exportUtils";

/* ── Tokens ─────────────────────────────────────────────────── */
const NAVY   = "#0B1F3A";
const NAVY2  = "#122D5A";
const BORDER = "#D0DCE8";
const BG_SUB = "#F0F4F8";

interface DataTableProps { data: IncentiveRecord[]; view: string; filters: Filters; }

export default function DataTable({ data, view, filters }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const totalPages   = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage     = Math.min(currentPage, totalPages);
  const paginatedData = data.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [data.length]);

  const handleExport = () => {
    if (view === "summary") exportSummaryViewToCSV(data);
    else if (view === "signoff") {
      const region = filters.country === "all" ? "All Regions" : filters.country;
      const period = filters.quarter === "all" ? (data.length > 0 ? (data[0].Quarter || "All Quarters") : "All Quarters") : filters.quarter;
      exportSignOffViewToCSV(data, region, period);
    }
  };

  return (
    <div className="mt-2">
      <div
        className="rounded-2xl relative overflow-visible"
        style={{ backgroundColor: "#FFFFFF", border: `1.5px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(11,31,58,0.07)" }}
      >
        {/* Toolbar — deep navy gradient */}
        <div
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${NAVY} 0%, ${NAVY2} 100%)` }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <LayoutList className="w-4 h-4" style={{ color: "rgba(160,191,206,0.85)" }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "#FFFFFF" }}>
              {new Set(data.map(d => d.Name).filter(Boolean)).size}{" "}
              <span className="font-medium" style={{ color: "rgba(160,191,206,0.70)" }}>representatives found</span>
            </span>
          </div>
          <div className="flex gap-2">
            {(view === "summary" || view === "signoff") && data.length > 0 && (
              <button
                onClick={handleExport}
                className="px-3 py-1.5 flex items-center gap-1.5 text-[13px] font-bold rounded-lg transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.10)", color: "rgba(160,191,206,0.90)", border: "1px solid rgba(255,255,255,0.16)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.18)"; (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.10)"; (e.currentTarget as HTMLElement).style.color = "rgba(160,191,206,0.90)"; }}
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto overflow-y-auto w-full" style={{ maxHeight: view === "detailed" ? "520px" : undefined }}>
          {view === "detailed" && <DetailedView data={paginatedData} />}
          {view === "summary"  && <SummaryView  data={paginatedData} fullData={data} startIndex={(safePage - 1) * PAGE_SIZE} />}
          {view === "signoff"  && <SignOffView   data={paginatedData} filters={filters} fullData={data} startIndex={(safePage - 1) * PAGE_SIZE} />}

          {data.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: BG_SUB, border: `1.5px solid ${BORDER}` }}>
                <LayoutList className="w-6 h-6" style={{ color: "#9BAFBE" }} />
              </div>
              <p className="font-bold mb-1" style={{ color: "#0F1827" }}>No results found</p>
              <p className="text-sm font-medium" style={{ color: "#6B8499" }}>Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {data.length > 0 && (
          <div
            className="px-6 py-4 flex items-center justify-between rounded-b-2xl flex-wrap gap-3"
            style={{ backgroundColor: BG_SUB, borderTop: `1px solid ${BORDER}` }}
          >
            <span className="text-xs font-semibold" style={{ color: "#6B8499" }}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, data.length)} of {data.length} results
            </span>

            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}` }}>
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "#6B8499" }}
                onMouseEnter={e => { if (safePage !== 1) (e.currentTarget as HTMLElement).style.color = NAVY; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6B8499"}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Smart pages: always show 1 & 2, current ±1, last 2 */}
              {(() => {
                const pages: (number | "...")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (totalPages > 1) pages.push(2);
                  if (safePage > 4) pages.push("...");
                  const start = Math.max(3, safePage - 1);
                  const end   = Math.min(totalPages - 2, safePage + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (safePage < totalPages - 3) pages.push("...");
                  if (totalPages - 1 > 2) pages.push(totalPages - 1);
                  if (totalPages > 2) pages.push(totalPages);
                }
                const unique: (number | "...")[] = [];
                pages.forEach(p => { if (unique.length === 0 || unique[unique.length - 1] !== p) unique.push(p); });

                return unique.map((p, idx) =>
                  p === "..." ? (
                    <span key={`el-${idx}`} className="px-2 text-xs select-none" style={{ color: "#9BAFBE" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                      style={
                        safePage === p
                          ? { backgroundColor: NAVY, color: "#FFFFFF", boxShadow: "0 2px 8px rgba(11,31,58,0.28)" }
                          : { color: "#6B8499", backgroundColor: "transparent" }
                      }
                      onMouseEnter={e => { if (safePage !== p) { (e.currentTarget as HTMLElement).style.backgroundColor = "#EAF2FA"; (e.currentTarget as HTMLElement).style.color = NAVY; } }}
                      onMouseLeave={e => { if (safePage !== p) { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6B8499"; } }}
                    >{p}</button>
                  )
                );
              })()}

              {/* Next */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: "#6B8499" }}
                onMouseEnter={e => { if (safePage !== totalPages) (e.currentTarget as HTMLElement).style.color = NAVY; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#6B8499"}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
