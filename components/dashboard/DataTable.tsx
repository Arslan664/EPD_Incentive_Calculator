"use client";

import { useState, useEffect } from "react";
import DetailedView from "./views/DetailedView";
import SummaryView from "./views/SummaryView";
import SignOffView from "./views/SignOffView";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { Filter, MoreVertical, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { exportSummaryViewToCSV, exportSignOffViewToCSV } from "@/lib/exportUtils";

interface DataTableProps {
  data: IncentiveRecord[];
  view: string;
  filters: Filters;
}

export default function DataTable({ data, view, filters }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = data.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to first page when data length changes
  // We use [data.length] instead of [data] to avoid unnecessary resets if the array identity changes but size doesn't 
  // (though in this app, data filter change is the only way length changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const handleExport = () => {
    if (view === "summary") {
      exportSummaryViewToCSV(data); // Export ALL filtered data, not just paginated chunk
    } else if (view === "signoff") {
      const region = filters.country === "all" ? "All Regions" : filters.country;
      const period = filters.quarter === "all" ? (data.length > 0 ? (data[0].Quarter || "All Quarters") : "All Quarters") : filters.quarter;
      exportSignOffViewToCSV(data, region, period);
    }
  };

  return (
    <div className="mt-2 text-slate-800">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-visible">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Filter className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-700 tracking-wide">
              {data.length} <span className="text-slate-500 font-medium tracking-normal">representatives found</span>
            </span>
          </div>
          <div className="flex gap-2">
            {(view === "summary" || view === "signoff") && data.length > 0 && (
              <button 
                onClick={handleExport}
                className="px-3 py-1.5 flex items-center gap-1.5 text-[13px] font-bold bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all outline-none">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          {view === "detailed" && <DetailedView data={paginatedData} />}
          {view === "summary" && <SummaryView data={paginatedData} fullData={data} startIndex={(safePage - 1) * PAGE_SIZE} />}
          {view === "signoff" && <SignOffView data={paginatedData} filters={filters} fullData={data} startIndex={(safePage - 1) * PAGE_SIZE} />}
          
          {data.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-200">
                <Filter className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-bold mb-1">No results found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>

        {/* Table Footer pagination */}
        {data.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
            <span className="text-xs font-medium text-slate-500">
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, data.length)} of {data.length} results
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
               >
                 <ChevronLeft className="w-4 h-4"/>
               </button>
              
              <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">
                {safePage}
              </button>
              
              {safePage < totalPages && (
                 <button 
                  onClick={() => setCurrentPage(safePage + 1)}
                  className="px-3 py-1 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg transition-colors"
                 >
                   {safePage + 1}
                 </button>
              )}
              
              {safePage + 1 < totalPages && (
                <span className="text-slate-400 text-xs px-1">...</span>
              )}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
               >
                 <ChevronRight className="w-4 h-4"/>
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
