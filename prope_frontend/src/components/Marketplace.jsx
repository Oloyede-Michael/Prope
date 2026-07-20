import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, SlidersHorizontal, Grid, List, Map, Heart, Share2, 
  ChevronLeft, ChevronRight, X, Bed, Bath, Maximize, Calendar, 
  Calculator, User, Phone, Mail, FileText, CheckCircle2, ChevronDown, 
  MapPin, HelpCircle, Compass, ShieldCheck, Activity, Zap, Sparkles 
} from 'lucide-react';
import { LUXURY_PROPERTIES } from '../data/luxuryProperties.js';

export default function Marketplace({ userProfile, onRent, onBuy, onClose }) {
  // --- STATE ---
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'grid', 'list', 'split'
  const [currency, setCurrency] = useState('NGN'); // 'NGN', 'USD', 'EUR'
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState('ALL'); // 'ALL', 'RENT', 'SALE'
  const [selectedLocation, setSelectedLocation] = useState('ALL'); // 'ALL', 'Banana Island', 'Malibu', 'Aspen', 'Ikoyi', 'Lekki'
  const [selectedBeds, setSelectedBeds] = useState('ALL'); // 'ALL', '4', '5', '6'
  const [priceMax, setPriceMax] = useState(2000000000); // 2B NGN
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('prope_fav_properties')) || [];
    } catch {
      return [];
    }
  });

  // UI Interactive Links
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState({}); // { [propId]: index }
  
  // Share link copy confirmation
  const [copiedId, setCopiedId] = useState(null);

  // Detail Modal States
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'calculator', 'floorplan', 'tour'
  const [lightboxIndex, setLightboxIndex] = useState(null); // null or index of selected image
  const [floorPlanView, setFloorPlanView] = useState('2D'); // '2D', '3D'
  
  // Mortgage Calculator Inputs
  const [downPayment, setDownPayment] = useState(200000000); // Default 200M NGN
  const [interestRate, setInterestRate] = useState(8.5); // %
  const [loanTerm, setLoanTerm] = useState(25); // years
  
  // Tour Scheduling States
  const [selectedTourDate, setSelectedTourDate] = useState('Mon, Jul 20');
  const [selectedTourTime, setSelectedTourTime] = useState('10:00 AM');
  const [tourScheduled, setTourScheduled] = useState(false);

  // Refs for scrolling property cards on hover
  const propertyCardRefs = useRef({});

  // Auto-set down payment when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      setDownPayment(Math.round(selectedProperty.price * 0.2));
      setTourScheduled(false);
      setActiveTab('overview');
    }
  }, [selectedProperty]);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('prope_fav_properties', JSON.stringify(favorites));
  }, [favorites]);

  // --- HANDLERS ---
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleShare = (p, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/property/${p.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Carousel controls
  const handlePrevImage = (propId, imagesLength, e) => {
    e.stopPropagation();
    const curIndex = activeImageIndex[propId] || 0;
    const nextIndex = curIndex === 0 ? imagesLength - 1 : curIndex - 1;
    setActiveImageIndex({ ...activeImageIndex, [propId]: nextIndex });
  };

  const handleNextImage = (propId, imagesLength, e) => {
    e.stopPropagation();
    const curIndex = activeImageIndex[propId] || 0;
    const nextIndex = curIndex === imagesLength - 1 ? 0 : curIndex + 1;
    setActiveImageIndex({ ...activeImageIndex, [propId]: nextIndex });
  };

  // Convert/Format Price
  const formatPrice = (priceNGN) => {
    if (currency === 'USD') {
      const priceUSD = Math.round(priceNGN / 1500);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceUSD);
    } else if (currency === 'EUR') {
      const priceEUR = Math.round(priceNGN / 1600);
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(priceEUR);
    } else {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(priceNGN).replace('NGN', '₦');
    }
  };

  const getFilteredProperties = () => {
    return LUXURY_PROPERTIES.filter(p => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesArea = p.area.toLowerCase().includes(query);
        const matchesType = p.buildingType.toLowerCase().includes(query);
        if (!matchesTitle && !matchesArea && !matchesType) return false;
      }

      // Rent/Sale type
      if (selectedType !== 'ALL' && p.type !== selectedType) return false;

      // Location
      if (selectedLocation !== 'ALL' && !p.area.toLowerCase().includes(selectedLocation.toLowerCase())) return false;

      // Beds
      if (selectedBeds !== 'ALL') {
        const bedsVal = parseInt(selectedBeds);
        if (selectedBeds.endsWith('+')) {
          if (p.beds < bedsVal) return false;
        } else {
          if (p.beds !== bedsVal) return false;
        }
      }

      // Max Price
      if (p.price > priceMax) return false;

      return true;
    });
  };

  const filteredProperties = getFilteredProperties();

  // Autocomplete Suggestions
  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const keywords = [];
    LUXURY_PROPERTIES.forEach(p => {
      if (p.title.toLowerCase().includes(searchQuery.toLowerCase())) keywords.push(p.title);
      if (p.area.toLowerCase().includes(searchQuery.toLowerCase())) keywords.push(p.area);
      if (p.buildingType.toLowerCase().includes(searchQuery.toLowerCase())) keywords.push(p.buildingType);
    });
    return [...new Set(keywords)].slice(0, 5);
  };

  const suggestions = getSuggestions();

  // --- CALCULATORS ---
  const calculateMortgage = () => {
    if (!selectedProperty) return { monthlyPayment: 0, principal: 0, interest: 0, escrow: 0 };
    const price = selectedProperty.price;
    const principalLoan = Math.max(0, price - downPayment);
    const monthlyRate = (interestRate / 12) / 100;
    const numberOfPayments = loanTerm * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = (principalLoan * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = principalLoan / numberOfPayments;
    }

    if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
      monthlyPayment = 0;
    }

    // Add estimated local property taxes, insurance, and management escrow (0.25% of property price annually)
    const escrowTaxesMonthly = (price * 0.0025) / 12;
    const totalMonthly = monthlyPayment + escrowTaxesMonthly;

    // Principal portion on month 1
    const interestPortion = principalLoan * monthlyRate;
    const principalPortion = monthlyPayment - interestPortion;

    return {
      monthlyPayment: Math.round(totalMonthly),
      principal: Math.round(Math.max(0, principalPortion)),
      interest: Math.round(Math.max(0, interestPortion)),
      escrow: Math.round(escrowTaxesMonthly)
    };
  };

  const mortgageDetails = calculateMortgage();

  // Handle map pin click
  const handlePinClick = (prop) => {
    setSelectedProperty(prop);
    const cardElement = propertyCardRefs.current[prop.id];
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Apply/Reserve (Hooks into Monnify parent flow)
  const handleCheckoutInit = (p) => {
    if (p.type === 'RENT' && onRent) {
      onRent(p);
    } else if (p.type === 'SALE' && onBuy) {
      onBuy(p);
    } else {
      alert(`Initiating standard Monnify booking deposit for: ${p.title}. Total: ${formatPrice(p.firstPaymentAmount || p.price)}`);
    }
  };

  // Close Detail modal
  const closeDetailModal = () => {
    setSelectedProperty(null);
    setLightboxIndex(null);
  };

  return (
    <div className={`min-h-screen text-slate-100 font-sans ${darkMode ? 'bg-[#0B0F17]' : 'bg-[#F8FAFC]'}`}>
      
      {/* 1. STICKY GLASSMORPHIC HEAD NAVIGATION */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-md px-6 py-4 flex flex-col gap-4 transition-all duration-300 ${
        darkMode ? 'border-white/5 bg-[#0B0F17]/85' : 'border-slate-200/80 bg-white/85'
      }`}>
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo / Brand / Back CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg border transition ${
                  darkMode ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full animate-pulse"></div>
                <span className={`font-serif tracking-wider font-bold text-lg uppercase ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Prope <span className="font-sans text-[11px] font-semibold text-[#C5A059] tracking-widest uppercase">Luxury</span>
                </span>
              </div>
            </div>
          </div>

          {/* Search autocomplete & filters trigger */}
          <div className="flex-1 max-w-xl relative">
            <div className={`flex items-center border rounded-xl px-3.5 py-2 transition-all ${
              darkMode ? 'bg-slate-950/40 border-white/10 focus-within:border-[#C5A059]' : 'bg-slate-50 border-slate-200 focus-within:border-slate-900'
            }`}>
              <Search className={`w-4 h-4 mr-2.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                placeholder="Search by neighborhood, title, or architectural style..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className={`w-full bg-transparent border-none outline-none text-xs focus:ring-0 ${
                  darkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />
              <button 
                onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                className={`p-1 rounded transition flex items-center gap-1.5 ${
                  darkMode ? 'hover:bg-white/5 text-[#C5A059]' : 'hover:bg-slate-200/50 text-[#0F172A]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border p-2 shadow-2xl z-50 ${
                darkMode ? 'bg-[#131B2E] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item);
                      setShowSuggestions(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                      darkMode ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            {showSuggestions && searchQuery.trim() && (
              <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
            )}
          </div>

          {/* Quick Filters, Switchers & Toggles */}
          <div className="flex items-center gap-3 justify-end">
            
            {/* Currency Switcher */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`appearance-none text-xs font-mono font-bold tracking-wider px-3.5 py-2.5 rounded-xl border pr-8 transition cursor-pointer ${
                  darkMode 
                    ? 'bg-[#131B2E] border-white/10 text-[#C5A059] focus:border-[#C5A059]/80' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-slate-900'
                }`}
              >
                <option value="NGN">₦ NGN</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition ${
                darkMode 
                  ? 'border-white/10 bg-[#131B2E] text-amber-400 hover:bg-white/5' 
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
              title={darkMode ? "Switch to Light Editorial" : "Switch to Midnight Slate"}
            >
              {darkMode ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 7a5 5 0 110 10 5 5 0 010-10zM2 12a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm18 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM11 2a1 1 0 012 0v1a1 1 0 11-2 0V2zm0 18a1 1 0 012 0v1a1 1 0 11-2 0v-1zM5.99 4.58a1 1 0 111.41 1.41L6.69 6.7a1 1 0 01-1.41-1.41l.71-.71zm12.02 12.02a1 1 0 111.41 1.41l-.71.71a1 1 0 11-1.41-1.41l.71-.71zM4.58 18.01a1 1 0 111.41-1.41l.71.71a1 1 0 11-1.41 1.41l-.71-.71zm12.02-12.02a1 1 0 111.41-1.41l.71.71a1 1 0 11-1.41 1.41l-.71-.71z"/></svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.8.5-.1 1 .2 1.2.7.2.5 0 1.1-.4 1.4-2.8 2-3.8 5.7-2.4 8.8 1.4 3 4.5 4.9 7.8 4.7.5 0 1 .4 1.1.9.1.5-.2 1-.7 1.2-1.5.7-3.2 1.1-4.8 1.1z"/></svg>
              )}
            </button>

            {/* Layout Toggles */}
            <div className={`flex rounded-xl p-0.5 border ${
              darkMode ? 'bg-[#131B2E] border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? (darkMode ? 'bg-[#0B0F17] text-[#C5A059]' : 'bg-white text-[#0F172A] shadow-sm') 
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? (darkMode ? 'bg-[#0B0F17] text-[#C5A059]' : 'bg-white text-[#0F172A] shadow-sm') 
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'split' 
                    ? (darkMode ? 'bg-[#0B0F17] text-[#C5A059]' : 'bg-white text-[#0F172A] shadow-sm') 
                    : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
                title="Split Map View"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* 1B. ADVANCED FILTER DROP-MATRIX (EXPANDABLE) */}
        {showFiltersDropdown && (
          <div className={`w-full max-w-7xl mx-auto rounded-2xl border p-6 grid grid-cols-2 md:grid-cols-4 gap-6 animate-in slide-in-from-top-3 duration-200 ${
            darkMode ? 'bg-[#131B2E] border-white/10' : 'bg-white border-slate-200'
          }`}>
            {/* Property Type Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Property Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none transition ${
                  darkMode ? 'bg-[#0B0F17] border-white/10 text-slate-200 focus:border-[#C5A059]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-900'
                }`}
              >
                <option value="ALL">All Types</option>
                <option value="RENT">Rent (Leases)</option>
                <option value="SALE">Sale (Escrow)</option>
              </select>
            </div>

            {/* Neighborhood Location Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Neighborhood</label>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none transition ${
                  darkMode ? 'bg-[#0B0F17] border-white/10 text-slate-200 focus:border-[#C5A059]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-slate-900'
                }`}
              >
                <option value="ALL">All Locations</option>
                <option value="Banana Island">Banana Island, Lagos</option>
                <option value="Ikoyi">Ikoyi, Lagos</option>
                <option value="Lekki">Lekki Phase 1, Lagos</option>
                <option value="Malibu">Malibu, California</option>
                <option value="Aspen">Aspen, Colorado</option>
              </select>
            </div>

            {/* Bedrooms Pill Selectors */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Bedrooms</label>
              <div className="flex gap-1.5">
                {['ALL', '4', '5', '6'].map(bed => (
                  <button
                    key={bed}
                    onClick={() => setSelectedBeds(bed)}
                    className={`flex-1 text-xs py-2 rounded-lg font-mono border transition ${
                      selectedBeds === bed
                        ? (darkMode ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]' : 'bg-[#0F172A] border-[#0F172A] text-white')
                        : (darkMode ? 'bg-[#0B0F17] border-white/10 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')
                    }`}
                  >
                    {bed}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Max Slider */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Max Budget</label>
                <span className="text-[11px] font-mono text-[#C5A059] font-bold">{formatPrice(priceMax)}</span>
              </div>
              <div className="pt-2">
                <input 
                  type="range" 
                  min={100000000} // 100M NGN
                  max={2500000000} // 2.5B NGN
                  step={50000000}
                  value={priceMax} 
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                  <span>₦100M</span>
                  <span>₦1.3B</span>
                  <span>₦2.5B</span>
                </div>
              </div>
            </div>

            {/* Reset button */}
            <div className="col-span-2 md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-800/50">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('ALL');
                  setSelectedLocation('ALL');
                  setSelectedBeds('ALL');
                  setPriceMax(2000000000);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                  darkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFiltersDropdown(false)}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#C5A059]/90 text-[#0F172A] text-xs font-semibold rounded-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Split View Map + Listings */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT LISTINGS COLUMN (7 cols) */}
            <div className="lg:col-span-7 space-y-6 max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="flex justify-between items-center text-left">
                <div>
                  <h3 className={`text-base font-bold font-serif ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    Available Luxury Residences
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Found {filteredProperties.length} elite properties matching criteria</p>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className={`py-24 text-center border border-dashed rounded-2xl ${
                  darkMode ? 'border-white/10 bg-slate-900/10' : 'border-slate-300 bg-slate-50/50'
                }`}>
                  <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No properties match your filters</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredProperties.map(p => (
                    <PropertyCard 
                      key={p.id}
                      p={p}
                      darkMode={darkMode}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      copiedId={copiedId}
                      handleShare={handleShare}
                      formatPrice={formatPrice}
                      activeImageIndex={activeImageIndex}
                      handlePrevImage={handlePrevImage}
                      handleNextImage={handleNextImage}
                      setSelectedProperty={setSelectedProperty}
                      isHovered={hoveredCardId === p.id || hoveredPinId === p.id}
                      onMouseEnter={() => setHoveredCardId(p.id)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      refElement={(el) => propertyCardRefs.current[p.id] = el}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT MAP COLUMN (5 cols) */}
            <div className="lg:col-span-5 sticky top-28 h-[75vh] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#0B0F17]">
              {/* STYLIZED VECTOR MAP CANVAS */}
              <div className="relative w-full h-full">
                
                {/* Custom SVG Stylized Map */}
                <svg className="w-full h-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Land Background */}
                  <rect width="100" height="100" fill="#0E1624" />
                  
                  {/* Ocean / Lagoon */}
                  <path d="M 0 60 Q 30 75, 50 65 T 100 80 L 100 100 L 0 100 Z" fill="#13243F" opacity="0.8" />
                  <path d="M 0 65 Q 25 78, 48 70 T 100 85 L 100 100 L 0 100 Z" fill="#172D4D" opacity="0.9" />
                  
                  {/* Waterways / Canals */}
                  <path d="M 30 0 Q 35 25, 45 40 T 60 70" fill="none" stroke="#13243F" strokeWidth="3" opacity="0.7" />
                  
                  {/* Streets Grid (Stylized Slate Lines) */}
                  <line x1="10" y1="0" x2="30" y2="60" stroke="#1D2A44" strokeWidth="0.6" strokeDasharray="1 1" />
                  <line x1="40" y1="0" x2="50" y2="68" stroke="#1D2A44" strokeWidth="0.6" />
                  <line x1="70" y1="0" x2="85" y2="75" stroke="#1D2A44" strokeWidth="0.6" strokeDasharray="2 1" />
                  
                  <line x1="0" y1="20" x2="100" y2="25" stroke="#1D2A44" strokeWidth="0.6" />
                  <line x1="0" y1="45" x2="100" y2="40" stroke="#1D2A44" strokeWidth="0.6" strokeDasharray="1 1" />
                  <line x1="0" y1="58" x2="100" y2="62" stroke="#1D2A44" strokeWidth="0.8" />
                  
                  {/* Parks / Forest (Muted Olive Green Areas) */}
                  <path d="M 12 10 Q 22 5, 20 22 T 5 15 Z" fill="#1D2E26" opacity="0.6" />
                  <path d="M 80 15 Q 92 10, 88 32 T 72 25 Z" fill="#1D2E26" opacity="0.5" />
                  <path d="M 45 42 Q 55 45, 52 55 T 38 48 Z" fill="#1D2E26" opacity="0.4" />
                </svg>

                {/* Map Overlay Text Details */}
                <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-sm pointer-events-none text-left">
                  <p className="text-[9px] font-mono text-[#C5A059] uppercase tracking-widest font-bold">Interactive Radar Map</p>
                  <p className="text-[10px] text-slate-350 font-bold mt-1">Lekki-Banana Island Sector</p>
                </div>

                {/* Map Pins (Vector Price Tags) */}
                {filteredProperties.map(p => {
                  const isHovered = hoveredCardId === p.id || hoveredPinId === p.id;
                  const priceLabel = currency === 'USD' 
                    ? `$${Math.round(p.price / 1500000)}M` 
                    : currency === 'EUR' 
                    ? `€${Math.round(p.price / 1600000)}M` 
                    : `₦${(p.price / 1000000000).toFixed(2)}B`;

                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePinClick(p)}
                      onMouseEnter={() => setHoveredPinId(p.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                      style={{
                        position: 'absolute',
                        left: `${p.mapCoords.x}%`,
                        top: `${p.mapCoords.y}%`,
                        transform: 'translate(-50%, -100%)'
                      }}
                      className={`z-25 group flex flex-col items-center transition-all duration-300 ${
                        isHovered ? 'scale-115 z-30' : 'scale-100'
                      }`}
                    >
                      {/* Price bubble */}
                      <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold font-mono border shadow-2xl transition-all duration-300 flex items-center gap-1 ${
                        isHovered 
                          ? 'bg-[#C5A059] border-[#C5A059] text-[#0B0F17] shadow-[#C5A059]/20' 
                          : 'bg-[#131B2E] border-white/10 text-slate-200 hover:border-[#C5A059]/50'
                      }`}>
                        {p.isAssured && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-[#0B0F17]' : 'bg-[#C5A059]'}`} />
                        )}
                        {priceLabel}
                      </div>
                      
                      {/* Triangle Pointer */}
                      <div className={`w-2 h-1.5 -mt-0.5 border-t-[6px] border-x-[4px] border-x-transparent transition-all duration-300 ${
                        isHovered ? 'border-t-[#C5A059]' : 'border-t-[#131B2E]'
                      }`} />

                      {/* Radar Pulse on Hover */}
                      {isHovered && (
                        <div className="w-6 h-6 -mt-3.5 rounded-full bg-[#C5A059]/25 animate-ping absolute" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* Grid View and List View (12 cols) */
          <div className="space-y-6 text-left">
            <div>
              <h3 className={`text-base font-bold font-serif ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Premium Real Estate Collection
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">Displaying {filteredProperties.length} listings in {viewMode} layout</p>
            </div>

            {filteredProperties.length === 0 ? (
              <div className={`py-32 text-center border border-dashed rounded-2xl ${
                darkMode ? 'border-white/10 bg-slate-900/10' : 'border-slate-300 bg-slate-50/50'
              }`}>
                <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No listings match criteria</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-6 grid-cols-1'}>
                {filteredProperties.map(p => (
                  <PropertyCard 
                    key={p.id}
                    p={p}
                    darkMode={darkMode}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    copiedId={copiedId}
                    handleShare={handleShare}
                    formatPrice={formatPrice}
                    activeImageIndex={activeImageIndex}
                    handlePrevImage={handlePrevImage}
                    handleNextImage={handleNextImage}
                    setSelectedProperty={setSelectedProperty}
                    isListView={viewMode === 'list'}
                    isHovered={hoveredCardId === p.id}
                    onMouseEnter={() => setHoveredCardId(p.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    refElement={(el) => propertyCardRefs.current[p.id] = el}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. PROPERTY DETAIL OVERLAY MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          
          <div className={`w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 relative ${
            darkMode ? 'bg-[#0E1523] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Header / Dismiss Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={closeDetailModal}
                className="p-2.5 rounded-full bg-slate-950/80 border border-white/20 text-white hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. HERO IMAGE GALLERY (Hero grid layout with lightbox) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
              <div 
                onClick={() => setLightboxIndex(0)}
                className="md:col-span-2 h-80 md:h-[400px] rounded-2xl overflow-hidden cursor-zoom-in relative group"
              >
                <img 
                  src={selectedProperty.images[0]} 
                  alt={selectedProperty.title} 
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-300" />
                <span className="absolute bottom-4 left-4 bg-slate-950/70 border border-white/10 backdrop-blur-sm text-[8px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg text-white">
                  Expand Gallery
                </span>
              </div>
              <div className="hidden md:grid grid-rows-3 gap-2 h-[400px]">
                {selectedProperty.images.slice(1, 4).map((img, index) => (
                  <div 
                    key={index}
                    onClick={() => setLightboxIndex(index + 1)}
                    className="h-full rounded-xl overflow-hidden cursor-zoom-in relative group"
                  >
                    <img 
                      src={img} 
                      alt={`Interior slide ${index + 1}`} 
                      className="w-full h-[126px] object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
                  </div>
                ))}
              </div>
            </div>

            {/* Lightbox full-screen */}
            {lightboxIndex !== null && (
              <div className="fixed inset-0 z-55 bg-black/95 flex flex-col justify-center items-center p-4">
                <button 
                  onClick={() => setLightboxIndex(null)}
                  className="absolute top-6 right-6 p-3 rounded-full border border-white/20 bg-slate-900/50 hover:bg-slate-900 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setLightboxIndex(lightboxIndex === 0 ? selectedProperty.images.length - 1 : lightboxIndex - 1)}
                  className="absolute left-6 p-4 rounded-full border border-white/20 bg-slate-900/50 hover:bg-slate-900 text-white transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl border border-white/10">
                  <img 
                    src={selectedProperty.images[lightboxIndex]} 
                    alt={`Slide ${lightboxIndex + 1}`} 
                    className="max-w-full max-h-[80vh] object-contain" 
                  />
                </div>
                <button 
                  onClick={() => setLightboxIndex(lightboxIndex === selectedProperty.images.length - 1 ? 0 : lightboxIndex + 1)}
                  className="absolute right-6 p-4 rounded-full border border-white/20 bg-slate-900/50 hover:bg-slate-900 text-white transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 mt-4 uppercase">
                  Image {lightboxIndex + 1} of {selectedProperty.images.length}
                </span>
              </div>
            )}

            {/* Modal Middle Body */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT DETAIL INFORMATION PANEL (7 cols) */}
              <div className="lg:col-span-7 space-y-8 text-left">
                
                {/* Meta details & titles */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 rounded text-[9px] font-mono uppercase tracking-wider font-bold">
                      {selectedProperty.tag}
                    </span>
                    {selectedProperty.isAssured && (
                      <span className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 ${
                        darkMode ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-[#166534] border border-emerald-200'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Prope Assured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-bold font-serif tracking-tight">{selectedProperty.title}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-mono uppercase">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                        {selectedProperty.area}
                      </div>
                    </div>
                    <div className="text-left md:text-right mt-2 md:mt-0">
                      <p className="text-2xl font-bold text-[#C5A059] font-mono">{formatPrice(selectedProperty.price)}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {selectedProperty.type === 'RENT' 
                          ? `RENT / ${selectedProperty.paymentFrequency}` 
                          : `OUTRIGHT ESCROW PURCHASE`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Spec metrics layout */}
                <div className={`grid grid-cols-4 gap-4 p-4 rounded-2xl border ${
                  darkMode ? 'bg-[#131B2E]/40 border-white/5' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Beds</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block">{selectedProperty.beds}</span>
                  </div>
                  <div className="text-center border-l border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Baths</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block">{selectedProperty.baths}</span>
                  </div>
                  <div className="text-center border-l border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Size</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block">{selectedProperty.sqft} sq ft</span>
                  </div>
                  <div className="text-center border-l border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Built</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block">{selectedProperty.yearBuilt}</span>
                  </div>
                </div>

                {/* Tabs to switch layout content */}
                <div className={`flex border-b ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  {['overview', 'calculator', 'floorplan', 'tour'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-all -mb-px ${
                        activeTab === tab 
                          ? 'border-[#C5A059] text-[#C5A059]' 
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'floorplan' ? 'Floor Plans' : tab === 'calculator' ? 'Mortgage Calculator' : tab}
                    </button>
                  ))}
                </div>

                {/* TAB OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-slate-400">The Residence Description</h4>
                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-350' : 'text-slate-700'}`}>
                        {selectedProperty.description}
                      </p>
                    </div>

                    {/* AMENITIES MATRIX BY CATEGORY */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-slate-400">Amenities & Infrastructure</h4>
                      
                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* Interior */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#C5A059] uppercase tracking-wider">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                            Interior Design
                          </div>
                          <ul className="space-y-1.5 pl-6 text-xs text-slate-400 text-left list-disc marker:text-[#C5A059]">
                            {selectedProperty.amenities.interior.map((am, idx) => (
                              <li key={idx}>{am}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Exterior */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#C5A059] uppercase tracking-wider">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22h20M17 9l-3.5 3.5L10 9M7 9l3.5 3.5"/></svg>
                            Exterior Infrastructure
                          </div>
                          <ul className="space-y-1.5 pl-6 text-xs text-slate-400 text-left list-disc marker:text-[#C5A059]">
                            {selectedProperty.amenities.exterior.map((am, idx) => (
                              <li key={idx}>{am}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Building Services */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#C5A059] uppercase tracking-wider">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                            Building Services
                          </div>
                          <ul className="space-y-1.5 pl-6 text-xs text-slate-400 text-left list-disc marker:text-[#C5A059]">
                            {selectedProperty.amenities.building.map((am, idx) => (
                              <li key={idx}>{am}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Eco Features */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#C5A059] uppercase tracking-wider">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Eco & Environmental
                          </div>
                          <ul className="space-y-1.5 pl-6 text-xs text-slate-400 text-left list-disc marker:text-[#C5A059]">
                            {selectedProperty.amenities.eco.map((am, idx) => (
                              <li key={idx}>{am}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB MORTGAGE CALCULATOR */}
                {activeTab === 'calculator' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-slate-400">Mortgage Payment Estimator</h4>
                      <p className="text-[10px] text-slate-500">Inputs calculate baseline financing metrics for outright acquisitions or long leases.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 items-center">
                      <div className="space-y-4">
                        {/* Down Payment */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-slate-400">
                            <span>Down Payment</span>
                            <span className="font-bold text-[#C5A059]">{formatPrice(downPayment)}</span>
                          </div>
                          <input 
                            type="range"
                            min={0}
                            max={selectedProperty.price}
                            step={selectedProperty.price * 0.05}
                            value={downPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                          />
                        </div>

                        {/* Interest Rate */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-slate-400">
                            <span>Interest Rate (Annual)</span>
                            <span className="font-bold text-[#C5A059]">{interestRate}%</span>
                          </div>
                          <input 
                            type="range"
                            min={2}
                            max={25}
                            step={0.5}
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                          />
                        </div>

                        {/* Loan Term */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-mono block">Loan Duration</label>
                          <div className="flex gap-2">
                            {[10, 15, 20, 25, 30].map(term => (
                              <button
                                key={term}
                                onClick={() => setLoanTerm(term)}
                                className={`flex-1 text-xs py-2 rounded-lg font-mono border transition ${
                                  loanTerm === term
                                    ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#C5A059]'
                                    : (darkMode ? 'bg-[#0B0F17] border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600')
                                }`}
                              >
                                {term} Yrs
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Calculation outputs with customized SVG Donut Chart */}
                      <div className={`p-5 rounded-2xl border text-center space-y-4 flex flex-col justify-center items-center ${
                        darkMode ? 'bg-[#131B2E]/40 border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        
                        {/* Circular SVG Chart */}
                        <div className="relative w-28 h-28">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            {/* Base Circle */}
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#223049" strokeWidth="2.5" />
                            
                            {/* Segments (Principal, Interest, Escrow) */}
                            {/* Segment 1: Principal (50% default visual slice) */}
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#C5A059" strokeWidth="3" strokeDasharray="50 100" strokeDashoffset="0" />
                            {/* Segment 2: Interest (35% default visual slice) */}
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#9A7B39" strokeWidth="3" strokeDasharray="35 100" strokeDashoffset="-50" />
                            {/* Segment 3: Escrow (15% default visual slice) */}
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3D5377" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-85" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block">Monthly Est.</span>
                            <span className="text-xs font-bold font-mono">{formatPrice(mortgageDetails.monthlyPayment)}</span>
                          </div>
                        </div>

                        {/* Breakdown Text Legends */}
                        <div className="w-full space-y-2 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-[#C5A059]" /> Principal Portion
                            </span>
                            <span className="font-mono text-slate-350 font-semibold">{formatPrice(mortgageDetails.principal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-[#9A7B39]" /> Interest Portion
                            </span>
                            <span className="font-mono text-slate-350 font-semibold">{formatPrice(mortgageDetails.interest)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-[#3D5377]" /> Escrow / Taxes
                            </span>
                            <span className="font-mono text-slate-350 font-semibold">{formatPrice(mortgageDetails.escrow)}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* TAB FLOOR PLAN VIEW */}
                {activeTab === 'floorplan' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-slate-400">Structural Layout Plan</h4>
                        <p className="text-[10px] text-slate-500">Architectural blueprint representing room spacing and area distribution.</p>
                      </div>
                      
                      <div className={`flex rounded-xl p-0.5 border ${
                        darkMode ? 'bg-[#131B2E] border-white/10' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <button
                          onClick={() => setFloorPlanView('2D')}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition ${
                            floorPlanView === '2D' 
                              ? 'bg-[#C5A059] text-[#0F172A]' 
                              : 'text-slate-400'
                          }`}
                        >
                          2D Blueprint
                        </button>
                        <button
                          onClick={() => setFloorPlanView('3D')}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition ${
                            floorPlanView === '3D' 
                              ? 'bg-[#C5A059] text-[#0F172A]' 
                              : 'text-slate-400'
                          }`}
                        >
                          3D Rendering
                        </button>
                      </div>
                    </div>

                    {floorPlanView === '2D' ? (
                      /* ARCHITECTURAL BLUEPRINT INLINE SVG */
                      <div className={`w-full h-80 rounded-2xl border flex items-center justify-center p-4 ${
                        darkMode ? 'bg-[#0E1523] border-white/10' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <svg className="w-full h-full max-w-lg" viewBox="0 0 200 120">
                          {/* Outer walls outline */}
                          <rect x="10" y="10" width="180" height="100" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeOpacity="0.8" />
                          
                          {/* Inner Rooms divisions */}
                          {/* Master Bedroom */}
                          <line x1="10" y1="60" x2="80" y2="60" stroke="#8A7349" strokeWidth="1" strokeDasharray="1 1" />
                          <line x1="80" y1="10" x2="80" y2="80" stroke="#8A7349" strokeWidth="1" />
                          
                          {/* Kitchen / Dining */}
                          <line x1="130" y1="10" x2="130" y2="70" stroke="#8A7349" strokeWidth="1" />
                          <line x1="130" y1="70" x2="190" y2="70" stroke="#8A7349" strokeWidth="1" strokeDasharray="1 1" />
                          
                          {/* Living Hallway */}
                          <rect x="90" y="80" width="50" height="30" fill="none" stroke="#C5A059" strokeWidth="0.8" strokeOpacity="0.3" />
                          
                          {/* Labels */}
                          <text x="25" y="30" fill="#C5A059" fontSize="6" fontWeight="bold" fontFamily="monospace">MASTER SUITE (6.5 x 5m)</text>
                          <text x="25" y="80" fill="#8A7349" fontSize="5" fontFamily="monospace">EN-SUITE BATH</text>
                          <text x="140" y="30" fill="#C5A059" fontSize="6" fontWeight="bold" fontFamily="monospace">GOURMET KITCHEN</text>
                          <text x="100" y="50" fill="#C5A059" fontSize="8" fontWeight="bold" fontFamily="serif">LIVING LOUNGE</text>
                          <text x="105" y="98" fill="#8A7349" fontSize="5" fontFamily="monospace">YACHT VERANDA</text>
                          
                          {/* Doors representation (semi-circle curves) */}
                          <path d="M 80 40 A 10 10 0 0 0 70 50" fill="none" stroke="#C5A059" strokeWidth="0.8" />
                          <path d="M 130 50 A 10 10 0 0 1 140 60" fill="none" stroke="#C5A059" strokeWidth="0.8" />
                        </svg>
                      </div>
                    ) : (
                      /* 3D RENDERING SIMULATION CANVAS PLACEHOLDER */
                      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/5 bg-slate-950">
                        <img 
                          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80" 
                          alt="3D Walkthrough View" 
                          className="w-full h-full object-cover opacity-60 filter blur-xs" 
                        />
                        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-6 text-center">
                          <Compass className="w-12 h-12 text-[#C5A059] animate-spin-slow mb-3" />
                          <h5 className="text-sm font-serif font-bold text-white uppercase tracking-wider">3D BIM Architectural Simulator</h5>
                          <p className="text-[10px] text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                            Pre-rendering space matrices and structural coordinates. Virtual photorealistic walkthrough available inside the landlord's dashboard.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB TOUR SCHEDULING DRAWER */}
                {activeTab === 'tour' && (
                  <div className="space-y-6">
                    <div className="text-left space-y-1">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-slate-400">Request Private Tour Appointment</h4>
                      <p className="text-[10px] text-slate-500">Pick a secure date and hour for a physical showing guided by our Managing Partner.</p>
                    </div>

                    {tourScheduled ? (
                      <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                        darkMode ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-250 text-emerald-800'
                      }`}>
                        <CheckCircle2 className="w-10 h-10 mx-auto text-[#C5A059]" />
                        <h5 className="text-sm font-bold uppercase tracking-wider font-serif">Viewing Appointment Pending</h5>
                        <p className="text-xs max-w-md mx-auto leading-relaxed">
                          Your tour request for <strong>{selectedTourDate}</strong> at <strong>{selectedTourTime}</strong> has been registered with Alistair Sterling's calendar. Confirming via Monnify SMS.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        
                        {/* Dates Tabs */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-mono block">Available Calendar Dates</label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {['Mon, Jul 20', 'Tue, Jul 21', 'Wed, Jul 22', 'Thu, Jul 23', 'Fri, Jul 24', 'Sat, Jul 25'].map(d => (
                              <button
                                key={d}
                                onClick={() => setSelectedTourDate(d)}
                                className={`text-[10px] py-3 rounded-xl border text-center transition font-mono ${
                                  selectedTourDate === d
                                    ? 'bg-[#C5A059] border-[#C5A059] text-[#0F172A] font-bold'
                                    : (darkMode ? 'bg-[#0B0F17] border-white/5 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-650')
                                }`}
                              >
                                {d.split(',')[0]}
                                <span className="block text-[8px] font-normal opacity-80 mt-0.5">{d.split(',')[1]}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Times Tabs */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-mono block">Select Viewing Slot</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTourTime(t)}
                                className={`text-xs py-2.5 rounded-xl border text-center transition font-mono ${
                                  selectedTourTime === t
                                    ? 'bg-[#C5A059] border-[#C5A059] text-[#0F172A] font-bold'
                                    : (darkMode ? 'bg-[#0B0F17] border-white/5 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-650')
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Submit button */}
                        <button
                          onClick={() => setTourScheduled(true)}
                          className="w-full py-3 bg-[#C5A059] hover:bg-[#C5A059]/90 text-[#0F172A] font-bold rounded-xl text-xs uppercase tracking-wider transition"
                        >
                          Confirm Showing Reservation
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT AGENT INFO & RESERVATION BOX (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Agent Card */}
                <div className={`p-5 rounded-2xl border text-left space-y-4 ${
                  darkMode ? 'bg-[#131B2E]/60 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedProperty.agent.avatar} 
                      alt={selectedProperty.agent.name} 
                      className="w-12 h-12 rounded-full object-cover border border-[#C5A059]/50" 
                    />
                    <div>
                      <h5 className="text-sm font-bold font-serif">{selectedProperty.agent.name}</h5>
                      <span className="text-[10px] text-[#C5A059] font-mono uppercase tracking-wider block mt-0.5">{selectedProperty.agent.role}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-800/80 pt-4 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span>{selectedProperty.agent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span>{selectedProperty.agent.email}</span>
                    </div>
                  </div>
                </div>

                {/* Final transaction panel */}
                <div className={`p-6 rounded-2xl border text-left space-y-5 ${
                  darkMode ? 'bg-slate-950/60 border-[#C5A059]/30' : 'bg-slate-100 border-slate-350'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Monnify Booking Deposit</span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="text-xl font-bold font-mono text-[#C5A059]">{formatPrice(selectedProperty.firstPaymentAmount || selectedProperty.price)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedProperty.type === 'RENT' ? 'Annual Downpayment' : 'Escrow Deposit (10%)'}
                      </span>
                    </div>
                  </div>

                  {selectedProperty.annualProjections && (
                    <div className={`p-3 rounded-xl border text-[10px] font-mono text-left leading-relaxed ${
                      darkMode ? 'bg-[#131B2E]/40 border-white/5 text-[#C5A059]' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      {selectedProperty.annualProjections}
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={() => handleCheckoutInit(selectedProperty)}
                      className="w-full py-3 bg-[#C5A059] hover:bg-[#C5A059]/90 text-[#0F172A] rounded-xl text-xs font-bold uppercase tracking-wider transition"
                    >
                      {selectedProperty.type === 'RENT' ? 'Rent Apartment Now' : 'Purchase via Escrow'}
                    </button>
                    <p className="text-[8px] text-center text-slate-500 leading-relaxed font-mono">
                      Payments handled securely by Monnify. Funds are covered under bank-grade escrow guidelines until tenancy verification or contract execution.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// --- SUBCOMPONENT: PROPERTY CARD ---
function PropertyCard({ 
  p, darkMode, favorites, toggleFavorite, copiedId, handleShare, 
  formatPrice, activeImageIndex, handlePrevImage, handleNextImage, 
  setSelectedProperty, isListView = false, isHovered = false, 
  onMouseEnter, onMouseLeave, refElement 
}) {
  const images = p.images || [p.imageUrl || '/dashboard_preview.jpg'];
  const curImgIdx = activeImageIndex[p.id] || 0;

  if (isListView) {
    return (
      <div 
        ref={refElement}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => setSelectedProperty(p)}
        className={`w-full border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col md:flex-row hover:shadow-2xl cursor-pointer ${
          isHovered 
            ? (darkMode ? 'border-[#C5A059] shadow-[#C5A059]/10 bg-[#131B2E]/60' : 'border-slate-800 bg-white') 
            : (darkMode ? 'border-white/5 bg-[#131B2E]/30' : 'border-slate-200 bg-white/70')
        }`}
      >
        {/* Left Side: Images Carousel */}
        <div className="w-full md:w-80 h-52 relative overflow-hidden group/img">
          <img 
            src={images[curImgIdx]} 
            alt={p.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-103" 
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Left/Right buttons for slide */}
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => handlePrevImage(p.id, images.length, e)}
              className="p-1 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-slate-900 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleNextImage(p.id, images.length, e)}
              className="p-1 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-slate-900 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === curImgIdx ? 'bg-[#C5A059] w-3.5' : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Overlays badges */}
          <span className="absolute top-3 left-3 bg-[#0B0F17]/80 backdrop-blur-sm border border-white/10 text-[7px] font-mono tracking-widest font-bold text-white px-2 py-0.5 rounded uppercase">
            {p.type}
          </span>
          <span className="absolute top-3 right-3 bg-[#C5A059] text-[#0B0F17] text-[7px] font-mono tracking-widest font-bold px-2 py-0.5 rounded uppercase">
            {p.tag}
          </span>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-5 space-y-4 flex flex-col justify-between text-left">
          
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`font-bold font-serif text-base tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{p.title}</h4>
                <p className="text-[10px] text-[#C5A059] font-mono uppercase tracking-wider mt-0.5">{p.buildingType} &middot; {p.area}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Favorite Toggle */}
                <button
                  onClick={(e) => toggleFavorite(p.id, e)}
                  className={`p-2 rounded-xl border transition ${
                    favorites.includes(p.id) 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                      : (darkMode ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                </button>

                {/* Share Link */}
                <div className="relative">
                  <button
                    onClick={(e) => handleShare(p, e)}
                    className={`p-2 rounded-xl border transition ${
                      copiedId === p.id 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : (darkMode ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  {copiedId === p.id && (
                    <span className="absolute bottom-full right-0 mb-2 px-2 py-0.5 bg-slate-950 border border-white/10 rounded text-[7px] text-white font-mono uppercase">Copied</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {p.description}
            </p>
          </div>

          <div className={`border-t pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            darkMode ? 'border-white/5' : 'border-slate-100'
          }`}>
            {/* Specs pills */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-[#C5A059]" /> {p.beds} Beds</span>
              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#C5A059]" /> {p.baths} Baths</span>
              <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-[#C5A059]" /> {p.sqft} Sq Ft</span>
            </div>
            
            <div className="text-left sm:text-right">
              <span className="text-[#C5A059] font-bold text-sm font-mono">{formatPrice(p.price)}</span>
              {p.type === 'RENT' && (
                <span className="text-[8px] text-slate-500 font-mono block">/{p.paymentFrequency}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- GRID VIEW CARD ---
  return (
    <div 
      ref={refElement}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => setSelectedProperty(p)}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer flex flex-col justify-between ${
        isHovered 
          ? (darkMode ? 'border-[#C5A059] shadow-[#C5A059]/10 bg-[#131B2E]/60' : 'border-slate-800 bg-white') 
          : (darkMode ? 'border-white/5 bg-[#131B2E]/30' : 'border-slate-200 bg-white/70')
      }`}
    >
      
      {/* Image Carousel Showcase */}
      <div className="h-56 relative overflow-hidden group/img">
        <img 
          src={images[curImgIdx]} 
          alt={p.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-103" 
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* Left/Right controls */}
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => handlePrevImage(p.id, images.length, e)}
            className="p-1.5 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-slate-900 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => handleNextImage(p.id, images.length, e)}
            className="p-1.5 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-slate-900 transition"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dots Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <span 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === curImgIdx ? 'bg-[#C5A059] w-3.5' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Overlay Badges */}
        <span className="absolute top-3 left-3 bg-[#0B0F17]/80 backdrop-blur-sm border border-white/10 text-[7px] font-mono tracking-widest font-bold text-white px-2 py-0.5 rounded uppercase">
          {p.type}
        </span>
        <span className="absolute top-3 right-3 bg-[#C5A059] text-[#0B0F17] text-[7px] font-mono tracking-widest font-bold px-2 py-0.5 rounded uppercase">
          {p.tag}
        </span>
      </div>

      {/* Info specs block */}
      <div className="p-5 space-y-4 text-left flex-1 flex flex-col justify-between">
        
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-bold font-serif text-sm tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{p.title}</h4>
            <div className="flex items-center gap-1">
              
              {/* Favorite Toggle */}
              <button
                onClick={(e) => toggleFavorite(p.id, e)}
                className={`p-1.5 rounded-lg border transition ${
                  favorites.includes(p.id) 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                    : (darkMode ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-650')
                }`}
              >
                <Heart className="w-3 h-3" fill={favorites.includes(p.id) ? "currentColor" : "none"} />
              </button>

              {/* Share Popover */}
              <div className="relative">
                <button
                  onClick={(e) => handleShare(p, e)}
                  className={`p-1.5 rounded-lg border transition ${
                    copiedId === p.id 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : (darkMode ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-650')
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                {copiedId === p.id && (
                  <span className="absolute bottom-full right-0 mb-2 px-2 py-0.5 bg-slate-950 border border-white/10 rounded text-[7px] text-white font-mono uppercase">Copied</span>
                )}
              </div>

            </div>
          </div>
          <p className="text-[10px] text-[#C5A059] font-mono uppercase tracking-wider">{p.buildingType} &middot; {p.area}</p>
        </div>

        {/* Detailed Spec Pills */}
        <div className="flex items-center gap-3 text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-[#C5A059]" /> {p.beds} Bds</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#C5A059]" /> {p.baths} Bth</span>
          <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-[#C5A059]" /> {p.sqft} SqFt</span>
        </div>

        <div className={`border-t pt-3 flex justify-between items-center text-xs ${
          darkMode ? 'border-white/5' : 'border-slate-100'
        }`}>
          <span className="text-[#C5A059] font-bold text-sm font-mono">{formatPrice(p.price)}</span>
          <span className="text-[9px] font-mono text-slate-500">
            {p.type === 'RENT' ? `RENT/YR` : `ESCROW`}
          </span>
        </div>

      </div>
    </div>
  );
}
