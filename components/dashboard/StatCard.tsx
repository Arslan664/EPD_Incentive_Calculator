import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  trendValue?: string;
  color: string;
}

const colorConfig: Record<string, { iconBg: string; iconColor: string; accentLine: string }> = {
  blue:    { iconBg: "rgba(0,87,168,0.09)",    iconColor: "#0057A8",  accentLine: "#0057A8" },
  navy:    { iconBg: "rgba(11,31,58,0.08)",    iconColor: "#0B1F3A",  accentLine: "#0B1F3A" },
  indigo:  { iconBg: "rgba(0,87,168,0.09)",    iconColor: "#0057A8",  accentLine: "#0057A8" },
  emerald: { iconBg: "rgba(14,122,79,0.09)",   iconColor: "#0E7A4F",  accentLine: "#0E7A4F" },
  amber:   { iconBg: "rgba(180,83,9,0.08)",    iconColor: "#B45309",  accentLine: "#B45309" },
  violet:  { iconBg: "rgba(109,40,217,0.09)",  iconColor: "#6D28D9",  accentLine: "#6D28D9" },
};

function getConfig(color: string) {
  for (const [key, val] of Object.entries(colorConfig)) {
    if (color.includes(key)) return val;
  }
  return { iconBg: "rgba(0,87,168,0.09)", iconColor: "#0057A8", accentLine: "#0057A8" };
}

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }: StatCardProps) {
  const cfg = getConfig(color);

  return (
    <div
      className="group w-full rounded-2xl bg-white flex flex-col transition-all duration-300 overflow-hidden"
      style={{
        border: "1.5px solid #D0DCE8",
        boxShadow: "0 1px 4px rgba(11,31,58,0.05)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(11,31,58,0.10)";
        (e.currentTarget as HTMLElement).style.borderColor = "#A8BFCE";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(11,31,58,0.05)";
        (e.currentTarget as HTMLElement).style.borderColor = "#D0DCE8";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top accent line */}
      <div className="h-[3px] w-full" style={{ backgroundColor: cfg.accentLine }} />

      <div className="p-5 flex flex-col items-start flex-1">
        <div className="flex justify-between items-start w-full mb-4">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: cfg.iconBg }}>
            <Icon className="w-5 h-5" style={{ color: cfg.iconColor }} />
          </div>
          {trend && (
            <span
              className="flex items-center text-[11px] font-bold px-2 py-1 rounded-lg"
              style={
                trend === "up"
                  ? { color: "#0E7A4F", backgroundColor: "rgba(14,122,79,0.09)" }
                  : { color: "#B91C1C", backgroundColor: "rgba(185,28,28,0.07)" }
              }
            >
              {trend === "up"
                ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              }
              {trendValue}
            </span>
          )}
        </div>
        <div className="mt-1 w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.10em] mb-1.5" style={{ color: "#6B8499" }}>
            {title}
          </p>
          <p className="text-2xl font-black tracking-tight tabular-nums" style={{ color: "#0F1827" }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
