import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  color: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color,
}: StatCardProps) {
  const isEmerald = color.includes('emerald');
  const isBlue = color.includes('blue');
  const isIndigo = color.includes('indigo');
  const isAmber = color.includes('amber');
  
  let gradientRing = "from-slate-500/20 to-slate-400/10";
  let iconColor = "text-slate-400";
  
  if (isEmerald) { gradientRing = "from-emerald-500/20 to-teal-400/5"; iconColor = "text-emerald-400"; }
  if (isBlue) { gradientRing = "from-blue-500/20 to-cyan-400/5"; iconColor = "text-blue-400"; }
  if (isIndigo) { gradientRing = "from-indigo-500/20 to-purple-400/5"; iconColor = "text-indigo-400"; }
  if (isAmber) { gradientRing = "from-amber-500/20 to-yellow-400/5"; iconColor = "text-amber-400"; }

  return (
    <div className="group relative w-full rounded-2xl">
      <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradientRing.replace('/20', '/60').replace('/5', '/20')} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700`} />
      <div className="relative bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col items-start w-full transition-all duration-500 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] group-hover:scale-[1.02] group-hover:bg-slate-800/90 overflow-hidden">
        
        {/* Decorative background glow */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${gradientRing} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />

        <div className="flex justify-between items-start mb-4 w-full relative z-10">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientRing} border border-white/5`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          {trend && (
            <span
              className={`flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 backdrop-blur-sm border ${
                trend === "up" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-rose-300 bg-rose-500/10 border-rose-500/20"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {trendValue}
            </span>
          )}
        </div>
        <div className="mt-1 relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-black text-white mt-1.5 tracking-tight tabular-nums drop-shadow-md">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
