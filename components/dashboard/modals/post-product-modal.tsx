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
    photo: File | null;
  };
  setNewProduct: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      price: string;
      stock: string;
      category: string;
      photo: File | null;
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
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] w-full max-w-[540px] rounded-[18px] shadow-xl p-4 sm:p-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-[#475569] transition hover:bg-slate-300"
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="mb-6 text-center">
          <h3 className="text-[1.5rem] font-black tracking-tight text-[#0F2747]">
            Post New Product
          </h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[0.85rem] font-semibold text-[#0F2747] text-left">
              Product Name
            </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-white border border-[#CBD5E1] rounded-[18px] px-4 py-3 text-base text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#0F2747] shadow-sm"
              placeholder="e.g. Premium Unleaded Octane-95"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[0.85rem] font-semibold text-[#0F2747] text-left">
              Category
            </label>
            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-sm text-[#1E293B] focus:outline-none focus:border-[#0F2747] shadow-sm"
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[0.85rem] font-semibold text-[#0F2747] text-left">
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
                className="w-full bg-white border border-[#CBD5E1] rounded-[18px] px-4 py-3 text-base text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#0F2747] shadow-sm"
                placeholder="1.25"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[0.85rem] font-semibold text-[#0F2747] text-left">
                Stock (Liters/Units)
              </label>
              <input
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, stock: e.target.value }))
                }
                className="w-full bg-white border border-[#CBD5E1] rounded-[18px] px-4 py-3 text-base text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#0F2747] shadow-sm"
                placeholder="50000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[0.85rem] font-semibold text-[#0F2747] text-left">
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
              className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-sm text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#0F2747] resize-none h-22 shadow-sm"
              placeholder="High-grade refined fuel standard suitable for all modern commercial engines."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[0.85rem] font-semibold text-[#0F2747] text-left">
              Product Photo
            </label>

            <div className="flex overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
              <label
                htmlFor="product-photo-upload"
                className="cursor-pointer border-r border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F2747] transition hover:bg-slate-100"
              >
                Choose File
              </label>

              <span className="flex-1 truncate px-3 py-2 text-xs text-[#64748B]">
                {newProduct.photo ? newProduct.photo.name : "No file chosen"}
              </span>

              <input
                id="product-photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    photo: e.target.files?.[0] || null,
                  }))
                }
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-[#334155] hover:bg-slate-300 rounded-xl text-sm font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#0F2747] hover:bg-[#163860] text-white rounded-xl text-sm font-black transition disabled:opacity-50 shadow-sm"
            >
              {submitting ? "Publishing..." : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
