import React from 'react';
import { ShieldAlert, Terminal, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TestModeBadge: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between shadow-sm z-50">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="font-bold tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded text-[10px]">
            ICICI Gateway Sandbox
          </span>
          <span className="hidden sm:inline text-amber-100">
            Active Test Mode • Instant checkout without login
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dev/transactions"
            className="flex items-center gap-1 hover:text-amber-200 underline decoration-amber-300 underline-offset-2 transition"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Inspector</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
