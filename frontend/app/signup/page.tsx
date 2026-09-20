'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /signup - Dedicated Customer / Traveler Registration
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Phone,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';

export default function SignupPage() {
  const router = useRouter();

  // Exclusively Traveler registration
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup({
        role: 'TRAVELER',
        name: trimmedName,
        email: trimmedEmail,
        password,
        phone: phone.trim() || undefined,
      });

      if (!response.success || !response.data) {
        setError(response.error?.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Account created successfully! Directing to your traveler dashboard...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Network error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold shadow-inner">
            <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>Customer / Traveler Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Traveler Account
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Get autonomous multi-leg flight monitoring, instant disruption cascade alerts, and automated rebooking.
          </p>
        </div>

        {/* Signup Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-4">
          {/* Feedback Banners */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="traveler@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-[10px] text-slate-500 font-normal">(Optional for SMS alerts)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Traveler Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Back to Login */}
          <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
