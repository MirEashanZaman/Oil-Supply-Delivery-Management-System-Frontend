export const PRODUCT_IMAGE_MAP: Record<number, string> = {
    1: "/Brent Crude Oil.jpg",
    2: "/Ultra-Low Sulfur Diesel.jpg",
    3: "/Premium Unleaded Gasoline.jpg",
    4: "/Aviation Turbine Fuel (Jet A-1).jpg",
    5: "/images.jpg",
    6: "/Heavy Marine Fuel Oil (HFO).jpg",
};

export const getProductImage = (name?: string, img?: string, id?: number | string): string => {
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

export const getRolePath = (title?: string): string => {
    const t = (title || "").toLowerCase();
    if (t.includes("admin")) return "admin";
    if (t.includes("supplier")) return "supplier";
    if (t.includes("dealer")) return "dealer";
    return "customer";
};

export const normalizeRole = (role?: string): string => {
    const path = getRolePath(role);
    return path.charAt(0).toUpperCase() + path.slice(1);
};

export const getAllUsersUrl = (title?: string): string => {
    const r = getRolePath(title);
    if (r === "admin") return "http://localhost:8000/admin/getalladmin";
    if (r === "supplier") return "http://localhost:8000/supplier/getallsupplier";
    if (r === "dealer") return "http://localhost:8000/dealer/all";
    return "http://localhost:8000/customer/getallcustomer";
};

export const getRoleBadgeColor = (role?: string): string => {
    const r = (role || "").toLowerCase();
    if (r.includes("admin")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (r.includes("supplier")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (r.includes("dealer")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
};

export const getStatusBadgeClass = (status?: string): string => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered") || s.includes("completed") || s.includes("active") || s.includes("paid")) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("confirmed") || s.includes("processing") || s.includes("transit")) {
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s.includes("rejected") || s.includes("cancelled") || s.includes("inactive")) {
        return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
};
