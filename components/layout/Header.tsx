"use client";

import { ChangeEvent } from "react";
import { Search, User, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ searchValue, onSearchChange }: HeaderProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-900/60 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4 w-64 flex-shrink-0 group cursor-pointer">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            EPD <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-black">Analytics</span>
          </h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search representatives, teams or regions..." 
                className="w-full bg-slate-800/80 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-white/20 hover:bg-slate-800 transition-all outline-none placeholder:text-slate-500 text-slate-200 shadow-inner"
                value={searchValue}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-4 w-64 justify-end flex-shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-white leading-tight">Medical Dept.</p>
            <p className="text-xs text-blue-400 font-medium tracking-wide">Administrator</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <User className="w-5 h-5 relative z-10" />
          </div>
        </div>

      </div>
    </header>
  );
}
