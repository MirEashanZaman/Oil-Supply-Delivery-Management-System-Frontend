import Link from "next/link";

export default function Navigation() {
    return (
        <nav style={{ margin: "10px 0" }}>
            <Link href="/">Home</Link> |{" "}
            <Link href="/about">About Us</Link> |{" "}
            <Link href="/contact">Contact Us</Link> |{" "}
            <Link href="/products/1">Product 1</Link> |{" "}
            <Link href="/products/2">Product 2</Link> |{" "}
            <Link href="/login">Login</Link> |{" "}
            <Link href="/register">Register</Link>
        </nav>
    );
}