import Link from "next/link";

export default function Navigation() {
    const linkStyle = {
        color: "#FFFFFF",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "15px",
    };

    const separatorStyle = {
        color: "#64748B",
    };

    return (
        <nav style={{ 
            backgroundColor: "#0F2747", 
            padding: "15px 20px", 
            borderRadius: "6px", 
            margin: "15px 0", 
            display: "flex", 
            gap: "10px", 
            alignItems: "center",
            flexWrap: "wrap"
        }}>
            <Link href="/" style={linkStyle}>Home</Link>
            <span style={separatorStyle}>|</span>
            <Link href="/about" style={linkStyle}>About Us</Link>
            <span style={separatorStyle}>|</span>
            <Link href="/contact" style={linkStyle}>Contact Us</Link>
            <span style={separatorStyle}>|</span>
            <Link href="/products/1" style={linkStyle}>Product 1</Link>
            <span style={separatorStyle}>|</span>
            <Link href="/products/2" style={linkStyle}>Product 2</Link>
            <span style={separatorStyle}>|</span>
            <Link href="/login" style={linkStyle}>Login</Link>
            <span style={separatorStyle}>|</span>
            <Link href="/registration" style={linkStyle}>Registration</Link>
        </nav>
    );
}