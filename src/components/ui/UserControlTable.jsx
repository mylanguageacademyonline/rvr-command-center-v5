"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UserControlTable({ initialUsers, availableRoles = [] }) {
  const [users, setUsers] = useState(initialUsers ?? []);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (userId, updates) => {
    const toastId = toast.loading("Updating user permissions...");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (!res.ok) throw new Error("Failed to update user");
      
      const json = await res.json();
      if (json?.success) {
        toast.success(`User updated successfully!`, { id: toastId });
        setUsers(users.map(u => u._id === userId ? { ...u, ...updates } : u));
        setEditingUserId(null);
      } else {
        throw new Error(json?.error ?? "Unknown error");
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/80">
        <h3 className="font-semibold text-white">SaaS Tenant Access Control (Master Auth)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/40 text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Google Account (Email)</th>
              <th className="px-6 py-4 font-medium">Assigned Role</th>
              <th className="px-6 py-4 font-medium text-center">Master Approval</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map((user) => {
              const isEditing = editingUserId === user._id;
              return (
                <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-200">{user.email}</td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-sm"
                        >
                          <option value="">Select a role...</option>
                          <option value="Pending">Pending (No Access)</option>
                          <option value="AgencyMaster">AgencyMaster (SuperAdmin)</option>
                          {availableRoles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                        </select>
                        <button
                          onClick={() => handleUpdate(user._id, { role: selectedRole })}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-300 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-md text-xs">
                          {user.role}
                        </span>
                        <button
                          onClick={() => { setEditingUserId(user._id); setSelectedRole(user.role); }}
                          className="text-xs text-indigo-400 hover:underline"
                        >
                          Edit Role
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleUpdate(user._id, { isApproved: !user.isApproved })}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        user.isApproved 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                      }`}
                    >
                      {user.isApproved ? 'Approved (Active)' : 'Pending (Locked)'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleUpdate(user._id, { subscriptionActive: !user.subscriptionActive })}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {user.subscriptionActive ? 'Suspend Client' : 'Activate Client'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
