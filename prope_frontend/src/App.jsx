import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Onboarding from './components/Onboarding.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, onboarding, dashboard
  const [loggedInEmail, setLoggedInEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('acrewise_logged_in_email') || '';
    }
    return '';
  });

  function navigateTo(view, path) {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
    }
    if (view === 'login') {
      setCurrentView('onboarding');
    } else {
      setCurrentView(view);
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewFromPath = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') {
        if (loggedInEmail) {
          setCurrentView('dashboard');
        } else {
          navigateTo('onboarding', '/auth');
        }
      } else if (path === '/auth') {
        if (loggedInEmail) {
          navigateTo('dashboard', '/dashboard');
        } else {
          setCurrentView('onboarding');
        }
      } else {
        setCurrentView('landing');
      }
    };
    updateViewFromPath();
    window.addEventListener('popstate', updateViewFromPath);
    return () => window.removeEventListener('popstate', updateViewFromPath);
  }, [loggedInEmail]);

  function handleOnboardingComplete(email) {
    setLoggedInEmail(email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('acrewise_logged_in_email', email);
    }
    navigateTo('dashboard', '/dashboard');
  }

  function handleSignOut() {
    setLoggedInEmail('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('acrewise_logged_in_email');
    }
    navigateTo('landing', '/');
  }

  if (currentView === 'landing') {
    return <LandingPage navigateTo={(view, path) => navigateTo(view, path)} />;
  }

  if (currentView === 'onboarding') {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete} 
        onCancel={() => navigateTo('landing', '/')} 
      />
    );
  }

  return (
    <Dashboard 
      userEmail={loggedInEmail}
      onSignOut={handleSignOut} 
    />
  );
}
