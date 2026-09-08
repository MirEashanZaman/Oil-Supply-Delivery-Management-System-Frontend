"use client";

import React from "react";
import { Product, CartItem, SystemUser, UserData } from "../types";
import { getProductImage } from "../utils";

interface CheckoutPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    isMultiCheckout: boolean;
    checkoutProduct: Product | null;
    cartItems: CartItem[];
    cartTotalItems: number;
    cartTotalAmount: number;
    orderQuantity: number;
    setOrderQuantity: (qty: number) => void;
    sourcingChoice: "supplier" | "dealer";
    setSourcingChoice: (choice: "supplier" | "dealer") => void;
    selectedPartyId: number | string;
    setSelectedPartyId: (id: number | string) => void;
    availableSuppliers: SystemUser[];
    availableDealers: SystemUser[];
    deliveryAddress: string;
    setDeliveryAddress: (addr: string) => void;
    user: UserData | null;
    paymentMethod: "card" | "mobile" | "bank";
    setPaymentMethod: (m: "card" | "mobile" | "bank") => void;
    cardType: string;
    setCardType: (t: string) => void;
    cardNumber: string;
    setCardNumber: (n: string) => void;
    cardExpiry: string;
    setCardExpiry: (e: string) => void;
    cardCvv: string;
    setCardCvv: (c: string) => void;
    cardHolder: string;
    setCardHolder: (h: string) => void;
    mobileOperator: string;
    setMobileOperator: (op: string) => void;
    mobileWalletNumber: string;
    setMobileWalletNumber: (w: string) => void;
    bankName: string;
    setBankName: (b: string) => void;
    bankAccountNumber: string;
    setBankAccountNumber: (a: string) => void;
    onApplyCardPreset: (type: "Visa" | "MasterCard" | "Amex") => void;
    onApplyMobilePreset: (op: "bKash" | "Nagad" | "Rocket") => void;
    onLaunchSandboxGateway: () => void;
    onReturnToCart: () => void;
}

export const CheckoutPaymentModal: React.FC<CheckoutPaymentModalProps> = ({
    isOpen,
    onClose,
    isMultiCheckout,
    checkoutProduct,
    cartItems,
    cartTotalItems,
    cartTotalAmount,
    orderQuantity,
    setOrderQuantity,
    sourcingChoice,
    setSourcingChoice,
    selectedPartyId,
    setSelectedPartyId,
    availableSuppliers,
    availableDealers,
    deliveryAddress,
    setDeliveryAddress,
    user,
    paymentMethod,
    setPaymentMethod,
    cardType,
    setCardType,
    cardNumber,
    setCardNumber,
    cardExpiry,
    setCardExpiry,
    cardCvv,
    setCardCvv,
    cardHolder,
    setCardHolder,
    mobileOperator,
    setMobileOperator,
    mobileWalletNumber,
    setMobileWalletNumber,
    bankName,
    setBankName,
    bankAccountNumber,
    setBankAccountNumber,
    onApplyCardPreset,
    onApplyMobilePreset,
    onLaunchSandboxGateway,
    onReturnToCart,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-card-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-[650px] max-h-[90vh] overflow-y-auto text-left p-6 md:p-8">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-4 mb-5">
                    <div>
                        <h2 className="text-xl font-extrabold text-dark-slate">
                            {isMultiCheckout ? "Multi-Product Consolidated Checkout" : "Petroleum Checkout & Sourcing"}
                        </h2>
                        <p className="text-xs text-secondary-gray">
                            {isMultiCheckout
                                ? `Select payment method for ${cartItems.length} petroleum items (${cartTotalItems} total units).`
                                : "Select preferred payment option and verified distribution sourcing."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-dark-slate p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* If Multi-Product Checkout: Itemized Breakdown */}
                {isMultiCheckout ? (
                    <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#E2E8F0] mb-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                            <span className="text-xs font-bold text-dark-slate uppercase tracking-wider">
                                Selected Cart Items ({cartItems.length})
                            </span>
                            <button
                                type="button"
                                onClick={onReturnToCart}
                                className="text-primary hover:underline font-bold text-xs cursor-pointer"
                            >
                                ← Edit Cart & Sourcing
                            </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                            {cartItems.map((ci) => (
                                <div key={ci.product.id} className="flex items-center justify-between gap-3 text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                            <img
                                                src={ci.product.image || getProductImage(ci.product.name, ci.product.image, ci.product.id)}
                                                alt={ci.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="font-bold text-dark-slate truncate">{ci.product.name}</h5>
                                            <p className="text-[11px] text-secondary-gray truncate">
                                                From: <strong className="text-dark-slate">{ci.sourcingChoice === "supplier" ? "Refinery Supplier" : "Local Dealer"}</strong> • Site: <strong className="text-dark-slate">{ci.deliveryAddress || deliveryAddress || user?.address || "Main Depot"}</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-bold text-dark-slate block">{ci.quantity} × {ci.product.price}</span>
                                        <span className="font-black text-primary text-xs">${(ci.product.numericPrice * ci.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-[#E2E8F0] pt-2 flex justify-between items-center text-xs">
                            <span className="font-bold text-dark-slate">Total Consolidated Amount:</span>
                            <span className="text-base font-extrabold text-primary">${cartTotalAmount.toFixed(2)} USD</span>
                        </div>
                    </div>
                ) : (
                    /* Single Product Checkout */
                    checkoutProduct && (
                        <>
                            <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#E2E8F0] mb-5 flex gap-4 items-center">
                                <img
                                    src={checkoutProduct.image || getProductImage(checkoutProduct.name, checkoutProduct.image, checkoutProduct.id)}
                                    alt={checkoutProduct.name}
                                    className="w-16 h-16 rounded-xl object-cover border border-[#CBD5E1] shrink-0"
                                    onError={(e) => {
                                        e.currentTarget.src = getProductImage(checkoutProduct.name, undefined, checkoutProduct.id);
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-bold text-secondary-gray uppercase">{checkoutProduct.category}</span>
                                            <h3 className="text-base font-bold text-dark-slate">{checkoutProduct.name}</h3>
                                            <p className="text-xs text-secondary-gray">{checkoutProduct.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <label className="block text-xs font-bold text-dark-slate mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={orderQuantity}
                                                onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-20 p-1.5 border border-secondary-gray rounded-lg text-center font-bold bg-white text-dark-slate outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between items-center">
                                        <span className="text-xs font-semibold text-dark-slate">Total Payable:</span>
                                        <span className="text-base font-extrabold text-primary">
                                            ${(checkoutProduct.numericPrice * orderQuantity).toFixed(2)} USD
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-bold text-dark-slate mb-2">
                                    Select Sourcing Distribution Channel:
                                </label>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSourcingChoice("supplier");
                                            if (availableSuppliers.length > 0) setSelectedPartyId(availableSuppliers[0].id);
                                        }}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${sourcingChoice === "supplier"
                                                ? "border-primary bg-blue-50/50 ring-2 ring-primary/20"
                                                : "border-[#E2E8F0] bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="block font-bold text-xs text-dark-slate">Refinery Direct Supplier</span>
                                        <span className="block text-[11px] text-secondary-gray">Pipeline & Depot wholesale</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSourcingChoice("dealer");
                                            if (availableDealers.length > 0) setSelectedPartyId(availableDealers[0].id);
                                        }}
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${sourcingChoice === "dealer"
                                                ? "border-primary bg-blue-50/50 ring-2 ring-primary/20"
                                                : "border-[#E2E8F0] bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="block font-bold text-xs text-dark-slate">Authorized Local Dealer</span>
                                        <span className="block text-[11px] text-secondary-gray">Regional distributor hub</span>
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">
                                        Assigned {sourcingChoice === "supplier" ? "Supplier Partner" : "Dealer Depot"}:
                                    </label>
                                    <select
                                        value={selectedPartyId}
                                        onChange={(e) => setSelectedPartyId(Number(e.target.value))}
                                        className="w-full p-2.5 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none"
                                    >
                                        {sourcingChoice === "supplier" ? (
                                            availableSuppliers.length > 0 ? (
                                                availableSuppliers.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.userName || s.username || `Supplier Partner #${s.id}`} ({s.email || "Verified"})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No registered suppliers available</option>
                                            )
                                        ) : (
                                            availableDealers.length > 0 ? (
                                                availableDealers.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.userName || d.username || `Authorized Dealer #${d.id}`} ({d.email || "Verified"})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No authorized dealers available</option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-bold text-dark-slate mb-1">Delivery Destination Address</label>
                                <input
                                    type="text"
                                    value={deliveryAddress}
                                    placeholder="Enter full delivery destination address..."
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    className="w-full p-2.5 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none"
                                />
                            </div>
                        </>
                    )
                )}

                <div className="border-t border-[#E2E8F0] pt-4 mb-5">
                    <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 p-3 rounded-xl mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse shrink-0"></span>
                            <div>
                                <span className="text-xs font-bold text-[#0F172A] block">Sandbox Payment Gateway Active</span>
                                <span className="text-[11px] text-[#64748B] block">Safe test environment. Simulates real-time card and mobile banking authorization.</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30 px-2 py-0.5 rounded uppercase shrink-0">
                            Sandbox
                        </span>
                    </div>

                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("card")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                paymentMethod === "card"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-[#F1F5F9] text-secondary-gray hover:bg-[#E2E8F0] hover:text-dark-slate"
                            }`}
                        >
                            Credit / Debit Card
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("mobile")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                paymentMethod === "mobile"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-[#F1F5F9] text-secondary-gray hover:bg-[#E2E8F0] hover:text-dark-slate"
                            }`}
                        >
                            Mobile Banking
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("bank")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                paymentMethod === "bank"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-[#F1F5F9] text-secondary-gray hover:bg-[#E2E8F0] hover:text-dark-slate"
                            }`}
                        >
                            Bank Transfer
                        </button>
                    </div>

                    {paymentMethod === "card" && (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                <span className="text-[11px] font-bold text-secondary-gray mr-1">Autofill Test Cards:</span>
                                <button
                                    type="button"
                                    onClick={() => onApplyCardPreset("Visa")}
                                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-primary text-dark-slate rounded-lg text-[11px] font-semibold cursor-pointer"
                                >
                                    Visa Test Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onApplyCardPreset("MasterCard")}
                                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-primary text-dark-slate rounded-lg text-[11px] font-semibold cursor-pointer"
                                >
                                    MasterCard Test
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onApplyCardPreset("Amex")}
                                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-primary text-dark-slate rounded-lg text-[11px] font-semibold cursor-pointer"
                                >
                                    Amex Test
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Card Network</label>
                                    <select
                                        value={cardType}
                                        onChange={(e) => setCardType(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none"
                                    >
                                        <option value="Visa">Visa (Sandbox)</option>
                                        <option value="MasterCard">MasterCard (Sandbox)</option>
                                        <option value="American Express">American Express (Sandbox)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={cardHolder}
                                        placeholder="Name on card"
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-secondary-gray mb-1">Sandbox Card Number</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    placeholder="4000-XXXX-XXXX-XXXX"
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        value={cardExpiry}
                                        placeholder="MM/YY"
                                        onChange={(e) => setCardExpiry(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">CVV Security Code</label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        value={cardCvv}
                                        placeholder="123"
                                        onChange={(e) => setCardCvv(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none text-center font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === "mobile" && (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                                <span className="text-[11px] font-bold text-secondary-gray mr-1">Autofill Test Wallets:</span>
                                <button
                                    type="button"
                                    onClick={() => onApplyMobilePreset("bKash")}
                                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-primary text-dark-slate rounded-lg text-[11px] font-semibold cursor-pointer"
                                >
                                    bKash Sandbox
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onApplyMobilePreset("Nagad")}
                                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-primary text-dark-slate rounded-lg text-[11px] font-semibold cursor-pointer"
                                >
                                    Nagad Sandbox
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onApplyMobilePreset("Rocket")}
                                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-primary text-dark-slate rounded-lg text-[11px] font-semibold cursor-pointer"
                                >
                                    Rocket Sandbox
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">MFS Provider</label>
                                    <select
                                        value={mobileOperator}
                                        onChange={(e) => setMobileOperator(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none"
                                    >
                                        <option value="bKash">bKash (Sandbox)</option>
                                        <option value="Nagad">Nagad (Sandbox)</option>
                                        <option value="Rocket">Rocket (Sandbox)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Test Wallet Number</label>
                                    <input
                                        type="text"
                                        value={mobileWalletNumber}
                                        placeholder="01700-000000"
                                        onChange={(e) => setMobileWalletNumber(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === "bank" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Issuing Bank</label>
                                    <select
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none"
                                    >
                                        <option value="Eastern Bank Limited">Eastern Bank Limited</option>
                                        <option value="City Bank Bangladesh">City Bank Bangladesh</option>
                                        <option value="BRAC Bank Limited">BRAC Bank Limited</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary-gray mb-1">Corporate Account Number</label>
                                    <input
                                        type="text"
                                        value={bankAccountNumber}
                                        placeholder="EBL-10029384"
                                        onChange={(e) => setBankAccountNumber(e.target.value)}
                                        className="w-full p-2 border border-secondary-gray rounded-xl bg-white text-dark-slate text-xs outline-none font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={isMultiCheckout ? onReturnToCart : onClose}
                        className="w-1/3 py-3 rounded-xl border border-secondary-gray text-dark-slate font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {isMultiCheckout ? "Return to Cart" : "Cancel"}
                    </button>
                    <button
                        type="button"
                        onClick={onLaunchSandboxGateway}
                        className="w-2/3 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#1E293B] font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm border-none flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>
                            Proceed to Sandbox Payment (${(isMultiCheckout ? cartTotalAmount : (checkoutProduct ? checkoutProduct.numericPrice * orderQuantity : 0)).toFixed(2)})
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
