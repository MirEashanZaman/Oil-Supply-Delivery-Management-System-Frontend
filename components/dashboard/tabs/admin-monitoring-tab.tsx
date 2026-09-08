"use client";

import React, { useState } from "react";
import { SystemUser } from "../types";
import { getRoleBadgeColor } from "../utils";

interface AdminMonitoringTabProps {
  users: SystemUser[];
  loadingUsers: boolean;
  onEditUser: (user: SystemUser) => void;
  onDeleteUser: (id: number) => void;
  onCreateUser: (newUser: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    address: string;
  }) => void;
  creatingUser: boolean;
}

export const AdminMonitoringTab: React.FC<AdminMonitoringTabProps> = ({
  users,
  loadingUsers,
  onEditUser,
  onDeleteUser,
  onCreateUser,
  creatingUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer",
    phone: "",
    address: "",
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateUser(newUserForm);
    setNewUserForm({
      name: "",
      email: "",
      password: "",
      role: "Customer",
      phone: "",
      address: "",
    });
    setShowCreateForm(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (u.role || "").toLowerCase() === roleFilter.toLowerCase();
    const matchesDate =
      !dateFilter ||
      (u.createdAt && u.createdAt.startsWith(dateFilter));
    return matchesSearch && matchesRole && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Roles</option>
              <option value="Customer">Customers</option>
              <option value="Dealer">Dealers</option>
              <option value="Supplier">Suppliers</option>
              <option value="Admin">Admins</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
              title="Filter by join date"
            />

            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap"
        >
          {showCreateForm ? "✕ Cancel" : "+ Register New User"}
        </button>
      </div>

      {/* Expandable Create User Form */}
      {showCreateForm && (
        <div className="bg-slate-850 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🛡️</span> Create New System User
          </h4>
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newUserForm.name}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, name: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                System Role
              </label>
              <select
                value={newUserForm.role}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, role: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="Customer">Customer</option>
                <option value="Dealer">Dealer</option>
                <option value="Supplier">Supplier</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={newUserForm.phone}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, phone: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Address / Depot Hub (Optional)
              </label>
              <input
                type="text"
                value={newUserForm.address}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, address: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                placeholder="Terminal 4, Sector 7"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingUser}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {creatingUser ? "Registering..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">System Accounts</h3>
            <p className="text-xs text-slate-400">Total registered system actors: {users.length}</p>
          </div>
        </div>

        {loadingUsers ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">No users found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{u.phone || "—"}</td>
                    <td className="p-3 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditUser(u)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold text-[11px] transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-semibold text-[11px] transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
