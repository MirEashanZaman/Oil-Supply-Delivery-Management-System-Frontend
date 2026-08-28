"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const linkClass = "text-white no-underline font-medium text-[15px] hover:text-secondary cursor-pointer";
    const separatorClass = "text-secondary-gray";

    useEffect(() => {
        const user = localStorage.getItem("user");
        setIsLoggedIn(!!user);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        router.push("/login");
    };

    return (
        <nav className="bg-primary px-5 py-4 rounded my-4 flex gap-2.5 items-center flex-wrap">
            <Link href="/" className={linkClass}>Home</Link>
            <span className={separatorClass}>|</span>
            <Link href="/about" className={linkClass}>About Us</Link>
            <span className={separatorClass}>|</span>
            <Link href="/contact" className={linkClass}>Contact Us</Link>
            <span className={separatorClass}>|</span>
            <Link href="/products/1" className={linkClass}>Product 1</Link>
            <span className={separatorClass}>|</span>
            <Link href="/products/2" className={linkClass}>Product 2</Link>

            {!isLoggedIn ? (
                <>
                    <span className={separatorClass}>|</span>
                    <Link href="/login" className={linkClass}>Login</Link>
                    <span className={separatorClass}>|</span>
                    <Link href="/registration" className={linkClass}>Registration</Link>
                </>
            ) : (
                <>
                    <span className={separatorClass}>|</span>
                    <Link href="/dashboard" className={linkClass}>Dashboard</Link>
                    <span className={separatorClass}>|</span>
                    <button onClick={handleLogout} className="bg-transparent border-none text-white no-underline font-medium text-[15px] hover:text-secondary cursor-pointer p-0">
                        Logout
                    </button>
                </>
            )}
        </nav>
    );
}