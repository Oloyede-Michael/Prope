import React from 'react';
import { Layout, Shield, User, BarChart2 } from 'lucide-react';

export default function WhyPrope() {
  const points = [
    {
      icon: Layout,
      title: 'One dashboard for every rent flow',
      desc: 'Monitor rent collections, escrow holdings, utilities payment logs, and disbursement status in real-time.'
    },
    {
      icon: Shield,
      title: 'Compliance-ready records',
      desc: 'Maintain complete transaction histories, receipt records, and bank payout logs for audit and tax reporting.'
    },
    {
      icon: User,
      title: 'Tenant-first experience',
      desc: 'Simplify payment actions with persistent virtual accounts and immediately downloadable automated receipts.'
    },
    {
      icon: BarChart2,
      title: 'Engineered for scale',
      desc: 'Scale from ten to thousands of units with robust multi-threading background processes and concurrent locks.'
    }
  ];

  return (
    <section id="why-prope" className="py-24 px-6 md:px-16 lg:px-24 bg-slate-950 text-slate-100 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-650/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center relative z-10">
        <div className="space-y-6 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Why Prope</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 leading-tight">
            Designed for modern landlords and property operators.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            We replace scattered invoices, offline banking transfers, and spreadsheet calculations with a unified platform for payment routing and property reconciliation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, desc }) => (
            <div 
              key={title} 
              className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 hover:border-slate-800 hover:bg-slate-900/50 transition-all duration-300 shadow-md flex flex-col items-start gap-4 text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-200">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
