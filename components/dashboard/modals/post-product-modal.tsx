"use client";

import React from "react";

interface PostProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProduct: {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
  };
  setNewProduct: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      price: string;
      stock: string;
      category: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const PostProductModal: React.FC<PostProductModalProps> = ({
  isOpen,
  onClose,
  newProduct,
  setNewProduct,
  onSubmit,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-card-white border border-[#E2E8F0] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-secondary-gray hover:text-dark-slate"
        >

        </button>
        <h3 className="text-xl font-bold text-dark-slate mb-4">Post New Product</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-gray mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-dark-slate text-sm focus:outline-none focus:border-primary"
              placeholder="e.g. Premium Unleaded Octane-95"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-gray mb-1">
              Category
            </label>
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-dark-slate text-sm focus:outline-none focus:border-primary"
            >
              <option value="Octane">Octane</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Kerosene">Kerosene</option>
              <option value="LPG">LPG / Gas</option>
              <option value="Lubricant">Engine Lubricant</option>
              <option value="Industrial">Industrial Fuel</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-gray mb-1">
                Unit Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, price: e.target.value }))
                }
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-dark-slate text-sm focus:outline-none focus:border-primary"
                placeholder="1.25"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-gray mb-1">
                Stock (Liters/Units)
              </label>
              <input
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, stock: e.target.value }))
                }
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-dark-slate text-sm focus:outline-none focus:border-primary"
                placeholder="50000"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-gray mb-1">
              Description
            </label>
            <textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-2 text-dark-slate text-sm focus:outline-none focus:border-primary resize-none h-20"
              placeholder="High-grade refined fuel standard suitable for all modern commercial engines."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-secondary-gray hover:bg-slate-200 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-dark-slate rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
