'use client';
import { useRouter } from 'next/navigation';

export default function FrontlineDashboard() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-950 text-white rounded-2xl border border-gray-800 shadow-xl max-w-2xl mx-auto mt-12">
      <h2 className="text-3xl font-bold mb-4 text-blue-400">Frontline Operations</h2>
      <p className="text-gray-400 mb-8 text-center">
        Select an operation below to log transactions into the system. All transactions are securely recorded with atomic database precision.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <button 
          onClick={() => router.push('/dashboard/in')}
          className="flex flex-col items-center justify-center p-6 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700/50 rounded-xl transition-all hover:scale-105"
        >
          <span className="text-2xl font-black text-indigo-300 mb-2">IN</span>
          <span className="text-sm text-indigo-200/70">Receive Goods</span>
        </button>
        
        <button 
          onClick={() => router.push('/dashboard/out')}
          className="flex flex-col items-center justify-center p-6 bg-orange-900/40 hover:bg-orange-800/60 border border-orange-700/50 rounded-xl transition-all hover:scale-105"
        >
          <span className="text-2xl font-black text-orange-300 mb-2">OUT</span>
          <span className="text-sm text-orange-200/70">Dispatch/Waste</span>
        </button>

        <button 
          onClick={() => router.push('/dashboard/paid')}
          className="flex flex-col items-center justify-center p-6 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 rounded-xl transition-all hover:scale-105"
        >
          <span className="text-2xl font-black text-emerald-300 mb-2">PAID</span>
          <span className="text-sm text-emerald-200/70">Log Expenses</span>
        </button>
      </div>
    </div>
  );
}