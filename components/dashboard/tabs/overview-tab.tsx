"use client";

import React from "react";
import { UserData, Order, Product, DashboardTab } from "../types";
import { getStatusBadgeClass } from "../utils";

interface OverviewTabProps {
  userData: UserData | null;
  orders: Order[];
  products: Product[];
  setActiveTab: (tab: DashboardTab) => void;
  onOpenCart?: () => void;
  onPostProductModal?: () => void;
  onSelectProductForWholesale?: (product: Product) => void;
  onSelectProductForOrder?: (product: Product) => void;
  onOpenLiveTrack?: (order: Order) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  userData,
  orders,
  products,
  setActiveTab,
  onOpenCart,
  onPostProductModal,
  onSelectProductForWholesale,
  onSelectProductForOrder,
  onOpenLiveTrack,
}) => {
  const isCustomer = userData?.role === "Customer";
  const isAdmin = userData?.role === "Admin";
  const isSupplier = userData?.role === "Supplier";
  const isDealer = userData?.role === "Dealer";

  const totalSpentOrRevenue = orders.reduce((sum, order) => {
    const amt = parseFloat(String(order.totalAmount || 0));
    return isNaN(amt) ? sum : sum + amt;
  }, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing"
  ).length;

  const deliveredOrdersCount = orders.filter(
    (o) => o.status === "Delivered"
  ).length;

  const activeDeliveries = orders.filter(
    (o) => o.status === "Out for Delivery" || o.status === "Confirmed"
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isCustomer ? "Total Purchases" : "Gross Revenue / Volume"}
            </span>
            <span className="text-xl">💰</span>
          </div>
          <div className="text-2xl font-black text-white">
            ${totalSpentOrRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all historical orders</div>
        </div>

        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <span className="text-xl">📦</span>
          </div>
          <div className="text-2xl font-black text-white">{orders.length}</div>
          <div className="text-xs text-slate-500 mt-1">Consignments recorded</div>
        </div>

        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active In-Transit
            </span>
            <span className="text-xl">🚚</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {activeDeliveries.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {pendingOrdersCount} pending confirmation
          </div>
        </div>

        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-yellow-500/50 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Catalog Stock
            </span>
            <span className="text-xl">⛽</span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {products.length} Products
          </div>
          <div className="text-xs text-slate-500 mt-1">Active petroleum fuels</div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-850 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            {isCustomer
              ? "Need petroleum fuel delivery?"
              : isSupplier
              ? "Supply refinery fuel lots to network"
              : isDealer
              ? "Wholesale Refinery Sourcing"
              : "System Fleet Telematics"}
          </h3>
          <p className="text-xs text-slate-400">
            {isCustomer
              ? "Browse certified fuels, add items to cart for multi-product simultaneous delivery."
              : isSupplier
              ? "Post bulk refinery product lots or manage active depot wholesale requests."
              : isDealer
              ? "Procure wholesale tankers directly from refinery suppliers."
              : "Monitor real-time tanker GPS tracking and manage user registrations."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {isCustomer && (
            <>
              <button
                onClick={() => setActiveTab("products")}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Browse Petroleum Catalog →
              </button>
              {onOpenCart && (
                <button
                  onClick={onOpenCart}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                >
                  Open Delivery Cart 🛒
                </button>
              )}
            </>
          )}

          {(isSupplier || isAdmin) && onPostProductModal && (
            <button
              onClick={onPostProductModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              + Post New Petroleum Lot
            </button>
          )}

          {isDealer && (
            <button
              onClick={() => setActiveTab("inventory")}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-bold rounded-xl transition"
            >
              Source Refinery Lots →
            </button>
          )}

          <button
            onClick={() => setActiveTab("tracking")}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Live GPS Tracking 🛰️
          </button>
        </div>
      </div>

      {/* Active Orders & Recent Activity */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Orders Snapshot</h3>
            <p className="text-xs text-slate-400">Real-time status updates of current consignments</p>
          </div>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            View All ({orders.length}) →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-800/80">
            <span className="text-3xl mb-2 block">📦</span>
            <p className="text-sm font-semibold text-slate-300">No active orders found</p>
            <p className="text-xs text-slate-500 mt-1">
              {isCustomer ? "Order petroleum products from our catalog to get started." : "No consignments registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Total ($)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono text-amber-400 font-bold">#{order.id}</td>
                    <td className="p-3 font-medium text-white">{order.product?.name || "Fuel Product"}</td>
                    <td className="p-3">{order.quantity} L</td>
                    <td className="p-3 font-semibold text-emerald-400">${order.totalAmount}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {order.status !== "Delivered" && order.status !== "Cancelled" && order.status !== "Rejected" && onOpenLiveTrack ? (
                        <button
                          onClick={() => onOpenLiveTrack(order)}
                          className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 rounded-lg font-bold text-[11px] transition"
                        >
                          🛰️ Track Live
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
