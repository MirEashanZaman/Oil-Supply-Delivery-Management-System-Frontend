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

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "inventory" | "users_crud" | "monitoring" | "profile" | "directory">("products");
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    // Orders tab states
    const [orders, setOrders] = useState<Order[]>([]);
    const [trackedOrderStatus, setTrackedOrderStatus] = useState<string | null>(null);
    const [trackedOrderId, setTrackedOrderId] = useState<number | null>(null);
    const [deliveryDates, setDeliveryDates] = useState<{ [orderId: number]: string }>({});

    // Dealer/Supplier Inventory states
    const [customInventory, setCustomInventory] = useState<Product[]>([]);
    const [supplierOperationalStatus, setSupplierOperationalStatus] = useState<string>("active");

    // Admin System Monitoring & Merged Users States
    const [monitorMetrics, setMonitorMetrics] = useState<any>(null);
    const [allMergedUsers, setAllMergedUsers] = useState<SystemUser[]>([]);
    const [selectedJoiningDate, setSelectedJoiningDate] = useState<string>("");
    const [dateSearchResults, setDateSearchResults] = useState<SystemUser[]>([]);

    // Admin Create User Modal States
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [newRole, setNewRole] = useState<"customer" | "dealer" | "supplier">("customer");
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserPhone, setNewUserPhone] = useState("");
    const [newUserAddress, setNewUserAddress] = useState("");

    // Admin Edit User Modal States
    const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
    const [editTargetUserName, setEditTargetUserName] = useState("");
    const [editTargetPhone, setEditTargetPhone] = useState("");
    const [editTargetAddress, setEditTargetAddress] = useState("");

    // Admin Edit Order Modal States
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editOrderStatus, setEditOrderStatus] = useState("");
    const [editOrderQuantity, setEditOrderQuantity] = useState(1);
    const [editOrderAddress, setEditOrderAddress] = useState("");

    // Sourcing lists (Suppliers & Dealers)
    const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
    const [availableDealers, setAvailableDealers] = useState<any[]>([]);

    // Customer Interactive Checkout Modal States
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

    // Dealer Wholesale Bulk Sourcing Modal States
    const [wholesaleProduct, setWholesaleProduct] = useState<Product | null>(null);
    const [wholesaleSupplierId, setWholesaleSupplierId] = useState<number | "">("");
    const [wholesaleQuantity, setWholesaleQuantity] = useState<number>(50);
    const [isSubmittingWholesale, setIsSubmittingWholesale] = useState<boolean>(false);

    // Supplier / Dealer / Admin "Post / Upload New Product" Modal States
    const [isPostProductModalOpen, setIsPostProductModalOpen] = useState<boolean>(false);
    const [newProductName, setNewProductName] = useState<string>("");
    const [newProductCategory, setNewProductCategory] = useState<string>("Crude Fuel");
    const [newProductPrice, setNewProductPrice] = useState<number | "">("");
    const [newProductQuantity, setNewProductQuantity] = useState<number | "">("");
    const [newProductDescription, setNewProductDescription] = useState<string>("");
    const [newProductImage, setNewProductImage] = useState<string>("/Brent Crude Oil.jpg");
    const [isSubmittingNewProduct, setIsSubmittingNewProduct] = useState<boolean>(false);

    // Profile settings tab states
    const [editUsername, setEditUsername] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [profileStatus, setProfileStatus] = useState("");
    const [dbLookupStatus, setDbLookupStatus] = useState("");

    // Directory tab states
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

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

    // Load initial user details
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

    // Axios Call: Fetch catalog products from backend (`GET /product/list`)
    const fetchCatalogProducts = async () => {
        setProductsLoading(true);
        const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
        try {
            const res = await axios.get(`${API_ENDPOINT}/product/list`, {
                withCredentials: true,
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
                        image: getProductImage(p.name, p.image),
                    }));
                setProducts(mapped);
            }
        } catch (err) {
            console.warn("Failed to fetch catalog products from backend:", err);
        } finally {
            setProductsLoading(false);
        }
    };

    // Axios Call: Fetch available suppliers and dealers
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

    // Axios Call: Get full profile
    const fetchFullProfile = async (email: string, title?: string) => {
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

    // Axios Call (Admin): Monitor System Health Metrics (`GET /admin/monitor-data`)
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

    // Axios Call (Admin): Merged User Directory (`GET /admin/getallusers`)
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

    // Axios Call (Admin): Multi-Table Date Search (`GET /admin/joiningdate?date=...`)
    const handleSearchJoiningDate = async () => {
        if (!selectedJoiningDate) {
            alert("Please select a date to search.");
            return;
        }
        try {
            const res = await axios.get(`http://localhost:8000/admin/joiningdate?date=${selectedJoiningDate}`, {
                withCredentials: true,
            });
            setDateSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Date search error:", err);
            setDateSearchResults([]);
        }
    };

    // Axios Call (Admin): Create User (`POST /admin/:role`)
    const handleAdminCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(
                `http://localhost:8000/admin/${newRole}`,
                {
                    userName: newUserName,
                    email: newUserEmail,
                    password: newUserPassword || "password123",
                    phoneNumber: newUserPhone,
                    address: newUserAddress,
                    title: newRole.charAt(0).toUpperCase() + newRole.slice(1),
                },
                { withCredentials: true }
            );
            alert(`New ${newRole.toUpperCase()} user created successfully!`);
            setIsCreateUserModalOpen(false);
            setNewUserName("");
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserPhone("");
            setNewUserAddress("");
            fetchAllMergedUsers();
            fetchAdminMonitoringData();
        } catch (err: any) {
            console.error("Create user failed:", err);
            alert(err.response?.data?.message || "Failed to create user.");
        }
    };

    // Axios Call (Admin): Update User (`PATCH /admin/:role/:id`)
    const handleAdminUpdateUser = async () => {
        if (!editingUser) return;
        const role = (editingUser.title || editingUser.role || "customer").toLowerCase();

        // Security Constraint Check
        if (role === "admin") {
            alert("Security Constraint: Admins cannot modify other Admins.");
            return;
        }

        try {
            await axios.patch(
                `http://localhost:8000/admin/${role}/${editingUser.id}`,
                {
                    userName: editTargetUserName,
                    phoneNumber: editTargetPhone,
                    address: editTargetAddress,
                },
                { withCredentials: true }
            );
            alert("User updated successfully by Admin!");
            setEditingUser(null);
            fetchAllMergedUsers();
        } catch (err: any) {
            console.error("Update user failed:", err);
            alert(err.response?.data?.message || "Failed to update user.");
        }
    };

    // Axios Call (Admin): Delete User (`DELETE /admin/:role/:id`)
    const handleAdminDeleteUser = async (targetUser: SystemUser) => {
        const role = (targetUser.title || targetUser.role || "customer").toLowerCase();

        // Security Constraint Check
        if (role === "admin") {
            alert("Security Constraint: Admins cannot delete other Admins.");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${targetUser.userName || targetUser.email} (${role.toUpperCase()})? This will cascade-delete all linked records.`
        );
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8000/admin/${role}/${targetUser.id}`, {
                withCredentials: true,
            });
            alert("User and linked records successfully purged by Admin.");
            fetchAllMergedUsers();
            fetchAdminMonitoringData();
            if (user?.id) fetchOrders(user.id, user.title);
        } catch (err: any) {
            console.error("Delete user failed:", err);
            alert(err.response?.data?.message || "Failed to delete user.");
        }
    };

    // Axios Call (Admin): Global Order Update (`PATCH /admin/order/:id`)
    const handleAdminUpdateOrder = async () => {
        if (!editingOrder) return;
        try {
            await axios.patch(
                `http://localhost:8000/admin/order/${editingOrder.id}`,
                {
                    status: editOrderStatus,
                    quantity: editOrderQuantity,
                    address: editOrderAddress,
                },
                { withCredentials: true }
            );
            alert(`Order #${editingOrder.id} successfully updated by Admin!`);
            setEditingOrder(null);
            if (user?.id) fetchOrders(user.id, user.title);
            fetchAdminMonitoringData();
        } catch (err: any) {
            console.error("Update order failed:", err);
            alert(err.response?.data?.message || "Failed to update order.");
        }
    };

    // Axios Call (Admin): Global Order Deletion (`DELETE /admin/order/:id`)
    const handleAdminDeleteOrder = async (orderId: number) => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete Order #${orderId}? Associated OrderDetails, Payment, and Delivery records will be purged.`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8000/admin/order/${orderId}`, {
                withCredentials: true,
            });
            alert(`Order #${orderId} and associated records purged successfully.`);
            if (user?.id) fetchOrders(user.id, user.title);
            fetchAdminMonitoringData();
        } catch (err: any) {
            console.error("Delete order failed:", err);
            alert(err.response?.data?.message || "Failed to delete order.");
        }
    };

    // Axios Call: Inventory (`GET /:role/:id/products`)
    const fetchCustomInventory = async (partyId: number, title?: string) => {
        const r = getRolePath(title);
        try {
            const res = await axios.get(`http://localhost:8000/${r}/${partyId}/products`, {
                withCredentials: true,
                validateStatus: (status) => status < 500,
            });
            if (res.status === 200 && Array.isArray(res.data)) {
                setCustomInventory(res.data);
            }
        } catch (err) {
            console.warn("Failed to fetch inventory:", err);
        }
    };

    // Axios Call: Assign Product (`POST /:role/:id/products`)
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

    // Axios Call: Remove Product (`DELETE /:role/:id/products/:productId`)
    const handleRemoveProductFromStock = async (productId: number) => {
        if (!user || !user.id) return;
        const confirmRemove = window.confirm(`Are you sure you want to remove this product?`);
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

    // Axios Call: Post / Create New Product Listing (`POST /product/create` + `POST /:role/:id/products`)
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
            // 1. Create product in backend database
            const createRes = await axios.post(
                `${API_ENDPOINT}/product/create`,
                {
                    name: newProductName.trim(),
                    price: Number(newProductPrice),
                    quantity: Number(newProductQuantity),
                },
                { withCredentials: true }
            );

            const createdProduct = createRes.data;

            // 2. If Dealer or Supplier, assign to their stock/portfolio
            if (user && user.id && (isDealer || isSupplier)) {
                const role = getRolePath(user.title);
                try {
                    await axios.post(
                        `${API_ENDPOINT}/${role}/${user.id}/products`,
                        { productIds: [createdProduct.id] },
                        { withCredentials: true }
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

            // 3. Refresh live catalog & user's inventory
            fetchCatalogProducts();
            if (user && user.id && (isDealer || isSupplier)) {
                fetchCustomInventory(user.id, user.title);
            }
        } catch (err: any) {
            console.error("Failed to post product:", err);
            alert(err.response?.data?.message || "Failed to publish product.");
        } finally {
            setIsSubmittingNewProduct(false);
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
        const supplierId = wholesaleSupplierId || (availableSuppliers.length > 0 ? availableSuppliers[0].id : null);
        if (!supplierId) {
            alert("No refinery suppliers are currently available to fulfill this wholesale order.");
            return;
        }

        setIsSubmittingWholesale(true);
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

    // Axios Call: Fetch all orders
    const fetchOrders = async (id: number, title?: string) => {
        const r = getRolePath(title);
        if (r === "customer") {
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

    // Customer Checkout Modal
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

    // Submit Customer Order
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
                            text: `Dear Customer,\n\nYour order #${orderId} has been marked as '${status}'.\n\nThank you!`,
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

    // Axios Call: Schedule Delivery (`POST /:role/scheduledelivery`)
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
                            text: `Dear Customer,\n\nYour order #${orderId} has been scheduled for delivery on ${date}.\n\nThank you!`,
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
        setTrackedOrderStatus("Connecting to delivery tracker...");
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

    // Axios Call: Delete Own Account
    const handleDeleteAccount = async () => {
        if (!user) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete your ${user.title} account?`);
        if (!confirmDelete) return;

        const r = getRolePath(user.title);
        try {
            let url = `http://localhost:8000/customer/${user.userName}`;
            if (r === "supplier" || r === "dealer" || r === "admin") {
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

    // Axios Call: Search users in directory
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
            <MyHeader name="Dashboard" message="Enterprise operations control and resource distribution center" />
            <MyNavigation />

            {/* Profile Overview & Navigation Bar */}
            <div className="w-full max-w-[1200px] card bg-base-100 border border-base-300 shadow-xl rounded-2xl p-6 mb-8 text-left">
                {/* Top Section: User Info & Logout Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-base-300">
                    <div className="flex items-center gap-4">
                        {user.photoUrl ? (
                            <img
                                src={user.photoUrl}
                                alt="Profile"
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-md"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md">
                                {(user.userName || user.email)[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Welcome, {user.userName || user.email}
                                </h2>
                                <span className="badge badge-primary font-bold uppercase text-xs text-white">
                                    Role: {user.title || "User"}
                                </span>
                                {isSupplier && (
                                    <span className={`badge font-bold uppercase text-xs text-white ${
                                        supplierOperationalStatus === "active" ? "badge-success" : "badge-error"
                                    }`}>
                                        Status: {supplierOperationalStatus}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                                <span>Email: <strong className="text-slate-800">{user.email}</strong></span>
                                <span>Hub: <strong className="text-slate-800">{user.address || "Main Operational HQ"}</strong></span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn btn-error btn-sm text-white font-semibold shadow-md flex items-center gap-1.5 self-start sm:self-center shrink-0"
                    >
                        <span>Sign Out</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {/* Bottom Section: Dedicated Full-Width Navigation Tabs */}
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
                </div>
            </div>

            {/* TAB: ADMIN SYSTEM HEALTH & MONITORING */}
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

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                        <div className="bg-card-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm">
                            <span className="text-xs font-bold text-secondary-gray uppercase">Total Registered Users</span>
                            <h3 className="text-3xl font-extrabold text-primary mt-1">
                                {allMergedUsers.length || monitorMetrics?.totalUsers || 0}
                            </h3>
                            <p className="text-xs text-green-600 font-semibold mt-1">✓ Across 4 Database Tables</p>
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
                            <p className="text-xs text-green-600 font-semibold mt-1">✓ Operational & Connected</p>
                        </div>
                    </div>

                    {/* Multi-Table Date Search */}
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

            {/* TAB: ADMIN GLOBAL USER CRUD */}
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

                    {/* Merged Directory Table */}
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
                                            <td className="p-4 text-secondary-gray">{u.phoneNumber || "—"}</td>
                                            <td className="p-4 text-secondary-gray">{u.address || "—"}</td>
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

            {/* TAB 1: PRODUCT CATALOG & BULK SOURCING */}
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
                                className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto"
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
                            <span className="loading loading-spinner loading-lg text-primary mb-3"></span>
                            <p className="text-sm text-secondary-gray">Loading live petroleum catalog...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm max-w-xl mx-auto">
                            <p className="text-secondary-gray font-medium mb-1">No products currently available in the catalog.</p>
                            <p className="text-xs text-secondary-gray">New petroleum grades will appear here as soon as they are added.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="card bg-base-100 w-96 max-w-full shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow"
                                >
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
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${product.stockLevel === "In Stock" ? "bg-green-100 text-success-green" : "bg-amber-100 text-secondary"
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
                                                        ✓ Admin Linked Catalog
                                                    </span>
                                                ) : isSupplier ? (
                                                    customInventory.some((item) => item.id === product.id) ? (
                                                        <span className="text-xs bg-green-50 text-success-green font-bold px-3 py-1.5 rounded border border-green-200">
                                                            ✓ In Your Portfolio
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
                                                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                                        >
                                                            + Assign Stock
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setWholesaleProduct(product);
                                                                setWholesaleQuantity(50);
                                                                if (availableSuppliers.length > 0) setWholesaleSupplierId(availableSuppliers[0].id);
                                                            }}
                                                            className="btn btn-primary btn-sm text-white"
                                                        >
                                                            Bulk Source
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenCheckout(product)}
                                                        className="btn btn-primary"
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

            {/* TAB: STOCK INVENTORY / SUPPLY PORTFOLIO */}
            {(isDealer || isSupplier) && activeTab === "inventory" && (
                <div className="w-full max-w-[1200px] text-left animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
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
                        <button
                            onClick={() => setIsPostProductModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span> Post New Product</span>
                        </button>
                    </div>

                    {customInventory.length === 0 ? (
                        <div className="bg-card-white p-8 rounded-lg border border-[#E2E8F0] text-center shadow-sm">
                            <p className="text-secondary-gray mb-4">
                                {isSupplier
                                    ? "You have not published any products to your supply portfolio yet. As a Supplier, you can only post new petroleum products to distribute to dealers and customers."
                                    : "You have not linked or sourced any products for your stock inventory yet. As a Dealer, you can post new products or source directly from refinery suppliers."
                                }
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {isDealer && (
                                    <button
                                        onClick={() => setActiveTab("products")}
                                        className="border border-[#E2E8F0] text-dark-slate px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        Browse Catalog to Source
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsPostProductModalOpen(true)}
                                    className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
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
                                    className="card bg-base-100 w-96 max-w-full shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <figure className="h-48 w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={item.image || "/Brent Crude Oil.jpg"}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = "/Brent Crude Oil.jpg";
                                            }}
                                        />
                                    </figure>
                                    <div className="card-body p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                                    {isSupplier ? "Active Portfolio Item" : "Active Stock Item"}
                                                </span>
                                                <span className="text-xs text-secondary-gray">Product ID: #{item.id}</span>
                                            </div>
                                            <h2 className="card-title text-lg font-bold text-dark-slate mb-1">{item.name}</h2>
                                            <p className="text-sm text-secondary-gray">{item.description || "Petroleum Grade Oil Product"}</p>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                                            <span className="text-xs text-secondary-gray font-medium">Linked Record #{item.id}</span>
                                            <div className="card-actions justify-end">
                                                <button
                                                    onClick={() => handleRemoveProductFromStock(item.id)}
                                                    className="btn btn-sm bg-error-red hover:bg-error-red/90 text-white border-none"
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

            {/* TAB 2: ORDERS MANAGEMENT & FULFILLMENT */}
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

            {/* TAB 3: PROFILE SETTINGS */}
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

            {/* TAB 4: SYSTEM DIRECTORY (CUSTOMERS/DEALERS/SUPPLIERS) */}
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

            {/* ADMIN CREATE USER MODAL */}
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
                                className="text-gray-400 hover:text-dark-slate text-2xl font-bold p-1 cursor-pointer"
                            >
                                ×
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
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded bg-white text-dark-slate text-sm outline-none"
                                />
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

            {/* ADMIN EDIT USER MODAL */}
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
                                className="text-gray-400 hover:text-dark-slate text-2xl font-bold p-1 cursor-pointer"
                            >
                                ×
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

            {/* ADMIN EDIT ORDER MODAL */}
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
                                className="text-gray-400 hover:text-dark-slate text-2xl font-bold p-1 cursor-pointer"
                            >
                                ×
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
            {/* SUPPLIER / DEALER / ADMIN: POST & UPLOAD PRODUCT MODAL */}
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
                                className="text-gray-400 hover:text-dark-slate text-2xl font-bold p-1 cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        {/* Informative Role Banner */}
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

                            {/* Image Preview */}
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
                                    className="w-2/3 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors cursor-pointer shadow-md disabled:bg-primary/50 flex items-center justify-center gap-2"
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
