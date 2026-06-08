"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function InjectSheetButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleInjection = async () => {
    // 1. Defensive State Lock: Prevent double-clicks
    if (isLoading) return;
    
    setIsLoading(true);
    // 2. Visual Fallback: Toast notification informing user of background process
    const toastId = toast.loading("Fetching live data from Google Sheets...");

    try {
      const response = await fetch("/api/admin/inject-sheet", {
        method: "POST",
      });

      // 3. Defensive Response Check
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data?.success) {
        toast.success(`Success! Processed ${data?.vendorsProcessed ?? 0} vendors and ${data?.inventoryCreated ?? 0} inventory items.`, {
          id: toastId,
          duration: 5000,
        });
      } else {
        throw new Error(data?.error ?? "Unknown API failure");
      }
    } catch (error) {
      console.error("Injection Error:", error);
      // 4. Absolute Error Containment UI
      toast.error(`Injection Failed: ${error?.message ?? "Network error"}`, {
        id: toastId,
        duration: 5000,
      });
    } finally {
      // Always unlock the state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleInjection}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
        isLoading 
          ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50"
      }`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Sync Google Sheet
        </>
      )}
    </button>
  );
}
