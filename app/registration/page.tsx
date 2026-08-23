"use client";

import { useState } from "react";
import { z } from "zod";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

// Zod schema for registration validation
const registrationSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().min(1, "Email is required").email("Invalid email address"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        address: z.string().min(1, "Address is required"),
        title: z.string().min(1, "Title is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegistrationErrors = {
    username?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    title?: string;
    password?: string;
    confirmPassword?: string;
};

export default function Registration() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [title, setTitle] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<RegistrationErrors>({});
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");

        const result = registrationSchema.safeParse({
            username,
            email,
            phoneNumber,
            address,
            title,
            password,
            confirmPassword,
        });

        if (!result.success) {
            const formattedErrors: RegistrationErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof RegistrationErrors;
                formattedErrors[path] = issue.message;
            });
            setErrors(formattedErrors);
            return;
        }

        // Simulating successful registration
        setSuccessMessage("Registration successful!");
        console.log("Registration data:", result.data);
    };

    return (
        <>
            <MyHeader name="Registration" message="create a new account!" />
            <MyNavigation />

            <div style={{
                marginTop: "20px",
                maxWidth: "400px",
                backgroundColor: "#FFFFFF",
                padding: "25px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
                <h1 style={{ marginTop: 0, color: "#1F2937", marginBottom: "20px" }}>Registration</h1>

                {successMessage && (
                    <p style={{ color: "#16A34A", fontWeight: "bold", marginBottom: "15px" }}>{successMessage}</p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="title" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Title:
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            placeholder="e.g. Mr., Ms., Dr."
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.title && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.title}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="username" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Username:
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.username && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.username}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Email Address:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.email && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.email}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="phoneNumber" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Phone Number:
                        </label>
                        <input
                            id="phoneNumber"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.phoneNumber && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.phoneNumber}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="address" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Address:
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.address && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.address}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label htmlFor="password" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Password:
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.password && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.password}</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "5px", fontWeight: "500", color: "#1F2937" }}>
                            Confirm Password:
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                boxSizing: "border-box",
                                border: "1px solid #64748B",
                                borderRadius: "4px",
                                outlineColor: "#D99A1E"
                            }}
                        />
                        {errors.confirmPassword && (
                            <span style={{ color: "#DC2626", fontSize: "14px", display: "block", marginTop: "5px" }}>{errors.confirmPassword}</span>
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
                        Registration
                    </button>
                </form>
            </div>
        </>
    );
}
