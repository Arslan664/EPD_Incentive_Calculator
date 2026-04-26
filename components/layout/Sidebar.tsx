import { X, LayoutDashboard, Users, Package, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

const SIDEBAR_BG    = "#0B1F3A";           /* Midnight Navy */
const ACTIVE_BG     = "#0057A8";           /* Corporate Blue */
const ACTIVE_SHADOW = "rgba(0,87,168,0.45)";
const DIVIDER       = "rgba(160,191,206,0.14)";
const MUTED         = "rgba(160,191,206,0.60)";
const INACTIVE_TEXT = "rgba(160,191,206,0.80)";

export default function Sidebar({ isOpen, onClose, activePage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: "landing",   label: "Home",          icon: Home,            description: "Overview & KPIs" },
    { id: "dashboard", label: "Dashboard",     icon: LayoutDashboard, description: "Performance Reports" },
    { id: "staff",     label: "Staff",         icon: Users,           description: "HR Directory" },
    { id: "promo",     label: "Product Promo", icon: Package,         description: "Product Analytics" },
    { id: "admin",     label: "Admin Panel",   icon: Settings,        description: "Governance & Config" },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{ backgroundColor: "rgba(11,31,58,0.55)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[264px] z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: SIDEBAR_BG,
          boxShadow: "6px 0 40px rgba(11,31,58,0.50)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${DIVIDER}` }}
        >
          <div className="flex items-center gap-3">
            {/* Abbott wordmark SVG */}
            <div className="flex-shrink-0 select-none">
              <svg width="70" height="22" viewBox="0 0 210 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Abbott">
                <text x="0" y="46" fontFamily="'Arial Black','Arial','Helvetica Neue',sans-serif" fontSize="52" fontWeight="900" fill="#FFFFFF" letterSpacing="-2">Abbott</text>
              </svg>
            </div>
            <div style={{ borderLeft: `1.5px solid ${DIVIDER}`, paddingLeft: "10px" }}>
              <h2 className="text-[11px] font-semibold tracking-wide" style={{ color: MUTED }}>
                EPD Calculator
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: MUTED }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(160,191,206,0.35)" }}>
            Navigation
          </p>
        </div>

        {/* Menu Items */}
        <div className="px-3 flex flex-col gap-0.5 flex-1 overflow-y-auto pb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onPageChange(item.id); onClose(); }}
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all duration-200"
                style={
                  isActive
                    ? {
                        backgroundColor: ACTIVE_BG,
                        boxShadow: `0 3px 16px ${ACTIVE_SHADOW}`,
                        color: "#FFFFFF",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: INACTIVE_TEXT,
                      }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = INACTIVE_TEXT;
                  }
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={
                    isActive
                      ? { backgroundColor: "rgba(255,255,255,0.18)" }
                      : { backgroundColor: "rgba(160,191,206,0.10)" }
                  }
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-tight">{item.label}</p>
                  <p className="text-[10px] font-medium leading-tight mt-0.5 opacity-60">
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.60)" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${DIVIDER}` }}>
          <p className="text-[10px] font-medium" style={{ color: "rgba(160,191,206,0.30)" }}>
            © {new Date().getFullYear()} Abbott Laboratories · EPD Division
          </p>
        </div>
      </div>
    </>
  );
}
