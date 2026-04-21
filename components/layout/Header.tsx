"use client";

import { ChangeEvent } from "react";
import { Search, User, LogOut, Menu, ChevronDown } from "lucide-react";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  user?: { email: string; name: string; role: string } | null;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

/* Midnight Navy gradient — premium, not electric */
const HEADER_BG   = "linear-gradient(90deg, #0B1F3A 0%, #122D5A 100%)";
const DIVIDER_CLR = "rgba(160,191,206,0.18)";
const MUTED_TEXT  = "rgba(160,191,206,0.75)";

export default function Header({ searchValue, onSearchChange, user, onLogout, onMenuClick }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{ background: HEADER_BG, boxShadow: "0 2px 20px rgba(11,31,58,0.35)" }}
    >
      <div className="max-w-[1600px] mx-auto px-6 h-[64px] flex items-center justify-between gap-6">

        {/* ── Left: hamburger + Abbott wordmark ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 -ml-1 rounded-lg transition-colors"
              style={{ color: "rgba(160,191,206,0.80)" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Abbott wordmark SVG */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 select-none">
              <svg width="82" height="26" viewBox="0 0 210 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Abbott">
                <text x="0" y="46" fontFamily="'Arial Black','Arial','Helvetica Neue',sans-serif" fontSize="52" fontWeight="900" fill="#FFFFFF" letterSpacing="-2">Abbott</text>
              </svg>
            </div>
            <div style={{ borderLeft: `1.5px solid ${DIVIDER_CLR}`, paddingLeft: "12px" }}>
              <p className="text-[11px] font-semibold tracking-wide whitespace-nowrap" style={{ color: MUTED_TEXT }}>
                EPD Incentive Calculator
              </p>
            </div>
          </div>

          {/* Region chip */}
          <div className="hidden xl:block" style={{ borderLeft: `1px solid ${DIVIDER_CLR}`, paddingLeft: "12px" }}>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: "rgba(0,87,168,0.25)", color: "#A0BFCE", border: "1px solid rgba(0,87,168,0.30)" }}
            >
              Emerging Market
            </span>
          </div>
        </div>

        {/* ── Center: search ── */}
        <div className="flex-1 max-w-[400px] hidden md:block">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "rgba(160,191,206,0.50)" }}
            />
            <input
              type="text"
              placeholder="Search representatives, teams…"
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(160,191,206,0.18)",
                color: "#FFFFFF",
                caretColor: "#0057A8",
              }}
              onFocus={e => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.12)";
                e.target.style.borderColor = "#0057A8";
                e.target.style.boxShadow = "0 0 0 3px rgba(0,87,168,0.20)";
              }}
              onBlur={e => {
                e.target.style.backgroundColor = "rgba(255,255,255,0.07)";
                e.target.style.borderColor = "rgba(160,191,206,0.18)";
                e.target.style.boxShadow = "none";
              }}
              value={searchValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* ── Right: user profile ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-px h-7" style={{ backgroundColor: DIVIDER_CLR }} />

          <div className="group/profile relative">
            <button
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
              style={{ color: "#FFFFFF" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0057A8 0%, #004A91 100%)", color: "#fff" }}
              >
                {user ? user.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[13px] font-bold leading-tight" style={{ color: "#FFFFFF" }}>
                  {user ? user.name : "System User"}
                </p>
                <p className="text-[10px] font-semibold leading-tight" style={{ color: MUTED_TEXT }}>
                  {user ? user.role : "Guest"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-50 hidden sm:block" />
            </button>

            {/* Dropdown */}
            {onLogout && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #D0DCE8",
                  boxShadow: "0 8px 32px rgba(11,31,58,0.16)",
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: "1px solid #D0DCE8", backgroundColor: "#F0F4F8" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B8499" }}>Signed in as</p>
                  <p className="text-[12px] font-semibold truncate mt-0.5" style={{ color: "#0F1827" }}>{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2.5 text-[13px] font-bold rounded-lg flex items-center gap-2 transition-colors"
                    style={{ color: "#B91C1C" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FEE2E2")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
