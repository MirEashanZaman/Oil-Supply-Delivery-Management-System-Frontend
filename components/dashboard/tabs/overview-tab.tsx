"use client";

import React from "react";
import { UserData, Order, Product, DashboardTab } from "../types";
import { getStatusBadgeClass } from "../utils";

interface OverviewTabProps {
  userData: UserData | null;
  orders: Order[];
  products: Product[];
  auditTrail?: Array<{ id: number; action: string; detail: string; timestamp: string; type: "info" | "warning" | "success" }>;
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
  auditTrail = [],
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
    const directValue = Number(String(order.totalAmount ?? 0).replace(/[$,\s]/g, ""));
    const quantity = Number(order.quantity ?? 1) || 1;
    const productPrice = Number(String((order as any).product?.price ?? 0).replace(/[$,\s]/g, ""));

    let amt = 0;
    if (Number.isFinite(directValue) && directValue > 0) {
      amt = quantity > 1 && productPrice > 0 && directValue <= productPrice ? directValue * quantity : directValue;
    } else if (Number.isFinite(productPrice) && productPrice > 0) {
      amt = productPrice * quantity;
    }

    return sum + amt;
  }, 0);

  const pendingOrdersCount = orders.filter((o) => {
    const status = String(o.status ?? "")
      .trim()
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ");

    return status === "pending" || status === "processing";
  }).length;

  const deliveredOrdersCount = orders.filter((o) => {
    const status = String(o.status ?? "")
      .trim()
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ");

    return status === "delivered" || status === "completed";
  }).length;

  const activeDeliveries = orders.filter((o) => {
    const status = String(o.status ?? "")
      .trim()
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ");

    return status === "out for delivery";
  });

  const lifecycleStages = [
    {
      label: "Queued",
      count: orders.filter((o) => {
        const status = String(o.status ?? "").trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
        return status === "pending" || status === "confirmed";
      }).length,
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Processing",
      count: orders.filter((o) => {
        const status = String(o.status ?? "").trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
        return status === "processing" || status === "in transit";
      }).length,
      tone: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Out for Delivery",
      count: orders.filter((o) => {
        const status = String(o.status ?? "").trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
        return status === "out for delivery" || status === "on the way";
      }).length,
      tone: "bg-violet-50 text-violet-700 border-violet-200",
    },
    {
      label: "Delivered",
      count: orders.filter((o) => {
        const status = String(o.status ?? "").trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
        return status === "delivered" || status === "completed";
      }).length,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const notifications = [
    ...products
      .filter((product) => Number(product.quantity ?? product.stock ?? 0) <= 20)
      .slice(0, 2)
      .map((product) => ({
        type: "warning",
        title: `${product.name} stock is low`,
        detail: `${product.quantity ?? product.stock ?? 0} units remaining`,
        time: "Needs attention",
      })),
    ...orders
      .filter((order) => {
        const status = String(order.status ?? "").trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
        return status === "pending" || status === "processing" || status === "out for delivery";
      })
      .slice(0, 2)
      .map((order) => ({
        type: "info",
        title: `Order #${order.id} is ${order.status}`,
        detail: `${order.product?.name || "Fuel Product"} • ${order.quantity} units`,
        time: "Live",
      })),
  ].slice(0, 4);

  const exportCsv = (title: string, rows: Array<Record<string, string | number>>) => {
    if (typeof window === "undefined") return;

    if (!rows.length) {
      window.alert("There is no data to export right now.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvRows = [headers.join(",")];

    rows.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] ?? "";
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const orderExportRows = orders.map((order) => ({
    OrderID: order.id,
    Product: order.product?.name || "Fuel Product",
    Quantity: order.quantity,
    Total: Number(String(order.totalAmount ?? 0).replace(/[$,\s]/g, "")) || 0,
    Status: order.status || "Pending",
  }));

  const inventoryExportRows = products.map((product) => ({
    Product: product.name,
    Category: product.category,
    Stock: Number(product.quantity ?? product.stock ?? 0),
    Price: Number(String(product.price ?? 0).replace(/[$,\s]/g, "")) || 0,
    Status: product.stockLevel,
  }));

  return (
    <div className="space-y-6 text-left">
      { }
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

      <div className="card bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#0F2747]">Order Lifecycle Overview</h3>
            <p className="text-xs text-secondary-gray">Operational flow across the fulfillment pipeline</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="text-xs font-bold text-[#F59E0B] hover:underline"
          >
            Manage Orders →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {lifecycleStages.map((stage) => (
            <div key={stage.label} className={`rounded-2xl border p-4 ${stage.tone}`}>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">{stage.label}</div>
              <div className="mt-3 text-2xl font-black leading-none">{stage.count}</div>
              <div className="mt-2 text-[11px] font-medium opacity-80">Current operational count</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary-gray">Latest Fulfillment Notes</div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              const status = String(order.status ?? "").trim();
              const tone = status.toLowerCase().includes("delivered")
                ? "bg-emerald-100 text-emerald-700"
                : status.toLowerCase().includes("pending") || status.toLowerCase().includes("processing")
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sky-100 text-sky-700";

              return (
                <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div>
                    <div className="text-xs font-bold text-[#0F2747]">Order #{order.id}</div>
                    <div className="text-[11px] text-secondary-gray">{order.product?.name || "Fuel Product"}</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tone}`}>
                    {status || "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2747]">Notification Center</h3>
            <p className="text-xs text-secondary-gray">Operational alerts and priority updates</p>
          </div>
          <div className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            {notifications.length} alerts
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-secondary-gray">
              No operational alerts right now.
            </div>
          ) : (
            notifications.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${item.type === "warning" ? "bg-amber-500" : "bg-sky-500"}`} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0F2747]">{item.title}</div>
                  <div className="text-xs text-secondary-gray">{item.detail}</div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-gray">{item.time}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2747]">Reports & Exports</h3>
            <p className="text-xs text-secondary-gray">Download operational summaries for orders and inventory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-gray">Orders Summary</div>
            <div className="mt-3 text-2xl font-black text-[#0F2747]">{orders.length}</div>
            <div className="mt-2 text-xs text-secondary-gray">Current order records available</div>
            <button
              type="button"
              onClick={() => exportCsv("orders-summary", orderExportRows)}
              className="mt-4 btn btn-sm btn-primary rounded-xl font-bold"
            >
              Export Orders CSV
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-secondary-gray">Inventory Summary</div>
            <div className="mt-3 text-2xl font-black text-[#0F2747]">{products.length}</div>
            <div className="mt-2 text-xs text-secondary-gray">Products currently in the catalog</div>
            <button
              type="button"
              onClick={() => exportCsv("inventory-summary", inventoryExportRows)}
              className="mt-4 btn btn-sm btn-secondary rounded-xl font-bold"
            >
              Export Inventory CSV
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F2747]">Audit Trail</h3>
            <p className="text-xs text-secondary-gray">Recent operational and admin actions</p>
          </div>
          <div className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            {auditTrail.length} logs
          </div>
        </div>

        <div className="space-y-3">
          {auditTrail.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-secondary-gray">
              No activity recorded yet.
            </div>
          ) : (
            auditTrail.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${entry.type === "warning" ? "bg-amber-500" : entry.type === "success" ? "bg-emerald-500" : "bg-sky-500"}`} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#0F2747]">{entry.action}</div>
                  <div className="text-xs text-secondary-gray">{entry.detail}</div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary-gray">{entry.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </div>

      { }
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
            Live GPS Tracking
          </button>
        </div>
      </div>

      { }
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
                      {Boolean(order.status) && !(["pending", "delivered", "completed", "cancelled", "rejected"].includes(order.status.toLowerCase())) && onOpenLiveTrack ? (
                        <button
                          type="button"
                          onClick={() => onOpenLiveTrack(order)}
                          className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px] transition"
                        >
                          Track Live
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
