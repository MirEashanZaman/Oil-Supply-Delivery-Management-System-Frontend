"use client";

import React from "react";
import { Product } from "../types";

interface WholesaleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  wholesaleQuantity: string;
  setWholesaleQuantity: (val: string) => void;
  wholesaleAddress: string;
  setWholesaleAddress: (val: string) => void;
  wholesaleNotes: string;
  setWholesaleNotes: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  orderingWholesale: boolean;
}

export const WholesaleOrderModal: React.FC<WholesaleOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  wholesaleQuantity,
  setWholesaleQuantity,
  wholesaleAddress,
  setWholesaleAddress,
  wholesaleNotes,
  setWholesaleNotes,
  onSubmit,
  orderingWholesale,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          
        </button>
        <h3 className="text-xl font-bold text-white mb-2">
          Place Wholesale Sourcing Order
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Order bulk petroleum products directly from supplier refineries for
          dealer inventory.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-700/60 rounded-xl">
            <div className="text-xs text-slate-400">Product</div>
            <div className="text-sm font-bold text-amber-400">
              {product.name}
            </div>
            <div className="text-xs text-slate-400">
              Supplier:{" "}
              {product.supplier?.name ||
                product.user?.name ||
                "Refinery Partner"}
            </div>
            <div className="text-xs text-slate-400">
              Unit Wholesale Price:{" "}
              <span className="text-emerald-400 font-semibold">
                ${product.price}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity (Liters / Barrels)
            </label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={wholesaleQuantity}
              onChange={(e) => setWholesaleQuantity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. 5000"
              required
            />
            <span className="text-[10px] text-slate-500">
              Available Supplier Stock: {product.stock}
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Delivery Depot Address
            </label>
            <input
              type="text"
              value={wholesaleAddress}
              onChange={(e) => setWholesaleAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. Terminal Depot Gate 4, Sector 7"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Special Handling / Tanker Notes (Optional)
            </label>
            <textarea
              value={wholesaleNotes}
              onChange={(e) => setWholesaleNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500 resize-none h-20"
              placeholder="Specify tanker specifications, temperature requirements, etc."
            />
          </div>
          {wholesaleQuantity && Number(wholesaleQuantity) > 0 && (
            <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-sm">
              <span className="text-amber-300 font-medium">
                Estimated Sourcing Total:
              </span>
              <span className="text-amber-400 font-bold text-base">
                $
                {(
                  Number(wholesaleQuantity) * Number(product.price)
                ).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={orderingWholesale}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {orderingWholesale ? "Processing Order..." : "Confirm Wholesale Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
