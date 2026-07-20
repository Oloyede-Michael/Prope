import React from 'react';

export default function Navbar({ onGetStarted }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="font-mono tracking-wider font-bold text-lg text-slate-100 uppercase">
            AcreWise
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#how-it-works" className="hover:text-indigo-400 transition-colors duration-200">How it works</a>
          <a href="#why-acrewise" className="hover:text-indigo-400 transition-colors duration-200">Why AcreWise</a>
          <a href="#faq" className="hover:text-indigo-400 transition-colors duration-200">FAQ</a>
        </nav>

        <button 
          onClick={onGetStarted} 
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg tracking-wide uppercase transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}
