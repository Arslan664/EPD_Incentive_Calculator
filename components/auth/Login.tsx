"use client";

import { ChangeEvent } from "react";
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 380));
    setIsLoading(false);

    if (mail === "arslansohail@abbott.com") {
      onLogin({ email: mail, name: "Arslan Sohail", role: "Regional Manager" });
    } else if (mail === "abdulmanan@abbott.com") {
      onLogin({ email: mail, name: "Abdul Manan", role: "FLM" });
    } else if (mail === "fahad.ayub@abbott.com") {
      onLogin({ email: mail, name: "Fahad Ayub", role: "FLM" });
    } else {
      setError("Unauthorized access. Please contact the administrator.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0B1F3A 0%, #091829 45%, #122D5A 100%)" }}
    >
      {/* Subtle radial accent behind card */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 75% 60% at 50% 55%, rgba(0,87,168,0.14) 0%, transparent 70%)",
        }}
      />
      {/* Fine grid tissue paper texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(160,191,206,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(160,191,206,0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="w-full max-w-[420px] mx-5 relative z-10">

        {/* Abbott wordmark */}
        <div className="text-center mb-9">
          <div className="inline-block select-none mb-3">
            <svg width="130" height="42" viewBox="0 0 210 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Abbott">
              <text x="0" y="50" fontFamily="'Arial Black','Arial','Helvetica Neue',sans-serif" fontSize="54" fontWeight="900" fill="#FFFFFF" letterSpacing="-2">Abbott</text>
            </svg>
          </div>
          <div className="h-px w-12 mx-auto mt-0 mb-3" style={{ backgroundColor: "rgba(0,87,168,0.50)" }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "rgba(160,191,206,0.50)" }}>
            Abbott Laboratories
          </p>
          <h1 className="text-[18px] font-bold tracking-tight mt-1.5" style={{ color: "#FFFFFF" }}>
            EPD Incentive Calculator
          </h1>
          <p className="text-[12px] font-medium mt-1" style={{ color: "rgba(160,191,206,0.50)" }}>
            Established Pharmaceuticals Division · Emerging Market
          </p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "rgba(255,255,255,0.975)",
            boxShadow: "0 24px 64px rgba(11,31,58,0.35), 0 4px 16px rgba(11,31,58,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <h2 className="text-[18px] font-bold mb-1" style={{ color: "#0F1827" }}>Welcome back</h2>
          <p className="text-[13px] font-medium mb-7" style={{ color: "#6B8499" }}>
            Sign in with your corporate email to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: "#6B8499" }}>
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#9BAFBE" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setError(""); }}
                  placeholder="yourname@abbott.com"
                  className="w-full rounded-xl py-3.5 pl-11 pr-4 text-[14px] font-medium outline-none transition-all"
                  style={{
                    backgroundColor: "#F0F4F8",
                    border: "1.5px solid #D0DCE8",
                    color: "#0F1827",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#0057A8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,87,168,0.12)";
                    e.target.style.backgroundColor = "#FFFFFF";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = error ? "#B91C1C" : "#D0DCE8";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "#F0F4F8";
                  }}
                />
              </div>
              {error && (
                <p className="text-[12px] font-semibold mt-2 pl-1" style={{ color: "#B91C1C" }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 group outline-none"
              style={{
                background: isLoading
                  ? "linear-gradient(135deg, #9BAFBE 0%, #9BAFBE 100%)"
                  : "linear-gradient(135deg, #0057A8 0%, #004A91 100%)",
                color: "#FFFFFF",
                boxShadow: isLoading ? "none" : "0 4px 18px rgba(0,87,168,0.35)",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 26px rgba(0,87,168,0.50)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 18px rgba(0,87,168,0.35)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 text-center" style={{ borderTop: "1px solid #D0DCE8" }}>
            <p className="text-[11px] font-medium" style={{ color: "#9BAFBE" }}>
              🔒 Authorized Personnel Only · Abbott Confidential
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] font-medium mt-6" style={{ color: "rgba(160,191,206,0.30)" }}>
          © {new Date().getFullYear()} Abbott Laboratories · All rights reserved
        </p>
      </div>
    </div>
  );
}
