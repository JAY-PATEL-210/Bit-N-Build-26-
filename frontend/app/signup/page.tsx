'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /signup - Role-Based Signup Page
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Building2, Shield, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/index';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role selector FIRST: "TRAVELER" vs "COMPANY" (canonical values)
  const [role, setRole] = useState<UserRole>('TRAVELER');

  // Traveler form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Company form state
  const [companyName, setCompanyName] = useState('');
  const [airlineCode, setAirlineCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'COMPANY' || roleParam === 'TRAVELER') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (role === 'TRAVELER' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (role === 'COMPANY' && !companyName.trim()) {
      setError('Please enter your company or airline name.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup({
        role, // Strictly canonical: 'TRAVELER' or 'COMPANY'
        email: email.trim(),
        password,
        name: role === 'TRAVELER' ? name.trim() : undefined,
        phone: role === 'TRAVELER' && phone.trim() ? phone.trim() : undefined,
        companyName: role === 'COMPANY' ? companyName.trim() : undefined,
        airlineCode: role === 'COMPANY' && airlineCode.trim() ? airlineCode.trim().toUpperCase() : undefined,
      });

      if (!response.success || !response.data) {
        setError(response.error?.message || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      const registeredRole = response.data.user.role;
      setSuccess(`Account registered successfully as ${registeredRole}! Redirecting...`);

      setTimeout(() => {
        if (registeredRole === 'COMPANY') {
          router.push('/company/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Network error occurred during signup.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Create your account</h1>
          <p className="text-xs text-slate-400">
            Join the autonomous concierge network to monitor or manage flights.
          </p>
        </div>

        <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-2xl space-y-6">
          {/* 1. ROLE SELECTOR FIRST: Traveler vs Company */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('TRAVELER');
                  setError(null);
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-left ${
                  role === 'TRAVELER'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-900/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <User className={`w-5 h-5 ${role === 'TRAVELER' ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Traveler</span>
                <span className="text-[10px] text-slate-400">Personal Itineraries</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('COMPANY');
                  setError(null);
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-left ${
                  role === 'COMPANY'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-900/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Building2 className={`w-5 h-5 ${role === 'COMPANY' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Airline / Company</span>
                <span className="text-[10px] text-slate-400">Flight Ops & Control</span>
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* 2. ROLE-SPECIFIC FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'TRAVELER' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="traveler@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number <span className="text-slate-500 text-[10px]">(Optional for SMS alerts)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Airline Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Air India / British Airways"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Work Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operations@airindia.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Airline IATA Code <span className="text-slate-500 text-[10px]">(Optional, e.g. AI, BA, EK)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="AI"
                    value={airlineCode}
                    onChange={(e) => setAirlineCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 ${
                role === 'COMPANY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create {role === 'COMPANY' ? 'Company' : 'Traveler'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Link to Login */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign in here →
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6 bg-slate-950 text-slate-400 text-xs">
          Loading registration portal...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

