"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                setUser(null);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="navbar bg-base-100 shadow-md border border-slate-200/80 rounded-2xl px-4 py-2 my-4 w-full max-w-[1240px] flex items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 text-dark-slate font-extrabold text-base tracking-tight hover:opacity-90 transition-opacity">
                    <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-sm shadow-sm">
                        OS
                    </span>
                    <span className="hidden sm:inline">PetroLogistics</span>
                </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                <Link
                    href="/"
                    className={`btn btn-sm rounded-xl font-semibold text-xs sm:text-sm border-none transition-all ${
                        isActive("/") ? "btn-primary shadow-sm" : "btn-ghost text-dark-slate hover:bg-slate-100"
                    }`}
                >
                    Home
                </Link>
                <Link
                    href="/about"
                    className={`btn btn-sm rounded-xl font-semibold text-xs sm:text-sm border-none transition-all ${
                        isActive("/about") ? "btn-primary shadow-sm" : "btn-ghost text-dark-slate hover:bg-slate-100"
                    }`}
                >
                    About Us
                </Link>
                <Link
                    href="/contact"
                    className={`btn btn-sm rounded-xl font-semibold text-xs sm:text-sm border-none transition-all ${
                        isActive("/contact") ? "btn-primary shadow-sm" : "btn-ghost text-dark-slate hover:bg-slate-100"
                    }`}
                >
                    Contact
                </Link>

                {user && (
                    <Link
                        href="/dashboard"
                        className={`btn btn-sm rounded-xl font-semibold text-xs sm:text-sm border-none transition-all ${
                            isActive("/dashboard") ? "btn-primary shadow-sm" : "btn-ghost text-dark-slate hover:bg-slate-100"
                        }`}
                    >
                        Dashboard
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!user ? (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className={`btn btn-sm rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                isActive("/login") ? "btn-primary" : "btn-outline border-slate-300 text-dark-slate hover:bg-slate-100"
                            }`}
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/registration"
                            className="btn btn-sm btn-secondary text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all"
                        >
                            Register
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-sm font-bold text-[11px] hidden md:inline-flex">
                            {user.title || "User"}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm btn-ghost text-error-red hover:bg-red-50 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}