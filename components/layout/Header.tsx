"use client";

import { ChangeEvent } from "react";
import { Search, User, LayoutDashboard, LogOut, Menu } from "lucide-react";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  user?: { email: string; name: string; role: string } | null;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export default function Header({ searchValue, onSearchChange, user, onLogout, onMenuClick }: HeaderProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/60 border-b border-slate-200/50">
      <div className="max-w-[1600px] mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4 w-auto flex-shrink-0 group cursor-pointer">
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mr-1"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
            Incentive calculator <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-black">- Emerging Market</span>
          </h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8 w-full">
          <div className="relative group w-full">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search representatives, teams or regions..." 
                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 hover:border-slate-300 transition-all outline-none placeholder:text-slate-400 text-slate-900 shadow-sm"
                value={searchValue}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4 w-auto justify-end flex-shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">{user ? user.name : "System User"}</p>
            <p className="text-xs text-blue-600 font-medium tracking-wide">{user ? user.role : "Guest"}</p>
          </div>
          <div className="group/profile relative">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-200 transition-all cursor-pointer">
              <User className="w-4 h-4" />
            </div>
            {onLogout && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all">
                <div className="p-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-rose-600 font-bold hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors">
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
