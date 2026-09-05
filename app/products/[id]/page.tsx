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
                const res = await axios.get(`${API_ENDPOINT}/customer/products`, {
                    withCredentials: true,
                });
                if (Array.isArray(res.data)) {
                    const match = res.data.find((p: any) => String(p.id) === String(productId));
                    if (match) {
                        setProduct(match);
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
        <div className="w-full max-w-[800px] flex flex-col items-center">
            <MyHeader
                name="Product Details"
                message={`Live inventory record for item #${productId}`}
            />
            <MyNavigation />

            {loading ? (
                <div className="p-8 text-center animate-pulse text-dark-slate font-medium">
                    Loading product details...
                </div>
            ) : product ? (
                <div className="card bg-base-100 w-full shadow-lg border border-[#E2E8F0] overflow-hidden mt-4 text-left">
                    <figure className="h-64 w-full overflow-hidden bg-slate-100">
                        <img
                            src={product.image || "/Brent Crude Oil.jpg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/Brent Crude Oil.jpg";
                            }}
                        />
                    </figure>
                    <div className="card-body p-6">
                        <div className="flex items-center justify-between">
                            <span className="badge badge-outline text-xs font-semibold px-2.5 py-1 rounded bg-[#F1F5F9] text-secondary-gray">
                                {product.category || "Petroleum Grade"}
                            </span>
                            <span className="badge badge-success text-white text-xs font-semibold px-2 py-0.5 rounded">
                                {product.stockLevel || "In Stock"}
                            </span>
                        </div>
                        <h1 className="card-title text-2xl font-bold text-dark-slate mt-2">{product.name}</h1>
                        <p className="text-secondary-gray mt-2 text-sm leading-relaxed">
                            {product.description || "Petroleum fuel product sourced via certified refinery pipelines."}
                        </p>
                        
                        <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                            <div>
                                <span className="text-xs text-secondary-gray block font-semibold">Unit Price</span>
                                <span className="text-2xl font-extrabold text-primary">
                                    {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price || "$0.00"}
                                </span>
                            </div>
                            <div className="card-actions justify-end gap-3">
                                <Link href="/dashboard" className="btn btn-primary">
                                    Order via Dashboard
                                </Link>
                                <Link href="/" className="btn btn-outline">
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-card-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm w-full mt-4">
                    <h2 className="text-lg font-bold text-dark-slate mb-2">Product #{productId}</h2>
                    <p className="text-secondary-gray text-sm mb-4">No database record found for this product identifier.</p>
                    <div className="flex justify-center gap-3">
                        <Link href="/dashboard" className="btn btn-primary btn-sm">
                            View All Catalog Products
                        </Link>
                        <Link href="/" className="btn btn-outline btn-sm">
                            Back to Home
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}