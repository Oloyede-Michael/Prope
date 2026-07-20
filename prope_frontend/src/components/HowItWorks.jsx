import React from 'react';
import { UserCheck, RefreshCw, Landmark } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: UserCheck,
      title: 'Provision accounts',
      desc: 'Link properties, register landlords, and instantiate unique virtual accounts per tenant via Monnify APIs.'
    },
    {
      num: '02',
      icon: RefreshCw,
      title: 'Collect & reconcile',
      desc: 'Reconcile rent payments automatically when tenants pay. Our system updates balances and advances next due dates in real-time.'
    },
    {
      num: '03',
      icon: Landmark,
      title: 'Disburse settlements',
      desc: 'Initiate payouts directly to landlords upon verified escrow release, or execute automated customer bank refunds.'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-6 md:px-16 lg:px-24 bg-slate-900 border-y border-slate-950 text-slate-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mx-auto max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">
            From onboarding to settlement in three automated steps.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Prope abstracts the complexities of transaction lifecycle, banking validations, and ledger adjustments so you can focus on scale.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map(({ num, icon: Icon, title, desc }) => (
            <div 
              key={num} 
              className="group relative rounded-2xl border border-slate-800 bg-slate-950/40 p-8 shadow-xl backdrop-blur-sm hover:border-indigo-500/30 hover:bg-slate-950/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 tracking-wider group-hover:text-indigo-500/50 transition-colors">
                    STEP {num}
                  </span>
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-lg font-bold text-slate-200">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
