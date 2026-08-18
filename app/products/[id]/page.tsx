import Link from "next/link";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

export default async function ProductDetails({
    params,
}: {
    params: { id: string };
}) {
    const productID = await params;
    return (
        <>
            <MyHeader
                name="Product"
                message={`Details for Product ${productID.id}`}
            />
            <MyNavigation />

            <h1>Product Details</h1>
            <p>Product ID: {productID.id}</p>
        </>
    );
}