"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MyHeader from "@/components/header";
import MyNavigation from "@/components/navigation";

type CarouselProduct = {
    id: number;
    name: string;
    category: string;
    price: string;
    description: string;
    stockLevel: string;
    image: string;
};

const FEATURED_PRODUCTS: CarouselProduct[] = [
    {
        id: 1,
        name: "Brent Crude Oil",
        category: "Crude Fuel",
        price: "$82.50 / Barrel",
        description: "High-quality sweet light crude oil sourced from international marine drillings.",
        stockLevel: "In Stock",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 2,
        name: "Ultra-Low Sulfur Diesel",
        category: "Refined Diesel",
        price: "$3.20 / Gallon",
        description: "Clean-burning commercial diesel fuel with high thermal output properties.",
        stockLevel: "In Stock",
        image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 3,
        name: "Premium Unleaded Gasoline",
        category: "Refined Gasoline",
        price: "$3.85 / Gallon",
        description: "High-octane gasoline suitable for high-performance automotive engines.",
        stockLevel: "Low Stock",
        image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 4,
        name: "Aviation Turbine Fuel (Jet A-1)",
        category: "Aviation Fuel",
        price: "$2.95 / Litre",
        description: "Kerosene-type jet fuel manufactured to rigorous international safety standards.",
        stockLevel: "In Stock",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 5,
        name: "Liquefied Petroleum Gas (LPG)",
        category: "Liquefied Gas",
        price: "$1.80 / kg",
        description: "Clean flammable hydrocarbon gas mixture utilized as heating and cooking fuel.",
        stockLevel: "In Stock",
        image: "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: 6,
        name: "Heavy Marine Fuel Oil (HFO)",
        category: "Bunker Fuel",
        price: "$620.00 / Ton",
        description: "Residual fuel oil blended for international ocean freight and industrial boiler usage.",
        stockLevel: "In Stock",
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
    },
];

const HERO_SLIDES = [
    {
        id: 1,
        title: "Enterprise Petroleum & Oil Delivery Network",
        tagline: "Direct refinery sourcing, certified pipeline distribution, and automated logistics tracking.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
        badge: "Direct Sourcing Channel",
    },
    {
        id: 2,
        title: "Wholesale & Fleet Tanker Dispatch System",
        tagline: "Connecting refinery suppliers, licensed regional dealers, and industrial consumers seamlessly.",
        image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=1400&q=80",
        badge: "Real-time Telemetry",
    },
    {
        id: 3,
        title: "Instant Invoicing & Integrated Checkout",
        tagline: "Pay with secure card processing, choose dealer or supplier origin, and track deliveries 24/7.",
        image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=1400&q=80",
        badge: "Zero Intermediary Fees",
    },
];

export default function Home() {
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isMarqueeMode, setIsMarqueeMode] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-advance hero carousel from right to left every 4 seconds
    useEffect(() => {
        if (!isAutoPlay) return;
        const timer = setInterval(() => {
            setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isAutoPlay]);

    // Manual scroll handlers for product carousel
    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 380;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="w-full max-w-[1240px] flex flex-col items-center">
            <MyHeader name="Home" message="Welcome to our home page!" />
            <MyNavigation />

            {/* Welcome Greeting Banner */}
            <div className="w-full bg-gradient-to-r from-primary to-[#1A3A60] text-white rounded-xl p-6 shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider bg-secondary/20 text-secondary px-3 py-1 rounded border border-secondary/30">
                        Oil Supply & Delivery Platform
                    </span>
                    <h1 className="text-2xl md:text-3xl font-extrabold mt-2">Welcome Eshu!</h1>
                    <p className="text-sm text-slate-300 mt-1 max-w-xl">
                        Streamlining international fuel trade with direct sourcing from refinery suppliers and certified dealer distribution.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard"
                        className="btn btn-primary bg-secondary hover:bg-secondary/90 text-dark-slate font-bold border-none shadow-md px-6"
                    >
                        Go to Dashboard →
                    </Link>
                    <Link
                        href="/login"
                        className="btn btn-outline text-white border-white/40 hover:bg-white/10"
                    >
                        Sign In
                    </Link>
                </div>
            </div>

            {/* DAISYUI HERO CAROUSEL (SLIDES FROM RIGHT TO LEFT) */}
            <div className="w-full mb-12">
                <div className="flex items-center justify-between mb-3 px-1 text-left">
                    <div>
                        <h2 className="text-xl font-extrabold text-dark-slate flex items-center gap-2">
                            <span>Operations Showcase</span>
                            <span className="badge badge-primary badge-sm text-[11px] font-bold">Auto-Slides Right to Left</span>
                        </h2>
                        <p className="text-xs text-secondary-gray">DaisyUI Full-Width Interactive Hero Carousel</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className="btn btn-xs btn-ghost text-xs text-secondary-gray cursor-pointer"
                        >
                            {isAutoPlay ? "⏸ Pause Auto-Slide" : "▶ Resume Auto-Slide"}
                        </button>
                    </div>
                </div>

                <div className="carousel w-full rounded-2xl shadow-xl overflow-hidden relative bg-black h-[360px] md:h-[420px]">
                    {HERO_SLIDES.map((slide, idx) => (
                        <div
                            key={slide.id}
                            className={`carousel-item absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                                idx === currentHeroSlide
                                    ? "opacity-100 translate-x-0 z-10"
                                    : idx < currentHeroSlide
                                    ? "opacity-0 -translate-x-full z-0"
                                    : "opacity-0 translate-x-full z-0"
                            }`}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover brightness-50"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-12 text-left text-white">
                                <span className="text-xs font-bold uppercase tracking-wider text-secondary mb-2 bg-secondary/10 w-fit px-3 py-1 rounded border border-secondary/20">
                                    {slide.badge}
                                </span>
                                <h3 className="text-2xl md:text-4xl font-extrabold max-w-2xl leading-tight">
                                    {slide.title}
                                </h3>
                                <p className="text-sm md:text-base text-slate-200 mt-2 max-w-xl">
                                    {slide.tagline}
                                </p>
                                <div className="mt-4 flex gap-3">
                                    <Link href="/dashboard" className="btn btn-primary btn-sm md:btn-md shadow-lg">
                                        Explore Products
                                    </Link>
                                    <Link href="/about" className="btn btn-outline btn-sm md:btn-md text-white border-white/50 hover:bg-white/20">
                                        Learn Logistics
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* DaisyUI Carousel Arrow Controls */}
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
                        <button
                            onClick={() => setCurrentHeroSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
                            className="btn btn-circle btn-sm md:btn-md bg-black/60 hover:bg-black text-white border-none pointer-events-auto shadow-md cursor-pointer"
                            aria-label="Previous Slide"
                        >
                            ❮
                        </button>
                        <button
                            onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                            className="btn btn-circle btn-sm md:btn-md bg-black/60 hover:bg-black text-white border-none pointer-events-auto shadow-md cursor-pointer"
                            aria-label="Next Slide"
                        >
                            ❯
                        </button>
                    </div>

                    {/* Indicator Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {HERO_SLIDES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentHeroSlide(idx)}
                                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                                    idx === currentHeroSlide ? "bg-secondary w-8" : "bg-white/50 hover:bg-white"
                                }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* DAISYUI PRODUCT CAROUSEL (ITEMS STREAM RIGHT TO LEFT) */}
            <div className="w-full mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 px-1 text-left gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-2xl font-extrabold text-dark-slate">
                                Featured Oil Products & Energy Grades
                            </h2>
                            <span className="badge badge-success badge-sm text-white text-[11px] font-bold">
                                Right → Left Stream
                            </span>
                        </div>
                        <p className="text-xs text-secondary-gray mt-0.5">
                            Items stream from right to left. Hover over any product card to pause and inspect details.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMarqueeMode(!isMarqueeMode)}
                            className="btn btn-xs rounded-md border border-[#E2E8F0] bg-white text-dark-slate hover:bg-slate-100 cursor-pointer text-xs"
                        >
                            {isMarqueeMode ? "Switch to Manual Mode" : "Switch to Auto Stream (RTL)"}
                        </button>
                        {!isMarqueeMode && (
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleScroll("left")}
                                    className="btn btn-circle btn-xs bg-white border border-[#E2E8F0] hover:bg-slate-100 text-dark-slate cursor-pointer"
                                    title="Scroll Left"
                                >
                                    ❮
                                </button>
                                <button
                                    onClick={() => handleScroll("right")}
                                    className="btn btn-circle btn-xs bg-white border border-[#E2E8F0] hover:bg-slate-100 text-dark-slate cursor-pointer"
                                    title="Scroll Right"
                                >
                                    ❯
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right-to-Left DaisyUI Carousel Container */}
                <div className="w-full bg-[#FAFBFD] border border-[#E2E8F0] rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden">
                    {isMarqueeMode ? (
                        /* Infinite Continuous Right-to-Left Stream */
                        <div className="carousel w-full overflow-hidden">
                            <div className="animate-carousel-rtl flex gap-6">
                                {/* First set of products */}
                                {FEATURED_PRODUCTS.map((product) => (
                                    <div key={`prod-1-${product.id}`} className="carousel-item">
                                        <div className="card bg-base-100 w-80 sm:w-96 shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-all text-left">
                                            <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";
                                                    }}
                                                />
                                            </figure>
                                            <div className="card-body p-5 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                                                            {product.category}
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                            product.stockLevel === "In Stock" ? "bg-green-100 text-success-green" : "bg-amber-100 text-secondary"
                                                        }`}>
                                                            {product.stockLevel}
                                                        </span>
                                                    </div>
                                                    <h2 className="card-title text-base sm:text-lg font-bold text-dark-slate mb-1">
                                                        {product.name}
                                                    </h2>
                                                    <p className="text-xs sm:text-sm text-secondary-gray line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                </div>

                                                <div className="pt-3 mt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                                                    <span className="text-sm sm:text-base font-extrabold text-primary">
                                                        {product.price}
                                                    </span>
                                                    <div className="card-actions justify-end">
                                                        <Link
                                                            href="/dashboard"
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Buy Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Duplicate set to ensure seamless infinite looping right-to-left */}
                                {FEATURED_PRODUCTS.map((product) => (
                                    <div key={`prod-2-${product.id}`} className="carousel-item">
                                        <div className="card bg-base-100 w-80 sm:w-96 shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-all text-left">
                                            <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";
                                                    }}
                                                />
                                            </figure>
                                            <div className="card-body p-5 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                                                            {product.category}
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                            product.stockLevel === "In Stock" ? "bg-green-100 text-success-green" : "bg-amber-100 text-secondary"
                                                        }`}>
                                                            {product.stockLevel}
                                                        </span>
                                                    </div>
                                                    <h2 className="card-title text-base sm:text-lg font-bold text-dark-slate mb-1">
                                                        {product.name}
                                                    </h2>
                                                    <p className="text-xs sm:text-sm text-secondary-gray line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                </div>

                                                <div className="pt-3 mt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                                                    <span className="text-sm sm:text-base font-extrabold text-primary">
                                                        {product.price}
                                                    </span>
                                                    <div className="card-actions justify-end">
                                                        <Link
                                                            href="/dashboard"
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Buy Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Manual Swipeable DaisyUI Carousel */
                        <div
                            ref={scrollContainerRef}
                            className="carousel carousel-center rounded-box w-full space-x-6 p-2 overflow-x-auto scroll-smooth"
                        >
                            {FEATURED_PRODUCTS.map((product) => (
                                <div key={product.id} className="carousel-item">
                                    <div className="card bg-base-100 w-80 sm:w-96 shadow-sm border border-[#E2E8F0] overflow-hidden text-left">
                                        <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp";
                                                }}
                                            />
                                        </figure>
                                        <div className="card-body p-5 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                                                        {product.category}
                                                    </span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                        product.stockLevel === "In Stock" ? "bg-green-100 text-success-green" : "bg-amber-100 text-secondary"
                                                    }`}>
                                                        {product.stockLevel}
                                                    </span>
                                                </div>
                                                <h2 className="card-title text-base sm:text-lg font-bold text-dark-slate mb-1">
                                                    {product.name}
                                                </h2>
                                                <p className="text-xs sm:text-sm text-secondary-gray line-clamp-2">
                                                    {product.description}
                                                </p>
                                            </div>

                                            <div className="pt-3 mt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                                                <span className="text-sm sm:text-base font-extrabold text-primary">
                                                    {product.price}
                                                </span>
                                                <div className="card-actions justify-end">
                                                    <Link
                                                        href="/dashboard"
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Buy Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PLATFORM PILLARS & ROLES GRID */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
                <div className="bg-card-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold text-lg mb-3">
                        ⚡
                    </div>
                    <h3 className="font-bold text-lg text-dark-slate mb-1">Direct Refinery Sourcing</h3>
                    <p className="text-xs text-secondary-gray">
                        Customers can bypass middle intermediaries and order crude and refined fuels directly from authorized refinery suppliers.
                    </p>
                </div>

                <div className="bg-card-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                        🚛
                    </div>
                    <h3 className="font-bold text-lg text-dark-slate mb-1">Regional Dealer Network</h3>
                    <p className="text-xs text-secondary-gray">
                        Licensed dealers manage localized fuel stock, source wholesale petroleum supplies in bulk, and fulfill commercial delivery orders.
                    </p>
                </div>

                <div className="bg-card-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm hover:border-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-3">
                        🛡️
                    </div>
                    <h3 className="font-bold text-lg text-dark-slate mb-1">Centralized Admin Oversight</h3>
                    <p className="text-xs text-secondary-gray">
                        Full administrative monitoring of database entities, order status transitions, delivery schedules, and system health.
                    </p>
                </div>
            </div>
        </div>
    );
}