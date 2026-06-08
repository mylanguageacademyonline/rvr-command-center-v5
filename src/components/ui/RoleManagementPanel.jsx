"use client";
import { useState } from "react";
import toast from "react-hot-toast";

const AVAILABLE_PERMISSIONS = [
  { id: "ACCESS_MASTER_CONTROL", label: "Master Control (Users & Roles)" },
  { id: "ACCESS_IN_OUT", label: "Frontline Actions (IN/OUT)" },
  { id: "ACCESS_KITCHEN_LEDGER", label: "Kitchen Ledger" },
  { id: "ACCESS_BOM", label: "BoM Calculator" },
  { id: "ACCESS_QUOTES", label: "Active Quotes & Generation" },
  { id: "ACCESS_VENDORS", label: "Vendor Ledger" }
];

export default function RoleManagementPanel({ initialRoles }) {
  const [roles, setRoles] = useState(initialRoles ?? []);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState([]);

  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editPerms, setEditPerms] = useState([]);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return toast.error("Role name is required");
    
    const toastId = toast.loading("Creating role...");
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName, permissions: newRolePerms })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");
      
      toast.success("Role created!", { id: toastId });
      setRoles([...roles, json.data]);
      setIsCreating(false);
      setNewRoleName("");
      setNewRolePerms([]);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleUpdateRole = async (roleId) => {
    const toastId = toast.loading("Updating role...");
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId, permissions: editPerms })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update");
      
      toast.success("Role updated!", { id: toastId });
      setRoles(roles.map(r => r._id === roleId ? json.data : r));
      setEditingRoleId(null);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role? Users assigned to this role will lose access.")) return;

    const toastId = toast.loading("Deleting role...");
    try {
      const res = await fetch(`/api/admin/roles?roleId=${roleId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");
      
      toast.success("Role deleted!", { id: toastId });
      setRoles(roles.filter(r => r._id !== roleId));
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const togglePerm = (perm, currentArray, setArrayFn) => {
    if (currentArray.includes(perm)) {
      setArrayFn(currentArray.filter(p => p !== perm));
    } else {
      setArrayFn([...currentArray, perm]);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-lg mb-8">
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
        <h3 className="font-semibold text-white">Custom Roles & Permissions Engine</h3>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {isCreating ? "Cancel" : "+ Create Custom Role"}
        </button>
      </div>

      <div className="p-6">
        {isCreating && (
          <div className="mb-8 p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-xl">
            <h4 className="text-indigo-400 font-bold mb-4">Define New Role</h4>
            <input 
              type="text" 
              placeholder="e.g. Prep Cook, Bar Manager" 
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full max-w-sm bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {AVAILABLE_PERMISSIONS.map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800/50">
                  <input 
                    type="checkbox" 
                    checked={newRolePerms.includes(p.id)} 
                    onChange={() => togglePerm(p.id, newRolePerms, setNewRolePerms)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900"
                  />
                  <span className="text-sm text-slate-300">{p.label}</span>
                </label>
              ))}
            </div>
            <button 
              onClick={handleCreateRole}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg"
            >
              Save New Role
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => {
            const isEditing = editingRoleId === role._id;
            const currentPerms = isEditing ? editPerms : role.permissions;

            return (
              <div key={role._id} className="border border-slate-800 bg-slate-950/50 rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-slate-200 text-lg">{role.name}</h4>
                  {!isEditing && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingRoleId(role._id); setEditPerms(role.permissions); }} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                      <button onClick={() => handleDeleteRole(role._id)} className="text-xs text-rose-500 hover:text-rose-400">Delete</button>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 mb-4 space-y-1">
                  {AVAILABLE_PERMISSIONS.map(p => {
                    const hasPerm = currentPerms.includes(p.id);
                    if (!isEditing && !hasPerm) return null;
                    return (
                      <label key={p.id} className={`flex items-center gap-2 ${isEditing ? 'cursor-pointer p-1 rounded hover:bg-slate-800/50' : ''}`}>
                        {isEditing && (
                          <input 
                            type="checkbox" 
                            checked={hasPerm}
                            onChange={() => togglePerm(p.id, editPerms, setEditPerms)}
                          />
                        )}
                        {!isEditing && <span className="text-emerald-500 text-xs">✓</span>}
                        <span className={`text-xs ${hasPerm ? 'text-slate-300' : 'text-slate-600'}`}>{p.label}</span>
                      </label>
                    );
                  })}
                  {!isEditing && role.permissions.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No permissions assigned</span>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleUpdateRole(role._id)} className="flex-1 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold">Save</button>
                    <button onClick={() => setEditingRoleId(null)} className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded text-xs font-bold">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
