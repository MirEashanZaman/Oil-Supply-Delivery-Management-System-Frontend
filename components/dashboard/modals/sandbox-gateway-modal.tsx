"use client";

import React from "react";
import { Product, CartItem } from "../types";

interface SandboxGatewayModalProps {
    isOpen: boolean;
    onClose: () => void;
    isMultiCheckout: boolean;
    checkoutProduct: Product | null;
    cartItems: CartItem[];
    cartTotalItems: number;
    cartTotalAmount: number;
    orderQuantity: number;
    sandboxTxnId: string;
    sandboxAuthCode: string;
    sandboxStep: "gateway" | "processing" | "success" | "declined";
    setSandboxStep: (step: "gateway" | "processing" | "success" | "declined") => void;
    sandboxOtp: string;
    setSandboxOtp: (otp: string) => void;
    sandboxProcessingLogs: string[];
    paymentMethod: "card" | "mobile" | "bank";
    cardType: string;
    cardNumber: string;
    mobileOperator: string;
    mobileWalletNumber: string;
    bankName: string;
    bankAccountNumber: string;
    deliveryAddress: string;
    createdPaymentRecord: any;
    createdOrderId: number | string | null;
    onExecuteAuthorization: (forceSimulateDecline: boolean) => void;
    onFinishPayment: () => void;
    onReturnToCart: () => void;
}

export const SandboxGatewayModal: React.FC<SandboxGatewayModalProps> = ({
    isOpen,
    onClose,
    isMultiCheckout,
    checkoutProduct,
    cartItems,
    cartTotalItems,
    cartTotalAmount,
    orderQuantity,
    sandboxTxnId,
    sandboxAuthCode,
    sandboxStep,
    setSandboxStep,
    sandboxOtp,
    setSandboxOtp,
    sandboxProcessingLogs,
    paymentMethod,
    cardType,
    cardNumber,
    mobileOperator,
    mobileWalletNumber,
    bankName,
    bankAccountNumber,
    deliveryAddress,
    createdPaymentRecord,
    createdOrderId,
    onExecuteAuthorization,
    onFinishPayment,
    onReturnToCart,
}) => {
    if (!isOpen || (!checkoutProduct && !isMultiCheckout)) return null;

    const totalDue = isMultiCheckout
        ? cartTotalAmount
        : checkoutProduct
            ? checkoutProduct.numericPrice * orderQuantity
            : 0;

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[60] animate-fadeIn">
            <div className="bg-card-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-[580px] overflow-hidden text-left">
                <div className="bg-[#0F2747] text-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-base text-white tracking-wide">
                                    {isMultiCheckout ? `SANDBOX MULTI-DELIVERY (${cartTotalItems} ITEMS)` : "SANDBOX PAYMENT GATEWAY"}
                                </h3>
                                <span className="bg-[#059669] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">TEST MODE</span>
                            </div>
                            <p className="text-xs text-slate-300">SSL 256-Bit Encrypted Sandbox Transaction</p>
                        </div>
                    </div>
                    {sandboxStep !== "processing" && (
                        <button
                            onClick={isMultiCheckout ? onReturnToCart : onClose}
                            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="p-6">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl mb-5">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-[11px] font-bold text-secondary-gray uppercase block">Merchant Reference</span>
                                <span className="text-xs font-bold text-dark-slate block">Oil Supply & Delivery Global Trading Ltd.</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-bold text-secondary-gray uppercase block">Amount Due</span>
                                <span className="text-lg font-black text-primary block">
                                    ${totalDue.toFixed(2)} USD
                                </span>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-[#E2E8F0] flex justify-between text-xs text-secondary-gray">
                            {isMultiCheckout ? (
                                <span>
                                    Consolidated Cart: <strong className="text-dark-slate">{cartItems.length} Petroleum Products</strong> ({cartTotalItems} Units)
                                </span>
                            ) : (
                                <span>Product: <strong className="text-dark-slate">{checkoutProduct?.name}</strong> (Qty: {orderQuantity})</span>
                            )}
                            <span className="font-mono text-primary font-semibold">{sandboxTxnId}</span>
                        </div>

                        {isMultiCheckout && (
                            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] max-h-28 overflow-y-auto space-y-1 text-[11px]">
                                {cartItems.map((ci) => (
                                    <div key={ci.product.id} className="flex justify-between text-secondary-gray">
                                        <span className="truncate pr-2">• {ci.product.name} (x{ci.quantity})</span>
                                        <span className="font-bold text-dark-slate">${(ci.product.numericPrice * ci.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {sandboxStep === "gateway" && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-secondary-gray">Payment Method:</span>
                                    <span className="font-bold text-dark-slate">
                                        {paymentMethod === "card"
                                            ? `${cardType} (${cardNumber.slice(-4)})`
                                            : paymentMethod === "mobile"
                                                ? `${mobileOperator} (${mobileWalletNumber})`
                                                : `${bankName} (${bankAccountNumber})`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-gray">Destination:</span>
                                    <span className="font-semibold text-dark-slate">{deliveryAddress || "Operational Depot"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-gray">Auth Code:</span>
                                    <span className="font-mono text-dark-slate">{sandboxAuthCode}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-dark-slate mb-1">
                                    Sandbox Verification OTP (2-Factor Simulation)
                                </label>
                                <input
                                    type="text"
                                    value={sandboxOtp}
                                    onChange={(e) => setSandboxOtp(e.target.value)}
                                    placeholder="Enter your OTP"
                                    className="w-full p-2.5 border border-secondary-gray rounded-xl bg-white text-dark-slate text-sm font-mono text-center tracking-widest outline-none focus:border-primary"
                                />
                                <span className="text-[11px] text-secondary-gray mt-1 block">
                                    Default Test OTP: <strong>123456</strong> (Instant Sandbox Verification)
                                </span>
                            </div>

                            <div className="space-y-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => onExecuteAuthorization(false)}
                                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm border-none flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>
                                        {isMultiCheckout
                                            ? `Authorize All Deliveries ($${cartTotalAmount.toFixed(2)} USD)`
                                            : "Authorize & Complete Sandbox Payment"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onExecuteAuthorization(true)}
                                    className="w-full py-2.5 rounded-xl border border-error-red/40 text-error-red hover:bg-red-50 font-semibold text-xs transition-colors cursor-pointer"
                                >
                                    Simulate Decline (Test Error Handling)
                                </button>

                                <button
                                    type="button"
                                    onClick={isMultiCheckout ? onReturnToCart : onClose}
                                    className="w-full py-2 text-xs text-secondary-gray hover:text-dark-slate font-medium cursor-pointer"
                                >
                                    Cancel and Return
                                </button>
                            </div>
                        </div>
                    )}

                    {sandboxStep === "processing" && (
                        <div className="py-8 text-center space-y-4">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <h4 className="text-base font-bold text-dark-slate">Authorizing Sandbox Transaction...</h4>
                            <div className="bg-[#0F172A] text-emerald-400 p-4 rounded-xl text-left font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 shadow-inner">
                                {sandboxProcessingLogs.map((log, i) => (
                                    <p key={i} className="flex items-center gap-2">
                                        <span className="text-slate-500">{`>`}</span>
                                        <span>{log}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {sandboxStep === "success" && (
                        <div className="text-center py-2 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-success-green flex items-center justify-center mx-auto text-success-green">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <div>
                                <h4 className="text-lg font-black text-dark-slate">Sandbox Payment Authorized</h4>
                                <p className="text-xs text-secondary-gray mt-0.5">
                                    {isMultiCheckout
                                        ? "All multi-product orders confirmed & recorded in network."
                                        : "Transaction validated via backend service and order confirmed."}
                                </p>
                            </div>

                            <div className="bg-[#FAFBFD] border border-[#E2E8F0] p-4 rounded-xl text-left text-xs space-y-2 font-mono">
                                <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                                    <span className="text-secondary-gray font-sans">Transaction ID:</span>
                                    <span className="font-bold text-primary">{sandboxTxnId}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                                    <span className="text-secondary-gray font-sans">Auth Code:</span>
                                    <span className="font-bold text-dark-slate">{sandboxAuthCode}</span>
                                </div>
                                <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                                    <span className="text-secondary-gray font-sans">Total Paid:</span>
                                    <span className="font-bold text-success-green">
                                        ${totalDue.toFixed(2)} USD
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-[#E2E8F0] pb-1.5">
                                    <span className="text-secondary-gray font-sans">Ledger Record:</span>
                                    <span className="font-bold text-dark-slate">Payment #{createdPaymentRecord?.id || 1} (POST /payment/process)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary-gray font-sans">Order ID:</span>
                                    <span className="font-bold text-dark-slate">#{createdOrderId || "Multi-Order Confirmed"}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onFinishPayment}
                                className="w-full py-3.5 rounded-xl bg-success-green hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-md border-none"
                            >
                                View Orders & Live GPS Tracking
                            </button>
                        </div>
                    )}

                    {sandboxStep === "declined" && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-14 h-14 rounded-full bg-red-100 border-2 border-error-red flex items-center justify-center mx-auto text-error-red">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>

                            <div>
                                <h4 className="text-base font-bold text-dark-slate">Payment Declined by Sandbox Issuer</h4>
                                <p className="text-xs text-secondary-gray mt-1">
                                    Simulation completed: Test card issuer returned authorization failure code 51.
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSandboxStep("gateway")}
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/95 transition-colors cursor-pointer"
                                >
                                    Retry with Test Card
                                </button>
                                <button
                                    type="button"
                                    onClick={isMultiCheckout ? onReturnToCart : onClose}
                                    className="py-2.5 px-4 rounded-xl border border-secondary-gray text-dark-slate font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
