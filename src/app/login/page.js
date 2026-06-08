"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Listen to physical keyboard events as well
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLoading) return;
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, isLoading]);

  const handleLogin = async (enteredPin) => {
    const currentPin = enteredPin || pin;
    if (!currentPin) return;
    
    setIsLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      pin: currentPin,
      redirect: false,
    });
    
    if (res?.error) {
      setError("Invalid PIN. Please try again.");
      setIsLoading(false);
      setPin("");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  function handleKeyPress(digit) {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  }

  function handleClear() {
    setPin("");
    setError("");
  }

  function handleBackspace() {
    setPin(pin.slice(0, -1));
  }

  const handleFrontlineAccess = async () => {
    setIsLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      frontline: "true",
      redirect: false,
    });
    
    if (res?.error) {
      setError("Failed to access Frontline dashboard.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[32px] shadow-2xl p-8 relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-2xl leading-none">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">RVR Command Center</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Security Portal</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex gap-4 justify-center items-center h-12 mb-3">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index}
                className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                  pin.length > index 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-transparent scale-125 shadow-md shadow-indigo-500/50" 
                    : "border-slate-700 bg-transparent"
                }`}
              />
            ))}
          </div>
          
          {error ? (
            <p className="text-rose-400 text-xs font-medium animate-shake text-center">{error}</p>
          ) : (
            <p className="text-slate-500 text-xs">
              {isLoading ? "Unlocking dashboard..." : "Enter 4-digit security PIN"}
            </p>
          )}
        </div>

        {/* Visual Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-[280px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isLoading}
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-600/5 active:scale-95 transition-all text-xl font-semibold text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {digit}
            </button>
          ))}
          
          {/* Backspace */}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-slate-900/30 border border-transparent hover:border-slate-800 hover:bg-slate-800/40 active:scale-95 transition-all text-slate-400 flex items-center justify-center disabled:opacity-30 select-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414A2 2 0 0010.828 19H20a2 2 0 002-2V7a2 2 0 00-2-2h-9.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>

          {/* 0 */}
          <button
            key="0"
            type="button"
            disabled={isLoading}
            onClick={() => handleKeyPress("0")}
            className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-600/5 active:scale-95 transition-all text-xl font-semibold text-white flex items-center justify-center disabled:opacity-50 select-none"
          >
            0
          </button>

          {/* Clear */}
          <button
            type="button"
            disabled={isLoading || pin.length === 0}
            onClick={handleClear}
            className="w-16 h-16 rounded-full bg-slate-900/30 border border-transparent hover:border-slate-800 hover:bg-slate-800/40 active:scale-95 transition-all text-xs font-semibold text-slate-400 flex items-center justify-center disabled:opacity-30 select-none"
          >
            CLEAR
          </button>
        </div>

        {/* Frontline Quick Access */}
        <div className="pt-6 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Or Quick Access</p>
          <button
            onClick={handleFrontlineAccess}
            disabled={isLoading}
            className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 rounded-2xl py-3.5 text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 select-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Unlock Frontline Staff View
          </button>
        </div>

      </div>
    </div>
  );
}
