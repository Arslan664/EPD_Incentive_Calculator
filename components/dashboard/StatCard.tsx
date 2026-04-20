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
  
  let iconBg = "bg-slate-100";
  let iconColor = "text-slate-500";
  
  if (isEmerald) { iconBg = "bg-emerald-50"; iconColor = "text-emerald-600"; }
  if (isBlue) { iconBg = "bg-blue-50"; iconColor = "text-blue-600"; }
  if (isIndigo) { iconBg = "bg-indigo-50"; iconColor = "text-indigo-600"; }
  if (isAmber) { iconBg = "bg-amber-50"; iconColor = "text-amber-600"; }

  return (
    <div className="group w-full rounded-2xl bg-white border border-slate-200 p-5 flex flex-col items-start transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <div className="flex justify-between items-start mb-4 w-full">
        <div className={`p-2.5 rounded-xl ${iconBg} border border-slate-100`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span
            className={`flex items-center text-[12px] font-semibold px-2 py-1 rounded-md ${
              trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-2 w-full">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
