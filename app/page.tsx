"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
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

const HERO_SLIDES = [
    {
        id: 1,
        title: "Enterprise Petroleum & Oil Delivery Network",
        tagline: "Direct refinery sourcing, certified pipeline distribution, and automated logistics tracking.",
        image: "/Brent Crude Oil.jpg",
        badge: "Direct Sourcing Channel",
    },
    {
        id: 2,
        title: "Wholesale & Fleet Tanker Dispatch System",
        tagline: "Connecting refinery suppliers, licensed regional dealers, and industrial consumers seamlessly.",
        image: "/Ultra-Low Sulfur Diesel.jpg",
        badge: "Real-time Telemetry",
    },
    {
        id: 3,
        title: "Instant Invoicing & Integrated Checkout",
        tagline: "Pay with secure card processing, choose dealer or supplier origin, and track deliveries 24/7.",
        image: "/Heavy Marine Fuel Oil (HFO).jpg",
        badge: "Zero Intermediary Fees",
    },
];

export default function Home() {
    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isMarqueeMode, setIsMarqueeMode] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<CarouselProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [user, setUser] = useState<{ userName?: string; email?: string; title?: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (err) {
                console.error("Failed to parse user session:", err);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.reload();
    };

    useEffect(() => {
        const fetchHomeProducts = async () => {
            const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
            try {
                const res = await axios.get(`${API_ENDPOINT}/product/list`, {
                    withCredentials: true,
                });
                if (Array.isArray(res.data)) {
                    const mapped: CarouselProduct[] = res.data
                        .sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
                        .map((p: any) => ({
                            id: p.id,
                            name: p.name || `Product #${p.id}`,
                            category: p.category || (p.categories?.[0]?.name) || "Petroleum Grade",
                            price: typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price || "$0.00",
                            description: p.description || "Petroleum product sourced via certified refinery pipelines.",
                            stockLevel: typeof p.quantity === "number" 
                                ? (p.quantity <= 0 ? "Out of Stock" : p.quantity < 1000 ? "Low Stock" : "In Stock") 
                                : p.stockLevel || "In Stock",
                            image: getProductImage(p.name, p.image),
                        }));
                    setProducts(mapped);
                }
            } catch (err) {
                console.warn("Could not fetch products for home carousel:", err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchHomeProducts();
    }, []);

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
                    <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
                        {user ? `Welcome back, ${user.userName || user.email}!` : "Enterprise Petroleum Logistics"}
                    </h1>
                    <p className="text-sm text-slate-300 mt-1 max-w-xl">
                        Streamlining international fuel trade with direct sourcing from refinery suppliers and certified dealer distribution.
                    </p>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="btn btn-primary bg-secondary hover:bg-secondary/90 text-dark-slate font-bold border-none shadow-md px-6"
                            >
                                Go to Dashboard →
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline text-white border-white/40 hover:bg-white/10 cursor-pointer"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="btn btn-primary bg-secondary hover:bg-secondary/90 text-dark-slate font-bold border-none shadow-md px-6"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/registration"
                                className="btn btn-outline text-white border-white/40 hover:bg-white/10"
                            >
                                Register
                            </Link>
                        </>
                    )}
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
                    {loadingProducts ? (
                        <div className="flex flex-col justify-center items-center py-16">
                            <span className="loading loading-spinner loading-lg text-primary mb-3"></span>
                            <p className="text-sm text-secondary-gray">Loading live petroleum catalog...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 text-secondary-gray">
                            <p className="font-semibold text-base mb-1">No products currently available in the catalog.</p>
                            <p className="text-xs">Certified oil products will appear here once registered.</p>
                        </div>
                    ) : isMarqueeMode ? (
                        /* Infinite Continuous Right-to-Left Stream */
                        <div className="carousel w-full overflow-hidden">
                            <div className="animate-carousel-rtl flex gap-6">
                                {/* First set of products */}
                                {products.map((product) => (
                                    <div key={`prod-1-${product.id}`} className="carousel-item">
                                        <div className="card bg-base-100 w-80 sm:w-96 shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-all text-left">
                                            <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/Brent Crude Oil.jpg";
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
                                {products.map((product) => (
                                    <div key={`prod-2-${product.id}`} className="carousel-item">
                                        <div className="card bg-base-100 w-80 sm:w-96 shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-all text-left">
                                            <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/Brent Crude Oil.jpg";
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
                            {products.map((product) => (
                                <div key={product.id} className="carousel-item">
                                    <div className="card bg-base-100 w-80 sm:w-96 shadow-sm border border-[#E2E8F0] overflow-hidden text-left">
                                        <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/Brent Crude Oil.jpg";
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