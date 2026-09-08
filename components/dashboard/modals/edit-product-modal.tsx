"use client";

import React from "react";
import { Product } from "../types";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  editProductForm: { price: string; stock: string };
  setEditProductForm: React.Dispatch<
    React.SetStateAction<{ price: string; stock: string }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  editProductForm,
  setEditProductForm,
  onSubmit,
  submitting,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >

        </button>
        <h3 className="text-xl font-bold text-white mb-2">Edit Product</h3>
        <p className="text-xs text-amber-400 font-semibold mb-4">
          {product.name}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Unit Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={editProductForm.price}
              onChange={(e) =>
                setEditProductForm((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Available Stock (Units / Liters)
            </label>
            <input
              type="number"
              min="0"
              value={editProductForm.stock}
              onChange={(e) =>
                setEditProductForm((prev) => ({
                  ...prev,
                  stock: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>
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
              disabled={submitting}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-slate-950 rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
