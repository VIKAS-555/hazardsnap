'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, ArrowRight, CheckCircle2, Lock, Mail, Phone } from 'lucide-react';

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
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [officialId, setOfficialId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        if (onAuthSuccess) {
          onAuthSuccess({
            name: role === 'official' ? 'Officer Rao (Ward 112)' : 'Ananya M.',
            role,
          });
        }
        onClose();
      }, 1000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e0f14] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {successMsg ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Authentication Verified' : 'Account Registered'}
            </h3>
            <p className="text-xs text-slate-400">
              Welcome to the HazardSnap Civic Intelligence Grid.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                CIVIC ID GATEWAY
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {mode === 'login' ? 'Access HazardSnap Grid' : 'Create Civic Reporter Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login'
                  ? 'Sign in to confirm road hazards, verify fixes, or access dispatch.'
                  : 'Join urban commuters protecting streets in real-time.'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  role === 'citizen'
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
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
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Municipal Officer</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {role === 'official' ? (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Municipal Agency Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    placeholder="e.g. BBMP-ENG-4912"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="+91 98765 43210 or user@example.com"
                    className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Password or OTP Code
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-zinc-950 font-bold text-xs shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
              >
                <span>{isLoading ? 'Verifying...' : mode === 'login' ? 'Sign In to Grid' : 'Register Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Guest Demo Bypass */}
              <button
                type="button"
                onClick={() => {
                  if (onAuthSuccess) {
                    onAuthSuccess({ name: 'Guest Commuter', role: 'citizen' });
                  }
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-slate-400 hover:text-white text-xs font-medium transition"
              >
                Instant Access as Guest Commuter (Demo Mode)
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/[0.06]">
              {mode === 'login' ? (
                <span>
                  Don't have a civic ID?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-white font-semibold underline underline-offset-2 hover:text-slate-300"
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
                    className="text-white font-semibold underline underline-offset-2 hover:text-slate-300"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
