import Link from "next/link";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

export default function NotFound() {
    return (
        <>
            <MyHeader name="404" message="page not found!" />
            <MyNavigation />

            <div className="mt-10 w-full max-w-[500px] bg-card-white p-8 rounded-lg border border-red-200 shadow-md text-center">
                <h1 className="text-error-red text-6xl font-extrabold mb-4">404</h1>
                <h2 className="text-dark-slate text-2xl font-bold mb-4">Oops! Page Not Found</h2>
                <p className="text-secondary-gray mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="bg-primary text-white no-underline py-2.5 px-6 rounded font-semibold text-[15px] hover:bg-primary/95 transition-colors inline-block"
                >
                    Back to Home
                </Link>
            </div>
        </>
    );
}
