"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import LogoutButton from "./LogoutButton";

export default function HeadChefDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error("Failed to fetch menu");
      const json = await res.json();
      setMenuItems(json?.data ?? []);
    } catch (error) {
      console.error(error);
      setIsError(true);
      toast.error("Failed to load the master menu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 text-gray-800">
        <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-gray-200 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-gray-800">Menu & Recipes</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : isError ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 shadow-sm text-center">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold">Connection Failed</h3>
              <button onClick={fetchMenu} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium">
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Master Menu Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-medium">Menu Item</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium text-right">Price Per Pax (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {menuItems?.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-400">No menu items configured.</td>
                      </tr>
                    ) : (
                      menuItems?.map((item) => (
                        <tr key={item?._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-800">{item?.menuName}</td>
                          <td className="px-6 py-4 text-gray-600 max-w-md truncate">{item?.description || "N/A"}</td>
                          <td className="px-6 py-4 font-medium text-right text-emerald-600">₹{item?.pricePerPax?.toLocaleString() || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
