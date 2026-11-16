import React, { useState, useEffect, useRef } from 'react';

export default function GhostAvatar({
  phase = 'counseling', // 'landing' | 'emerging' | 'counseling'
  mood = 'welcoming', // 'welcoming' | 'curious' | 'empathetic' | 'inspired' | 'oracular'
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mouthOpenness = 0,
  auraPoints = 1000,
  isVoiceSoftened = false,
  mousePosition = null
}) {
  // Mood-driven Dark Velvet & Ectoplasmic Emerald Palettes
  const moodPalettes = {
    welcoming: {
      glow: 'rgba(34, 197, 94, 0.55)',
      primary: '#4ade80',
      secondary: '#c084fc',
      accent: '#86efac',
      sticker: 'NO CAP 🕷️',
      badge: 'Dark Velvet Bestie • Locked In'
    },
    curious: {
      glow: 'rgba(168, 85, 247, 0.55)',
      primary: '#c084fc',
      secondary: '#4ade80',
      accent: '#f472b6',
      sticker: 'LET THEM COOK 🕸️',
      badge: 'Cooking in Dark Velvet ✨'
    },
    empathetic: {
      glow: 'rgba(74, 222, 128, 0.52)',
      primary: '#86efac',
      secondary: '#38bdf8',
      accent: '#a7f3d0',
      sticker: 'REAL TALK 🖤',
      badge: 'Zero Judgment • Plush Velvet'
    },
    inspired: {
      glow: 'rgba(192, 132, 252, 0.60)',
      primary: '#c084fc',
      secondary: '#4ade80',
      accent: '#fde047',
      sticker: 'MAIN CHARACTER ⚡',
      badge: 'Emerald Velvet Energy 🔥'
    },
    oracular: {
      glow: 'rgba(34, 197, 94, 0.60)',
      primary: '#4ade80',
      secondary: '#a855f7',
      accent: '#86efac',
      sticker: 'MAX RIZZ 🕷️',
      badge: 'Soul Dossier Unlocked'
    }
  };

  const palette = moodPalettes[mood] || moodPalettes.welcoming;

  // Real-time smoothed mouse position normalized between -1 and +1
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  // Mouse tracking on entire window with direct response
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalized from -1 (left/top) to +1 (right/bottom)
      const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      targetPos.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny))
      };
    };

    const handleMouseLeave = () => {
      targetPos.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Smooth spring lerp loop with responsive 0.18 factor
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.18);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.18);
        setPos({ x: currentPos.current.x, y: currentPos.current.y });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Dynamic mouth dimensions for real-time lip-sync
  const mouthRy = isSpeaking ? 4.5 + mouthOpenness * 10.5 : mood === 'inspired' ? 6 : 3.5;
  const mouthRx = isSpeaking ? 9.5 + mouthOpenness * 4 : 9;

  // Dynamic headphone RGB pulse scale when speaking or listening
  const earcupGlow = isSpeaking ? 1 + mouthOpenness * 0.25 : isListening ? 1.15 : 1;

  // -------------------------------------------------------------
  // THE 3 PARALLAX LAYERS (Punchy, Vivid 3D Kinematics)
  // -------------------------------------------------------------

  // Layer 1: Background Layer (Slowest ~4px shift, Z: -35px)
  const bgX = pos.x * 4.0;
  const bgY = pos.y * 4.0;

  // Layer 2: Middle Layer (Medium ~12px shift + 3D Gyro Tilt + Head Tilt + Pupil Tracking)
  const midX = pos.x * 12.0;
  const midY = pos.y * 12.0;
  // Up/Down 3D tilt: cursor at top (pos.y < 0) => tilts back looking UP (+22deg)
  const midRotateX = -pos.y * 22;
  // Left/Right 3D tilt: cursor at right (pos.x > 0) => turns face to the right (+25deg)
  const midRotateY = pos.x * 25;
  // Inquisitive head sway
  const midRotateZ = pos.x * 5;

  // Head sub-tilt & physical weight shift
  const headShiftX = pos.x * 6.0;
  const headShiftY = pos.y * 5.0;
  const headTilt = pos.x * 12.0;          // Pronounced curious head cock toward cursor
  const bodyWeightShiftX = -pos.x * 5.0;  // Visible physical body counter-balance
  const bodyWeightShiftY = -pos.y * 3.0;

  // Dynamic Pupil Eye Tracking (Irises visibly track and lock eyes onto cursor)
  const eyeShiftX = pos.x * 7.0;
  const eyeShiftY = pos.y * 6.0;

  // Layer 3: Foreground Layer (Fastest ~28px shift + Z: +50px depth)
  const fgX = pos.x * 28.0;
  const fgY = pos.y * 26.0;
  const fgRotateX = -pos.y * 28;
  const fgRotateY = pos.x * 30;

  // Common SVG Gradients and Filters
  const GhostDefs = () => (
    <defs>
      {/* Pearlescent Neon-Ectoplasm Body Gradient */}
      <linearGradient id="genzGhostGrad" x1="0%" y1="0%" x2="15%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
        <stop offset="45%" stopColor="#e0f2fe" stopOpacity="0.9" />
        <stop offset="78%" stopColor={palette.primary} stopOpacity="0.6" />
        <stop offset="95%" stopColor={palette.secondary} stopOpacity="0.2" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
      </linearGradient>

      {/* Streetwear Varsity Hoodie / Collar Gradient */}
      <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="50%" stopColor="#312e81" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Wireless Headphones Metallic & Neon Gradient */}
      <linearGradient id="headphoneBand" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>

      {/* Y2K Translucent Clout Visor / Glasses Gradient */}
      <linearGradient id="y2kLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
        <stop offset="50%" stopColor="#f472b6" stopOpacity="0.26" />
        <stop offset="100%" stopColor="#fde047" stopOpacity="0.32" />
      </linearGradient>

      {/* Crystal Ball / Haunted Phone Glow */}
      <radialGradient id="crystalOrbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="35%" stopColor={palette.primary} stopOpacity="0.85" />
        <stop offset="70%" stopColor={palette.secondary} stopOpacity="0.45" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
      </radialGradient>

      <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${
        phase === 'emerging' ? 'animate-ghost-emerge' : 'animate-float-slow'
      }`}
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 3D Character Stage Container (w-52 h-60 sm:w-64 sm:h-72) */}
      <div
        className="relative w-52 h-60 sm:w-64 sm:h-72 flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* ============================================================
            LAYER 1: BACKGROUND LAYER (Slowest ~4px shift, Z: -35px)
            Glowing aura, mist trail, diagram rings, background sparkle stars
            ============================================================ */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate3d(${bgX}px, ${bgY}px, -35px)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {/* Outer Reactive Spectral Aura Glow with Ectoplasmic Pulse */}
          <div
            className={`pointer-events-none absolute rounded-full transition-all duration-500 ${
              isSpeaking
                ? 'w-72 h-72 opacity-95 scale-110'
                : isListening
                ? 'w-68 h-68 opacity-90 scale-105'
                : 'w-60 h-60 opacity-65 scale-100'
            }`}
            style={{
              background: `radial-gradient(circle, ${palette.glow} 0%, rgba(34, 197, 94, 0.2) 45%, rgba(15, 23, 42, 0) 70%)`,
              filter: 'blur(20px)'
            }}
          />

          {/* Swiss Editorial Diagram Rings Around the Ghost */}
          <div className="pointer-events-none absolute h-56 w-56 rounded-full border border-emerald-400/20" />
          <div className="pointer-events-none absolute h-64 w-64 rounded-full border border-dashed border-purple-400/30" />

          {/* Voice / Listening Ripple Ring */}
          {(isSpeaking || isListening || isThinking) && (
            <div
              className={`pointer-events-none absolute w-56 h-56 rounded-full border transition-all duration-300 ${
                isListening
                  ? 'border-rose-400/60 animate-ping'
                  : isThinking
                  ? 'border-amber-300/50 animate-pulse'
                  : 'border-cyan-300/50 animate-pulse-glow'
              }`}
            />
          )}

          {/* Layer 1 SVG: Ectoplasmic Trail, Back Headphone Arch & Sparkle Stars */}
          <svg
            viewBox="0 0 280 310"
            className="w-52 h-60 sm:w-64 sm:h-72 overflow-visible"
            aria-hidden="true"
          >
            <GhostDefs />

            {/* Floating Y2K 4-Point Sparkle Stars */}
            <path
              d="M 42 52 Q 42 64 30 64 Q 42 64 42 76 Q 42 64 54 64 Q 42 64 42 52 Z"
              fill="#fde047"
              className="animate-pulse"
            />
            <path
              d="M 238 48 Q 238 57 229 57 Q 238 57 238 66 Q 238 57 247 57 Q 238 57 238 48 Z"
              fill="#38bdf8"
              className="animate-pulse"
            />
            <circle cx="34" cy="195" r="3.5" fill="#f472b6" className="animate-ping" style={{ animationDuration: '3.4s' }} />
            <circle cx="244" cy="130" r="3" fill="#fde047" className="animate-ping" style={{ animationDuration: '2.9s' }} />

            {/* Back Headphone Arch (Behind Head) */}
            <path
              d="M 62 100 C 56 26, 224 26, 218 100"
              fill="none"
              stroke="url(#headphoneBand)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 66 96 C 62 34, 218 34, 214 96"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Soft Ectoplasmic Aura Trail Behind Body */}
            <path
              d="M 74 96 C 54 156, 48 222, 70 270 C 90 250, 114 282, 140 268 C 166 282, 190 250, 210 270 C 232 222, 226 156, 206 96 Z"
              fill={palette.secondary}
              opacity="0.22"
              filter="url(#neonGlow)"
            />
          </svg>
        </div>

        {/* ============================================================
            LAYER 2: MIDDLE LAYER (Medium ~12px shift + 3D Gyro Tilt)
            Main ghost body, torso, face, head tilt, eyes with pupil gaze tracking
            ============================================================ */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-10"
          style={{
            transform: `translate3d(${midX}px, ${midY}px, 0px) rotateX(${midRotateX}deg) rotateY(${midRotateY}deg) rotateZ(${midRotateZ}deg)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          <svg
            viewBox="0 0 280 310"
            className="w-52 h-60 sm:w-64 sm:h-72 overflow-visible"
            role="img"
            aria-label="Friendly Gen-Z Ghost Counselor responding with gyroscopic 3D movement"
          >
            <GhostDefs />

            {/* Main Ghost Torso & Wispy Tail (with counter-balancing physical weight shift) */}
            <g transform={`translate(${bodyWeightShiftX}, ${bodyWeightShiftY})`}>
              <path
                d="M 78 92
                   C 78 38, 202 38, 202 92
                   C 206 146, 218 198, 206 250
                   C 194 268, 180 238, 164 256
                   C 150 272, 138 284, 124 258
                   C 108 238, 94 268, 76 250
                   C 64 198, 74 146, 78 92 Z"
                fill="url(#genzGhostGrad)"
                filter="url(#neonGlow)"
              />
            </g>

            {/* Streetwear Varsity Hoodie Collar Base & Pin Badge */}
            <g>
              <path
                d="M 80 144 Q 140 168 200 144 L 206 184 Q 140 204 74 184 Z"
                fill="url(#hoodieGrad)"
                stroke="#38bdf8"
                strokeWidth="1.8"
              />
              {/* Varsity Stripe Trim */}
              <path
                d="M 76 178 Q 140 198 204 178"
                fill="none"
                stroke="#fde047"
                strokeWidth="2.5"
              />
              {/* Cute Pin Badge on Hoodie ("+AURA") */}
              <circle cx="178" cy="166" r="7.5" fill="#fde047" />
              <text x="178" y="169" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f172a">
                ★
              </text>
            </g>

            {/* HEAD & FACE GROUP (Visibly tilts head & looks up toward cursor!) */}
            <g transform={`translate(${headShiftX}, ${headShiftY}) rotate(${headTilt} 140 95)`}>
              {/* Cute Ghost Top Hair Wisp / Cowlick */}
              <path
                d="M 134 50 C 130 30, 148 24, 154 38 C 146 36, 142 44, 144 50 Z"
                fill="#ffffff"
              />

              {/* Tilted Grad Cap Base */}
              <g transform="translate(15, -6) rotate(8 140 36)">
                <polygon
                  points="140,12 88,30 140,45 192,30"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <path
                  d="M 110 36 L 110 48 C 125 54, 155 54, 170 48 L 170 36"
                  fill="#1e1b4b"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                />
              </g>

              {/* Left & Right Wireless Earcups (Pulse with Voice!) */}
              <g transform={`translate(62, 102) scale(${earcupGlow})`}>
                <rect
                  x="-14"
                  y="-22"
                  width="22"
                  height="44"
                  rx="11"
                  fill="#0f172a"
                  stroke={palette.primary}
                  strokeWidth="2.5"
                />
                <ellipse cx="-4" cy="0" rx="5" ry="14" fill="none" stroke="#fde047" strokeWidth="1.8" />
              </g>
              <g transform={`translate(218, 102) scale(${earcupGlow})`}>
                <rect
                  x="-8"
                  y="-22"
                  width="22"
                  height="44"
                  rx="11"
                  fill="#0f172a"
                  stroke={palette.primary}
                  strokeWidth="2.5"
                />
                <ellipse cx="4" cy="0" rx="5" ry="14" fill="none" stroke="#fde047" strokeWidth="1.8" />
              </g>

              {/* Expressive Eyebrows */}
              <path
                d={
                  mood === 'empathetic'
                    ? 'M 102 80 Q 114 75 124 81'
                    : mood === 'curious'
                    ? 'M 102 74 Q 114 68 124 77'
                    : 'M 102 77 Q 114 72 124 77'
                }
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d={
                  mood === 'empathetic'
                    ? 'M 156 81 Q 166 75 178 80'
                    : mood === 'curious'
                    ? 'M 156 79 Q 166 75 178 78'
                    : 'M 156 77 Q 166 72 178 77'
                }
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Eye Sockets & Pupil Gaze Tracking (Gaze visibly follows cursor!) */}
              <g transform={`translate(${eyeShiftX}, ${eyeShiftY})`}>
                {/* Eye Irises */}
                <ellipse cx="114" cy="96" rx="11.5" ry={isListening ? 13 : 12} fill="#0f172a" />
                <ellipse cx="166" cy="96" rx="11.5" ry={isListening ? 13 : 12} fill="#0f172a" />

                {/* Lower Iris Glow */}
                <ellipse cx="114" cy="100" rx="8" ry="5" fill={palette.primary} opacity="0.85" />
                <ellipse cx="166" cy="100" rx="8" ry="5" fill={palette.primary} opacity="0.85" />

                {/* Starry Eye Catchlights */}
                <circle cx="110" cy="91" r="4.2" fill="#ffffff" />
                <circle cx="162" cy="91" r="4.2" fill="#ffffff" />
                <circle cx="119" cy="99" r="2" fill="#ffffff" />
                <circle cx="171" cy="99" r="2" fill="#ffffff" />
              </g>

              {/* Cute Pastel Blush Stickers */}
              <ellipse cx="90" cy="112" rx="8" ry="4.5" fill="#f472b6" opacity="0.45" />
              <ellipse cx="190" cy="112" rx="8" ry="4.5" fill="#f472b6" opacity="0.45" />

              {/* Reactive Lip-Sync Mouth */}
              {isSpeaking ? (
                <g>
                  <ellipse
                    cx="140"
                    cy="122"
                    rx={mouthRx}
                    ry={mouthRy}
                    fill="#0f172a"
                    stroke={palette.primary}
                    strokeWidth="1.5"
                  />
                  {/* Cute Tongue Highlight */}
                  <ellipse
                    cx="140"
                    cy={122 + mouthRy * 0.35}
                    rx={mouthRx * 0.55}
                    ry={mouthRy * 0.4}
                    fill="#f472b6"
                  />
                </g>
              ) : mood === 'inspired' || mood === 'oracular' ? (
                /* Excited Happy Cat/Gen-Z Smile :3 */
                <path
                  d="M 128 119 Q 134 126 140 120 Q 146 126 152 119"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ) : (
                /* Warm Friendly Bestie Smile */
                <path
                  d="M 127 118 Q 140 129 153 118"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              )}
            </g>
          </svg>
        </div>

        {/* ============================================================
            LAYER 3: FOREGROUND LAYER (Fastest ~28px shift, Z: +50px Depth)
            Floating hands (smartphone & crystal ball), glasses, drawstrings, tassel, badge
            ============================================================ */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-20"
          style={{
            transform: `translate3d(${fgX}px, ${fgY}px, 50px) rotateX(${fgRotateX}deg) rotateY(${fgRotateY}deg)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {/* Floating Holographic Slang Badge (Cleanly nestled top-left inside sphere boundary) */}
          <div
            className="pointer-events-none absolute top-3 left-2 z-30 -rotate-6 rounded-full border border-cyan-300/60 bg-slate-950/85 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.35)] backdrop-blur-md"
            style={{
              transform: 'translateZ(15px)'
            }}
          >
            {palette.sticker}
          </div>

          <svg
            viewBox="0 0 280 310"
            className="w-52 h-60 sm:w-64 sm:h-72 overflow-visible"
            aria-hidden="true"
          >
            <GhostDefs />

            {/* Graduation Cap Tassel & Star (Dynamic inertial sway) */}
            <g transform={`translate(${15 + pos.x * 8.0}, ${-6 + pos.y * 6.0}) rotate(8 140 36)`}>
              <path
                d="M 140 28 Q 174 34 182 56"
                fill="none"
                stroke="#fde047"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polygon
                points="182,53 184,58 189,58 185,61 187,66 182,63 177,66 179,61 175,58 180,58"
                fill="#fde047"
              />
            </g>

            {/* Trendy Rimless Y2K Tinted Glasses (Floats distinctly in 3D in front of eyes) */}
            <g transform={`translate(${headShiftX + pos.x * 7.0}, ${headShiftY + pos.y * 5.0}) rotate(${headTilt} 140 95)`}>
              <rect
                x="93"
                y="84"
                width="42"
                height="24"
                rx="10"
                fill="url(#y2kLensGrad)"
                stroke="#fde047"
                strokeWidth="2"
              />
              <rect
                x="145"
                y="84"
                width="42"
                height="24"
                rx="10"
                fill="url(#y2kLensGrad)"
                stroke="#fde047"
                strokeWidth="2"
              />
              {/* Nose Bridge */}
              <path d="M 135 94 Q 140 90 145 94" fill="none" stroke="#fde047" strokeWidth="2.2" />
              {/* Y2K Star Studs on Lens Corners */}
              <circle cx="98" cy="89" r="2" fill="#fde047" />
              <circle cx="182" cy="89" r="2" fill="#fde047" />
            </g>

            {/* Floating Hoodie Drawstrings with Neon Aglets (Front hem sway) */}
            <g transform={`translate(${pos.x * 6.0}, ${pos.y * 5.0})`}>
              <path d="M 124 156 Q 122 178 120 190" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 156 156 Q 158 178 160 190" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="117" y="188" width="5" height="8" rx="2" fill="#38bdf8" />
              <rect x="158" y="188" width="5" height="8" rx="2" fill="#f472b6" />
            </g>

            {/* Left Ghost Hand Holding Haunted Smartphone (Reaches forward!) */}
            <g transform={`translate(${34 + pos.x * 10.0}, ${142 + pos.y * 8.0}) rotate(${-12 + pos.x * 8})`}>
              {/* Phone Outer Glow */}
              <rect x="-4" y="-4" width="34" height="54" rx="9" fill={palette.primary} opacity="0.28" filter="url(#neonGlow)" />
              {/* Smartphone Body */}
              <rect
                x="0"
                y="0"
                width="26"
                height="46"
                rx="6"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              {/* Screen */}
              <rect x="3" y="5" width="20" height="36" rx="3" fill="#1e1b4b" />
              {/* Chat Bubble Icons */}
              <rect x="6" y="10" width="12" height="5" rx="2.5" fill="#38bdf8" />
              <rect x="8" y="18" width="12" height="5" rx="2.5" fill="#fde047" />
              <rect x="6" y="26" width="10" height="5" rx="2.5" fill="#f472b6" />
              {/* Ghost Paw Holding Phone */}
              <ellipse cx="26" cy="26" rx="10" ry="8" fill="#ffffff" />
            </g>

            {/* Right Ghost Hand Floating Glowing Crystal Ball (Reaches forward!) */}
            <g transform={`translate(${202 + pos.x * 12.0}, ${152 + pos.y * 9.0})`}>
              {/* Ghost Paw */}
              <path
                d="M 0 12 C 20 8, 30 20, 18 32 C 8 38, -2 30, -4 22 Z"
                fill="#ffffff"
              />
              {/* Floating Crystal Ball */}
              <g transform="translate(8, -14)">
                <circle cx="16" cy="16" r="28" fill="url(#crystalOrbGlow)" />
                <circle
                  cx="16"
                  cy="16"
                  r="16"
                  fill="#1e1b4b"
                  fillOpacity="0.45"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                />
                {/* Specular Highlight & Inner Spinning Star */}
                <ellipse cx="11" cy="10" rx="5" ry="2.5" transform="rotate(-25 11 10)" fill="#ffffff" opacity="0.8" />
                <path
                  d="M 16 9 Q 16 16 9 16 Q 16 16 16 23 Q 16 16 23 16 Q 16 16 16 9 Z"
                  fill="#fde047"
                  className="animate-spin"
                  style={{ transformOrigin: '16px 16px', animationDuration: '8s' }}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Glassmorphic + Swiss Editorial Status Pill */}
      <div className="glass-pill mt-1 flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium text-cyan-100 z-30">
        <span
          className={`h-2 w-2 rounded-full ${
            isListening
              ? 'bg-rose-400 animate-ping'
              : isSpeaking
              ? 'bg-cyan-400 animate-ping'
              : isThinking
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-amber-300/90">
          LIVE
        </span>
        <span className="h-3 w-[1px] bg-white/15" />
        <span className="tracking-tight">
          {isVoiceSoftened
            ? '🕊️ Voice Softened • Take Your Time'
            : isListening
            ? 'Listening to you (no cap)...'
            : isSpeaking
            ? 'Ghost Bestie is speaking...'
            : isThinking
            ? 'Letting your answer cook...'
            : palette.badge}
        </span>
      </div>
    </div>
  );
}
