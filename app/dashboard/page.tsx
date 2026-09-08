"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";
import UberMapTracker from "@/components/uber-map-tracker";
import { getPusherClient, ChatMessage } from "@/lib/pusher";
import { checkEmailUniqueness } from "@/lib/email-checker";

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
import { WholesaleOrderModal } from "@/components/dashboard/modals/wholesale-order-modal";
import { PostProductModal } from "@/components/dashboard/modals/post-product-modal";
import { EditProductModal } from "@/components/dashboard/modals/edit-product-modal";
import { EditUserModal } from "@/components/dashboard/modals/edit-user-modal";
import { EditOrderModal } from "@/components/dashboard/modals/edit-order-modal";

import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { ProductsTab } from "@/components/dashboard/tabs/products-tab";
import { OrdersTab } from "@/components/dashboard/tabs/orders-tab";
import { TrackingTab } from "@/components/dashboard/tabs/tracking-tab";
import { InventoryTab } from "@/components/dashboard/tabs/inventory-tab";
import { AdminMonitoringTab } from "@/components/dashboard/tabs/admin-monitoring-tab";
import { LiveChatTab } from "@/components/dashboard/tabs/live-chat-tab";
import { ProfileTab } from "@/components/dashboard/tabs/profile-tab";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DashboardTab>("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [customInventory, setCustomInventory] = useState<Product[]>([]);
    const [supplierOperationalStatus, setSupplierOperationalStatus] = useState<string>("active");

    const [orders, setOrders] = useState<Order[]>([]);
    const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);
    const [isUberMapOpen, setIsUberMapOpen] = useState<boolean>(false);
    const [uberTrackingOrder, setUberTrackingOrder] = useState<Order | null>(null);

    const [allMergedUsers, setAllMergedUsers] = useState<SystemUser[]>([]);
    const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
    const [availableDealers, setAvailableDealers] = useState<any[]>([]);

    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [editUserForm, setEditUserForm] = useState({ name: "", email: "", role: "Customer", phone: "", address: "" });
    const [isEditingUserSubmitting, setIsEditingUserSubmitting] = useState(false);

    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editOrderForm, setEditOrderForm] = useState({ status: "Pending", quantity: "1", totalAmount: "0", deliveryAddress: "" });
    const [isEditingOrderSubmitting, setIsEditingOrderSubmitting] = useState(false);

    const [wholesaleProduct, setWholesaleProduct] = useState<Product | null>(null);
    const [wholesaleQuantity, setWholesaleQuantity] = useState<string>("50");
    const [wholesaleAddress, setWholesaleAddress] = useState<string>("");
    const [wholesaleNotes, setWholesaleNotes] = useState<string>("");
    const [orderingWholesale, setOrderingWholesale] = useState<boolean>(false);

    const [isPostProductModalOpen, setIsPostProductModalOpen] = useState<boolean>(false);
    const [newProductForm, setNewProductForm] = useState({ name: "", description: "", price: "", stock: "", category: "Octane" });
    const [isSubmittingNewProduct, setIsSubmittingNewProduct] = useState<boolean>(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editProductForm, setEditProductForm] = useState({ price: "", stock: "" });
    const [isSubmittingEditProduct, setIsSubmittingEditProduct] = useState<boolean>(false);

    const [isCreatingUser, setIsCreatingUser] = useState(false);

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
    const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "bank">("card");
    const [mobileOperator, setMobileOperator] = useState<string>("bKash");
    const [mobileWalletNumber, setMobileWalletNumber] = useState<string>("01700-000000");
    const [bankName, setBankName] = useState<string>("Eastern Bank Limited");
    const [bankAccountNumber, setBankAccountNumber] = useState<string>("EBL-10029384");

    const [isSandboxModalOpen, setIsSandboxModalOpen] = useState<boolean>(false);
    const [sandboxStep, setSandboxStep] = useState<"gateway" | "processing" | "success" | "declined">("gateway");
    const [sandboxOtp, setSandboxOtp] = useState<string>("123456");
    const [sandboxTxnId, setSandboxTxnId] = useState<string>("");
    const [sandboxAuthCode, setSandboxAuthCode] = useState<string>("");
    const [sandboxProcessingLogs, setSandboxProcessingLogs] = useState<string[]>([]);
    const [createdPaymentRecord, setCreatedPaymentRecord] = useState<any>(null);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
    const [cartToast, setCartToast] = useState<string | null>(null);
    const [isMultiCheckout, setIsMultiCheckout] = useState<boolean>(false);

    const cartTotalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
    const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.product.numericPrice * item.quantity), 0), [cartItems]);
    const cartTotalAmount = useMemo(() => Number(cartSubtotal.toFixed(2)), [cartSubtotal]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("petroleum_cart");
            if (saved) setCartItems(JSON.parse(saved));
        } catch {}
    }, []);

    const updateCartState = (newCart: CartItem[]) => {
        setCartItems(newCart);
        try {
            localStorage.setItem("petroleum_cart", JSON.stringify(newCart));
        } catch {}
    };

    const handleAddToCart = (product: Product, quantity: number = 1, sourcing: "supplier" | "dealer" = "supplier") => {
        const defaultParty = sourcing === "supplier" ? (availableSuppliers[0]?.id || 1) : (availableDealers[0]?.id || 1);
        const defaultDest = deliveryAddress.trim() || user?.address || "Main Operational Hub";

        const existingIndex = cartItems.findIndex((ci) => ci.product.id === product.id);
        let updated: CartItem[];

        if (existingIndex >= 0) {
            updated = cartItems.map((ci, idx) =>
                idx === existingIndex ? { ...ci, quantity: ci.quantity + quantity } : ci
            );
        } else {
            updated = [...cartItems, { product, quantity, sourcingChoice: sourcing, selectedPartyId: defaultParty, deliveryAddress: defaultDest }];
        }

        updateCartState(updated);
        setCartToast(` Added ${product.name} (${quantity} unit${quantity > 1 ? "s" : ""}) to delivery cart!`);
        setTimeout(() => setCartToast(null), 3000);
    };

    const handleUpdateCartQty = (productId: number, newQty: number) => {
        if (newQty <= 0) {
            updateCartState(cartItems.filter((ci) => ci.product.id !== productId));
            return;
        }
        updateCartState(cartItems.map((ci) => (ci.product.id === productId ? { ...ci, quantity: newQty } : ci)));
    };

    const handleRemoveFromCart = (productId: number) => updateCartState(cartItems.filter((ci) => ci.product.id !== productId));
    const handleClearCart = () => updateCartState([]);
    const handleUpdateCartSourcing = (productId: number, sourcingChoice: "supplier" | "dealer", partyId: number | string) => {
        updateCartState(cartItems.map((ci) => (ci.product.id === productId ? { ...ci, sourcingChoice, selectedPartyId: partyId } : ci)));
    };
    const handleUpdateCartAddress = (productId: number, address: string) => {
        updateCartState(cartItems.map((ci) => (ci.product.id === productId ? { ...ci, deliveryAddress: address } : ci)));
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
            setCardHolder(parsed.userName || parsed.name || parsed.email?.split("@")[0]);
            if (parsed.status) setSupplierOperationalStatus(parsed.status);
            fetchFullProfile(parsed.email, parsed.title || parsed.role);
            fetchSourcingParties();
        } catch (e) {
            console.error("Error parsing user data:", e);
            router.push("/login");
            return;
        }
        setLoading(false);
        fetchCatalogProducts();
    }, []);

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
                        numericPrice: typeof p.price === "number" ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0,
                        description: p.description || "High-grade petroleum fuel product.",
                        quantity: typeof p.quantity === "number" ? p.quantity : 1000,
                        stock: typeof p.quantity === "number" ? p.quantity : typeof p.stock === "number" ? p.stock : 1000,
                        inStock: typeof p.quantity === "number" ? p.quantity > 0 : true,
                        stockLevel: (p.quantity || 1000) <= 0 ? "Out of Stock" : (p.quantity || 1000) < 1000 ? "Low Stock" : "In Stock",
                        image: getProductImage(p.name, p.image, p.id),
                    }));
                setProducts(mapped);
            }
        } catch (err) {
            console.warn("Failed to fetch products:", err);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchSourcingParties = async () => {
        try {
            const [suppliersRes, dealersRes] = await Promise.allSettled([
                axios.get("http://localhost:8000/supplier/getallsupplier", { withCredentials: true, validateStatus: (status) => status < 500 }),
                axios.get("http://localhost:8000/dealer/all", { withCredentials: true, validateStatus: (status) => status < 500 }),
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
                const fullUser: UserData = {
                    id: match.id,
                    email: match.email,
                    userName: match.username || match.userName || email.split("@")[0],
                    name: match.username || match.userName || email.split("@")[0],
                    phoneNumber: match.phoneNumber,
                    phone: match.phoneNumber,
                    address: match.address,
                    title: match.title || r.charAt(0).toUpperCase() + r.slice(1),
                    role: match.title || r.charAt(0).toUpperCase() + r.slice(1),
                    status: match.status || "active",
                    photoUrl: match.filename ? `http://localhost:8000/customer/getimage/${match.filename}` : undefined,
                };
                setUser(fullUser);
                localStorage.setItem("user", JSON.stringify(fullUser));
                fetchOrders(match.id, fullUser.title);
                if (fullUser.title === "Admin") fetchAllMergedUsers();
                return;
            }
        } catch (searchErr) {
            console.warn("User lookup error:", searchErr);
        }
    };

    const fetchAllMergedUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8000/admin/getallusers", { withCredentials: true, validateStatus: (status) => status < 500 });
            if (res.status === 200 && Array.isArray(res.data)) setAllMergedUsers(res.data);
        } catch (err) {
            console.warn("Failed to fetch merged users:", err);
        }
    };

    const fetchOrders = async (id?: number, title?: string) => {
        const r = getRolePath(title);
        if (r === "customer") {
            if (!id) return;
            try {
                const res = await axios.get(`http://localhost:8000/customer/${id}/orders`, { withCredentials: true, validateStatus: (status) => status < 500 });
                if (res.status === 200 && Array.isArray(res.data)) {
                    setOrders(res.data.map((o: any) => ({ ...o, totalAmount: o.payment?.amount || (o.quantity * 2.5).toFixed(2), deliveryAddress: o.address })));
                }
            } catch (err) {
                console.warn("Failed to fetch customer orders:", err);
            }
        } else {
            try {
                const res = await axios.get("http://localhost:8000/customer/getallcustomer", { withCredentials: true, validateStatus: (status) => status < 500 });
                if (res.status === 200 && Array.isArray(res.data)) {
                    const allOrders: Order[] = [];
                    res.data.forEach((cust: any) => {
                        if (Array.isArray(cust.orders)) {
                            cust.orders.forEach((o: any) => {
                                allOrders.push({
                                    id: o.id,
                                    quantity: o.quantity || 1,
                                    status: o.status || "Pending",
                                    address: o.address || cust.address,
                                    deliveryAddress: o.address || cust.address,
                                    customerId: cust.id,
                                    customerName: cust.username || cust.userName || cust.email,
                                    customerEmail: cust.email,
                                    product: o.product || { id: 1, name: "Fuel Product" },
                                    supplier: o.supplier,
                                    dealer: o.dealer,
                                    payment: o.payment,
                                    totalAmount: o.payment?.amount || (o.quantity * 2.5).toFixed(2),
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
        setMobileWalletNumber(op === "bKash" ? "01700-000000" : op === "Nagad" ? "01800-000000" : "01900-000000");
    };

    const handleOpenCheckout = (product: Product) => {
        setCheckoutProduct(product);
        setOrderQuantity(1);
        if (user?.address) setDeliveryAddress(user.address);
        if (sourcingChoice === "supplier" && availableSuppliers.length > 0) setSelectedPartyId(availableSuppliers[0].id);
        else if (sourcingChoice === "dealer" && availableDealers.length > 0) setSelectedPartyId(availableDealers[0].id);
        applySandboxCardPreset("Visa");
        setIsSandboxModalOpen(false);
        setSandboxStep("gateway");
        setCreatedPaymentRecord(null);
        setCreatedOrderId(null);
    };

    const handleLaunchSandboxGateway = () => {
        if (!user || !user.id || (!checkoutProduct && !isMultiCheckout)) return;
        setSandboxTxnId((isMultiCheckout ? "SANDBOX-MULTI-" : "SB-TXN-") + Math.random().toString(36).substring(2, 9).toUpperCase());
        setSandboxAuthCode("AUTH-" + Math.floor(100000 + Math.random() * 900000));
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
                setSandboxProcessingLogs((prev) => [...prev, "Sandbox Issuer simulated decline: 51_INSUFFICIENT_FUNDS_OR_EXPIRED_TOKEN"]);
                setSandboxStep("declined");
            }, 1200);
            return;
        }

        const totalAmount = isMultiCheckout ? cartTotalAmount : Number((checkoutProduct.numericPrice * orderQuantity).toFixed(2));
        const destination = deliveryAddress.trim() || user.address || "Main Operational Hub";
        const cleanCard = paymentMethod === "card" ? (cardNumber.trim() || "4000123456789010") : paymentMethod === "mobile" ? (mobileWalletNumber.trim() || "01700000000") : (bankAccountNumber.trim() || "EBL-10029384");
        const cleanType = paymentMethod === "card" ? cardType : paymentMethod === "mobile" ? `${mobileOperator} Sandbox` : `${bankName} Wire Sandbox`;

        try {
            const paymentRes = await axios.post("http://localhost:8000/payment/process", { cardNumber: cleanCard, cardType: cleanType, amount: totalAmount, status: "completed" }, { withCredentials: true, validateStatus: (status) => status < 500 });
            if (paymentRes.status === 200 || paymentRes.status === 201) {
                setCreatedPaymentRecord(paymentRes.data);
            }

            if (isMultiCheckout && cartItems.length > 0) {
                const createdIds: (number | string)[] = [];
                const defaultSupplierId = availableSuppliers[0]?.id ? Number(availableSuppliers[0].id) : 1;
                const defaultDealerId = availableDealers[0]?.id ? Number(availableDealers[0].id) : 1;

                for (const item of cartItems) {
                    const itemDest = item.deliveryAddress?.trim() || destination;
                    const itemQty = Math.max(1, parseInt(String(item.quantity)) || 1);
                    const itemAmount = Number((item.product.numericPrice * itemQty).toFixed(2));
                    const partyIdNum = Number(item.selectedPartyId);

                    const itemPayload: any = {
                        quantity: itemQty,
                        address: itemDest,
                        status: "pending",
                        product: { id: Number(item.product.id) || 1 },
                        payment: { cardNumber: cleanCard, cardType: cleanType, amount: itemAmount, status: "completed" },
                    };

                    if (item.sourcingChoice === "supplier") itemPayload.supplier = { id: (partyIdNum > 0 && !isNaN(partyIdNum)) ? partyIdNum : defaultSupplierId };
                    else itemPayload.dealer = { id: (partyIdNum > 0 && !isNaN(partyIdNum)) ? partyIdNum : defaultDealerId };

                    try {
                        const itemRes = await axios.post(`http://localhost:8000/customer/${user.id}/orders`, itemPayload, { withCredentials: true, validateStatus: (status) => status < 500 });
                        if (itemRes.status === 200 || itemRes.status === 201) {
                            createdIds.push(itemRes.data?.id || `ORD-${Date.now()}`);
                        }
                    } catch (err) {
                        console.warn("Sub-order create error:", err);
                    }
                }

                if (createdIds.length > 0) {
                    handleClearCart();
                    setTimeout(() => {
                        setSandboxStep("success");
                        fetchOrders(user.id, user.title);
                    }, 1000);
                } else {
                    setSandboxStep("declined");
                }
                return;
            }

            const orderPayload: any = {
                quantity: orderQuantity,
                address: destination,
                status: "pending",
                product: { id: checkoutProduct.id },
                payment: { cardNumber: cleanCard, cardType: cleanType, amount: totalAmount, status: "completed" },
            };
            if (sourcingChoice === "supplier") orderPayload.supplier = { id: Number(selectedPartyId) || 1 };
            else orderPayload.dealer = { id: Number(selectedPartyId) || 1 };

            const orderRes = await axios.post(`http://localhost:8000/customer/${user.id}/orders`, orderPayload, { withCredentials: true, validateStatus: (status) => status < 500 });
            if (orderRes.status === 200 || orderRes.status === 201) {
                setCreatedOrderId(orderRes.data?.id || null);
                setTimeout(() => {
                    setSandboxStep("success");
                    fetchOrders(user.id, user.title);
                }, 1000);
            } else {
                setSandboxStep("declined");
            }
        } catch (err) {
            console.warn("Payment authorization failed:", err);
            setSandboxStep("declined");
        }
    };

    const handleFinishSandboxPayment = () => {
        setIsSandboxModalOpen(false);
        setIsMultiCheckout(false);
        setIsCartModalOpen(false);
        setCheckoutProduct(null);
        if (user && user.id) fetchOrders(user.id, user.title);
        setActiveTab("orders");
        if (createdOrderId) handleTrackOrder(createdOrderId);
    };

    const handleTrackOrder = (orderId: number, targetOrder?: Order) => {
        setTrackedOrderId(orderId);
        const matchedOrder: Order = targetOrder || orders.find((o) => o.id === orderId) || {
            id: orderId,
            quantity: 1,
            status: "In Transit",
            deliveryAddress: user?.address || "Customer Terminal Facility",
            product: { id: 1, name: "Petroleum Fuel" },
        };
        setUberTrackingOrder(matchedOrder);
        setIsUberMapOpen(true);
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!user || !user.id) return;
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await axios.delete(`http://localhost:8000/customer/${user.id}/orders/${orderId}`, { withCredentials: true, validateStatus: (status) => status < 500 });
            if (res.status === 200 || res.status === 204) {
                alert("Order cancelled successfully.");
                fetchOrders(user.id, user.title);
            }
        } catch (err) {
            alert("Failed to cancel order.");
        }
    };

    const handleUpdateOrderStatus = async (orderId: number, status: string) => {
        if (!user) return;
        const r = getRolePath(user.title);
        try {
            const res = await axios.put(`http://localhost:8000/${r}/confirmorder/${orderId}`, { status: status.toLowerCase() }, { withCredentials: true, validateStatus: (status) => status < 500 });
            if (res.status === 200 || res.status === 204) {
                alert(`Order marked as ${status} successfully!`);
                fetchOrders(user.id || 1, user.title);
            }
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const handleAdminCreateUser = async (newUser: any) => {
        setIsCreatingUser(true);
        try {
            const res = await axios.post(`http://localhost:8000/admin/${newUser.role.toLowerCase()}`, {
                userName: newUser.name,
                email: newUser.email,
                password: newUser.password,
                phoneNumber: newUser.phone,
                address: newUser.address,
                title: newUser.role,
            }, { withCredentials: true, validateStatus: (status) => status < 500 });
            if (res.status === 200 || res.status === 201) {
                alert(`User ${newUser.name} created!`);
                fetchAllMergedUsers();
            }
        } catch (err) {
            alert("Failed to create user.");
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleAdminDeleteUser = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:8000/admin/customer/${id}`, { withCredentials: true, validateStatus: (status) => status < 500 });
            fetchAllMergedUsers();
        } catch (err) {
            alert("Failed to delete user.");
        }
    };

    const handleUpdateProfile = async (updated: Partial<UserData>) => {
        if (!user) return;
        const r = getRolePath(user.title || user.role);
        try {
            if (user.id) {
                await axios.patch(
                    `http://localhost:8000/${r}/${user.id}`,
                    {
                        userName: updated.userName || user.userName,
                        phoneNumber: updated.phoneNumber || user.phoneNumber,
                        address: updated.address || user.address,
                    },
                    { withCredentials: true, validateStatus: (status) => status < 500 }
                );
            }
            const mergedUser: UserData = { ...user, ...updated };
            setUser(mergedUser);
            localStorage.setItem("user", JSON.stringify(mergedUser));
            if (user.email) fetchFullProfile(user.email, user.title);
        } catch (err) {
            console.warn("Failed to persist profile to backend:", err);
            const mergedUser: UserData = { ...user, ...updated };
            setUser(mergedUser);
            localStorage.setItem("user", JSON.stringify(mergedUser));
        }
    };

    const handleDeleteOwnAccount = async () => {
        if (!user) return;
        if (!window.confirm(`Are you sure you want to permanently delete your ${user.title || user.role || "user"} account?`)) return;
        const r = getRolePath(user.title || user.role);
        try {
            let url = `http://localhost:8000/customer/${user.userName}`;
            if (r === "supplier" || r === "dealer" || r === "admin") {
                url = `http://localhost:8000/${r}/${user.id || 1}`;
            }
            await axios.delete(url, { withCredentials: true, validateStatus: (status) => status < 500 });
            localStorage.removeItem("user");
            alert("Account deleted successfully.");
            router.push("/login");
        } catch (err) {
            alert("Failed to delete account.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
                <p className="font-bold text-lg text-[#0F2747] animate-pulse">Loading System Dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] p-4 text-center">
                <h2 className="text-[#DC2626] text-xl font-bold mb-4">Access Denied</h2>
                <button onClick={() => router.push("/login")} className="btn btn-primary font-bold rounded-xl px-6">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#1E293B] flex flex-col">
            <MyHeader name="Dashboard" message="Oil Supply & Delivery Operations Portal" />
            <MyNavigation />

            {}
            <div className="flex-1 flex flex-col items-center p-4 sm:p-6 w-full">
                {}
                <div className="w-full max-w-[1200px] card bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl p-6 mb-8 text-left">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
                        <div className="flex items-center gap-4">
                            {user.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt="User photo"
                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E2E8F0] shadow-md"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-[#0F2747] text-white flex items-center justify-center font-black text-2xl shadow-md">
                                    {(user.userName || user.name || user.email || "U")[0].toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-extrabold text-[#0F2747]">
                                        {user.userName || user.name}
                                    </h2>
                                    <span className={`badge border-none font-bold text-xs px-3 py-1 ${getRoleBadgeColor(user.title || user.role || "")}`}>
                                        {user.title || user.role || "User"}
                                    </span>
                                </div>
                                <p className="text-xs text-secondary-gray mt-0.5">
                                    {user.email} • {user.address || "Main Operational Hub"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
                            {user.role === "Customer" && (
                                <button
                                    type="button"
                                    onClick={() => setIsCartModalOpen(true)}
                                    className="btn btn-accent btn-sm rounded-xl font-bold flex items-center gap-2"
                                >
                                    <span> Delivery Cart</span>
                                    {cartTotalItems > 0 && (
                                        <span className="badge badge-sm bg-[#0F2747] text-white border-none font-bold">
                                            {cartTotalItems}
                                        </span>
                                    )}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn btn-ghost btn-sm text-[#DC2626] hover:bg-rose-50 rounded-xl font-bold"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {}
                    <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`btn btn-sm rounded-xl font-bold transition-all ${
                                activeTab === "overview"
                                    ? "btn-primary shadow-sm"
                                    : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                            }`}
                        >
                             Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("products")}
                            className={`btn btn-sm rounded-xl font-bold transition-all ${
                                activeTab === "products"
                                    ? "btn-primary shadow-sm"
                                    : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                            }`}
                        >
                             Products ({products.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("orders")}
                            className={`btn btn-sm rounded-xl font-bold transition-all ${
                                activeTab === "orders"
                                    ? "btn-primary shadow-sm"
                                    : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                            }`}
                        >
                             Orders ({orders.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("tracking")}
                            className={`btn btn-sm rounded-xl font-bold transition-all ${
                                activeTab === "tracking"
                                    ? "btn-primary shadow-sm"
                                    : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                            }`}
                        >
                            ️ Live Tracking
                        </button>
                        {(user.role === "Dealer" || user.title === "Dealer" || user.role === "Supplier" || user.title === "Supplier") && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("inventory")}
                                className={`btn btn-sm rounded-xl font-bold transition-all ${
                                    activeTab === "inventory"
                                        ? "btn-primary shadow-sm"
                                        : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                                }`}
                            >
                                 Stock Reserve
                            </button>
                        )}
                        {(user.role === "Admin" || user.title === "Admin") && (
                            <button
                                type="button"
                                onClick={() => setActiveTab("admin-monitoring")}
                                className={`btn btn-sm rounded-xl font-bold transition-all ${
                                    activeTab === "admin-monitoring"
                                        ? "btn-primary shadow-sm"
                                        : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                                }`}
                            >
                                ️ Admin Monitoring
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setActiveTab("chat")}
                            className={`btn btn-sm rounded-xl font-bold transition-all ${
                                activeTab === "chat"
                                    ? "btn-primary shadow-sm"
                                    : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                            }`}
                        >
                             Realtime Chat
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className={`btn btn-sm rounded-xl font-bold transition-all ${
                                activeTab === "profile"
                                    ? "btn-primary shadow-sm"
                                    : "btn-ghost text-secondary-gray hover:text-[#0F2747]"
                            }`}
                        >
                             Profile
                        </button>
                    </div>
                </div>

                {}
                <div className="w-full max-w-[1200px] mb-12">
                    {activeTab === "overview" && (
                        <OverviewTab
                            userData={user}
                            orders={orders}
                            products={products}
                            setActiveTab={setActiveTab}
                            onOpenCart={() => setIsCartModalOpen(true)}
                            onOpenLiveTrack={(ord) => handleTrackOrder(ord.id, ord)}
                        />
                    )}

                    {activeTab === "products" && (
                        <ProductsTab
                            products={products}
                            userData={user}
                            loadingProducts={productsLoading}
                            onAddToCart={handleAddToCart}
                            onInstantOrder={handleOpenCheckout}
                            onWholesaleOrder={(prod) => {
                                setWholesaleProduct(prod);
                                setWholesaleQuantity("50");
                            }}
                            onOpenPostProductModal={() => setIsPostProductModalOpen(true)}
                        />
                    )}

                    {activeTab === "orders" && (
                        <OrdersTab
                            orders={orders}
                            userData={user}
                            loadingOrders={false}
                            onOpenLiveTrack={(ord) => handleTrackOrder(ord.id, ord)}
                            onCancelOrder={handleCancelOrder}
                            onUpdateOrderStatus={handleUpdateOrderStatus}
                        />
                    )}

                    {activeTab === "tracking" && (
                        <TrackingTab
                            selectedTrackingOrder={uberTrackingOrder || orders[0] || null}
                            orders={orders}
                            onSelectOrder={(ord) => setUberTrackingOrder(ord)}
                            userRole={user.title || user.role}
                            onClose={() => {
                                setIsUberMapOpen(false);
                                setUberTrackingOrder(null);
                                setActiveTab("orders");
                            }}
                        />
                    )}

                    {activeTab === "inventory" && (
                        <InventoryTab
                            products={products}
                            userData={user}
                            onWholesaleOrder={(prod) => {
                                setWholesaleProduct(prod);
                                setWholesaleQuantity("50");
                            }}
                            onOpenPostProductModal={() => setIsPostProductModalOpen(true)}
                        />
                    )}

                    {activeTab === "admin-monitoring" && (
                        <AdminMonitoringTab
                            users={allMergedUsers}
                            loadingUsers={false}
                            onEditUser={(u) => {
                                setEditingUser(u);
                                setEditUserForm({ name: u.name || u.userName || "", email: u.email, role: u.role || "Customer", phone: u.phone || "", address: u.address || "" });
                            }}
                            onDeleteUser={handleAdminDeleteUser}
                            onCreateUser={handleAdminCreateUser}
                            creatingUser={isCreatingUser}
                        />
                    )}

                    {activeTab === "chat" && <LiveChatTab userData={user} />}

                    {activeTab === "profile" && (
                        <ProfileTab
                            userData={user}
                            onUpdateProfile={handleUpdateProfile}
                            onDeleteAccount={handleDeleteOwnAccount}
                        />
                    )}
                </div>
            </div>

            {}
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

            <SandboxGatewayModal
                isOpen={isSandboxModalOpen}
                onClose={() => setIsSandboxModalOpen(false)}
                sandboxStep={sandboxStep}
                setSandboxStep={setSandboxStep}
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

            <WholesaleOrderModal
                isOpen={Boolean(wholesaleProduct)}
                onClose={() => setWholesaleProduct(null)}
                product={wholesaleProduct}
                wholesaleQuantity={wholesaleQuantity}
                setWholesaleQuantity={setWholesaleQuantity}
                wholesaleAddress={wholesaleAddress}
                setWholesaleAddress={setWholesaleAddress}
                wholesaleNotes={wholesaleNotes}
                setWholesaleNotes={setWholesaleNotes}
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Wholesale order submitted to refinery partner!");
                    setWholesaleProduct(null);
                }}
                orderingWholesale={orderingWholesale}
            />

            <PostProductModal
                isOpen={isPostProductModalOpen}
                onClose={() => setIsPostProductModalOpen(false)}
                newProduct={newProductForm}
                setNewProduct={setNewProductForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Product published successfully!");
                    setIsPostProductModalOpen(false);
                    fetchCatalogProducts();
                }}
                submitting={isSubmittingNewProduct}
            />

            <EditProductModal
                isOpen={Boolean(editingProduct)}
                onClose={() => setEditingProduct(null)}
                product={editingProduct}
                editProductForm={editProductForm}
                setEditProductForm={setEditProductForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Product updated!");
                    setEditingProduct(null);
                }}
                submitting={isSubmittingEditProduct}
            />

            <EditUserModal
                isOpen={Boolean(editingUser)}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                editUserForm={editUserForm}
                setEditUserForm={setEditUserForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("User updated!");
                    setEditingUser(null);
                }}
                submitting={isEditingUserSubmitting}
            />

            <EditOrderModal
                isOpen={Boolean(editingOrder)}
                onClose={() => setEditingOrder(null)}
                order={editingOrder}
                editOrderForm={editOrderForm}
                setEditOrderForm={setEditOrderForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Order updated!");
                    setEditingOrder(null);
                }}
                submitting={isEditingOrderSubmitting}
            />

            {isUberMapOpen && uberTrackingOrder && (
                <UberMapTracker
                    order={uberTrackingOrder as any}
                    userRole={user?.title || user?.role || "customer"}
                    onClose={() => {
                        setIsUberMapOpen(false);
                        setUberTrackingOrder(null);
                    }}
                />
            )}
        </div>
    );
}
