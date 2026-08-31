"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

type UserData = {
    id?: number;
    email: string;
    userName?: string;
    phoneNumber?: string;
    address?: string;
    title?: string;
    photoUrl?: string;
};

type Order = {
    id: number;
    quantity?: number;
    status?: string;
    name?: string; // Product name for supplier/dealer
    product?: {
        name: string;
    };
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
];

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "profile" | "directory">("products");

    // Orders/Products tab states
    const [orders, setOrders] = useState<Order[]>([]);
    const [trackedOrderStatus, setTrackedOrderStatus] = useState<string | null>(null);
    const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);

    // Profile settings tab states
    const [editUsername, setEditUsername] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [profileStatus, setProfileStatus] = useState("");
    const [dbLookupStatus, setDbLookupStatus] = useState("");

    // Directory tab states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);

    const getRolePath = (role?: string) => {
        const r = role ? role.toLowerCase() : "customer";
        return r;
    };

    const getAllUsersUrl = (role?: string) => {
        const r = getRolePath(role);
        if (r === "supplier") return "http://localhost:8000/supplier/getallsupplier";
        if (r === "dealer") return "http://localhost:8000/dealer/all";
        return "http://localhost:8000/customer/getallcustomer";
    };

    // Load initial user details and make first operations
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                // Axios Call #1: Load user profile details lookup from list
                fetchFullProfile(parsed.email, parsed.title);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        setLoading(false);
    }, []);

    // Axios Call #2: Get users listing depending on role
    const fetchFullProfile = async (email: string, title?: string) => {
        const url = getAllUsersUrl(title);
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            if (Array.isArray(res.data)) {
                const match = res.data.find((c: any) => c.email === email);
                if (match) {
                    const fullUser: UserData = {
                        id: match.id,
                        email: match.email,
                        userName: match.username || match.userName || email.split("@")[0],
                        phoneNumber: match.phoneNumber,
                        address: match.address,
                        title: match.title || title,
                        photoUrl: match.filename ? `http://localhost:8000/customer/getimage/${match.filename}` : undefined,
                    };
                    setUser(fullUser);
                    localStorage.setItem("user", JSON.stringify(fullUser));
                    
                    // Trigger Axios Call #3: Load profile details directly from listing match
                    setEditUsername(match.username || match.userName || "");
                    setEditPhone(match.phoneNumber || "");
                    setEditAddress(match.address || "");

                    // Trigger Axios Call #4: Fetch order/assigned products history
                    fetchOrders(match.id, match.title || title);
                }
            }
        } catch (err) {
            console.error("Failed to load user profile list:", err);
        }
    };

    // Axios Call #4: Get customer orders or supplier/dealer assigned products
    const fetchOrders = async (id: number, title?: string) => {
        const r = getRolePath(title);
        let url = `http://localhost:8000/${r}/${id}/orders`;
        if (r === "dealer" || r === "supplier") {
            url = `http://localhost:8000/${r}/${id}/products`;
        }
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch history details:", err);
        }
    };

    // Axios Call #5: Save profile details (PATCH request - supported by all 3 controllers)
    const handleSaveProfile = async () => {
        if (!user || !user.id) return;
        const r = getRolePath(user.title);
        setProfileStatus("");
        try {
            await axios.patch(
                `http://localhost:8000/${r}/${user.id}`,
                {
                    userName: editUsername,
                    phoneNumber: editPhone,
                    address: editAddress,
                },
                {
                    withCredentials: true,
                }
            );
            setProfileStatus("Profile details updated successfully via PATCH request!");
            fetchFullProfile(user.email, user.title);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setProfileStatus("Failed to update profile settings.");
        }
    };

    // Axios Call #6: Quick update address (PATCH request)
    const handleQuickPatchAddress = async () => {
        if (!user || !user.id) return;
        const r = getRolePath(user.title);
        setProfileStatus("");
        try {
            await axios.patch(
                `http://localhost:8000/${r}/${user.id}`,
                {
                    address: editAddress,
                },
                {
                    withCredentials: true,
                }
            );
            setProfileStatus("Address patched successfully via PATCH request!");
            fetchFullProfile(user.email, user.title);
        } catch (err) {
            console.error("Failed to patch address:", err);
            setProfileStatus("Failed to patch address info.");
        }
    };

    // Axios Call #7: Check username existence (GET request)
    const handleCheckUsername = async () => {
        if (!editUsername) return;
        const r = getRolePath(user?.title);
        setDbLookupStatus("");
        try {
            let url = `http://localhost:8000/${r}/${editUsername}`;
            if (r === "dealer" || r === "supplier") {
                const listUrl = getAllUsersUrl(user?.title);
                const res = await axios.get(listUrl, { withCredentials: true });
                if (Array.isArray(res.data)) {
                    const matched = res.data.find((u: any) => (u.username || u.userName) === editUsername);
                    if (matched) {
                        setDbLookupStatus(`Username '${editUsername}' exists in database! User Category: ${user?.title}`);
                        return;
                    }
                }
                setDbLookupStatus(`Username '${editUsername}' is available!`);
                return;
            }

            const res = await axios.get(url, {
                withCredentials: true,
            });
            if (res.data) {
                setDbLookupStatus(`Username '${editUsername}' exists in database! User Category: ${res.data.title || "Unknown"}`);
            } else {
                setDbLookupStatus(`Username '${editUsername}' is available!`);
            }
        } catch (err) {
            console.error("Failed to lookup username:", err);
            setDbLookupStatus(`Username search error or unavailable.`);
        }
    };

    // Axios Call #8: Delete profile account (DELETE request)
    const handleDeleteAccount = async () => {
        if (!user) return;
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
        if (!confirmDelete) return;

        const r = getRolePath(user.title);
        try {
            let url = `http://localhost:8000/customer/${user.userName}`;
            if (r === "supplier" || r === "dealer") {
                url = `http://localhost:8000/${r}/${user.id}`;
            }
            await axios.delete(url, {
                withCredentials: true,
            });
            alert("Your account has been deleted.");
            handleLogout();
        } catch (err) {
            console.error("Account deletion failed:", err);
            alert("Failed to delete account. Please try again.");
        }
    };

    // Axios Call #9: Place order / Assign products dynamically depending on role (POST request)
    // Axios Call #10: Send transaction confirmation email notifications (POST request)
    const handleOrderProduct = async (product: Product) => {
        if (!user || !user.id) {
            alert("Authentication ID is missing.");
            return;
        }
        const r = getRolePath(user.title);

        try {
            if (r === "customer") {
                await axios.post(
                    `http://localhost:8000/customer/${user.id}/orders`,
                    {
                        quantity: 1,
                        status: "processing",
                        product: { id: product.id },
                    },
                    { withCredentials: true }
                );
            } else if (r === "dealer") {
                await axios.post(
                    `http://localhost:8000/dealer/placeorder`,
                    {
                        productId: product.id,
                        quantity: 1,
                    },
                    { withCredentials: true }
                );
            } else if (r === "supplier") {
                await axios.post(
                    `http://localhost:8000/supplier/${user.id}/products`,
                    {
                        productIds: [product.id],
                    },
                    { withCredentials: true }
                );
            }

            // Send notification email
            try {
                await axios.post(
                    `http://localhost:8000/${r}/send-email`,
                    {
                        to: user.email,
                        subject: "Operation Success Confirmation",
                        text: `Hi ${user.userName},\n\nYour operation for ${product.name} has been processed successfully!\n\nThank you!`,
                    },
                    { withCredentials: true }
                );
            } catch (mailErr) {
                console.warn("Mail dispatch failed:", mailErr);
            }

            alert(`Action completed successfully for ${product.name}!`);
            fetchOrders(user.id, user.title);
        } catch (err: any) {
            console.error("Operation failed:", err);
            alert(err.response?.data?.message || "Operation failed due to server error.");
        }
    };

    // Axios Call #11: Cancel customer order or remove dealer/supplier assigned product (DELETE request)
    const handleCancelOrder = async (orderId: number) => {
        if (!user || !user.id) return;
        const confirmCancel = window.confirm("Are you sure you want to remove this item?");
        if (!confirmCancel) return;

        const r = getRolePath(user.title);
        let url = `http://localhost:8000/customer/${user.id}/orders/${orderId}`;
        if (r === "dealer" || r === "supplier") {
            url = `http://localhost:8000/${r}/${user.id}/products/${orderId}`;
        }

        try {
            await axios.delete(url, {
                withCredentials: true,
            });
            alert("Action completed successfully.");
            fetchOrders(user.id, user.title);
        } catch (err) {
            console.error("Failed to cancel/remove:", err);
            alert("Failed to cancel/remove.");
        }
    };

    // Axios Call #12: Track customer/dealer order status or verify supplier logs (GET request)
    const handleTrackOrder = async (orderId: number) => {
        setTrackedOrderId(orderId);
        setTrackedOrderStatus("Retrieving status...");
        const r = getRolePath(user?.title);
        let url = `http://localhost:8000/${r}/trackorder/${orderId}`;
        if (r === "supplier") {
            url = `http://localhost:8000/supplier/inactivesupplier`;
        }
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            if (r === "supplier") {
                setTrackedOrderStatus("Supplier Verified");
            } else if (res.data) {
                setTrackedOrderStatus(res.data.status || "Processing");
            }
        } catch (err) {
            console.error("Tracking failed:", err);
            setTrackedOrderStatus("Information unavailable.");
        }
    };

    // Axios Call #13: Search other users by username substring filter (GET request)
    const handleSearchUsers = async () => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }
        const r = getRolePath(user?.title);
        try {
            if (r === "customer") {
                const res = await axios.get(`http://localhost:8000/customer/search?userName=${searchQuery}`, {
                    withCredentials: true,
                });
                setSearchResults(Array.isArray(res.data) ? res.data : []);
            } else {
                const url = getAllUsersUrl(user?.title);
                const res = await axios.get(url, { withCredentials: true });
                if (Array.isArray(res.data)) {
                    const filtered = res.data.filter((u: any) =>
                        (u.username || u.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setSearchResults(filtered);
                }
            }
        } catch (err) {
            console.error("User search failed:", err);
        }
    };

    // Axios Call #14: List all registered roles in general directory view (GET request)
    const handleLoadDirectory = async () => {
        const url = getAllUsersUrl(user?.title);
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setAllCustomers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load user directory:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-soft-gray text-dark-slate">
                <p className="font-semibold text-lg animate-pulse">Loading Dashboard...</p>
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

            {/* Profile Overview Bar */}
            <div className="w-full max-w-[1200px] bg-card-white border border-[#E2E8F0] shadow-sm rounded-lg p-5 mb-6 flex flex-col md:flex-row items-center justify-between text-left gap-4">
                <div className="flex items-center gap-4">
                    {user.photoUrl && (
                        <img
                            src={user.photoUrl}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-dark-slate">
                            Welcome back, {user.userName || user.email}!
                        </h2>
                        <p className="text-sm text-secondary-gray">
                            Category: <strong className="text-primary">{user.title || "Customer"}</strong> | Email: {user.email}
                        </p>
                    </div>
                </div>
                
                {/* Tab Navigation Controls */}
                <div className="flex gap-2.5">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                            activeTab === "products" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        {user.title === "Supplier" ? "Assign Products" : "Products"}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("orders");
                            if (user.id) fetchOrders(user.id, user.title);
                        }}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                            activeTab === "orders" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        {user.title === "Customer" ? "My Orders" : "My Products"}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("profile");
                            if (user.email) fetchFullProfile(user.email, user.title);
                        }}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                            activeTab === "profile" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        Profile Settings
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("directory");
                            handleLoadDirectory();
                        }}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                            activeTab === "directory" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        User Directory
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-error-red text-white py-2 px-6 rounded cursor-pointer font-semibold text-sm hover:bg-error-red/90 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: PRODUCTS */}
            {activeTab === "products" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">
                        {user.title === "Supplier" ? "Assign Products to Your Catalog" : "Available Products"}
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DUMMY_PRODUCTS.map((product) => (
                            <div
                                key={product.id}
                                className="bg-card-white rounded-lg border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                            >
                                <div className="h-2 bg-primary w-full" />
                                <div className="p-5 flex-grow">
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
                                    <h3 className="text-lg font-bold text-dark-slate mb-2">{product.name}</h3>
                                    <p className="text-sm text-secondary-gray mb-4">{product.description}</p>
                                </div>
                                <div className="p-5 border-t border-[#F1F5F9] bg-[#FAFBFD] flex items-center justify-between">
                                    <span className="text-base font-extrabold text-primary">{product.price}</span>
                                    <button
                                        onClick={() => handleOrderProduct(product)}
                                        className="bg-primary text-white py-1.5 px-4 rounded text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                                    >
                                        {user.title === "Supplier" ? "Assign" : "Order Now"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: MY ORDERS / ASSIGNED PRODUCTS */}
            {activeTab === "orders" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">
                        {user.title === "Customer" ? "Order History" : "My Assigned Products / Inventory"}
                    </h1>
                    {orders.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm">
                            <p className="text-secondary-gray">No items found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {orders.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
                                >
                                    <div>
                                        <h3 className="text-base font-bold text-dark-slate">
                                            ID: #{item.id}
                                        </h3>
                                        <p className="text-sm text-secondary-gray">
                                            Name: <span className="font-semibold text-primary">{item.product?.name || item.name || "Refined Fuel"}</span> 
                                            {item.quantity !== undefined && ` | Qty: ${item.quantity}`}
                                        </p>
                                    </div>

                                    {trackedOrderId === item.id && trackedOrderStatus && (
                                        <span className="text-xs bg-blue-100 text-primary px-3 py-1 rounded font-bold">
                                            Status: {trackedOrderStatus}
                                        </span>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleTrackOrder(item.id)}
                                            className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                                        >
                                            {user.title === "Supplier" ? "Verify Status" : "Track Status"}
                                        </button>
                                        <button
                                            onClick={() => handleCancelOrder(item.id)}
                                            className="bg-error-red text-white text-xs font-semibold px-4 py-2 rounded hover:bg-error-red/90 transition-colors"
                                        >
                                            Remove / Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: PROFILE SETTINGS */}
            {activeTab === "profile" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">Profile Settings</h1>
                    
                    <div className="bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm max-w-[600px]">
                        {profileStatus && (
                            <p className="text-success-green font-bold mb-4">{profileStatus}</p>
                        )}
                        {dbLookupStatus && (
                            <p className="text-primary font-bold mb-4 text-sm bg-blue-50 p-2 rounded border border-blue-100">{dbLookupStatus}</p>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-dark-slate mb-1">Username</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        className="flex-grow p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                                    />
                                    <button
                                        onClick={handleCheckUsername}
                                        className="bg-secondary text-white px-4 py-2 rounded font-semibold text-sm hover:bg-secondary/90 transition-colors"
                                    >
                                        Check DB
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-dark-slate mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-dark-slate mb-1">Address</label>
                                <input
                                    type="text"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                                />
                            </div>

                            <div className="flex gap-2.5 pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex-grow bg-primary text-white py-2.5 rounded font-semibold text-sm hover:bg-primary/95 transition-colors"
                                >
                                    Update Profile (PATCH)
                                </button>
                                <button
                                    onClick={handleQuickPatchAddress}
                                    className="bg-teal-600 text-white px-5 py-2.5 rounded font-semibold text-sm hover:bg-teal-700 transition-colors"
                                >
                                    Quick Address Patch (PATCH)
                                </button>
                            </div>

                            <div className="border-t border-[#F1F5F9] mt-6 pt-6">
                                <h3 className="text-error-red text-base font-bold mb-2">Danger Zone</h3>
                                <p className="text-xs text-secondary-gray mb-4">
                                    Deleting your account will permanently remove all logs and settings from the database.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-error-red text-white px-5 py-2 rounded text-xs font-bold hover:bg-error-red/90 transition-colors"
                                >
                                    Delete Account (DELETE)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: USER DIRECTORY */}
            {activeTab === "directory" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">System User Directory</h1>

                    {/* Search panel */}
                    <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm mb-6 max-w-[600px] flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            placeholder="Search users by name..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-grow p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                        />
                        <button
                            onClick={handleSearchUsers}
                            className="bg-primary text-white px-5 py-2.5 rounded font-semibold text-sm hover:bg-primary/90 transition-colors"
                        >
                            Search DB (GET)
                        </button>
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-dark-slate mb-3">Search Results</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((userObj: any) => (
                                    <div key={userObj.id} className="bg-card-white p-4 rounded-lg border border-primary/20 shadow-sm">
                                        <h3 className="font-bold text-primary">{userObj.username || userObj.userName}</h3>
                                        <p className="text-xs text-secondary-gray">Email: {userObj.email}</p>
                                        <p className="text-xs text-secondary-gray">Category: {userObj.title || user.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* General directory listing */}
                    <div>
                        <h2 className="text-lg font-bold text-dark-slate mb-3">General Directory Listing</h2>
                        {allCustomers.length === 0 ? (
                            <p className="text-secondary-gray text-sm">No users registered in system directory.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allCustomers.map((c: any) => (
                                    <div key={c.id} className="bg-card-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm">
                                        <h3 className="font-bold text-dark-slate">{c.username || c.userName}</h3>
                                        <p className="text-xs text-secondary-gray">Email: {c.email}</p>
                                        <p className="text-xs text-secondary-gray">Role: {c.title || user.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
