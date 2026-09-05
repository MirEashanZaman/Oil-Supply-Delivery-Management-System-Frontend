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
                name="Product Inventory"
                message={`Live certified petroleum specification for item #${productId}`}
            />
            <MyNavigation />

            <div className="w-full max-w-4xl mt-8">
                {/* Breadcrumbs */}
                <div className="breadcrumbs text-xs text-slate-500 mb-4 px-1">
                    <ul>
                        <li><Link href="/" className="hover:text-primary">Home</Link></li>
                        <li><Link href="/dashboard" className="hover:text-primary">Catalog</Link></li>
                        <li className="font-semibold text-slate-800">Product #{productId}</li>
                    </ul>
                </div>

                {loading ? (
                    <div className="card bg-base-100 border border-base-300 shadow-md p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <span className="text-slate-600 font-medium text-sm">Querying refinery inventory database...</span>
                        </div>
                    </div>
                ) : product ? (
                    <div className="card lg:card-side bg-base-100 shadow-xl border border-base-300 overflow-hidden">
                        <figure className="lg:w-1/2 h-72 lg:h-auto bg-slate-100 relative">
                            <img
                                src={product.image || "/Brent Crude Oil.jpg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/Brent Crude Oil.jpg";
                                }}
                            />
                            <div className="absolute top-4 left-4">
                                <span className="badge badge-primary font-bold shadow-md text-xs">
                                    Certified Spec
                                </span>
                            </div>
                        </figure>

                        <div className="card-body p-6 sm:p-8 lg:w-1/2 justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="badge badge-ghost border-slate-300 text-slate-700 text-xs font-semibold">
                                        {product.category || "Petroleum Grade"}
                                    </span>
                                    <span className={`badge text-xs font-semibold ${product.stockLevel === "Out of Stock" ? "badge-error text-white" : product.stockLevel === "Low Stock" ? "badge-warning text-slate-900" : "badge-success text-white"}`}>
                                        {product.stockLevel || "In Stock"}
                                    </span>
                                </div>

                                <h1 className="card-title text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    {product.name}
                                </h1>

                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-3">
                                    {product.description || "Petroleum fuel product sourced via certified refinery pipelines with standardized viscosity and flash point testing."}
                                </p>

                                {/* Quick Spec Sheet */}
                                <div className="mt-5 pt-4 border-t border-base-300 space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-base-200">
                                        <span className="text-slate-500">Registry Identifier</span>
                                        <span className="font-mono font-semibold text-slate-800">PETRO-SKU-{product.id}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-base-200">
                                        <span className="text-slate-500">Handling Certification</span>
                                        <span className="font-semibold text-slate-800">ISO 8217 / ASTM D975</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-500">Transit Mode</span>
                                        <span className="font-semibold text-slate-800">Pipeline / Dedicated Tanker</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-bold">Base Benchmark</span>
                                    <span className="text-3xl font-black text-primary">
                                        {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price || "$0.00"}
                                    </span>
                                    <span className="text-xs text-slate-500 block">per metric barrel / unit</span>
                                </div>

                                <div className="card-actions flex-nowrap gap-2">
                                    <Link href="/dashboard" className="btn btn-primary text-white shadow-md font-semibold text-xs sm:text-sm">
                                        Procure in Dashboard
                                    </Link>
                                    <Link href="/" className="btn btn-outline border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs sm:text-sm">
                                        Back
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card bg-base-100 border border-base-300 p-8 text-center shadow-md">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Product #{productId} Not Found</h2>
                        <p className="text-slate-500 text-xs mb-4">No active refinery inventory record corresponds to this ID.</p>
                        <div className="flex justify-center gap-3">
                            <Link href="/dashboard" className="btn btn-primary btn-sm text-white">
                                View Full Catalog
                            </Link>
                            <Link href="/" className="btn btn-outline btn-sm">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}