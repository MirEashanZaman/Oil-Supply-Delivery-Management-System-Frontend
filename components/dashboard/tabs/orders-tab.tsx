"use client";

import React, { useState } from "react";
import { Order, UserData } from "../types";
import { getStatusBadgeClass } from "../utils";

interface OrdersTabProps {
  orders: Order[];
  userData: UserData | null;
  loadingOrders: boolean;
  onOpenLiveTrack: (order: Order) => void;
  onCancelOrder?: (id: number) => void;
  onUpdateOrderStatus?: (orderId: number, status: string) => void;
  onEditOrder?: (order: Order) => void;
  onDeleteOrder?: (id: number) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  userData,
  loadingOrders,
  onOpenLiveTrack,
  onCancelOrder,
  onUpdateOrderStatus,
  onEditOrder,
  onDeleteOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const isCustomer = userData?.role === "Customer";
  const isAdmin = userData?.role === "Admin";
  const isSupplier = userData?.role === "Supplier";
  const isDealer = userData?.role === "Dealer";

  const statuses = [
    "all",
    "Pending",
    "Confirmed",
    "Processing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      filterStatus === "all" ||
      (o.status || "").toLowerCase() === filterStatus.toLowerCase();
    const productName = o.product?.name || "";
    const customerName = o.user?.name || "";
    const orderId = String(o.id || "");
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderId.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search orders by ID, fuel product, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                filterStatus === st
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      {loadingOrders ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-400">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-slate-850 rounded-2xl border border-slate-800">
          <span className="text-4xl mb-3 block">📦</span>
          <h4 className="text-base font-bold text-white">No orders found</h4>
          <p className="text-xs text-slate-400 mt-1">
            There are no consignments matching your criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted =
              order.status === "Delivered" ||
              order.status === "Cancelled" ||
              order.status === "Rejected";

            return (
              <div
                key={order.id}
                className="bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Order Information Left */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs rounded-lg">
                      Order #{order.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Recent Consignment"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div>
                      <div className="text-[11px] text-slate-400">Product</div>
                      <div className="text-sm font-bold text-white">
                        {order.product?.name || "Petroleum Fuel"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Volume</div>
                      <div className="text-sm font-bold text-slate-200">
                        {order.quantity} Litres
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Total Bill</div>
                      <div className="text-sm font-black text-emerald-400">
                        ${order.totalAmount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400">Recipient / Address</div>
                      <div className="text-xs font-medium text-slate-300 truncate max-w-[200px]" title={order.deliveryAddress}>
                        {order.deliveryAddress || "Standard Station Address"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions Right */}
                <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
                  {/* Customer Actions */}
                  {isCustomer && (
                    <>
                      {order.status === "Delivered" ? (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs">
                          <span>✅</span> Delivery Complete
                        </div>
                      ) : order.status === "Cancelled" || order.status === "Rejected" ? (
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-bold text-xs">
                          <span>❌</span> {order.status}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onOpenLiveTrack(order)}
                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                          >
                            <span>🛰️</span> Track Live GPS
                          </button>
                          {order.status === "Pending" && onCancelOrder && (
                            <button
                              onClick={() => onCancelOrder(order.id)}
                              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl transition"
                            >
                              Cancel Order
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Supplier / Dealer Workflow Actions */}
                  {(isSupplier || isDealer) && (
                    <>
                      {order.status === "Pending" && onUpdateOrderStatus && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onUpdateOrderStatus(order.id, "Confirmed")
                            }
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition"
                          >
                            Accept & Confirm
                          </button>
                          <button
                            onClick={() =>
                              onUpdateOrderStatus(order.id, "Rejected")
                            }
                            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {order.status === "Confirmed" && onUpdateOrderStatus && (
                        <button
                          onClick={() =>
                            onUpdateOrderStatus(order.id, "Out for Delivery")
                          }
                          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl transition"
                        >
                          Dispatch Tanker 🚚
                        </button>
                      )}

                      {order.status === "Out for Delivery" && onUpdateOrderStatus && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenLiveTrack(order)}
                            className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition"
                          >
                            🛰️ Map Telematics
                          </button>
                          <button
                            onClick={() =>
                              onUpdateOrderStatus(order.id, "Delivered")
                            }
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition"
                          >
                            Mark Delivered
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Admin Management Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenLiveTrack(order)}
                        className="px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition"
                      >
                        🛰️ GPS Telematics
                      </button>
                      {onEditOrder && (
                        <button
                          onClick={() => onEditOrder(order)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      {onDeleteOrder && (
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
