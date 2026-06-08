"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function SalesDashboard({ searchParams }) {
  const tab = searchParams?.tab || "quotes";
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Quote Form State
  const [clientName, setClientName] = useState("");
  const [pax, setPax] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [advancePaid, setAdvancePaid] = useState("");
  const [status, setStatus] = useState("Draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tab === "quotes") {
      fetchQuotes();
    }
  }, [tab]);

  async function fetchQuotes() {
    try {
      setIsLoading(true);
      setIsError(false);
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const json = await res.json();
      setQuotes(json?.data ?? []);
    } catch (error) {
      console.error(error);
      setIsError(true);
      toast.error("Failed to load quotes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const updateQuoteStatus = async (quoteId, newStatus) => {
    const toastId = toast.loading("Updating status...");
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      const json = await res.json();
      if (json?.success) {
        toast.success("Quote status updated!", { id: toastId });
        fetchQuotes();
      } else {
        throw new Error(json?.error ?? "Unknown error");
      }
    } catch (error) {
      toast.error(`Error: ${error?.message ?? "Failed to update"}`, { id: toastId });
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    if (!clientName || !pax || !totalAmount) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating new quote...");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          pax: Number(pax),
          totalAmount: Number(totalAmount),
          advancePaid: Number(advancePaid || 0),
          status
        })
      });

      if (!res.ok) throw new Error("Failed to create quote");
      
      const json = await res.json();
      if (json?.success) {
        toast.success("Quote created successfully!", { id: toastId });
        // Clear form
        setClientName("");
        setPax("");
        setTotalAmount("");
        setAdvancePaid("");
        setStatus("Draft");
        // Redirect to quotes tab by changing location window (simulated tab switch)
        window.location.href = "/dashboard?tab=quotes";
      } else {
        throw new Error(json?.error ?? "Unknown error");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden text-gray-800 bg-gray-50">
      <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-gray-200 shadow-sm z-10">
        <h2 className="text-xl font-semibold text-gray-800">
          {tab === "new-quote" ? "Generate Quote & Invoice" : "Active Quotes Registry"}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        
        {tab === "quotes" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : isError ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 shadow-sm text-center">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold">Connection Failed</h3>
                <p className="mt-1">Unable to load quotes from the database.</p>
                <button 
                  onClick={fetchQuotes}
                  className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium">Client Name</th>
                        <th className="px-6 py-4 font-medium">Pax</th>
                        <th className="px-6 py-4 font-medium">Amount (₹)</th>
                        <th className="px-6 py-4 font-medium">Advance (₹)</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {quotes?.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                            No quotes found in the database.
                          </td>
                        </tr>
                      ) : (
                        quotes?.map((quote) => (
                          <tr key={quote?._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-800">{quote?.clientName || "Unknown"}</td>
                            <td className="px-6 py-4">{quote?.pax || 0}</td>
                            <td className="px-6 py-4 font-medium">₹{quote?.totalAmount?.toLocaleString() || 0}</td>
                            <td className="px-6 py-4">₹{quote?.advancePaid?.toLocaleString() || 0}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                quote?.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                quote?.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                quote?.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {quote?.status || "Draft"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select 
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={quote?.status || "Draft"}
                                onChange={(e) => updateQuoteStatus(quote?._id, e.target.value)}
                              >
                                <option value="Draft">Draft</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "new-quote" && (
          <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleCreateQuote} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client / Event Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Reliance Corporate Dinner"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Count (Pax) *</label>
                  <input
                    type="number"
                    required
                    value={pax}
                    onChange={(e) => setPax(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quote Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                >
                  <option value="Draft">Draft</option>
                  <option value="Confirmed">Confirmed (Lock Inventory)</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => window.location.href = "/dashboard?tab=quotes"}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-orange-500/10"
                >
                  {isSubmitting ? "Generating..." : "Save & Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
