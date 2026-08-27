import Link from "next/link";
import MyHeader from "@/components/header";
import MyNavigation from "@/components/navigation";

export default function Home() {
	return (
		<>
			<MyHeader name="Home" message="Welcome to our home page!" />
			<MyNavigation />

			{/*
			<a href="/about">About Us</a>
			<a href="/contact">Contact Us</a>
			<a href="/products/1">Product 1</a>
			<a href="/products/2">Product 2</a>

			<Link href="/about">About Us</Link>
			<Link href="/contact">Contact Us</Link>
			<Link href="/products/1">Product 1</Link>
			 <Link href="/products/2">Product 2</Link> 
			 */}

			<h1>Welcome Eshu!</h1>
		</>
	);
}