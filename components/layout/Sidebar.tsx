import { X, LayoutDashboard, Users, Package, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ isOpen, onClose, activePage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: "landing", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "staff", label: "Staff Input", icon: Users },
    { id: "promo", label: "Product Promo", icon: Package },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-slate-200",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 w-auto flex-shrink-0 group cursor-pointer">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-md shadow-blue-500/20">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Abbott <span className="text-blue-600">EPD</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-100/50 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
