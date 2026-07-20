import React from 'react';

export default function FAQ() {
  const faqs = [
    {
      q: 'Can I onboard existing tenants?',
      a: 'Yes. Prope allows you to link existing tenants by entering their email profile and assigning them a custom Wema/Sterling bank virtual account reference. Any subsequent transfers they make will immediately trigger reconciliation.'
    },
    {
      q: 'Does Prope manage escrow settlements?',
      a: 'Absolutely. House purchase funds are held in a secure virtual account. Once the buyer checks the property and authorizes release, the funds are instantly disbursed to the landlord. If rejected, the funds are routed back to the buyer.'
    },
    {
      q: 'Can I reconcile payments automatically?',
      a: 'Yes. Every incoming transaction to a reserved virtual account invokes our reconciliation engine, which validates signatures, checks locks, matches accounts, recalculates due amounts, and registers payment receipts.'
    },
    {
      q: 'How do I get started?',
      a: 'Register an account in the Prope Dashboard, select your role (Landlord or Tenant), and begin listing properties or claiming agreements in minutes. All connections leverage our real sandbox API environment.'
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 md:px-16 lg:px-24 bg-slate-900 border-t border-slate-950 text-slate-100 relative">
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mx-auto max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Frequently asked questions</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">
            Answers for property managers and tenants.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {faqs.map(({ q, a }) => (
            <div 
              key={q} 
              className="rounded-2xl border border-slate-800 bg-slate-950/30 p-8 shadow-md hover:border-slate-700/60 transition-all duration-300 text-left"
            >
              <h3 className="text-base font-bold text-slate-200">{q}</h3>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
