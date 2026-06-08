import LogoutButton from "./LogoutButton";

export default function SupportDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 right-8">
        <LogoutButton />
      </div>
      
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_-10px_rgba(37,99,235,0.5)]">
          <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Support & Diagnostics</h1>
        <p className="text-gray-400 max-w-md mx-auto">Monitor system health, resolve technical tickets, and oversee system uptimes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Core Engines</h2>
          <p className="text-emerald-400 text-sm font-medium mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All systems operational
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">BoM Generator Engine</span>
              <span className="text-white font-mono">99.9% Uptime</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Auto-Deplete Engine</span>
              <span className="text-white font-mono">99.9% Uptime</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Database Shards</span>
              <span className="text-white font-mono">99.9% Uptime</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Active Support Tickets</h2>
          <p className="text-gray-400 text-sm font-medium mb-6">No pending issues.</p>
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl">
             <span className="text-gray-500">Inbox Zero 🎉</span>
          </div>
        </div>
      </div>
    </div>
  );
}
