"use client";
import { useState } from "react";
import { z } from "zod";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

// Zod schema for login validation
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

            <div style={{
                marginTop: "20px",
                width: "100%",
                maxWidth: "500px",
                backgroundColor: "#FFFFFF",
                padding: "25px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                textAlign: "left"
            }}>
                <h1 style={{ marginTop: 0, color: "#1F2937", marginBottom: "20px" }}>Login</h1>

                {successMessage && (
                    <p style={{ color: "#16A34A", fontWeight: "bold", marginBottom: "15px" }}>{successMessage}</p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Email Address:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                        />
                        {errors.email && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.email}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="password" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Password:
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />
                        {errors.password && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.password}</span>
                        )}
                    </div>

                    <button type="submit" style={{
                        backgroundColor: "#0F2747",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "15px",
                        width: "100%"
                    }}>
                        Login
                    </button>
                </form>
            </div>
        </>
    );
}
