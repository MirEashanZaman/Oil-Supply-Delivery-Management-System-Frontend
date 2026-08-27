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
            const response = await axios.post(
                "http://localhost:8000/customer/auth/signIn",
                {
                    email: result.data.email,
                    password: result.data.password,
                },
                {
                    withCredentials: true,
                }
            );

            localStorage.setItem("user", JSON.stringify(response.data.user || { email: result.data.email }));

            setSuccessMessage("Login successful! Redirecting to dashboard...");
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (error: any) {
            console.error("Login request error:", error);
            const apiMessage = error.response?.data?.message || "Invalid credentials or backend error.";
            setErrors({
                form: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage
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
                        className="bg-primary text-white border-none py-2.5 px-5 rounded cursor-pointer font-semibold text-[15px] w-full hover:bg-primary/90 disabled:bg-primary/50"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </>
    );
}
