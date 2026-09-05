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

        const rolePath = result.data.title.toLowerCase();

        try {
            const res = await axios.post(
                `http://localhost:8000/${rolePath}/auth/register`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    validateStatus: (status) => status < 500,
                }
            );

            if (res.status === 200 || res.status === 201) {
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
            } else if (res.status === 409) {
                setErrors({
                    form: `An account with this email (${result.data.email}) already exists as a ${result.data.title}. Please sign in with this email or use a different email to register.`,
                });
            } else {
                const apiMessage = res.data?.message || "Registration failed. Please check your backend connection.";
                setErrors({
                    form: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage,
                });
            }
        } catch (error: any) {
            console.warn("Registration request error:", error);
            const apiMessage = error.response?.data?.message || "Registration failed. Please check your backend connection.";
            setErrors({
                form: Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <MyHeader name="Registration" message="Create an enterprise account to join the oil supply network" />
            <MyNavigation />

            <div className="mt-8 w-full max-w-2xl">
                <div className="card bg-base-100 shadow-xl border border-base-300">
                    <div className="card-body p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
                                <p className="text-xs text-slate-500 font-medium">Register as a customer, dealer, supplier, or administrator</p>
                            </div>
                        </div>

                        {successMessage && (
                            <div role="alert" className="alert alert-success shadow-sm mb-5 text-sm py-3">
                                <svg className="w-5 h-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {errors.form && (
                            <div role="alert" className="alert alert-error shadow-sm mb-5 text-sm py-3 text-white bg-error">
                                <svg className="w-5 h-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{errors.form}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control w-full">
                                    <label className="label pb-1" htmlFor="title">
                                        <span className="label-text font-semibold text-slate-700">Account Role / Title</span>
                                    </label>
                                    <select
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="select select-bordered w-full focus:outline-primary"
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Supplier">Supplier</option>
                                        <option value="Dealer">Dealer</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                    {errors.title && (
                                        <span className="text-error text-xs font-medium mt-1">{errors.title}</span>
                                    )}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label pb-1" htmlFor="username">
                                        <span className="label-text font-semibold text-slate-700">Username</span>
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        placeholder="johndoe"
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={`input input-bordered w-full focus:outline-primary ${errors.username ? "input-error" : ""}`}
                                    />
                                    {errors.username && (
                                        <span className="text-error text-xs font-medium mt-1">{errors.username}</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control w-full">
                                    <label className="label pb-1" htmlFor="email">
                                        <span className="label-text font-semibold text-slate-700">Email Address</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        placeholder="john@company.com"
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`input input-bordered w-full focus:outline-primary ${errors.email ? "input-error" : ""}`}
                                    />
                                    {errors.email && (
                                        <span className="text-error text-xs font-medium mt-1">{errors.email}</span>
                                    )}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label pb-1" htmlFor="phoneNumber">
                                        <span className="label-text font-semibold text-slate-700">Phone Number</span>
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        type="tel"
                                        value={phoneNumber}
                                        placeholder="+1 234 567 890"
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={`input input-bordered w-full focus:outline-primary ${errors.phoneNumber ? "input-error" : ""}`}
                                    />
                                    {errors.phoneNumber && (
                                        <span className="text-error text-xs font-medium mt-1">{errors.phoneNumber}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-control w-full">
                                <label className="label pb-1" htmlFor="address">
                                    <span className="label-text font-semibold text-slate-700">Physical / Operating Address</span>
                                </label>
                                <input
                                    id="address"
                                    type="text"
                                    value={address}
                                    placeholder="123 Industrial Boulevard, Sector 4"
                                    onChange={(e) => setAddress(e.target.value)}
                                    className={`input input-bordered w-full focus:outline-primary ${errors.address ? "input-error" : ""}`}
                                />
                                {errors.address && (
                                    <span className="text-error text-xs font-medium mt-1">{errors.address}</span>
                                )}
                            </div>

                            <div className="form-control w-full">
                                <label className="label pb-1" htmlFor="photo">
                                    <span className="label-text font-semibold text-slate-700">Profile / Identification Photo</span>
                                </label>
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                    className="file-input file-input-bordered file-input-primary w-full"
                                />
                                {errors.photo && (
                                    <span className="text-error text-xs font-medium mt-1">{errors.photo}</span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control w-full">
                                    <label className="label pb-1" htmlFor="password">
                                        <span className="label-text font-semibold text-slate-700">Password</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        placeholder="Min. 8 characters"
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`input input-bordered w-full focus:outline-primary ${errors.password ? "input-error" : ""}`}
                                    />
                                    {errors.password && (
                                        <span className="text-error text-xs font-medium mt-1">{errors.password}</span>
                                    )}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label pb-1" htmlFor="confirmPassword">
                                        <span className="label-text font-semibold text-slate-700">Confirm Password</span>
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        placeholder="Re-enter password"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`input input-bordered w-full focus:outline-primary ${errors.confirmPassword ? "input-error" : ""}`}
                                    />
                                    {errors.confirmPassword && (
                                        <span className="text-error text-xs font-medium mt-1">{errors.confirmPassword}</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary w-full shadow-md text-white font-semibold flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <span>Complete Registration</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="divider text-xs text-slate-400 my-4">OR</div>

                        <div className="text-center">
                            <p className="text-xs text-slate-500">
                                Already have an account?{" "}
                                <a href="/login" className="link link-primary font-semibold hover:underline">
                                    Sign in here
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
