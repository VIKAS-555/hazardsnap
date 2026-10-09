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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {successMsg ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Authentication Verified' : 'Account Registered'}
            </h3>
            <p className="text-xs text-slate-500">
              Welcome to the HazardSnap Civic Intelligence Grid.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                CIVIC ID GATEWAY
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {mode === 'login' ? 'Access HazardSnap Grid' : 'Create Civic Reporter Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'login'
                  ? 'Sign in to confirm road hazards, verify fixes, or access dispatch.'
                  : 'Join urban commuters protecting streets in real-time.'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  role === 'citizen'
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Municipal Agency Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    placeholder="e.g. BBMP-ENG-4912"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="+91 98765 43210 or user@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Password or OTP Code
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
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
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Instant Access as Guest Commuter (Demo Mode)
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              {mode === 'login' ? (
                <span>
                  Don't have a civic ID?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-slate-900 font-bold underline underline-offset-2 hover:text-black"
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
                    className="text-slate-900 font-bold underline underline-offset-2 hover:text-black"
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
