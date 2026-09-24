const normalizeBaseUrl = (value?: string) => {
    const rawValue = value?.trim();
    if (!rawValue) return "http://localhost:8000";
    return rawValue.replace(/\/+$/, "");
};

export const API_ENDPOINT = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_ENDPOINT);

export const APP_URL = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"
);

export const isProductionEnv = process.env.NODE_ENV === "production";

export const getApiUrl = (path: string) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_ENDPOINT}${cleanPath}`;
};