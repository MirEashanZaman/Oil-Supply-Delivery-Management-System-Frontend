"use client";
import { useState } from "react";
import { z } from "zod";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

// Zod schema for login validation
const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginErrors = {
    email?: string;
    password?: string;
    form?: string;
};

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<LoginErrors>({});
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
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

        // Simulating successful login
        setSuccessMessage("Login successful!");
        console.log("Logged in data:", result.data);
    };

    return (
        <>
            <MyHeader name="Login" message="access your account!" />
            <MyNavigation />

            <div style={{ marginTop: "20px", maxWidth: "400px" }}>
                <h1>Login</h1>

                {successMessage && (
                    <p style={{ color: "green", fontWeight: "bold" }}>{successMessage}</p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
                            Email Address:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.email && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.email}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="password" style={{ display: "block", marginBottom: "5px" }}>
                            Password:
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.password && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.password}</span>
                        )}
                    </div>

                    <button type="submit" style={{ padding: "10px 15px", cursor: "pointer" }}>
                        Login
                    </button>
                </form>
            </div>
        </>
    );
}
