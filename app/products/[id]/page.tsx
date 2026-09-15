import { connection } from "next/server";
import ProductDetailsClient from "./ProductDetailsClient";

type Product = {
    id: number;
    name: string;
    category?: string;
    price?: string | number;
    description?: string;
    stockLevel?: string;
    image?: string;
};

function normalizeProduct(product: any): Product {
    const quantity = typeof product.quantity === "number" ? product.quantity : undefined;

    return {
        id: product.id,
        name: product.name || `Product #${product.id}`,
        category: product.category || product.categories?.[0]?.name || "Petroleum Grade",
        price: typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price || "$0.00",
        description: (product.description || product.productDescription || product.product_description || product.details || "").trim(),
        stockLevel: quantity !== undefined
            ? quantity <= 0
                ? "Out of Stock"
                : quantity < 1000
                    ? "Low Stock"
                    : "In Stock"
            : product.stockLevel || "In Stock",
        image: product.image || product.photo || product.photoUrl || product.imageUrl,
    };
}

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await connection();

    const { id } = await params;
    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";
    let product: Product | null = null;

    try {
        const response = await fetch(`${API_ENDPOINT}/product/list`, {
            cache: "no-store",
        });

        if (response.ok) {
            const responseData = await response.json();
            const products = Array.isArray(responseData)
                ? responseData
                : responseData?.products || responseData?.data || responseData?.items || [];
            const match = products.find((item: any) => String(item.id) === id);

            if (match) {
                product = normalizeProduct(match);
            }
        }
    } catch (error) {
        console.warn("Error fetching product details on the server:", error);
    }

    return <ProductDetailsClient product={product} productId={id} />;
}
