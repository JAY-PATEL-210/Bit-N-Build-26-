'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /signup - Registration page for new Travelers and Airline Partners
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Building2,
  Eye,
  EyeOff,
  Plane,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/index';

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>('TRAVELER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [airlineCode, setAirlineCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!trimmedPassword || trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup({
        email: trimmedEmail,
        password: trimmedPassword,
        role,
        name: trimmedName,
        phone: phone.trim() || undefined,
        companyName: role === 'COMPANY' ? companyName.trim() || undefined : undefined,
        airlineCode: role === 'COMPANY' ? airlineCode.trim() || undefined : undefined,
      });

      if (!response.success || !response.data) {
        setError(
          response.error?.message || 'Registration failed. Please try again.'
        );
        setLoading(false);
        return;
      }

      setSuccess(`Account created successfully! Redirecting...`);

      setTimeout(() => {
        if (response.data!.user.role === 'COMPANY') {
          router.push('/company/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Network error during registration.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative"
      style={{
        backgroundColor: '#070d1a',
        background: 'radial-gradient(circle at 50% 40%, #0f1c3f 0%, #070d1a 75%, #03060d 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-700/60 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-4">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold shadow-inner">
              <Plane className="w-3.5 h-3.5 text-blue-400" />
              <span>RoutePilot</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              Create Your{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Account
              </span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Join the autonomous travel disruption management platform.
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              ACCOUNT TYPE
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                onClick={() => { setRole('TRAVELER'); setError(null); }}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  role === 'TRAVELER'
                    ? 'bg-blue-600/30 border border-blue-500/60 text-white shadow-lg shadow-blue-900/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <User className={`w-4 h-4 ${role === 'TRAVELER' ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="text-xs font-extrabold">Customer / Traveler</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('COMPANY'); setError(null); }}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  role === 'COMPANY'
                    ? 'bg-emerald-600/30 border border-emerald-500/60 text-white shadow-lg shadow-emerald-900/30 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'COMPANY' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-xs font-extrabold">Airline Partner</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+91-98765-43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />
            </div>

            {/* Company-specific fields */}
            {role === 'COMPANY' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Airline Name</label>
                  <input
                    type="text"
                    placeholder="Air India"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Airline Code (IATA)</label>
                  <input
                    type="text"
                    placeholder="AI"
                    maxLength={3}
                    value={airlineCode}
                    onChange={(e) => setAirlineCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
                role === 'COMPANY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
