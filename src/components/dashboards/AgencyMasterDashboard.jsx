import ExportButton from "../ui/ExportButton";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import Role from "@/models/Role";
import UserControlTable from "../ui/UserControlTable";
import RoleManagementPanel from "../ui/RoleManagementPanel";

export default async function AgencyMasterDashboard({ searchParams }) {
  await dbConnect();

  const tab = searchParams?.tab || "overview";

  // Shared Data
  const totalUsers = await User.countDocuments();
  const lowStockCount = await Inventory.countDocuments({ $expr: { $lte: ["$currentStock", "$minStock"] } });
  
  // Tab: Overview Data
  let recentActivity = [];
  if (tab === "overview") {
    recentActivity = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // Tab: Vendors Data
  let vendors = [];
  let totalOutstanding = 0;
  if (tab === "vendors") {
    vendors = await Vendor.find({}).sort({ balanceDue: -1 }).lean();
    totalOutstanding = vendors.reduce((acc, curr) => acc + (curr.balanceDue > 0 ? curr.balanceDue : 0), 0);
  }

  // Tab: Users (SaaS Controls) Data
  let usersList = [];
  let rolesList = [];
  if (tab === "users") {
    usersList = await User.find({}).sort({ role: 1 }).lean();
    usersList = usersList.map(u => ({ ...u, _id: u._id.toString() }));

    rolesList = await Role.find({}).sort({ name: 1 }).lean();
    rolesList = rolesList.map(r => ({ ...r, _id: r._id.toString() }));
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative text-gray-200">
      {/* Visual background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="h-20 flex items-center justify-between px-8 border-b border-gray-800/50 backdrop-blur-md z-10">
        <h2 className="text-xl font-semibold text-white capitalize">
          {tab === 'vendors' ? 'Vendor Ledger' : tab === 'users' ? 'User Registry & SaaS Controls' : 'Dashboard Overview'}
        </h2>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Engines Online
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 z-10 bg-[#0B0F19]">
        
        {tab === "overview" && (
          <>
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium">Total Registered Users</h3>
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">{totalUsers}</div>
                <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1 font-medium">Active staff accounts</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium">Low Stock Alerts</h3>
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">{lowStockCount}</div>
                <p className="text-rose-400 text-sm mt-2 flex items-center gap-1 font-medium">Items below minimum stock</p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium">System Health</h3>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">99.9%</div>
                <p className="text-gray-400 text-sm mt-2 flex items-center gap-1 font-medium">Core Engines operational</p>
              </div>
            </div>

            {/* Database Oversight Table */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
                <h3 className="font-semibold text-white">Live Transaction Ledger</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900/40 text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Transaction ID</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Details</th>
                      <th className="px-6 py-4 font-medium text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No recent transactions found.</td>
                      </tr>
                    ) : recentActivity.map((log) => (
                      <tr key={log._id.toString()} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-400 text-xs font-mono">{log._id.toString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                            log.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400' : 
                            log.type === 'OUT' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{log.details}</td>
                        <td className="px-6 py-4 text-right text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "vendors" && (
          <>
            {/* Vendor Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-1">Total Outstanding Balance</h3>
                <div className="text-4xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</div>
                <p className="text-rose-400 text-sm mt-2 font-medium">Pending aggregate vendor payables</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-1">Active Vendors</h3>
                <div className="text-4xl font-bold text-white">{vendors.length}</div>
                <p className="text-emerald-400 text-sm mt-2 font-medium">Imported from Excel Database</p>
              </div>
            </div>

            {/* Vendor Ledger */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-5 border-b border-gray-800 bg-gray-900/80 flex justify-between items-center">
                <h3 className="font-semibold text-white">Vendor Directory & Balances</h3>
                <ExportButton />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900/40 text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Vendor Name</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium text-right">Balance Due (₹)</th>
                      <th className="px-6 py-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {vendors.map((v) => {
                      const hasDebt = v.balanceDue > 0;
                      return (
                        <tr key={v._id.toString()} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-200">{v.vendorName}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium border border-gray-700">
                              {v.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 font-bold text-right ${hasDebt ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ₹{v.balanceDue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              hasDebt ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {hasDebt ? 'Outstanding' : 'Cleared'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <RoleManagementPanel initialRoles={rolesList} />
            <UserControlTable initialUsers={usersList} availableRoles={rolesList} />
          </>
        )}

      </div>
    </main>
  );
}
