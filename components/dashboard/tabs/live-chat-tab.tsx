"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserData } from "../types";
import { ChatMessage } from "@/lib/pusher";

interface LiveChatTabProps {
  userData: UserData | null;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({ userData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init_1",
      sender: "Refinery Dispatch Central",
      email: "refinery@oilsupply-delivery.com",
      role: "Supplier",
      topic: "Refinery Wholesale Availability",
      message: "All crude fuel pipelines and regional tanker depots operating at verified ISO specifications. Real-time dispatches active.",
      timestamp: "09:30 AM",
      channel: "oil-supply-chat",
    },
    {
      id: "msg_init_2",
      sender: "Dhaka Regional Dealer Hub",
      email: "dealer@oilsupply-delivery.com",
      role: "Dealer",
      topic: "Order Dispatch & Logistics",
      message: "Bulk tanker allocations ready for commercial customers. Priority road dispatches scheduled for Kuril and Gazipur depots.",
      timestamp: "10:15 AM",
      channel: "oil-supply-chat",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: userData?.userName || userData?.name || "User",
      email: userData?.email || "user@example.com",
      role: userData?.title || userData?.role || "Customer",
      topic: "Logistics Dispatch",
      message: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel: "oil-supply-chat",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
  };

  return (
    <div className="w-full text-left animate-fadeIn">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-dark-slate mb-1">Realtime Logistics Dispatch Chat</h2>
        <p className="text-xs text-secondary-gray mb-4">Direct WebSocket line across Refineries, Dealers, and Transport Fleets.</p>

        <div className="h-96 overflow-y-auto bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3 mb-4">
          {messages.map((m) => {
            const isMe = m.email === userData?.email;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border text-xs transition-all ${
                  isMe ? "bg-[#0F2747]/5 border-[#0F2747]/20" : "bg-white border-[#E2E8F0]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1E293B] text-sm">{m.sender}</span>
                    <span
                      className={`badge text-[10px] font-bold uppercase border-none px-2 py-0.5 ${
                        m.role === "Supplier"
                          ? "bg-[#0F2747] text-[#F59E0B]"
                          : m.role === "Dealer"
                          ? "bg-[#F59E0B]/20 text-[#D97706]"
                          : m.role === "Admin"
                          ? "bg-[#16A34A]/20 text-[#16A34A]"
                          : "bg-[#64748B]/15 text-[#1E293B]"
                      }`}
                    >
                      {m.role || "User"}
                    </span>
                    {isMe && (
                      <span className="badge bg-[#16A34A] text-white text-[9px] font-bold border-none px-1.5 py-0.5">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#64748B] font-mono">{m.timestamp}</span>
                </div>
                <div className="mb-2">
                  <span className="inline-block text-[11px] font-semibold text-[#0F2747] bg-[#0F2747]/10 px-2 py-0.5 rounded-md">
                    {m.topic}
                  </span>
                </div>
                <p className="text-[#1E293B] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a broadcast message to all logistics channels..."
            className="flex-1 p-2.5 border border-secondary-gray rounded-xl text-sm outline-none bg-white text-dark-slate"
          />
          <button
            type="submit"
            className="bg-[#0F2747] hover:bg-[#163860] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};
