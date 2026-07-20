import React from 'react';

export default function Navbar({ onGetStarted, onBrowseMarketplace }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E0D5]/80 bg-[#FAF8F5]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onBrowseMarketplace && onBrowseMarketplace(false)}>
          <div className="w-3 h-3 bg-[#C5A059] rounded-full animate-pulse"></div>
          <span className="font-serif tracking-wider font-extrabold text-lg text-stone-900 uppercase">
            Prope
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
          <button 
            onClick={() => onBrowseMarketplace && onBrowseMarketplace(true)}
            className="hover:text-[#B8934C] transition-colors duration-200 cursor-pointer font-bold"
          >
            Marketplace
          </button>
          <a href="#how-it-works" className="hover:text-[#B8934C] transition-colors duration-200">How it works</a>
          <a href="#why-prope" className="hover:text-[#B8934C] transition-colors duration-200">Why Prope</a>
          <a href="#faq" className="hover:text-[#B8934C] transition-colors duration-200">FAQ</a>
        </nav>

        <button 
          onClick={onGetStarted} 
          className="px-5 py-2 bg-[#C5A059] hover:bg-[#B8934C] text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </header>
  );
}

