"use client";

import { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginErrors = {
    email?: string;
    password?: string;
    form?: string;
};

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");

        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            const formattedErrors: LoginErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof LoginErrors;
                formattedErrors[path] = issue.message;
            });
            setErrors(formattedErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const signInEmail = result.data.email;
            const roles = ["admin", "customer", "dealer", "supplier"];
            let loginSuccess = false;
            let matchedRole = "Customer";
            let lastErrorMessage = "";
            let apiUserData: any = null;

            const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8000";

            // Automatically check against the 4 backend auth controllers
            for (const r of roles) {
                try {
                    const response = await axios.post(
                        `${API_ENDPOINT}/${r}/auth/signIn`,
                        {
                            email: result.data.email,
                            password: result.data.password,
                        },
                        {
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            withCredentials: true,
                            validateStatus: (status) => status < 500,
                        }
                    );
                    if ((response.status === 200 || response.status === 201) && response.data) {
                        loginSuccess = true;
                        matchedRole = r.charAt(0).toUpperCase() + r.slice(1);
                        apiUserData = response.data;
                        break;
                    } else if (response.status === 401) {
                        // NestJS throws UnauthorizedException with { message: "Unauthorized" } on invalid credentials
                        lastErrorMessage = "Invalid email or password. Please check your credentials or register a new account.";
                    } else if (response.status === 400 && response.data?.message) {
                        lastErrorMessage = Array.isArray(response.data.message)
                            ? response.data.message.join(", ")
                            : response.data.message;
                    }
                } catch (err: any) {
                    console.warn(`Sign-in check for ${r} error:`, err);
                }

                if (loginSuccess) break;
            }

            if (!loginSuccess) {
                const displayMsg = lastErrorMessage || "Invalid email or password. Please verify your credentials or register a new account.";
                setErrors({
                    form: Array.isArray(displayMsg) ? displayMsg.join(", ") : displayMsg,
                });
                return;
            }

            let userData: {
                id?: number;
                email: string;
                userName: string;
                title: string;
                phoneNumber?: string;
                address?: string;
                photoUrl?: string;
            } = {
                id: apiUserData?.id || apiUserData?.user?.id,
                email: apiUserData?.email || apiUserData?.user?.email || signInEmail,
                userName: apiUserData?.userName || apiUserData?.username || apiUserData?.user?.userName || signInEmail.split("@")[0],
                title: apiUserData?.title || apiUserData?.role || matchedRole,
                phoneNumber: apiUserData?.phoneNumber || apiUserData?.user?.phoneNumber,
                address: apiUserData?.address || apiUserData?.user?.address,
                photoUrl: apiUserData?.photoUrl || apiUserData?.photo,
            };

            // Fetch profile data if needed based on automatically detected role
            try {
                const rolePath = matchedRole.toLowerCase();
                let fetchUrl = `${API_ENDPOINT}/${rolePath}/getallcustomer`;
                if (rolePath === "supplier") {
                    fetchUrl = `${API_ENDPOINT}/supplier/getallsupplier`;
                } else if (rolePath === "dealer") {
                    fetchUrl = `${API_ENDPOINT}/dealer/all`;
                } else if (rolePath === "admin") {
                    fetchUrl = `${API_ENDPOINT}/admin/getallusers`;
                }

                const responseAll = await axios.get(fetchUrl, {
                    withCredentials: true,
                });

                if (Array.isArray(responseAll.data)) {
                    const matchedUser = responseAll.data.find(
                        (c: any) => c.email === signInEmail
                    );
                    if (matchedUser) {
                        userData = {
                            id: matchedUser.id || userData.id,
                            email: matchedUser.email,
                            userName: matchedUser.username || matchedUser.userName || userData.userName,
                            phoneNumber: matchedUser.phoneNumber || userData.phoneNumber,
                            address: matchedUser.address || userData.address,
                            title: matchedUser.title || matchedRole,
                            photoUrl: matchedUser.photoUrl || matchedUser.photo || userData.photoUrl,
                        };
                    }
                }
            } catch (fetchErr) {
                console.warn("Failed to fetch user profile details:", fetchErr);
            }

            localStorage.setItem("user", JSON.stringify(userData));

            setSuccessMessage("Login successful! Redirecting to dashboard...");
            setTimeout(() => {
                router.push("/dashboard");
            }, 1200);
        } catch (error: any) {
            console.error("Login request error:", error);
            const apiMessage = error.response?.data?.message || "Invalid credentials or backend connection error.";
            setErrors({
                form: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <MyHeader name="Login" message="access your account!" />
            <MyNavigation />

            <div className="mt-5 w-full max-w-[500px] bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-md text-left">
                <h1 className="mt-0 text-dark-slate mb-5 text-2xl font-bold">Login</h1>

                {successMessage && (
                    <p className="text-success-green font-bold mb-4">{successMessage}</p>
                )}

                {errors.form && (
                    <p className="text-error-red font-bold mb-4">{errors.form}</p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-1 font-medium text-dark-slate">
                            Email Address:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.email && (
                            <span className="text-error-red text-sm block mt-1">{errors.email}</span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-1 font-medium text-dark-slate">
                            Password:
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.password && (
                            <span className="text-error-red text-sm block mt-1">{errors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white border-none py-3 px-4 rounded text-base font-semibold cursor-pointer transition hover:bg-primary/95 shadow-sm disabled:bg-primary/50"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </>
    );
}
