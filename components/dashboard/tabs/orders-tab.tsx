"use client";

import React, { useState } from "react";
import { Order, UserData } from "../types";

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
  const isCustomer = userData?.role === "Customer" || userData?.title === "Customer";
  const isAdmin = userData?.role === "Admin" || userData?.title === "Admin";
  const isSupplier = userData?.role === "Supplier" || userData?.title === "Supplier";
  const isDealer = userData?.role === "Dealer" || userData?.title === "Dealer";

  return (
    <div className="w-full text-left animate-fadeIn">
      <h1 className="text-2xl font-extrabold text-dark-slate mb-2">
        {isCustomer
          ? "My Order History & Live Tracking"
          : isAdmin
            ? "Global Order Control & Deletion"
            : "Fulfill Customer & Dealer Orders"}
      </h1>
      <p className="text-sm text-secondary-gray mb-6">
        {isCustomer
          ? "View past orders, delivery channel selections, payment invoices, and real-time status updates."
          : isAdmin
            ? "Admins can delete orders, but cannot update any order details or status."
            : "Confirm or reject retail/wholesale orders, schedule deliveries, and dispatch email updates to buyers."}
      </p>

      {loadingOrders ? (
        <div className="flex flex-col justify-center items-center py-16">
          <span className="loading loading-spinner loading-lg text-[#0F2747] mb-3"></span>
          <p className="text-sm text-secondary-gray">Loading orders history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm">
          <p className="text-secondary-gray mb-4">No order logs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((item) => {
            const isDelivered =
              item.status?.toLowerCase() === "delivered" ||
              item.status?.toLowerCase() === "completed";
            const isCancelled =
              item.status?.toLowerCase() === "cancelled" ||
              item.status?.toLowerCase() === "canceled";
            const isRejected = item.status?.toLowerCase() === "rejected";
            const isPending = !item.status || item.status.toLowerCase() === "pending";
            const isConfirmed = item.status?.toLowerCase() === "confirmed";
            const isProcessing = item.status?.toLowerCase() === "processing";
            const isScheduled =
              item.status?.toLowerCase() === "scheduled" ||
              item.status?.toLowerCase() === "in-transit";
            const canSelectStatus = isConfirmed || isProcessing || isScheduled;
            const canCustomerMarkDelivered = !isDelivered && !isCancelled && !isRejected &&
              ["confirmed", "processing", "out for delivery", "scheduled", "in-transit"].includes(
                item.status?.toLowerCase() || ""
              );

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-dark-slate">
                      Order #{item.id}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${isConfirmed
                        ? "bg-green-100 text-success-green border border-green-200"
                        : isRejected
                          ? "bg-red-100 text-error-red border border-red-200"
                          : isDelivered
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isScheduled
                              ? "bg-teal-100 text-teal-800 border border-teal-200"
                              : "bg-blue-50 text-primary border border-blue-100"
                        }`}
                    >
                      {item.status ? item.status.toUpperCase() : "PENDING"}
                    </span>
                  </div>

                  <p className="text-sm text-dark-slate">
                    Product: <span className="font-semibold text-primary">{item.product?.name || "Petroleum Fuel"}</span> (Qty: {item.quantity})
                  </p>

                  {!isCustomer && item.customerName && (
                    <p className="text-xs text-secondary-gray">
                      Customer: <strong className="text-dark-slate">{item.customerName}</strong> ({item.customerEmail || "Buyer"})
                    </p>
                  )}

                  <p className="text-xs text-secondary-gray">
                    Destination: <span className="text-dark-slate">{item.deliveryAddress || item.address || "Local Hub"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {isAdmin ? (
                    <div className="flex gap-2">
                      {onDeleteOrder && (
                        <button
                          onClick={() => onDeleteOrder(item.id)}
                          className="bg-error-red text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-error-red/90 transition-colors cursor-pointer"
                        >
                          Delete Order (DELETE)
                        </button>
                      )}
                    </div>
                  ) : isCustomer ? (
                    <>
                      {isDelivered ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Delivery Complete</span>
                        </div>
                      ) : isCancelled || isRejected ? (
                        <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-2 rounded border border-red-200">
                          {isRejected ? "Order Rejected" : "Order Cancelled"}
                        </span>
                      ) : (
                        <>
                          {!isPending && (
                            <button
                              onClick={() => onOpenLiveTrack(item)}
                              className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                              Track Delivery
                            </button>
                          )}
                          {canCustomerMarkDelivered && onUpdateOrderStatus && (
                            <button
                              onClick={() => onUpdateOrderStatus(item.id, "delivered")}
                              className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {onCancelOrder && (
                            <button
                              onClick={() => onCancelOrder(item.id)}
                              className="bg-error-red text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-error-red/90 transition-colors cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {isDelivered ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3.5 py-2 rounded-lg border border-green-300 flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Delivery Complete</span>
                        </span>
                      ) : isRejected ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-lg border border-red-300">
                          Rejected
                        </span>
                      ) : canSelectStatus ? (
                        <select
                          value={(item.status || "confirmed").toLowerCase()}
                          onChange={(event) => onUpdateOrderStatus?.(item.id, event.target.value)}
                          className="select select-bordered select-sm text-xs font-semibold border-slate-300 rounded-lg"
                          aria-label={`Update status for order ${item.id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="out for delivery">Out for Delivery</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        onUpdateOrderStatus && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => onUpdateOrderStatus(item.id, "confirmed")}
                              className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                            >
                              Confirm (PUT)
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(item.id, "rejected")}
                              className="bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                              Reject (PUT)
                            </button>
                          </div>
                        )
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
