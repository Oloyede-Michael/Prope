import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Activity, Zap, Compass } from 'lucide-react';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative pt-12 pb-24 px-6 md:px-16 lg:px-24 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Decorative Radial Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid gap-16 lg:grid-cols-2 items-center relative z-10">
        <div className="space-y-8 text-left">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold uppercase tracking-[0.15em] shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Built for Monnify Property Payments
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400">
              One platform for escrow, rent automation, and landlord finance.
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
              Prope blends virtual account orchestration, payment reconciliation, and tenant billing into a single unified workspace. Turn payment friction into operational clarity.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onGetStarted} 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#how-it-works" 
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 rounded-xl text-sm font-semibold text-slate-355 transition-all duration-300 active:scale-95"
            >
              See how it works
            </a>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-4">
            <div className="rounded-2xl bg-slate-900/40 border border-slate-900/80 px-4 py-5 shadow-lg backdrop-blur-sm hover:border-slate-800 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Speed</p>
              <p className="mt-2 text-xs font-semibold text-slate-300 leading-snug">Monnify account creation in seconds</p>
            </div>
            <div className="rounded-2xl bg-slate-900/40 border border-slate-900/80 px-4 py-5 shadow-lg backdrop-blur-sm hover:border-slate-800 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Scale</p>
              <p className="mt-2 text-xs font-semibold text-slate-300 leading-snug">Multi-tenant claims and bulk payouts</p>
            </div>
            <div className="rounded-2xl bg-slate-900/40 border border-slate-900/80 px-4 py-5 shadow-lg backdrop-blur-sm hover:border-slate-800 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Visibility</p>
              <p className="mt-2 text-xs font-semibold text-slate-300 leading-snug">Real-time payment and payout status</p>
            </div>
            <div className="rounded-2xl bg-slate-900/40 border border-slate-900/80 px-4 py-5 shadow-lg backdrop-blur-sm hover:border-slate-800 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Security</p>
              <p className="mt-2 text-xs font-semibold text-slate-300 leading-snug">Audit-ready escrow settlements</p>
            </div>
          </div>
        </div>

        {/* Right Graphic column */}
        <div className="relative w-full">
          <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl shadow-indigo-950/20 bg-slate-900">
            <img 
              src="/dashboard_preview.jpg" 
              alt="Prope dashboard preview" 
              className="w-full h-auto object-cover min-h-[300px] select-none pointer-events-none opacity-90" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          </div>
          
          {/* Highlights Widget overlay */}
          <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live platform highlights</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-900">
                <p className="text-xs font-bold text-slate-200">Automated Receipts</p>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">Instant payment tracking with cryptographically verified receipts.</p>
              </div>
              <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-900">
                <p className="text-xs font-bold text-slate-200">Reconciliation Engine</p>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">Assign reserved account numbers to automatically reconcile leases.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
