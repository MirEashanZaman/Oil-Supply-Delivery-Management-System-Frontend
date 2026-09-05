"use client";

import { useState } from "react";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

export default function ContactInfo() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState("Bulk Procurement");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
    };

    return (
        <div className="w-full flex flex-col items-center">
            <MyHeader name="Contact Us" message="Connect with our global dispatch center and procurement team" />
            <MyNavigation />

            <div className="w-full max-w-5xl mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Logistics Support Directory */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="card bg-base-100 shadow-md border border-base-300">
                            <div className="card-body p-6">
                                <span className="badge badge-primary badge-outline text-xs font-bold uppercase tracking-wider mb-2">
                                    Direct Coordination
                                </span>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Logistics Command Center</h2>
                                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                                    For active tanker vessel tracking, terminal pipeline coordination, and emergency shipment re-routing.
                                </p>

                                <div className="divide-y divide-base-300 mt-4 text-xs">
                                    <div className="py-3 flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-900 block">Terminal Headquarters</span>
                                            <span className="text-slate-500">100 Harbour Gateway, Energy District Suite 400</span>
                                        </div>
                                    </div>

                                    <div className="py-3 flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-900 block">24/7 Operations Hotline</span>
                                            <span className="text-slate-500">+1 (800) 555-PETRO / +1 (800) 555-7387</span>
                                        </div>
                                    </div>

                                    <div className="py-3 flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-900 block">Supply Inquiries</span>
                                            <span className="text-slate-500">operations@petroflow-network.internal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operational Hours Card */}
                        <div className="card bg-base-200/60 border border-base-300">
                            <div className="card-body p-5 text-xs text-slate-600">
                                <span className="font-bold text-slate-900 block mb-1">Standard Dispatch Window</span>
                                <p>Pipeline pumping & bulk marine tanker offloading occurs 24 hours daily, 365 days per year under automated SCADA surveillance.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive Dispatch / Inquiry Form */}
                    <div className="lg:col-span-7">
                        <div className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transmit Official Inquiry</h2>
                                <p className="text-xs text-slate-500">Submit requests directly to our regional petroleum allocation officers.</p>

                                {submitted && (
                                    <div role="alert" className="alert alert-success text-xs shadow-sm mt-3 py-2.5">
                                        <svg className="w-4 h-4 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Inquiry logged successfully. An operations officer will respond within 4 business hours.</span>
                                    </div>
                                )}

                                <form onSubmit={handleSend} className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="form-control w-full">
                                            <label className="label pb-1">
                                                <span className="label-text font-semibold text-slate-700">Your Full Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                placeholder="e.g. Captain Alex Mercer"
                                                onChange={(e) => setName(e.target.value)}
                                                className="input input-bordered w-full focus:outline-primary"
                                            />
                                        </div>

                                        <div className="form-control w-full">
                                            <label className="label pb-1">
                                                <span className="label-text font-semibold text-slate-700">Corporate Email</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                placeholder="mercer@fleet-energy.com"
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input input-bordered w-full focus:outline-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-semibold text-slate-700">Inquiry Scope</span>
                                        </label>
                                        <select
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="select select-bordered w-full focus:outline-primary"
                                        >
                                            <option value="Bulk Procurement">Bulk Procurement & Refinery Allocation</option>
                                            <option value="Spot Order Dispatch">Spot Order Dispatch & Immediate Delivery</option>
                                            <option value="Dealership Application">Dealership & Distribution Application</option>
                                            <option value="Logistics & Tanker Tracking">Logistics & Tanker Route Telemetry</option>
                                            <option value="Quality & Certifications">Quality Inspection & Lab Test Certifications</option>
                                        </select>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-semibold text-slate-700">Detailed Message / Order Parameters</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={message}
                                            placeholder="Specify fuel grade (e.g. ULSD 10ppm, Brent Crude, Jet A-1), approximate volume (metric tons / barrels), delivery port, and requested schedule..."
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="textarea textarea-bordered w-full focus:outline-primary text-sm"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full shadow-md text-white font-semibold flex items-center justify-center gap-2"
                                    >
                                        <span>Dispatch Transmission</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}