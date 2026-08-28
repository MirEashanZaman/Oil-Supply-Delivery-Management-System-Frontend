"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

type UserData = {
    email: string;
    userName?: string;
    phoneNumber?: string;
    address?: string;
    title?: string;
};

type Product = {
    id: number;
    name: string;
    category: string;
    price: string;
    description: string;
    inStock: boolean;
    stockLevel: "In Stock" | "Low Stock" | "Out of Stock";
};

const DUMMY_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Brent Crude Oil",
        category: "Crude Fuel",
        price: "$82.50 / Barrel",
        description: "High-quality sweet light crude oil sourced from international marine drillings.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 2,
        name: "Ultra-Low Sulfur Diesel",
        category: "Refined Diesel",
        price: "$3.20 / Gallon",
        description: "Clean-burning commercial diesel fuel with high thermal output properties.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 3,
        name: "Premium Unleaded Gasoline",
        category: "Refined Gasoline",
        price: "$3.85 / Gallon",
        description: "High-octane gasoline suitable for high-performance automotive engines.",
        inStock: true,
        stockLevel: "Low Stock",
    },
    {
        id: 4,
        name: "Aviation Turbine Fuel (Jet A-1)",
        category: "Aviation Fuel",
        price: "$2.95 / Litre",
        description: "Kerosene-type jet fuel manufactured to rigorous international safety standards.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 5,
        name: "Liquefied Petroleum Gas (LPG)",
        category: "Liquefied Gas",
        price: "$1.80 / kg",
        description: "Clean flammable hydrocarbon gas mixture utilized as heating and cooking fuel.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 6,
        name: "Synthetic Motor Lubricant",
        category: "Industrial Lubricant",
        price: "$45.00 / Canister",
        description: "Premium synthetic engine lubricant reducing friction and industrial wear.",
        inStock: false,
        stockLevel: "Out of Stock",
    },
];

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-soft-gray text-dark-slate">
                <p className="font-semibold text-lg">Loading Dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <>
                <MyHeader name="Dashboard" message="unauthorized access!" />
                <MyNavigation />
                <div className="mt-5 w-full max-w-[500px] bg-card-white p-6 rounded-lg border border-red-200 shadow-md text-center">
                    <h2 className="text-error-red text-xl font-bold mb-4">Access Denied</h2>
                    <p className="text-secondary-gray mb-5">Please login first to view your dashboard.</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="bg-primary text-white border-none py-2 px-4 rounded cursor-pointer font-semibold"
                    >
                        Go to Login
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <MyHeader name="Dashboard" message="view our products catalog!" />
            <MyNavigation />

            {/* Profile Bar / Header Welcome Banner */}
            <div className="w-full max-w-[1200px] bg-card-white border border-[#E2E8F0] shadow-sm rounded-lg p-5 mb-6 flex flex-col md:flex-row items-center justify-between text-left gap-4">
                <div>
                    <h2 className="text-xl font-bold text-dark-slate">
                        Welcome back, {user.userName || user.email}!
                    </h2>
                    <p className="text-sm text-secondary-gray">
                        Category: <strong className="text-primary">{user.title || "Customer"}</strong> | Email: {user.email}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-error-red text-white py-2 px-6 rounded cursor-pointer font-semibold text-sm hover:bg-error-red/90 transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* Product Catalog Grid Container */}
            <div className="w-full max-w-[1200px] text-left">
                <h1 className="text-2xl font-extrabold text-dark-slate mb-6">Our Products</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DUMMY_PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className="bg-card-white rounded-lg border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                        >
                            {/* Card Decorative Color Header */}
                            <div className="h-2 bg-primary w-full" />
                            
                            <div className="p-5 flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                                        {product.category}
                                    </span>
                                    <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                            product.stockLevel === "In Stock"
                                                ? "bg-green-100 text-success-green"
                                                : product.stockLevel === "Low Stock"
                                                ? "bg-amber-100 text-secondary"
                                                : "bg-red-100 text-error-red"
                                        }`}
                                    >
                                        {product.stockLevel}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-dark-slate mb-2">
                                    {product.name}
                                </h3>
                                
                                <p className="text-sm text-secondary-gray mb-4 line-clamp-3">
                                    {product.description}
                                </p>
                            </div>

                            <div className="p-5 border-t border-[#F1F5F9] bg-[#FAFBFD] flex items-center justify-between">
                                <span className="text-base font-extrabold text-primary">
                                    {product.price}
                                </span>
                                <button
                                    disabled={product.stockLevel === "Out of Stock"}
                                    onClick={() => alert(`Ordering ${product.name}...`)}
                                    className={`py-1.5 px-4 rounded text-sm font-semibold transition-colors ${
                                        product.stockLevel === "Out of Stock"
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-primary text-white hover:bg-primary/95 cursor-pointer"
                                    }`}
                                >
                                    Order Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
