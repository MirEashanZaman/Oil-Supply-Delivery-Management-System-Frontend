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
                <p className="font-semibold text-lg">Loading...</p>
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
            <MyHeader name="Dashboard" message="welcome to your dashboard!" />
            <MyNavigation />

            <div className="mt-5 w-full max-w-[500px] bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-md text-left">
                <h1 className="mt-0 text-dark-slate mb-5 text-2xl font-bold">Customer Profile</h1>

                <div className="space-y-4 mb-6">
                    <div>
                        <span className="block text-xs font-semibold text-secondary-gray uppercase tracking-wider">Email Address</span>
                        <span className="text-base text-dark-slate font-medium">{user.email}</span>
                    </div>

                    {user.userName && (
                        <div>
                            <span className="block text-xs font-semibold text-secondary-gray uppercase tracking-wider">Username</span>
                            <span className="text-base text-dark-slate font-medium">{user.userName}</span>
                        </div>
                    )}

                    {user.phoneNumber && (
                        <div>
                            <span className="block text-xs font-semibold text-secondary-gray uppercase tracking-wider">Phone Number</span>
                            <span className="text-base text-dark-slate font-medium">{user.phoneNumber}</span>
                        </div>
                    )}

                    {user.address && (
                        <div>
                            <span className="block text-xs font-semibold text-secondary-gray uppercase tracking-wider">Address</span>
                            <span className="text-base text-dark-slate font-medium">{user.address}</span>
                        </div>
                    )}

                    {user.title && (
                        <div>
                            <span className="block text-xs font-semibold text-secondary-gray uppercase tracking-wider">Category / Title</span>
                            <span className="text-base text-dark-slate font-medium">{user.title}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-error-red text-white border-none py-2.5 px-5 rounded cursor-pointer font-semibold text-[15px] w-full hover:bg-error-red/90 transition-colors"
                >
                    Logout
                </button>
            </div>
        </>
    );
}
