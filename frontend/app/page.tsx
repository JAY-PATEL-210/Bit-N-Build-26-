'use client';

// Owner: Member A (Frontend Lead) & Member B (Systems & Demo)
// RoutePilot: Autonomous Travel-Disruption Concierge 3D Launch Experience
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

export default function LaunchPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d14, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 6.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
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
    leftWing.rotation.y = Math.PI; // Mirror
    leftWing.position.set(-0.15, -0.05, 0.5);
    planeGroup.add(leftWing);

    // Wingtips / Winglets
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

    // Right Engine
    const rightEngine = new THREE.Mesh(engineGeo, whiteBodyMat);
    rightEngine.rotation.x = Math.PI / 2;
    rightEngine.position.set(0.95, -0.26, 0.2);
    const rightCore = new THREE.Mesh(engineCoreGeo, darkMetalMat);
    rightEngine.add(rightCore);
    planeGroup.add(rightEngine);

    // Left Engine
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

    // Horizontal Stabilizers (Tail wings)
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
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Clock & Animation Loop
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
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

      // Drift particle clouds backward giving sensation of flight speed
      const posArr = particlesGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 2] += 0.04;
        if (posArr[i * 3 + 2] > 15) {
          posArr[i * 3 + 2] = -15;
        }
      }
      particlesGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      fuselageGeo.dispose();
      noseGeo.dispose();
      cockpitGeo.dispose();
      tailConeGeo.dispose();
      wingGeo.dispose();
      wingletGeo.dispose();
      engineGeo.dispose();
      engineCoreGeo.dispose();
      finGeo.dispose();
      stabGeo.dispose();
      particlesGeo.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full h-[calc(100vh-65px)] overflow-hidden select-none"
      style={{
        backgroundColor: '#070d1a',
        background: 'radial-gradient(circle at 50% 40%, #0f1c3f 0%, #070d1a 75%, #03060d 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Top: brand name + tagline */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 text-center w-[90%] max-w-[720px] pointer-events-none"
        style={{ top: 'clamp(24px, 5vh, 56px)' }}
      >
        <h1
          className="font-bold tracking-tight text-[#f8fafc] leading-none m-0"
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)',
            textShadow: '0 0 40px rgba(56, 189, 248, 0.25)',
          }}
        >
          ROUTEPILOT
        </h1>
        <p
          className="font-medium text-[#7dd3fc] mt-2.5 tracking-normal"
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: 'clamp(1.1rem, 2.6vw, 1.7rem)',
          }}
        >
          Autonomous Travel-Disruption Concierge
        </p>
      </div>

      {/* Full-page 3D Airplane Canvas Experience */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full bg-transparent z-10"
      />

      {/* Bottom: login button + action choices + descriptive copy */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[90%] max-w-[660px] text-center"
        style={{ bottom: 'clamp(24px, 5vh, 52px)' }}
      >
        {/* Login Button */}
        <Link
          href="/login"
          className="inline-block pointer-events-auto text-[#f8fafc] font-semibold text-base py-3 px-10 rounded-full shadow-lg transition-all duration-150 ease-out hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.35)',
          }}
        >
          Log in
        </Link>

        {/* Secondary Role Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 mb-4 pointer-events-auto">
          <Link
            href="/signup?role=TRAVELER"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 transition backdrop-blur-sm"
          >
            Sign up as Traveler
          </Link>
          <span className="text-slate-600 text-xs">•</span>
          <Link
            href="/signup?role=COMPANY"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-emerald-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 transition backdrop-blur-sm"
          >
            Sign up as Airline / Company
          </Link>
          <span className="text-slate-600 text-xs">•</span>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-blue-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-400/60 transition backdrop-blur-sm"
          >
            Live Demo
          </Link>
        </div>

        {/* Blurb Copy */}
        <p
          className="leading-relaxed text-[#cbd5e1] m-0 pointer-events-none"
          style={{
            fontSize: 'clamp(0.85rem, 1.4vw, 0.95rem)',
          }}
        >
          When flights get cancelled or delayed, the ripple effect collapses your entire trip.
          Our autonomous system detects disruptions, resolves downstream dependencies across
          flights and hotels, and executes policy-compliant rebooking in seconds.
        </p>
      </div>
    </div>
  );
}
