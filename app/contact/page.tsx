import Link from "next/link";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

export default function ContactInfo() {
    return (
        <>
            <MyHeader name="Contact Us" message="Feel free to reach out to us!" />
            <MyNavigation />

            <h1>Contact Us</h1>
            <p>The contact information goes here.</p>
        </>
    );
}