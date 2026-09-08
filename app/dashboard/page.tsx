"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";
import UberMapTracker from "@/components/uber-map-tracker";
import { getPusherClient, ChatMessage } from "@/lib/pusher";
import { checkEmailUniqueness } from "@/lib/email-checker";

// Modular Dashboard Components
import {
    UserData,
    Order,
    Product,
    CartItem,
    SystemUser,
    DashboardTab,
} from "@/components/dashboard/types";
import {
    getProductImage,
    getRolePath,
    getAllUsersUrl,
    getRoleBadgeColor,
} from "@/components/dashboard/utils";
import { CartDrawerModal } from "@/components/dashboard/modals/cart-drawer-modal";
import { CheckoutPaymentModal } from "@/components/dashboard/modals/checkout-payment-modal";
import { SandboxGatewayModal } from "@/components/dashboard/modals/sandbox-gateway-modal";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "inventory" | "users_crud" | "monitoring" | "profile" | "messages">("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState<string>("" );
    const [selectedProductCategory, setSelectedProductCategory] = useState<string>("All");
    const [inventorySearchQuery, setInventorySearchQuery] = useState<string>("");

    const productCategories = useMemo(() => {
        const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
        return ["All", ...cats];
    }, [products]);

    const filteredProducts = useMemo(() => {
        const query = productSearchQuery.trim().toLowerCase();
        return products.filter((product) => {
            const matchesQuery = !query ||
                product.name.toLowerCase().includes(query) ||
                (product.category && product.category.toLowerCase().includes(query)) ||
                (product.description && product.description.toLowerCase().includes(query));
            const matchesCategory = selectedProductCategory === "All" || product.category === selectedProductCategory;
            return matchesQuery && matchesCategory;
        });
    }, [products, productSearchQuery, selectedProductCategory]);

    const [customInventory, setCustomInventory] = useState<Product[]>([]);
    const [supplierOperationalStatus, setSupplierOperationalStatus] = useState<string>("active");

    const filteredInventory = useMemo(() => {
        const query = inventorySearchQuery.trim().toLowerCase();
        if (!query) return customInventory;
        return customInventory.filter((item) => {
            return item.name.toLowerCase().includes(query) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                (item.description && item.description.toLowerCase().includes(query));
        });
    }, [customInventory, inventorySearchQuery]);

    const [orders, setOrders] = useState<Order[]>([]);
    const [trackedOrderStatus, setTrackedOrderStatus] = useState<string | null>(null);
    const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);
    const [isUberMapOpen, setIsUberMapOpen] = useState<boolean>(false);
    const [uberTrackingOrder, setUberTrackingOrder] = useState<Order | null>(null);
    const [deliveryDates, setDeliveryDates] = useState<{ [orderId: number]: string }>({});

    const [monitorMetrics, setMonitorMetrics] = useState<any>(null);
    const [allMergedUsers, setAllMergedUsers] = useState<SystemUser[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState<string>("");
    const [selectedUserRole, setSelectedUserRole] = useState<string>("All");

    const filteredUsers = useMemo(() => {
        const query = userSearchQuery.trim().toLowerCase();
        return allMergedUsers.filter((u) => {
            const uName = (u.userName || u.username || "").toLowerCase();
            const uEmail = (u.email || "").toLowerCase();
            const matchesQuery = !query || uName.includes(query) || uEmail.includes(query);
            const role = (u.title || u.role || "user").toLowerCase();
            const matchesRole = selectedUserRole === "All" || role === selectedUserRole.toLowerCase();
            return matchesQuery && matchesRole;
        });
    }, [allMergedUsers, userSearchQuery, selectedUserRole]);

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
    const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "bank">("card");
    const [mobileOperator, setMobileOperator] = useState<string>("bKash");
    const [mobileWalletNumber, setMobileWalletNumber] = useState<string>("01700-000000");
    const [mobileWalletPin, setMobileWalletPin] = useState<string>("12345");
    const [bankName, setBankName] = useState<string>("Eastern Bank Limited");
    const [bankAccountNumber, setBankAccountNumber] = useState<string>("EBL-10029384");
    const [isSandboxModalOpen, setIsSandboxModalOpen] = useState<boolean>(false);
    const [sandboxStep, setSandboxStep] = useState<"gateway" | "processing" | "otp_challenge" | "success" | "declined">("gateway");
    const [sandboxOtp, setSandboxOtp] = useState<string>("123456");
    const [sandboxTxnId, setSandboxTxnId] = useState<string>("");
    const [sandboxAuthCode, setSandboxAuthCode] = useState<string>("");
    const [sandboxProcessingLogs, setSandboxProcessingLogs] = useState<string[]>([]);
    const [createdPaymentRecord, setCreatedPaymentRecord] = useState<any>(null);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

    // Multi-Product Delivery Cart state
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
    const [cartToast, setCartToast] = useState<string | null>(null);
    const [isMultiCheckout, setIsMultiCheckout] = useState<boolean>(false);

    // Cart calculations
    const cartTotalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    const cartSubtotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.product.numericPrice * item.quantity), 0);
    }, [cartItems]);

    const cartTotalAmount = useMemo(() => {
        return Number(cartSubtotal.toFixed(2));
    }, [cartSubtotal]);

    // Load cart on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("petroleum_cart");
            if (saved) {
                setCartItems(JSON.parse(saved));
            }
        } catch {}
    }, []);

    const updateCartState = (newCart: CartItem[]) => {
        setCartItems(newCart);
        try {
            localStorage.setItem("petroleum_cart", JSON.stringify(newCart));
        } catch {}
    };

    const handleAddToCart = (
        product: Product,
        quantity: number = 1,
        sourcing: "supplier" | "dealer" = "supplier",
        partyId?: number | string
    ) => {
        const defaultParty = partyId || (sourcing === "supplier" ? (availableSuppliers[0]?.id || 1) : (availableDealers[0]?.id || 1));
        const defaultDest = deliveryAddress.trim() || user?.address || "Main Operational Hub";

        const existingIndex = cartItems.findIndex((ci) => ci.product.id === product.id);
        let updated: CartItem[];

        if (existingIndex >= 0) {
            updated = cartItems.map((ci, idx) =>
                idx === existingIndex ? { ...ci, quantity: ci.quantity + quantity } : ci
            );
        } else {
            updated = [
                ...cartItems,
                {
                    product,
                    quantity,
                    sourcingChoice: sourcing,
                    selectedPartyId: defaultParty,
                    deliveryAddress: defaultDest,
                },
            ];
        }

        updateCartState(updated);
        setCartToast(`✓ Added ${product.name} (${quantity} unit${quantity > 1 ? "s" : ""}) to delivery cart!`);
        setTimeout(() => {
            setCartToast(null);
        }, 3000);
    };

    const handleUpdateCartQty = (productId: number, newQty: number) => {
        if (newQty <= 0) {
            handleRemoveFromCart(productId);
            return;
        }
        const updated = cartItems.map((ci) =>
            ci.product.id === productId ? { ...ci, quantity: newQty } : ci
        );
        updateCartState(updated);
    };

    const handleRemoveFromCart = (productId: number) => {
        const updated = cartItems.filter((ci) => ci.product.id !== productId);
        updateCartState(updated);
    };

    const handleClearCart = () => {
        updateCartState([]);
    };

    const handleUpdateCartSourcing = (productId: number, sourcingChoice: "supplier" | "dealer", partyId: number | string) => {
        const updated = cartItems.map((ci) =>
            ci.product.id === productId ? { ...ci, sourcingChoice, selectedPartyId: partyId } : ci
        );
        updateCartState(updated);
    };

    const handleUpdateCartAddress = (productId: number, address: string) => {
        const updated = cartItems.map((ci) =>
            ci.product.id === productId ? { ...ci, deliveryAddress: address } : ci
        );
        updateCartState(updated);
    };

    const handleLaunchMultiCartSandbox = () => {
        if (cartItems.length === 0) {
            alert("Your delivery cart is empty.");
            return;
        }
        setIsMultiCheckout(true);
        setCheckoutProduct(cartItems[0].product);
        setIsCartModalOpen(false);
    };

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

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editProductName, setEditProductName] = useState<string>("");
    const [editProductPrice, setEditProductPrice] = useState<string>("");
    const [editProductStock, setEditProductStock] = useState<string>("");

    const [editUsername, setEditUsername] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [profileStatus, setProfileStatus] = useState("");

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
                        quantity: typeof p.quantity === "number" ? p.quantity : 1000,
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
        if (isAdmin) {
            alert("Security policy: Admins cannot add new products. Only authorized Dealers and Suppliers may post new products.");
            return;
        }
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

    const handleOpenAdminEditProduct = (product: Product) => {
        setEditingProduct(product);
        setEditProductName(product.name);
        setEditProductPrice(String(product.numericPrice || parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0));
        setEditProductStock(String(typeof product.quantity === "number" ? product.quantity : 1000));
    };

    const handleAdminSaveProduct = async () => {
        if (!editingProduct) return;
        const newPrice = Number(editProductPrice);
        const newStock = Number(editProductStock);

        if (isNaN(newPrice) || newPrice < 0) {
            alert("Please enter a valid non-negative price.");
            return;
        }
        if (isNaN(newStock) || newStock < 0) {
            alert("Please enter a valid non-negative stock quantity.");
            return;
        }

        try {
            const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

            await Promise.all([
                axios.put(
                    `${API_ENDPOINT}/product/update-price/${editingProduct.id}`,
                    { price: newPrice },
                    { withCredentials: true, validateStatus: (status) => status < 500 }
                ),
                axios.put(
                    `${API_ENDPOINT}/product/update-stock/${editingProduct.id}`,
                    { stock: newStock },
                    { withCredentials: true, validateStatus: (status) => status < 500 }
                )
            ]);

            setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
                ...p,
                name: editProductName || p.name,
                numericPrice: newPrice,
                price: `$${newPrice.toFixed(2)}`,
                quantity: newStock,
                stockLevel: newStock <= 0 ? "Out of Stock" : newStock < 1000 ? "Low Stock" : "In Stock",
            } : p));

            alert(`Product #${editingProduct.id} updated successfully by Admin!`);
            setEditingProduct(null);
            fetchCatalogProducts();
        } catch (err) {
            console.warn("Product update notice:", err);
            alert("Failed to update product.");
        }
    };

    const handleAdminDeleteProduct = async (productId: number, productName: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${productName}" (Product #${productId}) from the catalog?`);
        if (!confirmDelete) return;

        try {
            const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
            const res = await axios.delete(`${API_ENDPOINT}/product/${productId}`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });

            if (res.status === 200 || res.status === 204) {
                alert(`Product "${productName}" has been successfully deleted.`);
            } else {
                alert(`Product "${productName}" removed from catalog.`);
            }

            setProducts(prev => prev.filter(p => p.id !== productId));
            setCustomInventory(prev => prev.filter(p => p.id !== productId));
            try {
                localStorage.removeItem(`product_img_${productId}`);
            } catch {}
            fetchCatalogProducts();
        } catch (err) {
            console.warn("Product deletion notice:", err);
            setProducts(prev => prev.filter(p => p.id !== productId));
            alert(`Product "${productName}" removed from catalog.`);
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

    const fetchOrders = async (id?: number, title?: string) => {
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

    const applySandboxCardPreset = (type: "Visa" | "MasterCard" | "Amex") => {
        setPaymentMethod("card");
        if (type === "Visa") {
            setCardType("Visa");
            setCardNumber("4000-1234-5678-9010");
            setCardHolder((user?.userName || "John Doe").toUpperCase() + " / SANDBOX TEST");
            setCardExpiry("12/28");
            setCardCvv("123");
        } else if (type === "MasterCard") {
            setCardType("MasterCard");
            setCardNumber("5555-4444-3333-2222");
            setCardHolder((user?.userName || "Jane Smith").toUpperCase() + " / SANDBOX TEST");
            setCardExpiry("08/29");
            setCardCvv("456");
        } else {
            setCardType("American Express");
            setCardNumber("3782-8224-6310-005");
            setCardHolder((user?.userName || "Acme Oil Corp").toUpperCase() + " / SANDBOX TEST");
            setCardExpiry("10/27");
            setCardCvv("7890");
        }
    };

    const applySandboxMobilePreset = (op: "bKash" | "Nagad" | "Rocket") => {
        setPaymentMethod("mobile");
        setMobileOperator(op);
        if (op === "bKash") {
            setMobileWalletNumber("01700-000000");
            setMobileWalletPin("12345");
        } else if (op === "Nagad") {
            setMobileWalletNumber("01800-000000");
            setMobileWalletPin("1234");
        } else {
            setMobileWalletNumber("01900-000000");
            setMobileWalletPin("54321");
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
        applySandboxCardPreset("Visa");
        setIsSandboxModalOpen(false);
        setSandboxStep("gateway");
        setCreatedPaymentRecord(null);
        setCreatedOrderId(null);
    };

    const handleLaunchSandboxGateway = () => {
        if (!user || !user.id || (!checkoutProduct && !isMultiCheckout)) return;

        if (!isMultiCheckout) {
            if (!selectedPartyId) {
                alert(`Please select an authorized ${sourcingChoice === "supplier" ? "refinery supplier" : "dealer"}.`);
                return;
            }

            const destination = deliveryAddress.trim() || user.address || "";
            if (!destination) {
                alert("Please enter a delivery destination address.");
                return;
            }
        }

        if (paymentMethod === "card" && !cardNumber.trim()) {
            alert("Please provide a valid card number or select a test card preset.");
            return;
        }

        if (paymentMethod === "mobile" && !mobileWalletNumber.trim()) {
            alert("Please provide a valid mobile wallet number or select a test wallet preset.");
            return;
        }

        const generatedTxn = (isMultiCheckout ? "SANDBOX-MULTI-" : "SB-TXN-") + Math.random().toString(36).substring(2, 9).toUpperCase();
        const generatedAuth = "AUTH-" + Math.floor(100000 + Math.random() * 900000);
        setSandboxTxnId(generatedTxn);
        setSandboxAuthCode(generatedAuth);
        setSandboxOtp("123456");
        setSandboxStep("gateway");
        setIsSandboxModalOpen(true);
    };

    const handleExecuteSandboxAuthorization = async (forceSimulateDecline: boolean = false) => {
        if (!user || !user.id || !checkoutProduct) return;

        setSandboxStep("processing");
        setSandboxProcessingLogs([
            "Initializing Sandbox Payment Gateway Handshake (TLS 1.3)...",
            "Encrypting tokenized test credentials with 256-bit AES...",
        ]);

        if (forceSimulateDecline) {
            setTimeout(() => {
                setSandboxProcessingLogs((prev) => [
                    ...prev,
                    "Sandbox Issuer simulated decline: 51_INSUFFICIENT_FUNDS_OR_EXPIRED_TOKEN",
                ]);
                setSandboxStep("declined");
            }, 1200);
            return;
        }

        const totalAmount = isMultiCheckout ? cartTotalAmount : Number((checkoutProduct.numericPrice * orderQuantity).toFixed(2));
        const destination = deliveryAddress.trim() || user.address || "Main Operational Hub";
        const cleanCard = paymentMethod === "card"
            ? (cardNumber.trim() || "4000123456789010")
            : paymentMethod === "mobile"
                ? (mobileWalletNumber.trim() || "01700000000")
                : (bankAccountNumber.trim() || "EBL-10029384");
        const cleanType = paymentMethod === "card"
            ? cardType
            : paymentMethod === "mobile"
                ? `${mobileOperator} Sandbox`
                : `${bankName} Wire Sandbox`;

        try {
            const paymentRes = await axios.post(
                "http://localhost:8000/payment/process",
                {
                    cardNumber: cleanCard,
                    cardType: cleanType,
                    amount: totalAmount,
                    status: "completed",
                },
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            setSandboxProcessingLogs((prev) => [
                ...prev,
                `Sandbox payment ledger generated: HTTP ${paymentRes.status} (Payment ID #${paymentRes.data?.id || 1})`,
                "Querying GET /payment/status for ledger confirmation...",
            ]);

            if (paymentRes.status === 200 || paymentRes.status === 201) {
                setCreatedPaymentRecord(paymentRes.data);
                try {
                    await axios.get(`http://localhost:8000/payment/status/${paymentRes.data.id}`, {
                        withCredentials: true,
                        validateStatus: (status) => status < 500,
                    });
                } catch {
                }
            }

            // If Multi-Product Cart Checkout
            if (isMultiCheckout && cartItems.length > 0) {
                const createdIds: (number | string)[] = [];
                const defaultSupplierId = availableSuppliers[0]?.id ? Number(availableSuppliers[0].id) : 1;
                const defaultDealerId = availableDealers[0]?.id ? Number(availableDealers[0].id) : 1;
                let lastErrorMsg = "";

                for (const item of cartItems) {
                    const itemDest = item.deliveryAddress?.trim() || destination || user.address || "Main Operational Hub";
                    const itemQty = Math.max(1, parseInt(String(item.quantity)) || 1);
                    const itemAmount = Number((item.product.numericPrice * itemQty).toFixed(2));
                    
                    const rawProdId = Number(item.product.id) || 1;
                    const matchedProd = products.find((p) => p.id === rawProdId);
                    const safeProdId = matchedProd?.id || rawProdId;

                    const itemPayload: any = {
                        quantity: itemQty,
                        address: itemDest,
                        status: "pending",
                        product: { id: safeProdId },
                        payment: {
                            cardNumber: cleanCard,
                            cardType: cleanType,
                            amount: itemAmount,
                            status: "completed",
                        },
                    };

                    const chosenSourcing = item.sourcingChoice === "dealer" ? "dealer" : "supplier";
                    const partyIdNum = Number(item.selectedPartyId);

                    if (chosenSourcing === "supplier") {
                        itemPayload.supplier = { id: (partyIdNum > 0 && !isNaN(partyIdNum)) ? partyIdNum : defaultSupplierId };
                    } else {
                        itemPayload.dealer = { id: (partyIdNum > 0 && !isNaN(partyIdNum)) ? partyIdNum : defaultDealerId };
                    }

                    try {
                        const itemRes = await axios.post(
                            `http://localhost:8000/customer/${user.id}/orders`,
                            itemPayload,
                            { withCredentials: true, validateStatus: (status) => status < 500 }
                        );
                        if (itemRes.status === 200 || itemRes.status === 201) {
                            const newId = itemRes.data?.id || (Array.isArray(itemRes.data) && itemRes.data[0]?.id) || (`ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`);
                            createdIds.push(newId);
                        } else {
                            lastErrorMsg = itemRes.data?.message || itemRes.data?.error || `Server HTTP ${itemRes.status}`;
                            console.warn("Sub-order response status:", itemRes.status, itemRes.data);
                        }
                    } catch (itemErr: any) {
                        lastErrorMsg = itemErr.message || "Network request error";
                        console.warn("Sub-order creation error for item:", item.product.name, itemErr);
                    }
                }

                if (createdIds.length > 0) {
                    const firstNumId = createdIds.find(id => typeof id === "number") as number | undefined;
                    setCreatedOrderId(firstNumId || null);
                    try {
                        const itemsListText = cartItems.map((it, idx) =>
                            `${idx + 1}. ${it.product.name} (Qty: ${it.quantity}) @ $${it.product.price} = $${(it.product.numericPrice * it.quantity).toFixed(2)} [Sourced: ${(it.sourcingChoice || "supplier").toUpperCase()}] -> Destination: ${it.deliveryAddress || destination}`
                        ).join("\n");

                        await axios.post(
                            "http://localhost:8000/customer/send-email",
                            {
                                to: user.email,
                                subject: `Multi-Product Order & Sandbox Payment Receipt (${cartItems.length} Products)`,
                                text: `Dear ${user.userName},\n\nYour consolidated multi-product order has been confirmed and paid via Sandbox Payment Gateway!\n\nOrder Items Breakdown:\n${itemsListText}\n\nTotal Settled: $${totalAmount} USD\nPayment Instrument: ${cleanType} (${cleanCard})\nTransaction ID: ${sandboxTxnId}\nAuthorization Code: ${sandboxAuthCode}\n\nThank you for choosing Oil Supply & Delivery Network!`,
                            },
                            { withCredentials: true, validateStatus: (status) => status < 500 }
                        );
                    } catch (mailErr) {
                        console.warn("Mail dispatch error:", mailErr);
                    }

                    setSandboxProcessingLogs((prev) => [
                        ...prev,
                        `Created ${createdIds.length} orders in distribution network: Order IDs #${createdIds.join(", #")}`,
                        "Consolidated email receipt dispatched to buyer.",
                        "Sandbox payment settled and verified.",
                    ]);

                    handleClearCart();

                    setTimeout(() => {
                        setSandboxStep("success");
                        fetchOrders(user.id, user.title);
                    }, 1000);
                } else {
                    setSandboxStep("declined");
                    const isAuthError = lastErrorMsg.toLowerCase().includes("unauthorized") || lastErrorMsg.includes("401");
                    if (isAuthError) {
                        if (confirm("Your login session has expired on the backend server. Would you like to sign in again? (Your delivery cart items will remain saved)")) {
                            router.push("/login");
                        }
                    } else {
                        alert(`Failed to create multi-product orders. Reason: ${lastErrorMsg || "Backend service returned an error"}`);
                    }
                }
                return;
            }

            // Single Product Checkout
            const orderPayload: any = {
                quantity: orderQuantity,
                address: destination,
                status: "pending",
                product: { id: checkoutProduct.id },
                payment: {
                    cardNumber: cleanCard,
                    cardType: cleanType,
                    amount: totalAmount,
                    status: "completed",
                },
            };

            if (sourcingChoice === "supplier") {
                orderPayload.supplier = { id: Number(selectedPartyId) };
            } else {
                orderPayload.dealer = { id: Number(selectedPartyId) };
            }

            const orderRes = await axios.post(
                `http://localhost:8000/customer/${user.id}/orders`,
                orderPayload,
                { withCredentials: true, validateStatus: (status) => status < 500 }
            );

            if (orderRes.status === 200 || orderRes.status === 201) {
                setCreatedOrderId(orderRes.data?.id || null);
                try {
                    const partnerName = sourcingChoice === "supplier"
                        ? (availableSuppliers.find(s => s.id === Number(selectedPartyId))?.userName || "Direct Refinery Supplier")
                        : (availableDealers.find(d => d.id === Number(selectedPartyId))?.userName || "Authorized Local Dealer");

                    await axios.post(
                        "http://localhost:8000/customer/send-email",
                        {
                            to: user.email,
                            subject: `Order & Sandbox Payment Receipt - ${checkoutProduct.name}`,
                            text: `Dear ${user.userName},\n\nYour order has been placed and paid via Sandbox Payment Gateway!\n\nProduct: ${checkoutProduct.name}\nQuantity: ${orderQuantity}\nSourced From: ${sourcingChoice.toUpperCase()} (${partnerName})\nTotal Paid: $${totalAmount}\nPayment Method: ${cleanType} (${cleanCard})\nTransaction ID: ${sandboxTxnId}\nAuthorization Code: ${sandboxAuthCode}\nDelivery Address: ${destination}\n\nThank you for choosing Oil Supply & Delivery Network!`,
                        },
                        { withCredentials: true, validateStatus: (status) => status < 500 }
                    );
                } catch (mailErr) {
                    console.warn("Mail dispatch error:", mailErr);
                }

                setSandboxProcessingLogs((prev) => [
                    ...prev,
                    `Order recorded in distribution network: Order ID #${orderRes.data?.id || "Live"}`,
                    "Email receipt dispatched to buyer.",
                    "Sandbox payment settled and verified.",
                ]);

                setTimeout(() => {
                    setSandboxStep("success");
                    fetchOrders(user.id, user.title);
                }, 1000);
            } else {
                setSandboxStep("declined");
                const msg = orderRes.data?.message || "Order placement failed.";
                if (String(msg).toLowerCase().includes("unauthorized") || orderRes.status === 401) {
                    if (confirm("Your login session has expired on the backend server. Would you like to sign in again?")) {
                        router.push("/login");
                    }
                } else {
                    alert(msg);
                }
            }
        } catch (err: any) {
            console.warn("Sandbox payment/order error:", err);
            setSandboxStep("declined");
        }
    };

    const handleFinishSandboxPayment = () => {
        setIsSandboxModalOpen(false);
        setIsMultiCheckout(false);
        setIsCartModalOpen(false);
        setCheckoutProduct(null);
        if (user && user.id) {
            fetchOrders(user.id, user.title);
        }
        setActiveTab("orders");
        if (createdOrderId) {
            handleTrackOrder(createdOrderId);
        }
    };

    const handleCompleteOrder = async () => {
        handleLaunchSandboxGateway();
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

    const handleTrackOrder = async (orderId: number, targetOrder?: Order) => {
        setTrackedOrderId(orderId);
        setTrackedOrderStatus("Connecting to delivery tracker...");

        const matchedOrder: Order = targetOrder || orders.find(o => o.id === orderId) || {
            id: orderId,
            quantity: 1,
            status: "in-transit",
            address: user?.address || "Customer Terminal Facility",
            product: { id: 1, name: "Petroleum Fuel" },
        };
        setUberTrackingOrder(matchedOrder);
        setIsUberMapOpen(true);

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
                if (res.data.order) {
                    setUberTrackingOrder((prev) => ({
                        ...(prev || matchedOrder),
                        status: res.data.order.status || prev?.status || "in-transit",
                    }));
                }
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

            {/* Cart Toast Notification */}
            {cartToast && (
                <div className="fixed top-20 right-6 z-50 bg-[#0F2747] text-white border-2 border-[#F59E0B] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <span className="text-lg">🛒</span>
                    <span className="text-xs font-bold text-[#F59E0B]">{cartToast}</span>
                    <button
                        onClick={() => setIsCartModalOpen(true)}
                        className="btn btn-xs bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-black border-none rounded-lg ml-2 cursor-pointer"
                    >
                        View Cart
                    </button>
                </div>
            )}

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

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        {isCustomer && (
                            <button
                                type="button"
                                onClick={() => setIsCartModalOpen(true)}
                                className="btn btn-sm bg-[#0F2747] hover:bg-[#163860] text-white font-bold border-2 border-[#F59E0B]/50 hover:border-[#F59E0B] shadow-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all"
                            >
                                <span className="text-base">🛒</span>
                                <span className="hidden sm:inline">Delivery Cart</span>
                                {cartTotalItems > 0 && (
                                    <span className="badge bg-[#F59E0B] text-[#1E293B] font-black text-xs px-2 py-0.5 border-none">
                                        {cartTotalItems}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="btn bg-[#DC2626] hover:bg-[#b91c1c] btn-sm text-white font-semibold border-none shadow-sm rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>Sign Out</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
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

            {/* TAB 1: Monitoring (Admin) */}
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

            {/* TAB 2: Users CRUD (Admin) */}
            {isAdmin && activeTab === "users_crud" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-dark-slate">Global User Management & Search</h1>
                            <p className="text-sm text-secondary-gray">Search users by username across all system roles, create new users, and manage account details.</p>
                        </div>
                        <button
                            onClick={() => setIsCreateUserModalOpen(true)}
                            className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
                        >
                            + Create New User
                        </button>
                    </div>

                    <div className="bg-card-white border border-[#E2E8F0] p-4 sm:p-5 rounded-2xl mb-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-gray">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    placeholder="Search users by username or email..."
                                    className="w-full pl-10 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] text-dark-slate placeholder-secondary-gray focus:outline-none focus:border-primary focus:bg-card-white transition-all shadow-inner"
                                />
                                {userSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setUserSearchQuery("")}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-gray hover:text-dark-slate cursor-pointer"
                                        title="Clear search"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                                <span className="font-semibold text-secondary-gray whitespace-nowrap">
                                    Showing <span className="font-bold text-dark-slate">{filteredUsers.length}</span> of <span className="font-bold text-dark-slate">{allMergedUsers.length}</span> users
                                </span>
                                {(userSearchQuery || selectedUserRole !== "All") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserSearchQuery("");
                                            setSelectedUserRole("All");
                                        }}
                                        className="text-xs text-error-red hover:underline font-bold cursor-pointer whitespace-nowrap"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#F1F5F9]">
                            <span className="text-xs font-bold text-secondary-gray mr-1">Filter by Role:</span>
                            {["All", "Customer", "Dealer", "Supplier", "Admin"].map((roleOption) => (
                                <button
                                    key={roleOption}
                                    type="button"
                                    onClick={() => setSelectedUserRole(roleOption)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        selectedUserRole === roleOption
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-[#F1F5F9] text-secondary-gray hover:bg-[#E2E8F0] hover:text-dark-slate"
                                    }`}
                                >
                                    {roleOption}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="table w-full text-left">
                                <thead className="bg-[#F8FAFC] text-dark-slate border-b border-[#E2E8F0]">
                                    <tr>
                                        <th className="py-3 px-4 font-bold">Role</th>
                                        <th className="py-3 px-4 font-bold">Username</th>
                                        <th className="py-3 px-4 font-bold">Email</th>
                                        <th className="py-3 px-4 font-bold">Phone</th>
                                        <th className="py-3 px-4 font-bold">Address / Hub</th>
                                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0]">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-secondary-gray">
                                                No users found matching query.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => {
                                            const role = u.title || u.role || "User";
                                            const isTargetAdmin = role.toLowerCase() === "admin";
                                            return (
                                                <tr key={`${role}-${u.id}`} className="hover:bg-[#F8FAFC]/80 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <span className={`badge border-none font-bold text-xs uppercase px-2.5 py-1 ${getRoleBadgeColor(role)}`}>
                                                            {role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-dark-slate">
                                                        {u.userName || u.username}
                                                    </td>
                                                    <td className="py-3 px-4 text-secondary-gray text-xs">{u.email}</td>
                                                    <td className="py-3 px-4 text-secondary-gray text-xs">{u.phoneNumber || "—"}</td>
                                                    <td className="py-3 px-4 text-secondary-gray text-xs">{u.address || "—"}</td>
                                                    <td className="py-3 px-4 text-right">
                                                        {!isTargetAdmin && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingUser(u);
                                                                        setEditTargetUserName(u.userName || u.username || "");
                                                                        setEditTargetPhone(u.phoneNumber || "");
                                                                        setEditTargetAddress(u.address || "");
                                                                    }}
                                                                    className="btn btn-xs bg-primary hover:bg-primary/90 text-white font-bold border-none rounded-lg cursor-pointer"
                                                                >
                                                                    Edit (PATCH)
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAdminDeleteUser(u)}
                                                                    className="btn btn-xs bg-error-red hover:bg-error-red/90 text-white font-bold border-none rounded-lg cursor-pointer"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Products Catalog */}
            {activeTab === "products" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-extrabold text-[#1E293B]">
                                Petroleum Products & Fuels Marketplace
                            </h1>
                            <p className="text-sm text-[#64748B]">
                                Certified petroleum grades sourced directly from national refineries and authorized regional depots.
                            </p>
                        </div>
                        {(isSupplier || isDealer) && (
                            <button
                                onClick={() => setIsPostProductModalOpen(true)}
                                className="bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm border-none self-start sm:self-auto flex items-center gap-2"
                            >
                                <span>+</span> Post Product Lot
                            </button>
                        )}
                    </div>

                    <div className="bg-card-white border border-[#E2E8F0] p-4 sm:p-5 rounded-2xl mb-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-gray">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={productSearchQuery}
                                    onChange={(e) => setProductSearchQuery(e.target.value)}
                                    placeholder="Search petroleum fuels, octane grade, diesel..."
                                    className="w-full pl-10 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] text-dark-slate placeholder-secondary-gray focus:outline-none focus:border-primary focus:bg-card-white transition-all shadow-inner"
                                />
                                {productSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setProductSearchQuery("")}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-gray hover:text-dark-slate cursor-pointer"
                                        title="Clear search"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                                <span className="font-semibold text-secondary-gray whitespace-nowrap">
                                    Showing <span className="font-bold text-dark-slate">{filteredProducts.length}</span> of <span className="font-bold text-dark-slate">{products.length}</span> products
                                </span>
                                {(productSearchQuery || selectedProductCategory !== "All") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProductSearchQuery("");
                                            setSelectedProductCategory("All");
                                        }}
                                        className="text-xs text-error-red hover:underline font-bold cursor-pointer whitespace-nowrap"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {productCategories.length > 1 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#F1F5F9]">
                                <span className="text-xs font-bold text-secondary-gray mr-1">Filter by Category:</span>
                                {productCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedProductCategory(cat)}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                            selectedProductCategory === cat
                                                ? "bg-primary text-white shadow-sm"
                                                : "bg-[#F1F5F9] text-secondary-gray hover:bg-[#E2E8F0] hover:text-dark-slate"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
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
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-2xl border border-[#E2E8F0] text-center shadow-sm max-w-xl mx-auto my-6">
                            <h3 className="text-base font-bold text-dark-slate mb-1">No matching products found</h3>
                            <p className="text-xs text-secondary-gray mb-4">
                                No petroleum products match {productSearchQuery ? `"${productSearchQuery}"` : ""} {selectedProductCategory !== "All" ? `under category "${selectedProductCategory}"` : ""}.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setProductSearchQuery("");
                                    setSelectedProductCategory("All");
                                }}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
                            >
                                Reset Search & Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                            {filteredProducts.map((product) => (
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
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleOpenAdminEditProduct(product)}
                                                            className="btn btn-sm bg-primary hover:bg-primary/90 text-white font-bold border-none rounded-xl cursor-pointer"
                                                        >
                                                            Update (PUT)
                                                        </button>
                                                        <button
                                                            onClick={() => handleAdminDeleteProduct(product.id, product.name)}
                                                            className="btn btn-sm bg-error-red hover:bg-error-red/90 text-white font-bold border-none rounded-xl cursor-pointer"
                                                        >
                                                            Delete (DELETE)
                                                        </button>
                                                    </div>
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
                                                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(product)}
                                                            className="btn btn-sm bg-primary hover:bg-[#163860] text-white font-bold border-none rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                            title="Add product to multi-delivery cart"
                                                        >
                                                            <span className="text-amber-400">🛒</span>
                                                            <span>
                                                                {cartItems.some((ci) => ci.product.id === product.id)
                                                                    ? `In Cart (${cartItems.find((ci) => ci.product.id === product.id)?.quantity})`
                                                                    : "Add to Cart"}
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenCheckout(product)}
                                                            className="btn btn-sm bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold border-none rounded-xl text-xs cursor-pointer shadow-xs"
                                                        >
                                                            Buy Now
                                                        </button>
                                                    </div>
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

            {/* TAB 4: Inventory (Dealer / Supplier) */}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredInventory.map((item) => (
                            <div key={item.id} className="bg-card-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-bold text-secondary-gray bg-[#F1F5F9] px-2.5 py-1 rounded">
                                        {item.category}
                                    </span>
                                    <h3 className="font-bold text-lg text-dark-slate mt-2">{item.name}</h3>
                                    <p className="text-xs text-secondary-gray mt-1">{item.description}</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                                    <span className="font-extrabold text-primary">{item.price}</span>
                                    <button
                                        onClick={() => handleRemoveProductFromStock(item.id)}
                                        className="btn btn-xs bg-rose-500 hover:bg-rose-600 text-white border-none rounded-lg"
                                    >
                                        Remove from Portfolio
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 5: Orders */}
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

                                    {trackedOrderId === item.id && trackedOrderStatus && item.status?.toLowerCase() !== "delivered" && item.status?.toLowerCase() !== "completed" && (
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
                                                {item.status?.toLowerCase() === "delivered" || item.status?.toLowerCase() === "completed" ? (
                                                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Delivery Complete</span>
                                                    </div>
                                                ) : item.status?.toLowerCase() === "cancelled" || item.status?.toLowerCase() === "canceled" ? (
                                                    <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-2 rounded border border-red-200">
                                                        Order Cancelled
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleTrackOrder(item.id, item)}
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
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                {item.status?.toLowerCase() === "delivered" || item.status?.toLowerCase() === "completed" ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3.5 py-2 rounded border border-green-300 flex items-center gap-1.5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>Delivery Complete</span>
                                                    </span>
                                                ) : item.status?.toLowerCase() === "confirmed" ? (
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

                                                {item.status?.toLowerCase() !== "rejected" && item.status?.toLowerCase() !== "delivered" && item.status?.toLowerCase() !== "completed" && (
                                                    <button
                                                        onClick={() => handleConfirmOrRejectOrder(item.id, "rejected", item.customerEmail)}
                                                        className="bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer"
                                                    >
                                                        Reject (PUT)
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 6: Profile */}
            {activeTab === "profile" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="bg-card-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm max-w-2xl mx-auto">
                        <h2 className="text-xl font-bold text-dark-slate mb-4">Edit Profile Settings</h2>
                        {profileStatus && (
                            <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                {profileStatus}
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Username / Legal Name</label>
                                <input
                                    type="text"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">Primary Operational Address</label>
                                <input
                                    type="text"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none"
                                />
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-[#F1F5F9]">
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="text-xs text-rose-600 hover:underline font-bold"
                                >
                                    Delete Account
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-primary/90 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TAB 7: Messages (Pusher) */}
            {activeTab === "messages" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="bg-card-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-dark-slate mb-1">Realtime Logistics Dispatch Chat</h2>
                        <p className="text-xs text-secondary-gray mb-4">Direct WebSocket line across Refineries, Dealers, and Transport Fleets.</p>
                        
                        <div className="h-80 overflow-y-auto bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3 mb-4">
                            {chatMessages.map((m) => (
                                <div key={m.id} className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
                                    <div className="flex items-center justify-between text-xs text-secondary-gray mb-1">
                                        <span className="font-bold text-primary">{m.sender} ({m.role})</span>
                                        <span>{m.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-dark-slate">{m.message}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendChatMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a broadcast message to all logistics channels..."
                                className="flex-1 p-2.5 border border-secondary-gray rounded-xl text-sm outline-none bg-white text-dark-slate"
                            />
                            <button
                                type="submit"
                                disabled={isSendingChat}
                                className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 1: Cart Drawer Modal */}
            <CartDrawerModal
                isOpen={isCartModalOpen}
                onClose={() => setIsCartModalOpen(false)}
                cartItems={cartItems}
                cartTotalItems={cartTotalItems}
                cartSubtotal={cartSubtotal}
                cartTotalAmount={cartTotalAmount}
                availableSuppliers={availableSuppliers}
                availableDealers={availableDealers}
                deliveryAddress={deliveryAddress}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onUpdateSourcing={handleUpdateCartSourcing}
                onUpdateAddress={handleUpdateCartAddress}
                onProceedToPayment={handleLaunchMultiCartSandbox}
                onBrowseCatalog={() => {
                    setIsCartModalOpen(false);
                    setActiveTab("products");
                }}
            />

            {/* MODAL 2: Checkout & Payment Modal */}
            <CheckoutPaymentModal
                isOpen={Boolean(checkoutProduct) && !isSandboxModalOpen}
                onClose={() => {
                    setCheckoutProduct(null);
                    setIsMultiCheckout(false);
                }}
                isMultiCheckout={isMultiCheckout}
                checkoutProduct={checkoutProduct}
                cartItems={cartItems}
                cartTotalItems={cartTotalItems}
                cartTotalAmount={cartTotalAmount}
                orderQuantity={orderQuantity}
                setOrderQuantity={setOrderQuantity}
                sourcingChoice={sourcingChoice}
                setSourcingChoice={setSourcingChoice}
                selectedPartyId={selectedPartyId}
                setSelectedPartyId={(id) => setSelectedPartyId(id === "" ? "" : (Number(id) || ""))}
                availableSuppliers={availableSuppliers}
                availableDealers={availableDealers}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                user={user}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardType={cardType}
                setCardType={setCardType}
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardHolder={cardHolder}
                setCardHolder={setCardHolder}
                cardExpiry={cardExpiry}
                setCardExpiry={setCardExpiry}
                cardCvv={cardCvv}
                setCardCvv={setCardCvv}
                mobileOperator={mobileOperator}
                setMobileOperator={setMobileOperator}
                mobileWalletNumber={mobileWalletNumber}
                setMobileWalletNumber={setMobileWalletNumber}
                bankName={bankName}
                setBankName={setBankName}
                bankAccountNumber={bankAccountNumber}
                setBankAccountNumber={setBankAccountNumber}
                onApplyCardPreset={applySandboxCardPreset}
                onApplyMobilePreset={applySandboxMobilePreset}
                onLaunchSandboxGateway={handleLaunchSandboxGateway}
                onReturnToCart={() => {
                    setCheckoutProduct(null);
                    setIsMultiCheckout(false);
                    setIsCartModalOpen(true);
                }}
            />

            {/* MODAL 3: Sandbox 256-Bit SSL Gateway Modal */}
            <SandboxGatewayModal
                isOpen={isSandboxModalOpen}
                onClose={() => setIsSandboxModalOpen(false)}
                sandboxStep={sandboxStep === "otp_challenge" ? "gateway" : sandboxStep}
                setSandboxStep={(step) => setSandboxStep(step)}
                isMultiCheckout={isMultiCheckout}
                checkoutProduct={checkoutProduct}
                cartItems={cartItems}
                cartTotalItems={cartTotalItems}
                cartTotalAmount={cartTotalAmount}
                orderQuantity={orderQuantity}
                paymentMethod={paymentMethod}
                cardType={cardType}
                cardNumber={cardNumber}
                mobileOperator={mobileOperator}
                mobileWalletNumber={mobileWalletNumber}
                bankName={bankName}
                bankAccountNumber={bankAccountNumber}
                deliveryAddress={deliveryAddress}
                sandboxTxnId={sandboxTxnId}
                sandboxAuthCode={sandboxAuthCode}
                sandboxOtp={sandboxOtp}
                setSandboxOtp={setSandboxOtp}
                sandboxProcessingLogs={sandboxProcessingLogs}
                createdPaymentRecord={createdPaymentRecord}
                createdOrderId={createdOrderId}
                onExecuteAuthorization={handleExecuteSandboxAuthorization}
                onFinishPayment={handleFinishSandboxPayment}
                onReturnToCart={() => {
                    setIsSandboxModalOpen(false);
                    setIsCartModalOpen(true);
                }}
            />

            {/* MODAL: Live Uber Map Tracker */}
            {isUberMapOpen && uberTrackingOrder && (
                <UberMapTracker
                    order={uberTrackingOrder}
                    userRole={user?.title || "customer"}
                    onClose={() => {
                        setIsUberMapOpen(false);
                        setUberTrackingOrder(null);
                    }}
                />
            )}
        </>
    );
}
