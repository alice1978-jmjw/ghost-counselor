import React from 'react';

// Cute smiling Jack-o'-lantern pumpkin
export function Pumpkin({ className = 'w-10 h-10', glowing = true }) {
  return (
    <svg viewBox="0 0 100 85" className={`${className} filter drop-shadow-md select-none`} aria-hidden="true">
      <defs>
        <radialGradient id="pumpkinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb020" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
        <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </radialGradient>
      </defs>
      {/* Green Stem */}
      <path d="M 47 18 C 45 8, 54 2, 57 2 C 55 7, 53 14, 52 18 Z" fill="#22c55e" stroke="#15803d" strokeWidth="2" strokeLinejoin="round" />
      {/* Pumpkin Body (layered lobes) */}
      <ellipse cx="25" cy="50" rx="20" ry="26" fill="url(#pumpkinGlow)" stroke="#c2410c" strokeWidth="2.5" />
      <ellipse cx="75" cy="50" rx="20" ry="26" fill="url(#pumpkinGlow)" stroke="#c2410c" strokeWidth="2.5" />
      <ellipse cx="36" cy="52" rx="22" ry="29" fill="url(#pumpkinGlow)" stroke="#c2410c" strokeWidth="2.5" />
      <ellipse cx="64" cy="52" rx="22" ry="29" fill="url(#pumpkinGlow)" stroke="#c2410c" strokeWidth="2.5" />
      <ellipse cx="50" cy="53" rx="22" ry="30" fill="url(#pumpkinGlow)" stroke="#c2410c" strokeWidth="2.5" />
      {/* Highlight sheen */}
      <ellipse cx="36" cy="38" rx="7" ry="12" fill="#fdba74" opacity="0.45" />
      {/* Carved Eyes */}
      <polygon points="36,44 44,52 30,52" fill={glowing ? 'url(#faceGlow)' : '#1e1b4b'} />
      <polygon points="64,44 70,52 56,52" fill={glowing ? 'url(#faceGlow)' : '#1e1b4b'} />
      {/* Carved Nose */}
      <polygon points="50,54 53,59 47,59" fill={glowing ? 'url(#faceGlow)' : '#1e1b4b'} />
      {/* Carved Smiling Mouth */}
      <path
        d="M 28 62 Q 50 82 72 62 Q 65 72 58 64 Q 50 74 42 64 Q 35 72 28 62 Z"
        fill={glowing ? 'url(#faceGlow)' : '#1e1b4b'}
      />
    </svg>
  );
}

// Melting candle with flame
export function Candle({ className = 'w-6 h-12' }) {
  return (
    <svg viewBox="0 0 40 80" className={`${className} select-none`} aria-hidden="true">
      <defs>
        <radialGradient id="candleFlameGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Flame halo */}
      <circle cx="20" cy="16" r="14" fill="url(#candleFlameGlow)" className="animate-pulse" opacity="0.75" />
      {/* Flame */}
      <path
        d="M 20 6 Q 25 15 20 22 Q 15 15 20 6 Z"
        fill="#fef08a"
        stroke="#f97316"
        strokeWidth="1"
        className="animate-pulse"
      />
      {/* Wick */}
      <line x1="20" y1="22" x2="20" y2="28" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      {/* Candle Body */}
      <path
        d="M 12 28 C 14 27, 26 27, 28 28 L 29 78 C 29 79, 11 79, 11 78 Z"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      {/* Wax Drips */}
      <path
        d="M 12 28 Q 15 42 16 35 Q 19 48 21 33 Q 25 45 27 30"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="42" r="1.5" fill="#e2e8f0" />
    </svg>
  );
}

// Candy Corn
export function CandyCorn({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 50 60" className={`${className} select-none`} aria-hidden="true">
      {/* Top: White */}
      <path d="M 25 4 Q 30 18 33 22 L 17 22 Q 20 18 25 4 Z" fill="#ffffff" />
      {/* Middle: Orange */}
      <polygon points="17,22 33,22 39,39 11,39" fill="#f97316" />
      {/* Base: Yellow */}
      <path d="M 11 39 L 39 39 Q 44 54 39 55 Q 25 58 11 55 Q 6 54 11 39 Z" fill="#facc15" />
    </svg>
  );
}

// Purple Wrapped Candy
export function WrappedCandy({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 60 40" className={`${className} select-none`} aria-hidden="true">
      {/* Left wrapper twist */}
      <polygon points="6,6 18,20 6,34" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
      {/* Right wrapper twist */}
      <polygon points="54,6 42,20 54,34" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
      {/* Candy center */}
      <ellipse cx="30" cy="20" rx="16" ry="13" fill="#c084fc" stroke="#7e22ce" strokeWidth="2" />
      {/* Wrapper swirl / stripes */}
      <path d="M 22 10 Q 30 20 25 30" stroke="#f3e8ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 32 8 Q 38 20 34 32" stroke="#f3e8ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Cute Flying Bat with purple glow
export function Bat({ className = 'w-8 h-6' }) {
  return (
    <svg viewBox="0 0 100 65" className={`${className} filter drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] select-none`} aria-hidden="true">
      {/* Bat Wings & Body */}
      <path
        d="M 50 32 
           C 40 18, 20 12, 4 20 
           C 12 30, 16 44, 25 46 
           C 30 38, 38 42, 44 48 
           C 46 54, 54 54, 56 48 
           C 62 42, 70 38, 75 46 
           C 84 44, 88 30, 96 20 
           C 80 12, 60 18, 50 32 Z"
        fill="#3b0764"
        stroke="#c084fc"
        strokeWidth="2.5"
      />
      {/* Bat Ears */}
      <polygon points="44,28 42,16 47,24" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
      <polygon points="56,28 58,16 53,24" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
      {/* Bat Head */}
      <circle cx="50" cy="30" r="8" fill="#3b0764" />
      {/* Eyes */}
      <circle cx="47" cy="29" r="1.8" fill="#a3e635" />
      <circle cx="53" cy="29" r="1.8" fill="#a3e635" />
      {/* Tiny fangs */}
      <polygon points="48,34 49,36 47,34" fill="#ffffff" />
      <polygon points="52,34 53,36 51,34" fill="#ffffff" />
    </svg>
  );
}

// Corner Spiderweb
export function CornerSpiderweb({ position = 'top-left', className = 'w-24 h-24' }) {
  const isTopLeft = position === 'top-left';
  const isBottomRight = position === 'bottom-right';

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} pointer-events-none select-none ${
        isBottomRight ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    >
      <g stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" fill="none">
        {/* Radial strands */}
        <line x1="0" y1="0" x2="120" y2="0" />
        <line x1="0" y1="0" x2="110" y2="35" />
        <line x1="0" y1="0" x2="85" y2="85" />
        <line x1="0" y1="0" x2="35" y2="110" />
        <line x1="0" y1="0" x2="0" y2="120" />

        {/* Web arcs tier 1 */}
        <path d="M 25 0 Q 22 7 18 18 Q 7 22 0 25" />
        {/* Web arcs tier 2 */}
        <path d="M 50 0 Q 45 15 35 35 Q 15 45 0 50" />
        {/* Web arcs tier 3 */}
        <path d="M 80 0 Q 72 24 57 57 Q 24 72 0 80" />
        {/* Web arcs tier 4 */}
        <path d="M 115 0 Q 104 35 82 82 Q 35 104 0 115" />
      </g>
    </svg>
  );
}

// Cute little floating white ghost
export function MiniGhost({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 60 70" className={`${className} filter drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] select-none`} aria-hidden="true">
      {/* Ghost body */}
      <path
        d="M 15 40 
           C 12 18, 48 18, 45 40 
           C 44 50, 48 58, 45 64 
           C 41 68, 38 62, 35 64 
           C 31 66, 29 61, 25 64 
           C 21 66, 19 61, 15 64 
           C 12 58, 16 50, 15 40 Z"
        fill="#ffffff"
      />
      {/* Little arms */}
      <path d="M 16 38 Q 8 36 12 30" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 44 38 Q 52 36 48 30" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Dark eyes */}
      <circle cx="25" cy="30" r="3" fill="#1e1b4b" />
      <circle cx="35" cy="30" r="3" fill="#1e1b4b" />
      {/* Catchlight */}
      <circle cx="24" cy="29" r="1" fill="#ffffff" />
      <circle cx="34" cy="29" r="1" fill="#ffffff" />
      {/* Cheeks */}
      <ellipse cx="21" cy="35" rx="3" ry="1.8" fill="#f472b6" opacity="0.65" />
      <ellipse cx="39" cy="35" rx="3" ry="1.8" fill="#f472b6" opacity="0.65" />
      {/* Smile */}
      <path d="M 28 35 Q 30 39 32 35" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Cute Smiling Cauldron with bubbling green potion
export function Cauldron({ className = 'w-10 h-10', bubbling = true }) {
  return (
    <svg viewBox="0 0 80 80" className={`${className} select-none`} aria-hidden="true">
      <defs>
        <radialGradient id="potionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
      </defs>
      {/* Bubbles */}
      {bubbling && (
        <g fill="#4ade80" className="animate-pulse">
          <circle cx="32" cy="18" r="4" />
          <circle cx="48" cy="14" r="3" />
          <circle cx="40" cy="8" r="5" opacity="0.8" />
        </g>
      )}
      {/* Cauldron rim */}
      <ellipse cx="40" cy="28" rx="28" ry="8" fill="#3b0764" stroke="#6b21a8" strokeWidth="2.5" />
      {/* Potion surface */}
      <ellipse cx="40" cy="27" rx="24" ry="6" fill="url(#potionGlow)" />
      {/* Potion bubble domes */}
      <ellipse cx="35" cy="26" rx="5" ry="3" fill="#86efac" opacity="0.8" />
      <ellipse cx="46" cy="28" rx="4" ry="2" fill="#86efac" opacity="0.8" />
      {/* Cauldron pot body */}
      <path
        d="M 14 30 
           C 12 55, 20 68, 40 68 
           C 60 68, 68 55, 66 30 Z"
        fill="#2e1065"
        stroke="#6b21a8"
        strokeWidth="2.5"
      />
      {/* Cauldron feet */}
      <path d="M 24 66 L 18 76" stroke="#2e1065" strokeWidth="5" strokeLinecap="round" />
      <path d="M 56 66 L 62 76" stroke="#2e1065" strokeWidth="5" strokeLinecap="round" />
      {/* Cute smiling face on cauldron */}
      <circle cx="34" cy="46" r="2.2" fill="#e9d5ff" />
      <circle cx="46" cy="46" r="2.2" fill="#e9d5ff" />
      <path d="M 37 52 Q 40 56 43 52" stroke="#e9d5ff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <ellipse cx="30" cy="49" rx="2.5" ry="1.5" fill="#ec4899" opacity="0.6" />
      <ellipse cx="50" cy="49" rx="2.5" ry="1.5" fill="#ec4899" opacity="0.6" />
    </svg>
  );
}
