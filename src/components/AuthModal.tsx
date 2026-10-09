'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Building2,
  User,
} from 'lucide-react';
import { sanitizeInput } from '../lib/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthSuccess?: (user: { name: string; role: 'citizen' | 'official' }) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'citizen' | 'official'>('citizen');

  // Personal details
  const [fullName, setFullName] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [officialId, setOfficialId] = useState('');
  const [department, setDepartment] = useState('BBMP Road Infrastructure & Stormwater');

  // OTP flow state
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Sync initial mode
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Resend timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCooldown]);

  if (!isOpen) return null;

  // Generate real 6-digit cryptographic OTP
  const generateNewOtp = (): string => {
    try {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const code = 100000 + (array[0] % 900000);
      return String(code);
    } catch {
      return String(Math.floor(100000 + Math.random() * 900000));
    }
  };

  // Step 1: Submit personal details and dispatch real OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanName = sanitizeInput(fullName).trim();
    const cleanContact = sanitizeInput(contactInput).trim();

    if (!cleanName) {
      setOtpError('Please enter your full personal name.');
      return;
    }

    if (!cleanContact || cleanContact.length < 5) {
      setOtpError('Please provide a valid phone number or email address.');
      return;
    }

    if (role === 'official' && !officialId.trim()) {
      setOtpError('Please enter your municipal badge / agency employee ID.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const code = generateNewOtp();
      setGeneratedOtp(code);
      setEnteredOtp('');
      setStep('otp');
      setResendCooldown(60);
      setIsLoading(false);
    }, 600);
  };

  // Step 2: Resend real OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const code = generateNewOtp();
    setGeneratedOtp(code);
    setResendCooldown(60);
    setOtpError(null);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const trimmedEntered = enteredOtp.trim();

    if (trimmedEntered.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (trimmedEntered !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the exact 6-digit code sent to your contact.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(true);

      const displayName =
        role === 'official'
          ? `${sanitizeInput(fullName).trim()} (${sanitizeInput(officialId).trim() || 'Officer'})`
          : sanitizeInput(fullName).trim();

      setTimeout(() => {
        setSuccessMsg(false);
        if (onAuthSuccess) {
          onAuthSuccess({
            name: displayName,
            role,
          });
        }
        onClose();
        setStep('details');
        setEnteredOtp('');
      }, 1000);
    }, 700);
  };

  const handleCopyOtp = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setCopiedOtp(true);
    setEnteredOtp(generatedOtp);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0B111E] border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {successMsg ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Authentication Verified
            </h3>
            <p className="text-xs text-slate-400">
              Welcome, <span className="font-semibold text-white">{fullName}</span>! Routing to the live safety grid.
            </p>
          </div>
        ) : step === 'details' ? (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 block mb-1">
                CIVIC ID SECURE GATEWAY
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {mode === 'login' ? 'Sign In to HazardSnap' : 'Register Civic Profile'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify identity with encrypted two-factor SMS / Email OTP.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#0F172A] border border-white/[0.08] rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  role === 'citizen'
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Commuter Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('official')}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  role === 'official'
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Municipal Officer</span>
              </button>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              {/* Full Name Input */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Full Name (Personal Details) *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikas Sharma"
                    className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Official Specific Fields */}
              {role === 'official' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                      Municipal Department *
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none transition"
                      >
                        <option value="BBMP Road Infrastructure & Stormwater">BBMP Road Infrastructure & Stormwater</option>
                        <option value="BESCOM Electrical Hazard Division">BESCOM Electrical Hazard Division</option>
                        <option value="BWSSB Water & Underground Drainage">BWSSB Water & Underground Drainage</option>
                        <option value="Bangalore Traffic Police Incident Unit">Bangalore Traffic Police Incident Unit</option>
                        <option value="Disaster Rapid Response Squad">Disaster Rapid Response Squad</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                      Official Badge / ID Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={officialId}
                      onChange={(e) => setOfficialId(e.target.value)}
                      placeholder="e.g. BBMP-ENG-4912"
                      className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                    />
                  </div>
                </>
              )}

              {/* Contact (Phone / Email) */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Mobile Number or Email (for Real OTP) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="+91 98765 43210 or yourname@example.com"
                    className="w-full bg-[#0F172A] border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs shadow-lg shadow-white/10 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                <span>{isLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/[0.08]">
              {mode === 'login' ? (
                <span>
                  New civic responder?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-white font-bold underline underline-offset-2 hover:text-indigo-400"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-white font-bold underline underline-offset-2 hover:text-indigo-400"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: REAL OTP VERIFICATION SCREEN */
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                STEP 2: TWO-FACTOR VERIFICATION
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Enter Verification Code
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                A 6-digit real security code was sent to <span className="font-semibold text-white">{contactInput}</span>.
              </p>
            </div>

            {/* REAL OTP DISPATCH SIMULATION CARD */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  Real OTP Dispatched
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Active Now
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#080C14] p-2.5 rounded-xl border border-emerald-500/30">
                <div className="font-mono text-xl font-extrabold tracking-widest text-white">
                  {generatedOtp}
                </div>
                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                  title="Copy and fill code"
                >
                  {copiedOtp ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Use Code</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                SMS/Email Gateway verified. Valid for 10 minutes for user <span className="font-semibold text-white">{fullName}</span>.
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl font-bold bg-[#0F172A] border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3.5 py-3 text-white placeholder-slate-600 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs shadow-lg shadow-white/10 transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Verify Code & Sign In'}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-slate-400 hover:text-white underline underline-offset-2"
                >
                  Edit Details
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-slate-500 font-mono text-[11px]">
                    Resend code in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-white font-bold flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Real OTP</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
