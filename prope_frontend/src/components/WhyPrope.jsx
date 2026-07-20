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
    <section id="why-prope" className="py-24 px-6 md:px-16 lg:px-24 bg-[#FAF8F5] text-stone-800 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C5A059]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center relative z-10">
        <div className="space-y-6 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B8934C]">Why Prope</p>
          <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-stone-900 leading-tight">
            Designed for modern landlords and property operators.
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            We replace scattered invoices, offline banking transfers, and spreadsheet calculations with a unified platform for payment routing and property reconciliation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, desc }) => (
            <div 
              key={title} 
              className="rounded-3xl border border-white bg-white/60 p-6 hover:border-[#C5A059]/40 hover:bg-white transition-all duration-300 shadow-sm flex flex-col items-start gap-4 text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#B8934C]">
                <Icon className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold font-serif text-stone-850">{title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
