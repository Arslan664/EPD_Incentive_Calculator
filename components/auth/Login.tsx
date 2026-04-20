"use client";

import { useState } from "react";
import { Mail, LayoutDashboard, ArrowRight } from "lucide-react";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    
    if (mail === "arslansohail@abbott.com") {
      onLogin({ email: mail, name: "Arslan Sohail", role: "DVP" });
    } else if (mail === "abdulmanan@abbott.com") {
      onLogin({ email: mail, name: "Abdul Manan", role: "FLM" });
    } else if (mail === "fahad.ayub@abbott.com") {
      onLogin({ email: mail, name: "Fahad Ayub", role: "FLM" });
    } else {
      setError("Unauthorized access. Please contact the administrator.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative selection:bg-blue-500/30">
      
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-500/30">
             <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">
            Incentive Calculator
          </h1>
          <p className="text-sm font-medium tracking-wide text-slate-500">
            Abbott Emerging Market Division
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Enter your corporate email"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-3.5 pl-12 pr-4 text-[15px] font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400"
              />
            </div>
            {error && (
              <p className="text-rose-500 text-xs font-bold mt-2.5 pl-1 animate-in fade-in">{error}</p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 group outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Access Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 font-medium">
            Authorized Personnel Only
          </p>
        </div>

      </div>
    </div>
  );
}
