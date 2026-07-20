import React from 'react';
import Navbar from './Navbar.jsx';
import Hero from './Hero.jsx';
import HowItWorks from './HowItWorks.jsx';
import WhyAcrewise from './WhyAcrewise.jsx';
import FAQ from './FAQ.jsx';
import Footer from './Footer.jsx';

export default function LandingPage({ navigateTo }) {
  const handleGetStarted = () => {
    navigateTo('login', '/auth');
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden bg-slate-950">
      <Navbar onGetStarted={handleGetStarted} />
      <main className="flex-grow">
        <Hero onGetStarted={handleGetStarted} />
        <HowItWorks />
        <WhyAcrewise />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
