"use client";

import { useState } from "react";
import { z } from "zod";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

// Zod schema for registration validation
const registerSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().min(1, "Email is required").email("Invalid email address"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        address: z.string().min(1, "Address is required"),
        title: z.string().min(1, "Title is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterErrors = {
    username?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    title?: string;
    password?: string;
    confirmPassword?: string;
};

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [title, setTitle] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");

        const result = registerSchema.safeParse({
            username,
            email,
            phoneNumber,
            address,
            title,
            password,
            confirmPassword,
        });

        if (!result.success) {
            const formattedErrors: RegisterErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof RegisterErrors;
                formattedErrors[path] = issue.message;
            });
            setErrors(formattedErrors);
            return;
        }

        // Simulating successful registration
        setSuccessMessage("Registration successful!");
        console.log("Registered data:", result.data);
    };

    return (
        <>
            <MyHeader name="Register" message="create a new account!" />
            <MyNavigation />

            <div style={{ marginTop: "20px", maxWidth: "400px" }}>
                <h1>Register</h1>

                {successMessage && (
                    <p style={{ color: "green", fontWeight: "bold" }}>{successMessage}</p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="title" style={{ display: "block", marginBottom: "5px" }}>
                            Title:
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            placeholder="e.g. Mr., Ms., Dr."
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.title && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.title}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="username" style={{ display: "block", marginBottom: "5px" }}>
                            Username:
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.username && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.username}</span>
                        )}
                    </div>

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
                        <label htmlFor="phoneNumber" style={{ display: "block", marginBottom: "5px" }}>
                            Phone Number:
                        </label>
                        <input
                            id="phoneNumber"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.phoneNumber && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.phoneNumber}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="address" style={{ display: "block", marginBottom: "5px" }}>
                            Address:
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.address && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.address}</span>
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

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "5px" }}>
                            Confirm Password:
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                        />
                        {errors.confirmPassword && (
                            <span style={{ color: "red", fontSize: "14px" }}>{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button type="submit" style={{ padding: "10px 15px", cursor: "pointer" }}>
                        Register
                    </button>
                </form>
            </div>
        </>
    );
}
