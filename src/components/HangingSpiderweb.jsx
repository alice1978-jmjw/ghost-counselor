import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/soundEffects';

export default function HangingSpiderweb({ onPullSnap }) {
  // Pull distance in pixels
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasSnappingSparkles, setHasSnappingSparkles] = useState(false);

  const pullRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const animFrameRef = useRef(null);
  const velocityRef = useRef(0);

  // Release spring physics animation
  const snapBack = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);

    soundEngine.playWebSnapSound();
    setHasSnappingSparkles(true);
    setTimeout(() => setHasSnappingSparkles(false), 900);

    if (pullRef.current > 60) {
      onPullSnap?.(Math.round(pullRef.current));
    }

    // Spring constants: high stiffness for tactile snap, damping for realistic elasticity
    const spring = 0.22;
    const damping = 0.78;
    velocityRef.current = -pullRef.current * 0.45; // initial sharp snap velocity

    const animateSpring = () => {
      if (isDraggingRef.current) return;

      const force = -spring * pullRef.current;
      velocityRef.current = (velocityRef.current + force) * damping;
      pullRef.current += velocityRef.current;

      setPullY(pullRef.current);

      if (Math.abs(pullRef.current) > 0.4 || Math.abs(velocityRef.current) > 0.4) {
        animFrameRef.current = requestAnimationFrame(animateSpring);
      } else {
        pullRef.current = 0;
        setPullY(0);
        velocityRef.current = 0;
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animateSpring);
  }, [onPullSnap]);

  // Global mouse & touch release handlers so drag never gets lost
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      if (typeof clientY !== 'number') return;

      const rawDelta = clientY - startYRef.current;
      // Tensile elastic resistance: stretches up to 160px with logarithmic stiffness
      const clampedPull = Math.max(0, Math.min(160, rawDelta * 0.9));
      pullRef.current = clampedPull;
      setPullY(clampedPull);
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        snapBack();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false });
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [snapBack]);

  const handleStartDrag = (e) => {
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (typeof clientY !== 'number') return;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    isDraggingRef.current = true;
    setIsDragging(true);
    startYRef.current = clientY - pullRef.current;
    soundEngine.playClickSound();
  };

  // Web geometry points calculated from pull tension
  const stretch = pullY;
  const webHubY = 32 + stretch * 0.45;
  const cordBottomY = 78 + stretch;

  return (
    <div
      className="pointer-events-auto absolute top-0 left-4 sm:left-8 z-30 select-none flex flex-col items-center"
      style={{ width: '120px' }}
    >
      {/* Interactive Stretchy Spiderweb SVG */}
      <svg
        viewBox="0 0 120 260"
        className="w-28 sm:w-32 overflow-visible"
        style={{
          filter: isDragging
            ? 'drop-shadow(0 0 12px rgba(74, 222, 128, 0.7))'
            : 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))',
          transition: isDragging ? 'none' : 'filter 0.3s ease'
        }}
      >
        <defs>
          {/* Silky Dewdrop Web Thread Gradient */}
          <linearGradient id="silkThread" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#e2e8f0" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#86efac" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
          </linearGradient>

          {/* Velvet Spider Abdomen Gradient */}
          <radialGradient id="spiderVelvet" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="50%" stopColor="#1e1035" />
            <stop offset="100%" stopColor="#090312" />
          </radialGradient>

          {/* Glowing Spider Gem Eye */}
          <radialGradient id="gemEye" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>
        </defs>

        {/* Top Ceiling Fasteners (Anchors) */}
        <line x1="10" y1="0" x2="110" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
        <circle cx="15" cy="1" r="2" fill="#86efac" />
        <circle cx="60" cy="1" r="2.5" fill="#fde047" />
        <circle cx="105" cy="1" r="2" fill="#86efac" />

        {/* Dynamic Stretched Radial Strands */}
        {/* Left Anchor to Hub */}
        <path
          d={`M 15 2 Q 35 ${webHubY * 0.4} 60 ${webHubY}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Mid-Left Anchor to Hub */}
        <path
          d={`M 38 2 Q 48 ${webHubY * 0.5} 60 ${webHubY}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.4"
        />
        {/* Center Anchor to Hub */}
        <line
          x1="60"
          y1="2"
          x2="60"
          y2={webHubY}
          stroke="url(#silkThread)"
          strokeWidth="2"
        />
        {/* Mid-Right Anchor to Hub */}
        <path
          d={`M 82 2 Q 72 ${webHubY * 0.5} 60 ${webHubY}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.4"
        />
        {/* Right Anchor to Hub */}
        <path
          d={`M 105 2 Q 85 ${webHubY * 0.4} 60 ${webHubY}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Dynamic Concentric Web Cross-Strands (Bows under tension!) */}
        {/* Ring 1 (Top) */}
        <path
          d={`M 25 ${6 + stretch * 0.08} Q 60 ${14 + stretch * 0.16} 95 ${6 + stretch * 0.08}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        {/* Ring 2 (Middle) */}
        <path
          d={`M 35 ${16 + stretch * 0.18} Q 60 ${26 + stretch * 0.3} 85 ${16 + stretch * 0.18}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.3"
          strokeOpacity="0.85"
        />
        {/* Ring 3 (Inner Web Arch) */}
        <path
          d={`M 45 ${24 + stretch * 0.3} Q 60 ${webHubY - 4} 75 ${24 + stretch * 0.3}`}
          fill="none"
          stroke="url(#silkThread)"
          strokeWidth="1.4"
        />

        {/* Silky Dewdrop Beads along strands */}
        <circle cx="35" cy={16 + stretch * 0.18} r="1.8" fill="#ffffff" opacity="0.9" />
        <circle cx="85" cy={16 + stretch * 0.18} r="1.8" fill="#ffffff" opacity="0.9" />
        <circle cx="60" cy={14 + stretch * 0.16} r="2.2" fill="#86efac" />
        <circle cx="60" cy={webHubY} r="3" fill="#ffffff" />

        {/* Dangling Silk Cord (Connecting Hub to Spider Handle) */}
        <line
          x1="60"
          y1={webHubY}
          x2="60"
          y2={cordBottomY}
          stroke="url(#silkThread)"
          strokeWidth={Math.max(1.2, 2.4 - stretch * 0.008)}
          strokeDasharray={isDragging ? 'none' : '3 1.5'}
        />

        {/* Dewdrops along cord */}
        <circle cx="60" cy={webHubY + (cordBottomY - webHubY) * 0.35} r="1.5" fill="#86efac" />
        <circle cx="60" cy={webHubY + (cordBottomY - webHubY) * 0.7} r="1.8" fill="#ffffff" />

        {/* ========================================================
            SPIDER PULL CHARM (The Handle User Grabs & Drags)
            ======================================================== */}
        <g
          transform={`translate(60, ${cordBottomY}) scale(${isDragging ? 1.15 : 1})`}
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
          style={{
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* Subtle green pulse aura around spider handle */}
          <circle
            cx="0"
            cy="12"
            r={isDragging ? 26 : 20}
            fill="rgba(74, 222, 128, 0.2)"
            className={isDragging ? 'animate-pulse' : ''}
          />

          {/* Spider Legs (8 arched velvety legs) */}
          {/* Top Left Leg */}
          <path d="M -4 8 Q -16 2 -20 10 Q -24 18 -22 22" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mid-Top Left Leg */}
          <path d="M -5 11 Q -20 9 -22 18 Q -24 24 -20 28" fill="none" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mid-Bottom Left Leg */}
          <path d="M -5 15 Q -18 18 -18 26 Q -18 32 -14 36" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
          {/* Bottom Left Leg */}
          <path d="M -3 18 Q -14 26 -12 34 Q -10 38 -6 40" fill="none" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />

          {/* Top Right Leg */}
          <path d="M 4 8 Q 16 2 20 10 Q 24 18 22 22" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mid-Top Right Leg */}
          <path d="M 5 11 Q 20 9 22 18 Q 24 24 20 28" fill="none" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
          {/* Mid-Bottom Right Leg */}
          <path d="M 5 15 Q 18 18 18 26 Q 18 32 14 36" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
          {/* Bottom Right Leg */}
          <path d="M 3 18 Q 14 26 12 34 Q 10 38 6 40" fill="none" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />

          {/* Spider Cephalothorax (Head) */}
          <ellipse cx="0" cy="7" rx="5.5" ry="5" fill="url(#spiderVelvet)" stroke="#86efac" strokeWidth="1.2" />

          {/* Glowing Green Gem Eyes */}
          <circle cx="-2.2" cy="5.5" r="1.5" fill="url(#gemEye)" />
          <circle cx="2.2" cy="5.5" r="1.5" fill="url(#gemEye)" />
          <circle cx="-1" cy="7.8" r="0.8" fill="#ffffff" />
          <circle cx="1" cy="7.8" r="0.8" fill="#ffffff" />

          {/* Spider Abdomen (Plush Velvet Body with Emerald Gem) */}
          <ellipse cx="0" cy="18" rx="8" ry="11" fill="url(#spiderVelvet)" stroke="#22c55e" strokeWidth="1.5" />

          {/* Velvet Abdomen Specular Highlight */}
          <ellipse cx="-2.5" cy="14" rx="3.5" ry="5.5" fill="rgba(255,255,255,0.25)" />

          {/* Emerald Mystic Hourglass Marking on Abdomen */}
          <path
            d="M -3 14 L 3 14 L -2 22 L 2 22 Z"
            fill="#86efac"
            filter="drop-shadow(0 0 4px #22c55e)"
          />
        </g>

        {/* Snap-Back Sparkle Bursts */}
        {hasSnappingSparkles && (
          <g transform={`translate(60, ${cordBottomY})`}>
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const dist = 18 + (i % 3) * 6;
              return (
                <circle
                  key={i}
                  cx={Math.cos(angle) * dist}
                  cy={Math.sin(angle) * dist}
                  r={i % 2 === 0 ? 2.5 : 1.5}
                  fill={i % 2 === 0 ? '#86efac' : '#fde047'}
                  className="animate-ping"
                  style={{ animationDuration: '0.6s' }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Interactive Helper Pill: "PULL ME 🕷️" */}
      <div
        className={`-mt-4 cursor-grab rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest backdrop-blur-md transition-all ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.6)]'
            : 'border-purple-400/40 bg-purple-950/70 text-purple-200 hover:border-emerald-400/60 hover:text-emerald-200 shadow-md animate-bounce'
        }`}
        style={{ animationDuration: '2.5s' }}
        onMouseDown={handleStartDrag}
        onTouchStart={handleStartDrag}
      >
        {isDragging ? 'RELEASE TO SNAP! ⚡' : 'PULL WEB 🕷️'}
      </div>
    </div>
  );
}
