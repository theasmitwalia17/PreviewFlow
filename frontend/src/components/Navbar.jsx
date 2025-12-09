import React from "react";
import { Layout } from "lucide-react";

export default function Navbar() {
  const handleLogin = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 font-bold text-lg tracking-tight cursor-pointer" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="p-1.5 bg-black text-white rounded-md">
            <Layout size={16} />
          </div>
          PreviewFlow
        </div>

        {/* Links & Login */}
        <div className="flex items-center gap-6">
          <a href="#" className="hidden sm:block text-sm font-medium text-neutral-500 hover:text-black transition-colors">Features</a>
          <a href="#" className="hidden sm:block text-sm font-medium text-neutral-500 hover:text-black transition-colors">Pricing</a>
          <button 
            onClick={handleLogin}
            className="text-sm font-semibold px-4 py-2 bg-black text-white rounded-full hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
          >
            Log In
          </button>
        </div>
      </div>
    </nav>
  );
}