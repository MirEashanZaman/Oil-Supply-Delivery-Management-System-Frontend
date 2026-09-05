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
            <MyHeader name="Contact Us" message="Get in touch with the Oil Supply & Delivery Management System team" />
            <MyNavigation />

            <div className="w-full max-w-5xl mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    {/* Left Column: Direct Contact Info */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="card bg-[#FFFFFF] shadow-md border border-[#E2E8F0] rounded-2xl">
                            <div className="card-body p-6">
                                <span className="badge bg-[#0F2747] text-[#F59E0B] font-bold uppercase tracking-wider text-xs px-3 py-1 mb-2">
                                    Support & Inquiries
                                </span>
                                <h2 className="text-xl font-bold text-[#1E293B]">Contact Directory</h2>
                                <p className="text-xs text-[#64748B] leading-relaxed mt-1">
                                    For order updates, dealership registration, supplier onboarding, and system assistance.
                                </p>

                                <div className="divide-y divide-[#E2E8F0] mt-4 text-xs">
                                    <div className="py-3 flex items-start gap-3">
                                        <div className="p-2.5 rounded-xl bg-[#0F2747]/10 text-[#0F2747] shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-[#1E293B] block">Central Headquarters</span>
                                            <span className="text-[#64748B]">Oil Supply & Delivery Operations Center, Kuril, Dhaka.</span>
                                        </div>
                                    </div>

                                    <div className="py-3 flex items-start gap-3">
                                        <div className="p-2.5 rounded-xl bg-[#F59E0B]/15 text-[#D97706] shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-[#1E293B] block">Phone Support</span>
                                            <span className="text-[#64748B]">+880 1700-000000 / +880 1800-000000</span>
                                        </div>
                                    </div>

                                    <div className="py-3 flex items-start gap-3">
                                        <div className="p-2.5 rounded-xl bg-[#16A34A]/15 text-[#16A34A] shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="font-bold text-[#1E293B] block">Email Inquiries</span>
                                            <span className="text-[#64748B]">support@oilsupply-delivery.com</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Working Hours Card */}
                        <div className="card bg-[#FFFFFF] shadow-sm border border-[#E2E8F0] rounded-2xl">
                            <div className="card-body p-5 text-xs text-[#64748B]">
                                <span className="font-bold text-[#1E293B] block mb-1">Office Hours</span>
                                <p>Customer support and order verification are available Sunday through Thursday, 9:00 AM to 6:00 PM.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive Inquiry Form */}
                    <div className="lg:col-span-7">
                        <div className="card bg-[#FFFFFF] shadow-md border border-[#E2E8F0] rounded-2xl">
                            <div className="card-body p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Send Us a Message</h2>
                                <p className="text-xs text-[#64748B]">Submit your question or order inquiry and our team will get back to you.</p>

                                {submitted && (
                                    <div role="alert" className="alert bg-[#16A34A] text-white shadow-sm mt-4 py-2.5 rounded-xl border-none text-xs">
                                        <svg className="w-4 h-4 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Message sent successfully! Our support representative will contact you soon.</span>
                                    </div>
                                )}

                                <form onSubmit={handleSend} className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="form-control w-full">
                                            <label className="label pb-1">
                                                <span className="label-text font-semibold text-[#1E293B]">Your Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                placeholder="e.g. Mohammad Ali"
                                                onChange={(e) => setName(e.target.value)}
                                                className="input input-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none rounded-xl"
                                            />
                                        </div>

                                        <div className="form-control w-full">
                                            <label className="label pb-1">
                                                <span className="label-text font-semibold text-[#1E293B]">Email Address</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                placeholder="user@example.com"
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input input-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-semibold text-[#1E293B]">Inquiry Type</span>
                                        </label>
                                        <select
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="select select-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none rounded-xl"
                                        >
                                            <option value="Bulk Procurement">Bulk Fuel Order / Purchasing</option>
                                            <option value="Spot Order Dispatch">Delivery & Schedule Inquiry</option>
                                            <option value="Dealership Application">Dealer Registration & Partnership</option>
                                            <option value="Logistics & Tanker Tracking">Supplier Onboarding</option>
                                            <option value="General Support">Technical & Account Support</option>
                                        </select>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label pb-1">
                                            <span className="label-text font-semibold text-[#1E293B]">Message</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={message}
                                            placeholder="Write your questions or order requirements here..."
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="textarea textarea-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none text-sm rounded-xl"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold w-full border-none shadow-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <span>Send Message</span>
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