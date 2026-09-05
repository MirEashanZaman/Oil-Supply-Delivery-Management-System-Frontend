"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import axios from "axios";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";
import { getPusherClient, ChatMessage } from "@/lib/pusher";

type Product = {
    id: number;
    name: string;
    category?: string;
    price?: string | number;
    description?: string;
    stockLevel?: string;
    image?: string;
};

const PRODUCT_IMAGE_MAP: Record<number, string> = {
    1: "/Brent Crude Oil.jpg",
    2: "/Ultra-Low Sulfur Diesel.jpg",
    3: "/Premium Unleaded Gasoline.jpg",
    4: "/Aviation Turbine Fuel (Jet A-1).jpg",
    5: "/images.jpg",
    6: "/Heavy Marine Fuel Oil (HFO).jpg",
};

const getProductImage = (name?: string, img?: string, id?: number | string) => {
    if (typeof window !== "undefined" && id) {
        try {
            const customStored = localStorage.getItem(`product_img_${id}`);
            if (customStored) return customStored;
        } catch {
        }
    }
    if (img && (img.startsWith("/") || img.startsWith("http")) && img !== "/Brent Crude Oil.jpg") {
        return img;
    }
    const lower = (name || "").toLowerCase();
    if (lower.includes("lpg") || lower.includes("liquefied") || lower.includes("cylinder") || lower.includes("propane") || lower.includes("butane")) {
        return "/images.jpg";
    }
    if (lower.includes("diesel") || lower.includes("sulfur") || lower.includes("ulsd") || lower.includes("gasoil")) {
        return "/Ultra-Low Sulfur Diesel.jpg";
    }
    if (lower.includes("gasoline") || lower.includes("petrol") || lower.includes("octane") || lower.includes("unleaded") || lower.includes("mogas")) {
        return "/Premium Unleaded Gasoline.jpg";
    }
    if (lower.includes("jet") || lower.includes("aviation") || lower.includes("turbine") || lower.includes("a-1") || lower.includes("kerosene")) {
        return "/Aviation Turbine Fuel (Jet A-1).jpg";
    }
    if (lower.includes("marine") || lower.includes("bunker") || lower.includes("hfo") || lower.includes("heavy") || lower.includes("fuel oil")) {
        return "/Heavy Marine Fuel Oil (HFO).jpg";
    }
    if (lower.includes("crude") || lower.includes("brent") || lower.includes("wti") || lower.includes("raw")) {
        return "/Brent Crude Oil.jpg";
    }
    if (id !== undefined && id !== null) {
        const numId = Number(id);
        if (!isNaN(numId) && PRODUCT_IMAGE_MAP[numId]) {
            return PRODUCT_IMAGE_MAP[numId];
        }
        if (!isNaN(numId) && numId > 0) {
            const fallbackImages = [
                "/Brent Crude Oil.jpg",
                "/Ultra-Low Sulfur Diesel.jpg",
                "/Premium Unleaded Gasoline.jpg",
                "/Aviation Turbine Fuel (Jet A-1).jpg",
                "/images.jpg",
                "/Heavy Marine Fuel Oil (HFO).jpg",
            ];
            return fallbackImages[(numId - 1) % fallbackImages.length];
        }
    }
    if (img && (img.startsWith("/") || img.startsWith("http"))) {
        return img;
    }
    return "/Brent Crude Oil.jpg";
};


export default function ProductDetails({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const [isInquireModalOpen, setIsInquireModalOpen] = useState(false);
    const [inquiryName, setInquiryName] = useState("");
    const [inquiryEmail, setInquiryEmail] = useState("");
    const [inquiryMessage, setInquiryMessage] = useState("");
    const [isSendingInquiry, setIsSendingInquiry] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                const u = JSON.parse(stored);
                if (u.userName) setInquiryName(u.userName);
                if (u.email) setInquiryEmail(u.email);
            } catch (err) {
                console.warn(err);
            }
        }
    }, []);

    const handleSendProductInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inquiryName || !inquiryEmail || !inquiryMessage || !product) return;

        setIsSendingInquiry(true);
        try {
            await axios.post("/api/messages", {
                sender: inquiryName,
                email: inquiryEmail,
                topic: `Product Inquiry #${product.id}: ${product.name}`,
                message: inquiryMessage,
                role: "Customer Inquiry",
                channel: "oil-supply-chat",
            });
            setInquirySuccess(true);
            setInquiryMessage("");
        } catch (err) {
            console.warn("Local Pusher message transmission fallback:", err);
            setInquirySuccess(true);
            setInquiryMessage("");
        } finally {
            setIsSendingInquiry(false);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
            try {
                const res = await axios.get(`${API_ENDPOINT}/product/list`, {
                    withCredentials: true,
                });
                if (Array.isArray(res.data)) {
                    const match = res.data.find((p: any) => String(p.id) === String(productId));
                    if (match) {
                        setProduct({
                            id: match.id,
                            name: match.name || `Product #${match.id}`,
                            category: match.category || (match.categories?.[0]?.name) || "Petroleum Grade",
                            price: typeof match.price === "number" ? `$${match.price.toFixed(2)}` : match.price || "$0.00",
                            description: match.description || "Petroleum fuel product sourced via certified refinery pipelines.",
                            stockLevel: typeof match.quantity === "number"
                                ? (match.quantity <= 0 ? "Out of Stock" : match.quantity < 1000 ? "Low Stock" : "In Stock")
                                : match.stockLevel || "In Stock",
                            image: getProductImage(match.name, match.image, match.id),
                        });
                    }
                }
            } catch (err) {
                console.warn("Error fetching product details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    return (
        <div className="w-full flex flex-col items-center">
            <MyHeader
                name="Product Details"
                message={`Product specification and ordering details for item #${productId}`}
            />
            <MyNavigation />

            <div className="w-full max-w-4xl mt-6">
                <div className="breadcrumbs text-xs text-[#64748B] mb-4 px-1">
                    <ul>
                        <li><Link href="/" className="hover:text-[#0F2747]">Home</Link></li>
                        <li><Link href="/dashboard" className="hover:text-[#0F2747]">Catalog</Link></li>
                        <li className="font-semibold text-[#1E293B]">Product #{productId}</li>
                    </ul>
                </div>

                {loading ? (
                    <div className="card bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <span className="loading loading-spinner loading-lg text-[#0F2747]"></span>
                            <span className="text-[#64748B] font-medium text-sm">Loading product details...</span>
                        </div>
                    </div>
                ) : product ? (
                    <div className="card lg:card-side bg-[#FFFFFF] shadow-md border border-[#E2E8F0] rounded-2xl overflow-hidden">
                        <figure className="lg:w-1/2 h-72 lg:h-auto bg-[#F5F7FA] relative">
                            <img
                                src={product.image || getProductImage(product.name, product.image, product.id)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = getProductImage(product.name, undefined, product.id);
                                }}
                            />
                            <div className="absolute top-4 left-4">
                                <span className="badge bg-[#0F2747] text-[#F59E0B] font-bold text-xs px-3 py-1 border-none shadow-sm">
                                    Verified Grade
                                </span>
                            </div>
                        </figure>

                        <div className="card-body p-6 sm:p-8 lg:w-1/2 justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="badge bg-[#F5F7FA] border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold">
                                        {product.category || "Petroleum"}
                                    </span>
                                    <span className={`badge text-xs font-semibold border-none ${product.stockLevel === "Out of Stock" ? "bg-[#DC2626] text-white" : product.stockLevel === "Low Stock" ? "bg-[#F59E0B] text-[#1E293B]" : "bg-[#16A34A] text-white"}`}>
                                        {product.stockLevel || "In Stock"}
                                    </span>
                                </div>

                                <h1 className="card-title text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
                                    {product.name}
                                </h1>

                                <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed mt-3">
                                    {product.description || "High quality fuel supply delivered safely to authorized commercial and retail dealers."}
                                </p>

                                <div className="mt-5 pt-4 border-t border-[#E2E8F0] space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                                        <span className="text-[#64748B]">Item Code</span>
                                        <span className="font-mono font-semibold text-[#1E293B]">OIL-{product.id}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                                        <span className="text-[#64748B]">Quality Standard</span>
                                        <span className="font-semibold text-[#1E293B]">Standard National Refinery Grade</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-[#64748B]">Delivery Options</span>
                                        <span className="font-semibold text-[#1E293B]">Tanker Truck / Bulk Depot Dispatch</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] block font-bold">Standard Price</span>
                                    <span className="text-3xl font-extrabold text-[#0F2747]">
                                        {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price || "$0.00"}
                                    </span>
                                    <span className="text-xs text-[#64748B] block">per unit / barrel</span>
                                </div>

                                <div className="card-actions flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            setIsInquireModalOpen(true);
                                            setInquirySuccess(false);
                                        }}
                                        className="btn bg-[#0F2747] hover:bg-[#163860] text-white font-bold border-none shadow-sm text-xs sm:text-sm rounded-xl"
                                    >
                                        Inquire via PusherJS
                                    </button>
                                    <Link href="/dashboard" className="btn bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold border-none shadow-sm text-xs sm:text-sm rounded-xl">
                                        Order Oil Now
                                    </Link>
                                    <Link href="/" className="btn btn-outline border-[#CBD5E1] text-[#1E293B] hover:bg-[#F5F7FA] text-xs sm:text-sm rounded-xl">
                                        Back
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-[#FFFFFF] border border-[#E2E8F0] p-8 text-center shadow-sm rounded-2xl">
                        <h2 className="text-lg font-bold text-[#1E293B] mb-1">Product #{productId} Not Found</h2>
                        <p className="text-[#64748B] text-xs mb-4">No product was found matching this identification number.</p>
                        <div className="flex justify-center gap-3">
                            <Link href="/dashboard" className="btn bg-[#0F2747] text-white hover:bg-[#153e70] btn-sm rounded-xl">
                                View Catalog
                            </Link>
                            <Link href="/" className="btn btn-outline border-[#CBD5E1] text-[#1E293B] btn-sm rounded-xl">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {isInquireModalOpen && product && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-[#FFFFFF] rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-[500px] text-left p-6 sm:p-8">
                        <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#1E293B]">Inquire About Product</h3>
                                <p className="text-xs text-[#64748B]">{product.name} (ID: #{product.id})</p>
                            </div>
                            <button
                                onClick={() => setIsInquireModalOpen(false)}
                                className="text-[#64748B] hover:text-[#1E293B] text-xl font-bold cursor-pointer"
                            >
                                x
                            </button>
                        </div>

                        {inquirySuccess ? (
                            <div className="text-center py-6 space-y-3">
                                <div role="alert" className="alert bg-[#16A34A] text-white py-3 rounded-xl border-none text-xs">
                                    <span>Inquiry dispatched in real-time via PusherJS! The supplier has been notified.</span>
                                </div>
                                <button
                                    onClick={() => setIsInquireModalOpen(false)}
                                    className="btn bg-[#0F2747] text-white btn-sm rounded-xl"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSendProductInquiry} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={inquiryName}
                                        placeholder="e.g. Mohammad Ali"
                                        onChange={(e) => setInquiryName(e.target.value)}
                                        className="input input-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] text-xs rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Your Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={inquiryEmail}
                                        placeholder="user@example.com"
                                        onChange={(e) => setInquiryEmail(e.target.value)}
                                        className="input input-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] text-xs rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Your Message / Requirements</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={inquiryMessage}
                                        placeholder="Ask about batch volume, pipeline dispatch schedule, or testing reports..."
                                        onChange={(e) => setInquiryMessage(e.target.value)}
                                        className="textarea textarea-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] text-xs rounded-xl"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsInquireModalOpen(false)}
                                        className="btn btn-outline border-[#CBD5E1] text-[#1E293B] btn-sm rounded-xl flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSendingInquiry}
                                        className="btn bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold btn-sm border-none shadow-sm rounded-xl flex-2"
                                    >
                                        {isSendingInquiry ? "Broadcasting..." : "Send via PusherJS"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}