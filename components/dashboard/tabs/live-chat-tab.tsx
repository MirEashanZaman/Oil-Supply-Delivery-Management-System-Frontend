"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserData } from "../types";

interface Message {
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface LiveChatTabProps {
  userData: UserData | null;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({ userData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "Refinery Logistics Dispatch",
      text: "Hello! Welcome to the 24/7 Petroleum Delivery and Dispatch channel. How can we support your consignment today?",
      time: "10:00 AM",
      isMe: false,
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

    const newMsg: Message = {
      sender: userData?.name || "Me",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    // Automated dispatcher reply simulation
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "Refinery Logistics Dispatch",
          text: "Acknowledged. Dispatch team is reviewing telematics and consignment status.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: false,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
      {/* Chat Header */}
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-lg">
              💬
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Logistics Dispatch & Driver Telematics Desk
            </h4>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to Fleet Network
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          Active Operator: <span className="text-amber-400 font-semibold">{userData?.name}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/40">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              m.isMe ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400">
                {m.sender}
              </span>
              <span className="text-[10px] text-slate-500">{m.time}</span>
            </div>
            <div
              className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                m.isMe
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-medium rounded-tr-none shadow-lg shadow-amber-500/10"
                  : "bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message to logistics team or driver..."
          className="flex-1 bg-slate-850 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
        >
          <span>Send</span> 🚀
        </button>
      </form>
    </div>
  );
};
