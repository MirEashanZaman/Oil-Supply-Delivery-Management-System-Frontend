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
    <div className="space-y-6 text-left">
      {}
      <div className="card bg-card-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-base font-bold text-[#0F2747]">
              Live Fleet GPS & Telematics Dispatch
            </h3>
          </div>
          <p className="text-xs text-secondary-gray mt-1">
            Real-time multi-route simulation, driver telemetry, and turn-by-turn ETA
          </p>
        </div>

        {}
        {activeOrders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-secondary-gray whitespace-nowrap">
              Active Consignment:
            </span>
            <select
              value={selectedTrackingOrder?.id || ""}
              onChange={(e) => {
                const ord = orders.find((o) => o.id === Number(e.target.value));
                if (ord) onSelectOrder(ord);
              }}
              className="select select-bordered select-sm text-xs font-bold text-[#0F2747] border-[#E2E8F0] focus:border-[#F59E0B] rounded-xl"
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

      {}
      {selectedTrackingOrder ? (
        <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-md">
          <UberMapTracker
            order={selectedTrackingOrder as any}
            userRole={userRole}
            onClose={onClose}
            isEmbedded={true}
          />
        </div>
      ) : (
        <div className="text-center py-20 card bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <span className="text-5xl mb-3 block">️</span>
          <h4 className="text-base font-bold text-[#0F2747]">No Consignment Selected</h4>
          <p className="text-xs text-secondary-gray mt-1 max-w-md mx-auto">
            Select an active order from the dropdown above or your orders list to view live GPS tracking and delivery telemetry.
          </p>
        </div>
      )}
    </div>
  );
};
