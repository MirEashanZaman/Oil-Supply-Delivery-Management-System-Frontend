"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";
import { getPusherClient, ChatMessage } from "@/lib/pusher";
import { checkEmailUniqueness } from "@/lib/email-checker";

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
    customerId?: number;
    customerName?: string;
    customerEmail?: string;
    deliveryDate?: string;
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
    image: string;
};

type SystemUser = {
    id: number;
    username?: string;
    userName?: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    title?: string;
    role?: string;
    createdAt?: string;
    joiningDate?: string;
};
const PRODUCT_IMAGE_MAP: Record<number, string> = {
    1: "/Brent Crude Oil.jpg",
    2: "/Ultra-Low Sulfur Diesel.jpg",
    3: "/Premium Unleaded Gasoline.jpg",
    4: "/Aviation Turbine Fuel (Jet A-1).jpg",
    5: "/images.jpg",
    6: "/Heavy Marine Fuel Oil (HFO).jpg",
};

const getProductImage = (name?: string, img?: string, id?: number | string) => {
    if (typeof window !== "undefined" && id) {
        try {
            const customStored = localStorage.getItem(`product_img_${id}`);
            if (customStored) return customStored;
        } catch {
        }
    }
    if (img && (img.startsWith("/") || img.startsWith("http")) && img !== "/Brent Crude Oil.jpg") {
        return img;
    }
    const lower = (name || "").toLowerCase();
    if (lower.includes("lpg") || lower.includes("liquefied") || lower.includes("cylinder") || lower.includes("propane") || lower.includes("butane")) {
        return "/images.jpg";
    }
    if (lower.includes("diesel") || lower.includes("sulfur") || lower.includes("ulsd") || lower.includes("gasoil")) {
        return "/Ultra-Low Sulfur Diesel.jpg";
    }
    if (lower.includes("gasoline") || lower.includes("petrol") || lower.includes("octane") || lower.includes("unleaded") || lower.includes("mogas")) {
        return "/Premium Unleaded Gasoline.jpg";
    }
    if (lower.includes("jet") || lower.includes("aviation") || lower.includes("turbine") || lower.includes("a-1") || lower.includes("kerosene")) {
        return "/Aviation Turbine Fuel (Jet A-1).jpg";
    }
    if (lower.includes("marine") || lower.includes("bunker") || lower.includes("hfo") || lower.includes("heavy") || lower.includes("fuel oil")) {
        return "/Heavy Marine Fuel Oil (HFO).jpg";
    }
    if (lower.includes("crude") || lower.includes("brent") || lower.includes("wti") || lower.includes("raw")) {
        return "/Brent Crude Oil.jpg";
    }
    if (id !== undefined && id !== null) {
        const numId = Number(id);
        if (!isNaN(numId) && PRODUCT_IMAGE_MAP[numId]) {
            return PRODUCT_IMAGE_MAP[numId];
        }
        if (!isNaN(numId) && numId > 0) {
            const fallbackImages = [
                "/Brent Crude Oil.jpg",
                "/Ultra-Low Sulfur Diesel.jpg",
                "/Premium Unleaded Gasoline.jpg",
                "/Aviation Turbine Fuel (Jet A-1).jpg",
                "/images.jpg",
                "/Heavy Marine Fuel Oil (HFO).jpg",
            ];
            return fallbackImages[(numId - 1) % fallbackImages.length];
        }
    }
    if (img && (img.startsWith("/") || img.startsWith("http"))) {
        return img;
    }
    return "/Brent Crude Oil.jpg";
};


export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "inventory" | "users_crud" | "monitoring" | "profile" | "directory" | "messages">("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [trackedOrderStatus, setTrackedOrderStatus] = useState<string | null>(null);
    const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);
    const [deliveryDates, setDeliveryDates] = useState<{ [orderId: number]: string }>({});

    const [customInventory, setCustomInventory] = useState<Product[]>([]);
    const [supplierOperationalStatus, setSupplierOperationalStatus] = useState<string>("active");

    const [monitorMetrics, setMonitorMetrics] = useState<any>(null);
    const [allMergedUsers, setAllMergedUsers] = useState<SystemUser[]>([]);
    const [selectedJoiningDate, setSelectedJoiningDate] = useState<string>("");
    const [dateSearchResults, setDateSearchResults] = useState<SystemUser[]>([]);

    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [newRole, setNewRole] = useState<"customer" | "dealer" | "supplier">("customer");
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserPhone, setNewUserPhone] = useState("");
    const [newUserAddress, setNewUserAddress] = useState("");
    const [newUserEmailError, setNewUserEmailError] = useState("");

    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [editTargetUserName, setEditTargetUserName] = useState("");
    const [editTargetPhone, setEditTargetPhone] = useState("");
    const [editTargetAddress, setEditTargetAddress] = useState("");

    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editOrderStatus, setEditOrderStatus] = useState("");
    const [editOrderQuantity, setEditOrderQuantity] = useState(1);
    const [editOrderAddress, setEditOrderAddress] = useState("");

    const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
    const [availableDealers, setAvailableDealers] = useState<any[]>([]);

    const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
    const [sourcingChoice, setSourcingChoice] = useState<"supplier" | "dealer">("supplier");
    const [selectedPartyId, setSelectedPartyId] = useState<number | "">("");
    const [orderQuantity, setOrderQuantity] = useState<number>(1);
    const [deliveryAddress, setDeliveryAddress] = useState<string>("");
    const [cardType, setCardType] = useState<string>("Visa");
    const [cardNumber, setCardNumber] = useState<string>("");
    const [cardHolder, setCardHolder] = useState<string>("");
    const [cardExpiry, setCardExpiry] = useState<string>("");
    const [cardCvv, setCardCvv] = useState<string>("");
    const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

    const [wholesaleProduct, setWholesaleProduct] = useState<Product | null>(null);
    const [wholesaleSupplierId, setWholesaleSupplierId] = useState<number | "">("");
    const [wholesaleQuantity, setWholesaleQuantity] = useState<number>(50);
    const [isSubmittingWholesale, setIsSubmittingWholesale] = useState<boolean>(false);

    const [isPostProductModalOpen, setIsPostProductModalOpen] = useState<boolean>(false);
    const [newProductName, setNewProductName] = useState<string>("");
    const [newProductCategory, setNewProductCategory] = useState<string>("Crude Fuel");
    const [newProductPrice, setNewProductPrice] = useState<number | "">("");
    const [newProductQuantity, setNewProductQuantity] = useState<number | "">("");
    const [newProductDescription, setNewProductDescription] = useState<string>("");
    const [newProductImage, setNewProductImage] = useState<string>("/Brent Crude Oil.jpg");
    const [isSubmittingNewProduct, setIsSubmittingNewProduct] = useState<boolean>(false);

    const [editUsername, setEditUsername] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [profileStatus, setProfileStatus] = useState("");
    const [dbLookupStatus, setDbLookupStatus] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: "msg_init_1",
            sender: "Refinery Dispatch Central",
            email: "refinery@oilsupply-delivery.com",
            role: "Supplier",
            topic: "Refinery Wholesale Availability",
            message: "All crude fuel pipelines and regional tanker depots operating at verified ISO specifications. Real-time dispatches active.",
            timestamp: "09:30 AM",
            channel: "oil-supply-chat",
        },
        {
            id: "msg_init_2",
            sender: "Dhaka Regional Dealer Hub",
            email: "dealer@oilsupply-delivery.com",
            role: "Dealer",
            topic: "Order Dispatch & Logistics",
            message: "Bulk tanker allocations ready for commercial customers. Priority road dispatches scheduled for Kuril and Gazipur depots.",
            timestamp: "10:15 AM",
            channel: "oil-supply-chat",
        }
    ]);
    const [chatInput, setChatInput] = useState<string>("");
    const [chatTopic, setChatTopic] = useState<string>("Order Dispatch & Logistics");
    const [chatChannel, setChatChannel] = useState<string>("oil-supply-chat");
    const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
    const [isPusherActive, setIsPusherActive] = useState<boolean>(true);

    const getRolePath = (role?: string) => {
        return role ? role.toLowerCase() : "customer";
    };

    const getAllUsersUrl = (role?: string) => {
        const r = getRolePath(role);
        if (r === "supplier") return "http://localhost:8000/supplier/getallsupplier";
        if (r === "dealer") return "http://localhost:8000/dealer/all";
        if (r === "admin") return "http://localhost:8000/admin/getallusers";
        return "http://localhost:8000/customer/getallcustomer";
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setDeliveryAddress(parsed.address || "Dhaka, Bangladesh");
            setCardHolder(parsed.userName || parsed.email?.split("@")[0]);
            if (parsed.status) setSupplierOperationalStatus(parsed.status);
            fetchFullProfile(parsed.email, parsed.title);
            fetchSourcingParties();
        } catch (e) {
            console.error("Error parsing user data:", e);
            router.push("/login");
            return;
        }
        setLoading(false);
        fetchCatalogProducts();
    }, []);

    useEffect(() => {
        const pusher = getPusherClient();
        if (!pusher) return;

        const channel = pusher.subscribe("oil-supply-chat");
        channel.bind("pusher:subscription_succeeded", () => {
            setIsPusherActive(true);
        });

        channel.bind("new-message", (data: ChatMessage) => {
            setChatMessages((prev) => [data, ...prev.filter((m) => m.id !== data.id)]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);

    const handleSendChatMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !user) return;

        setIsSendingChat(true);
        const senderName = user.userName || user.email.split("@")[0] || "User";
        const payload = {
            sender: senderName,
            email: user.email,
            role: user.title || "Customer",
            topic: chatTopic,
            message: chatInput.trim(),
            channel: chatChannel,
        };

        try {
            const res = await axios.post("/api/messages", payload);
            if (res.data?.success && res.data?.data) {
                const newMsg = res.data.data;
                setChatMessages((prev) => [newMsg, ...prev.filter((m) => m.id !== newMsg.id)]);
            }
            setChatInput("");
        } catch (err) {
            console.warn("Local fallback for chat message:", err);
            const fallbackMsg: ChatMessage = {
                id: `msg_${Date.now()}`,
                sender: payload.sender,
                email: payload.email,
                role: payload.role,
                topic: payload.topic,
                message: payload.message,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                channel: payload.channel,
            };
            setChatMessages((prev) => [fallbackMsg, ...prev]);
            setChatInput("");
        } finally {
            setIsSendingChat(false);
        }
    };

    const fetchCatalogProducts = async () => {
        setProductsLoading(true);
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
        try {
            const res = await axios.get(`${API_ENDPOINT}/product/list`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (Array.isArray(res.data)) {
                const mapped: Product[] = res.data
                    .sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
                    .map((p: any) => ({
                        id: p.id,
                        name: p.name || `Product #${p.id}`,
                        category: p.category || (p.categories?.[0]?.name) || "Petroleum Grade",
                        price: typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price || "$0.00",
                        numericPrice: typeof p.price === "number" ? p.price : typeof p.numericPrice === "number" ? p.numericPrice : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0,
                        description: p.description || "High-grade petroleum product sourced from certified national pipelines.",
                        inStock: typeof p.quantity === "number" ? p.quantity > 0 : p.inStock !== false,
                        stockLevel: typeof p.quantity === "number"
                            ? (p.quantity <= 0 ? "Out of Stock" : p.quantity < 1000 ? "Low Stock" : "In Stock")
                            : p.stockLevel || "In Stock",
                        image: getProductImage(p.name, p.image, p.id),
                    }));
                setProducts(mapped);
            }
        } catch (err) {
            console.warn("Failed to fetch catalog products from backend:", err);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchSourcingParties = async () => {
        try {
            const [suppliersRes, dealersRes] = await Promise.allSettled([
                axios.get("http://localhost:8000/supplier/getallsupplier", {
                    withCredentials: true,
                    validateStatus: (status) => status < 500,
                }),
                axios.get("http://localhost:8000/dealer/all", {
                    withCredentials: true,
                    validateStatus: (status) => status < 500,
                }),
            ]);

            if (suppliersRes.status === "fulfilled" && suppliersRes.value.status === 200 && Array.isArray(suppliersRes.value.data)) {
                setAvailableSuppliers(suppliersRes.value.data);
            }
            if (dealersRes.status === "fulfilled" && dealersRes.value.status === 200 && Array.isArray(dealersRes.value.data)) {
                setAvailableDealers(dealersRes.value.data);
            }
        } catch (err) {
            console.warn("Failed to load sourcing partners:", err);
        }
    };

    const fetchFullProfile = async (email: string, title?: string) => {
        try {
            const searchRes = await axios.get(`http://localhost:8000/users/search?email=${encodeURIComponent(email)}`, {
                validateStatus: (status) => status < 500,
            });
            if (searchRes.status === 200 && searchRes.data?.user) {
                const match = searchRes.data.user;
                const r = searchRes.data.role || "customer";
                const resolvedTitle = r.charAt(0).toUpperCase() + r.slice(1);
                const fullUser: UserData = {
                    id: match.id,
                    email: match.email,
                    userName: match.username || match.userName || email.split("@")[0],
                    phoneNumber: match.phoneNumber,
                    address: match.address,
                    title: match.title || resolvedTitle,
                    status: match.status || "active",
                    photoUrl: match.filename ? `http://localhost:8000/customer/getimage/${match.filename}` : undefined,
                };
                setUser(fullUser);
                if (match.status) setSupplierOperationalStatus(match.status);
                localStorage.setItem("user", JSON.stringify(fullUser));

                setEditUsername(fullUser.userName || "");
                setEditPhone(match.phoneNumber || "");
                setEditAddress(match.address || "");

                fetchOrders(match.id, fullUser.title);
                if (fullUser.title === "Dealer" || fullUser.title === "Supplier") {
                    fetchCustomInventory(match.id, fullUser.title);
                }
                if (fullUser.title === "Admin") {
                    fetchAdminMonitoringData();
                    fetchAllMergedUsers();
                }
                return;
            }
        } catch (searchErr) {
            console.warn("User lookup error:", searchErr);
        }

        const url = getAllUsersUrl(title);
        try {
            const res = await axios.get(url, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 401) {
                console.warn("Session expired or unauthorized. Please sign in again.");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }
            if (res.status === 200 && Array.isArray(res.data)) {
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
                    if (match.title === "Admin" || title === "Admin") {
                        fetchAdminMonitoringData();
                        fetchAllMergedUsers();
                    }
                }
            }
        } catch (err) {
            console.warn("Failed to load user profile list:", err);
        }
    };

    const fetchAdminMonitoringData = async () => {
        try {
            const res = await axios.get("http://localhost:8000/admin/monitor-data", {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200) {
                setMonitorMetrics(res.data);
            }
        } catch (err) {
            console.warn("Failed to fetch monitoring data:", err);
        }
    };

    const fetchAllMergedUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8000/admin/getallusers", {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 && Array.isArray(res.data)) {
                setAllMergedUsers(res.data);
            }
        } catch (err) {
            console.warn("Failed to fetch merged users:", err);
        }
    };

    const handleSearchJoiningDate = async () => {
        if (!selectedJoiningDate) {
            alert("Please select a date to search.");
            return;
        }
        try {
            const res = await axios.get(`http://localhost:8000/admin/joiningdate?date=${encodeURIComponent(selectedJoiningDate)}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            setDateSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.warn("Date search error:", err);
            setDateSearchResults([]);
        }
    };

    const handleAdminCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setNewUserEmailError("");

        try {
            const check = await checkEmailUniqueness(newUserEmail);
            if (!check.isUnique) {
                const msg = `Cannot create account: An account with the email "${newUserEmail}" already exists as a ${check.existingRole}. There can be only one account per email address across the entire system.`;
                setNewUserEmailError(msg);
                alert(msg);
                return;
            }
        } catch (checkErr) {
            console.warn("Email uniqueness pre-check failed:", checkErr);
        }

        try {
            const res = await axios.post(
                `http://localhost:8000/admin/${newRole}`,
                {
                    userName: newUserName,
                    email: newUserEmail,
                    password: newUserPassword || "password123",
                    phoneNumber: newUserPhone,
                    address: newUserAddress,
                    title: newRole.charAt(0).toUpperCase() + newRole.slice(1),
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );
            if (res.status === 200 || res.status === 201) {
                alert(`New ${newRole.toUpperCase()} user created successfully!`);
                setIsCreateUserModalOpen(false);
                setNewUserName("");
                setNewUserEmail("");
                setNewUserPassword("");
                setNewUserPhone("");
                setNewUserAddress("");
                setNewUserEmailError("");
                fetchAllMergedUsers();
                fetchAdminMonitoringData();
            } else {
                alert(res.data?.message || "Failed to create user.");
            }
        } catch (err: any) {
            console.warn("Create user failed:", err);
            const apiMsg = err.response?.data?.message || "Failed to create user.";
            if (err.response?.status === 409) {
                setNewUserEmailError(`Email "${newUserEmail}" already exists in the system. There can only be one account per email.`);
            }
            alert(Array.isArray(apiMsg) ? apiMsg.join(", ") : apiMsg);
        }
    };

    const handleAdminUpdateUser = async () => {
        if (!editingUser) return;
        const role = (editingUser.title || editingUser.role || "customer").toLowerCase();

        if (role === "admin") {
            alert("Security Constraint: Admins cannot modify other Admins.");
            return;
        }

        try {
            const res = await axios.patch(
                `http://localhost:8000/admin/${role}/${editingUser.id}`,
                {
                    userName: editTargetUserName,
                    phoneNumber: editTargetPhone,
                    address: editTargetAddress,
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );
            if (res.status === 200 || res.status === 204) {
                alert("User updated successfully by Admin!");
                setEditingUser(null);
                fetchAllMergedUsers();
            } else {
                alert(res.data?.message || "Failed to update user.");
            }
        } catch (err: any) {
            console.warn("Update user failed:", err);
            alert(err.response?.data?.message || "Failed to update user.");
        }
    };

    const handleAdminDeleteUser = async (targetUser: SystemUser) => {
        const role = (targetUser.title || targetUser.role || "customer").toLowerCase();

        if (role === "admin") {
            alert("Security Constraint: Admins cannot delete other Admins.");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${targetUser.userName || targetUser.email} (${role.toUpperCase()})? This will cascade-delete all linked records.`
        );
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`http://localhost:8000/admin/${role}/${targetUser.id}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 || res.status === 204) {
                alert("User and linked records successfully purged by Admin.");
                fetchAllMergedUsers();
                fetchAdminMonitoringData();
                if (user?.id) fetchOrders(user.id, user.title);
            } else {
                alert(res.data?.message || "Failed to delete user.");
            }
        } catch (err: any) {
            console.warn("Delete user failed:", err);
            alert(err.response?.data?.message || "Failed to delete user.");
        }
    };

    const handleAdminUpdateOrder = async () => {
        if (!editingOrder) return;
        try {
            const res = await axios.patch(
                `http://localhost:8000/admin/order/${editingOrder.id}`,
                {
                    status: editOrderStatus.toLowerCase(),
                    quantity: Number(editOrderQuantity) || 1,
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );
            if (res.status === 200 || res.status === 204) {
                if (editOrderAddress && editingOrder.customerId) {
                    try {
                        await axios.patch(
                            `http://localhost:8000/admin/customer/${editingOrder.customerId}`,
                            { address: editOrderAddress },
                            { withCredentials: true, validateStatus: (status) => status < 500 }
                        );
                    } catch (custErr) {
                        console.warn("Could not update customer destination address:", custErr);
                    }
                }

                setOrders(prev => prev.map(o => o.id === editingOrder.id ? {
                    ...o,
                    status: editOrderStatus.toLowerCase(),
                    quantity: Number(editOrderQuantity) || 1,
                    address: editOrderAddress || o.address,
                } : o));

                alert(`Order #${editingOrder.id} successfully updated by Admin!`);
                setEditingOrder(null);
                if (user?.id) fetchOrders(user.id, user.title);
                fetchAdminMonitoringData();
            } else {
                alert(res.data?.message || "Failed to update order.");
            }
        } catch (err: any) {
            console.warn("Update order failed:", err);
            alert(err.response?.data?.message || "Failed to update order.");
        }
    };

    const handleAdminDeleteOrder = async (orderId: number) => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete Order #${orderId}? Associated OrderDetails, Payment, and Delivery records will be purged.`);
        if (!confirmDelete) return;

        try {
            const res = await axios.delete(`http://localhost:8000/admin/order/${orderId}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 || res.status === 204) {
                alert(`Order #${orderId} and associated records purged successfully.`);
                if (user?.id) fetchOrders(user.id, user.title);
                fetchAdminMonitoringData();
            } else {
                alert(res.data?.message || "Failed to delete order.");
            }
        } catch (err: any) {
            console.warn("Delete order failed:", err);
            alert(err.response?.data?.message || "Failed to delete order.");
        }
    };

    const fetchCustomInventory = async (partyId: number, title?: string) => {
        const r = getRolePath(title);
        if (r !== "dealer" && r !== "supplier") return;
        if (!partyId) return;
        try {
            const res = await axios.get(`http://localhost:8000/${r}/${partyId}/products`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 && Array.isArray(res.data)) {
                const mapped: Product[] = res.data.map((p: any) => ({
                    ...p,
                    name: p.name || `Product #${p.id}`,
                    category: p.category || (p.categories?.[0]?.name) || "Petroleum Grade",
                    price: typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price || "$0.00",
                    numericPrice: typeof p.price === "number" ? p.price : typeof p.numericPrice === "number" ? p.numericPrice : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0,
                    description: p.description || "High-grade petroleum product sourced from certified national pipelines.",
                    inStock: typeof p.quantity === "number" ? p.quantity > 0 : p.inStock !== false,
                    stockLevel: typeof p.quantity === "number"
                        ? (p.quantity <= 0 ? "Out of Stock" : p.quantity < 1000 ? "Low Stock" : "In Stock")
                        : p.stockLevel || "In Stock",
                    image: getProductImage(p.name, p.image, p.id),
                }));
                setCustomInventory(mapped);
            }
        } catch (err) {
            console.warn("Failed to fetch inventory:", err);
        }
    };

    const handleAssignProduct = async (product: Product) => {
        if (!user || !user.id) return;
        const r = getRolePath(user.title);
        if (r !== "dealer" && r !== "supplier") {
            alert("Only authorized Dealers and Suppliers can assign products to stock inventory or supply portfolio.");
            return;
        }
        try {
            const res = await axios.post(
                `http://localhost:8000/${r}/${user.id}/products`,
                { productIds: [product.id] },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );
            if (res.status === 200 || res.status === 201) {
                alert(`Product "${product.name}" added to your ${user.title === "Supplier" ? "Supply Portfolio" : "Stock Inventory"}!`);
                fetchCustomInventory(user.id, user.title);
            } else {
                console.warn("Stock assignment response:", res.status, res.data);
                alert(res.data?.message || "Failed to assign product to stock inventory.");
            }
        } catch (err: any) {
            console.warn("Failed to assign product:", err);
            alert(err.response?.data?.message || "Failed to assign product.");
        }
    };

    const handleRemoveProductFromStock = async (productId: number) => {
        if (!user || !user.id) return;
        const confirmRemove = window.confirm(`Are you sure you want to remove this product?`);
        if (!confirmRemove) return;

        const r = getRolePath(user.title);
        try {
            const res = await axios.delete(`http://localhost:8000/${r}/${user.id}/products/${productId}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 || res.status === 204) {
                alert("Product removed successfully.");
                fetchCustomInventory(user.id, user.title);
            } else {
                console.warn("Remove product response:", res.status, res.data);
                alert(res.data?.message || "Failed to remove product.");
            }
        } catch (err) {
            console.warn("Failed to remove product:", err);
            alert("Failed to remove product.");
        }
    };

    const handleCreateAndPostProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProductName.trim()) {
            alert("Please enter a valid product name.");
            return;
        }
        if (!newProductPrice || Number(newProductPrice) <= 0) {
            alert("Please enter a valid price greater than $0.");
            return;
        }
        if (!newProductQuantity || Number(newProductQuantity) <= 0) {
            alert("Please enter a valid stock quantity greater than 0.");
            return;
        }

        setIsSubmittingNewProduct(true);
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
        try {
            const createRes = await axios.post(
                `${API_ENDPOINT}/product/create`,
                {
                    name: newProductName.trim(),
                    price: Number(newProductPrice),
                    quantity: Number(newProductQuantity),
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            if (createRes.status !== 200 && createRes.status !== 201) {
                alert(createRes.data?.message || "Failed to publish product.");
                return;
            }

            const createdProduct = createRes.data;
            if (createdProduct && createdProduct.id && newProductImage) {
                try {
                    localStorage.setItem(`product_img_${createdProduct.id}`, newProductImage);
                } catch {
                }
            }

            if (user && user.id && (isDealer || isSupplier)) {
                const role = getRolePath(user.title);
                try {
                    await axios.post(
                        `${API_ENDPOINT}/${role}/${user.id}/products`,
                        { productIds: [createdProduct.id] },
                        { withCredentials: true, validateStatus: (status) => status < 500 }
                    );
                } catch (assignErr) {
                    console.warn("Could not automatically link to inventory:", assignErr);
                }
            }

            alert(`Product "${newProductName}" published and posted successfully!`);
            setNewProductName("");
            setNewProductPrice("");
            setNewProductQuantity("");
            setNewProductDescription("");
            setIsPostProductModalOpen(false);

            fetchCatalogProducts();
            if (user && user.id && (isDealer || isSupplier)) {
                fetchCustomInventory(user.id, user.title);
            }
        } catch (err: any) {
            console.warn("Failed to post product:", err);
            alert(err.response?.data?.message || "Failed to publish product.");
        } finally {
            setIsSubmittingNewProduct(false);
        }
    };

    const handleToggleSupplierStatus = async () => {
        if (!user || !user.id) return;
        const newStatus = supplierOperationalStatus === "active" ? "inactive" : "active";
        try {
            const res = await axios.put(
                `http://localhost:8000/supplier/updatesupplier/${user.id}/${newStatus}`,
                {},
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );
            if (res.status === 200 || res.status === 204) {
                setSupplierOperationalStatus(newStatus);
                setUser({ ...user, status: newStatus });
                alert(`Supplier operational status updated to: ${newStatus.toUpperCase()}`);
                fetchFullProfile(user.email, user.title);
            } else {
                alert(res.data?.message || "Failed to update operational status.");
            }
        } catch (err) {
            console.warn("Failed to update status:", err);
            alert("Failed to update operational status.");
        }
    };

    const handleWholesaleBulkOrder = async () => {
        if (!user || !wholesaleProduct) return;
        const supplierId = wholesaleSupplierId || (availableSuppliers.length > 0 ? availableSuppliers[0].id : null);
        if (!supplierId) {
            alert("No refinery suppliers are currently available to fulfill this wholesale order.");
            return;
        }

        setIsSubmittingWholesale(true);
        try {
            const res = await axios.post(
                "http://localhost:8000/dealer/placeorder",
                {
                    productId: wholesaleProduct.id,
                    supplierId: Number(supplierId),
                    quantity: wholesaleQuantity,
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            if (res.status === 200 || res.status === 201) {
                alert(`Wholesale bulk order for ${wholesaleQuantity} units of ${wholesaleProduct.name} placed successfully!`);
                setWholesaleProduct(null);
                if (user.id) fetchOrders(user.id, user.title);
            } else {
                alert(res.data?.message || "Wholesale ordering failed.");
            }
        } catch (err: any) {
            console.warn("Wholesale ordering failed:", err);
            alert(err.response?.data?.message || "Wholesale ordering failed.");
        } finally {
            setIsSubmittingWholesale(false);
        }
    };

    const fetchOrders = async (id: number, title?: string) => {
        const r = getRolePath(title);
        if (r === "customer") {
            if (!id) return;
            try {
                const res = await axios.get(`http://localhost:8000/customer/${id}/orders`, {
                    withCredentials: true,
                    validateStatus: (status) => status < 500,
                });
                if (res.status === 200 && Array.isArray(res.data)) {
                    setOrders(res.data);
                }
            } catch (err) {
                console.warn("Failed to fetch customer orders history:", err);
            }
        } else {
            try {
                const res = await axios.get("http://localhost:8000/customer/getallcustomer", {
                    withCredentials: true,
                    validateStatus: (status) => status < 500,
                });
                if (res.status === 200 && Array.isArray(res.data)) {
                    const allOrders: Order[] = [];
                    res.data.forEach((cust: any) => {
                        if (Array.isArray(cust.orders)) {
                            cust.orders.forEach((o: any) => {
                                allOrders.push({
                                    id: o.id,
                                    quantity: o.quantity || 1,
                                    status: o.status || "pending",
                                    address: o.address || cust.address,
                                    customerId: cust.id,
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
                console.warn("Failed to load global orders:", err);
            }
        }
    };

    const handleOpenCheckout = (product: Product) => {
        setCheckoutProduct(product);
        setOrderQuantity(1);
        if (user?.address) setDeliveryAddress(user.address);
        if (sourcingChoice === "supplier" && availableSuppliers.length > 0) {
            setSelectedPartyId(availableSuppliers[0].id);
        } else if (sourcingChoice === "dealer" && availableDealers.length > 0) {
            setSelectedPartyId(availableDealers[0].id);
        }
    };

    const handleCompleteOrder = async () => {
        if (!user || !user.id || !checkoutProduct) return;

        if (!selectedPartyId) {
            alert(`Please select an authorized ${sourcingChoice === "supplier" ? "refinery supplier" : "dealer"}.`);
            return;
        }

        const destination = deliveryAddress.trim() || user.address || "";
        if (!destination) {
            alert("Please enter a delivery destination address.");
            return;
        }

        if (!cardNumber.trim()) {
            alert("Please provide a valid card number for payment processing.");
            return;
        }

        setIsSubmittingOrder(true);
        const totalAmount = Number((checkoutProduct.numericPrice * orderQuantity).toFixed(2));

        const orderPayload: any = {
            quantity: orderQuantity,
            address: destination,
            status: "pending",
            product: { id: checkoutProduct.id },
            payment: {
                cardNumber: cardNumber.trim(),
                cardType: cardType,
                amount: totalAmount,
                status: "completed",
            },
        };

        if (sourcingChoice === "supplier") {
            orderPayload.supplier = { id: Number(selectedPartyId) };
        } else {
            orderPayload.dealer = { id: Number(selectedPartyId) };
        }

        try {
            const res = await axios.post(
                `http://localhost:8000/customer/${user.id}/orders`,
                orderPayload,
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            if (res.status === 200 || res.status === 201) {
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
                        { withCredentials: true, validateStatus: (status) => status < 500 }
                    );
                } catch (mailErr) {
                    console.warn("Mail dispatch error:", mailErr);
                }

                alert(`Order placed successfully!\nTotal: $${totalAmount}\nEmail receipt sent to ${user.email}`);
                setCheckoutProduct(null);
                fetchOrders(user.id, user.title);
                setActiveTab("orders");
            } else {
                alert(res.data?.message || "Order placement failed.");
            }
        } catch (err: any) {
            console.warn("Order submission failed:", err);
            alert(err.response?.data?.message || "Order placement failed.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

    const handleConfirmOrRejectOrder = async (orderId: number, status: "confirmed" | "rejected", customerEmail?: string) => {
        if (!user) return;
        const r = getRolePath(user.title);
        try {
            const res = await axios.put(
                `http://localhost:8000/${r}/confirmorder/${orderId}`,
                { status: status },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            if (res.status === 200 || res.status === 204) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

                if (customerEmail) {
                    try {
                        await axios.post(
                            `http://localhost:8000/${r}/send-email`,
                            {
                                to: customerEmail,
                                subject: `Order #${orderId} Update: ${status.toUpperCase()}`,
                                text: `Dear Customer,\n\nYour order #${orderId} has been marked as '${status}'.\n\nThank you!`,
                            },
                            { withCredentials: true, validateStatus: (status) => status < 500 }
                        );
                    } catch (mailErr) {
                        console.warn("Mail send error:", mailErr);
                    }
                }

                alert(`Order #${orderId} marked as ${status.toUpperCase()} successfully!`);
                fetchOrders(user.id || 1, user.title);
            } else {
                alert(res.data?.message || `Failed to ${status} order.`);
            }
        } catch (err) {
            console.warn(`Failed to ${status} order:`, err);
            alert(`Failed to update order status.`);
        }
    };

    const handleScheduleDelivery = async (orderId: number, customerEmail?: string) => {
        if (!user) return;
        const r = getRolePath(user.title);
        const date = deliveryDates[orderId];
        if (!date) {
            alert("Please choose a delivery date first.");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:8000/${r}/scheduledelivery`,
                { orderId, deliveryDate: date },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            if (res.status === 200 || res.status === 201) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "scheduled", deliveryDate: date } : o));

                if (customerEmail) {
                    try {
                        await axios.post(
                            `http://localhost:8000/${r}/send-email`,
                            {
                                to: customerEmail,
                                subject: `Delivery Scheduled for Order #${orderId}`,
                                text: `Dear Customer,\n\nYour order #${orderId} has been scheduled for delivery on ${date}.\n\nThank you!`,
                            },
                            { withCredentials: true, validateStatus: (status) => status < 500 }
                        );
                    } catch (mailErr) {
                        console.warn("Mail send notice:", mailErr);
                    }
                }

                alert(`Delivery successfully scheduled for ${date}! Email update dispatched.`);
                fetchOrders(user.id || 1, user.title);
            } else {
                alert(res.data?.message || "Failed to schedule delivery.");
            }
        } catch (err) {
            console.warn("Failed to schedule delivery:", err);
            alert("Failed to schedule delivery.");
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!user || !user.id) return;
        const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmCancel) return;

        try {
            const res = await axios.delete(`http://localhost:8000/customer/${user.id}/orders/${orderId}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 || res.status === 204) {
                alert("Order cancelled successfully.");
                fetchOrders(user.id, user.title);
            } else {
                alert(res.data?.message || "Failed to cancel order.");
            }
        } catch (err) {
            console.warn("Failed to cancel order:", err);
            alert("Failed to cancel order.");
        }
    };

    const handleTrackOrder = async (orderId: number) => {
        setTrackedOrderId(orderId);
        setTrackedOrderStatus("Connecting to delivery tracker...");
        const r = getRolePath(user?.title);
        const trackingRole = r === "dealer" ? "dealer" : "customer";
        try {
            const res = await axios.get(`http://localhost:8000/${trackingRole}/trackorder/${orderId}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 && res.data) {
                const liveStatus = res.data.order?.status || res.data.status || res.data.message || "In Transit / Scheduled";
                const display = typeof liveStatus === "string" ? (liveStatus.charAt(0).toUpperCase() + liveStatus.slice(1)) : "In Transit / Scheduled";
                setTrackedOrderStatus(display);
            } else {
                setTrackedOrderStatus("In Transit / Carrier Processing");
            }
        } catch (err) {
            console.warn("Tracking fallback:", err);
            setTrackedOrderStatus("In Transit / Carrier Processing");
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !user.id) return;
        const r = getRolePath(user.title);
        setProfileStatus("");
        try {
            const res = await axios.patch(
                `http://localhost:8000/${r}/${user.id}`,
                {
                    userName: editUsername,
                    phoneNumber: editPhone,
                    address: editAddress,
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );
            if (res.status === 200 || res.status === 204) {
                setProfileStatus("Profile details updated successfully!");
                fetchFullProfile(user.email, user.title);
            } else {
                setProfileStatus(res.data?.message || "Failed to update profile settings.");
            }
        } catch (err) {
            console.warn("Failed to update profile:", err);
            setProfileStatus("Failed to update profile settings.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete your ${user.title} account?`);
        if (!confirmDelete) return;

        const r = getRolePath(user.title);
        try {
            let url = `http://localhost:8000/customer/${encodeURIComponent(user.userName || user.email.split("@")[0])}`;
            if (r === "supplier" || r === "dealer" || r === "admin") {
                url = `http://localhost:8000/${r}/${user.id}`;
            }
            const res = await axios.delete(url, { withCredentials: true, validateStatus: (status) => status < 500 });
            if (res.status === 200 || res.status === 204) {
                alert("Your account has been deleted.");
                handleLogout();
            } else {
                alert(res.data?.message || "Failed to delete account. Please try again.");
            }
        } catch (err) {
            console.warn("Account deletion failed:", err);
            alert("Failed to delete account. Please try again.");
        }
    };

    const handleSearchUsers = async () => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await axios.get(`http://localhost:8000/customer/search?userName=${encodeURIComponent(searchQuery)}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            setSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.warn("User search fallback:", err);
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
    const isAdmin = getRolePath(user.title) === "admin";

    return (
        <>
            <MyHeader name="Dashboard" message="Oil Supply & Delivery Management System - Operations and logistics portal" />
            <MyNavigation />

            <div className="w-full max-w-[1200px] card bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl p-6 mb-8 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-4">
                        {user.photoUrl ? (
                            <img
                                src={user.photoUrl}
                                alt="Profile"
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0F2747]/20 shadow-sm"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-[#0F2747] text-white flex items-center justify-center font-black text-xl shadow-sm">
                                {(user.userName || user.email)[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight">
                                    Welcome, {user.userName || user.email}
                                </h2>
                                <span className="badge bg-[#0F2747] text-[#F59E0B] font-bold uppercase text-xs border-none px-3 py-1">
                                    Role: {user.title || "User"}
                                </span>
                                {isSupplier && (
                                    <span className={`badge font-bold uppercase text-xs text-white border-none px-3 py-1 ${
                                        supplierOperationalStatus === "active" ? "bg-[#16A34A]" : "bg-[#DC2626]"
                                    }`}>
                                        Status: {supplierOperationalStatus}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs sm:text-sm text-[#64748B] mt-1 flex items-center gap-3 flex-wrap">
                                <span>Email: <strong className="text-[#1E293B]">{user.email}</strong></span>
                                <span>Hub: <strong className="text-[#1E293B]">{user.address || "Main Operations Depot"}</strong></span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn bg-[#DC2626] hover:bg-[#b91c1c] btn-sm text-white font-semibold border-none shadow-sm rounded-xl flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer"
                    >
                        <span>Sign Out</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-2 pt-4 overflow-x-auto flex-wrap">
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => {
                                    setActiveTab("monitoring");
                                    fetchAdminMonitoringData();
                                }}
                                className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "monitoring"
                                        ? "btn-primary text-white shadow-md"
                                        : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
                                    }`}
                            >
                                System Health (Monitor)
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("users_crud");
                                    fetchAllMergedUsers();
                                }}
                                className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "users_crud"
                                        ? "btn-primary text-white shadow-md"
                                        : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
                                    }`}
                            >
                                Global User CRUD
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setActiveTab("products")}
                        className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "products"
                                ? "btn-primary text-white shadow-md"
                                : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
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
                            className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "inventory"
                                    ? "btn-primary text-white shadow-md"
                                    : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
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
                        className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "orders"
                                ? "btn-primary text-white shadow-md"
                                : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
                            }`}
                    >
                        {isCustomer ? "My Orders & Tracking" : isAdmin ? "Global Order Control" : "Fulfill Orders & Logistics"}
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("profile");
                            if (user.email) fetchFullProfile(user.email, user.title);
                        }}
                        className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "profile"
                                ? "btn-primary text-white shadow-md"
                                : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
                            }`}
                    >
                        Profile Settings
                    </button>

                    {!isAdmin && (
                        <button
                            onClick={() => setActiveTab("directory")}
                            className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "directory"
                                    ? "btn-primary text-white shadow-md"
                                    : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
                                }`}
                        >
                            Directory Search
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab("messages")}
                        className={`btn btn-sm font-semibold transition-all cursor-pointer ${activeTab === "messages"
                                ? "btn-primary text-white shadow-md"
                                : "btn-ghost text-slate-600 hover:bg-base-200 border border-base-300"
                            }`}
                    >
                        Messages (PusherJS)
                    </button>
                </div>
            </div>

            {isAdmin && activeTab === "monitoring" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-slate">System Health & Live Monitoring</h1>
                            <p className="text-sm text-secondary-gray">Real-time system telemetry and database metrics (`GET /admin/monitor-data`).</p>
                        </div>
                        <button
                            onClick={fetchAdminMonitoringData}
                            className="bg-primary text-white px-4 py-2 rounded text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                        >
                            Refresh Metrics
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                        <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                            <span className="text-xs font-bold text-secondary-gray uppercase">Total Registered Users</span>
                            <h3 className="text-3xl font-extrabold text-primary mt-1">
                                {allMergedUsers.length || monitorMetrics?.totalUsers || 0}
                            </h3>
                            <p className="text-xs text-green-600 font-semibold mt-1">Across 4 Database Tables</p>
                        </div>

                        <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                            <span className="text-xs font-bold text-secondary-gray uppercase">Active Orders in Queue</span>
                            <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                                {orders.length || monitorMetrics?.activeOrders || 0}
                            </h3>
                            <p className="text-xs text-secondary-gray mt-1">Integrated Supply Pipeline</p>
                        </div>

                        <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                            <span className="text-xs font-bold text-secondary-gray uppercase">Catalog Products</span>
                            <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                                {products.length}
                            </h3>
                            <p className="text-xs text-secondary-gray mt-1">High-Grade Petroleum Grades</p>
                        </div>

                        <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                            <span className="text-xs font-bold text-secondary-gray uppercase">System Health Status</span>
                            <h3 className="text-3xl font-extrabold text-green-600 mt-1">
                                100%
                            </h3>
                            <p className="text-xs text-green-600 font-semibold mt-1">Operational & Connected</p>
                        </div>
                    </div>

                    <div className="bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm mb-6">
                        <h2 className="text-lg font-bold text-dark-slate mb-1">Multi-Table Registration Date Search</h2>
                        <p className="text-xs text-secondary-gray mb-4">
                            Simultaneously search all 4 database tables (Admins, Customers, Dealers, Suppliers) by registration date (`GET /admin/joiningdate`).
                        </p>

                        <div className="flex gap-3 max-w-[500px] mb-4">
                            <input
                                type="date"
                                value={selectedJoiningDate}
                                onChange={(e) => setSelectedJoiningDate(e.target.value)}
                                className="flex-grow p-2.5 border border-secondary-gray rounded bg-white text-dark-slate outline-none text-sm"
                            />
                            <button
                                onClick={handleSearchJoiningDate}
                                className="bg-primary text-white px-5 py-2.5 rounded font-semibold text-sm hover:bg-primary/95 transition-colors cursor-pointer"
                            >
                                Search 4 Tables
                            </button>
                        </div>

                        {dateSearchResults.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-dark-slate mb-3">Matching Registrations ({dateSearchResults.length} found):</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {dateSearchResults.map((u: any, idx: number) => (
                                        <div key={idx} className="bg-[#FAFBFD] p-4 rounded-lg border border-primary/20">
                                            <span className="text-xs font-bold text-primary uppercase">{u.role || u.title || "User"}</span>
                                            <h4 className="font-bold text-dark-slate">{u.userName || u.username}</h4>
                                            <p className="text-xs text-secondary-gray">{u.email}</p>
                                            <p className="text-xs text-secondary-gray">{u.phoneNumber || u.address}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isAdmin && activeTab === "users_crud" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-slate">Global User Management (CRUD)</h1>
                            <p className="text-sm text-secondary-gray">Full authority to Create, Update, and Delete Customers, Dealers, and Suppliers.</p>
                        </div>
                        <button
                            onClick={() => setIsCreateUserModalOpen(true)}
                            className="bg-green-600 text-white px-5 py-2.5 rounded text-sm font-bold hover:bg-green-700 transition-colors cursor-pointer shadow-sm"
                        >
                            + Create New User
                        </button>
                    </div>

                    <div className="bg-card-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#FAFBFD] border-b border-[#E2E8F0] text-xs font-bold text-secondary-gray uppercase">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">User / Entity Name</th>
                                    <th className="p-4">Role / Category</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4">Address / Hub</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {allMergedUsers.map((u, idx) => {
                                    const role = (u.title || u.role || "User").toLowerCase();
                                    const isTargetAdmin = role === "admin";

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-mono font-bold text-xs text-secondary-gray">#{u.id}</td>
                                            <td className="p-4 font-bold text-dark-slate">{u.userName || u.username || u.email.split("@")[0]}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase ${role === "admin"
                                                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                                                        : role === "dealer"
                                                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                            : role === "supplier"
                                                                ? "bg-blue-100 text-primary border border-blue-200"
                                                                : "bg-green-100 text-success-green border border-green-200"
                                                    }`}>
                                                    {role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-secondary-gray">{u.email}</td>
                                            <td className="p-4 text-secondary-gray">{u.phoneNumber || "N/A"}</td>
                                            <td className="p-4 text-secondary-gray">{u.address || "N/A"}</td>
                                            <td className="p-4 text-right">
                                                {isTargetAdmin ? (
                                                    <span className="text-xs text-gray-400 font-semibold italic">Admin Protected</span>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(u);
                                                                setEditTargetUserName(u.userName || u.username || "");
                                                                setEditTargetPhone(u.phoneNumber || "");
                                                                setEditTargetAddress(u.address || "");
                                                            }}
                                                            className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-primary/90 transition-colors cursor-pointer"
                                                        >
                                                            Edit (PATCH)
                                                        </button>
                                                        <button
                                                            onClick={() => handleAdminDeleteUser(u)}
                                                            className="bg-error-red text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-error-red/90 transition-colors cursor-pointer"
                                                        >
                                                            Delete (DELETE)
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "products" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-slate">
                                {isAdmin
                                    ? "Global Products Catalog Management"
                                    : isSupplier
                                        ? "Oil Products Catalog & Refinery Network"
                                        : isDealer
                                            ? "Oil Products & Wholesale Sourcing"
                                            : "Oil Products Catalog"
                                }
                            </h1>
                            <p className="text-sm text-secondary-gray">
                                {isAdmin
                                    ? "Oversee product inventory, unit pricing, and stock metrics physically linked to Admin control."
                                    : isSupplier
                                        ? "Refinery catalog overview. Suppliers can only post new petroleum batches using the '+ Post New Product' button."
                                        : isDealer
                                            ? "Dealers can both post new products and take/source wholesale stock directly from Refinery Suppliers."
                                            : "Browse available oil grades and place retail orders with direct supplier or dealer sourcing."
                                }
                            </p>
                        </div>
                        {(isDealer || isSupplier || isAdmin) && (
                            <button
                                onClick={() => setIsPostProductModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto border-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span> Post New Product</span>
                            </button>
                        )}
                    </div>

                    {productsLoading ? (
                        <div className="flex flex-col justify-center items-center py-16">
                            <span className="loading loading-spinner loading-lg text-[#0F2747] mb-3"></span>
                            <p className="text-sm text-secondary-gray">Loading live petroleum catalog...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-2xl border border-[#E2E8F0] text-center shadow-sm max-w-xl mx-auto">
                            <p className="text-secondary-gray font-medium mb-1">No products currently available in the catalog.</p>
                            <p className="text-xs text-secondary-gray">New petroleum grades will appear here as soon as they are added.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="card bg-[#FFFFFF] w-96 max-w-full shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow rounded-2xl"
                                >
                                    <figure className="h-48 w-full overflow-hidden bg-[#F5F7FA]">
                                        <img
                                            src={product.image || getProductImage(product.name, product.image, product.id)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = getProductImage(product.name, undefined, product.id);
                                            }}
                                        />
                                    </figure>
                                    <div className="card-body p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                                                    {product.category}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${product.stockLevel === "In Stock" ? "bg-green-100 text-success-green" : "bg-amber-100 text-[#D97706]"
                                                    }`}>
                                                    {product.stockLevel}
                                                </span>
                                            </div>
                                            <h2 className="card-title text-lg font-bold text-dark-slate mb-1">{product.name}</h2>
                                            <p className="text-sm text-secondary-gray">{product.description}</p>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                                            <span className="text-base font-extrabold text-primary">{product.price}</span>
                                            <div className="card-actions justify-end">
                                                {isAdmin ? (
                                                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded">
                                                        Admin Linked Catalog
                                                    </span>
                                                ) : isSupplier ? (
                                                    customInventory.some((item) => item.id === product.id) ? (
                                                        <span className="text-xs bg-green-50 text-success-green font-bold px-3 py-1.5 rounded border border-green-200">
                                                            In Your Portfolio
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-slate-100 text-secondary-gray font-medium px-3 py-1.5 rounded">
                                                            Refinery Listed
                                                        </span>
                                                    )
                                                ) : isDealer ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAssignProduct(product)}
                                                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl"
                                                        >
                                                            + Assign Stock
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setWholesaleProduct(product);
                                                                setWholesaleQuantity(50);
                                                                if (availableSuppliers.length > 0) setWholesaleSupplierId(availableSuppliers[0].id);
                                                            }}
                                                            className="btn bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] btn-sm font-bold border-none rounded-xl"
                                                        >
                                                            Bulk Source
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenCheckout(product)}
                                                        className="btn bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold border-none rounded-xl text-xs sm:text-sm"
                                                    >
                                                        Buy Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {(isDealer || isSupplier) && activeTab === "inventory" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-[#1E293B]">
                                {isSupplier ? "My Supply Portfolio" : "My Stock Inventory"}
                            </h1>
                            <p className="text-sm text-[#64748B]">
                                {isSupplier
                                    ? "Manage petroleum products you actively distribute to Dealers and direct Customers."
                                    : "Manage products actively linked to your Dealer stock catalog."
                                }
                            </p>
                        </div>
                        <button
                            onClick={() => setIsPostProductModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-[#0F2747] hover:bg-[#163860] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Post New Product</span>
                        </button>
                    </div>

                    {customInventory.length === 0 ? (
                        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#E2E8F0] text-center shadow-sm max-w-xl mx-auto">
                            <p className="text-[#64748B] mb-4">
                                {isSupplier
                                    ? "You have not published any products to your supply portfolio yet. As a Supplier, you can only post new petroleum products to distribute to dealers and customers."
                                    : "You have not linked or sourced any products for your stock inventory yet. As a Dealer, you can post new products or source directly from refinery suppliers."
                                }
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {isDealer && (
                                    <button
                                        onClick={() => setActiveTab("products")}
                                        className="border border-[#CBD5E1] text-[#1E293B] px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:bg-[#F5F7FA] transition-colors"
                                    >
                                        Browse Catalog to Source
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsPostProductModalOpen(true)}
                                    className="bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold px-5 py-2 rounded-xl text-sm cursor-pointer transition-colors shadow-sm"
                                >
                                    Post Product Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                            {customInventory.map((item) => (
                                <div
                                    key={item.id}
                                    className="card bg-[#FFFFFF] w-96 max-w-full shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-all rounded-2xl flex flex-col justify-between"
                                >
                                    <figure className="h-48 w-full overflow-hidden bg-[#F5F7FA] border-b border-[#E2E8F0]">
                                        <img
                                            src={item.image || getProductImage(item.name, item.image, item.id)}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = getProductImage(item.name, undefined, item.id);
                                            }}
                                        />
                                    </figure>
                                    <div className="card-body p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full border border-[#16A34A]/25">
                                                    {isSupplier ? "Active Portfolio Item" : "Active Stock Item"}
                                                </span>
                                                <span className="text-xs font-semibold text-[#64748B]">Product ID: #{item.id}</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-[#1E293B] mb-1">{item.name}</h2>
                                            <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">{item.description || "Petroleum Grade Oil Product"}</p>
                                        </div>

                                        <div className="pt-4 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                                            <span className="text-xs text-[#64748B] font-medium">Linked Record #{item.id}</span>
                                            <div className="card-actions justify-end">
                                                <button
                                                    onClick={() => handleRemoveProductFromStock(item.id)}
                                                    className="btn btn-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white border-none rounded-xl font-semibold px-4 cursor-pointer shadow-sm transition-colors"
                                                >
                                                    {isSupplier ? "Remove from Portfolio" : "Remove from Stock"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "orders" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-2">
                        {isCustomer
                            ? "My Order History & Live Tracking"
                            : isAdmin
                                ? "Global Order Control & Modification"
                                : "Fulfill Customer & Dealer Orders"
                        }
                    </h1>
                    <p className="text-sm text-secondary-gray mb-6">
                        {isCustomer
                            ? "View past orders, delivery channel selections, payment invoices, and real-time status updates."
                            : isAdmin
                                ? "Global authority to edit order details or delete orders (with automatic cascade clean-up of OrderDetails, Payments, and Deliveries)."
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
                                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${item.status === "confirmed"
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
                                                Customer: <strong className="text-dark-slate">{item.customerName}</strong> ({item.customerEmail || "Buyer"})
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
                                        {isAdmin ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingOrder(item);
                                                        setEditOrderStatus(item.status || "processing");
                                                        setEditOrderQuantity(item.quantity || 1);
                                                        setEditOrderAddress(item.address || "");
                                                    }}
                                                    className="bg-primary text-white text-xs font-semibold px-3 py-2 rounded hover:bg-primary/90 transition-colors cursor-pointer"
                                                >
                                                    Edit Order (PATCH)
                                                </button>
                                                <button
                                                    onClick={() => handleAdminDeleteOrder(item.id)}
                                                    className="bg-error-red text-white text-xs font-semibold px-3 py-2 rounded hover:bg-error-red/90 transition-colors cursor-pointer"
                                                >
                                                    Delete Order (DELETE)
                                                </button>
                                            </div>
                                        ) : isCustomer ? (
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
                                                {item.status?.toLowerCase() === "confirmed" ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-2 rounded border border-green-300">
                                                        Confirmed
                                                    </span>
                                                ) : item.status?.toLowerCase() === "rejected" ? (
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded border border-red-300">
                                                        Rejected
                                                    </span>
                                                ) : item.status?.toLowerCase() === "scheduled" || item.status?.toLowerCase() === "in-transit" ? (
                                                    <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-2 rounded border border-teal-300">
                                                        Scheduled
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleConfirmOrRejectOrder(item.id, "confirmed", item.customerEmail)}
                                                        className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-green-700 transition-colors cursor-pointer"
                                                    >
                                                        Confirm (PUT)
                                                    </button>
                                                )}

                                                {item.status?.toLowerCase() !== "rejected" && (
                                                    <button
                                                        onClick={() => handleConfirmOrRejectOrder(item.id, "rejected", item.customerEmail)}
                                                        className="bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer"
                                                    >
                                                        Reject (PUT)
                                                    </button>
                                                )}

                                                {item.status?.toLowerCase() === "rejected" && (
                                                    <button
                                                        onClick={() => handleConfirmOrRejectOrder(item.id, "confirmed", item.customerEmail)}
                                                        className="bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-green-700 transition-colors cursor-pointer"
                                                    >
                                                        Re-confirm (PUT)
                                                    </button>
                                                )}

                                                <div className="flex items-center border border-secondary-gray rounded overflow-hidden">
                                                    <input
                                                        type="date"
                                                        value={deliveryDates[item.id] || item.deliveryDate || ""}
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
                                                        {item.status?.toLowerCase() === "scheduled" ? "Reschedule (POST)" : "Schedule (POST)"}
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

            {activeTab === "profile" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <h1 className="text-2xl font-extrabold text-dark-slate mb-6">Profile & Account Settings</h1>

                    <div className="bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm max-w-[600px]">
                        {profileStatus && (
                            <p className="text-success-green font-bold mb-4">{profileStatus}</p>
                        )}
                        {dbLookupStatus && (
                            <p className="text-primary font-bold mb-4 text-sm bg-blue-50 p-2 rounded border border-blue-100">{dbLookupStatus}</p>
                        )}

                        <div className="space-y-4">
                            {isSupplier && (
                                <div className="bg-[#FAFBFD] p-4 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-dark-slate">Supplier Operational Status</h3>
                                        <p className="text-xs text-secondary-gray">Set your refinery account status to active or inactive.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleSupplierStatus}
                                        className={`px-4 py-2 rounded font-bold text-xs cursor-pointer transition-colors ${supplierOperationalStatus === "active"
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
                                    {isAdmin ? "Admin Username" : isSupplier ? "Refinery / Supplier Name" : isDealer ? "Business Name" : "Username"}
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
                                    {isSupplier ? "Refinery Location / Headquarters" : "Address / Hub Location"}
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
                                <h3 className="text-error-red text-base font-bold mb-1">Delete {user.title || "User"} Account</h3>
                                <p className="text-xs text-secondary-gray mb-4">
                                    Deleting your own account will remove your records from the database.
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
                </div>
            )}

            {activeTab === "messages" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">Real-Time Messages (PusherJS)</h1>
                                <span className="badge bg-[#16A34A]/15 text-[#16A34A] font-bold text-xs border-none px-3 py-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                                    PusherJS Network Active
                                </span>
                            </div>
                            <p className="text-sm text-[#64748B] mt-1">
                                Real-time dispatch and messaging across Customers, Dealers, Suppliers, and Operations Control.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748B] font-mono bg-[#FFFFFF] border border-[#CBD5E1] px-3 py-1.5 rounded-xl shadow-xs">
                                Channel: <strong>{chatChannel}</strong>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 space-y-4">
                            <div className="card bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl p-6">
                                <h2 className="text-base font-bold text-[#1E293B] mb-1">Send a Real-Time Message</h2>
                                <p className="text-xs text-[#64748B] mb-4">
                                    Broadcast an operational dispatch, delivery inquiry, or wholesale message via PusherJS.
                                </p>

                                <form onSubmit={handleSendChatMessage} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#1E293B] mb-1">Channel</label>
                                        <select
                                            value={chatChannel}
                                            onChange={(e) => setChatChannel(e.target.value)}
                                            className="select select-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none rounded-xl text-xs"
                                        >
                                            <option value="oil-supply-chat">General Operations (oil-supply-chat)</option>
                                            <option value="suppliers-dealers">Refinery & Dealer Wholesale (suppliers-dealers)</option>
                                            <option value="customer-support">Customer Order Support (customer-support)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#1E293B] mb-1">Topic / Context</label>
                                        <select
                                            value={chatTopic}
                                            onChange={(e) => setChatTopic(e.target.value)}
                                            className="select select-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none rounded-xl text-xs"
                                        >
                                            <option value="Order Dispatch & Logistics">Order Dispatch & Logistics</option>
                                            <option value="Bulk Fuel Order Inquiry">Bulk Fuel Order Inquiry</option>
                                            <option value="Refinery Wholesale Availability">Refinery Wholesale Availability</option>
                                            <option value="Delivery Tanker Tracking">Delivery Tanker Tracking</option>
                                            <option value="Dealer Stock Allocation">Dealer Stock Allocation</option>
                                            <option value="Account & Technical Support">Account & Technical Support</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#1E293B] mb-1">Message Content</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={chatInput}
                                            placeholder="Write your message here. Connected users will receive it in real-time..."
                                            onChange={(e) => setChatInput(e.target.value)}
                                            className="textarea textarea-bordered w-full bg-[#FFFFFF] text-[#1E293B] border-[#CBD5E1] focus:border-[#0F2747] focus:outline-none text-xs rounded-xl"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSendingChat}
                                        className="btn bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold w-full border-none shadow-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                    >
                                        {isSendingChat ? (
                                            <>
                                                <span className="loading loading-spinner loading-xs"></span>
                                                <span>Broadcasting via PusherJS...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Message via PusherJS</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="card bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl p-4 text-xs text-[#64748B]">
                                <div className="flex items-center justify-between">
                                    <span>Sending as: <strong className="text-[#1E293B]">{user.userName || user.email}</strong></span>
                                    <span className="badge bg-[#0F2747] text-[#F59E0B] font-bold text-[10px] border-none px-2 py-0.5">
                                        {user.title || "Customer"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="card bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl p-6">
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping"></span>
                                        <h2 className="text-base font-bold text-[#1E293B]">Live Message Feed</h2>
                                    </div>
                                    <span className="text-xs text-[#64748B]">
                                        {chatMessages.length} {chatMessages.length === 1 ? "Message" : "Messages"} Received
                                    </span>
                                </div>

                                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                                    {chatMessages.length === 0 ? (
                                        <div className="text-center py-12 text-[#64748B]">
                                            <p className="font-semibold text-sm mb-1 text-[#1E293B]">No real-time messages yet.</p>
                                            <p className="text-xs">Messages broadcasted via PusherJS will appear here instantly.</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg) => {
                                            const isMe = msg.email === user.email;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`p-4 rounded-2xl border text-xs transition-all ${
                                                        isMe
                                                            ? "bg-[#0F2747]/5 border-[#0F2747]/20"
                                                            : "bg-[#F5F7FA] border-[#E2E8F0]"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[#1E293B] text-sm">
                                                                {msg.sender}
                                                            </span>
                                                            <span className={`badge text-[10px] font-bold uppercase border-none px-2 py-0.5 ${
                                                                msg.role === "Supplier"
                                                                    ? "bg-[#0F2747] text-[#F59E0B]"
                                                                    : msg.role === "Dealer"
                                                                    ? "bg-[#F59E0B]/20 text-[#D97706]"
                                                                    : msg.role === "Admin"
                                                                    ? "bg-[#16A34A]/20 text-[#16A34A]"
                                                                    : "bg-[#64748B]/15 text-[#1E293B]"
                                                            }`}>
                                                                {msg.role || "User"}
                                                            </span>
                                                            {isMe && (
                                                                <span className="badge bg-[#16A34A] text-white text-[9px] font-bold border-none px-1.5 py-0.5">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-[#64748B] font-mono">
                                                                {msg.timestamp}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mb-2">
                                                        <span className="inline-block text-[11px] font-semibold text-[#0F2747] bg-[#0F2747]/10 px-2 py-0.5 rounded-md">
                                                            {msg.topic}
                                                        </span>
                                                    </div>

                                                    <p className="text-[#1E293B] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                                        {msg.message}
                                                    </p>

                                                    <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/70 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setChatTopic(`Re: ${msg.topic}`);
                                                                setChatInput(`@${msg.sender}: `);
                                                            }}
                                                            className="text-[11px] font-semibold text-[#0F2747] hover:text-[#F59E0B] transition-colors cursor-pointer"
                                                        >
                                                            Reply to {msg.sender}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isCreateUserModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-card-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-[500px] text-left p-6 md:p-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-dark-slate">Create New System User</h2>
                                <p className="text-xs text-secondary-gray">Admin authority to provision user accounts.</p>
                            </div>
                            <button
                                onClick={() => setIsCreateUserModalOpen(false)}
                                className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAdminCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">User Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e: any) => setNewRole(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none font-semibold"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="dealer">Dealer</option>
                                    <option value="supplier">Supplier</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={newUserName}
                                    placeholder="Enter username..."
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newUserEmail}
                                    placeholder="Enter email..."
                                    onChange={(e) => {
                                        setNewUserEmail(e.target.value);
                                        setNewUserEmailError("");
                                    }}
                                    onBlur={async () => {
                                        if (newUserEmail.includes("@")) {
                                            const check = await checkEmailUniqueness(newUserEmail);
                                            if (!check.isUnique) {
                                                setNewUserEmailError(`Email is already registered to a ${check.existingRole} account. Only one account per email is allowed.`);
                                            } else {
                                                setNewUserEmailError("");
                                            }
                                        }
                                    }}
                                    className={`w-full p-2.5 border rounded bg-white text-dark-slate text-sm outline-none ${newUserEmailError ? "border-red-500" : "border-secondary-gray"}`}
                                />
                                {newUserEmailError && (
                                    <p className="text-xs text-red-600 font-semibold mt-1">{newUserEmailError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newUserPassword}
                                    placeholder="Set password..."
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={newUserPhone}
                                    placeholder="Phone number..."
                                    onChange={(e) => setNewUserPhone(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Address / Hub</label>
                                <input
                                    type="text"
                                    value={newUserAddress}
                                    placeholder="Address..."
                                    onChange={(e) => setNewUserAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateUserModalOpen(false)}
                                    className="w-1/3 py-2.5 rounded-lg border border-secondary-gray text-dark-slate font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-2/3 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors cursor-pointer shadow-md"
                                >
                                    Create User (POST)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-card-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-[450px] text-left p-6 md:p-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-dark-slate">Edit User Information</h2>
                                <p className="text-xs text-secondary-gray">Updating: {editingUser.email}</p>
                            </div>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Username</label>
                                <input
                                    type="text"
                                    value={editTargetUserName}
                                    onChange={(e) => setEditTargetUserName(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={editTargetPhone}
                                    onChange={(e) => setEditTargetPhone(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Address / Hub</label>
                                <input
                                    type="text"
                                    value={editTargetAddress}
                                    onChange={(e) => setEditTargetAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="w-1/3 py-2.5 rounded-lg border border-secondary-gray text-dark-slate font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdminUpdateUser}
                                    className="w-2/3 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/95 transition-colors cursor-pointer shadow-md"
                                >
                                    Save Changes (PATCH)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-card-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-[450px] text-left p-6 md:p-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                            <div>
                                <h2 className="text-xl font-extrabold text-dark-slate">Edit Order #{editingOrder.id}</h2>
                                <p className="text-xs text-secondary-gray">Admin global order modification (`PATCH /admin/order/:id`).</p>
                            </div>
                            <button
                                onClick={() => setEditingOrder(null)}
                                className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Order Status</label>
                                <select
                                    value={editOrderStatus}
                                    onChange={(e) => setEditOrderStatus(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none font-semibold"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in-transit">In-Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={editOrderQuantity}
                                    onChange={(e) => setEditOrderQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Delivery Destination Address</label>
                                <input
                                    type="text"
                                    value={editOrderAddress}
                                    onChange={(e) => setEditOrderAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    className="w-1/3 py-2.5 rounded-lg border border-secondary-gray text-dark-slate font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdminUpdateOrder}
                                    className="w-2/3 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/95 transition-colors cursor-pointer shadow-md"
                                >
                                    Update Order (PATCH)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-[#FAFBFD] p-4 rounded-lg border border-[#E2E8F0] mb-5 flex gap-3 items-center">
                            <img
                                src={wholesaleProduct.image || getProductImage(wholesaleProduct.name, wholesaleProduct.image, wholesaleProduct.id)}
                                alt={wholesaleProduct.name}
                                className="w-16 h-16 rounded-lg object-cover border border-[#CBD5E1] shrink-0"
                                onError={(e) => {
                                    e.currentTarget.src = getProductImage(wholesaleProduct.name, undefined, wholesaleProduct.id);
                                }}
                            />
                            <div>
                                <h3 className="text-base font-bold text-dark-slate">{wholesaleProduct.name}</h3>
                                <p className="text-xs text-secondary-gray">{wholesaleProduct.category} | {wholesaleProduct.price}</p>
                            </div>
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
                                        <option value="" disabled>No registered suppliers available</option>
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
                                className="w-2/3 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold text-sm transition-colors cursor-pointer shadow-sm border-none disabled:opacity-50"
                            >
                                {isSubmittingWholesale ? "Placing Wholesale Order..." : `Confirm Wholesale Order (${wholesaleQuantity} units)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-[#FAFBFD] p-4 rounded-lg border border-[#E2E8F0] mb-6 flex gap-4 items-center">
                            <img
                                src={checkoutProduct.image || getProductImage(checkoutProduct.name, checkoutProduct.image, checkoutProduct.id)}
                                alt={checkoutProduct.name}
                                className="w-16 h-16 rounded-lg object-cover border border-[#CBD5E1] shrink-0"
                                onError={(e) => {
                                    e.currentTarget.src = getProductImage(checkoutProduct.name, undefined, checkoutProduct.id);
                                }}
                            />
                            <div className="flex-1">
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
                                <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-dark-slate">Subtotal:</span>
                                    <span className="text-base font-extrabold text-primary">
                                        ${(checkoutProduct.numericPrice * orderQuantity).toFixed(2)}
                                    </span>
                                </div>
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
                                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${sourcingChoice === "supplier"
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
                                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${sourcingChoice === "dealer"
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
                                            <option value="" disabled>No registered suppliers available</option>
                                        )
                                    ) : (
                                        availableDealers.length > 0 ? (
                                            availableDealers.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.userName || d.username || `Authorized Dealer #${d.id}`} ({d.email || "Verified"})
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No authorized dealers available</option>
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
                                className="w-2/3 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold text-sm transition-colors cursor-pointer shadow-sm border-none disabled:opacity-50"
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
            {isPostProductModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-card-white rounded-xl shadow-2xl border border-[#E2E8F0] w-full max-w-[620px] max-h-[90vh] overflow-y-auto text-left p-6 md:p-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-dark-slate">
                                    Post & Upload Oil Product
                                </h2>
                                <p className="text-xs text-secondary-gray mt-1">
                                    Publish a new petroleum grade or fuel product to the active network catalog.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPostProductModalOpen(false)}
                                className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 mb-6 flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-xs text-slate-700 leading-relaxed">
                                <strong className="font-semibold text-primary">
                                    Posting as {isSupplier ? "Refinery Supplier" : isDealer ? "Authorized Dealer" : "System Admin"}:
                                </strong>{" "}
                                {isSupplier
                                    ? "As a Supplier, you can only post new petroleum grades to supply to dealers and customers across the network."
                                    : isDealer
                                        ? "As a Dealer, you can post your own specialized products as well as take/source wholesale supply from Suppliers."
                                        : "This product will be created in the central database."
                                }
                            </div>
                        </div>

                        <form onSubmit={handleCreateAndPostProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Brent Crude Oil Batch #409, Ultra-Low Sulfur Diesel"
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-dark-slate mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={newProductCategory}
                                        onChange={(e) => setNewProductCategory(e.target.value)}
                                        className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none focus:border-primary"
                                    >
                                        <option value="Crude Fuel">Crude Fuel</option>
                                        <option value="Refined Distillates">Refined Distillates (Diesel / Gasoline)</option>
                                        <option value="Aviation Turbine Fuel">Aviation Turbine Fuel (Jet A-1)</option>
                                        <option value="Liquefied Petroleum Gas">Liquefied Petroleum Gas (LPG)</option>
                                        <option value="Heavy Marine Fuel Oil">Heavy Marine Fuel Oil (HFO)</option>
                                        <option value="Lubricants & Greases">Lubricants & Greases</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-dark-slate mb-1">
                                        Price per Unit (USD $) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        placeholder="e.g. 78.50"
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-dark-slate mb-1">
                                        Stock Quantity (Barrels / Liters) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        placeholder="e.g. 1500"
                                        value={newProductQuantity}
                                        onChange={(e) => setNewProductQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-dark-slate mb-1">
                                        Select Official Oil Image
                                    </label>
                                    <select
                                        value={newProductImage}
                                        onChange={(e) => setNewProductImage(e.target.value)}
                                        className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none focus:border-primary"
                                    >
                                        <option value="/Brent Crude Oil.jpg">Brent Crude Oil</option>
                                        <option value="/Ultra-Low Sulfur Diesel.jpg">Ultra-Low Sulfur Diesel</option>
                                        <option value="/Premium Unleaded Gasoline.jpg">Premium Unleaded Gasoline</option>
                                        <option value="/Aviation Turbine Fuel (Jet A-1).jpg">Aviation Turbine Fuel (Jet A-1)</option>
                                        <option value="/images.jpg">Liquefied Petroleum Gas (LPG)</option>
                                        <option value="/Heavy Marine Fuel Oil (HFO).jpg">Heavy Marine Fuel Oil (HFO)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1.5">
                                    Photo Preview:
                                </label>
                                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="w-24 h-16 rounded overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                                        <img
                                            src={newProductImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-xs text-secondary-gray">
                                        High-resolution authentic industrial oil photo will appear in the marketplace cards and inventory catalogs.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">
                                    Product Description & Specifications (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter API gravity, sulfur percentage, flash point, or compliance certifications..."
                                    value={newProductDescription}
                                    onChange={(e) => setNewProductDescription(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none focus:border-primary"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsPostProductModalOpen(false)}
                                    className="w-1/3 py-2.5 rounded-lg border border-secondary-gray text-dark-slate font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingNewProduct}
                                    className="w-2/3 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold text-sm transition-colors cursor-pointer shadow-sm border-none disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingNewProduct ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            <span>Publishing Product...</span>
                                        </>
                                    ) : (
                                        <span>Publish & Post Product</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
