"use client";

import React from "react";
import { Order } from "../types";

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  editOrderForm: {
    status: string;
    quantity: string;
    totalAmount: string;
    deliveryAddress: string;
  };
  setEditOrderForm: React.Dispatch<
    React.SetStateAction<{
      status: string;
      quantity: string;
      totalAmount: string;
      deliveryAddress: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  editOrderForm,
  setEditOrderForm,
  onSubmit,
  submitting,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-850 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold text-white mb-2">Edit Order Details</h3>
        <p className="text-xs text-amber-400 mb-4">
          Order #{order.id} • Customer: {order.user?.name || "N/A"}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Order Status
            </label>
            <select
              value={editOrderForm.status}
              onChange={(e) =>
                setEditOrderForm((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quantity (Liters)
              </label>
              <input
                type="number"
                min="1"
                value={editOrderForm.quantity}
                onChange={(e) =>
                  setEditOrderForm((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={editOrderForm.totalAmount}
                onChange={(e) =>
                  setEditOrderForm((prev) => ({
                    ...prev,
                    totalAmount: e.target.value,
                  }))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              value={editOrderForm.deliveryAddress}
              onChange={(e) =>
                setEditOrderForm((prev) => ({
                  ...prev,
                  deliveryAddress: e.target.value,
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
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
