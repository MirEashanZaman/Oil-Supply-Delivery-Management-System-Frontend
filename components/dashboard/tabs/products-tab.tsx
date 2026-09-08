"use client";

import React, { useState } from "react";
import { Product, UserData } from "../types";
import { getProductImage } from "../utils";

interface ProductsTabProps {
  products: Product[];
  userData: UserData | null;
  loadingProducts: boolean;
  onAddToCart?: (product: Product) => void;
  onInstantOrder?: (product: Product) => void;
  onWholesaleOrder?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: number) => void;
  onOpenPostProductModal?: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  userData,
  loadingProducts,
  onAddToCart,
  onInstantOrder,
  onWholesaleOrder,
  onEditProduct,
  onDeleteProduct,
  onOpenPostProductModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const isCustomer = userData?.role === "Customer";
  const isAdmin = userData?.role === "Admin";
  const isSupplier = userData?.role === "Supplier";
  const isDealer = userData?.role === "Dealer";

  const categories = [
    "all",
    ...Array.from(
      new Set(products.map((p) => p.category || "General").filter(Boolean))
    ),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      (p.category || "General").toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-850 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search petroleum fuels, octane grade, diesel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {(isSupplier || isAdmin) && onOpenPostProductModal && (
          <button
            onClick={onOpenPostProductModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>+</span> Post Product Lot
          </button>
        )}
      </div>

      {/* Grid of Products */}
      {loadingProducts ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-slate-400">Loading petroleum product catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-850 rounded-2xl border border-slate-800">
          <span className="text-4xl mb-3 block">⛽</span>
          <h4 className="text-base font-bold text-white">No products found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search filters or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = Number(product.stock) <= 0;
            const supplierName =
              product.supplier?.name ||
              product.user?.name ||
              "Certified Refinery Supplier";

            return (
              <div
                key={product.id}
                className="bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl flex flex-col group transition"
              >
                {/* Product Image Banner */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={getProductImage(product.name, product.category)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {product.category || "Standard Fuel"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xl font-black text-amber-400 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-amber-500/30">
                      ${product.price}{" "}
                      <span className="text-[10px] font-normal text-slate-300">
                        / Litre
                      </span>
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description ||
                        "Standard petroleum specification refined for premium engine performance and commercial transportation."}
                    </p>
                  </div>

                  {/* Supplier & Stock meta */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Supplier / Refinery:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[160px]">
                        {supplierName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Available Stock:</span>
                      <span
                        className={`font-bold ${
                          isOutOfStock ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : `${Number(product.stock).toLocaleString()} Litres`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2">
                    {isCustomer && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onAddToCart && onAddToCart(product)}
                          disabled={isOutOfStock}
                          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <span>🛒</span> Add to Cart
                        </button>
                        <button
                          onClick={() => onInstantOrder && onInstantOrder(product)}
                          disabled={isOutOfStock}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Instant Order
                        </button>
                      </div>
                    )}

                    {isDealer && (
                      <button
                        onClick={() =>
                          onWholesaleOrder && onWholesaleOrder(product)
                        }
                        disabled={isOutOfStock}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-40"
                      >
                        Procure Wholesale Lot 🏭
                      </button>
                    )}

                    {(isAdmin || isSupplier) && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onEditProduct && onEditProduct(product)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                        >
                          ✏️ Edit Stock
                        </button>
                        {onDeleteProduct && (
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
