'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /login - 3D Interactive Travel-Disruption Concierge Portal (PS-8)
import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  RefreshCw,
  Compass,
  Layers,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/index';

export default function LoginPage() {
  const router = useRouter();

  // Selected Role: 'TRAVELER' (Customer) vs 'COMPANY' (Airline Partner)
  const [role, setRole] = useState<UserRole>('TRAVELER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 3D Card Physics State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  // 3D Canvas Background Reference
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle 3D Mouse Parallax Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -11;
    const rY = ((x - centerX) / centerX) * 11;

    setRotateX(rX);
    setRotateY(rY);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.28 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  // 3D Flight Disruption Cascade Radar Canvas (Problem Statement PS-8)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Problem Statement Nodes: BOM -> DEL -> LHR + Hotel Landmark London
    const getNodes = () => [
      {
        id: 'BOM',
        city: 'Mumbai',
        type: 'flight-origin',
        x: width * 0.18,
        y: height * 0.42,
        status: 'DEPARTED',
        color: '#38bdf8',
      },
      {
        id: 'DEL',
        city: 'Delhi Hub',
        type: 'flight-disrupted',
        x: width * 0.38,
        y: height * 0.28,
        status: 'DELAYED / CASCADE',
        color: '#f59e0b',
      },
      {
        id: 'LHR',
        city: 'London Heathrow',
        type: 'flight-destination',
        x: width * 0.72,
        y: height * 0.34,
        status: 'REBOOKED',
        color: '#10b981',
      },
      {
        id: 'HOTEL',
        city: 'The Landmark London',
        type: 'hotel-downstream',
        x: width * 0.84,
        y: height * 0.58,
        status: 'SYNCED',
        color: '#818cf8',
      },
    ];

    let nodes = getNodes();

    // 3D Space Particle Field
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.25 + 0.08,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Perspective 3D Flight Grid on Floor
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.09)';
      ctx.lineWidth = 1;
      const gridSize = 52;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Ambient Stars
      stars.forEach((s) => {
        s.y -= s.speedY;
        if (s.y < 0) s.y = height;
        ctx.fillStyle = `rgba(147, 197, 253, ${s.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Recalculate node positions in case of window size change
      nodes = getNodes();
      const [bom, del, lhr, hotel] = nodes;

      // 3. Problem Statement Leg 1: BOM -> DEL (Original Flight)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(bom.x, bom.y);
      ctx.lineTo(del.x, del.y);
      ctx.stroke();

      // 4. Problem Statement Leg 2: DEL -> LHR (Disrupted Connection)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.moveTo(del.x, del.y);
      ctx.lineTo(lhr.x, lhr.y);
      ctx.stroke();

      // 5. Downstream Dependency Leg: LHR -> Hotel
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 4]);
      ctx.moveTo(lhr.x, lhr.y);
      ctx.lineTo(hotel.x, hotel.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6. Autonomous Rebooking AI Route (Direct Corridor BOM -> LHR)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 2.5;
      const midX = (bom.x + lhr.x) / 2;
      const midY = (bom.y + lhr.y) / 2 - 80;
      ctx.quadraticCurveTo(midX, midY, lhr.x, lhr.y);
      ctx.stroke();

      // Animated autonomous rebooking telemetry packet
      const t = (pulse * 0.008) % 1;
      const px = (1 - t) * (1 - t) * bom.x + 2 * (1 - t) * t * midX + t * t * lhr.x;
      const py = (1 - t) * (1 - t) * bom.y + 2 * (1 - t) * t * midY + t * t * lhr.y;
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#059669';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 7. Draw Problem Statement Nodes & Radar Pulses
      nodes.forEach((node) => {
        // Core node dot
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar ripple
        const rippleR = 12 + (Math.sin(pulse * 0.05) + 1) * 6;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, rippleR, 0, Math.PI * 2);
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(node.id, node.x + 12, node.y - 2);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = '9px sans-serif';
        ctx.fillText(`${node.city} • ${node.status}`, node.x + 12, node.y + 11);
      });

      pulse += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError(
        role === 'COMPANY'
          ? 'Please enter your Airline ID or official email.'
          : 'Please enter your email address.'
      );
      return;
    }
    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: trimmedEmail,
        password: trimmedPassword,
        role,
      });

      if (!response.success || !response.data) {
        setError(
          response.error?.message ||
            'Access Denied: Invalid credentials. Please verify your details.'
        );
        setLoading(false);
        return;
      }

      const activeUser = response.data.user;
      setSuccess(`Authentication Verified as ${activeUser.role}! Redirecting...`);

      setTimeout(() => {
        if (activeUser.role === 'COMPANY') {
          router.push('/company/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Network error during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-slate-100">
      {/* 3D Animated Travel-Disruption Radar Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* 3D Perspective Wrapper */}
      <div
        className="relative z-10 w-full max-w-md perspective-container py-6"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Floating 3D Disruption Radar Hologram (Top-Left) */}
        <div className="hidden lg:flex absolute -top-3 -left-12 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl backdrop-blur-md animate-float-slow pointer-events-none">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-mono font-bold text-amber-300">
              Cascade Event Detected
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              BOM ➔ DEL (AI-101 Delay)
            </div>
          </div>
        </div>

        {/* Floating 3D Downstream Sync Hologram (Bottom-Right) */}
        <div className="hidden lg:flex absolute -bottom-3 -right-12 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl backdrop-blur-md animate-float-reverse pointer-events-none">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <div className="text-[10px] font-mono font-bold text-emerald-300">
              Autonomous Sync
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Flight + Hotel Landmark
            </div>
          </div>
        </div>

        {/* The 3D Interactive Card */}
        <div
          ref={cardRef}
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: rotateX === 0 && rotateY === 0 ? 'transform 0.5s ease-out' : 'none',
          }}
          className="relative preserve-3d rounded-3xl bg-slate-900/90 border border-slate-700/60 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-4"
        >
          {/* Specular Dynamic Glare Overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}), transparent 60%)`,
            }}
          />

          {/* Card Header & Problem Statement Branding */}
          <div className="text-center space-y-1.5 preserve-3d">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-semibold shadow-inner translate-z-20">
              <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span>PS-8 Platform</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white translate-z-30 leading-tight">
              Autonomous Travel-Disruption{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                Concierge
              </span>
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto translate-z-20">
              Agentic disruption detection, cascade reasoning, and automated policy rebooking.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-1.5 translate-z-30">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRole('TRAVELER');
                  setError(null);
                }}
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
                onClick={() => {
                  setRole('COMPANY');
                  setError(null);
                }}
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
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 translate-z-20">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {role === 'TRAVELER' ? 'Email Address' : 'Airline ID / Email'}
              </label>
              <input
                type={role === 'TRAVELER' ? 'email' : 'text'}
                required
                placeholder={role === 'TRAVELER' ? 'traveler@example.com' : 'airline@travelsync.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
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

            {/* Action Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all translate-z-30 ${
                role === 'COMPANY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Concierge</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer - Only Register Link for Travelers, removed completely for Airline Partner */}
          {role === 'TRAVELER' && (
            <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400 translate-z-20">
              <span>Don&apos;t have an account yet? </span>
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition"
              >
                Sign up here →
              </Link>
            </div>
          )}
        </div>

        {/* Problem Statement Banner Under Login Page */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl text-center">
          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-normal italic">
            “When flights get cancelled or delayed, the ripple effect collapses your entire trip. Our autonomous system detects disruptions, resolves downstream dependencies across flights and hotels, and executes policy-compliant rebooking in seconds.”
          </p>
        </div>
      </div>
    </div>
  );
}
