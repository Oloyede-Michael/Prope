import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, Send, LayoutDashboard, Building2, Users, Coins,
  Receipt, MessageSquare, RefreshCw, Plus, Landmark, ShieldCheck,
  ShieldAlert, Sparkles, User, FileText, ArrowLeftRight, Menu, X,
  LogOut, Compass, Search, SlidersHorizontal, Grid, List, Map, Heart, 
  Share2, ChevronLeft, ChevronRight, Bed, Bath, Maximize, Calendar, 
  Calculator, Phone, Mail, ChevronDown, MapPin, HelpCircle
} from 'lucide-react';
import { LUXURY_PROPERTIES } from '../data/luxuryProperties.js';
import { callNimApi } from '../nim_api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Helper to enrich DB properties with high-resolution details from static dataset
function enrichProperty(dbProp) {
  const luxury = LUXURY_PROPERTIES.find(
    lp => lp.title.toLowerCase() === dbProp.title.toLowerCase() || 
          lp.area.toLowerCase() === dbProp.area?.toLowerCase()
  );
  
  if (luxury) {
    return {
      ...luxury,
      ...dbProp,
      images: luxury.images,
      amenities: luxury.amenities,
      agent: luxury.agent,
      mapCoords: luxury.mapCoords,
      price: parseFloat(dbProp.price || luxury.price),
      firstPaymentAmount: parseFloat(dbProp.firstPaymentAmount || luxury.firstPaymentAmount),
      paymentFrequency: dbProp.paymentFrequency || luxury.paymentFrequency,
      annualProjections: dbProp.annualProjections || luxury.annualProjections,
      isAssured: dbProp.isAssured !== undefined ? dbProp.isAssured : luxury.isAssured
    };
  }
  
  return {
    ...dbProp,
    price: parseFloat(dbProp.price || 0),
    beds: 4,
    baths: 4,
    sqft: 4500,
    yearBuilt: 2023,
    tag: dbProp.type === 'RENT' ? 'Featured Rent' : 'Exclusive Sale',
    images: [
      dbProp.imageUrl || '/dashboard_preview.jpg',
      '/dashboard_preview.jpg',
      '/dashboard_preview.jpg',
      '/dashboard_preview.jpg'
    ],
    mapCoords: { x: 50, y: 50 },
    amenities: {
      interior: ["Smart Automation", "Bespoke Fittings"],
      exterior: ["Pool", "Terrace Sitting"],
      building: ["Secure Gated Area", "Parking"],
      eco: ["Solar Microgrid Integration"]
    },
    agent: {
      name: "Marcus Sterling",
      role: "Managing Partner",
      phone: "+234 815 555 9010",
      email: "m.sterling@prope-luxury.com",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80"
    },
    firstPaymentAmount: parseFloat(dbProp.firstPaymentAmount || dbProp.price),
    paymentFrequency: dbProp.paymentFrequency || 'ANNUAL',
    annualProjections: dbProp.annualProjections || 'Stable Rental Yield'
  };
}

// Lightweight GraphQL client
async function callGraphQL(query, variables = {}) {
  const res = await fetch(API_BASE + '/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}


export default function Dashboard({ userEmail, onSignOut }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, properties, leases, escrow, receipts, developer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Core Data States
  const [properties, setProperties] = useState([]);
  
  // Luxury Real Estate Marketplace States
  const [currency, setCurrency] = useState('NGN');
  const [viewMode, setViewMode] = useState('split'); // 'grid', 'list', 'split'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedBeds, setSelectedBeds] = useState('ALL');
  const [priceMax, setPriceMax] = useState(2000000000);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('prope_fav_properties')) || [];
    } catch {
      return [];
    }
  });
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [floorPlanView, setFloorPlanView] = useState('2D');
  
  // Mortgage Calculator Inputs
  const [downPayment, setDownPayment] = useState(200000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTerm, setLoanTerm] = useState(25);
  
  // Tour Scheduling States
  const [selectedTourDate, setSelectedTourDate] = useState('Mon, Jul 20');
  const [selectedTourTime, setSelectedTourTime] = useState('10:00 AM');
  const [tourScheduled, setTourScheduled] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Refs for scrolling property cards
  const propertyCardRefs = useRef({});

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('prope_fav_properties', JSON.stringify(favorites));
  }, [favorites]);

  // Set down payment when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      setDownPayment(Math.round(selectedProperty.price * 0.2));
      setTourScheduled(false);
      setActiveDetailTab('overview');
    }
  }, [selectedProperty]);

  const [tenancies, setTenancies] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [landlordProfile, setLandlordProfile] = useState(null);


  // Forms States
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyInput, setPropertyInput] = useState({
    title: '', price: '', type: 'RENT', area: '', buildingType: '', imageUrl: '',
    firstPaymentAmount: '', paymentFrequency: 'MONTHLY', annualProjections: '', ownershipDocumentUrl: '',
    beds: '4', baths: '4', size: '4500', built: '2023'
  });

  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [leaseInput, setLeaseInput] = useState({
    propertyId: '', tenantId: '', rentAmount: '', frequency: 'MONTHLY', nextDueDate: '', orderReference: ''
  });

  const [showEscrowForm, setShowEscrowForm] = useState(false);
  const [escrowInput, setEscrowInput] = useState({
    propertyId: '', buyerId: '', amountHeld: '', orderReference: ''
  });

  // Overview Tab Chart States
  const [chartType, setChartType] = useState('inflow'); // inflow, outflow

  // Name Enquiry state
  const [payoutDetails, setPayoutDetails] = useState({
    bankAccountNumber: '', bankCode: '', bankAccountName: ''
  });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [banksList, setBanksList] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);

  // Monnify KYC & Wallet States
  const [userProfile, setUserProfile] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [debitInput, setDebitInput] = useState({ bankCode: '', accountNumber: '', amount: '', narration: '' });
  const [landlordRentPayments, setLandlordRentPayments] = useState([]);

  // Notification State
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);

  function triggerNotification(message, type = 'info') {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 6000);
  }

  // NVIDIA NIM Neighborhood Intelligence States
  const [neighborhoodReports, setNeighborhoodReports] = useState({});
  const [neighborhoodLoading, setNeighborhoodLoading] = useState(false);

  async function handleAnalyzeNeighborhood(property) {
    if (!property || !property.id) return;
    if (neighborhoodReports[property.id]) return; // already cached
    setNeighborhoodLoading(true);
    try {
      const response = await callNimApi({
        messages: [
          {
            role: "system",
            content: "You are an expert luxury real estate data analyst. Provide a professional, detailed, and realistic neighborhood intelligence analysis report for a premium property. Do not use any emojis. Focus on infrastructure, road connections, electricity, flooding/drainage, and safety index. Write in clean markdown sections without bullet emojis."
          },
          {
            role: "user",
            content: `Perform a detailed neighborhood analysis for the property "${property.title}" located in the area "${property.area || 'Lagos, Nigeria'}". The building type is "${property.buildingType || 'Luxury Residence'}". Please cover the following:
1. ENVIRONMENTAL QUALITY: Green spacing, air, and noise levels.
2. ROADS & INFRASTRUCTURE: Traffic, connectivity, and proximity to hubs.
3. ELECTRICITY & GRID POWER: Expected utility grid reliability and backup integration.
4. FLOODING & DRAINAGE: Flood risk level, sea levels, and drainage infrastructure.
5. SAFETY & SECURITY: Patrols, crime stats, and community policing.
6. GENERAL SUMMARY: Conclusion and suitability index.`
          }
        ]
      });
      setNeighborhoodReports(prev => ({ ...prev, [property.id]: response }));
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to fetch neighborhood analysis: " + err.message, "error");
    } finally {
      setNeighborhoodLoading(false);
    }
  }

  useEffect(() => {
    if (activeDetailTab === 'neighborhood' && selectedProperty) {
      handleAnalyzeNeighborhood(selectedProperty);
    }
  }, [activeDetailTab, selectedProperty]);

  async function fetchUserProfile(email) {
    try {
      const data = await callGraphQL(`
        query ($email: String!) {
          getUserProfile(email: $email) {
            id
            email
            role
            name
            nin
            bvn
            kycVerified
            walletAccountNumber
            walletReference
            walletBankName
            walletBalance
          }
        }
      `, { email });
      if (data.getUserProfile) {
        setUserProfile(data.getUserProfile);
        if (data.getUserProfile.walletAccountNumber) {
          fetchWalletTransactions(data.getUserProfile.walletAccountNumber);
        }
      } else {
        const regData = await callGraphQL(`
          mutation ($email: String!) {
            registerUserProfile(email: $email, name: "Sandbox User Profile", role: "TENANT") {
              id
              email
              role
              name
              nin
              bvn
              kycVerified
              walletAccountNumber
              walletReference
              walletBankName
              walletBalance
            }
          }
        `, { email });
        setUserProfile(regData.registerUserProfile);
        if (regData.registerUserProfile.walletAccountNumber) {
          fetchWalletTransactions(regData.registerUserProfile.walletAccountNumber);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  }

  async function fetchWalletTransactions(accountNumber) {
    try {
      const data = await callGraphQL(`
        query ($accountNumber: String!) {
          getUserWalletTransactions(accountNumber: $accountNumber) {
            walletTransactionReference
            monnifyTransactionReference
            amount
            transactionDate
            transactionType
            narration
            status
          }
        }
      `, { accountNumber });
      setWalletTransactions(data.getUserWalletTransactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  }

  // Load profile and collections on startup
  useEffect(() => {
    fetchProfileAndData();
  }, [userEmail]);

  useEffect(() => {
    async function loadBanks() {
      setBanksLoading(true);
      try {
        const res = await fetch(API_BASE + '/api/monnify-sandbox/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'getBanks',
            method: 'GET',
            url: '/v1/transfers/banks'
          })
        });
        const data = await res.json();
        if (data.code === '00' && Array.isArray(data.data)) {
          setBanksList(data.data);
        }
      } catch (err) {
        console.error("Failed to load bank list:", err);
      } finally {
        setBanksLoading(false);
      }
    }
    loadBanks();
  }, []);



  async function fetchProfileAndData() {
    if (!userEmail) return;
    setLoading(true);
    setError(null);
    try {
      // 0. Ensure User Profile exists
      const userProfileData = await callGraphQL(`
        mutation ($email: String!) {
          registerUserProfile(email: $email, name: "Sandbox User Profile", role: "TENANT") {
            id
            email
            role
            name
            nin
            bvn
            kycVerified
            walletAccountNumber
            walletReference
            walletBankName
            walletBalance
          }
        }
      `, { email: userEmail });
      const currentProfile = userProfileData.registerUserProfile;
      setUserProfile(currentProfile);

      // 1. Sync wallet transactions if wallet exists
      if (currentProfile.walletAccountNumber) {
        fetchWalletTransactions(currentProfile.walletAccountNumber);
      }

      // 2. If Landlord, make sure landlord record exists in DB
      if (currentProfile.role === 'LANDLORD') {
        const profileData = await callGraphQL(`
          mutation ($name: String!, $email: String!, $phone: String!) {
            createLandlord(name: $name, email: $email, phone: $phone) {
              id
              name
              email
              phone
              bankAccountNumber
              bankCode
              bankAccountName
            }
          }
        `, {
          name: currentProfile.name || currentProfile.email.split('@')[0],
          email: currentProfile.email,
          phone: '08000000000'
        });
        setLandlordProfile(profileData.createLandlord);
        setPayoutDetails({
          bankAccountNumber: profileData.createLandlord.bankAccountNumber || '',
          bankCode: profileData.createLandlord.bankCode || '',
          bankAccountName: profileData.createLandlord.bankAccountName || ''
        });
      }

      // 3. Fetch all properties
      const propsData = await callGraphQL(`
        query {
          getProperties {
            id
            title
            type
            status
            price
            imageUrl
            area
            buildingType
            availableUnits
            verificationStatus
            beds
            baths
            size
            built
            caretakerName
            caretakerEmail
            caretakerPhone
            landlord {
              email
            }
          }
        }
      `);
      
      // Filter properties: Landlord sees only theirs, Tenant sees all (marketplace)
      let rawProps = propsData.getProperties || [];
      // Remove seed placeholder properties and mock properties
      rawProps = rawProps.filter(p => 
        !p.id.startsWith('a0000000') &&
        p.price && p.price > 0 &&
        !p.title.toLowerCase().includes('unit 3b')
      );
      if (currentProfile.role === 'LANDLORD') {
        rawProps = rawProps.filter(p => p.landlord?.email === currentProfile.email);
      }
      setProperties(rawProps.map(enrichProperty));

      // 4. Fetch active leases/tenancies
      const tenanciesData = await callGraphQL(`
        query {
          getTenancies {
            id
            tenantId
            rentAmount
            frequency
            nextDueDate
            balance
            nombaVirtualAccountId
            nombaOrderReference
            property {
              id
              title
              landlord {
                email
              }
            }
          }
        }
      `);
      
      // Filter leases: Landlord sees only theirs, Tenant sees only theirs
      if (currentProfile.role === 'LANDLORD') {
        setTenancies(tenanciesData.getTenancies.filter(t => t.property?.landlord?.email === currentProfile.email));
      } else {
        setTenancies(tenanciesData.getTenancies.filter(t => t.tenantId === currentProfile.email));
      }

      // 5. Fetch escrows
      const escrowsData = await callGraphQL(`
        query {
          getEscrowTransactions {
            id
            buyerId
            amountHeld
            status
            nombaVirtualAccountId
            nombaOrderReference
            nombaTransactionReference
            nombaPayoutReference
            payoutError
            property {
              id
              title
              landlord {
                email
              }
            }
          }
        }
      `);
      
      // Filter escrows: Landlord sees only theirs, Tenant/Buyer sees only theirs
      if (currentProfile.role === 'LANDLORD') {
        setEscrows(escrowsData.getEscrowTransactions.filter(e => e.property?.landlord?.email === currentProfile.email));
      } else {
        setEscrows(escrowsData.getEscrowTransactions.filter(e => e.buyerId === currentProfile.email));
      }

      // 6. Fetch receipts
      const receiptsData = await callGraphQL(`
        query ($email: String!) {
          getReceipts(tenantEmail: $email) {
            id
            title
            category
            amount
            reference
            details
            createdAt
          }
        }
      `, { email: currentProfile.email });
      setReceipts(receiptsData.getReceipts);

      // 7. Fetch Rent Collections (only for Landlord)
      if (currentProfile.role === 'LANDLORD') {
        const rentPaymentsData = await callGraphQL(`
          query ($email: String!) {
            getLandlordRentPayments(landlordEmail: $email) {
              id
              amount
              nombaReference
              matchedStatus
              receivedAt
              redeemed
              redeemedAt
              redeemPayoutReference
              tenancy {
                id
                property {
                  id
                  title
                }
              }
            }
          }
        `, { email: currentProfile.email });
        setLandlordRentPayments(rentPaymentsData.getLandlordRentPayments || []);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error sync data');
    } finally {
      setLoading(false);
    }
  }

  // Handle Landlord Payout Setup Lookup (Name Enquiry)
  async function handleVerifyPayoutAccount() {
    if (!payoutDetails.bankAccountNumber || !payoutDetails.bankCode) {
      triggerNotification("Please fill both Account Number and Bank Code.", "warning");
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Perform Name Enquiry',
          method: 'POST',
          url: '/v1/transfers/bank/lookup',
          body: {
            accountNumber: payoutDetails.bankAccountNumber,
            bankCode: payoutDetails.bankCode
          }
        })
      });
      const data = await res.json();
      if (data.code === '00' && data.data?.accountName) {
        setPayoutDetails(prev => ({ ...prev, bankAccountName: data.data.accountName }));
        
        // Save to Landlord Profile in Database
        await callGraphQL(`
          mutation ($email: String!, $num: String!, $code: String!, $name: String!) {
            updateLandlordPayoutDetails(
              email: $email,
              bankAccountNumber: $num,
              bankCode: $code,
              bankAccountName: $name
            ) {
              id
              bankAccountName
            }
          }
        `, {
          email: landlordProfile.email,
          num: payoutDetails.bankAccountNumber,
          code: payoutDetails.bankCode,
          name: data.data.accountName
        });
        
        triggerNotification("Landlord Settlement Details Successfully Linked!", "success");
      } else {
        triggerNotification(data.description || "Verification failed on Sandbox.", "error");
      }
    } catch (err) {
      triggerNotification("Verification Request Failed: " + err.message, "error");
    } finally {
      setLookupLoading(false);
    }
  }

  // Handle listing property
  async function handleCreateProperty(e) {
    e.preventDefault();
    if (!landlordProfile) return;
    try {
      const priceVal = parseFloat(propertyInput.price || '0');
      const firstPayVal = propertyInput.firstPaymentAmount ? parseFloat(propertyInput.firstPaymentAmount) : priceVal;
      const freqVal = propertyInput.type === 'SALE' ? 'ONCE' : (propertyInput.paymentFrequency || 'MONTHLY');
      const imgUrlVal = propertyInput.imageUrl.trim() || "/modern_house_preview.jpg";
      const bedsVal = propertyInput.beds ? parseInt(propertyInput.beds) : 4;
      const bathsVal = propertyInput.baths ? parseInt(propertyInput.baths) : 4;
      const sizeVal = propertyInput.size ? parseFloat(propertyInput.size) : 4500;
      const builtVal = propertyInput.built ? parseInt(propertyInput.built) : 2023;

      await callGraphQL(`
        mutation {
          listProperty(
            landlordId: "${landlordProfile.id}",
            title: "${propertyInput.title}",
            type: "${propertyInput.type}",
            status: "LISTED",
            area: "${propertyInput.area}",
            buildingType: "${propertyInput.buildingType}",
            price: ${priceVal},
            imageUrl: "${imgUrlVal}",
            firstPaymentAmount: ${firstPayVal},
            paymentFrequency: "${freqVal}",
            annualProjections: "${propertyInput.annualProjections || ''}",
            ownershipDocumentUrl: "${propertyInput.ownershipDocumentUrl || ''}",
            beds: ${bedsVal},
            baths: ${bathsVal},
            size: ${sizeVal},
            built: ${builtVal}
          ) {
            id
          }
        }
      `);
      triggerNotification("Property Listed Successfully!", "success");
      setShowPropertyForm(false);
      setPropertyInput({
        title: '', price: '', type: 'RENT', area: '', buildingType: '', imageUrl: '',
        firstPaymentAmount: '', paymentFrequency: 'MONTHLY', annualProjections: '', ownershipDocumentUrl: '',
        beds: '4', baths: '4', size: '4500', built: '2023'
      });
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Failed to list property: " + err.message, "error");
    }
  }

  // Handle scheduling private showing tour
  async function handleScheduleTour() {
    if (!selectedProperty || !currentProfile) return;
    try {
      await callGraphQL(`
        mutation {
          createTourAppointment(
            propertyId: "${selectedProperty.id}",
            tenantEmail: "${currentProfile.email}",
            tourDate: "${selectedTourDate}",
            tourTime: "${selectedTourTime}"
          ) {
            id
          }
        }
      `);
      setTourScheduled(true);
      triggerNotification("Showing Appointment Scheduled Successfully!", "success");
    } catch (err) {
      console.error(err);
      triggerNotification("Failed to schedule tour: " + err.message, "error");
    }
  }

  // --- LUXURY REAL ESTATE HELPERS ---
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
    return properties.filter(p => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesArea = p.area?.toLowerCase().includes(query);
        const matchesType = p.buildingType?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesArea && !matchesType) return false;
      }

      // Rent/Sale type
      if (selectedType !== 'ALL' && p.type !== selectedType) return false;

      // Location
      if (selectedLocation !== 'ALL' && !p.area?.toLowerCase().includes(selectedLocation.toLowerCase())) return false;

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

  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const keywords = [];
    properties.forEach(p => {
      if (p.title.toLowerCase().includes(searchQuery.toLowerCase())) keywords.push(p.title);
      if (p.area?.toLowerCase().includes(searchQuery.toLowerCase())) keywords.push(p.area);
      if (p.buildingType?.toLowerCase().includes(searchQuery.toLowerCase())) keywords.push(p.buildingType);
    });
    return [...new Set(keywords)].slice(0, 5);
  };

  const suggestions = getSuggestions();

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

    const escrowTaxesMonthly = (price * 0.0025) / 12;
    const totalMonthly = monthlyPayment + escrowTaxesMonthly;

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

  const handlePinClick = (prop) => {
    setSelectedProperty(prop);
    const cardElement = propertyCardRefs.current[prop.id];
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Initiate payment checkout for buying/renting property using Monnify SDK
  async function initiateCheckout(property) {
    if (!userProfile) {
      triggerNotification("Please log in to complete your transaction.", "warning");
      return;
    }
    if (!window.MonnifySDK) {
      triggerNotification("Monnify payment gateway is initializing. Please try again in a few seconds.", "info");
      return;
    }

    try {
      const configData = await callGraphQL(`
        query {
          getMonnifyConfig {
            apiKey
            contractCode
          }
        }
      `);
      const { apiKey, contractCode } = configData.getMonnifyConfig;

      const isRent = property.type === 'RENT';
      const rentAmt = isRent && property.firstPaymentAmount ? property.firstPaymentAmount : property.price;
      const finalAmt = parseFloat(rentAmt || '0');
      const reference = `prop_chk_${Date.now()}`;
      const description = isRent 
        ? `Rent payment for ${property.title}` 
        : `Escrow purchase deposit for ${property.title}`;

      window.MonnifySDK.initialize({
        amount: finalAmt,
        currency: "NGN",
        reference: reference,
        customerFullName: userProfile.name || userProfile.email.split('@')[0],
        customerEmail: userProfile.email,
        apiKey: apiKey,
        contractCode: contractCode,
        paymentDescription: description,
        onComplete: function (response) {
          console.log("Monnify payment response:", response);
          if (response.paymentStatus === 'PAID') {
            (async () => {
              try {
                if (isRent) {
                  const nextYear = new Date();
                  nextYear.setFullYear(nextYear.getFullYear() + 1);
                  const nextDueDateStr = nextYear.toISOString().split('T')[0];

                  await callGraphQL(`
                    mutation {
                      createTenancy(
                        propertyId: "${property.id}",
                        tenantId: "${userProfile.email}",
                        rentAmount: ${finalAmt},
                        frequency: "${property.paymentFrequency || 'MONTHLY'}",
                        nextDueDate: "${nextDueDateStr}",
                        nombaVirtualAccountId: "${response.transactionReference}",
                        nombaOrderReference: "${response.paymentReference}"
                      ) {
                        id
                      }
                    }
                  `);

                  await callGraphQL(`
                    mutation {
                      createReceipt(
                        title: "Rent Payment: ${property.title}",
                        category: "RENT",
                        amount: ${finalAmt},
                        reference: "${response.transactionReference}",
                        details: "Lease initialized and funded via Web Checkout payment. Transaction Reference: ${response.transactionReference}",
                        tenantEmail: "${userProfile.email}"
                      ) {
                        id
                      }
                    }
                  `);
                  
                  triggerNotification("Rent payment confirmed! Your lease contract is now active.", "success");
                } else {
                  await callGraphQL(`
                    mutation {
                      createEscrowTransaction(
                        propertyId: "${property.id}",
                        buyerId: "${userProfile.email}",
                        amountHeld: ${finalAmt},
                        nombaVirtualAccountId: "${response.transactionReference}",
                        nombaOrderReference: "${response.paymentReference}"
                      ) {
                        id
                      }
                    }
                  `);

                  await callGraphQL(`
                    mutation {
                      createReceipt(
                        title: "Escrow Deposit: ${property.title}",
                        category: "PURCHASE",
                        amount: ${finalAmt},
                        reference: "${response.transactionReference}",
                        details: "Escrow payment deposited and held securely. Transaction Reference: ${response.transactionReference}",
                        tenantEmail: "${userProfile.email}"
                      ) {
                        id
                      }
                    }
                  `);

                  triggerNotification("Purchase payment confirmed! Funds are now securely held under escrow.", "success");
                }

                fetchProfileAndData();
              } catch (err) {
                triggerNotification("Payment succeeded but failed to sync ledger: " + err.message, "warning");
              }
            })();
          } else {
            triggerNotification("Payment transaction was not completed: " + response.paymentStatus, "error");
          }
        },
        onClose: function (data) {
          console.log("Monnify Checkout modal closed.", data);
        }
      });

    } catch (err) {
      triggerNotification("Failed to initialize payment gateway: " + err.message, "error");
    }
  }

  // Handle creating lease tenancy
  async function handleCreateLease(e) {
    e.preventDefault();
    try {
      // 1. Call Sandbox Proxy to Provision Customer Reserved Wema/Sterling account
      const ref = leaseInput.orderReference || `lease_ref_${Date.now()}`;
      const name = `${leaseInput.tenantId} Rent Account`;
      
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Create Customer Virtual Account',
          method: 'POST',
          url: '/v1/accounts/virtual',
          body: {
            accountRef: ref,
            accountName: name
          }
        })
      });
      const data = await res.json();
      if (data.code !== '00' || !data.data?.bankAccountNumber) {
        throw new Error(data.description || "Sandbox Virtual Account provisioning failed.");
      }
      
      const vAccountId = data.data.bankAccountNumber;

      // 2. Call GraphQL to create Tenancy record
      await callGraphQL(`
        mutation {
          createTenancy(
            propertyId: "${leaseInput.propertyId}",
            tenantId: "${leaseInput.tenantId}",
            rentAmount: ${parseFloat(leaseInput.rentAmount)},
            frequency: "${leaseInput.frequency}",
            nextDueDate: "${leaseInput.nextDueDate}",
            nombaVirtualAccountId: "${vAccountId}",
            nombaOrderReference: "${ref}"
          ) {
            id
          }
        }
      `);

      triggerNotification(`Lease Established! Virtual Account Provisioned: ${vAccountId} (${data.data.bankName})`, "success");
      setShowLeaseForm(false);
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Failed to establish lease: " + err.message, "error");
    }
  }

  // Handle creating purchase escrow
  async function handleCreateEscrow(e) {
    e.preventDefault();
    try {
      const ref = escrowInput.orderReference || `escrow_ref_${Date.now()}`;
      const name = `Escrow Purchase Account`;
      
      // 1. Provision Virtual Account for Escrow
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Create Escrow Virtual Account',
          method: 'POST',
          url: '/v1/accounts/virtual',
          body: {
            accountRef: ref,
            accountName: name
          }
        })
      });
      const data = await res.json();
      if (data.code !== '00' || !data.data?.bankAccountNumber) {
        throw new Error(data.description || "Escrow account provisioning failed.");
      }
      
      const vAccountId = data.data.bankAccountNumber;

      // 2. Create Escrow Transaction in database
      await callGraphQL(`
        mutation {
          createEscrowTransaction(
            propertyId: "${escrowInput.propertyId}",
            buyerId: "${escrowInput.buyerId}",
            amountHeld: ${parseFloat(escrowInput.amountHeld)},
            nombaVirtualAccountId: "${vAccountId}",
            nombaOrderReference: "${ref}"
          ) {
            id
          }
        }
      `);

      triggerNotification(`Escrow Account Created! Provisioned virtual account: ${vAccountId}`, "success");
      setShowEscrowForm(false);
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Failed to create escrow: " + err.message, "error");
    }
  }

  // Escrow sync action
  async function handleSyncEscrow(id) {
    try {
      const data = await callGraphQL(`
        mutation {
          synchronizeEscrowPayment(id: "${id}") {
            id
            status
          }
        }
      `);
      triggerNotification(`Sync Action: Status updated to ${data.synchronizeEscrowPayment.status}`, "success");
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Sync failed: " + err.message, "error");
    }
  }

  // Escrow release action
  async function handleReleaseEscrow(id) {
    try {
      const data = await callGraphQL(`
        mutation {
          releaseEscrow(id: "${id}") {
            id
            status
            payoutError
          }
        }
      `);
      if (data.releaseEscrow.payoutError) {
        triggerNotification(`Payout initiation error: ${data.releaseEscrow.payoutError}`, "error");
      } else {
        triggerNotification(`Payout successfully initiated! Status: ${data.releaseEscrow.status}`, "success");
      }
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Release action failed: " + err.message, "error");
    }
  }

  // Escrow reject/refund action
  async function handleRejectEscrow(id) {
    try {
      const data = await callGraphQL(`
        mutation {
          rejectEscrow(id: "${id}") {
            id
            status
          }
        }
      `);
      triggerNotification(`Escrow Rejected! Bank refund initiated. Status: ${data.rejectEscrow.status}`, "success");
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Refund action failed: " + err.message, "error");
    }
  }



  // Monnify Wallet Handlers
  async function handleSyncWalletBalance() {
    if (!userProfile) return;
    setWalletLoading(true);
    setWalletError(null);
    try {
      const data = await callGraphQL(`
        mutation ($email: String!) {
          syncWalletBalance(email: $email) {
            walletBalance
          }
        }
      `, { email: userProfile.email });
      triggerNotification(`Wallet Balance Synced! New Balance: ${parseFloat(data.syncWalletBalance.walletBalance).toLocaleString()} NGN`, "success");
      fetchProfileAndData();
    } catch (err) {
      setWalletError(err.message || "Sync balance failed.");
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleDebitCustomerWallet(e) {
    e.preventDefault();
    if (!userProfile) return;
    if (!debitInput.amount || parseFloat(debitInput.amount) <= 0) {
      triggerNotification("Amount must be greater than zero.", "warning");
      return;
    }
    if (!debitInput.bankCode || !debitInput.accountNumber) {
      triggerNotification("Please fill bank code and recipient account number.", "warning");
      return;
    }
    setWalletLoading(true);
    setWalletError(null);
    try {
      const data = await callGraphQL(`
        mutation ($email: String!, $amount: Float!, $bankCode: String!, $accountNumber: String!, $narration: String!) {
          debitCustomerWallet(
            email: $email,
            amount: $amount,
            destinationBankCode: $bankCode,
            destinationAccountNumber: $accountNumber,
            narration: $narration
          )
        }
      `, {
        email: userProfile.email,
        amount: parseFloat(debitInput.amount),
        bankCode: debitInput.bankCode,
        accountNumber: debitInput.accountNumber,
        narration: debitInput.narration || "Test wallet debit transfer"
      });
      triggerNotification(data.debitCustomerWallet, "success");
      setDebitInput({ bankCode: '', accountNumber: '', amount: '', narration: '' });
      fetchProfileAndData();
    } catch (err) {
      setWalletError(err.message || "Debit transfer failed.");
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleRedeemRentPayment(paymentId) {
    try {
      await callGraphQL(`
        mutation {
          redeemRentPayment(paymentId: "${paymentId}") {
            id
            redeemed
            redeemPayoutReference
          }
        }
      `);
      triggerNotification("Rent payment successfully redeemed to your bank account!", "success");
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Redemption failed: " + err.message, "error");
    }
  }

  async function handleRedeemAllRentPayments() {
    if (!landlordProfile) return;
    try {
      const data = await callGraphQL(`
        mutation {
          redeemAllRentPayments(landlordEmail: "${landlordProfile.email}")
        }
      `);
      triggerNotification(data.redeemAllRentPayments, "success");
      fetchProfileAndData();
    } catch (err) {
      triggerNotification("Redemption failed: " + err.message, "error");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-850 flex flex-col md:flex-row relative font-sans">
      {/* Mobile Top Navigation */}
      <header className="h-16 md:hidden border-b border-[#E5E0D5]/80 bg-[#FAF8F5]/85 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full animate-ping"></div>
          <span className="font-mono tracking-wider font-bold text-sm text-stone-800">PROPE DASHBOARD</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded border border-[#E5E0D5] text-stone-500 hover:text-[#B8934C] transition"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation Panel */}
      <aside className={`w-64 bg-[#F5F2EB]/95 border-r border-[#E5E0D5]/80 flex flex-col justify-between shrink-0 transition-transform duration-300 z-20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        fixed md:sticky top-16 md:top-0 h-[calc(100vh-64px)] md:h-screen w-64`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="hidden md:flex h-16 items-center gap-2.5 px-6 border-b border-[#E5E0D5]/80">
            <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full animate-pulse"></div>
            <span className="font-mono tracking-wider font-bold text-sm text-[#B8934C]">PROPE</span>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-6 text-left">
            <div>
              <p className="px-3 text-[9px] font-mono font-bold tracking-widest text-[#B8934C] uppercase">Management</p>
              <div className="mt-2 space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'properties', label: 'Properties Hub', icon: Building2 },
                  { id: 'leases', label: 'Leases Vault', icon: Users },
                  ...(userProfile && userProfile.role === 'LANDLORD' ? [{ id: 'rent-desk', label: 'Collect Rent Payments', icon: Sparkles }] : []),
                  { id: 'escrow', label: 'Purchase Escrows', icon: Coins },
                  { id: 'receipts', label: 'Receipts Locker', icon: Receipt },
                  { id: 'wallet', label: 'My Wallet & KYC', icon: Landmark },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all duration-300 font-semibold border ${
                        activeTab === item.id 
                          ? 'bg-[#C5A059]/10 border-[#C5A059]/25 text-[#B8934C] font-bold shadow-sm shadow-[#C5A059]/5' 
                          : 'bg-transparent border-transparent text-stone-500 hover:bg-[#C5A059]/5 hover:text-[#B8934C] hover:translate-x-0.5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E5E0D5]/80 space-y-2 text-left bg-[#EFECE3]/30">
          <button
            onClick={fetchProfileAndData}
            disabled={loading}
            className="w-full px-3 py-2 bg-white/60 hover:bg-white/90 border border-[#E5E0D5] rounded-xl text-[10px] text-stone-500 flex items-center gap-2 hover:text-[#B8934C] transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </button>
          <button
            onClick={onSignOut}
            className="w-full px-3 py-2 bg-white/60 hover:bg-white/90 border border-[#E5E0D5] rounded-xl text-[10px] text-stone-500 flex items-center gap-2 hover:text-[#B8934C] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-grow bg-[#FAF8F5] flex flex-col min-h-0 text-left">
        {/* Desktop Top Header */}
        <header className="hidden md:flex h-16 border-b border-[#E5E0D5]/80 px-8 items-center justify-between bg-white/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold text-stone-700 uppercase tracking-widest flex items-center gap-2">
              PROPE SYSTEM / {activeTab.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[10px] font-mono text-stone-500 uppercase">
              Profile: <span className="text-[#B8934C] font-bold">{userEmail}</span>
            </span>
          </div>
        </header>

        {/* Main Work Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                   {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="space-y-1 text-left">
                <h2 className="text-xl font-bold text-stone-800 animate-in fade-in slide-in-from-left-4 duration-300">Overview Dashboard</h2>
                <p className="text-xs text-stone-500">General financial ledger standing and properties sync.</p>
              </div>

              {/* Status Cards Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 text-left">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Wallet Balance</span>
                  <span className="text-xl font-extrabold text-stone-800 block mt-2">
                    {userProfile && userProfile.walletBalance !== null ? parseFloat(userProfile.walletBalance).toLocaleString() : '0.00'}{' '}
                    <span className="text-xs text-stone-500 font-normal">NGN</span>
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 text-left">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Active Properties</span>
                  <span className="text-xl font-extrabold text-[#B8934C] block mt-2">
                    {properties.length} <span className="text-xs text-stone-500 font-normal">listed</span>
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 text-left">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Lease Agreements</span>
                  <span className="text-xl font-extrabold text-[#B8934C] block mt-2">
                    {tenancies.length} <span className="text-xs text-stone-500 font-normal">active</span>
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 text-left">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Escrow Accounts</span>
                  <span className="text-xl font-extrabold text-[#B8934C] block mt-2">
                    {escrows.length} <span className="text-xs text-stone-500 font-normal">managed</span>
                  </span>
                </div>
              </div>

              {/* Analytics & Performance Metrics Section */}
              {(() => {
                const getMonthlyData = () => {
                  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
                  const inflowAmounts = [0, 0, 0, 0, 0, 0];
                  const outflowAmounts = [0, 0, 0, 0, 0, 0];
                  
                  walletTransactions.forEach(t => {
                    if (t.status === 'SUCCESS' || t.status === 'APPROVED') {
                      const date = new Date(t.transactionDate);
                      const monthIndex = date.getMonth();
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const monthName = monthNames[monthIndex];
                      const idx = months.indexOf(monthName);
                      if (idx !== -1) {
                        const amt = parseFloat(t.amount || 0);
                        if (t.transactionType === 'CREDIT') {
                          inflowAmounts[idx] += amt;
                        } else if (t.transactionType === 'DEBIT') {
                          outflowAmounts[idx] += amt;
                        }
                      }
                    }
                  });

                  return { months, amounts: chartType === 'inflow' ? inflowAmounts : outflowAmounts };
                };

                const { months, amounts } = getMonthlyData();
                const totalRevenueVal = walletTransactions
                  .filter(t => t.transactionType === 'CREDIT' && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
                  .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                const totalPayoutsVal = walletTransactions
                  .filter(t => t.transactionType === 'DEBIT' && (t.status === 'SUCCESS' || t.status === 'APPROVED'))
                  .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                const totalEscrowHeldVal = escrows
                  .filter(e => e.status === 'HELD' || e.status === 'UNDER_ESCROW')
                  .reduce((sum, e) => sum + parseFloat(e.amountHeld || 0), 0);
                const expectedRentVal = tenancies
                  .reduce((sum, t) => sum + parseFloat(t.rentAmount || 0), 0);

                const maxAmount = Math.max(...amounts, 10000);
                const ratio = totalRevenueVal > 0 ? (parseFloat(userProfile?.walletBalance || 0) / totalRevenueVal) * 100 : 0;

                return (
                  <div className="grid gap-6 lg:grid-cols-12 text-left animate-in fade-in duration-300">
                    
                    {/* SVG Chart Card (8 cols) */}
                    <div className="lg:col-span-8 bg-white/60 backdrop-blur-md border border-stone-200/80 p-6 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-stone-850 font-serif">Financial Trend Analytics</h3>
                          <p className="text-[10px] text-stone-500">Monthly breakdown of virtual accounts settlements flow.</p>
                        </div>
                        <div className="flex bg-stone-100 border border-stone-200 rounded-xl p-0.5 self-start sm:self-center">
                          <button
                            onClick={() => setChartType('inflow')}
                            className={`px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg transition duration-300 cursor-pointer ${chartType === 'inflow' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
                          >
                            Inflow (Revenue)
                          </button>
                          <button
                            onClick={() => setChartType('outflow')}
                            className={`px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg transition duration-300 cursor-pointer ${chartType === 'outflow' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
                          >
                            Outflow (Payouts)
                          </button>
                        </div>
                      </div>

                      {/* SVG Render */}
                      <div className="h-60 w-full relative mt-2">
                        <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25"/>
                              <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="600" y2="20" stroke="#EFECE3" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="0" y1="70" x2="600" y2="70" stroke="#EFECE3" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="0" y1="120" x2="600" y2="120" stroke="#EFECE3" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="0" y1="170" x2="600" y2="170" stroke="#EFECE3" strokeWidth="0.5" strokeDasharray="3 3" />
                          <line x1="0" y1="200" x2="600" y2="200" stroke="#E5E0D5" strokeWidth="1" />

                          {/* Chart Path */}
                          {(() => {
                            const coords = amounts.map((amt, idx) => {
                              const x = (idx / (amounts.length - 1)) * 600;
                              const y = 200 - (amt / maxAmount) * 160 - 20; // y-axis is inverted: 0 at top, 200 at bottom
                              return { x, y, amt, month: months[idx] };
                            });

                            const polylinePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
                            const areaPoints = `0,200 ${polylinePoints} 600,200`;

                            return (
                              <>
                                {/* Area under the curve */}
                                <polygon points={areaPoints} fill="url(#chartGrad)" />

                                {/* The line path */}
                                <polyline
                                  points={polylinePoints}
                                  fill="none"
                                  stroke="#C5A059"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                {/* Interactive circles/dots */}
                                {coords.map((c, i) => (
                                  <g key={i} className="group/dot cursor-pointer">
                                    <circle
                                      cx={c.x}
                                      cy={c.y}
                                      r="5"
                                      fill="#FAF8F5"
                                      stroke="#C5A059"
                                      strokeWidth="2"
                                      className="transition-all duration-300 group-hover/dot:r-7"
                                    />
                                    <circle
                                      cx={c.x}
                                      cy={c.y}
                                      r="12"
                                      fill="transparent"
                                    />
                                    <foreignObject
                                      x={c.x - 60}
                                      y={c.y - 45}
                                      width="120"
                                      height="40"
                                      className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none"
                                    >
                                      <div className="bg-stone-900 border border-stone-800 text-[8px] font-mono text-white px-2 py-1.5 rounded-lg text-center shadow-md">
                                        <span className="block font-bold">{c.month}</span>
                                        <span className="text-[#C5A059] block font-bold">{formatPrice(c.amt)}</span>
                                      </div>
                                    </foreignObject>
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                      </div>

                      {/* X Axis Months */}
                      <div className="flex justify-between text-[9px] font-mono text-stone-500 px-2 uppercase tracking-wider">
                        {months.map(m => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Summary ledger panel (4 cols) */}
                    <div className="lg:col-span-4 bg-white/60 backdrop-blur-md border border-stone-200/80 p-6 rounded-3xl shadow-xs space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-stone-850 font-serif">Treasury Summary Ledger</h3>
                          <p className="text-[10px] text-stone-500">Real-time indicators compiled from wallet deposits and active agreements.</p>
                        </div>

                        <div className="space-y-3.5 pt-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-500 font-medium">Safe Liquidity:</span>
                            <span className="font-mono text-stone-850 font-bold">{formatPrice(userProfile?.walletBalance || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                            <span className="text-stone-500 font-medium">Total Inflow:</span>
                            <span className="font-mono text-stone-800 font-semibold">{formatPrice(totalRevenueVal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                            <span className="text-stone-500 font-medium">Total Outflow:</span>
                            <span className="font-mono text-stone-800 font-semibold">{formatPrice(totalPayoutsVal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                            <span className="text-stone-500 font-medium">Active Monthly Yield:</span>
                            <span className="font-mono text-stone-800 font-semibold">{formatPrice(expectedRentVal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                            <span className="text-stone-500 font-medium">Escrow Holding Ledger:</span>
                            <span className="font-mono text-[#B8934C] font-semibold">{formatPrice(totalEscrowHeldVal)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-4 border-t border-stone-200">
                        {/* Treasury Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-stone-500 uppercase">
                            <span>Treasury Liquidity Ratio</span>
                            <span>{ratio.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${Math.min(ratio, 100)}%` }} />
                          </div>
                        </div>

                        {/* Rent Match Status Details */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-stone-500 uppercase">
                            <span>Collection Standing</span>
                          </div>
                          <p className="text-[10px] text-stone-600 leading-relaxed">
                            Currently maintaining <strong>{tenancies.length}</strong> active lease agreements. Out of these, <strong>{tenancies.filter(t => parseFloat(t.balance || 0) <= 0).length}</strong> have a clear balance standing.
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })()}

              {/* Settlement Payout Setup Card (only shown for Landlord role) */}
              {userProfile && userProfile.role === 'LANDLORD' && (
                <div className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-3xl space-y-4 shadow-sm text-left">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-stone-850 font-serif">Landlord Settlement Bank Details</h3>
                    <p className="text-[11px] text-stone-550 leading-relaxed">Ensure valid banking credentials are linked to receive payouts automatically from purchase escrows.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 font-mono block">BANK CODE</label>
                      <select 
                        value={payoutDetails.bankCode}
                        onChange={e => setPayoutDetails(prev => ({ ...prev, bankCode: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none cursor-pointer" 
                      >
                        <option value="">{banksLoading ? 'Loading Banks...' : 'Select Bank...'}</option>
                        {banksList.map(b => (
                          <option key={b.bankCode} value={b.bankCode}>
                            {b.bankName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 font-mono block">BANK ACCOUNT NUMBER</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0123456789"
                        value={payoutDetails.bankAccountNumber}
                        onChange={e => setPayoutDetails(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 font-mono block">LINKED ACCOUNT NAME</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={payoutDetails.bankAccountName || 'Unverified'}
                          className="flex-grow px-3 py-2.5 bg-stone-100/50 border border-stone-200/50 rounded-xl text-xs text-stone-500 font-mono cursor-not-allowed" 
                        />
                        <button 
                          onClick={handleVerifyPayoutAccount}
                          disabled={lookupLoading}
                          className="px-4 bg-[#C5A059] hover:bg-[#C5A059]/90 disabled:bg-stone-200 text-white text-xs font-bold rounded-xl transition duration-300"
                        >
                          {lookupLoading ? '...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WALLET & KYC PANEL */}
          {/* TAB: WALLET & KYC STATEMENT */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="space-y-1 text-left">
                <h2 className="text-xl font-bold text-stone-800 animate-in fade-in slide-in-from-left-4 duration-300">My Wallet & KYC</h2>
                <p className="text-xs text-stone-500">View statement details and government-linked KYC records for your personal wallet.</p>
              </div>

              {walletError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono text-left animate-in shake duration-300">
                  {walletError}
                </div>
              )}

              {/* Loader */}
              {walletLoading && (
                <div className="p-4 bg-[#C5A059]/10 border border-[#C5A059]/25 text-stone-700 text-xs rounded-xl flex items-center gap-2 text-left animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B8934C]" />
                  Processing request against Monnify Sandbox...
                </div>
              )}

              {userProfile && (
                <div className="grid gap-8 lg:grid-cols-12 text-left items-start">
                  
                  {/* Left Column: KYC Verification & Wallet Cards */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Active Monnify Wallet Card */}
                    {userProfile.walletAccountNumber ? (
                      <div className="space-y-6 text-left animate-in slide-in-from-bottom-4 duration-400">
                        
                        {/* Premium Luxury Credit Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-stone-850 via-stone-900 to-stone-950 border border-[#C5A059]/40 p-6 rounded-3xl space-y-8 shadow-md shadow-stone-900/10">
                          {/* Radial overlay */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
                          
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-[7px] font-mono tracking-widest text-[#C5A059] font-bold uppercase">Prope Wallet Account</span>
                              <h3 className="text-sm font-bold text-slate-100 truncate">{userProfile.name || 'Personal Wallet'}</h3>
                            </div>
                            <div className="px-2 py-1 rounded bg-white/10 text-white border border-white/10 flex items-center gap-1 font-mono text-[7px] tracking-widest uppercase">
                              <Landmark className="w-3 h-3 text-[#C5A059]" />
                              PROPE PAY
                            </div>
                          </div>

                          <div className="space-y-5">
                            <div>
                              <span className="text-[8px] font-mono text-stone-500 uppercase tracking-wider block">Dedicated Bank Account</span>
                              <span className="text-base font-mono font-bold text-slate-100 tracking-widest block mt-0.5 select-all">
                                {userProfile.walletAccountNumber.match(/.{1,4}/g)?.join(' ') || userProfile.walletAccountNumber}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                              <div>
                                <span className="text-[8px] font-mono text-stone-500 uppercase block">Provider Bank</span>
                                <span className="font-bold text-slate-200 block mt-0.5">{userProfile.walletBankName || 'Moniepoint MFB'}</span>
                              </div>
                              <div>
                                <span className="text-[8px] font-mono text-stone-500 uppercase block">Wallet Reference</span>
                                <span className="font-mono text-slate-300 block mt-0.5 truncate select-all">{userProfile.walletReference}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Balance Standing */}
                        <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl flex justify-between items-center shadow-sm hover:border-[#C5A059]/40 transition-all duration-300">
                          <div className="space-y-0.5 text-left">
                            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">Real-Time Available Balance</span>
                            <span className="text-xl font-extrabold text-stone-800 block">
                              {parseFloat(userProfile.walletBalance || 0).toLocaleString()}{' '}
                              <span className="text-xs font-normal text-stone-500">NGN</span>
                            </span>
                          </div>
                          <button
                            onClick={handleSyncWalletBalance}
                            className="p-2.5 bg-white border border-[#E5E0D5] hover:border-[#C5A059] rounded-xl text-stone-500 hover:text-[#B8934C] transition duration-300 cursor-pointer shadow-xs"
                            title="Sync Balance"
                          >
                            <RefreshCw className="w-4 h-4 animate-spin-hover" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-white/60 backdrop-blur-md border border-white rounded-3xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                        <ShieldAlert className="w-8 h-8 text-rose-450 mx-auto animate-bounce" />
                        <h3 className="font-bold text-sm text-stone-850">No Wallet Account Found</h3>
                        <p className="text-xs text-stone-500">Your profile does not contain a Monnify Sandbox Wallet. Contact administration to review onboarding states.</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: KYC Verification Info & Transactions statement */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* KYC Verification Info */}
                    <div className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-3xl space-y-4 text-left shadow-xs">
                      <div className="flex justify-between items-center border-b border-stone-200/50 pb-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-stone-850">KYC & Identity Verification</h3>
                          <p className="text-[10px] text-stone-500">Official government-linked KYC credentials registered with the Monnify Gateway.</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-[9px] font-bold uppercase font-mono">KYC VERIFIED</span>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        <div className="space-y-1 bg-[#FAF8F5]/80 p-4 rounded-2xl border border-stone-200/40">
                          <span className="text-stone-500 block text-[9px] uppercase font-mono">Bank Verification Number (BVN)</span>
                          <span className="font-mono text-stone-750 font-bold select-all">
                            {userProfile.bvn ? `******${userProfile.bvn.slice(-4)}` : 'Verified via BVN'}
                          </span>
                        </div>
                        <div className="space-y-1 bg-[#FAF8F5]/80 p-4 rounded-2xl border border-stone-200/40">
                          <span className="text-stone-500 block text-[9px] uppercase font-mono">National Identification Number (NIN)</span>
                          <span className="font-mono text-stone-750 font-bold select-all">
                            {userProfile.nin ? `******${userProfile.nin.slice(-4)}` : 'Verified via NIN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Statement Redesign */}
                    {userProfile.walletAccountNumber && (
                      <div className="bg-white/60 backdrop-blur-md border border-white rounded-3xl overflow-hidden text-left shadow-xs">
                        <div className="p-5 border-b border-stone-200/50 flex justify-between items-center bg-[#F5F2EB]/30">
                          <div className="space-y-0.5">
                            <h3 className="text-xs font-bold text-stone-850 uppercase tracking-wider font-mono">Wallet Transaction Statement</h3>
                            <p className="text-[10px] text-stone-500">Live ledger of incoming bank transfers and outgoing payouts.</p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#B8934C] rounded-lg font-mono text-[9px] font-bold">
                            {walletTransactions.length} Events
                          </span>
                        </div>

                        {walletTransactions.length === 0 ? (
                          <div className="py-16 text-center text-stone-400 text-xs font-mono">
                            No transactions recorded on this wallet account yet.
                          </div>
                        ) : (
                          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                            {walletTransactions.map(tx => {
                              const isDebit = tx.transactionType === 'DEBIT';
                              return (
                                <div 
                                  key={tx.walletTransactionReference} 
                                  className="p-4 rounded-2xl border border-stone-100 bg-[#FAF8F5]/60 flex items-center justify-between gap-4 hover:border-[#C5A059]/40 hover:bg-white transition-all duration-300 shadow-2xs hover:shadow-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    {/* Flow Icon */}
                                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                                      isDebit 
                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                    }`}>
                                      {isDebit ? (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                                      ) : (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                                      )}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                      <h4 className="text-xs font-bold text-stone-850 truncate max-w-[200px]" title={tx.narration}>
                                        {tx.narration || (isDebit ? 'Outgoing Ledger Payout' : 'Incoming Wallet Deposit')}
                                      </h4>
                                      <div className="flex items-center gap-1.5 text-[8px] font-mono text-stone-400">
                                        <span>REF: {tx.walletTransactionReference}</span>
                                        <span>&middot;</span>
                                        <span>{new Date(tx.transactionDate).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className={`text-xs font-bold font-mono ${isDebit ? 'text-rose-500' : 'text-emerald-600'}`}>
                                      {isDebit ? '-' : '+'} {parseFloat(tx.amount).toLocaleString()} ₦
                                    </span>
                                    <span className="text-[8px] font-mono text-stone-400 block uppercase mt-0.5 tracking-wider">
                                      {tx.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROPERTIES HU          {/* TAB 2: PROPERTIES HUB */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              
              {/* Properties Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl font-bold font-serif text-stone-900">Properties Hub</h2>
                  <p className="text-xs text-stone-500 font-medium">Onboard, configure, and browse luxury listings.</p>
                </div>
                {userProfile && userProfile.role === 'LANDLORD' && (
                  <button
                    onClick={() => setShowPropertyForm(!showPropertyForm)}
                    className="px-4 py-2 bg-[#C5A059] hover:bg-[#C5A059]/95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition duration-300 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    List Property
                  </button>
                )}
              </div>

              {/* Form Modal */}
              {showPropertyForm && (
                <form onSubmit={handleCreateProperty} className="bg-white/60 backdrop-blur-md border border-[#E5E0D5]/80 p-6 rounded-3xl grid gap-4 sm:grid-cols-2 text-left shadow-md">
                  <h3 className="sm:col-span-2 text-sm font-bold text-[#B8934C] font-serif uppercase tracking-wider">Register New Property Listing</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">PROPERTY TITLE</label>
                    <input required type="text" placeholder="e.g. The Obsidian Penthouse" value={propertyInput.title} onChange={e => setPropertyInput({...propertyInput, title: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">LISTING TYPE</label>
                    <select value={propertyInput.type} onChange={e => setPropertyInput({...propertyInput, type: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none cursor-pointer">
                      <option value="RENT">RENT (Lease agreements)</option>
                      <option value="SALE">SALE (Escrow purchase)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">PRICE (NGN)</label>
                    <input required type="number" placeholder="e.g. 1850000000" value={propertyInput.price} onChange={e => setPropertyInput({...propertyInput, price: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">NEIGHBORHOOD AREA</label>
                    <input required type="text" placeholder="e.g. Banana Island, Lagos" value={propertyInput.area} onChange={e => setPropertyInput({...propertyInput, area: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">BUILDING TYPE</label>
                    <input required type="text" placeholder="e.g. Duplex Penthouse" value={propertyInput.buildingType} onChange={e => setPropertyInput({...propertyInput, buildingType: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">IMAGE URL (OPTIONAL)</label>
                    <input type="text" placeholder="e.g. https://images.unsplash.com/..." value={propertyInput.imageUrl} onChange={e => setPropertyInput({...propertyInput, imageUrl: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">FIRST PAYMENT AMOUNT (NGN) (OPTIONAL)</label>
                    <input type="number" placeholder="Defaults to full price" value={propertyInput.firstPaymentAmount} onChange={e => setPropertyInput({...propertyInput, firstPaymentAmount: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  {propertyInput.type === 'RENT' && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 font-mono block">RENT PAYMENT FREQUENCY</label>
                      <select value={propertyInput.paymentFrequency} onChange={e => setPropertyInput({...propertyInput, paymentFrequency: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none cursor-pointer">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="BI_ANNUAL">Bi-Annually</option>
                        <option value="ANNUAL">Annually</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">ANNUAL PROJECTIONS (OPTIONAL)</label>
                    <input type="text" placeholder="e.g. 14.5% YoY Yield" value={propertyInput.annualProjections} onChange={e => setPropertyInput({...propertyInput, annualProjections: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">BEDS</label>
                    <input required type="number" placeholder="4" value={propertyInput.beds} onChange={e => setPropertyInput({...propertyInput, beds: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">BATHS</label>
                    <input required type="number" placeholder="4" value={propertyInput.baths} onChange={e => setPropertyInput({...propertyInput, baths: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">SIZE (SQ FT)</label>
                    <input required type="number" placeholder="4500" value={propertyInput.size} onChange={e => setPropertyInput({...propertyInput, size: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">YEAR BUILT</label>
                    <input required type="number" placeholder="2023" value={propertyInput.built} onChange={e => setPropertyInput({...propertyInput, built: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">TITLE DEED / OWNERSHIP LINK (OPTIONAL)</label>
                    <input type="text" placeholder="e.g. Google Drive link" value={propertyInput.ownershipDocumentUrl} onChange={e => setPropertyInput({...propertyInput, ownershipDocumentUrl: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs font-mono text-stone-750 placeholder-stone-400 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#C5A059]/95 text-white text-xs font-bold rounded-xl transition duration-300 cursor-pointer shadow-sm">Create Property</button>
                    <button type="button" onClick={() => setShowPropertyForm(false)} className="px-5 py-2.5 border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 text-xs font-bold rounded-xl transition cursor-pointer">Cancel</button>
                  </div>
                </form>
              )}

              {/* Glassmorphic Filters & Toggles Header Bar */}
              <div className="bg-white/60 backdrop-blur-md border border-stone-200/80 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                
                {/* Search query input */}
                <div className="flex-1 max-w-md relative">
                  <div className="flex items-center bg-[#FAF8F5] border border-stone-200/60 focus-within:border-[#C5A059] rounded-xl px-3 py-2 transition-all">
                    <Search className="w-4 h-4 mr-2 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder="Filter by title, type, neighborhood..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowFiltersDropdown(true);
                      }}
                      onFocus={() => setShowFiltersDropdown(true)}
                      className="w-full bg-transparent border-none outline-none text-xs text-stone-750 placeholder-stone-400 focus:ring-0"
                    />
                    <button 
                      onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                      className="p-1 rounded text-[#C5A059] hover:bg-[#C5A059]/10 transition cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Autocomplete list */}
                  {showFiltersDropdown && searchQuery.trim() && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2 z-30 shadow-2xl text-left">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item);
                            setShowFiltersDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg text-stone-700 hover:bg-[#C5A059]/10 hover:text-[#B8934C] transition cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                  {showFiltersDropdown && searchQuery.trim() && (
                    <div className="fixed inset-0 z-20" onClick={() => setShowFiltersDropdown(false)} />
                  )}
                </div>

                {/* Switchers & View Toggles */}
                <div className="flex items-center gap-3 justify-end">
                  
                  {/* Currency Switcher */}
                  <div className="relative">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="appearance-none bg-white border border-stone-200 text-[#B8934C] text-xs font-mono font-bold tracking-wider px-3.5 py-2 rounded-xl pr-8 focus:outline-none focus:border-[#C5A059] cursor-pointer"
                    >
                      <option value="NGN">₦ NGN</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
                  </div>

                  {/* View Toggles */}
                  <div className="flex bg-stone-100 border border-stone-200 rounded-xl p-0.5">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('split')}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'split' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500 hover:text-stone-700'}`}
                      title="Split Map View"
                    >
                      <Map className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Extra filter criteria dropdown */}
              {showFiltersDropdown && (
                <div className="bg-white border border-[#E5E0D5]/80 rounded-3xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-left animate-in slide-in-from-top-2 duration-150 shadow-md">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-stone-500">Property Type</label>
                    <select 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-stone-750 focus:outline-none focus:border-[#C5A059] cursor-pointer"
                    >
                      <option value="ALL">All Types</option>
                      <option value="RENT">Rent (Leases)</option>
                      <option value="SALE">Sale (Escrow)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-stone-500">Neighborhood</label>
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-stone-750 focus:outline-none focus:border-[#C5A059] cursor-pointer"
                    >
                      <option value="ALL">All Neighborhoods</option>
                      <option value="Banana Island">Banana Island, Lagos</option>
                      <option value="Ikoyi">Ikoyi, Lagos</option>
                      <option value="Lekki">Lekki Phase 1, Lagos</option>
                      <option value="Malibu">Malibu, California</option>
                      <option value="Aspen">Aspen, Colorado</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-stone-500">Bedrooms</label>
                    <div className="flex gap-1">
                      {['ALL', '4', '5', '6'].map(bed => (
                        <button
                          key={bed}
                          type="button"
                          onClick={() => setSelectedBeds(bed)}
                          className={`flex-1 text-xs py-2 rounded-xl font-mono border transition duration-300 cursor-pointer ${selectedBeds === bed ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#B8934C] font-bold' : 'bg-[#FAF8F5] border-stone-200 text-stone-500 hover:border-stone-300'}`}
                        >
                          {bed}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-stone-500">Max Price</label>
                      <span className="text-[10px] font-mono text-[#C5A059] font-bold">{formatPrice(priceMax)}</span>
                    </div>
                    <div className="pt-2">
                      <input 
                        type="range"
                        min={100000000}
                        max={2500000000}
                        step={50000000}
                        value={priceMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="w-full h-1 bg-[#E5E0D5] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-4 flex justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedType('ALL');
                        setSelectedLocation('ALL');
                        setSelectedBeds('ALL');
                        setPriceMax(2000000000);
                      }}
                      className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 transition cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFiltersDropdown(false)}
                      className="px-4 py-1.5 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Close Panel
                    </button>
                  </div>
                </div>
              )}

              {/* Listings Display */}
              {filteredProperties.length === 0 ? (
                <div className="py-24 text-center border border-stone-200 border-dashed rounded-3xl bg-white/20">
                  <Building2 className="w-8 h-8 text-stone-400 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-stone-500 uppercase tracking-wider">No matching properties listed</p>
                </div>
              ) : viewMode === 'split' ? (
                /* SPLIT MAP + CARDS VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left listings list */}
                  <div className="lg:col-span-7 space-y-6 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                    {filteredProperties.map(p => {
                      const isHovered = hoveredCardId === p.id || hoveredPinId === p.id;
                      const images = p.images || [p.imageUrl || '/dashboard_preview.jpg'];
                      const curImgIdx = activeImageIndex[p.id] || 0;

                      return (
                        <div 
                          key={p.id}
                          ref={(el) => propertyCardRefs.current[p.id] = el}
                          onMouseEnter={() => setHoveredCardId(p.id)}
                          onMouseLeave={() => setHoveredCardId(null)}
                          onClick={() => setSelectedProperty(p)}
                          className={`w-full border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col md:flex-row hover:shadow-lg cursor-pointer text-left ${
                            isHovered ? 'border-[#C5A059] bg-white' : 'border-stone-200/60 bg-white/60'
                          }`}
                        >
                          {/* Image Carousel */}
                          <div className="w-full md:w-64 h-48 relative overflow-hidden group/img shrink-0">
                            <img src={images[curImgIdx]} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-102" />
                            <div className="absolute inset-0 bg-black/10" />

                            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <button onClick={(e) => handlePrevImage(p.id, images.length, e)} className="p-1 rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:text-[#B8934C] hover:bg-white"><ChevronLeft className="w-3 h-3" /></button>
                              <button onClick={(e) => handleNextImage(p.id, images.length, e)} className="p-1 rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:text-[#B8934C] hover:bg-white"><ChevronRight className="w-3 h-3" /></button>
                            </div>

                            <span className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm border border-stone-700 text-[6px] font-mono tracking-widest px-1.5 py-0.5 rounded text-white uppercase">{p.type}</span>
                            <span className="absolute top-2 right-2 bg-[#C5A059] text-white text-[6px] font-mono tracking-widest px-1.5 py-0.5 rounded uppercase font-bold">{p.tag}</span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold font-serif text-sm text-stone-800">{p.title}</h4>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button onClick={(e) => toggleFavorite(p.id, e)} className={`p-1.5 rounded-lg border transition ${favorites.includes(p.id) ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'border-stone-200 hover:bg-stone-100 text-stone-500'}`}>
                                    <Heart className="w-3.5 h-3.5" fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                                  </button>
                                  <div className="relative">
                                    <button onClick={(e) => handleShare(p, e)} className={`p-1.5 rounded-lg border transition ${copiedId === p.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-stone-200 hover:bg-stone-100 text-stone-500'}`}>
                                      <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    {copiedId === p.id && <span className="absolute bottom-full right-0 mb-1 px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-[6px] text-white font-mono uppercase">Copied</span>}
                                  </div>
                                </div>
                              </div>
                              <p className="text-[9px] text-[#C5A059] font-mono uppercase tracking-wider">{p.buildingType} &middot; {p.area}</p>
                              <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">{p.description}</p>
                            </div>

                            <div className="border-t border-stone-150 pt-3 mt-3 flex items-center justify-between text-xs font-mono text-stone-550">
                              <div className="flex gap-2.5 text-[8px]">
                                <span className="flex items-center gap-1"><Bed className="w-3 h-3 text-[#C5A059]" /> {p.beds} Bds</span>
                                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#C5A059]" /> {p.baths} Bth</span>
                                <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-[#C5A059]" /> {p.sqft} SqFt</span>
                              </div>
                              <div>
                                <span className="text-[#C5A059] font-bold text-xs">{formatPrice(p.price)}</span>
                                {p.type === 'RENT' && <span className="text-[7px] text-stone-500">/{p.paymentFrequency}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right stylized SVG map */}
                  <div className="lg:col-span-5 h-[65vh] rounded-3xl overflow-hidden border border-stone-200 bg-[#FAF8F5] relative shadow-2xs">
                    <svg className="w-full h-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <rect width="100" height="100" fill="#F4F1EA" />
                      <path d="M 0 60 Q 30 75, 50 65 T 100 80 L 100 100 L 0 100 Z" fill="#EFECE3" opacity="0.8" />
                      <path d="M 0 65 Q 25 78, 48 70 T 100 85 L 100 100 L 0 100 Z" fill="#FAF8F5" opacity="0.9" />
                      <path d="M 30 0 Q 35 25, 45 40 T 60 70" fill="none" stroke="#EFECE3" strokeWidth="3" opacity="0.7" />
                      <line x1="10" y1="0" x2="30" y2="60" stroke="#EFECE3" strokeWidth="0.6" strokeDasharray="1 1" />
                      <line x1="40" y1="0" x2="50" y2="68" stroke="#EFECE3" strokeWidth="0.6" />
                      <line x1="70" y1="0" x2="85" y2="75" stroke="#EFECE3" strokeWidth="0.6" strokeDasharray="2 1" />
                      <line x1="0" y1="20" x2="100" y2="25" stroke="#EFECE3" strokeWidth="0.6" />
                      <line x1="0" y1="45" x2="100" y2="40" stroke="#EFECE3" strokeWidth="0.6" strokeDasharray="1 1" />
                      <line x1="0" y1="58" x2="100" y2="62" stroke="#EFECE3" strokeWidth="0.8" />
                      <path d="M 12 10 Q 22 5, 20 22 T 5 15 Z" fill="#FAF8F5" opacity="0.6" />
                      <path d="M 80 15 Q 92 10, 88 32 T 72 25 Z" fill="#FAF8F5" opacity="0.5" />
                    </svg>

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
                            left: `${p.mapCoords?.x || 50}%`,
                            top: `${p.mapCoords?.y || 50}%`,
                            transform: 'translate(-50%, -100%)'
                          }}
                          className={`z-20 flex flex-col items-center transition-transform cursor-pointer ${isHovered ? 'scale-110 z-30' : 'scale-100'}`}
                        >
                          <div className={`px-2 py-1 rounded text-[8px] font-bold font-mono border transition ${isHovered ? 'bg-[#C5A059] border-[#C5A059] text-white font-bold' : 'bg-[#FAF8F5] border-stone-200 text-stone-600'}`}>
                            {priceLabel}
                          </div>
                          <div className={`w-1.5 h-1.5 -mt-0.5 border-t-[4px] border-x-[3px] border-x-transparent ${isHovered ? 'border-t-[#C5A059]' : 'border-t-[#FAF8F5]'}`} />
                          {isHovered && <div className="w-5 h-5 -mt-3 rounded-full bg-[#C5A059]/25 animate-ping absolute" />}
                        </button>
                      );
                    })}
                  </div>

                </div>
              ) : (
                /* GRID AND LIST VIEWS */
                <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-4 grid-cols-1'}>
                  {filteredProperties.map(p => {
                    const isHovered = hoveredCardId === p.id;
                    const images = p.images || [p.imageUrl || '/dashboard_preview.jpg'];
                    const curImgIdx = activeImageIndex[p.id] || 0;

                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedProperty(p)}
                        onMouseEnter={() => setHoveredCardId(p.id)}
                        onMouseLeave={() => setHoveredCardId(null)}
                        className={`border rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg text-left ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''} ${
                          isHovered ? 'border-[#C5A059] bg-white' : 'border-stone-200/60 bg-white/60'
                        }`}
                      >
                        {/* Image Carousel */}
                        <div className={`relative overflow-hidden group/img shrink-0 ${viewMode === 'list' ? 'w-full md:w-64 h-48' : 'h-52'}`}>
                          <img src={images[curImgIdx]} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-102" />
                          <div className="absolute inset-0 bg-black/10" />

                          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <button onClick={(e) => handlePrevImage(p.id, images.length, e)} className="p-1 rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:text-[#B8934C] hover:bg-white cursor-pointer"><ChevronLeft className="w-3 h-3" /></button>
                            <button onClick={(e) => handleNextImage(p.id, images.length, e)} className="p-1 rounded-full bg-white/90 border border-stone-200 text-stone-600 hover:text-[#B8934C] hover:bg-white cursor-pointer"><ChevronRight className="w-3 h-3" /></button>
                          </div>

                          <span className="absolute top-2.5 left-2.5 bg-stone-900/80 border border-stone-700 text-[6px] font-mono tracking-widest px-1.5 py-0.5 rounded text-white uppercase font-bold">{p.type}</span>
                          <span className="absolute top-2.5 right-2.5 bg-[#C5A059] text-white text-[6px] font-mono tracking-widest px-1.5 py-0.5 rounded uppercase font-bold">{p.tag}</span>
                        </div>

                        {/* Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold font-serif text-sm text-stone-850">{p.title}</h4>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={(e) => toggleFavorite(p.id, e)} className={`p-1.5 rounded-lg border transition cursor-pointer ${favorites.includes(p.id) ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'border-stone-200 hover:bg-stone-100 text-stone-500'}`}>
                                  <Heart className="w-3.5 h-3.5" fill={favorites.includes(p.id) ? "currentColor" : "none"} />
                                </button>
                                <div className="relative">
                                  <button onClick={(e) => handleShare(p, e)} className={`p-1.5 rounded-lg border transition cursor-pointer ${copiedId === p.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-stone-200 hover:bg-stone-100 text-stone-500'}`}>
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                  {copiedId === p.id && <span className="absolute bottom-full right-0 mb-1 px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-[6px] text-white font-mono uppercase">Copied</span>}
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-[#C5A059] font-mono uppercase tracking-wider">{p.buildingType} &middot; {p.area}</p>
                            <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">{p.description}</p>
                          </div>

                          <div className="border-t border-stone-150 pt-3 mt-4 flex items-center justify-between text-xs font-mono text-stone-500">
                            <div className="flex gap-2.5 text-[8px]">
                              <span className="flex items-center gap-1"><Bed className="w-3 h-3 text-[#C5A059]" /> {p.beds} Bds</span>
                              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#C5A059]" /> {p.baths} Bth</span>
                              <span className="flex items-center gap-1"><Maximize className="w-3 h-3 text-[#C5A059]" /> {p.sqft} SqFt</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[#C5A059] font-bold text-xs">{formatPrice(p.price)}</span>
                              {p.type === 'RENT' && <span className="text-[7px] text-stone-500 block">/{p.paymentFrequency}</span>}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: LEASES VAULT */}
          {activeTab === 'leases' && (
            <div className="space-y-6">
              
              {/* Leases Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl font-bold text-stone-800">Leases Vault</h2>
                  <p className="text-xs text-stone-500">View active leases and ledger standing contracts.</p>
                </div>
                {userProfile && userProfile.role === 'LANDLORD' && (
                  <button
                    onClick={() => setShowLeaseForm(!showLeaseForm)}
                    className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#C5A059]/95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-sm shadow-[#C5A059]/10"
                  >
                    <Plus className="w-4 h-4" />
                    Establish Lease
                  </button>
                )}
              </div>

              {/* Form Modal */}
              {showLeaseForm && (
                <form onSubmit={handleCreateLease} className="bg-white/70 backdrop-blur-md border border-[#E5E0D5]/80 p-6 rounded-3xl grid gap-4 sm:grid-cols-2 text-left animate-in slide-in-from-top-4 duration-200">
                  <h3 className="sm:col-span-2 text-sm font-bold font-serif text-[#B8934C] uppercase tracking-wider">Configure New Lease Agreement</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">SELECT PROPERTY</label>
                    <select required value={leaseInput.propertyId} onChange={e => setLeaseInput({...leaseInput, propertyId: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none cursor-pointer">
                      <option value="">-- Choose RENT property --</option>
                      {properties.filter(p => p.type === 'RENT').map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">TENANT EMAIL</label>
                    <input required type="email" placeholder="e.g. tenant@reflow.com" value={leaseInput.tenantId} onChange={e => setLeaseInput({...leaseInput, tenantId: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">RENT AMOUNT (NGN)</label>
                    <input required type="number" placeholder="e.g. 15000000" value={leaseInput.rentAmount} onChange={e => setLeaseInput({...leaseInput, rentAmount: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">NEXT DUE DATE</label>
                    <input required type="date" value={leaseInput.nextDueDate} onChange={e => setLeaseInput({...leaseInput, nextDueDate: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white text-xs font-bold rounded-xl transition-all duration-300">Deploy Lease</button>
                    <button type="button" onClick={() => setShowLeaseForm(false)} className="px-5 py-2.5 border border-[#E5E0D5] text-stone-500 text-xs font-semibold rounded-xl transition-all duration-300">Cancel</button>
                  </div>
                </form>
              )}

              {/* Leases Summary Metrics */}
              {tenancies.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Active Contracts</span>
                      <span className="text-xl font-bold font-serif text-stone-850 mt-1 block">{tenancies.length} Leases</span>
                    </div>
                    <div className="p-3 bg-[#C5A059]/10 text-[#B8934C] rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Active Monthly Yield</span>
                      <span className="text-xl font-bold font-mono text-[#B8934C] mt-1 block">
                        {formatPrice(tenancies.reduce((acc, curr) => acc + parseFloat(curr.rentAmount || 0), 0))}
                      </span>
                    </div>
                    <div className="p-3 bg-[#C5A059]/10 text-[#B8934C] rounded-xl">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">Outstanding Standing</span>
                      {(() => {
                        const totalOutstanding = tenancies.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);
                        return (
                          <span className={`text-xl font-bold font-mono mt-1 block ${totalOutstanding < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {formatPrice(totalOutstanding)}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="p-3 bg-[#C5A059]/10 text-[#B8934C] rounded-xl">
                      <Landmark className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Leases Grid layout */}
              {tenancies.length === 0 ? (
                <div className="py-24 text-center border border-[#E5E0D5] border-dashed rounded-3xl bg-white/20">
                  <Users className="w-8 h-8 text-stone-400 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-stone-500 uppercase tracking-wider">No active lease agreements found</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {tenancies.map(t => {
                    const hasDebt = parseFloat(t.balance || 0) < 0;
                    return (
                      <div 
                        key={t.id} 
                        className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-[#C5A059]/40 transition-all duration-300 text-left relative flex flex-col justify-between space-y-4 animate-in fade-in zoom-in-95 duration-200"
                      >
                        <div className="space-y-3.5">
                          {/* Property Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-mono tracking-widest text-[#B8934C] uppercase block">Standing Tenancy</span>
                              <h4 className="font-serif font-bold text-base text-stone-850 mt-0.5">{t.property?.title || 'Luxury Residence'}</h4>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-mono font-bold tracking-wider uppercase border ${
                              hasDebt ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                            }`}>
                              {hasDebt ? 'Arrears Outstanding' : 'Paid Standing'}
                            </span>
                          </div>

                          {/* Tenant Info Pill */}
                          <div className="flex items-center gap-2.5 bg-stone-100/50 p-2.5 rounded-xl border border-stone-200/40">
                            <div className="w-6 h-6 rounded-full bg-[#C5A059]/15 text-[#B8934C] flex items-center justify-center font-bold font-mono text-[10px] shrink-0">
                              {t.tenantId.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-[8px] font-mono text-stone-500 uppercase block">Registered Tenant</span>
                              <p className="text-[11px] font-mono text-stone-750 truncate">{t.tenantId}</p>
                            </div>
                          </div>

                          {/* Monnify Virtual Account Box */}
                          <div className="bg-[#FAF8F5]/80 border border-[#E5E0D5]/60 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono text-stone-500 uppercase">Monnify Virtual Account</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(t.nombaVirtualAccountId || '');
                                  triggerNotification('Virtual account reference copied!', 'success');
                                }}
                                className="text-[8px] font-mono text-[#B8934C] hover:underline cursor-pointer"
                              >
                                [Copy]
                              </button>
                            </div>
                            <p className="font-mono text-sm font-extrabold text-[#B8934C] tracking-wider">
                              {t.nombaVirtualAccountId || 'Generating Virtual Account...'}
                            </p>
                            <span className="text-[7px] font-mono text-stone-400 uppercase tracking-widest block">
                              Automated Bank Transfer Destination Bank: WEMA / STERLING
                            </span>
                          </div>
                        </div>

                        {/* Balance Standing & Due Date */}
                        <div className="border-t border-stone-200/50 pt-4 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] font-mono text-stone-500 block">Next Due Date</span>
                            <span className="font-semibold text-stone-700">{t.nextDueDate || '—'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-stone-500 block">Balance standing</span>
                            <span className={`font-mono font-bold text-sm ${hasDebt ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {formatPrice(t.balance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: RENT COLLECTIONS DESK */}
          {/* TAB: RENT COLLECTIONS DESK */}
          {activeTab === 'rent-desk' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-stone-800">Collect Rent Payments</h2>
                  <p className="text-xs text-stone-500">Redeem incoming paid tenant rent transactions straight to your bank account.</p>
                </div>
                {landlordRentPayments.filter(p => !p.redeemed).length > 0 && (
                  <button
                    onClick={handleRedeemAllRentPayments}
                    className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#C5A059]/95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-sm self-start cursor-pointer"
                  >
                    <Coins className="w-4 h-4" />
                    Redeem All Rent Payments
                  </button>
                )}
              </div>

              {landlordRentPayments.length === 0 ? (
                <div className="py-24 text-center border border-[#E5E0D5] border-dashed rounded-3xl bg-white/20">
                  <Coins className="w-8 h-8 text-stone-400 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-stone-500 uppercase tracking-wider">No rent payments received yet</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {landlordRentPayments.map(p => (
                    <div key={p.id} className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-3xl space-y-4 hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 text-left">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-[#B8934C]">{p.tenancy?.property?.title || 'Unknown Property'}</h4>
                          <p className="text-[9px] font-mono text-stone-400">PAYMENT REF: {p.nombaReference}</p>
                          <p className="text-[9px] font-mono text-stone-400 font-bold">PAID ON: {new Date(p.receivedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-mono font-bold uppercase border ${
                          p.redeemed ? 'bg-stone-100 text-stone-500 border-stone-200' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                        }`}>
                          {p.redeemed ? 'Redeemed' : 'Pending Claim'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-stone-150 py-3">
                        <div>
                          <span className="text-stone-500 block text-[9px] uppercase font-mono">Amount Paid</span>
                          <span className="font-semibold text-stone-750">{parseFloat(p.amount).toLocaleString()} NGN</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[9px] uppercase font-mono">Ledger Status</span>
                          <span className="font-semibold text-emerald-600 uppercase text-[9px]">{p.matchedStatus}</span>
                        </div>
                      </div>

                      {p.redeemed ? (
                        <div className="text-[10px] font-mono text-stone-500 space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-100">
                          <div>Payout Ref: <span className="text-stone-700">{p.redeemPayoutReference}</span></div>
                          <div>Settled on: <span className="text-stone-700">{p.redeemedAt ? new Date(p.redeemedAt).toLocaleString() : ''}</span></div>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <button
                            onClick={() => handleRedeemRentPayment(p.id)}
                            className="w-full py-2 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white rounded-xl text-xs font-bold transition duration-300 shadow-sm cursor-pointer"
                          >
                            Redeem to Settled Bank
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ESCROWS HUB */}
          {/* TAB: ESCROWS HUB */}
          {activeTab === 'escrow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-left">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-stone-850">Purchase Escrows</h2>
                  <p className="text-xs text-stone-500">Confirm payments, release holdings, or reject/refund transactions.</p>
                </div>
                {userProfile && userProfile.role === 'LANDLORD' && (
                  <button
                    onClick={() => setShowEscrowForm(!showEscrowForm)}
                    className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#C5A059]/95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Instantiate Escrow
                  </button>
                )}
              </div>

              {/* Form Modal */}
              {showEscrowForm && (
                <form onSubmit={handleCreateEscrow} className="bg-white/70 backdrop-blur-md border border-[#E5E0D5]/80 p-6 rounded-3xl grid gap-4 sm:grid-cols-2 text-left animate-in slide-in-from-top-4 duration-200">
                  <h3 className="sm:col-span-2 text-sm font-bold font-serif text-[#B8934C] uppercase tracking-wider">Initialize Purchase Escrow Contract</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">SELECT PROPERTY</label>
                    <select required value={escrowInput.propertyId} onChange={e => setEscrowInput({...escrowInput, propertyId: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none cursor-pointer">
                      <option value="">-- Choose SALE property --</option>
                      {properties.filter(p => p.type === 'SALE').map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">BUYER EMAIL</label>
                    <input required type="email" placeholder="e.g. buyer@reflow.com" value={escrowInput.buyerId} onChange={e => setEscrowInput({...escrowInput, buyerId: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-mono block">PURCHASE PRICE (NGN)</label>
                    <input required type="number" placeholder="e.g. 15000000" value={escrowInput.amountHeld} onChange={e => setEscrowInput({...escrowInput, amountHeld: e.target.value})} className="w-full px-3 py-2.5 bg-[#FAF8F5]/85 border border-[#E5E0D5] rounded-xl text-xs text-stone-750 focus:border-[#C5A059] focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white text-xs font-bold rounded-xl transition-all duration-300">Create Escrow</button>
                    <button type="button" onClick={() => setShowEscrowForm(false)} className="px-5 py-2.5 border border-[#E5E0D5] text-stone-500 text-xs font-semibold rounded-xl transition-all duration-300">Cancel</button>
                  </div>
                </form>
              )}

              {/* Escrow Items List */}
              {escrows.length === 0 ? (
                <div className="py-24 text-center border border-[#E5E0D5] border-dashed rounded-3xl bg-white/20">
                  <Coins className="w-8 h-8 text-stone-400 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-stone-500 uppercase tracking-wider">No escrow transactions found</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {escrows.map(e => (
                    <div key={e.id} className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-3xl space-y-4 hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300 text-left">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-stone-850">{e.property?.title || 'Unknown Property'}</h4>
                          <p className="text-[9px] font-mono text-stone-500">BUYER: {e.buyerId}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-mono font-bold uppercase border ${
                          e.status === 'HELD' ? 'bg-[#C5A059]/10 text-[#B8934C] border-[#C5A059]/20' : 
                          e.status === 'RELEASED' ? 'bg-stone-100 text-stone-500 border-stone-200' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {e.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-stone-150 py-3">
                        <div>
                          <span className="text-stone-500 block text-[9px] uppercase font-mono">Amount Held</span>
                          <span className="font-semibold text-stone-750">{parseFloat(e.amountHeld).toLocaleString()} NGN</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[9px] uppercase font-mono">Monnify Account</span>
                          <span className="font-mono text-[#B8934C]">{e.nombaVirtualAccountId || 'Unassigned'}</span>
                        </div>
                      </div>

                      {/* Operational triggers */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {e.status === 'PENDING_PAYMENT' && (
                          <button
                            onClick={() => handleSyncEscrow(e.id)}
                            className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-[#E5E0D5] rounded-xl text-[10px] font-bold text-stone-600 flex items-center gap-1.5 transition duration-300 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 animate-spin-hover" />
                            Verify Deposit
                          </button>
                        )}
                        {(e.status === 'HELD' || e.status === 'RELEASE_PENDING' || e.status === 'PAYOUT_FAILED') && userProfile && userProfile.role === 'LANDLORD' && (
                          <>
                            <button
                              onClick={() => handleReleaseEscrow(e.id)}
                              className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition duration-300 cursor-pointer shadow-sm"
                            >
                              <Landmark className="w-3.5 h-3.5" />
                              {e.status === 'RELEASE_PENDING' ? 'Retry / Sync Payout' : 'Release Payout'}
                            </button>
                            {e.status === 'HELD' && (
                              <button
                                onClick={() => handleRejectEscrow(e.id)}
                                className="px-3.5 py-2 border border-stone-200 bg-[#FAF8F5]/30 hover:bg-[#FAF8F5] rounded-xl text-[10px] font-bold text-rose-500 flex items-center gap-1.5 transition duration-300 cursor-pointer"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                Refund Buyer
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: RECEIPTS LOCKER */}
          {activeTab === 'receipts' && (
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <h2 className="text-xl font-bold text-stone-850">Receipts Locker</h2>
                <p className="text-xs text-stone-500">Vault for verified transaction receipts.</p>
              </div>

              {receipts.length === 0 ? (
                <div className="py-24 text-center border border-[#E5E0D5] border-dashed rounded-3xl bg-white/20">
                  <Receipt className="w-8 h-8 text-stone-400 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-stone-500 uppercase tracking-wider">No receipts issued yet</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {receipts.map(r => (
                    <div key={r.id} className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl space-y-3 relative overflow-hidden text-left hover:border-[#C5A059]/40 hover:shadow-md transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] font-mono text-[#B8934C] uppercase tracking-widest block">{r.category}</span>
                          <h4 className="font-serif font-bold text-sm text-stone-850">{r.title}</h4>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-[#B8934C]" />
                      </div>
                      <div className="border-t border-stone-150 pt-3 text-left">
                        <span className="text-stone-500 block text-[9px] uppercase font-mono">Reference</span>
                        <p className="text-xs font-mono text-stone-700 select-all truncate">{r.reference}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-100/50">
                        <span>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="text-[#B8934C] font-bold font-sans text-xs">{parseFloat(r.amount).toLocaleString()} NGN</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 3. PROPERTY DETAIL OVERLAY MODAL */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-stone-900/50 backdrop-blur-sm overflow-y-auto">
          
          <div className="w-full max-w-5xl rounded-3xl border border-[#E5E0D5]/80 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200 relative bg-[#FAF8F5] text-stone-850">
            
            {/* Header / Dismiss Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setSelectedProperty(null)}
                className="p-2.5 rounded-full bg-white/95 border border-stone-200 text-stone-500 hover:text-[#B8934C] transition shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. HERO IMAGE GALLERY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
              <div 
                onClick={() => setLightboxIndex(0)}
                className="md:col-span-2 h-80 md:h-[400px] rounded-2xl overflow-hidden cursor-zoom-in relative group"
              >
                <img 
                  src={selectedProperty.images?.[0] || selectedProperty.imageUrl || '/dashboard_preview.jpg'} 
                  alt={selectedProperty.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-300" />
                <span className="absolute bottom-4 left-4 bg-stone-900/80 border border-stone-700 backdrop-blur-sm text-[8px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg text-white">
                  Expand Gallery
                </span>
              </div>
              <div className="hidden md:grid grid-rows-3 gap-2 h-[400px]">
                {(selectedProperty.images || []).slice(1, 4).map((img, index) => (
                  <div 
                    key={index}
                    onClick={() => setLightboxIndex(index + 1)}
                    className="h-full rounded-xl overflow-hidden cursor-zoom-in relative group"
                  >
                    <img 
                      src={img} 
                      alt={`Interior slide ${index + 1}`} 
                      className="w-full h-[126px] object-cover group-hover:scale-103 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                  </div>
                ))}
              </div>
            </div>

            {/* Lightbox full-screen */}
            {lightboxIndex !== null && selectedProperty.images && (
              <div className="fixed inset-0 z-55 bg-black/95 flex flex-col justify-center items-center p-4 animate-in fade-in duration-200">
                <button 
                  onClick={() => setLightboxIndex(null)}
                  className="absolute top-6 right-6 p-3 rounded-full border border-white/20 bg-stone-900/50 hover:bg-stone-900 text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setLightboxIndex(lightboxIndex === 0 ? selectedProperty.images.length - 1 : lightboxIndex - 1)}
                  className="absolute left-6 p-4 rounded-full border border-white/20 bg-stone-900/50 hover:bg-stone-900 text-white transition cursor-pointer"
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
                  className="absolute right-6 p-4 rounded-full border border-white/20 bg-stone-900/50 hover:bg-stone-900 text-white transition cursor-pointer"
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
              
              {/* LEFT DETAIL INFORMATION PANEL */}
              <div className="lg:col-span-7 space-y-8 text-left">
                
                {/* Meta details & titles */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#C5A059]/10 text-[#B8934C] border border-[#C5A059]/20 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold">
                      {selectedProperty.tag}
                    </span>
                    {selectedProperty.isAssured && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-lg text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Prope Assured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="text-left">
                      <h2 className="text-2xl font-bold font-serif tracking-tight text-stone-850">{selectedProperty.title}</h2>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 font-mono uppercase">
                        <MapPin className="w-3.5 h-3.5 text-[#B8934C]" />
                        {selectedProperty.area}
                      </div>
                    </div>
                    <div className="text-left md:text-right mt-2 md:mt-0 shrink-0">
                      <p className="text-2xl font-bold text-[#B8934C] font-mono">{formatPrice(selectedProperty.price)}</p>
                      <p className="text-[9px] text-stone-500 font-mono mt-0.5">
                        {selectedProperty.type === 'RENT' 
                          ? `RENT / ${selectedProperty.paymentFrequency}` 
                          : `OUTRIGHT ESCROW PURCHASE`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Spec metrics layout */}
                <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl border bg-white/60 border-stone-200/60 shadow-2xs">
                  <div className="text-center">
                    <span className="text-[10px] text-stone-500 font-mono uppercase block">Beds</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block text-stone-800">{selectedProperty.beds}</span>
                  </div>
                  <div className="text-center border-l border-stone-200">
                    <span className="text-[10px] text-stone-500 font-mono uppercase block">Baths</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block text-stone-800">{selectedProperty.baths}</span>
                  </div>
                  <div className="text-center border-l border-stone-200">
                    <span className="text-[10px] text-stone-500 font-mono uppercase block">Size</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block text-stone-800">{selectedProperty.sqft} sq ft</span>
                  </div>
                  <div className="text-center border-l border-stone-200">
                    <span className="text-[10px] text-stone-500 font-mono uppercase block">Built</span>
                    <span className="text-sm font-extrabold font-mono mt-1 block text-stone-800">{selectedProperty.yearBuilt}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-200">
                  {['overview', 'calculator', 'floorplan', 'tour', 'neighborhood'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveDetailTab(tab)}
                      className={`px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-all -mb-px cursor-pointer ${
                        activeDetailTab === tab 
                          ? 'border-[#C5A059] text-[#B8934C]' 
                          : 'border-transparent text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {tab === 'floorplan' ? 'Floor Plans' : tab === 'calculator' ? 'Mortgage Calculator' : tab === 'neighborhood' ? 'Neighborhood AI' : tab}
                    </button>
                  ))}
                </div>

                {/* TAB OVERVIEW */}
                {activeDetailTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in duration-200 text-left">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-stone-600">The Residence Description</h4>
                      <p className="text-xs leading-relaxed text-stone-700">
                        {selectedProperty.description}
                      </p>
                    </div>

                    {/* AMENITIES MATRIX BY CATEGORY */}
                    {selectedProperty.amenities && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-stone-600">Amenities & Infrastructure</h4>
                        
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#B8934C] uppercase tracking-wider">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                              Interior Design
                            </div>
                            <ul className="space-y-1.5 pl-6 text-xs text-stone-650 text-left list-disc marker:text-[#C5A059]">
                              {selectedProperty.amenities.interior.map((am, idx) => (
                                <li key={idx}>{am}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#B8934C] uppercase tracking-wider">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 22h20M17 9l-3.5 3.5L10 9M7 9l3.5 3.5"/></svg>
                              Exterior Infrastructure
                            </div>
                            <ul className="space-y-1.5 pl-6 text-xs text-stone-650 text-left list-disc marker:text-[#C5A059]">
                              {selectedProperty.amenities.exterior.map((am, idx) => (
                                <li key={idx}>{am}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#B8934C] uppercase tracking-wider">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                              Building Services
                            </div>
                            <ul className="space-y-1.5 pl-6 text-xs text-stone-650 text-left list-disc marker:text-[#C5A059]">
                              {selectedProperty.amenities.building.map((am, idx) => (
                                <li key={idx}>{am}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#B8934C] uppercase tracking-wider">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              Eco & Environmental
                            </div>
                            <ul className="space-y-1.5 pl-6 text-xs text-stone-650 text-left list-disc marker:text-[#C5A059]">
                              {selectedProperty.amenities.eco.map((am, idx) => (
                                <li key={idx}>{am}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB MORTGAGE CALCULATOR */}
                {activeDetailTab === 'calculator' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-2 text-left">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-stone-600">Mortgage Payment Estimator</h4>
                      <p className="text-[10px] text-stone-500">Inputs calculate baseline financing metrics for outright acquisitions or long leases.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 items-center text-left">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-stone-500">
                            <span>Down Payment</span>
                            <span className="font-bold text-[#B8934C]">{formatPrice(downPayment)}</span>
                          </div>
                          <input 
                            type="range"
                            min={0}
                            max={selectedProperty.price}
                            step={selectedProperty.price * 0.05}
                            value={downPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="w-full h-1 bg-[#E5E0D5] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-stone-500">
                            <span>Interest Rate (Annual)</span>
                            <span className="font-bold text-[#B8934C]">{interestRate}%</span>
                          </div>
                          <input 
                            type="range"
                            min={2}
                            max={25}
                            step={0.5}
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-1 bg-[#E5E0D5] rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-stone-500 font-mono block">Loan Duration</label>
                          <div className="flex gap-2">
                            {[10, 15, 20, 25, 30].map(term => (
                              <button
                                key={term}
                                onClick={() => setLoanTerm(term)}
                                className={`flex-1 text-xs py-2 rounded-xl font-mono border transition duration-300 cursor-pointer ${
                                  loanTerm === term
                                    ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#B8934C] font-bold'
                                    : 'bg-[#FAF8F5] border-stone-200 text-stone-500 hover:border-stone-300'
                                }`}
                              >
                                {term} Yrs
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-3xl border border-stone-200/65 text-center space-y-4 flex flex-col justify-center items-center bg-white/60 shadow-2xs">
                        <div className="relative w-28 h-28">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#EFECE3" strokeWidth="2.5" />
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#C5A059" strokeWidth="3" strokeDasharray="50 100" strokeDashoffset="0" />
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#B8934C" strokeWidth="3" strokeDasharray="35 100" strokeDashoffset="-50" />
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="#E5C180" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-85" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-mono text-stone-500 uppercase block">Monthly Est.</span>
                            <span className="text-xs font-bold font-mono text-stone-850">{formatPrice(mortgageDetails.monthlyPayment)}</span>
                          </div>
                        </div>

                        <div className="w-full space-y-2 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-stone-500">
                              <span className="w-2 h-2 rounded-full bg-[#C5A059]" /> Principal Portion
                            </span>
                            <span className="font-mono text-stone-750 font-semibold">{formatPrice(mortgageDetails.principal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-stone-500">
                              <span className="w-2 h-2 rounded-full bg-[#B8934C]" /> Interest Portion
                            </span>
                            <span className="font-mono text-stone-750 font-semibold">{formatPrice(mortgageDetails.interest)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5 text-stone-500">
                              <span className="w-2 h-2 rounded-full bg-[#E5C180]" /> Escrow / Taxes
                            </span>
                            <span className="font-mono text-stone-750 font-semibold">{formatPrice(mortgageDetails.escrow)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB FLOOR PLAN VIEW */}
                {activeDetailTab === 'floorplan' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-stone-600">Structural Layout Plan</h4>
                        <p className="text-[10px] text-stone-500">Architectural blueprint representing room spacing and area distribution.</p>
                      </div>
                      
                      <div className="flex rounded-xl p-0.5 border bg-stone-100 border-stone-200">
                        <button
                          onClick={() => setFloorPlanView('2D')}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition duration-300 cursor-pointer ${floorPlanView === '2D' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500'}`}
                        >
                          2D Blueprint
                        </button>
                        <button
                          onClick={() => setFloorPlanView('3D')}
                          className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition duration-300 cursor-pointer ${floorPlanView === '3D' ? 'bg-[#C5A059] text-white shadow-xs' : 'text-stone-500'}`}
                        >
                          3D Rendering
                        </button>
                      </div>
                    </div>

                    {floorPlanView === '2D' ? (
                      <div className="w-full h-80 rounded-2xl border border-stone-200 flex items-center justify-center p-4 bg-white/60">
                        <svg className="w-full h-full max-w-lg" viewBox="0 0 200 120">
                          <rect x="10" y="10" width="180" height="100" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeOpacity="0.8" />
                          <line x1="10" y1="60" x2="80" y2="60" stroke="#8A7349" strokeWidth="1" strokeDasharray="1 1" />
                          <line x1="80" y1="10" x2="80" y2="80" stroke="#8A7349" strokeWidth="1" />
                          <line x1="130" y1="10" x2="130" y2="70" stroke="#8A7349" strokeWidth="1" />
                          <line x1="130" y1="70" x2="190" y2="70" stroke="#8A7349" strokeWidth="1" strokeDasharray="1 1" />
                          <rect x="90" y="80" width="50" height="30" fill="none" stroke="#C5A059" strokeWidth="0.8" strokeOpacity="0.3" />
                          <text x="25" y="30" fill="#C5A059" fontSize="6" fontWeight="bold" fontFamily="monospace">MASTER SUITE (6.5 x 5m)</text>
                          <text x="25" y="80" fill="#8A7349" fontSize="5" fontFamily="monospace">EN-SUITE BATH</text>
                          <text x="140" y="30" fill="#C5A059" fontSize="6" fontWeight="bold" fontFamily="monospace">GOURMET KITCHEN</text>
                          <text x="100" y="50" fill="#C5A059" fontSize="8" fontWeight="bold" fontFamily="serif">LIVING LOUNGE</text>
                          <text x="105" y="98" fill="#8A7349" fontSize="5" fontFamily="monospace">YACHT VERANDA</text>
                          <path d="M 80 40 A 10 10 0 0 0 70 50" fill="none" stroke="#C5A059" strokeWidth="0.8" />
                          <path d="M 130 50 A 10 10 0 0 1 140 60" fill="none" stroke="#C5A059" strokeWidth="0.8" />
                        </svg>
                      </div>
                    ) : (
                      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-stone-200 bg-stone-900">
                        <img 
                          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80" 
                          alt="3D Walkthrough View" 
                          className="w-full h-full object-cover opacity-60 filter blur-xs" 
                        />
                        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-6 text-center">
                          <Compass className="w-12 h-12 text-[#C5A059] animate-spin-slow mb-3" />
                          <h5 className="text-sm font-serif font-bold text-white uppercase tracking-wider">3D BIM Architectural Simulator</h5>
                          <p className="text-[10px] text-slate-350 max-w-sm mt-1.5 leading-relaxed">
                            Pre-rendering space matrices and structural coordinates. Virtual photorealistic walkthrough available inside the landlord's dashboard.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB TOUR SCHEDULING DRAWER */}
                {activeDetailTab === 'tour' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="text-left space-y-1">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-stone-600">Request Private Tour Appointment</h4>
                      <p className="text-[10px] text-stone-500">Pick a secure date and hour for a physical showing guided by our Managing Partner.</p>
                    </div>

                    {tourScheduled ? (
                      <div className="p-6 rounded-2xl border text-center space-y-3 bg-emerald-500/5 border-emerald-500/20 text-emerald-800">
                        <ShieldCheck className="w-10 h-10 mx-auto text-[#C5A059]" />
                        <h5 className="text-sm font-bold uppercase tracking-wider font-serif">Viewing Appointment Pending</h5>
                        <p className="text-xs max-w-md mx-auto leading-relaxed text-stone-650">
                          Your tour request for <strong>{selectedTourDate}</strong> at <strong>{selectedTourTime}</strong> has been registered with Marcus Sterling's calendar. Confirming via Monnify SMS.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-stone-500 font-mono block">Available Calendar Dates</label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {['Mon, Jul 20', 'Tue, Jul 21', 'Wed, Jul 22', 'Thu, Jul 23', 'Fri, Jul 24', 'Sat, Jul 25'].map(d => (
                              <button
                                key={d}
                                onClick={() => setSelectedTourDate(d)}
                                className={`text-[10px] py-3 rounded-xl border text-center transition font-mono cursor-pointer ${
                                  selectedTourDate === d
                                    ? 'bg-[#C5A059] border-[#C5A059] text-white font-bold'
                                    : 'bg-[#FAF8F5] border-stone-200 text-stone-500 hover:border-stone-300'
                                }`}
                              >
                                {d.split(',')[0]}
                                <span className="block text-[8px] font-normal opacity-85 mt-0.5">{d.split(',')[1]}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] text-stone-500 font-mono block">Select Viewing Slot</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'].map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTourTime(t)}
                                className={`text-xs py-2.5 rounded-xl border text-center transition font-mono cursor-pointer ${
                                  selectedTourTime === t
                                    ? 'bg-[#C5A059] border-[#C5A059] text-white font-bold'
                                    : 'bg-[#FAF8F5] border-stone-200 text-stone-500 hover:border-stone-300'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleScheduleTour}
                          className="w-full py-3 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition duration-300 shadow-sm cursor-pointer"
                        >
                            Confirm Showing Reservation
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB NEIGHBORHOOD AI ANALYSIS */}
                {activeDetailTab === 'neighborhood' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="text-left space-y-1">
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider text-stone-600">Neighborhood AI Intelligence Report</h4>
                      <p className="text-[10px] text-stone-500">NVIDIA NIM custom geo-spatial models compiled analysis for: <strong>{selectedProperty.area}</strong>.</p>
                    </div>

                    {neighborhoodLoading ? (
                      <div className="py-16 text-center space-y-4 bg-white/30 border border-stone-200/50 rounded-3xl backdrop-blur-xs">
                        <RefreshCw className="w-8 h-8 text-[#C5A059] mx-auto animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-stone-600 uppercase tracking-wider">Generating Assessment Report...</p>
                          <p className="text-[9px] text-stone-400">Evaluating environmental index, transportation grids, power status, and safety ratings.</p>
                        </div>
                      </div>
                    ) : neighborhoodReports[selectedProperty.id] ? (
                      <div className="space-y-6 w-full text-left">
                        {(() => {
                          const text = neighborhoodReports[selectedProperty.id];
                          // Clean headers first
                          const cleanText = text.replace(/##\s*(\d+\.\s+[^:\n]+)/g, '$1')
                                                .replace(/\*\*(\d+\.\s+[^:\n]+)\*\*/g, '$1');
                          
                          const lines = cleanText.split('\n');
                          const result = [];
                          let currentSection = null;
                          let currentParagraphs = [];

                          const flushParagraphs = () => {
                            if (currentParagraphs.length > 0 && currentSection) {
                              const parsedElements = [];
                              let inTable = false;
                              let tableRows = [];

                              for (let i = 0; i < currentParagraphs.length; i++) {
                                const line = currentParagraphs[i].trim();
                                if (line.startsWith('|')) {
                                  inTable = true;
                                  tableRows.push(line);
                                } else {
                                  if (inTable && tableRows.length > 0) {
                                    parsedElements.push({ type: 'table', rows: [...tableRows] });
                                    tableRows = [];
                                    inTable = false;
                                  }
                                  
                                  const cleanedLine = line.replace(/^---\s*$/, '').trim();
                                  if (!cleanedLine) continue;

                                  if (cleanedLine.startsWith('-') || cleanedLine.startsWith('*')) {
                                    parsedElements.push({ type: 'list-item', text: cleanedLine.replace(/^[-*]\s*/, '') });
                                  } else if (cleanedLine.startsWith('**') && cleanedLine.endsWith('**') && cleanedLine.length > 4) {
                                    parsedElements.push({ type: 'subheading', text: cleanedLine.replace(/\*\*/g, '') });
                                  } else {
                                    const subMatch = cleanedLine.match(/^\*\*([^*]+)\*\*:(.*)$/);
                                    if (subMatch) {
                                      parsedElements.push({ type: 'definition', term: subMatch[1].trim(), definition: subMatch[2].trim() });
                                    } else {
                                      parsedElements.push({ type: 'text', text: cleanedLine });
                                    }
                                  }
                                }
                              }
                              if (inTable && tableRows.length > 0) {
                                parsedElements.push({ type: 'table', rows: tableRows });
                              }
                              currentSection.elements.push(...parsedElements);
                              currentParagraphs = [];
                            }
                          };

                          lines.forEach(line => {
                            const trimmed = line.trim();
                            const match = trimmed.match(/^(\d+\.\s+[A-Z\s&]+)/) || trimmed.match(/^##\s*(\d+\.\s+[^:\n]+)/);
                            if (match) {
                              flushParagraphs();
                              if (currentSection) {
                                result.push(currentSection);
                              }
                              currentSection = {
                                title: match[1].replace(/^\d+\.\s+/, '').trim(),
                                elements: []
                              };
                            } else {
                              currentParagraphs.push(line);
                            }
                          });
                          flushParagraphs();
                          if (currentSection) {
                            result.push(currentSection);
                          }

                          if (result.length === 0) {
                            result.push({
                              title: "Intelligence Overview",
                              elements: [{ type: 'text', text }]
                            });
                          }

                          const renderTable = (rows) => {
                            const cleanRows = rows.filter(r => !r.includes('---'));
                            if (cleanRows.length === 0) return null;

                            const parseCells = (rowStr) => {
                              return rowStr.split('|')
                                .map(cell => cell.trim())
                                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                            };

                            const headers = parseCells(cleanRows[0]);
                            const dataRows = cleanRows.slice(1).map(parseCells);

                            return (
                              <div className="w-full overflow-x-auto my-4 border border-[#E5E0D5]/80 rounded-2xl bg-[#FAF8F5]/50 shadow-2xs">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-[#C5A059]/10 border-b border-[#E5E0D5]/80">
                                      {headers.map((h, i) => (
                                        <th key={i} className="p-3 font-mono font-bold text-[#B8934C] uppercase tracking-wider text-[10px]">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#E5E0D5]/60 text-stone-750">
                                    {dataRows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-white/40 transition-colors">
                                        {row.map((cell, cIdx) => (
                                          <td key={cIdx} className="p-3 whitespace-pre-wrap">{cell}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          };

                          return result.map((sec, idx) => (
                            <div key={idx} className="w-full bg-white/60 border border-stone-200/50 p-6 rounded-3xl space-y-4 shadow-xs backdrop-blur-2xs hover:border-[#C5A059]/40 transition-colors duration-300">
                              <h4 className="text-sm font-serif font-extrabold text-stone-900 border-b border-[#E5E0D5]/60 pb-2 uppercase tracking-wider text-left">{sec.title}</h4>
                              
                              <div className="space-y-2">
                                {sec.elements.map((el, elIdx) => {
                                  if (el.type === 'table') return renderTable(el.rows);
                                  if (el.type === 'list-item') return (
                                    <div key={elIdx} className="flex items-start gap-2 text-xs text-stone-700 my-1.5 pl-2 text-left">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-1.5 shrink-0" />
                                      <span className="leading-relaxed">{el.text}</span>
                                    </div>
                                  );
                                  if (el.type === 'subheading') return (
                                    <h6 key={elIdx} className="text-[11px] font-bold font-mono text-[#B8934C] uppercase tracking-wider mt-4 mb-2 text-left">{el.text}</h6>
                                  );
                                  if (el.type === 'definition') return (
                                    <div key={elIdx} className="my-2 p-3.5 bg-[#FAF8F5]/60 border border-[#E5E0D5]/50 rounded-2xl text-left">
                                      <span className="font-bold text-stone-850 text-xs block">{el.term}</span>
                                      <span className="text-xs text-stone-600 leading-relaxed block mt-1">{el.definition}</span>
                                    </div>
                                  );
                                  return (
                                    <p key={elIdx} className="text-xs text-stone-700 leading-relaxed my-2 text-left whitespace-pre-wrap">{el.text}</p>
                                  );
                                })}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white/30 border border-stone-200/50 rounded-3xl">
                        <p className="text-xs text-stone-500 font-mono">No neighborhood data loaded</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT AGENT INFO & RESERVATION BOX */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Agent Card */}
                {selectedProperty.agent && (
                  <div className="p-5 rounded-3xl border text-left space-y-4 bg-white/60 border-stone-200/65 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedProperty.agent.avatar} 
                        alt={selectedProperty.agent.name} 
                        className="w-12 h-12 rounded-full object-cover border border-[#C5A059]/40" 
                      />
                      <div>
                        <h5 className="text-sm font-bold font-serif text-stone-850">{selectedProperty.agent.name}</h5>
                        <span className="text-[10px] text-[#B8934C] font-mono uppercase tracking-wider block mt-0.5">{selectedProperty.agent.role}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-stone-150 pt-4 space-y-2 text-xs text-stone-600">
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>{selectedProperty.agent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span>{selectedProperty.agent.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Final transaction panel */}
                <div className="p-6 rounded-3xl border text-left space-y-5 bg-[#FAF8F5]/85 border-[#C5A059]/30 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest block">Monnify Booking Deposit</span>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="text-xl font-bold font-mono text-[#B8934C]">{formatPrice(selectedProperty.firstPaymentAmount || selectedProperty.price)}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {selectedProperty.type === 'RENT' ? 'Annual Downpayment' : 'Escrow Deposit (10%)'}
                      </span>
                    </div>
                  </div>

                  {selectedProperty.annualProjections && (
                    <div className="p-3 rounded-xl border border-stone-200/50 text-[10px] font-mono text-left leading-relaxed bg-white/50 text-[#B8934C]">
                      <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      {selectedProperty.annualProjections}
                    </div>
                  )}

                  {userProfile && userProfile.role === 'TENANT' && selectedProperty.status === 'LISTED' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedProperty(null);
                          initiateCheckout(selectedProperty);
                        }}
                        className="w-full py-3.5 bg-[#C5A059] hover:bg-[#C5A059]/95 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        {selectedProperty.type === 'RENT' ? 'Rent Apartment Now' : 'Purchase via Escrow'}
                      </button>
                      <p className="text-[8px] text-center text-stone-500 leading-relaxed font-mono">
                        Payments handled securely by Monnify. Funds are covered under bank-grade escrow guidelines until tenancy verification or contract execution.
                      </p>
                    </div>
                  )}

                  {userProfile && userProfile.role === 'TENANT' && selectedProperty.status !== 'LISTED' && (
                    <button
                      disabled
                      className="w-full py-3.5 bg-stone-200 text-stone-500 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed text-center"
                    >
                      {selectedProperty.status === 'UNDER_ESCROW' ? 'Under Escrow Purchase' : selectedProperty.status === 'SOLD' ? 'Sold' : 'Unavailable'}
                    </button>
                  )}

                  {userProfile && userProfile.role === 'LANDLORD' && (
                    <div className="text-center pt-2 border-t border-stone-200">
                      <span className="text-[10px] font-mono text-[#B8934C]/85 uppercase tracking-widest block font-bold">Owner Management Dashboard</span>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Dynamic Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
          <div className="flex items-center gap-3 bg-[#FAF8F5]/95 backdrop-blur-md border border-[#C5A059]/45 px-5 py-4 rounded-2xl shadow-xl shadow-[#C5A059]/10 max-w-sm">
            {notification.type === 'success' && <ShieldCheck className="w-5 h-5 text-[#B8934C] shrink-0" />}
            {notification.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />}
            {notification.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />}
            {notification.type === 'info' && <Sparkles className="w-5 h-5 text-[#B8934C] shrink-0" />}
            
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#B8934C] uppercase block mb-0.5">
                {notification.type === 'success' ? 'Execution Complete' : notification.type.toUpperCase()}
              </span>
              <p className="text-stone-850 text-xs font-semibold leading-relaxed font-sans">{notification.message}</p>
            </div>

            <button 
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition ml-3 self-start cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

