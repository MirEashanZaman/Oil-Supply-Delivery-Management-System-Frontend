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
    status?: string;
    photoUrl?: string;
};

type PaymentInfo = {
    cardNumber?: string;
    cardType?: string;
    amount?: number;
    status?: string;
};

type Order = {
    id: number;
    quantity: number;
    status: string;
    address?: string;
    customerName?: string;
    customerEmail?: string;
    product?: {
        id: number;
        name: string;
    };
    supplier?: {
        id: number;
        userName?: string;
        username?: string;
    };
    dealer?: {
        id: number;
        userName?: string;
        username?: string;
    };
    payment?: PaymentInfo;
};

type Product = {
    id: number;
    name: string;
    category: string;
    price: string;
    numericPrice: number;
    description: string;
    inStock: boolean;
    stockLevel: "In Stock" | "Low Stock" | "Out of Stock";
};

type Party = {
    id: number;
    username?: string;
    userName?: string;
    email?: string;
    title?: string;
    status?: string;
};

const DUMMY_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Brent Crude Oil",
        category: "Crude Fuel",
        price: "$82.50 / Barrel",
        numericPrice: 82.50,
        description: "High-quality sweet light crude oil sourced from international marine drillings.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 2,
        name: "Ultra-Low Sulfur Diesel",
        category: "Refined Diesel",
        price: "$3.20 / Gallon",
        numericPrice: 3.20,
        description: "Clean-burning commercial diesel fuel with high thermal output properties.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 3,
        name: "Premium Unleaded Gasoline",
        category: "Refined Gasoline",
        price: "$3.85 / Gallon",
        numericPrice: 3.85,
        description: "High-octane gasoline suitable for high-performance automotive engines.",
        inStock: true,
        stockLevel: "Low Stock",
    },
    {
        id: 4,
        name: "Aviation Turbine Fuel (Jet A-1)",
        category: "Aviation Fuel",
        price: "$2.95 / Litre",
        numericPrice: 2.95,
        description: "Kerosene-type jet fuel manufactured to rigorous international safety standards.",
        inStock: true,
        stockLevel: "In Stock",
    },
    {
        id: 5,
        name: "Liquefied Petroleum Gas (LPG)",
        category: "Liquefied Gas",
        price: "$1.80 / kg",
        numericPrice: 1.80,
        description: "Clean flammable hydrocarbon gas mixture utilized as heating and cooking fuel.",
        inStock: true,
        stockLevel: "In Stock",
    },
];

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "inventory" | "profile" | "directory">("products");

    // Orders tab states
    const [orders, setOrders] = useState<Order[]>([]);
    const [trackedOrderStatus, setTrackedOrderStatus] = useState<string | null>(null);
    const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);
    const [deliveryDates, setDeliveryDates] = useState<{ [orderId: number]: string }>({});

    // Dealer/Supplier Inventory states
    const [customInventory, setCustomInventory] = useState<Product[]>([]);
    const [supplierOperationalStatus, setSupplierOperationalStatus] = useState<string>("active");

    // Sourcing lists (Suppliers & Dealers)
    const [availableSuppliers, setAvailableSuppliers] = useState<Party[]>([]);
    const [availableDealers, setAvailableDealers] = useState<Party[]>([]);

    // Customer Interactive Checkout Modal States
    const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
    const [sourcingChoice, setSourcingChoice] = useState<"supplier" | "dealer">("supplier");
    const [selectedPartyId, setSelectedPartyId] = useState<number | "">("");
    const [orderQuantity, setOrderQuantity] = useState<number>(1);
    const [deliveryAddress, setDeliveryAddress] = useState<string>("");
    const [cardType, setCardType] = useState<string>("Visa");
    const [cardNumber, setCardNumber] = useState<string>("4532-8812-9934-5521");
    const [cardHolder, setCardHolder] = useState<string>("");
    const [cardExpiry, setCardExpiry] = useState<string>("12/28");
    const [cardCvv, setCardCvv] = useState<string>("883");
    const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

    // Dealer Wholesale Bulk Sourcing Modal States
    const [wholesaleProduct, setWholesaleProduct] = useState<Product | null>(null);
    const [wholesaleSupplierId, setWholesaleSupplierId] = useState<number | "">("");
    const [wholesaleQuantity, setWholesaleQuantity] = useState<number>(50);
    const [isSubmittingWholesale, setIsSubmittingWholesale] = useState<boolean>(false);

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
        return role ? role.toLowerCase() : "customer";
    };

    const getAllUsersUrl = (role?: string) => {
        const r = getRolePath(role);
        if (r === "supplier") return "http://localhost:8000/supplier/getallsupplier";
        if (r === "dealer") return "http://localhost:8000/dealer/all";
        return "http://localhost:8000/customer/getallcustomer";
    };

    // Load initial user details
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                setDeliveryAddress(parsed.address || "Dhaka, Bangladesh");
                setCardHolder(parsed.userName || parsed.email.split("@")[0]);
                if (parsed.status) setSupplierOperationalStatus(parsed.status);
                fetchFullProfile(parsed.email, parsed.title);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }
        setLoading(false);
        fetchSourcingParties();
    }, []);

    // Axios Call: Fetch available suppliers and dealers
    const fetchSourcingParties = async () => {
        try {
            const [suppliersRes, dealersRes] = await Promise.allSettled([
                axios.get("http://localhost:8000/supplier/getallsupplier", { withCredentials: true }),
                axios.get("http://localhost:8000/dealer/all", { withCredentials: true }),
            ]);

            if (suppliersRes.status === "fulfilled" && Array.isArray(suppliersRes.value.data)) {
                setAvailableSuppliers(suppliersRes.value.data);
            }
            if (dealersRes.status === "fulfilled" && Array.isArray(dealersRes.value.data)) {
                setAvailableDealers(dealersRes.value.data);
            }
        } catch (err) {
            console.error("Failed to load sourcing partners:", err);
        }
    };

    // Axios Call: Get full profile
    const fetchFullProfile = async (email: string, title?: string) => {
        const url = getAllUsersUrl(title);
        try {
            const res = await axios.get(url, { withCredentials: true });
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
                        status: match.status || "active",
                        photoUrl: match.filename ? `http://localhost:8000/customer/getimage/${match.filename}` : undefined,
                    };
                    setUser(fullUser);
                    if (match.status) setSupplierOperationalStatus(match.status);
                    localStorage.setItem("user", JSON.stringify(fullUser));
                    
                    setEditUsername(match.username || match.userName || "");
                    setEditPhone(match.phoneNumber || "");
                    setEditAddress(match.address || "");

                    fetchOrders(match.id, match.title || title);
                    if (match.title === "Dealer" || title === "Dealer" || match.title === "Supplier" || title === "Supplier") {
                        fetchCustomInventory(match.id, match.title || title);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load user profile list:", err);
        }
    };

    // Axios Call: Get Inventory / Supply Portfolio (`GET /:role/:id/products`)
    const fetchCustomInventory = async (partyId: number, title?: string) => {
        const r = getRolePath(title);
        try {
            const res = await axios.get(`http://localhost:8000/${r}/${partyId}/products`, {
                withCredentials: true,
            });
            if (Array.isArray(res.data)) {
                setCustomInventory(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
        }
    };

    // Axios Call: Assign Product to Stock / Portfolio (`POST /:role/:id/products`)
    const handleAssignProduct = async (product: Product) => {
        if (!user || !user.id) return;
        const r = getRolePath(user.title);
        try {
            await axios.post(
                `http://localhost:8000/${r}/${user.id}/products`,
                { productIds: [product.id] },
                { withCredentials: true }
            );
            alert(`Product "${product.name}" added to your ${user.title === "Supplier" ? "Supply Portfolio" : "Stock Inventory"}!`);
            fetchCustomInventory(user.id, user.title);
        } catch (err: any) {
            console.error("Failed to assign product:", err);
            alert(err.response?.data?.message || "Failed to assign product.");
        }
    };

    // Axios Call: Remove Product from Stock / Portfolio (`DELETE /:role/:id/products/:productId`)
    const handleRemoveProductFromStock = async (productId: number) => {
        if (!user || !user.id) return;
        const confirmRemove = window.confirm(`Are you sure you want to remove this product from your ${user.title === "Supplier" ? "portfolio" : "inventory"}?`);
        if (!confirmRemove) return;

        const r = getRolePath(user.title);
        try {
            await axios.delete(`http://localhost:8000/${r}/${user.id}/products/${productId}`, {
                withCredentials: true,
            });
            alert("Product removed successfully.");
            fetchCustomInventory(user.id, user.title);
        } catch (err) {
            console.error("Failed to remove product:", err);
            alert("Failed to remove product.");
        }
    };

    // Axios Call: Supplier Status Toggle (`PUT /supplier/updatesupplier/:id/:status`)
    const handleToggleSupplierStatus = async () => {
        if (!user || !user.id) return;
        const newStatus = supplierOperationalStatus === "active" ? "inactive" : "active";
        try {
            await axios.put(
                `http://localhost:8000/supplier/updatesupplier/${user.id}/${newStatus}`,
                {},
                { withCredentials: true }
            );
            setSupplierOperationalStatus(newStatus);
            setUser({ ...user, status: newStatus });
            alert(`Supplier operational status updated to: ${newStatus.toUpperCase()}`);
            fetchFullProfile(user.email, user.title);
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update operational status.");
        }
    };

    // Axios Call: Dealer Wholesale Bulk Sourcing (`POST /dealer/placeorder`)
    const handleWholesaleBulkOrder = async () => {
        if (!user || !wholesaleProduct) return;
        setIsSubmittingWholesale(true);

        const supplierId = wholesaleSupplierId || (availableSuppliers[0]?.id || 1);

        try {
            await axios.post(
                "http://localhost:8000/dealer/placeorder",
                {
                    productId: wholesaleProduct.id,
                    supplierId: Number(supplierId),
                    quantity: wholesaleQuantity,
                },
                { withCredentials: true }
            );

            try {
                const supplierName = availableSuppliers.find(s => s.id === Number(supplierId))?.userName || "Supplier Refinery";
                await axios.post(
                    "http://localhost:8000/dealer/send-email",
                    {
                        to: user.email,
                        subject: `Wholesale Order Placed - ${wholesaleProduct.name}`,
                        text: `Hi ${user.userName},\n\nYour wholesale bulk order for ${wholesaleQuantity} units of ${wholesaleProduct.name} has been placed directly with Supplier (${supplierName})!\n\nThank you!`,
                    },
                    { withCredentials: true }
                );
            } catch (mailErr) {
                console.warn("Mail dispatch notice:", mailErr);
            }

            alert(`Wholesale bulk order for ${wholesaleQuantity} units of ${wholesaleProduct.name} placed successfully!`);
            setWholesaleProduct(null);
            if (user.id) fetchOrders(user.id, user.title);
        } catch (err: any) {
            console.error("Wholesale ordering failed:", err);
            alert(err.response?.data?.message || "Wholesale ordering failed.");
        } finally {
            setIsSubmittingWholesale(false);
        }
    };

    // Axios Call: Fetch customer orders
    const fetchOrders = async (id: number, title?: string) => {
        const r = getRolePath(title);
        if (r === "customer") {
            try {
                const res = await axios.get(`http://localhost:8000/customer/${id}/orders`, {
                    withCredentials: true,
                });
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch customer orders history:", err);
            }
        } else {
            try {
                const res = await axios.get("http://localhost:8000/customer/getallcustomer", {
                    withCredentials: true,
                });
                if (Array.isArray(res.data)) {
                    const allOrders: Order[] = [];
                    res.data.forEach((cust: any) => {
                        if (Array.isArray(cust.orders)) {
                            cust.orders.forEach((o: any) => {
                                allOrders.push({
                                    id: o.id,
                                    quantity: o.quantity || 1,
                                    status: o.status || "pending",
                                    address: o.address || cust.address,
                                    customerName: cust.username || cust.userName || cust.email,
                                    customerEmail: cust.email,
                                    product: o.product || { id: 1, name: "Fuel Product" },
                                    supplier: o.supplier,
                                    dealer: o.dealer,
                                    payment: o.payment,
                                });
                            });
                        }
                    });
                    setOrders(allOrders);
                }
            } catch (err) {
                console.error("Failed to load global customer orders:", err);
            }
        }
    };

    // Customer Checkout Modal
    const handleOpenCheckout = (product: Product) => {
        setCheckoutProduct(product);
        setOrderQuantity(1);
        if (sourcingChoice === "supplier" && availableSuppliers.length > 0) {
            setSelectedPartyId(availableSuppliers[0].id);
        } else if (sourcingChoice === "dealer" && availableDealers.length > 0) {
            setSelectedPartyId(availableDealers[0].id);
        }
    };

    // Submit Customer Order
    const handleCompleteOrder = async () => {
        if (!user || !user.id || !checkoutProduct) return;
        setIsSubmittingOrder(true);
        const totalAmount = Number((checkoutProduct.numericPrice * orderQuantity).toFixed(2));

        const orderPayload: any = {
            quantity: orderQuantity,
            address: deliveryAddress || user.address || "Default Address",
            status: "pending",
            product: { id: checkoutProduct.id },
            payment: {
                cardNumber: cardNumber || "4532-8812-9934-5521",
                cardType: cardType,
                amount: totalAmount,
                status: "completed",
            },
        };

        if (sourcingChoice === "supplier") {
            orderPayload.supplier = selectedPartyId ? { id: Number(selectedPartyId) } : { id: 1 };
        } else {
            orderPayload.dealer = selectedPartyId ? { id: Number(selectedPartyId) } : { id: 1 };
        }

        try {
            await axios.post(
                `http://localhost:8000/customer/${user.id}/orders`,
                orderPayload,
                { withCredentials: true }
            );

            try {
                const partnerName = sourcingChoice === "supplier" 
                    ? (availableSuppliers.find(s => s.id === Number(selectedPartyId))?.userName || "Direct Refinery Supplier")
                    : (availableDealers.find(d => d.id === Number(selectedPartyId))?.userName || "Authorized Local Dealer");

                await axios.post(
                    "http://localhost:8000/customer/send-email",
                    {
                        to: user.email,
                        subject: `Order Confirmed - ${checkoutProduct.name}`,
                        text: `Dear ${user.userName},\n\nYour order has been placed successfully!\n\nProduct: ${checkoutProduct.name}\nQuantity: ${orderQuantity}\nSourced From: ${sourcingChoice.toUpperCase()} (${partnerName})\nTotal Paid: $${totalAmount}\nDelivery Address: ${deliveryAddress}\n\nThank you!`,
                    },
                    { withCredentials: true }
                );
            } catch (mailErr) {
                console.warn("Mail dispatch error:", mailErr);
            }

            alert(`Order placed successfully!\nTotal: $${totalAmount}\nEmail receipt sent to ${user.email}`);
            setCheckoutProduct(null);
            fetchOrders(user.id, user.title);
            setActiveTab("orders");
        } catch (err: any) {
            console.error("Order submission failed:", err);
            alert(err.response?.data?.message || "Order placement failed.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    // Axios Call: Confirm or Reject Order (`PUT /:role/confirmorder/:id`)
    const handleConfirmOrRejectOrder = async (orderId: number, status: "confirmed" | "rejected", customerEmail?: string) => {
        if (!user) return;
        const r = getRolePath(user.title);
        try {
            await axios.put(
                `http://localhost:8000/${r}/confirmorder/${orderId}`,
                { status: status },
                { withCredentials: true }
            );

            if (customerEmail) {
                try {
                    await axios.post(
                        `http://localhost:8000/${r}/send-email`,
                        {
                            to: customerEmail,
                            subject: `Order #${orderId} Update: ${status.toUpperCase()}`,
                            text: `Dear Partner / Customer,\n\nYour order #${orderId} has been marked as '${status}' by the ${user.title}.\n\nThank you!`,
                        },
                        { withCredentials: true }
                    );
                } catch (mailErr) {
                    console.warn("Mail send error:", mailErr);
                }
            }

            alert(`Order #${orderId} marked as ${status.toUpperCase()} successfully!`);
            fetchOrders(user.id || 1, user.title);
        } catch (err) {
            console.error(`Failed to ${status} order:`, err);
            alert(`Failed to update order status.`);
        }
    };

    // Axios Call: Schedule & Link Delivery (`POST /:role/scheduledelivery`)
    const handleScheduleDelivery = async (orderId: number, customerEmail?: string) => {
        if (!user) return;
        const r = getRolePath(user.title);
        const date = deliveryDates[orderId];
        if (!date) {
            alert("Please choose a delivery date first.");
            return;
        }

        try {
            await axios.post(
                `http://localhost:8000/${r}/scheduledelivery`,
                { orderId, deliveryDate: date },
                { withCredentials: true }
            );

            if (customerEmail) {
                try {
                    await axios.post(
                        `http://localhost:8000/${r}/send-email`,
                        {
                            to: customerEmail,
                            subject: `Delivery Scheduled for Order #${orderId}`,
                            text: `Dear Customer,\n\nYour order #${orderId} has been scheduled for delivery on ${date}.\n\nManaged by: ${user.userName || user.title}\nStatus: Scheduled\n\nThank you!`,
                        },
                        { withCredentials: true }
                    );
                } catch (mailErr) {
                    console.warn("Mail send notice:", mailErr);
                }
            }

            alert(`Delivery successfully scheduled for ${date}! Email update dispatched.`);
            fetchOrders(user.id || 1, user.title);
        } catch (err) {
            console.error("Failed to schedule delivery:", err);
            alert("Failed to schedule delivery.");
        }
    };

    // Axios Call: Cancel/Remove order
    const handleCancelOrder = async (orderId: number) => {
        if (!user || !user.id) return;
        const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmCancel) return;

        try {
            await axios.delete(`http://localhost:8000/customer/${user.id}/orders/${orderId}`, {
                withCredentials: true,
            });
            alert("Order cancelled successfully.");
            fetchOrders(user.id, user.title);
        } catch (err) {
            console.error("Failed to cancel order:", err);
            alert("Failed to cancel order.");
        }
    };

    // Axios Call: Track order status
    const handleTrackOrder = async (orderId: number) => {
        setTrackedOrderId(orderId);
        setTrackedOrderStatus("Connecting to real-time delivery tracker...");
        const r = getRolePath(user?.title);
        try {
            const res = await axios.get(`http://localhost:8000/${r}/trackorder/${orderId}`, {
                withCredentials: true,
            });
            if (res.data) {
                setTrackedOrderStatus(res.data.status || res.data.message || "In Transit / Scheduled");
            }
        } catch (err) {
            console.error("Tracking failed:", err);
            setTrackedOrderStatus("In Transit / Carrier Processing");
        }
    };

    // Axios Call: Profile Updates (PATCH)
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
                { withCredentials: true }
            );
            setProfileStatus("Profile details updated successfully!");
            fetchFullProfile(user.email, user.title);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setProfileStatus("Failed to update profile settings.");
        }
    };

    // Axios Call: Delete Account
    const handleDeleteAccount = async () => {
        if (!user) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete your ${user.title} account? This will cascade-delete linked records.`);
        if (!confirmDelete) return;

        const r = getRolePath(user.title);
        try {
            let url = `http://localhost:8000/customer/${user.userName}`;
            if (r === "supplier" || r === "dealer") {
                url = `http://localhost:8000/${r}/${user.id}`;
            }
            await axios.delete(url, { withCredentials: true });
            alert("Your account has been deleted.");
            handleLogout();
        } catch (err) {
            console.error("Account deletion failed:", err);
            alert("Failed to delete account. Please try again.");
        }
    };

    // Axios Call: Search users
    const handleSearchUsers = async () => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await axios.get(`http://localhost:8000/customer/search?userName=${searchQuery}`, {
                withCredentials: true,
            });
            setSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("User search failed:", err);
        }
    };

    // Axios Call: Load general directory
    const handleLoadDirectory = async () => {
        const url = getAllUsersUrl(user?.title);
        try {
            const res = await axios.get(url, { withCredentials: true });
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
                <p className="font-semibold text-lg animate-pulse">Loading System Dashboard...</p>
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

    const isCustomer = getRolePath(user.title) === "customer";
    const isDealer = getRolePath(user.title) === "dealer";
    const isSupplier = getRolePath(user.title) === "supplier";

    return (
        <>
            <MyHeader name="Dashboard" message="manage orders, catalog & deliveries!" />
            <MyNavigation />

            {/* Profile Overview Bar */}
            <div className="w-full max-w-[1200px] bg-card-white border border-[#E2E8F0] shadow-sm rounded-lg p-5 mb-6 flex flex-col md:flex-row items-center justify-between text-left gap-4">
                <div className="flex items-center gap-4">
                    {user.photoUrl ? (
                        <img
                            src={user.photoUrl}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                            {(user.userName || user.email)[0].toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-dark-slate">
                                Welcome back, {user.userName || user.email}!
                            </h2>
                            {isSupplier && (
                                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                                    supplierOperationalStatus === "active" 
                                        ? "bg-green-100 text-success-green border border-green-200" 
                                        : "bg-red-100 text-error-red border border-red-200"
                                }`}>
                                    Status: {supplierOperationalStatus}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-secondary-gray">
                            Role: <strong className="text-primary">{user.title || "Customer"}</strong> | Email: {user.email} | Address: {user.address || "Not set"}
                        </p>
                    </div>
                </div>
                
                {/* Navigation Tabs */}
                <div className="flex gap-2.5 flex-wrap">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${
                            activeTab === "products" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        Products Catalog
                    </button>

                    {(isDealer || isSupplier) && (
                        <button
                            onClick={() => {
                                setActiveTab("inventory");
                                if (user.id) fetchCustomInventory(user.id, user.title);
                            }}
                            className={`px-4 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${
                                activeTab === "inventory" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                            }`}
                        >
                            {isSupplier ? "Supply Portfolio" : "Stock Inventory"}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            setActiveTab("orders");
                            if (user.id) fetchOrders(user.id, user.title);
                        }}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${
                            activeTab === "orders" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        {isCustomer ? "My Orders & Tracking" : "Fulfill Orders & Logistics"}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("profile");
                            if (user.email) fetchFullProfile(user.email, user.title);
                        }}
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${
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
                        className={`px-4 py-2 rounded text-sm font-semibold transition-colors cursor-pointer ${
                            activeTab === "directory" ? "bg-primary text-white" : "bg-[#FAFBFD] text-secondary-gray hover:bg-[#F1F5F9]"
                        }`}
                    >
                        Directory Search
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-error-red text-white py-2 px-5 rounded cursor-pointer font-semibold text-sm hover:bg-error-red/90 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* TAB 1: PRODUCT CATALOG & BULK SOURCING */}
            {activeTab === "products" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-slate">
                                {isSupplier 
                                    ? "Oil Products Catalog & Supply Portfolio"
                                    : isDealer 
                                    ? "Oil Products & Wholesale Sourcing" 
                                    : "Oil Products Catalog"
                                }
                            </h1>
                            <p className="text-sm text-secondary-gray">
                                {isSupplier
                                    ? "Add petroleum products to your active supply portfolio for distribution to Dealers and Customers."
                                    : isDealer
                                    ? "Assign products to your stock catalog or order bulk wholesale supplies directly from Refinery Suppliers."
                                    : "Browse available oil grades and place retail orders with direct supplier or dealer sourcing."
                                }
                            </p>
                        </div>
                    </div>

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

                                <div className="p-5 border-t border-[#F1F5F9] bg-[#FAFBFD] flex items-center justify-between gap-2">
                                    <span className="text-base font-extrabold text-primary">{product.price}</span>
                                    
                                    {isSupplier ? (
                                        <button
                                            onClick={() => handleAssignProduct(product)}
                                            className="bg-primary text-white py-1.5 px-4 rounded text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                                        >
                                            + Add to Supply Portfolio
                                        </button>
                                    ) : isDealer ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAssignProduct(product)}
                                                className="bg-emerald-600 text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                                            >
                                                + Assign Stock
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setWholesaleProduct(product);
                                                    setWholesaleQuantity(50);
                                                    if (availableSuppliers.length > 0) setWholesaleSupplierId(availableSuppliers[0].id);
                                                }}
                                                className="bg-primary text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                                            >
                                                Bulk Source
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleOpenCheckout(product)}
                                            className="bg-primary text-white py-2 px-5 rounded text-sm font-semibold hover:bg-primary/95 transition-colors cursor-pointer shadow-sm"
                                        >
                                            Order & Checkout
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: STOCK INVENTORY / SUPPLY PORTFOLIO */}
            {(isDealer || isSupplier) && activeTab === "inventory" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-slate">
                                {isSupplier ? "My Supply Portfolio" : "My Stock Inventory"}
                            </h1>
                            <p className="text-sm text-secondary-gray">
                                {isSupplier 
                                    ? "Manage petroleum products you actively distribute to Dealers and direct Customers."
                                    : "Manage products actively linked to your Dealer stock catalog."
                                }
                            </p>
                        </div>
                    </div>

                    {customInventory.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm">
                            <p className="text-secondary-gray mb-4">
                                You have not linked any products to your {isSupplier ? "supply portfolio" : "stock inventory"} yet.
                            </p>
                            <button
                                onClick={() => setActiveTab("products")}
                                className="bg-primary text-white px-5 py-2 rounded text-sm font-semibold cursor-pointer"
                            >
                                Browse Catalog to Add Products
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customInventory.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="h-2 bg-emerald-600 w-full" />
                                    <div className="p-5 flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {isSupplier ? "Active Portfolio Item" : "Active Stock Item"}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-dark-slate mb-2">{item.name}</h3>
                                        <p className="text-sm text-secondary-gray">{item.description || "Petroleum Grade Oil Product"}</p>
                                    </div>

                                    <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFBFD] flex items-center justify-between">
                                        <span className="text-xs text-secondary-gray">Product ID: #{item.id}</span>
                                        <button
                                            onClick={() => handleRemoveProductFromStock(item.id)}
                                            className="bg-error-red text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-error-red/90 transition-colors cursor-pointer"
                                        >
                                            {isSupplier ? "Remove from Portfolio" : "Remove from Stock"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: MY ORDERS & FULFILLMENT */}
            {activeTab === "orders" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-2">
                        {isCustomer 
                            ? "My Order History & Live Tracking" 
                            : "Fulfill Customer & Dealer Orders"
                        }
                    </h1>
                    <p className="text-sm text-secondary-gray mb-6">
                        {isCustomer 
                            ? "View past orders, delivery channel selections, payment invoices, and real-time status updates."
                            : "Confirm or reject retail/wholesale orders, schedule deliveries, and dispatch email updates to buyers."
                        }
                    </p>

                    {orders.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm">
                            <p className="text-secondary-gray mb-4">No order logs found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {orders.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-dark-slate">
                                                Order #{item.id}
                                            </h3>
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                                item.status === "confirmed" 
                                                    ? "bg-green-100 text-success-green border border-green-200" 
                                                    : item.status === "rejected"
                                                    ? "bg-red-100 text-error-red border border-red-200"
                                                    : "bg-blue-50 text-primary border border-blue-100"
                                            }`}>
                                                {item.status ? item.status.toUpperCase() : "PENDING"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-dark-slate">
                                            Product: <span className="font-semibold text-primary">{item.product?.name || "Petroleum Fuel"}</span> (Qty: {item.quantity})
                                        </p>

                                        {!isCustomer && item.customerName && (
                                            <p className="text-xs text-secondary-gray">
                                                Buyer: <strong className="text-dark-slate">{item.customerName}</strong> ({item.customerEmail || "Buyer"})
                                            </p>
                                        )}

                                        <p className="text-xs text-secondary-gray">
                                            Destination: <span className="text-dark-slate">{item.address || user.address || "Local Hub"}</span>
                                        </p>
                                    </div>

                                    {trackedOrderId === item.id && trackedOrderStatus && (
                                        <div className="bg-blue-50 border border-blue-200 text-primary px-4 py-2 rounded text-xs">
                                            <span className="font-bold block mb-0.5">Tracking Status:</span>
                                            {trackedOrderStatus}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        {isCustomer ? (
                                            <>
                                                <button
                                                    onClick={() => handleTrackOrder(item.id)}
                                                    className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded hover:bg-primary/90 transition-colors cursor-pointer"
                                                >
                                                    Track Delivery
                                                </button>
                                                <button
                                                    onClick={() => handleCancelOrder(item.id)}
                                                    className="bg-error-red text-white text-xs font-semibold px-4 py-2 rounded hover:bg-error-red/90 transition-colors cursor-pointer"
                                                >
                                                    Cancel Order
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => handleConfirmOrRejectOrder(item.id, "confirmed", item.customerEmail)}
                                                    className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-green-700 transition-colors cursor-pointer"
                                                >
                                                    Confirm (PUT)
                                                </button>

                                                <button
                                                    onClick={() => handleConfirmOrRejectOrder(item.id, "rejected", item.customerEmail)}
                                                    className="bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer"
                                                >
                                                    Reject (PUT)
                                                </button>
                                                
                                                <div className="flex items-center border border-secondary-gray rounded overflow-hidden">
                                                    <input
                                                        type="date"
                                                        value={deliveryDates[item.id] || ""}
                                                        onChange={(e) => setDeliveryDates({
                                                            ...deliveryDates,
                                                            [item.id]: e.target.value
                                                        })}
                                                        className="p-1 text-xs outline-none bg-card-white text-dark-slate border-r border-secondary-gray"
                                                    />
                                                    <button
                                                        onClick={() => handleScheduleDelivery(item.id, item.customerEmail)}
                                                        className="bg-teal-600 text-white text-xs font-semibold px-3 py-2 hover:bg-teal-700 transition-colors cursor-pointer"
                                                    >
                                                        Schedule (POST)
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleTrackOrder(item.id)}
                                                    className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded hover:bg-primary/90 transition-colors cursor-pointer"
                                                >
                                                    Track (GET)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: PROFILE & OPERATIONAL STATUS SETTINGS */}
            {activeTab === "profile" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">Profile & Operational Status Settings</h1>
                    
                    <div className="bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm max-w-[600px]">
                        {profileStatus && (
                            <p className="text-success-green font-bold mb-4">{profileStatus}</p>
                        )}
                        {dbLookupStatus && (
                            <p className="text-primary font-bold mb-4 text-sm bg-blue-50 p-2 rounded border border-blue-100">{dbLookupStatus}</p>
                        )}

                        <div className="space-y-4">
                            {/* Supplier Operational Status Switch */}
                            {isSupplier && (
                                <div className="bg-[#FAFBFD] p-4 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-dark-slate">Supplier Operational Status</h3>
                                        <p className="text-xs text-secondary-gray">Set your refinery account status to active or inactive.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleSupplierStatus}
                                        className={`px-4 py-2 rounded font-bold text-xs cursor-pointer transition-colors ${
                                            supplierOperationalStatus === "active"
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : "bg-gray-400 text-white hover:bg-gray-500"
                                        }`}
                                    >
                                        Status: {supplierOperationalStatus.toUpperCase()} (Click to Switch)
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-dark-slate mb-1">
                                    {isSupplier ? "Refinery / Supplier Name" : isDealer ? "Business Name" : "Username"}
                                </label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-dark-slate mb-1">Email Address (Read-only)</label>
                                <input
                                    type="text"
                                    value={user.email}
                                    disabled
                                    className="w-full p-2.5 border border-gray-200 rounded bg-gray-50 text-secondary-gray cursor-not-allowed"
                                />
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
                                <label className="block text-sm font-semibold text-dark-slate mb-1">
                                    {isSupplier ? "Refinery Location / Headquarters" : "Address"}
                                </label>
                                <input
                                    type="text"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full bg-primary text-white py-2.5 rounded font-semibold text-sm hover:bg-primary/95 transition-colors cursor-pointer"
                                >
                                    Save Profile Updates (PATCH)
                                </button>
                            </div>

                            <div className="border-t border-[#F1F5F9] mt-6 pt-6">
                                <h3 className="text-error-red text-base font-bold mb-1">Delete {user.title || "Supplier"} Account</h3>
                                <p className="text-xs text-secondary-gray mb-4">
                                    Deleting your account will cascade-delete all linked supply portfolios, wholesale records, and delivery schedules.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-error-red text-white px-5 py-2 rounded text-xs font-bold hover:bg-error-red/90 transition-colors cursor-pointer"
                                >
                                    Permanently Delete Account (DELETE)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: SYSTEM DIRECTORY */}
            {activeTab === "directory" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">System User Directory</h1>

                    <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm mb-6 max-w-[600px] flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            placeholder="Search users by name in database..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-grow p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none"
                        />
                        <button
                            onClick={handleSearchUsers}
                            className="bg-primary text-white px-5 py-2.5 rounded font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            Search
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-dark-slate mb-3">Search Results</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.map((userObj: any) => (
                                    <div key={userObj.id} className="bg-card-white p-4 rounded-lg border border-primary/20 shadow-sm">
                                        <h3 className="font-bold text-primary">{userObj.username || userObj.userName}</h3>
                                        <p className="text-xs text-secondary-gray">Email: {userObj.email}</p>
                                        <p className="text-xs text-secondary-gray">Role: {userObj.title || user.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-lg font-bold text-dark-slate mb-3">Registered Users Directory</h2>
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

            {/* DEALER WHOLESALE BULK SOURCING MODAL */}
            {wholesaleProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-card-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-[550px] text-left p-6 md:p-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-dark-slate">Wholesale Bulk Sourcing</h2>
                                <p className="text-xs text-secondary-gray">Buy bulk petroleum products directly from Refinery Suppliers.</p>
                            </div>
                            <button
                                onClick={() => setWholesaleProduct(null)}
                                className="text-gray-400 hover:text-dark-slate text-2xl font-bold p-1 cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="bg-[#FAFBFD] p-4 rounded-lg border border-[#E2E8F0] mb-5">
                            <h3 className="text-base font-bold text-dark-slate">{wholesaleProduct.name}</h3>
                            <p className="text-xs text-secondary-gray">{wholesaleProduct.category} | {wholesaleProduct.price}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Select Refinery Supplier:</label>
                                <select
                                    value={wholesaleSupplierId}
                                    onChange={(e) => setWholesaleSupplierId(Number(e.target.value))}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                >
                                    {availableSuppliers.length > 0 ? (
                                        availableSuppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.userName || s.username || `Supplier Refinery #${s.id}`} ({s.email || "Verified"})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="1">Central National Petroleum Refinery (Default)</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Bulk Quantity (Units / Barrels):</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="10000"
                                    value={wholesaleQuantity}
                                    onChange={(e) => setWholesaleQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setWholesaleProduct(null)}
                                className="w-1/3 py-2.5 rounded-lg border border-secondary-gray text-dark-slate font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmittingWholesale}
                                onClick={handleWholesaleBulkOrder}
                                className="w-2/3 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/95 transition-colors cursor-pointer shadow-md disabled:bg-primary/50"
                            >
                                {isSubmittingWholesale ? "Placing Wholesale Order..." : `Confirm Wholesale Order (${wholesaleQuantity} units)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOMER CHECKOUT MODAL */}
            {checkoutProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-card-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-[650px] max-h-[90vh] overflow-y-auto text-left p-6 md:p-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-dark-slate">Integrated Checkout & Sourcing</h2>
                                <p className="text-xs text-secondary-gray">Complete your order with direct supplier or dealer sourcing choice.</p>
                            </div>
                            <button
                                onClick={() => setCheckoutProduct(null)}
                                className="text-gray-400 hover:text-dark-slate text-2xl font-bold p-1 cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="bg-[#FAFBFD] p-4 rounded-lg border border-[#E2E8F0] mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-bold text-secondary-gray uppercase">{checkoutProduct.category}</span>
                                    <h3 className="text-base font-bold text-dark-slate">{checkoutProduct.name}</h3>
                                    <p className="text-xs text-secondary-gray">{checkoutProduct.price}</p>
                                </div>
                                <div className="text-right">
                                    <label className="block text-xs font-bold text-dark-slate mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={orderQuantity}
                                        onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 p-1.5 border border-secondary-gray rounded text-center font-bold bg-white text-dark-slate outline-none"
                                    />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-dark-slate">Subtotal:</span>
                                <span className="text-lg font-extrabold text-primary">
                                    ${(checkoutProduct.numericPrice * orderQuantity).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-dark-slate mb-2">
                                Choose Sourcing Channel:
                            </label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSourcingChoice("supplier");
                                        if (availableSuppliers.length > 0) setSelectedPartyId(availableSuppliers[0].id);
                                    }}
                                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                                        sourcingChoice === "supplier"
                                            ? "border-primary bg-blue-50/50 ring-2 ring-primary/20"
                                            : "border-[#E2E8F0] bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="block font-bold text-sm text-dark-slate">Direct from Supplier</span>
                                    <span className="block text-xs text-secondary-gray">Refinery direct wholesale</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSourcingChoice("dealer");
                                        if (availableDealers.length > 0) setSelectedPartyId(availableDealers[0].id);
                                    }}
                                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                                        sourcingChoice === "dealer"
                                            ? "border-primary bg-blue-50/50 ring-2 ring-primary/20"
                                            : "border-[#E2E8F0] bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="block font-bold text-sm text-dark-slate">Via Local Dealer</span>
                                    <span className="block text-xs text-secondary-gray">Regional distributor hub</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-secondary-gray mb-1">
                                    Select {sourcingChoice === "supplier" ? "Supplier Refinery" : "Authorized Dealer"}:
                                </label>
                                <select
                                    value={selectedPartyId}
                                    onChange={(e) => setSelectedPartyId(Number(e.target.value))}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate outline-none"
                                >
                                    {sourcingChoice === "supplier" ? (
                                        availableSuppliers.length > 0 ? (
                                            availableSuppliers.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.userName || s.username || `Supplier Partner #${s.id}`} ({s.email || "Verified"})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="1">Direct Central Petroleum Refinery (Default)</option>
                                        )
                                    ) : (
                                        availableDealers.length > 0 ? (
                                            availableDealers.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.userName || d.username || `Authorized Dealer #${d.id}`} ({d.email || "Verified"})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="1">Metropolitan Authorized Oil Dealer (Default)</option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-dark-slate mb-1">Delivery Destination Address</label>
                            <input
                                type="text"
                                value={deliveryAddress}
                                placeholder="Enter full delivery address..."
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate outline-none"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-5 mb-6">
                            <h4 className="text-sm font-bold text-dark-slate mb-3">Payment Information</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-secondary-gray mb-1">Card Type</label>
                                        <select
                                            value={cardType}
                                            onChange={(e) => setCardType(e.target.value)}
                                            className="w-full p-2 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                        >
                                            <option value="Visa">Visa</option>
                                            <option value="MasterCard">MasterCard</option>
                                            <option value="American Express">American Express</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-secondary-gray mb-1">Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={cardHolder}
                                            placeholder="Name on card"
                                            onChange={(e) => setCardHolder(e.target.value)}
                                            className="w-full p-2 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none font-mono"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-secondary-gray mb-1">Expiry Date</label>
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            placeholder="MM/YY"
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            className="w-full p-2 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-secondary-gray mb-1">CVV / Security Code</label>
                                        <input
                                            type="password"
                                            maxLength={4}
                                            value={cardCvv}
                                            placeholder="***"
                                            onChange={(e) => setCardCvv(e.target.value)}
                                            className="w-full p-2 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none text-center font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setCheckoutProduct(null)}
                                className="w-1/3 py-3 rounded-lg border border-secondary-gray text-dark-slate font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isSubmittingOrder}
                                onClick={handleCompleteOrder}
                                className="w-2/3 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/95 transition-colors cursor-pointer shadow-md disabled:bg-primary/50"
                            >
                                {isSubmittingOrder 
                                    ? "Processing Order..." 
                                    : `Pay $${(checkoutProduct.numericPrice * orderQuantity).toFixed(2)} & Confirm Order`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
