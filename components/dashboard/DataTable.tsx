"use client";

import DetailedView from "./views/DetailedView";
import SummaryView from "./views/SummaryView";
import SignOffView from "./views/SignOffView";
import type { IncentiveRecord } from "@/lib/types";
import { Filter, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: IncentiveRecord[];
  view: string;
}

export default function DataTable({ data, view }: DataTableProps) {
  return (
    <div className="relative group/table mt-2">
      <div className="absolute -inset-1 bg-gradient-to-b from-slate-800/40 to-transparent rounded-3xl blur-md opacity-50"></div>
      <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
        
        {/* Table Toolbar */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Filter className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-bold text-slate-300 tracking-wide">
              {data.length} <span className="text-slate-500 font-medium tracking-normal">representatives found</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all outline-none focus:ring-1 focus:ring-white/20">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto scroller">
          {view === "detailed" && <DetailedView data={data} />}
          {view === "summary" && <SummaryView data={data} />}
          {view === "signoff" && <SignOffView data={data} />}
          
          {data.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-white/5">
                <Filter className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-300 font-bold mb-1">No results found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </div>

        {/* Table Footer pagination */}
        {data.length > 0 && (
          <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Showing 1-{Math.min(10, data.length)} of {data.length} results</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-800/50 rounded-xl border border-white/5">
              <button className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
              <button className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20">1</button>
              {data.length > 10 && <button className="px-3 py-1 text-slate-400 hover:text-white text-xs font-semibold rounded-lg transition-colors">2</button>}
              <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
