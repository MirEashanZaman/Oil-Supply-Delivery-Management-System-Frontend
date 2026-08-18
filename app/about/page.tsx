import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

export default function AboutUs() {
    return (
        <>
            <MyHeader name="About Us" message="Learn more about our company!" />
            <MyNavigation />

            <h1>About Us</h1>
            <p>Welcome to our company!</p>
        </>
    );
}