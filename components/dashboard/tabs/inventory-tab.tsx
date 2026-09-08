"use client";

import React, { useState } from "react";
import { Product, UserData } from "../types";

interface InventoryTabProps {
  products: Product[];
  userData: UserData | null;
  onWholesaleOrder?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onOpenPostProductModal?: () => void;
  onRemoveFromPortfolio?: (productId: number) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  userData,
  onWholesaleOrder,
  onEditProduct,
  onOpenPostProductModal,
  onRemoveFromPortfolio,
}) => {
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const isSupplier = userData?.role === "Supplier" || userData?.title === "Supplier";

  const filteredInventory = products.filter((item) => {
    const query = inventorySearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full text-left animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E293B]">
            {isSupplier ? "My Supply Portfolio" : "My Stock Inventory"}
          </h1>
          <p className="text-sm text-[#64748B]">
            {isSupplier
              ? "Manage petroleum products you actively distribute to Dealers and direct Customers."
              : "Manage products actively linked to your Dealer stock catalog."}
          </p>
        </div>
        {onOpenPostProductModal && (
          <button
            onClick={onOpenPostProductModal}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm border-none self-start sm:self-auto flex items-center gap-2"
          >
            <span>+</span> Post Product Lot
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                {item.category}
              </span>
              <h3 className="font-bold text-lg text-dark-slate mt-2">{item.name}</h3>
              <p className="text-xs text-secondary-gray mt-1">{item.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="font-extrabold text-primary">{item.price}</span>
              {onRemoveFromPortfolio && (
                <button
                  onClick={() => onRemoveFromPortfolio(item.id)}
                  className="btn btn-xs bg-rose-500 hover:bg-rose-600 text-white border-none rounded-lg cursor-pointer"
                >
                  Remove from Portfolio
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
