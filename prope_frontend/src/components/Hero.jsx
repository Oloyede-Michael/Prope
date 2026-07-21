import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative pt-12 pb-24 px-6 md:px-16 lg:px-24 bg-[#FAF8F5] text-stone-800 overflow-hidden">
      {/* Decorative Warm Soft Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C5A059]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#B8934C]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid gap-16 lg:grid-cols-2 items-center relative z-10">
        <div className="space-y-8 text-left">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/80 text-[#B8934C] text-[10px] font-bold uppercase tracking-[0.15em] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
            Built for Monnify Property Payments
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-[1.1] text-stone-900">
              Luxury real estate <span className="text-[#C5A059]">escrow</span> and rent automation.
            </h1>
            <p className="text-base md:text-lg text-stone-600 max-w-xl leading-relaxed">
              Prope blends virtual account orchestration, payment reconciliation, and tenant billing into a single unified workspace. Turn payment friction into operational clarity.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-[#C5A059] hover:bg-[#B8934C] text-white font-bold text-sm uppercase rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#C5A059]/10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <a 
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-[#E5E0D5] bg-white/60 hover:bg-white rounded-xl text-sm font-bold text-stone-650 transition-all duration-300 active:scale-95"
            >
              See Demo
            </a>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-4">
            <div className="rounded-2xl bg-white/60 border border-white/80 px-4 py-5 shadow-xs backdrop-blur-xs hover:border-[#C5A059]/40 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8934C]">Speed</p>
              <p className="mt-2 text-xs font-bold text-stone-800 leading-snug">Monnify account creation in seconds</p>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/80 px-4 py-5 shadow-xs backdrop-blur-xs hover:border-[#C5A059]/40 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8934C]">Scale</p>
              <p className="mt-2 text-xs font-bold text-stone-800 leading-snug">Multi-tenant claims and bulk payouts</p>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/80 px-4 py-5 shadow-xs backdrop-blur-xs hover:border-[#C5A059]/40 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8934C]">Visibility</p>
              <p className="mt-2 text-xs font-bold text-stone-800 leading-snug">Real-time payment and payout status</p>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/80 px-4 py-5 shadow-xs backdrop-blur-xs hover:border-[#C5A059]/40 transition-all duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8934C]">Security</p>
              <p className="mt-2 text-xs font-bold text-stone-800 leading-snug">Audit-ready escrow settlements</p>
            </div>
          </div>
        </div>

        {/* Right Graphic column - Luxury Mockup Invoice & Escrow Widget */}
        <div className="relative w-full">
          <div className="absolute inset-0 rounded-[2rem] bg-[#C5A059]/5 blur-3xl" />
          
          {/* Main Transaction Glass Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white bg-white/65 backdrop-blur-md p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex justify-between items-start border-b border-[#E5E0D5]/60 pb-4">
              <div className="space-y-1 text-left">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">PROPE SECURE DEPOSIT</span>
                <h4 className="text-sm font-bold font-serif text-stone-850">The Obsidian Penthouse</h4>
                <p className="text-[10px] text-[#B8934C] font-mono">Banana Island, Lagos</p>
              </div>
              <span className="px-2.5 py-1 text-[8px] font-bold font-mono tracking-wider rounded-lg bg-[#C5A059]/10 text-[#B8934C] uppercase">Escrow Custody</span>
            </div>

            {/* Spec Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5]/85 border border-[#E5E0D5]/60 p-3.5 rounded-xl text-left">
              <div>
                <span className="text-[8px] text-stone-400 font-mono block uppercase font-bold">Beds</span>
                <span className="text-xs font-bold text-stone-750">5 Bedrooms</span>
              </div>
              <div className="border-l border-[#E5E0D5]/60 pl-3">
                <span className="text-[8px] text-stone-400 font-mono block uppercase font-bold">Baths</span>
                <span className="text-xs font-bold text-stone-750">6 Baths</span>
              </div>
              <div className="border-l border-[#E5E0D5]/60 pl-3">
                <span className="text-[8px] text-stone-400 font-mono block uppercase font-bold">Built</span>
                <span className="text-xs font-bold text-stone-750">Year 2024</span>
              </div>
            </div>

            {/* Financial Ledger Details */}
            <div className="space-y-3.5 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-mono">Agreed Acquisition Price</span>
                <span className="font-mono font-bold text-stone-800">₦1,850,000,000.00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-mono">Monnify Virtual Settlement Account</span>
                <span className="font-mono font-bold text-stone-750">9920148810 (Sterling Bank)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-[#E5E0D5]/60 pt-3">
                <span className="text-stone-600 font-bold">Escrow Ledger Status</span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-emerald-500/10 text-emerald-800 uppercase">100% Reconciled</span>
              </div>
            </div>
          </div>
          
          {/* Highlights Widget overlay */}
          <div className="mt-6 rounded-3xl border border-white bg-white/45 p-6 shadow-md backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B8934C] text-left">Prope Core Engine Highlights</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/60 p-4 border border-[#E5E0D5]/60 text-left">
                <p className="text-xs font-bold text-[#B8934C] font-serif">Automated Receipts</p>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">Instant payment tracking with cryptographically verified receipts on the fly.</p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 border border-[#E5E0D5]/60 text-left">
                <p className="text-xs font-bold text-[#B8934C] font-serif">Reconciliation Engine</p>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">Assign reserved account numbers to automatically reconcile leases and escrows.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
