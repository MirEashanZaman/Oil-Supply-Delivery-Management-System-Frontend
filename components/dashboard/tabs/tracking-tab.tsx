"use client";

import React from "react";
import { Order } from "../types";
import UberMapTracker from "../../uber-map-tracker";

interface TrackingTabProps {
  selectedTrackingOrder: Order | null;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  userRole?: string;
  onClose?: () => void;
}

export const TrackingTab: React.FC<TrackingTabProps> = ({
  selectedTrackingOrder,
  orders,
  onSelectOrder,
  userRole = "customer",
  onClose = () => {},
}) => {
  const activeOrders = orders.filter(
    (o) => o.status !== "Cancelled" && o.status !== "Rejected"
  );

  return (
    <div className="space-y-6">
      {/* Tracking Header / Selector */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-base font-bold text-white">
              Live Fleet GPS & Telematics Dispatch
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-route simulation, driver telemetry, and turn-by-turn ETA
          </p>
        </div>

        {/* Order Selector */}
        {activeOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              Active Consignment:
            </span>
            <select
              value={selectedTrackingOrder?.id || ""}
              onChange={(e) => {
                const ord = orders.find((o) => o.id === Number(e.target.value));
                if (ord) onSelectOrder(ord);
              }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
            >
              {activeOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.id} - {o.product?.name || "Fuel"} ({o.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Embedded UberMapTracker */}
      {selectedTrackingOrder ? (
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <UberMapTracker
            order={selectedTrackingOrder as any}
            userRole={userRole}
            onClose={onClose}
          />
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-850 border border-slate-800 rounded-2xl p-6">
          <span className="text-5xl mb-4 block">🛰️</span>
          <h4 className="text-lg font-bold text-white">No Consignment Selected</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Select an order from the list or browse your active orders to view real-time GPS telemetry, driver dispatch, and route mapping.
          </p>
        </div>
      )}
    </div>
  );
};
