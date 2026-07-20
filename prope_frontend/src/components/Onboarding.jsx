import React, { useState } from 'react';
import { Landmark, ShieldCheck, RefreshCw, ArrowRight, User, Terminal, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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

export default function Onboarding({ onComplete, onCancel }) {
  const [mode, setMode] = useState('signup'); // signup, login
  const [step, setStep] = useState(1); // 1: Account setup, 2: Identity Verification, 3: Provision Wallet, 4: Complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('TENANT');
  const [kycMethod, setKycMethod] = useState('nin'); // nin, bvn

  // Verification Inputs
  const [ninInput, setNinInput] = useState('');
  const [bvnInput, setBvnInput] = useState('');
  const [bvnNameInput, setBvnNameInput] = useState('');
  const [bvnDobInput, setBvnDobInput] = useState('');
  const [bvnPhoneInput, setBvnPhoneInput] = useState('');

  // Wallet Inputs
  const [walletBvnInput, setWalletBvnInput] = useState('');
  const [walletDobInput, setWalletDobInput] = useState('');
  const [provisionedAccount, setProvisionedAccount] = useState(null);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');

  // Handle Login Check
  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!loginEmail) return;
    setLoading(true);
    setError(null);
    try {
      const data = await callGraphQL(`
        query ($email: String!) {
          getUserProfile(email: $email) {
            email
            kycVerified
            walletAccountNumber
            walletBankName
            walletReference
            role
            name
          }
        }
      `, { email: loginEmail });

      const profile = data.getUserProfile;
      if (!profile) {
        // User does not exist, initialize signup with this email
        setEmail(loginEmail);
        setMode('signup');
        setStep(1);
        alert("Account email not registered. Let's start the KYC and Wallet creation flow!");
      } else {
        // Profile exists, check their verification/wallet state
        setEmail(profile.email);
        setName(profile.name || '');
        setRole(profile.role || 'TENANT');
        if (!profile.kycVerified) {
          setStep(2);
          alert("Your identity is not verified. Please complete your KYC verification.");
        } else if (!profile.walletAccountNumber) {
          setStep(3);
          alert("Your Monnify wallet is not provisioned. Let's create your personal wallet now.");
        } else {
          // Fully setup, log in!
          onComplete(profile.email);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Sign Up Setup
  async function handleAccountSetup(e) {
    e.preventDefault();
    if (!email || !name) {
      alert("Please fill name and email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await callGraphQL(`
        mutation ($email: String!, $name: String!, $role: String!) {
          registerUserProfile(email: $email, name: $name, role: $role) {
            email
            kycVerified
            walletAccountNumber
          }
        }
      `, { email, name, role });
      
      const profile = data.registerUserProfile;
      if (profile.walletAccountNumber) {
        // Already fully configured
        onComplete(email);
      } else if (profile.kycVerified) {
        setStep(3);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: KYC verify
  async function handleVerifyNIN(e) {
    e.preventDefault();
    if (!ninInput || ninInput.length !== 11) {
      alert("NIN must be exactly 11 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await callGraphQL(`
        mutation ($email: String!, $nin: String!) {
          verifyCustomerNIN(email: $email, nin: $nin) {
            kycVerified
          }
        }
      `, { email, nin: ninInput });
      alert("NIN Identity Verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.message || "NIN verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyBVN(e) {
    e.preventDefault();
    if (!bvnInput || bvnInput.length !== 11) {
      alert("BVN must be exactly 11 digits.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await callGraphQL(`
        mutation ($email: String!, $bvn: String!, $name: String!, $dob: String!, $phone: String!) {
          verifyCustomerBVN(email: $email, bvn: $bvn, name: $name, dateOfBirth: $dob, mobileNo: $phone) {
            kycVerified
          }
        }
      `, {
        email,
        bvn: bvnInput,
        name: bvnNameInput,
        dob: bvnDobInput,
        phone: bvnPhoneInput
      });
      alert("BVN Identity Verified successfully!");
      setStep(3);
    } catch (err) {
      setError(err.message || "BVN verification failed.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Wallet Provisioning
  async function handleCreateWallet(e) {
    e.preventDefault();
    if (!walletBvnInput || walletBvnInput.length !== 11) {
      alert("Confirm your 11-digit BVN.");
      return;
    }
    if (!walletDobInput) {
      alert("Please specify Date of Birth.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await callGraphQL(`
        mutation ($email: String!, $bvn: String!, $dob: String!) {
          createCustomerWallet(email: $email, bvn: $bvn, dateOfBirth: $dob) {
            walletAccountNumber
            walletBankName
            walletReference
          }
        }
      `, { email, bvn: walletBvnInput, dob: walletDobInput });
      
      setProvisionedAccount(data.createCustomerWallet);
      setStep(4);
    } catch (err) {
      setError(err.message || "Wallet creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Box container */}
      <div className="w-full max-w-md bg-slate-950/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
        
        {/* Brand header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            <span className="font-mono tracking-wider font-bold text-xs text-slate-400">PROPE PORTAL</span>
          </div>
          <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-350 transition">Cancel</button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs rounded-xl font-mono text-left">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-xl flex items-center gap-2 text-left">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            Executing Sandbox Monnify operation...
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-100">Sign In to Prope</h2>
              <p className="text-xs text-slate-400">Enter your registered email to reload your dashboard.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block">EMAIL ADDRESS</label>
              <input
                required
                type="email"
                placeholder="you@email.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-xs text-indigo-400 hover:text-indigo-350 transition"
              >
                Don't have an account? Start KYC Verification
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP MODE: STEP 1 */}
        {mode === 'signup' && step === 1 && (
          <form onSubmit={handleAccountSetup} className="space-y-5 text-left">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-100">Verify Identity & Setup Wallet</h2>
              <p className="text-xs text-slate-400">Prope requires KYC verification to provision your personal Monnify wallet account.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block">YOUR FULL NAME</label>
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block">EMAIL ADDRESS</label>
              <input
                required
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block">ACCOUNT ROLE</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
              >
                <option value="TENANT">TENANT (Pay Rent/Buy Properties)</option>
                <option value="LANDLORD">LANDLORD (Receive payouts/Onboard estates)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              Continue to Identity Verification
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-indigo-400 hover:text-indigo-350 transition"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP MODE: STEP 2 (KYC VERIFY) */}
        {mode === 'signup' && step === 2 && (
          <div className="space-y-5 text-left">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-100">Step 2: Complete KYC Verification</h2>
              <p className="text-xs text-slate-400">Verifying customer credentials directly against Monnify identity APIs.</p>
            </div>

            {/* Selector */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-900 text-xs font-mono">
              <button
                type="button"
                onClick={() => setKycMethod('nin')}
                className={`flex-1 py-1.5 rounded-md transition ${kycMethod === 'nin' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
              >
                NIN Verify (₦60)
              </button>
              <button
                type="button"
                onClick={() => setKycMethod('bvn')}
                className={`flex-1 py-1.5 rounded-md transition ${kycMethod === 'bvn' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
              >
                BVN Check (₦10)
              </button>
            </div>

            {kycMethod === 'nin' && (
              <form onSubmit={handleVerifyNIN} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-mono block">NATIONAL IDENTITY NUMBER (NIN)</label>
                  <input
                    required
                    type="text"
                    maxLength="11"
                    placeholder="11-digit NIN"
                    value={ninInput}
                    onChange={e => setNinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition"
                >
                  Verify NIN details
                </button>
              </form>
            )}

            {kycMethod === 'bvn' && (
              <form onSubmit={handleVerifyBVN} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-mono block">BANK VERIFICATION NUMBER (BVN)</label>
                  <input
                    required
                    type="text"
                    maxLength="11"
                    placeholder="11-digit BVN"
                    value={bvnInput}
                    onChange={e => setBvnInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-mono block">FULL NAME (MATCH BVN)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={bvnNameInput}
                    onChange={e => setBvnNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-mono block">DATE OF BIRTH (DD-MMM-YYYY)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 01-Jan-1990"
                    value={bvnDobInput}
                    onChange={e => setBvnDobInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-mono block">PHONE NUMBER (MATCH BVN)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 08012345678"
                    value={bvnPhoneInput}
                    onChange={e => setBvnPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition"
                >
                  Verify BVN Match Details
                </button>
              </form>
            )}
          </div>
        )}

        {/* SIGNUP MODE: STEP 3 (PROVISION WALLET) */}
        {mode === 'signup' && step === 3 && (
          <form onSubmit={handleCreateWallet} className="space-y-5 text-left">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-100">Step 3: Provision Monnify Wallet</h2>
              <p className="text-xs text-slate-400">Identity verified! Generate your personal dedicated Moniepoint bank account.</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block">CONFIRM BVN</label>
              <input
                required
                type="text"
                maxLength="11"
                placeholder="Confirm your 11-digit BVN"
                value={walletBvnInput}
                onChange={e => setWalletBvnInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block">DATE OF BIRTH (YYYY-MM-DD)</label>
              <input
                required
                type="text"
                placeholder="e.g. 1990-01-01"
                value={walletDobInput}
                onChange={e => setWalletDobInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              Generate Personal Wallet
              <Landmark className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* SIGNUP MODE: STEP 4 (COMPLETE) */}
        {mode === 'signup' && step === 4 && provisionedAccount && (
          <div className="space-y-6 text-left">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-bold text-slate-100">Wallet Generated successfully!</h2>
              <p className="text-xs text-slate-400">Your personal sandbox banking details are ready.</p>
            </div>

            {/* Wallet Account details block */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Provider Bank</span>
                <span className="text-xs font-bold text-slate-200 block">{provisionedAccount.walletBankName || 'Moniepoint Microfinance Bank'}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Dedicated Account Number</span>
                <span className="text-lg font-mono font-extrabold text-indigo-400 tracking-wider block mt-0.5 select-all">{provisionedAccount.walletAccountNumber}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Wallet reference identifier</span>
                <span className="text-[10px] font-mono text-slate-350 block mt-0.5 select-all truncate">{provisionedAccount.walletReference}</span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 text-slate-400 text-[11px] leading-relaxed rounded-xl">
              **Funding Wallet:** Fund this wallet by making a simulated test bank transfer to this account number.
            </div>

            <button
              onClick={() => onComplete(email)}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition"
            >
              Enter Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
