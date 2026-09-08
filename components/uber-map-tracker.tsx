"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";

export type TrackingOrderData = {
    id: number;
    quantity: number;
    status: string;
    address?: string;
    customerId?: number;
    customerName?: string;
    customerEmail?: string;
    deliveryDate?: string;
    product?: {
        id: number;
        name: string;
    };
    supplier?: {
        id: number;
        userName?: string;
        username?: string;
    };
    dealer?: {
        id: number;
        userName?: string;
        username?: string;
    };
    payment?: {
        cardNumber?: string;
        cardType?: string;
        amount?: number;
        status?: string;
    };
};

interface UberMapTrackerProps {
    order: TrackingOrderData | null;
    userRole?: string;
    onClose: () => void;
}

const ROUTE_WAYPOINTS = [
    { x: 100, y: 380, label: "Refinery Fuel Depot", instruction: "Depart from Eastern Tanker Depot Terminal" },
    { x: 190, y: 310, label: "N3 Airport Expressway Entry", instruction: "Merge onto National Highway N3" },
    { x: 320, y: 250, label: "Kuril Interchange Corridor", instruction: "Take flyover towards Pragati Sarani" },
    { x: 480, y: 190, label: "Gulshan-Banani Link Arterial", instruction: "Continue along North City Transit Route" },
    { x: 620, y: 220, label: "Mohakhali Logistics Node", instruction: "Keep right at Logistics Checkpoint" },
    { x: 740, y: 160, label: "Destination Depot & Terminal", instruction: "Arrive at customer site for fuel discharge" },
];

export default function UberMapTracker({ order, userRole = "customer", onClose }: UberMapTrackerProps) {
    const [progress, setProgress] = useState<number>(38);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [simSpeed, setSimSpeed] = useState<number>(1);
    const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
    const [showTraffic, setShowTraffic] = useState<boolean>(true);
    const [backendTrackingStatus, setBackendTrackingStatus] = useState<string>("");
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [callAlert, setCallAlert] = useState<string | null>(null);

    const pathRef = useRef<SVGPathElement | null>(null);
    const [vehiclePos, setVehiclePos] = useState<{ x: number; y: number; angle: number }>({
        x: 320,
        y: 250,
        angle: 0,
    });

    const routePathString = useMemo(() => {
        return "M 100 380 C 140 340, 160 320, 190 310 S 270 270, 320 250 S 420 210, 480 190 S 560 210, 620 220 S 680 180, 740 160";
    }, []);

    const fetchLiveTracking = async () => {
        if (!order) return;
        setIsRefreshing(true);
        const r = userRole.toLowerCase() === "dealer" ? "dealer" : "customer";
        try {
            const res = await axios.get(`http://localhost:8000/${r}/trackorder/${order.id}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 && res.data) {
                const s = res.data.order?.status || res.data.status || res.data.message || order.status || "In Transit";
                setBackendTrackingStatus(typeof s === "string" ? s.toUpperCase() : "IN TRANSIT");
            } else {
                setBackendTrackingStatus(order.status ? order.status.toUpperCase() : "IN TRANSIT");
            }
        } catch {
            setBackendTrackingStatus(order.status ? order.status.toUpperCase() : "IN TRANSIT");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLiveTracking();
    }, [order?.id]);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return Math.min(100, prev + 0.35 * simSpeed);
            });
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, simSpeed]);

    useEffect(() => {
        if (!pathRef.current) return;
        const path = pathRef.current;
        const totalLength = path.getTotalLength();
        const currentLength = (progress / 100) * totalLength;
        const pt = path.getPointAtLength(currentLength);
        const nextPt = path.getPointAtLength(Math.min(totalLength, currentLength + 2));
        const dx = nextPt.x - pt.x;
        const dy = nextPt.y - pt.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        setVehiclePos({ x: pt.x, y: pt.y, angle });
    }, [progress]);

    const activeWaypointIndex = useMemo(() => {
        if (progress < 15) return 0;
        if (progress < 35) return 1;
        if (progress < 60) return 2;
        if (progress < 80) return 3;
        if (progress < 95) return 4;
        return 5;
    }, [progress]);

    const currentInstruction = ROUTE_WAYPOINTS[activeWaypointIndex].instruction;
    const currentWaypointName = ROUTE_WAYPOINTS[activeWaypointIndex].label;

    const remainingDistance = useMemo(() => {
        const remainingRatio = Math.max(0, 1 - progress / 100);
        return (remainingRatio * 18.4).toFixed(1);
    }, [progress]);

    const remainingEta = useMemo(() => {
        const remainingRatio = Math.max(0, 1 - progress / 100);
        return Math.max(1, Math.round(remainingRatio * 28));
    }, [progress]);

    const liveSpeed = useMemo(() => {
        if (progress >= 100) return 0;
        if (progress < 5) return 18;
        return 46 + Math.round(Math.sin(progress) * 7);
    }, [progress]);

    if (!order) return null;

    const isDark = mapTheme === "dark";
    const partnerName = order.supplier?.userName || order.supplier?.username || order.dealer?.userName || order.dealer?.username || "Regional Dispatch Terminal";
    const originLocation = order.supplier ? "Refinery Export Hub #3" : "City Distribution Depot";
    const destinationLocation = order.address || "Customer Terminal Facility";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
            <div className="bg-[#0F172A] rounded-2xl shadow-2xl border border-[#334155] w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden text-white">
                <div className="bg-[#0B1329] border-b border-[#1E293B] px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black border border-[#334155] flex items-center justify-center text-white font-black text-xs tracking-tighter">
                            UBER
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                                    Uber Logistics Live Tracking
                                </h3>
                                <span className="px-2 py-0.5 rounded-md bg-primary/30 border border-primary/50 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                    Order #{order.id}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    progress >= 100
                                        ? "bg-success-green/20 border border-success-green text-emerald-300"
                                        : "bg-amber-500/20 border border-amber-500 text-amber-300"
                                }`}>
                                    {progress >= 100 ? "ARRIVED" : backendTrackingStatus || "IN TRANSIT"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Real-time GPS telematics with automated route optimization
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchLiveTracking}
                            disabled={isRefreshing}
                            className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh GPS</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMapTheme(isDark ? "light" : "dark")}
                            className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                        >
                            {isDark ? "Light Canvas" : "Uber Dark"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-[#059669] px-4 py-2.5 flex items-center justify-between text-white shadow-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold block">
                                Active Navigation Guidance
                            </span>
                            <span className="text-xs sm:text-sm font-black text-white">
                                {currentInstruction}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[11px] text-emerald-100 block font-medium">Estimated Arrival</span>
                        <span className="text-sm sm:text-base font-black">
                            {progress >= 100 ? "At Destination" : `${remainingEta} MINS (${remainingDistance} km)`}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
                    <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-[#1E293B]">
                        <div className={`relative w-full h-[320px] sm:h-[380px] overflow-hidden select-none ${isDark ? "bg-[#0B1120]" : "bg-[#E2E8F0]"}`}>
                            <svg className="w-full h-full" viewBox="0 0 840 460" preserveAspectRatio="xMidYMid slice">
                                <defs>
                                    <pattern id="uber-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path
                                            d="M 40 0 L 0 0 0 40"
                                            fill="none"
                                            stroke={isDark ? "#1E293B" : "#CBD5E1"}
                                            strokeWidth="1"
                                            strokeOpacity="0.4"
                                        />
                                    </pattern>

                                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#1E3A8A" />
                                        <stop offset="50%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>

                                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={isDark ? "#0A2540" : "#BAE6FD"} />
                                        <stop offset="100%" stopColor={isDark ? "#071B30" : "#7DD3FC"} />
                                    </linearGradient>
                                </defs>

                                <rect width="840" height="460" fill={isDark ? "#0B1120" : "#F1F5F9"} />
                                <rect width="840" height="460" fill="url(#uber-grid)" />

                                <path
                                    d="M -20 180 C 150 160, 300 240, 500 210 S 750 260, 880 230 L 880 320 C 700 340, 500 290, 300 320 S 100 260, -20 280 Z"
                                    fill="url(#waterGradient)"
                                    opacity="0.85"
                                />
                                <text x="340" y="295" fill={isDark ? "#38BDF8" : "#0369A1"} fontSize="9" fontWeight="bold" letterSpacing="2" opacity="0.6">
                                    BURIGANGA RIVER TRANSIT CORRIDOR
                                </text>

                                <g stroke={isDark ? "#1E293B" : "#CBD5E1"} strokeWidth="12" fill="none" opacity="0.7">
                                    <path d="M 50 50 L 800 50" />
                                    <path d="M 50 420 L 800 420" />
                                    <path d="M 80 20 L 80 440" />
                                    <path d="M 450 20 L 450 440" />
                                    <path d="M 760 20 L 760 440" />
                                    <path d="M 220 50 L 680 420" />
                                </g>

                                <g stroke={isDark ? "#334155" : "#94A3B8"} strokeWidth="6" fill="none">
                                    <path d="M 50 120 L 800 120" />
                                    <path d="M 50 350 L 800 350" />
                                    <path d="M 280 20 L 280 440" />
                                    <path d="M 600 20 L 600 440" />
                                </g>

                                {showTraffic && (
                                    <g strokeWidth="4" fill="none" opacity="0.65">
                                        <path d="M 50 120 L 300 120" stroke="#10B981" />
                                        <path d="M 300 120 L 450 120" stroke="#F59E0B" />
                                        <path d="M 450 120 L 800 120" stroke="#10B981" />
                                        <path d="M 600 20 L 600 220" stroke="#EF4444" />
                                        <path d="M 600 220 L 600 440" stroke="#10B981" />
                                    </g>
                                )}

                                <g fill={isDark ? "#1E293B" : "#CBD5E1"} opacity="0.4">
                                    <rect x="110" y="70" width="70" height="40" rx="4" />
                                    <rect x="200" y="70" width="60" height="40" rx="4" />
                                    <rect x="300" y="65" width="80" height="45" rx="4" />
                                    <rect x="500" y="70" width="80" height="40" rx="4" />
                                    <rect x="620" y="65" width="90" height="45" rx="4" />

                                    <rect x="110" y="140" width="60" height="50" rx="4" />
                                    <rect x="620" y="340" width="80" height="50" rx="4" />
                                    <rect x="680" y="240" width="70" height="45" rx="4" />
                                </g>

                                <path
                                    d={routePathString}
                                    fill="none"
                                    stroke={isDark ? "#000000" : "#94A3B8"}
                                    strokeWidth="14"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                <path
                                    d={routePathString}
                                    fill="none"
                                    stroke={isDark ? "#1E293B" : "#E2E8F0"}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                <path
                                    ref={pathRef}
                                    d={routePathString}
                                    fill="none"
                                    stroke="url(#routeGradient)"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {ROUTE_WAYPOINTS.map((wp, idx) => (
                                    <g key={idx} transform={`translate(${wp.x}, ${wp.y})`}>
                                        <circle
                                            r="4"
                                            fill={idx <= activeWaypointIndex ? "#10B981" : isDark ? "#475569" : "#94A3B8"}
                                            stroke={isDark ? "#0F172A" : "#FFFFFF"}
                                            strokeWidth="2"
                                        />
                                    </g>
                                ))}

                                <g transform="translate(100, 380)">
                                    <circle r="14" fill="#D97706" opacity="0.25" className="animate-ping" />
                                    <circle r="10" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
                                    <text x="0" y="3.5" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                                        DEP
                                    </text>
                                    <rect x="-45" y="14" width="90" height="16" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                                    <text x="0" y="25" fill="#F8FAFC" fontSize="8" fontWeight="bold" textAnchor="middle">
                                        Refinery Depot
                                    </text>
                                </g>

                                <g transform="translate(740, 160)">
                                    <circle r="14" fill="#059669" opacity="0.25" className="animate-ping" />
                                    <circle r="10" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                                    <text x="0" y="3.5" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                                        DEST
                                    </text>
                                    <rect x="-45" y="14" width="90" height="16" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                                    <text x="0" y="25" fill="#F8FAFC" fontSize="8" fontWeight="bold" textAnchor="middle">
                                        Customer Terminal
                                    </text>
                                </g>

                                <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y}) rotate(${vehiclePos.angle})`}>
                                    <circle r="22" fill="#3B82F6" opacity="0.2" className="animate-pulse" />
                                    <circle r="14" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="2.5" />
                                    <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#FFFFFF" />
                                    <circle cx="5" cy="0" r="2" fill="#D97706" />
                                </g>

                                <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y - 30})`}>
                                    <rect x="-35" y="-12" width="70" height="20" rx="5" fill="#000000" stroke="#38BDF8" strokeWidth="1" />
                                    <text x="0" y="1.5" fill="#38BDF8" fontSize="9" fontWeight="black" textAnchor="middle">
                                        {liveSpeed} KM/H
                                    </text>
                                </g>
                            </svg>

                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span className="text-emerald-400 font-bold">GPS TELEMETRY ACTIVE</span>
                                </div>
                                <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 font-semibold">
                                    Waypoint: <span className="text-white font-bold">{currentWaypointName}</span>
                                </div>
                            </div>

                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTraffic(!showTraffic)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        showTraffic
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "bg-black/75 text-slate-300 hover:bg-slate-800"
                                    }`}
                                >
                                    Traffic: {showTraffic ? "ON" : "OFF"}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-[#0B1329] border-t border-[#1E293B] space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-blue-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span>Pause Sim</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                                <span>Play Sim</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1 bg-[#1E293B] p-0.5 rounded-lg border border-[#334155]">
                                        {[1, 2, 5].map((spd) => (
                                            <button
                                                key={spd}
                                                type="button"
                                                onClick={() => setSimSpeed(spd)}
                                                className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer ${
                                                    simSpeed === spd ? "bg-primary text-white" : "text-slate-400 hover:text-white"
                                                }`}
                                            >
                                                {spd}x
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-slate-400">Route Progress: </span>
                                    <span className="text-emerald-400 font-mono font-bold">{Math.round(progress)}% Complete</span>
                                </div>
                            </div>

                            <div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-slate-700 rounded-lg cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                                <div className="bg-[#1E293B] p-2 rounded-xl border border-[#334155]">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle Speed</span>
                                    <span className="text-sm font-black text-white font-mono">{liveSpeed} KM/H</span>
                                </div>
                                <div className="bg-[#1E293B] p-2 rounded-xl border border-[#334155]">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">GPS Accuracy</span>
                                    <span className="text-sm font-black text-emerald-400 font-mono">18 SATS (99.8%)</span>
                                </div>
                                <div className="bg-[#1E293B] p-2 rounded-xl border border-[#334155]">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cargo Temp</span>
                                    <span className="text-sm font-black text-white font-mono">24.2 °C</span>
                                </div>
                                <div className="bg-[#1E293B] p-2 rounded-xl border border-[#334155]">
                                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Security Seal</span>
                                    <span className="text-sm font-black text-emerald-400 font-mono">SL-99381-OK</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 p-5 bg-[#0F172A] flex flex-col justify-between space-y-4 text-xs">
                        <div className="space-y-4">
                            <div className="bg-[#1E293B] p-4 rounded-xl border border-[#334155] space-y-3">
                                <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                                        Carrier & Tanker Telematics
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-[10px] font-bold">
                                        DH-METRO-TA-4491
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-black text-base shrink-0">
                                        MR
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-sm text-white">Md. Rafiqul Islam</h4>
                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                                4.9 Rating
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Certified Hazardous Cargo Logistics Lead
                                        </p>
                                        <p className="text-[10px] text-emerald-400 font-mono">
                                            1,420+ Safe Dispatches Completed
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setCallAlert("Dispatching secure carrier radio call to Md. Rafiqul Islam (+880 1711-449182)...")}
                                        className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>Call Driver</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCallAlert("Emergency dispatch coordination center notified for Order #" + order.id)}
                                        className="py-2 rounded-lg bg-[#334155] hover:bg-slate-600 text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>Emergency</span>
                                    </button>
                                </div>

                                {callAlert && (
                                    <div className="p-2 rounded bg-blue-900/50 border border-blue-500/50 text-[11px] text-blue-200 animate-fadeIn">
                                        {callAlert}
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#1E293B] p-4 rounded-xl border border-[#334155] space-y-2.5">
                                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block border-b border-[#334155] pb-1.5">
                                    Fuel Cargo & Route Details
                                </span>

                                <div className="space-y-1.5 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Product:</span>
                                        <span className="font-bold text-white">{order.product?.name || "Petroleum Grade Fuel"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Cargo Volume:</span>
                                        <span className="font-bold text-amber-400">{order.quantity} Barrels / Units</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Sourcing Partner:</span>
                                        <span className="font-bold text-white">{partnerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Origin Depot:</span>
                                        <span className="font-bold text-slate-300">{originLocation}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Delivery Destination:</span>
                                        <span className="font-bold text-emerald-400">{destinationLocation}</span>
                                    </div>
                                    {order.payment?.amount && (
                                        <div className="flex justify-between border-t border-[#334155] pt-1.5">
                                            <span className="text-slate-400">Payment Invoice:</span>
                                            <span className="font-bold text-emerald-400">${order.payment.amount} (Settled)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 rounded-xl bg-primary hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                            >
                                Back to Dashboard Orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
