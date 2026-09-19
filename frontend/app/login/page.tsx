'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /login - Role-Agnostic Login Page
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { authService } from '@/services/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password || !password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      if (!response.success || !response.data) {
        setError(response.error?.message || 'Login failed. Invalid credentials.');
        setLoading(false);
        return;
      }

      const userRole = response.data.user.role;
      setSuccess(`Authenticated as ${userRole}. Redirecting to your workspace...`);

      setTimeout(() => {
        if (userRole === 'COMPANY') {
          router.push('/company/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Network error during login.');
      setLoading(false);
    }
  };

  // Demo autofill helpers for judges and testers
  const fillDemo = (demoRole: 'TRAVELER' | 'COMPANY') => {
    if (demoRole === 'TRAVELER') {
      setEmail('traveler@demo.com');
      setPassword('demo1234');
    } else {
      setEmail('operations@airindia.in');
      setPassword('airline1234');
    }
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Concierge Authentication</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Sign In</h1>
          <p className="text-xs text-slate-400">
            Log in to access your traveler itinerary or manage airline flight disruptions.
          </p>
        </div>

        <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-2xl space-y-6">
          {/* Judge Demo Quick Shortcuts */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Judge / Demo Autofill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('TRAVELER')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-blue-300 flex items-center justify-center gap-1.5 transition"
              >
                <User className="w-3 h-3 text-blue-400" />
                <span>Demo Traveler</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('COMPANY')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition"
              >
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>Demo Airline Ops</span>
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

          {/* Role-Agnostic Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-bold text-xs py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Signup Navigation Link */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign up here →
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
