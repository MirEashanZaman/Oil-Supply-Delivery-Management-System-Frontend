"use client";

import React from "react";
import { UserData, DashboardTab } from "./types";
import { getRoleBadgeColor } from "./utils";

interface DashboardSidebarProps {
  userData: UserData | null;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  ordersCount: number;
  productsCount: number;
  usersCount?: number;
  supplierOrdersCount?: number;
  dealerOrdersCount?: number;
  onLogout: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  userData,
  activeTab,
  setActiveTab,
  ordersCount,
  productsCount,
  usersCount = 0,
  supplierOrdersCount = 0,
  dealerOrdersCount = 0,
  onLogout,
}) => {
  const isCustomer = userData?.role === "Customer";
  const isAdmin = userData?.role === "Admin";
  const isSupplier = userData?.role === "Supplier";
  const isDealer = userData?.role === "Dealer";

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 lg:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 mb-6">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {userData?.name || "Loading..."}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getRoleBadgeColor(
                  userData?.role || ""
                )}`}
              >
                {userData?.role || "User"}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {userData?.email}
              </span>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "overview"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "products"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span>{isCustomer ? "Order Petroleum" : "Products"}</span>
            </div>
            {productsCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "products"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {productsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "orders"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span>
                {isCustomer
                  ? "My Orders"
                  : isSupplier
                    ? "Refinery Orders"
                    : isDealer
                      ? "Supply Orders"
                      : "All Orders"}
              </span>
            </div>
            {ordersCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "orders"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                  }`}
              >
                {ordersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tracking")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "tracking"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Live GPS Tracking</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${activeTab === "tracking"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-700"
                }`}
            >
              Live
            </span>
          </button>

          {(isSupplier || isDealer || isAdmin) && (
            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "inventory"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
                }`}
            >
              <div className="flex items-center gap-3">
                <span>
                  {isSupplier
                    ? "Refinery Inventory"
                    : isDealer
                      ? "Fuel Inventory & Sourcing"
                      : "Global Inventory"}
                </span>
              </div>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin-monitoring")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "admin-monitoring"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
                }`}
            >
              <div className="flex items-center gap-3">
                <span>User Administration</span>
              </div>
              {usersCount > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "admin-monitoring"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {usersCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "chat"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span>Live Support Chat</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === "profile"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span>My Profile</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-200 mt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
