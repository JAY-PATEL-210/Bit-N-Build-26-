'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const AmbientIllusionCanvas: React.FC = () => {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Strictly preserve the clean landing and signup experience
  const isExcluded = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (isExcluded) return;

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

    // Dynamic celestial & radar points for the flight corridor illusion
    interface FlightParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      pulseSpeed: number;
      color: string;
    }

    const particles: FlightParticle[] = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 35), 35);

    // Strictly match the original slate & blue theme (no multi-colors)
    const colors = [
      'rgba(59, 130, 246, ',   // brand blue
      'rgba(56, 189, 248, ',   // sky
      'rgba(148, 163, 184, ',  // slate
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.4 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Dynamic Holographic Beams / Flight Path trajectories
    interface FlightBeam {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      progress: number;
      speed: number;
      color: string;
    }

    const beams: FlightBeam[] = [];
    const createBeam = () => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.6);
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180); // gentle tilt
      const length = Math.random() * 300 + 200;
      beams.push({
        x: startX,
        y: startY,
        targetX: startX + Math.cos(angle) * length,
        targetY: startY + Math.sin(angle) * length + 80,
        progress: 0,
        speed: Math.random() * 0.008 + 0.004,
        color: 'rgba(59, 130, 246, ', // unified brand blue
      });
    };

    for (let i = 0; i < 2; i++) {
      createBeam();
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle constellation connections (matching slate & blue)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulseAlpha = p.baseAlpha + Math.sin(time * 2 + i) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.08, pulseAlpha)})`;
        ctx.fill();
      }

      // 3. Render subtle flight path pulses matching theme
      for (let i = beams.length - 1; i >= 0; i--) {
        const b = beams[i];
        b.progress += b.speed;

        const currX = b.x + (b.targetX - b.x) * b.progress;
        const currY = b.y + (b.targetY - b.y) * b.progress;
        const tailProgress = Math.max(0, b.progress - 0.25);
        const tailX = b.x + (b.targetX - b.x) * tailProgress;
        const tailY = b.y + (b.targetY - b.y) * tailProgress;

        const beamGradient = ctx.createLinearGradient(tailX, tailY, currX, currY);
        const alpha = Math.sin(b.progress * Math.PI) * 0.25;
        beamGradient.addColorStop(0, `${b.color}0)`);
        beamGradient.addColorStop(1, `${b.color}${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = beamGradient;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (b.progress >= 1) {
          beams.splice(i, 1);
          if (beams.length < 2) {
            createBeam();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isExcluded]);

  if (isExcluded) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Subtle ambient depth matching the exact slate-950 and blue theme (no multi-colors) */}
      <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-600/5 blur-[120px] animate-subtle-float" />
      <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-slate-800/10 blur-[130px] animate-subtle-float" />

      {/* High-Performance 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />
    </div>
  );
};
