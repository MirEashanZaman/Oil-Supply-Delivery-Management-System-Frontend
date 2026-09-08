"use client";

import React from "react";
import { UserData, DashboardTab } from "./types";
import { getRoleBadgeColor } from "./utils";

interface DashboardHeaderProps {
  userData: UserData | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userData,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
}) => {
  const isCustomer = userData?.role === "Customer";

  const getTabTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Executive Command Center";
      case "products":
        return isCustomer ? "Petroleum Products Marketplace" : "Product Inventory Management";
      case "orders":
        return "Logistics Orders & Consignments";
      case "tracking":
        return "Live GPS Fleet & Tanker Tracking";
      case "inventory":
        return "Refinery Stock & Bulk Sourcing";
      case "admin-monitoring":
        return "System Administration & Users";
      case "chat":
        return "Logistics Support & Realtime Dispatch";
      case "profile":
        return "Account Settings & Profile";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          {getTabTitle()}
        </h1>
        <p className="text-xs text-slate-400">
          Welcome back, <span className="text-amber-400 font-semibold">{userData?.name || "User"}</span> ({userData?.role})
        </p>
      </div>

      <div className="flex items-center gap-3">
        {}
        {isCustomer && (
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white rounded-xl transition shadow-lg shadow-amber-500/10 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform"></span>
            <span className="text-xs font-bold hidden sm:inline">Delivery Cart</span>
            {cartCount > 0 ? (
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                {cartCount}
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                0
              </span>
            )}
          </button>
        )}

        {}
        <button
          onClick={() => setActiveTab("tracking")}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs text-slate-300 hover:text-white transition"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden md:inline font-medium">GPS Dispatch</span>
        </button>

        {}
        <button
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
            {userData?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="hidden sm:inline">{userData?.name?.split(" ")[0] || "Profile"}</span>
        </button>
      </div>
    </header>
  );
};
