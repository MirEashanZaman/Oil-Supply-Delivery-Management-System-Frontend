"use client";

import React from "react";
import { Product, UserData } from "../types";

interface InventoryTabProps {
  products: Product[];
  userData: UserData | null;
  onWholesaleOrder?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onOpenPostProductModal?: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  userData,
  onWholesaleOrder,
  onEditProduct,
  onOpenPostProductModal,
}) => {
  const isSupplier = userData?.role === "Supplier";
  const isDealer = userData?.role === "Dealer";
  const isAdmin = userData?.role === "Admin";

  const totalStockLitres = products.reduce(
    (sum, p) => sum + (Number(p.stock) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">
            {isSupplier ? "Refinery Total Capacity" : "Tracked Fuel Reserve"}
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {totalStockLitres.toLocaleString()} Litres
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all product grades</div>
        </div>

        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">
            Active Product Lines
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {products.length} Categories
          </div>
          <div className="text-xs text-slate-500 mt-1">Ready for distribution</div>
        </div>

        <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">
            Operational Readiness
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">100% Online</div>
          <div className="text-xs text-slate-500 mt-1">Depot telematics connected</div>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">
              {isSupplier
                ? "Refinery Terminal Inventory & Stock"
                : isDealer
                ? "Refinery Supplier Sourcing & Dealership Depots"
                : "Central Fuel Stock Reserves"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live stock levels, refinery pricing, and automated replenishment
            </p>
          </div>

          {(isSupplier || isAdmin) && onOpenPostProductModal && (
            <button
              onClick={onOpenPostProductModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap"
            >
              + Add Refinery Fuel Stock
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Product Lot</th>
                <th className="p-3">Category</th>
                <th className="p-3">Wholesale Rate</th>
                <th className="p-3">Available Stock</th>
                <th className="p-3">Refinery Supplier</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {products.map((p) => {
                const isOutOfStock = Number(p.stock) <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-semibold text-white">{p.name}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-amber-500/20">
                        {p.category || "General"}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-emerald-400">
                      ${p.price} / L
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-bold ${
                          isOutOfStock ? "text-rose-400" : "text-slate-200"
                        }`}
                      >
                        {isOutOfStock
                          ? "Depleted"
                          : `${Number(p.stock).toLocaleString()} L`}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 truncate max-w-[150px]">
                      {p.supplier?.name || p.user?.name || "Refinery Partner"}
                    </td>
                    <td className="p-3 text-right">
                      {isDealer && (
                        <button
                          onClick={() =>
                            onWholesaleOrder && onWholesaleOrder(p)
                          }
                          disabled={isOutOfStock}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition disabled:opacity-40"
                        >
                          Source Bulk Lot →
                        </button>
                      )}
                      {(isSupplier || isAdmin) && onEditProduct && (
                        <button
                          onClick={() => onEditProduct(p)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] rounded-lg transition"
                        >
                          ✏️ Adjust Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
