import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-6 py-12 text-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
            <span className="font-mono tracking-wider font-bold text-sm text-slate-350 uppercase">
              AcreWise
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} AcreWise. Built on Supabase, Upstash, and Monnify Sandbox APIs.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Platform Integrations
          </span>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              Monnify API
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              PostgreSQL Core
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              Redis Lock
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              GraphQL SDL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
