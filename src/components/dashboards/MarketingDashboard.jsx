import LogoutButton from "./LogoutButton";

export default function MarketingDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 right-8">
        <LogoutButton />
      </div>
      
      <div className="text-center mb-12">
        <div className="w-24 h-24 mx-auto bg-fuchsia-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_-10px_rgba(192,38,211,0.5)]">
          <svg className="w-12 h-12 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Marketing Analytics</h1>
        <p className="text-gray-400 max-w-md mx-auto">Track conversion rates, campaign ROI, and client acquisition metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-bl-full"></div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Leads Generated</h3>
          <p className="text-4xl font-bold text-white">4,209</p>
          <p className="text-emerald-400 text-xs font-medium mt-2">+14% this month</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-bl-full"></div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Conversion Rate</h3>
          <p className="text-4xl font-bold text-white">18.5%</p>
          <p className="text-emerald-400 text-xs font-medium mt-2">+2.4% this month</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-bl-full"></div>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Active Campaigns</h3>
          <p className="text-4xl font-bold text-white">3</p>
          <p className="text-gray-500 text-xs font-medium mt-2">Running steadily</p>
        </div>
      </div>
    </div>
  );
}
