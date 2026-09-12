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
            <div className="flex items-center justify-between">
              <label className="block text-[0.85rem] font-bold text-[#0F2747] text-left">
                Product Photo <span className="text-red-600 font-extrabold text-xs bg-red-100/80 border border-red-200 px-2 py-0.5 rounded-md ml-1">Required *</span>
              </label>
            </div>
            <p className="text-[0.72rem] text-[#64748B] -mt-1 text-left">
              Upload a clear photo for this product. A photo is required to publish this product.
            </p>

            {newProduct.photo ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-300 rounded-xl shadow-sm">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0 relative">
                  <img
                    src={URL.createObjectURL(newProduct.photo)}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {newProduct.photo.name}
                  </p>
                  <p className="text-[0.7rem] text-slate-500">
                    {(newProduct.photo.size / 1024).toFixed(1)} KB
                  </p>
                  <label
                    htmlFor="product-photo-upload"
                    className="inline-block mt-1 text-[0.75rem] font-semibold text-[#0F2747] hover:underline cursor-pointer"
                  >
                    Change photo
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNewProduct((prev) => ({ ...prev, photo: null }))
                  }
                  className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#0F2747] rounded-xl p-4 bg-white transition cursor-pointer relative group">
                <label
                  htmlFor="product-photo-upload"
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-8 h-8 text-slate-400 group-hover:text-[#0F2747] transition mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-bold text-[#0F2747]">
                    Click to select photo <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[0.7rem] text-slate-500 mt-0.5">
                    PNG, JPG, JPEG, WEBP
                  </span>
                </label>
              </div>
            )}

            <input
              id="product-photo-upload"
              type="file"
              accept="image/*"
              required={!newProduct.photo}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setNewProduct((prev) => ({
                  ...prev,
                  photo: file,
                }));
              }}
              className="hidden"
            />
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
