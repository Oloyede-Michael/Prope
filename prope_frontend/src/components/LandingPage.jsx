import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import Hero from './Hero.jsx';
import HowItWorks from './HowItWorks.jsx';
import WhyPrope from './WhyPrope.jsx';
import FAQ from './FAQ.jsx';
import Footer from './Footer.jsx';
import Marketplace from './Marketplace.jsx';

export default function LandingPage({ navigateTo }) {
  const [showMarketplace, setShowMarketplace] = useState(false);

  const handleGetStarted = () => {
    navigateTo('login', '/auth');
  };

  const handleRentOrBuy = (property) => {
    alert(`To rent or purchase "${property.title}" via Monnify payment, please sign up or log in first.`);
    navigateTo('login', '/auth');
  };

  return (
    <div className="min-h-screen text-stone-850 flex flex-col justify-between font-sans relative overflow-x-hidden bg-[#FAF8F5]">
      <Navbar 
        onGetStarted={handleGetStarted} 
        onBrowseMarketplace={(show) => setShowMarketplace(show)} 
      />
      
      <main className="flex-grow">
        {showMarketplace ? (
          <Marketplace 
            onClose={() => setShowMarketplace(false)} 
            onRent={handleRentOrBuy}
            onBuy={handleRentOrBuy}
          />
        ) : (
          <>
            <Hero onGetStarted={() => setShowMarketplace(true)} />
            <HowItWorks />
            <WhyPrope />
            <FAQ />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

