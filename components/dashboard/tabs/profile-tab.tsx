"use client";

import React, { useState } from "react";
import { UserData } from "../types";

interface ProfileTabProps {
  userData: UserData | null;
  onUpdateProfile?: (updated: Partial<UserData>) => void;
  onDeleteAccount?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userData,
  onUpdateProfile,
  onDeleteAccount,
}) => {
  const [name, setName] = useState(userData?.userName || userData?.name || "");
  const [phone, setPhone] = useState(userData?.phoneNumber || userData?.phone || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ userName: name, phoneNumber: phone, address });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full text-left animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-dark-slate mb-4">Edit Profile Settings</h2>
        {saved && (
          <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            ✓ Profile details updated successfully!
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark-slate mb-1">Username / Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dark-slate mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dark-slate mb-1">Primary Operational Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 border border-secondary-gray rounded-lg text-sm bg-white text-dark-slate outline-none"
            />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-[#F1F5F9]">
            {onDeleteAccount && (
              <button
                type="button"
                onClick={onDeleteAccount}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
              >
                Delete Account
              </button>
            )}
            <button
              type="submit"
              className="bg-[#0F2747] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#163860] transition cursor-pointer shadow-sm ml-auto"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
