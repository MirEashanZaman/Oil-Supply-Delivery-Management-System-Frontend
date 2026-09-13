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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const isCustomer = userData?.role === "Customer" || userData?.title === "Customer";
  const isAdmin = userData?.role === "Admin" || userData?.title === "Admin";
  const isSupplier = userData?.role === "Supplier" || userData?.title === "Supplier";
  const isDealer = userData?.role === "Dealer" || userData?.title === "Dealer";

  return (
    <div className="w-full text-left">
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
            const normalizeStatus = (value?: string) =>
              String(value ?? "")
                .trim()
                .toLowerCase()
                .replace(/[-_]/g, " ")
                .replace(/\s+/g, " ");

            const status = normalizeStatus(item.status);
            const isDelivered = status === "delivered" || status === "completed";
            const isCancelled = status === "cancelled" || status === "canceled";
            const isRejected = status === "rejected";
            const isPending = !item.status || status === "pending";
            const isConfirmed = status === "confirmed";
            const isProcessing = status === "processing";
            const isOutForDelivery = status === "out for delivery";
            const isScheduled = status === "scheduled" || status === "in transit" || status === "in-transit";
            const canSelectStatus = isConfirmed || isProcessing || isScheduled || isOutForDelivery;
            const canCustomerMarkDelivered = !isDelivered && !isCancelled && !isRejected &&
              ["confirmed", "processing", "out for delivery", "scheduled", "in transit", "in-transit"].includes(status);

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
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(item)}
                    className="bg-slate-100 text-dark-slate border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Order Details
                  </button>
                  {isAdmin ? (
                    <div className="flex gap-2">
                      {!isDelivered && onDeleteOrder && (
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
                          value={status || "confirmed"}
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

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#F5F7FA] p-3 pt-8 sm:p-5 sm:pt-10" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary-gray">Order Details</p>
                  <h2 id="order-details-title" className="text-xl font-black text-dark-slate">Order #{selectedOrder.id}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                  aria-label="Close order details"
                >
                  x
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Product</p>
                  <p className="mt-1 font-bold text-dark-slate">{selectedOrder.product?.name || "Petroleum Fuel"}</p>
                  <p className="text-xs text-secondary-gray">Product ID: {selectedOrder.product?.id || "Not available"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Quantity</p>
                  <p className="mt-1 font-bold text-dark-slate">{selectedOrder.quantity} units</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Total Amount</p>
                  <p className="mt-1 font-bold text-dark-slate">{selectedOrder.totalAmount !== undefined ? `$${Number(selectedOrder.totalAmount).toFixed(2)}` : "Not available"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Status</p>
                  <p className="mt-1 font-bold capitalize text-dark-slate">{selectedOrder.status || "Pending"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Delivery Date</p>
                  <p className="mt-1 break-words font-bold text-dark-slate">{selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleString() : "Not scheduled"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Delivery Address</p>
                  <p className="mt-1 break-words font-bold text-dark-slate">{selectedOrder.deliveryAddress || selectedOrder.address || "Not provided"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Source</p>
                  <p className="mt-1 font-bold text-dark-slate">
                    {selectedOrder.dealer ? `Dealer: ${selectedOrder.dealer.userName || selectedOrder.dealer.name || selectedOrder.dealer.username || selectedOrder.dealer.id}` : selectedOrder.supplier ? `Supplier: ${selectedOrder.supplier.userName || selectedOrder.supplier.name || selectedOrder.supplier.username || selectedOrder.supplier.id}` : "Not available"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] font-bold uppercase text-secondary-gray">Order Date</p>
                  <p className="mt-1 break-words font-bold text-dark-slate">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "Not available"}</p>
                </div>
                {selectedOrder.payment && (
                  <div className="rounded-xl border border-slate-200 p-3 sm:col-span-2">
                    <p className="text-[11px] font-bold uppercase text-secondary-gray">Payment</p>
                    <p className="mt-1 font-bold text-dark-slate">{selectedOrder.payment.cardType || "Payment method unavailable"} · {selectedOrder.payment.status || "Status unavailable"}</p>
                    {selectedOrder.payment.cardNumber && <p className="text-xs text-secondary-gray">Reference: **** {String(selectedOrder.payment.cardNumber).slice(-4)}</p>}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-[#0F2747] px-4 py-2 text-xs font-bold text-white hover:bg-[#163860]"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
