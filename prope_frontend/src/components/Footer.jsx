import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E0D5]/80 bg-[#FAF8F5] px-6 py-12 text-stone-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full"></div>
            <span className="font-serif tracking-wider font-extrabold text-sm text-stone-900 uppercase">
              Prope
            </span>
          </div>
          <p className="text-[10px] text-stone-500 font-mono">
            &copy; {new Date().getFullYear()} Prope. Built on Supabase, Upstash, and Monnify Sandbox APIs.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase font-bold">
            Platform Integrations
          </span>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-2.5 py-1 bg-white/60 border border-[#E5E0D5] rounded-lg font-mono text-[9px] text-stone-600 font-semibold uppercase tracking-wider">
              Monnify API
            </span>
            <span className="px-2.5 py-1 bg-white/60 border border-[#E5E0D5] rounded-lg font-mono text-[9px] text-stone-600 font-semibold uppercase tracking-wider">
              PostgreSQL Core
            </span>
            <span className="px-2.5 py-1 bg-white/60 border border-[#E5E0D5] rounded-lg font-mono text-[9px] text-stone-600 font-semibold uppercase tracking-wider">
              Redis Lock
            </span>
            <span className="px-2.5 py-1 bg-white/60 border border-[#E5E0D5] rounded-lg font-mono text-[9px] text-stone-600 font-semibold uppercase tracking-wider">
              GraphQL SDL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
