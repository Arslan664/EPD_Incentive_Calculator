"use client";

import DetailedView from "./views/DetailedView";
import SummaryView from "./views/SummaryView";
import SignOffView from "./views/SignOffView";
import type { IncentiveRecord, Filters } from "@/lib/types";
import { Filter, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: IncentiveRecord[];
  view: string;
  filters: Filters;
}

export default function DataTable({ data, view, filters }: DataTableProps) {
  return (
    <div className="mt-2 text-slate-800">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Filter className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-700 tracking-wide">
              {data.length} <span className="text-slate-500 font-medium tracking-normal">representatives found</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all outline-none">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto overflow-y-auto scroller custom-scrollbar" style={{ maxHeight: "calc(100vh - 350px)" }}>
          {view === "detailed" && <DetailedView data={data} />}
          {view === "summary" && <SummaryView data={data} />}
          {view === "signoff" && <SignOffView data={data} filters={filters} />}
          
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
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Showing 1-{Math.min(10, data.length)} of {data.length} results</span>
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
              <button className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">1</button>
              {data.length > 10 && <button className="px-3 py-1 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-lg transition-colors">2</button>}
              <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
