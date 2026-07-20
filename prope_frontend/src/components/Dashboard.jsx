import React, { useState, useEffect } from 'react';
import {
  Terminal, Send, LayoutDashboard, Building2, Users, Coins,
  Receipt, MessageSquare, RefreshCw, Plus, Landmark, ShieldCheck,
  ShieldAlert, Sparkles, User, FileText, ArrowLeftRight, Menu, X,
  LogOut, Compass
} from 'lucide-react';
import { APIS_METADATA } from '../apis_metadata';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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
  const [tenancies, setTenancies] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [landlordProfile, setLandlordProfile] = useState(null);

  // Forms States
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyInput, setPropertyInput] = useState({
    title: '', price: '', type: 'RENT', area: '', buildingType: '', imageUrl: '',
    firstPaymentAmount: '', paymentFrequency: 'MONTHLY', annualProjections: '', ownershipDocumentUrl: ''
  });

  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [leaseInput, setLeaseInput] = useState({
    propertyId: '', tenantId: '', rentAmount: '', frequency: 'MONTHLY', nextDueDate: '', orderReference: ''
  });

  const [showEscrowForm, setShowEscrowForm] = useState(false);
  const [escrowInput, setEscrowInput] = useState({
    propertyId: '', buyerId: '', amountHeld: '', orderReference: ''
  });

  // Playground States
  const [selectedApiIndex, setSelectedApiIndex] = useState(0);
  const [requestBodyInput, setRequestBodyInput] = useState('');
  const [apiResponseOutput, setApiResponseOutput] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [simulatorSubTab, setSimulatorSubTab] = useState('playground'); // playground, logs

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

  useEffect(() => {
    if (APIS_METADATA[selectedApiIndex]) {
      setRequestBodyInput(JSON.stringify(APIS_METADATA[selectedApiIndex].requestBody, null, 2));
    }
  }, [selectedApiIndex]);

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
            landlord {
              email
            }
          }
        }
      `);
      
      // Filter properties: Landlord sees only theirs, Tenant sees all (marketplace)
      if (currentProfile.role === 'LANDLORD') {
        setProperties(propsData.getProperties.filter(p => p.landlord?.email === currentProfile.email));
      } else {
        setProperties(propsData.getProperties);
      }

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
      alert("Please fill both Account Number and Bank Code.");
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
        
        alert("Landlord Settlement Details Successfully Linked!");
      } else {
        alert(data.description || "Verification failed on Sandbox.");
      }
    } catch (err) {
      alert("Verification Request Failed: " + err.message);
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
            ownershipDocumentUrl: "${propertyInput.ownershipDocumentUrl || ''}"
          ) {
            id
          }
        }
      `);
      alert("Property Listed Successfully!");
      setShowPropertyForm(false);
      setPropertyInput({
        title: '', price: '', type: 'RENT', area: '', buildingType: '', imageUrl: '',
        firstPaymentAmount: '', paymentFrequency: 'MONTHLY', annualProjections: '', ownershipDocumentUrl: ''
      });
      fetchProfileAndData();
    } catch (err) {
      alert("Failed to list property: " + err.message);
    }
  }

  // Initiate payment checkout for buying/renting property using Monnify SDK
  async function initiateCheckout(property) {
    if (!userProfile) {
      alert("Please log in to complete your transaction.");
      return;
    }
    if (!window.MonnifySDK) {
      alert("Monnify payment gateway is initializing. Please try again in a few seconds.");
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
                  
                  alert("Rent payment confirmed! Your lease contract is now active.");
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

                  alert("Purchase payment confirmed! Funds are now securely held under escrow.");
                }

                fetchProfileAndData();
              } catch (err) {
                alert("Payment succeeded but failed to sync ledger: " + err.message);
              }
            })();
          } else {
            alert("Payment transaction was not completed: " + response.paymentStatus);
          }
        },
        onClose: function (data) {
          console.log("Monnify Checkout modal closed.", data);
        }
      });

    } catch (err) {
      alert("Failed to initialize payment gateway: " + err.message);
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

      alert(`Lease Established! Virtual Account Provisioned: ${vAccountId} (${data.data.bankName})`);
      setShowLeaseForm(false);
      fetchProfileAndData();
    } catch (err) {
      alert("Failed to establish lease: " + err.message);
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

      alert(`Escrow Account Created! Provisioned virtual account: ${vAccountId}`);
      setShowEscrowForm(false);
      fetchProfileAndData();
    } catch (err) {
      alert("Failed to create escrow: " + err.message);
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
      alert(`Sync Action: Status updated to ${data.synchronizeEscrowPayment.status}`);
      fetchProfileAndData();
    } catch (err) {
      alert("Sync failed: " + err.message);
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
        alert(`Payout initiation error: ${data.releaseEscrow.payoutError}`);
      } else {
        alert(`Payout successfully initiated! Status: ${data.releaseEscrow.status}`);
      }
      fetchProfileAndData();
    } catch (err) {
      alert("Release action failed: " + err.message);
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
      alert(`Escrow Rejected! Bank refund initiated. Status: ${data.rejectEscrow.status}`);
      fetchProfileAndData();
    } catch (err) {
      alert("Refund action failed: " + err.message);
    }
  }

  // Playground API execution
  async function handleExecutePlaygroundApi() {
    setApiLoading(true);
    setApiResponseOutput(null);
    const api = APIS_METADATA[selectedApiIndex];
    let bodyObj = {};
    try {
      bodyObj = JSON.parse(requestBodyInput || '{}');
    } catch (e) {
      alert("Invalid JSON format.");
      setApiLoading(false);
      return;
    }
    try {
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: api.name,
          method: api.method,
          url: api.url,
          body: bodyObj,
        })
      });
      const data = await res.json();
      setApiResponseOutput(data);
    } catch (err) {
      setApiResponseOutput({ error: "Failed to connect to Monnify Sandbox proxy." });
    }
    setApiLoading(false);
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
      alert(`Wallet Balance Synced! New Balance: ${parseFloat(data.syncWalletBalance.walletBalance).toLocaleString()} NGN`);
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
      alert("Amount must be greater than zero.");
      return;
    }
    if (!debitInput.bankCode || !debitInput.accountNumber) {
      alert("Please fill bank code and recipient account number.");
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
      alert(data.debitCustomerWallet);
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
      alert("Rent payment successfully redeemed to your bank account!");
      fetchProfileAndData();
    } catch (err) {
      alert("Redemption failed: " + err.message);
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
      alert(data.redeemAllRentPayments);
      fetchProfileAndData();
    } catch (err) {
      alert("Redemption failed: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row relative">
      {/* Mobile Top Navigation */}
      <header className="h-16 md:hidden border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></div>
          <span className="font-mono tracking-wider font-bold text-sm text-slate-200">ACREWISE CONSOLE</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded border border-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation Panel */}
      <aside className={`w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-300 z-20
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        fixed md:sticky top-16 md:top-0 h-[calc(100vh-64px)] md:h-screen w-64`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="hidden md:flex h-16 items-center gap-2.5 px-6 border-b border-slate-800">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="font-mono tracking-wider font-bold text-sm text-slate-100">ACREWISE</span>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-6 text-left">
            <div>
              <p className="px-3 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">Management</p>
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
                      className={`w-full px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition font-semibold border ${
                        activeTab === item.id 
                          ? 'bg-slate-900 border-slate-800 text-indigo-400 font-bold' 
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="px-3 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">Simulator</p>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => { setActiveTab('developer'); setIsSidebarOpen(false); }}
                  className={`w-full px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition font-semibold border ${
                    activeTab === 'developer' 
                      ? 'bg-slate-900 border-slate-800 text-indigo-400 font-bold' 
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  Sandbox Explorer
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-left">
          <button
            onClick={fetchProfileAndData}
            disabled={loading}
            className="w-full px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-2 hover:text-slate-200 transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </button>
          <button
            onClick={onSignOut}
            className="w-full px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-2 hover:text-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-grow bg-slate-900 flex flex-col min-h-0 text-left">
        {/* Desktop Top Header */}
        <header className="hidden md:flex h-16 border-b border-slate-800 px-8 items-center justify-between bg-slate-950/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-2">
              ACREWISE SYSTEM / {activeTab.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Profile: <span className="text-indigo-400 font-bold">{userEmail}</span>
            </span>
          </div>
        </header>

        {/* Main Work Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-100">Overview Dashboard</h2>
                <p className="text-xs text-slate-400">General financial ledger standing and properties sync.</p>
              </div>

              {/* Status Cards Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Wallet Balance</span>
                  <span className="text-xl font-extrabold text-slate-100 block mt-2">
                    {userProfile && userProfile.walletBalance !== null ? parseFloat(userProfile.walletBalance).toLocaleString() : '0.00'} 
                    <span className="text-xs text-slate-400 font-normal"> NGN</span>
                  </span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Active Properties</span>
                  <span className="text-xl font-extrabold text-indigo-400 block mt-2">{properties.length} <span className="text-xs text-slate-400 font-normal">listed</span></span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Lease Agreements</span>
                  <span className="text-xl font-extrabold text-indigo-400 block mt-2">{tenancies.length} <span className="text-xs text-slate-400 font-normal">active</span></span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Escrow Accounts</span>
                  <span className="text-xl font-extrabold text-indigo-400 block mt-2">{escrows.length} <span className="text-xs text-slate-400 font-normal">managed</span></span>
                </div>
              </div>

              {/* Settlement Payout Setup Card (only shown for Landlord role) */}
              {userProfile && userProfile.role === 'LANDLORD' && (
                <div className="bg-slate-950/20 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-200">Landlord Settlement Bank Details</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Ensure valid banking credentials are linked to receive payouts automatically from purchase escrows.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono block">BANK CODE</label>
                      <select 
                        value={payoutDetails.bankCode}
                        onChange={e => setPayoutDetails(prev => ({ ...prev, bankCode: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" 
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
                      <label className="text-[10px] text-slate-500 font-mono block">BANK ACCOUNT NUMBER</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 0123456789"
                        value={payoutDetails.bankAccountNumber}
                        onChange={e => setPayoutDetails(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono block">LINKED ACCOUNT NAME</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          readOnly 
                          value={payoutDetails.bankAccountName || 'Unverified'}
                          className="flex-grow px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400 font-mono" 
                        />
                        <button 
                          onClick={handleVerifyPayoutAccount}
                          disabled={lookupLoading}
                          className="px-4 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
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
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-100">My Wallet & KYC</h2>
                <p className="text-xs text-slate-400">View statement details and government-linked KYC records for your personal wallet.</p>
              </div>

              {walletError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl font-mono text-left">
                  {walletError}
                </div>
              )}

              {/* Loader */}
              {walletLoading && (
                <div className="p-4 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl flex items-center gap-2 text-left">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  Processing request against Monnify Sandbox...
                </div>
              )}

              {userProfile && (
                <div className="grid gap-8 lg:grid-cols-12 text-left animate-fadeIn">
                  
                  {/* Left Column: KYC Verification & Wallet Cards */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Active Monnify Wallet Card */}
                    {userProfile.walletAccountNumber ? (
                      <div className="space-y-6 text-left">
                        {/* Glassmorphic card design */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 p-6 rounded-3xl space-y-8 shadow-xl shadow-indigo-550/10">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono tracking-widest text-indigo-400 font-bold uppercase">AcreWise Wallet</span>
                              <h3 className="text-md font-extrabold text-slate-100 truncate">{userProfile.name || 'Personal Wallet'}</h3>
                            </div>
                            <Landmark className="w-6 h-6 text-indigo-400" />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase">Dedicated Bank Account</span>
                              <span className="text-lg font-mono font-extrabold text-slate-100 tracking-wider block mt-0.5 select-all">{userProfile.walletAccountNumber}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase">Provider Bank</span>
                                <span className="font-bold text-slate-350 block mt-0.5">{userProfile.walletBankName || 'Moniepoint MFB'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-slate-500 uppercase">Wallet reference</span>
                                <span className="font-mono text-slate-350 block mt-0.5 truncate select-all">{userProfile.walletReference}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Balance Standing */}
                        <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Real-Time Available Balance</span>
                            <span className="text-xl font-extrabold text-slate-100 block">{parseFloat(userProfile.walletBalance || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">NGN</span></span>
                          </div>
                          <button
                            onClick={handleSyncWalletBalance}
                            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-200 transition"
                            title="Sync Balance"
                          >
                            <RefreshCw className="w-4 h-4 animate-spin-hover" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-2xl text-center space-y-3">
                        <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto animate-bounce" />
                        <h3 className="font-bold text-sm text-slate-200">No Wallet Account Found</h3>
                        <p className="text-xs text-slate-400">Your profile does not contain a Monnify Sandbox Wallet. Contact administration to review onboarding states.</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: KYC Verification Info & Transactions statement */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* KYC Verification Info */}
                    <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-200">KYC & Identity Verification</h3>
                          <p className="text-[11px] text-slate-400">Official government-linked KYC credentials registered with the Monnify Gateway.</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase font-mono">KYC VERIFIED</span>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        <div className="space-y-1 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">Bank Verification Number (BVN)</span>
                          <span className="font-mono text-slate-250 font-bold select-all">
                            {userProfile.bvn ? `******${userProfile.bvn.slice(-4)}` : 'Verified via BVN'}
                          </span>
                        </div>
                        <div className="space-y-1 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">National Identification Number (NIN)</span>
                          <span className="font-mono text-slate-250 font-bold select-all">
                            {userProfile.nin ? `******${userProfile.nin.slice(-4)}` : 'Verified via NIN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {userProfile.walletAccountNumber && (
                      <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden text-left">
                        <div className="p-5 border-b border-slate-850 flex justify-between items-center">
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Wallet Transaction Statement</h3>
                          <span className="text-[10px] text-slate-500">{walletTransactions.length} events logged</span>
                        </div>
                        {walletTransactions.length === 0 ? (
                          <div className="py-12 text-center text-slate-500 text-xs font-mono">
                            No transactions recorded on this wallet account yet.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] border-collapse">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-500 font-mono uppercase bg-slate-950/20">
                                  <th className="p-3">Reference</th>
                                  <th className="p-3">Amount</th>
                                  <th className="p-3">Type</th>
                                  <th className="p-3">Narration</th>
                                  <th className="p-3">Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {walletTransactions.map(tx => (
                                  <tr key={tx.walletTransactionReference} className="border-b border-slate-850 hover:bg-slate-900/10 transition-colors">
                                    <td className="p-3 font-mono text-slate-350 truncate max-w-[120px]" title={tx.walletTransactionReference}>{tx.walletTransactionReference}</td>
                                    <td className="p-3 font-bold text-slate-200">{parseFloat(tx.amount).toLocaleString()} ₦</td>
                                    <td className="p-3 font-mono">
                                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase ${
                                        tx.transactionType === 'DEBIT' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                                      }`}>
                                        {tx.transactionType}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-400 truncate max-w-[150px]" title={tx.narration}>{tx.narration || '—'}</td>
                                    <td className="p-3 text-slate-500 font-mono">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROPERTIES HUB */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Properties Hub</h2>
                  <p className="text-xs text-slate-400">Onboard and configure listed houses and estates.</p>
                </div>
                {userProfile && userProfile.role === 'LANDLORD' && (
                  <button
                    onClick={() => setShowPropertyForm(!showPropertyForm)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    List Property
                  </button>
                )}
              </div>

              {/* Form Modal */}
              {showPropertyForm && (
                <form onSubmit={handleCreateProperty} className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl grid gap-4 sm:grid-cols-2 text-left">
                  <h3 className="sm:col-span-2 text-sm font-bold text-indigo-400">Register New Property Listing</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">PROPERTY TITLE</label>
                    <input required type="text" placeholder="e.g. Oakridge Villa Unit 4" value={propertyInput.title} onChange={e => setPropertyInput({...propertyInput, title: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">LISTING TYPE</label>
                    <select value={propertyInput.type} onChange={e => setPropertyInput({...propertyInput, type: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                      <option value="RENT">RENT (Lease agreements)</option>
                      <option value="SALE">SALE (Escrow purchase)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">PRICE (NGN)</label>
                    <input required type="number" placeholder="e.g. 150000" value={propertyInput.price} onChange={e => setPropertyInput({...propertyInput, price: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">NEIGHBORHOOD AREA</label>
                    <input required type="text" placeholder="e.g. Lekki Phase 1, Lagos" value={propertyInput.area} onChange={e => setPropertyInput({...propertyInput, area: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">BUILDING TYPE</label>
                    <input required type="text" placeholder="e.g. 3 Bedroom Duplex" value={propertyInput.buildingType} onChange={e => setPropertyInput({...propertyInput, buildingType: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">IMAGE URL (OPTIONAL)</label>
                    <input type="text" placeholder="e.g. /image.png" value={propertyInput.imageUrl} onChange={e => setPropertyInput({...propertyInput, imageUrl: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">FIRST PAYMENT AMOUNT (NGN) (OPTIONAL)</label>
                    <input type="number" placeholder="Defaults to full price" value={propertyInput.firstPaymentAmount} onChange={e => setPropertyInput({...propertyInput, firstPaymentAmount: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  {propertyInput.type === 'RENT' && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono block">RENT PAYMENT FREQUENCY</label>
                      <select value={propertyInput.paymentFrequency} onChange={e => setPropertyInput({...propertyInput, paymentFrequency: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="BI_ANNUAL">Bi-Annually</option>
                        <option value="ANNUAL">Annually</option>
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">ANNUAL PROJECTIONS (OPTIONAL)</label>
                    <input type="text" placeholder="e.g. 10% YoY capital yield" value={propertyInput.annualProjections} onChange={e => setPropertyInput({...propertyInput, annualProjections: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">TITLE DEED / OWNERSHIP LINK (OPTIONAL)</label>
                    <input type="text" placeholder="e.g. Google Drive link" value={propertyInput.ownershipDocumentUrl} onChange={e => setPropertyInput({...propertyInput, ownershipDocumentUrl: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono" />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition">Create Property</button>
                    <button type="button" onClick={() => setShowPropertyForm(false)} className="px-5 py-2.5 border border-slate-800 text-slate-400 text-xs font-semibold rounded-lg transition">Cancel</button>
                  </div>
                </form>
              )}

              {/* Grid of properties */}
              {properties.length === 0 ? (
                <div className="py-24 text-center border border-slate-800 border-dashed rounded-2xl bg-slate-950/10">
                  <Building2 className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No properties listed yet</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map(p => (
                    <div key={p.id} className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/60 transition-all duration-300">
                      <div className="h-40 bg-slate-900 relative">
                        <img src={p.imageUrl || '/dashboard_preview.jpg'} alt={p.title} className="w-full h-full object-cover opacity-80" />
                        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          p.status === 'LISTED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-350 border border-slate-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="p-5 space-y-4 text-left">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-200">{p.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">{p.buildingType} &middot; {p.area}</p>
                        </div>
                        <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">{parseFloat(p.price || '0').toLocaleString()} NGN</span>
                          <span className="text-[9px] font-mono text-slate-500">TYPE: {p.type}</span>
                        </div>
                        {userProfile && userProfile.role === 'TENANT' && p.status === 'LISTED' && (
                          <div className="pt-2">
                            <button
                              onClick={() => initiateCheckout(p)}
                              className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition"
                            >
                              {p.type === 'RENT' ? 'Rent Apartment Now' : 'Purchase via Escrow'}
                            </button>
                          </div>
                        )}
                        {userProfile && userProfile.role === 'TENANT' && p.status !== 'LISTED' && (
                          <div className="pt-2">
                            <button
                              disabled
                              className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                            >
                              {p.status === 'UNDER_ESCROW' ? 'Under Escrow Purchase' : p.status === 'SOLD' ? 'Sold' : 'Unavailable (Rented)'}
                            </button>
                          </div>
                        )}
                        {userProfile && userProfile.role === 'LANDLORD' && (
                          <div className="pt-2 text-center border-t border-slate-900/50">
                            <span className="text-[10px] font-mono text-indigo-400/70 uppercase tracking-wider block pt-2">Own Listing ({p.status})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEASES VAULT */}
          {activeTab === 'leases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Leases Vault</h2>
                  <p className="text-xs text-slate-400">View active leases and ledger standing contracts.</p>
                </div>
                {userProfile && userProfile.role === 'LANDLORD' && (
                  <button
                    onClick={() => setShowLeaseForm(!showLeaseForm)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Establish Lease
                  </button>
                )}
              </div>

              {/* Form Modal */}
              {showLeaseForm && (
                <form onSubmit={handleCreateLease} className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl grid gap-4 sm:grid-cols-2 text-left">
                  <h3 className="sm:col-span-2 text-sm font-bold text-indigo-400">Configure New Lease Agreement</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">SELECT PROPERTY</label>
                    <select required value={leaseInput.propertyId} onChange={e => setLeaseInput({...leaseInput, propertyId: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                      <option value="">-- Choose RENT property --</option>
                      {properties.filter(p => p.type === 'RENT').map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">TENANT EMAIL</label>
                    <input required type="email" placeholder="e.g. tenant@reflow.com" value={leaseInput.tenantId} onChange={e => setLeaseInput({...leaseInput, tenantId: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">RENT AMOUNT (NGN)</label>
                    <input required type="number" placeholder="e.g. 150000" value={leaseInput.rentAmount} onChange={e => setLeaseInput({...leaseInput, rentAmount: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">NEXT DUE DATE</label>
                    <input required type="date" value={leaseInput.nextDueDate} onChange={e => setLeaseInput({...leaseInput, nextDueDate: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition">Deploy Lease</button>
                    <button type="button" onClick={() => setShowLeaseForm(false)} className="px-5 py-2.5 border border-slate-800 text-slate-400 text-xs font-semibold rounded-lg transition">Cancel</button>
                  </div>
                </form>
              )}

              {/* Leases Catalog Table */}
              {tenancies.length === 0 ? (
                <div className="py-24 text-center border border-slate-800 border-dashed rounded-2xl bg-slate-950/10">
                  <Users className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No active lease agreements found</p>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 font-mono">
                        <th className="p-4">Property</th>
                        <th className="p-4">Tenant</th>
                        <th className="p-4">Rent Amount</th>
                        <th className="p-4">Monnify Virtual Account</th>
                        <th className="p-4">Next Due Date</th>
                        <th className="p-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenancies.map(t => (
                        <tr key={t.id} className="border-b border-slate-850 hover:bg-slate-900/10 transition-colors">
                          <td className="p-4 font-bold text-slate-200">{t.property?.title || 'Unknown Property'}</td>
                          <td className="p-4 text-slate-400 font-mono">{t.tenantId}</td>
                          <td className="p-4 font-semibold">{parseFloat(t.rentAmount).toLocaleString()} NGN</td>
                          <td className="p-4 font-mono text-indigo-400">{t.nombaVirtualAccountId || 'Generating...'}</td>
                          <td className="p-4 text-slate-400">{t.nextDueDate}</td>
                          <td className={`p-4 font-semibold ${parseFloat(t.balance) < 0 ? 'text-rose-450' : 'text-emerald-400'}`}>
                            {parseFloat(t.balance).toLocaleString()} NGN
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: RENT COLLECTIONS DESK */}
          {activeTab === 'rent-desk' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Collect Rent Payments</h2>
                  <p className="text-xs text-slate-400">Redeem incoming paid tenant rent transactions straight to your bank account.</p>
                </div>
                {landlordRentPayments.filter(p => !p.redeemed).length > 0 && (
                  <button
                    onClick={handleRedeemAllRentPayments}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start"
                  >
                    <Coins className="w-4 h-4" />
                    Redeem All Rent Payments
                  </button>
                )}
              </div>

              {landlordRentPayments.length === 0 ? (
                <div className="py-24 text-center border border-slate-800 border-dashed rounded-2xl bg-slate-950/10">
                  <Coins className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No rent payments received yet</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {landlordRentPayments.map(p => (
                    <div key={p.id} className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-200">{p.tenancy?.property?.title || 'Unknown Property'}</h4>
                          <p className="text-[9px] font-mono text-slate-500">PAYMENT REF: {p.nombaReference}</p>
                          <p className="text-[9px] font-mono text-slate-400">PAID ON: {new Date(p.receivedAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          p.redeemed ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {p.redeemed ? 'Redeemed' : 'Pending Claim'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-900 py-3">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">Amount Paid</span>
                          <span className="font-semibold text-slate-250">{parseFloat(p.amount).toLocaleString()} NGN</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">Ledger Status</span>
                          <span className="font-semibold text-emerald-400 uppercase text-[10px]">{p.matchedStatus}</span>
                        </div>
                      </div>

                      {p.redeemed ? (
                        <div className="text-[10px] font-mono text-slate-500 space-y-1">
                          <div>Payout Ref: <span className="text-slate-400">{p.redeemPayoutReference}</span></div>
                          <div>Settled on: <span className="text-slate-400">{p.redeemedAt ? new Date(p.redeemedAt).toLocaleString() : ''}</span></div>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <button
                            onClick={() => handleRedeemRentPayment(p.id)}
                            className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition"
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
          {activeTab === 'escrow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-100">Purchase Escrows</h2>
                  <p className="text-xs text-slate-400">Confirm payments, release holdings, or reject/refund transactions.</p>
                </div>
                {userProfile && userProfile.role === 'LANDLORD' && (
                  <button
                    onClick={() => setShowEscrowForm(!showEscrowForm)}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Instantiate Escrow
                  </button>
                )}
              </div>

              {/* Form Modal */}
              {showEscrowForm && (
                <form onSubmit={handleCreateEscrow} className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl grid gap-4 sm:grid-cols-2 text-left">
                  <h3 className="sm:col-span-2 text-sm font-bold text-indigo-400">Initialize Purchase Escrow Contract</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">SELECT PROPERTY</label>
                    <select required value={escrowInput.propertyId} onChange={e => setEscrowInput({...escrowInput, propertyId: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                      <option value="">-- Choose SALE property --</option>
                      {properties.filter(p => p.type === 'SALE').map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">BUYER EMAIL</label>
                    <input required type="email" placeholder="e.g. buyer@reflow.com" value={escrowInput.buyerId} onChange={e => setEscrowInput({...escrowInput, buyerId: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-mono block">PURCHASE PRICE (NGN)</label>
                    <input required type="number" placeholder="e.g. 15000000" value={escrowInput.amountHeld} onChange={e => setEscrowInput({...escrowInput, amountHeld: e.target.value})} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs" />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition">Create Escrow</button>
                    <button type="button" onClick={() => setShowEscrowForm(false)} className="px-5 py-2.5 border border-slate-800 text-slate-400 text-xs font-semibold rounded-lg transition">Cancel</button>
                  </div>
                </form>
              )}

              {/* Escrow Items List */}
              {escrows.length === 0 ? (
                <div className="py-24 text-center border border-slate-850 border-dashed rounded-2xl bg-slate-950/10">
                  <Coins className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No escrow transactions found</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {escrows.map(e => (
                    <div key={e.id} className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-200">{e.property?.title || 'Unknown Property'}</h4>
                          <p className="text-[9px] font-mono text-slate-500">BUYER: {e.buyerId}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${
                          e.status === 'HELD' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                          e.status === 'RELEASED' ? 'bg-slate-800 text-slate-350 border border-slate-700' : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                        }`}>
                          {e.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-900 py-3">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">Amount Held</span>
                          <span className="font-semibold">{parseFloat(e.amountHeld).toLocaleString()} NGN</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">Monnify Account</span>
                          <span className="font-mono text-indigo-400">{e.nombaVirtualAccountId || 'Unassigned'}</span>
                        </div>
                      </div>

                      {/* Operational triggers */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {e.status === 'PENDING_PAYMENT' && (
                          <button
                            onClick={() => handleSyncEscrow(e.id)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-330 flex items-center gap-1.5 transition"
                          >
                            <RefreshCw className="w-3 h-3 animate-spin-hover" />
                            Verify Deposit
                          </button>
                        )}
                        {(e.status === 'HELD' || e.status === 'RELEASE_PENDING' || e.status === 'PAYOUT_FAILED') && userProfile && userProfile.role === 'LANDLORD' && (
                          <>
                            <button
                              onClick={() => handleReleaseEscrow(e.id)}
                              className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition"
                            >
                              <Landmark className="w-3.5 h-3.5" />
                              {e.status === 'RELEASE_PENDING' ? 'Retry / Sync Payout' : 'Release Payout'}
                            </button>
                            {e.status === 'HELD' && (
                              <button
                                onClick={() => handleRejectEscrow(e.id)}
                                className="px-3.5 py-2 border border-slate-800 bg-slate-950/20 hover:bg-slate-900 rounded-xl text-[10px] font-bold text-rose-450 flex items-center gap-1.5 transition"
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

          {/* TAB 5: RECEIPTS LOCKER */}
          {activeTab === 'receipts' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-100">Receipts Locker</h2>
                <p className="text-xs text-slate-400">Vault for verified transaction receipts.</p>
              </div>

              {receipts.length === 0 ? (
                <div className="py-24 text-center border border-slate-800 border-dashed rounded-2xl bg-slate-950/10">
                  <Receipt className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No receipts issued yet</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {receipts.map(r => (
                    <div key={r.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">{r.category}</span>
                          <h4 className="font-bold text-sm text-slate-200">{r.title}</h4>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="border-t border-slate-900 pt-3">
                        <span className="text-slate-500 block text-[9px] uppercase font-mono">Reference</span>
                        <p className="text-xs font-mono text-slate-350 select-all truncate">{r.reference}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                        <span>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="text-slate-300 font-bold font-sans text-xs">{parseFloat(r.amount).toLocaleString()} NGN</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DEVELOPER PLAYGROUND */}
          {activeTab === 'developer' && (
            <div className="space-y-6">
              <div className="text-left space-y-1.5">
                <h2 className="text-xl font-extrabold text-slate-100">Sandbox API Explorer</h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Select any Monnify-mapped endpoint from the library to build, inspect, and execute request payloads against your active sandbox environment.
                </p>
              </div>

              {/* Sub Tab Navigation */}
              <div className="border-b border-slate-850 flex gap-6 text-xs font-mono">
                <button
                  onClick={() => setSimulatorSubTab('playground')}
                  className={`pb-3 font-semibold transition-colors ${simulatorSubTab === 'playground' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-205'}`}
                >
                  [⚡] API Playground Explorer ({APIS_METADATA.length} APIs)
                </button>
                <button
                  onClick={() => setSimulatorSubTab('logs')}
                  className={`pb-3 font-semibold transition-colors ${simulatorSubTab === 'logs' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-205'}`}
                >
                  [-] Transaction Event Logs
                </button>
              </div>

              {/* Playground Simulator */}
              {simulatorSubTab === 'playground' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  {/* Left Endpoints List */}
                  <div className="lg:col-span-4 space-y-2 max-h-[550px] overflow-y-auto pr-2 border-r border-slate-800">
                    {APIS_METADATA.map((api, idx) => (
                      <div
                        key={api.name}
                        onClick={() => setSelectedApiIndex(idx)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 text-left space-y-1.5 ${selectedApiIndex === idx ? 'bg-slate-800/80 border-indigo-500/50 shadow-inner shadow-indigo-500/5' : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold ${api.method === 'POST' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                            {api.method}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">{api.tag}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-200 truncate">{api.name}</h4>
                        <p className="text-[9px] font-mono text-slate-500 truncate">{api.url}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Payload Inspector */}
                  <div className="lg:col-span-8 space-y-5">
                    {APIS_METADATA[selectedApiIndex] && (
                      <div className="space-y-4">
                        <div className="p-5 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2 backdrop-blur-sm">
                          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${APIS_METADATA[selectedApiIndex].method === 'POST' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-350'}`}>
                              {APIS_METADATA[selectedApiIndex].method}
                            </span>
                            {APIS_METADATA[selectedApiIndex].name}
                          </h3>
                          <p className="text-slate-400 text-xs leading-relaxed">{APIS_METADATA[selectedApiIndex].description}</p>
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-[10px] font-mono text-slate-400">
                            Mapped Route: <span className="text-indigo-400 font-bold">{APIS_METADATA[selectedApiIndex].url}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Request Body Payload (Editable JSON)</span>
                          <textarea
                            className="w-full h-40 p-4 bg-slate-950/60 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            value={requestBodyInput}
                            onChange={(e) => setRequestBodyInput(e.target.value)}
                          />
                        </div>

                        <button
                          onClick={handleExecutePlaygroundApi}
                          disabled={apiLoading}
                          className="px-6 py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all duration-300 uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-md shadow-indigo-500/10"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {apiLoading ? "Sending request..." : "Run Sandbox API"}
                        </button>

                        {apiResponseOutput && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Response JSON Payload</span>
                            <pre className="p-4 bg-slate-950 border border-slate-800 text-slate-300 text-[10px] rounded-xl font-mono overflow-x-auto max-h-64 shadow-inner">
                              {JSON.stringify(apiResponseOutput, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {simulatorSubTab === 'logs' && (
                <div className="py-24 text-center border border-slate-850 border-dashed rounded-2xl bg-slate-950/10">
                  <Compass className="w-8 h-8 text-slate-650 mx-auto animate-pulse" />
                  <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-wider">No execution logs captured in this session</p>
                  <p className="mt-1 text-[10px] text-slate-600">Run endpoints in the playground tab to monitor execution logs.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
