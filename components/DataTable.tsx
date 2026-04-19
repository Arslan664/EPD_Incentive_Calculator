/**
 * DataTable — Wraps the table container and switches between
 * DetailedView, SummaryView, and SignOffView based on the current view filter.
 * Also renders the EmptyState when no rows match.
 */

import type { IncentiveRecord } from "@/lib/types";
import DetailedView from "@/components/views/DetailedView";
import SummaryView from "@/components/views/SummaryView";
import SignOffView from "@/components/views/SignOffView";

interface DataTableProps {
  data: IncentiveRecord[];
  view: "detailed" | "summary" | "signoff";
}

function EmptyState() {
  return (
    <div className="empty-state fade-in">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
      <p>No matching representatives found.</p>
    </div>
  );
}

export default function DataTable({ data, view }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="table-container">
        <EmptyState />
      </div>
    );
  }

  // Sign-Off view uses its own table structure (with header above)
  if (view === "signoff") {
    return (
      <div className="table-container">
        <div className="table-scroll">
          <SignOffView data={data} />
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="data-table" id="report-table">
          {view === "detailed" ? (
            <DetailedView data={data} />
          ) : (
            <SummaryView data={data} />
          )}
        </table>
      </div>
    </div>
  );
}
