'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// Route: /login - 3D RoutePilot Airplane Hero + 3D Concierge Login Portal
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as THREE from 'three';
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
  AlertTriangle,
  RefreshCw,
  Compass,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/index';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State: whether the 3D Login Card modal is open or showing the 3D Airplane Landing view
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Selected Role: 'TRAVELER' (Customer) vs 'COMPANY' (Airline Partner)
  const [role, setRole] = useState<UserRole>('TRAVELER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 3D Card Physics State & Refs (Optimized with RAF for zero re-renders)
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);

  // 3D Three.js Container Reference
  const threeContainerRef = useRef<HTMLDivElement>(null);

  // Check URL query param to open modal if specified
  useEffect(() => {
    if (searchParams.get('open') === 'true') {
      setShowLoginModal(true);
    }
  }, [searchParams]);

  // Handle 3D Mouse Parallax Tilt for Login Card - Hardware-accelerated with RAF
  const handleMouseMoveCard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -11;
    const rY = ((x - centerX) / centerX) * 11;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    tiltRafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg)`;
      }
      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.25), transparent 60%)`;
      }
    });
  };

  const handleMouseLeaveCard = () => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.4s ease-out';
      cardRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = '';
      }, 400);
    }
    if (glareRef.current) {
      glareRef.current.style.background = 'transparent';
    }
  };

  // Full-page 3D Three.js Airplane Experience
  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 6.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xddeeff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    const sunGlow = new THREE.PointLight(0x60a5fa, 2.0, 20);
    sunGlow.position.set(0, 0, 2);
    scene.add(sunGlow);

    // Materials
    const whiteBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.15,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan/blue accent
      roughness: 0.3,
      metalness: 0.2,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      transmission: 0.6,
      thickness: 0.5,
      transparent: true,
      opacity: 0.85,
    });

    // Group for the plane
    const planeGroup = new THREE.Group();

    // 1. Fuselage
    const fuselageGeo = new THREE.CylinderGeometry(0.32, 0.28, 3.8, 32);
    const fuselage = new THREE.Mesh(fuselageGeo, whiteBodyMat);
    fuselage.rotation.x = Math.PI / 2;
    planeGroup.add(fuselage);

    // Nose cone
    const noseGeo = new THREE.ConeGeometry(0.32, 0.9, 32);
    const nose = new THREE.Mesh(noseGeo, whiteBodyMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = 2.35;
    planeGroup.add(nose);

    // Cockpit windshield
    const cockpitGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const cockpit = new THREE.Mesh(cockpitGeo, glassMat);
    cockpit.position.set(0, 0.16, 1.4);
    cockpit.scale.set(0.9, 0.6, 1.6);
    planeGroup.add(cockpit);

    // Tail taper
    const tailConeGeo = new THREE.ConeGeometry(0.28, 1.2, 32);
    const tailCone = new THREE.Mesh(tailConeGeo, whiteBodyMat);
    tailCone.rotation.x = Math.PI / 2;
    tailCone.position.z = -2.5;
    planeGroup.add(tailCone);

    // 2. Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(2.7, -0.9);
    wingShape.lineTo(2.5, -1.35);
    wingShape.lineTo(0, -0.5);
    wingShape.closePath();

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

    const rightWing = new THREE.Mesh(wingGeo, whiteBodyMat);
    rightWing.rotation.x = Math.PI / 2;
    rightWing.position.set(0.15, -0.05, 0.5);
    planeGroup.add(rightWing);

    const leftWing = new THREE.Mesh(wingGeo, whiteBodyMat);
    leftWing.rotation.x = Math.PI / 2;
    leftWing.rotation.y = Math.PI;
    leftWing.position.set(-0.15, -0.05, 0.5);
    planeGroup.add(leftWing);

    // Winglets
    const wingletGeo = new THREE.BoxGeometry(0.04, 0.35, 0.35);
    const rightWinglet = new THREE.Mesh(wingletGeo, accentMat);
    rightWinglet.position.set(2.68, 0.12, -0.55);
    rightWinglet.rotation.z = -0.2;
    planeGroup.add(rightWinglet);

    const leftWinglet = new THREE.Mesh(wingletGeo, accentMat);
    leftWinglet.position.set(-2.68, 0.12, -0.55);
    leftWinglet.rotation.z = 0.2;
    planeGroup.add(leftWinglet);

    // 3. Jet Engines
    const engineGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.85, 24);
    const engineCoreGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.87, 16);

    const rightEngine = new THREE.Mesh(engineGeo, whiteBodyMat);
    rightEngine.rotation.x = Math.PI / 2;
    rightEngine.position.set(0.95, -0.26, 0.2);
    const rightCore = new THREE.Mesh(engineCoreGeo, darkMetalMat);
    rightEngine.add(rightCore);
    planeGroup.add(rightEngine);

    const leftEngine = new THREE.Mesh(engineGeo, whiteBodyMat);
    leftEngine.rotation.x = Math.PI / 2;
    leftEngine.position.set(-0.95, -0.26, 0.2);
    const leftCore = new THREE.Mesh(engineCoreGeo, darkMetalMat);
    leftEngine.add(leftCore);
    planeGroup.add(leftEngine);

    // 4. Tail Fin (Vertical Stabilizer)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.95, 0);
    finShape.lineTo(0.3, 1.15);
    finShape.lineTo(0, 1.15);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
    const tailFin = new THREE.Mesh(finGeo, accentMat);
    tailFin.rotation.y = -Math.PI / 2;
    tailFin.position.set(0.02, 0.2, -2.1);
    planeGroup.add(tailFin);

    // Horizontal Stabilizers
    const stabShape = new THREE.Shape();
    stabShape.moveTo(0, 0);
    stabShape.lineTo(0.95, -0.35);
    stabShape.lineTo(0.85, -0.55);
    stabShape.lineTo(0, -0.2);
    stabShape.closePath();

    const stabGeo = new THREE.ExtrudeGeometry(stabShape, extrudeSettings);
    const rightStab = new THREE.Mesh(stabGeo, whiteBodyMat);
    rightStab.rotation.x = Math.PI / 2;
    rightStab.position.set(0.08, 0.12, -2.2);
    planeGroup.add(rightStab);

    const leftStab = new THREE.Mesh(stabGeo, whiteBodyMat);
    leftStab.rotation.x = Math.PI / 2;
    leftStab.rotation.y = Math.PI;
    leftStab.position.set(-0.08, 0.12, -2.2);
    planeGroup.add(leftStab);

    // Initial plane pose
    planeGroup.rotation.y = THREE.MathUtils.degToRad(-35);
    planeGroup.rotation.x = THREE.MathUtils.degToRad(12);
    planeGroup.rotation.z = THREE.MathUtils.degToRad(-8);
    planeGroup.position.set(0, 0.9, 0);
    scene.add(planeGroup);

    // Ambient Floating Clouds / Particles
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.35,
    });
    const particles = new THREE.Points(particlesGeo, particleMat);
    scene.add(particles);

    // Interactive mouse rotation / floating
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Clock & Animation Loop
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Gentle banking and floating motion
      const hoverY = Math.sin(elapsedTime * 1.5) * 0.12;
      const hoverRoll = Math.sin(elapsedTime * 1.2) * 0.05;
      const hoverPitch = Math.cos(elapsedTime * 1.0) * 0.03;

      planeGroup.position.y = 0.9 + hoverY + targetY * 0.4;
      planeGroup.position.x = targetX * 0.4;

      // Rotation reaction to mouse + natural flight roll
      planeGroup.rotation.y = THREE.MathUtils.degToRad(-35) + targetX * 0.45;
      planeGroup.rotation.x = THREE.MathUtils.degToRad(12) - targetY * 0.3 + hoverPitch;
      planeGroup.rotation.z = THREE.MathUtils.degToRad(-8) - targetX * 0.35 + hoverRoll;

      // Zero-CPU GPU-only particle translation
      particles.position.z += 0.04;
      if (particles.position.z > 20) {
        particles.position.z = -10;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      fuselageGeo.dispose();
      wingGeo.dispose();
      finGeo.dispose();
      stabGeo.dispose();
      particlesGeo.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  // Form Submission for 3D Login Card
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
    <div
      className="h-full w-full relative select-none overflow-hidden"
      style={{
        backgroundColor: '#070d1a',
        background: 'radial-gradient(circle at 50% 40%, #0f1c3f 0%, #070d1a 75%, #03060d 100%)',
        minHeight: '100vh',
      }}
    >
      <main className="w-full h-screen relative flex items-center justify-center overflow-hidden">
        {/* Full-page Interactive 3D Airplane Canvas */}
        <div
          ref={threeContainerRef}
          className="absolute inset-0 w-full h-full bg-transparent z-10 pointer-events-auto"
          style={{ display: 'block' }}
        />

        {/* View 1: 3D Airplane Hero Screen (Top, Bottom & Login Button) */}
        {!showLoginModal && (
          <>
            {/* Top: brand name + tagline */}
            <div className="absolute top-[clamp(24px,5vh,56px)] left-1/2 -translate-x-1/2 z-20 text-center w-[90%] max-w-[720px] pointer-events-none">
              <h1
                className="font-['Space_Grotesk',sans-serif] text-[clamp(2.4rem,6.5vw,4.5rem)] font-bold text-slate-100 leading-none m-0"
                style={{ textShadow: '0 0 40px rgba(56, 189, 248, 0.25)' }}
              >
                ROUTEPILOT
              </h1>
              <p className="font-['Space_Grotesk',sans-serif] text-[clamp(1.1rem,2.6vw,1.7rem)] font-medium text-sky-300 mt-2">
                Autonomous Travel-Disruption Concierge
              </p>
            </div>

            {/* Bottom: login button + descriptive copy */}
            <div className="absolute bottom-[clamp(28px,6vh,64px)] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[90%] max-w-[620px] text-center">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="pointer-events-auto font-['Space_Grotesk',sans-serif] font-semibold text-base text-slate-100 py-3 px-10 rounded-full cursor-pointer transition-all duration-150 shadow-[0_8px_24px_rgba(14,165,233,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(14,165,233,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 mb-5 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  border: 'none',
                }}
              >
                Log in
              </button>
              <p className="text-[clamp(0.85rem,1.5vw,1rem)] leading-relaxed text-slate-300 m-0 pointer-events-none">
                When flights get cancelled or delayed, the ripple effect collapses your entire trip.
                Our autonomous system detects disruptions, resolves downstream dependencies across
                flights and hotels, and executes policy-compliant rebooking in seconds.
              </p>
            </div>
          </>
        )}

        {/* View 2: The 3D Concierge Login Portal Card (from user photo) */}
        {showLoginModal && (
          <div className="relative z-30 w-full min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
            {/* 3D Perspective Wrapper */}
            <div
              className="relative w-full max-w-md perspective-container py-4"
              onMouseMove={handleMouseMoveCard}
              onMouseLeave={handleMouseLeaveCard}
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

              {/* The 3D Interactive Card (Exact Card from User Photo) */}
              <div
                ref={cardRef}
                style={{
                  transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
                  willChange: 'transform',
                }}
                className="relative preserve-3d rounded-3xl bg-slate-900/90 border border-slate-700/60 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-4"
              >
                {/* Specular Dynamic Glare Overlay */}
                <div
                  ref={glareRef}
                  className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-100"
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
                    SELECT ACCOUNT TYPE
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
                  “When flights get cancelled or delayed, the ripple effect collapses your entire trip.
                  Our autonomous system detects disruptions, resolves downstream dependencies across
                  flights and hotels, and executes policy-compliant rebooking in seconds.”
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span>Loading RoutePilot...</span>
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
