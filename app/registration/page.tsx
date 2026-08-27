"use client";

import { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import MyNavigation from "@/components/navigation";
import MyHeader from "@/components/header";

const registrationSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        email: z.string().min(1, "Email is required").email("Invalid email address"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        address: z.string().min(1, "Address is required"),
        title: z.string().min(1, "Title is required"),
        photo: z.any().refine((file) => file instanceof File, "Photo is required"),
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
    photo?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
};

export default function Registration() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [title, setTitle] = useState("Customer");
    const [photo, setPhoto] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<RegistrationErrors>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage("");

        const result = registrationSchema.safeParse({
            username,
            email,
            phoneNumber,
            address,
            title,
            photo,
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

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("userName", result.data.username);
        formData.append("email", result.data.email);
        formData.append("phoneNumber", result.data.phoneNumber);
        formData.append("address", result.data.address);
        formData.append("title", result.data.title);
        formData.append("password", result.data.password);
        formData.append("photo", result.data.photo);

        try {
            await axios.post(
                "http://localhost:8000/customer/auth/register",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setSuccessMessage("Registration successful! Redirecting to login page...");

            setUsername("");
            setEmail("");
            setPhoneNumber("");
            setAddress("");
            setTitle("");
            setPhoto(null);
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Registration request error:", error);
            const apiMessage = error.response?.data?.message || "Registration failed. Please check your backend connection.";
            setErrors({
                form: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <MyHeader name="Registration" message="create a new account!" />
            <MyNavigation />

            <div className="mt-5 w-full max-w-[600px] bg-card-white p-6 rounded-lg border border-[#E2E8F0] shadow-md text-left">
                <h1 className="mt-0 text-dark-slate mb-5 text-2xl font-bold">Registration</h1>

                {successMessage && (
                    <p className="text-success-green font-bold mb-4">{successMessage}</p>
                )}

                {errors.form && (
                    <p className="text-error-red font-bold mb-4">{errors.form}</p>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="title" className="block mb-1 font-medium text-dark-slate">
                            Title:
                        </label>
                        <select
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        >
                            <option value="Customer">Customer</option>
                            <option value="Supplier">Supplier</option>
                            <option value="Dealer">Dealer</option>
                        </select>
                        {errors.title && (
                            <span className="text-error-red text-sm block mt-1">{errors.title}</span>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="username" className="block mb-1 font-medium text-dark-slate">
                            Username:
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.username && (
                            <span className="text-error-red text-sm block mt-1">{errors.username}</span>
                        )}
                    </div>

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

                    <div className="mb-4">
                        <label htmlFor="phoneNumber" className="block mb-1 font-medium text-dark-slate">
                            Phone Number:
                        </label>
                        <input
                            id="phoneNumber"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.phoneNumber && (
                            <span className="text-error-red text-sm block mt-1">{errors.phoneNumber}</span>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="address" className="block mb-1 font-medium text-dark-slate">
                            Address:
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.address && (
                            <span className="text-error-red text-sm block mt-1">{errors.address}</span>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="photo" className="block mb-1 font-medium text-dark-slate">
                            Profile Photo:
                        </label>
                        <input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.photo && (
                            <span className="text-error-red text-sm block mt-1">{errors.photo}</span>
                        )}
                    </div>

                    <div className="mb-4">
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

                    <div className="mb-5">
                        <label htmlFor="confirmPassword" className="block mb-1 font-medium text-dark-slate">
                            Confirm Password:
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2.5 border border-secondary-gray rounded bg-card-white text-dark-slate outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                        />
                        {errors.confirmPassword && (
                            <span className="text-error-red text-sm block mt-1">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-white border-none py-2.5 px-5 rounded cursor-pointer font-semibold text-[15px] w-full hover:bg-primary/90 disabled:bg-primary/50"
                    >
                        {isSubmitting ? "Registering..." : "Registration"}
                    </button>
                </form>
            </div>
        </>
    );
}
