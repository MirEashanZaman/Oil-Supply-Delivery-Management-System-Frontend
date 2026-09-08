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
    <div className="space-y-6 text-left">
      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-card-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:border-[#F59E0B] transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-gray">
              {isCustomer ? "Total Purchases" : "Gross Volume"}
            </span>
            <span className="text-xl"></span>
          </div>
          <div className="text-2xl font-black text-[#0F2747]">
            ${totalSpentOrRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-secondary-gray mt-1">Across all historical orders</div>
        </div>

        <div className="card bg-card-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:border-[#0F2747] transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-gray">
              Total Orders
            </span>
            <span className="text-xl"></span>
          </div>
          <div className="text-2xl font-black text-[#0F2747]">{orders.length}</div>
          <div className="text-xs text-secondary-gray mt-1">Consignments recorded</div>
        </div>

        <div className="card bg-card-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:border-emerald-500 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-gray">
              Active In-Transit
            </span>
            <span className="text-xl"></span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {activeDeliveries.length}
          </div>
          <div className="text-xs text-secondary-gray mt-1">
            {pendingOrdersCount} pending confirmation
          </div>
        </div>

        <div className="card bg-card-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm hover:border-[#F59E0B] transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary-gray">
              Catalog Stock
            </span>
            <span className="text-xl"></span>
          </div>
          <div className="text-2xl font-black text-[#F59E0B]">
            {products.length} Products
          </div>
          <div className="text-xs text-secondary-gray mt-1">Active petroleum fuels</div>
        </div>
      </div>

      {}
      <div className="p-6 rounded-2xl bg-[#0F2747] text-white border border-blue-900 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
          <p className="text-xs text-slate-300">
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
                type="button"
                onClick={() => setActiveTab("products")}
                className="btn btn-accent btn-sm text-xs font-bold rounded-xl"
              >
                Browse Petroleum Catalog →
              </button>
              {onOpenCart && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-sm text-xs font-bold rounded-xl"
                >
                  Open Delivery Cart 
                </button>
              )}
            </>
          )}

          {(isSupplier || isAdmin) && onPostProductModal && (
            <button
              type="button"
              onClick={onPostProductModal}
              className="btn btn-accent btn-sm text-xs font-bold rounded-xl"
            >
              + Post New Petroleum Lot
            </button>
          )}

          {isDealer && (
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className="btn btn-accent btn-sm text-xs font-bold rounded-xl"
            >
              Source Refinery Lots →
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("tracking")}
            className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-sm text-xs font-bold rounded-xl"
          >
            Live GPS Tracking ️
          </button>
        </div>
      </div>

      {}
      <div className="card bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2747]">Recent Orders Snapshot</h3>
            <p className="text-xs text-secondary-gray">Real-time status updates of current consignments</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="text-xs font-bold text-[#F59E0B] hover:underline"
          >
            View All ({orders.length}) →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-3xl mb-2 block"></span>
            <p className="text-sm font-semibold text-dark-slate">No active orders found</p>
            <p className="text-xs text-secondary-gray mt-1">
              {isCustomer ? "Order petroleum products from our catalog to get started." : "No consignments registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-secondary-gray border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Total ($)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-dark-slate">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-[#0F2747] font-bold">#{order.id}</td>
                    <td className="p-3 font-medium text-dark-slate">{order.product?.name || "Fuel Product"}</td>
                    <td className="p-3 font-semibold">{order.quantity} L</td>
                    <td className="p-3 font-bold text-emerald-600">${order.totalAmount}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {order.status !== "Delivered" && order.status !== "Cancelled" && order.status !== "Rejected" && onOpenLiveTrack ? (
                        <button
                          type="button"
                          onClick={() => onOpenLiveTrack(order)}
                          className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition"
                        >
                          ️ Track Live
                        </button>
                      ) : (
                        <span className="text-[11px] text-secondary-gray font-medium">Completed</span>
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
