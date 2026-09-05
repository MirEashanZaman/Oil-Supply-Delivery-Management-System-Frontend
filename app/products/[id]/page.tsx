"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import axios from "axios";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

type Product = {
    id: number;
    name: string;
    category?: string;
    price?: string | number;
    description?: string;
    stockLevel?: string;
    image?: string;
};

const getProductImage = (name?: string, img?: string) => {
    if (img && (img.startsWith("/") || img.startsWith("http"))) return img;
    if (!name) return "/Brent Crude Oil.jpg";
    const lower = name.toLowerCase();
    if (lower.includes("crude") || lower.includes("brent")) return "/Brent Crude Oil.jpg";
    if (lower.includes("diesel")) return "/Ultra-Low Sulfur Diesel.jpg";
    if (lower.includes("gasoline") || lower.includes("petrol") || lower.includes("octane")) return "/Premium Unleaded Gasoline.jpg";
    if (lower.includes("jet") || lower.includes("aviation") || lower.includes("turbine")) return "/Aviation Turbine Fuel (Jet A-1).jpg";
    if (lower.includes("lpg") || lower.includes("gas") || lower.includes("cylinder")) return "/images.jpg";
    if (lower.includes("heavy") || lower.includes("marine") || lower.includes("bunker") || lower.includes("hfo")) return "/Heavy Marine Fuel Oil (HFO).jpg";
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
                            image: getProductImage(match.name, match.image),
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
                {/* Breadcrumbs */}
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
                                src={product.image || "/Brent Crude Oil.jpg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/Brent Crude Oil.jpg";
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

                                {/* Quick Spec Sheet */}
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

                                <div className="card-actions flex-nowrap gap-2">
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
        </div>
    );
}