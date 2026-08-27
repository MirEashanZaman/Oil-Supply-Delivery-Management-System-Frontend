import Link from "next/link";

export default function Navigation() {
    const linkClass = "text-white no-underline font-medium text-[15px] hover:text-secondary";
    const separatorClass = "text-secondary-gray";

    return (
        <nav className="bg-primary px-5 py-4 rounded my-4 flex gap-2.5 items-center flex-wrap">
            <Link href="/" className={linkClass}>Home</Link>
            <span className={separatorClass}>|</span>
            <Link href="/about" className={linkClass}>About Us</Link>
            <span className={separatorClass}>|</span>
            <Link href="/contact" className={linkClass}>Contact Us</Link>
            <span className={separatorClass}>|</span>
            <Link href="/products/1" className={linkClass}>Product 1</Link>
            <span className={separatorClass}>|</span>
            <Link href="/products/2" className={linkClass}>Product 2</Link>
            <span className={separatorClass}>|</span>
            <Link href="/login" className={linkClass}>Login</Link>
            <span className={separatorClass}>|</span>
            <Link href="/registration" className={linkClass}>Registration</Link>
            <span className={separatorClass}>|</span>
            <Link href="/dashboard" className={linkClass}>Dashboard</Link>
        </nav>
    );
}