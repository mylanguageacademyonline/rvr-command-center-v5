"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    const toastId = toast.loading("Generating Excel file...");

    try {
      const response = await fetch("/api/export/vendors", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Convert response to blob
      const blob = await response.blob();
      
      // Create a temporary link element to trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Vendor_Ledger_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel file downloaded successfully!", { id: toastId, duration: 4000 });
    } catch (error) {
      console.error("Export Error:", error);
      toast.error(`Export Failed: ${error?.message ?? "Network error"}`, { id: toastId, duration: 5000 });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
        isExporting 
          ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50"
      }`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export to Excel
        </>
      )}
    </button>
  );
}
