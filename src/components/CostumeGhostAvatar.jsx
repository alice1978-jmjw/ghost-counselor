import React, { useState, useEffect, useRef } from 'react';

export default function CostumeGhostAvatar({
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mouthOpenness = 0,
  mousePosition = null
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
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

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;

      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.16);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.16);
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

  // Parallax offsets
  const eyeShiftX = pos.x * 5.0;
  const eyeShiftY = pos.y * 4.0;
  const headTilt = pos.x * 5.0;
  const bodyShiftX = pos.x * 6.0;
  const bodyShiftY = pos.y * 4.0;

  // Lip-sync dynamic mouth height
  const mouthH = isSpeaking ? 6 + mouthOpenness * 12 : 5;
  const mouthW = isSpeaking ? 14 + mouthOpenness * 3 : 13;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 340 340"
        className="w-full h-full max-w-[280px] max-h-[280px] sm:max-w-[310px] sm:max-h-[310px] overflow-visible animate-float-slow"
        aria-label="Cute Ghost in Wizard Costume"
      >
        <defs>
          {/* Hat Gradient */}
          <linearGradient id="hatConeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#432874" />
            <stop offset="50%" stopColor="#2e145b" />
            <stop offset="100%" stopColor="#1a0936" />
          </linearGradient>

          {/* Hat Brim Gradient */}
          <linearGradient id="hatBrimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#250e4a" />
            <stop offset="50%" stopColor="#4a2580" />
            <stop offset="100%" stopColor="#250e4a" />
          </linearGradient>

          {/* Cape Gradient */}
          <linearGradient id="capeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="60%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>

          {/* Ghost Body Soft Lighting */}
          <linearGradient id="ghostBodyGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f8fafc" />
            <stop offset="90%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Pumpkin Candy Bucket Gradient */}
          <radialGradient id="bucketGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="65%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </radialGradient>

          {/* Yellow Star & Face Glow */}
          <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Floating Magical Confetti & Stars around the Ghost ── */}
        <g className="confetti-sparks select-none pointer-events-none">
          {/* Yellow stars */}
          <polygon points="58,95 61,102 68,103 63,108 64,115 58,111 52,115 53,108 48,103 55,102" fill="#facc15" filter="url(#starGlow)" />
          <polygon points="275,80 277,85 282,86 278,90 279,95 275,92 271,95 272,90 268,86 273,85" fill="#facc15" filter="url(#starGlow)" />
          <polygon points="285,150 287,154 291,155 288,158 289,162 285,160 281,162 282,158 279,155 283,154" fill="#fbbf24" />
          <polygon points="45,190 47,194 51,195 48,198 49,202 45,200 41,202 42,198 39,195 43,194" fill="#facc15" />

          {/* Four-point sparkles */}
          <path d="M 90 60 Q 90 68 82 68 Q 90 68 90 76 Q 90 68 98 68 Q 90 68 90 60 Z" fill="#38bdf8" />
          <path d="M 252 65 Q 252 71 246 71 Q 252 71 252 77 Q 252 71 258 71 Q 252 71 252 65 Z" fill="#ec4899" />
          <path d="M 62 145 Q 62 149 58 149 Q 62 149 62 153 Q 62 149 66 149 Q 62 149 62 145 Z" fill="#a855f7" />

          {/* Little colorful confetti dots */}
          <circle cx="75" cy="115" r="3" fill="#f43f5e" />
          <circle cx="265" cy="120" r="3.5" fill="#a3e635" />
          <circle cx="270" cy="185" r="2.5" fill="#38bdf8" />
          <circle cx="85" cy="210" r="3" fill="#fb923c" />
          <circle cx="240" cy="225" r="2.5" fill="#facc15" />
        </g>

        {/* ── Main Ghost Group with Mouse Parallax ── */}
        <g style={{ transform: `translate(${bodyShiftX}px, ${bodyShiftY}px)`, transformOrigin: '170px 180px' }}>
          
          {/* Back Part of Cape (behind body) */}
          <path
            d="M 120 185 
               C 98 200, 88 248, 110 265 
               C 132 250, 150 242, 170 242 
               C 190 242, 208 250, 230 265 
               C 252 248, 242 200, 220 185 Z"
            fill="url(#capeGrad)"
            stroke="#4c1d95"
            strokeWidth="2.5"
          />

          {/* Ghost Body */}
          <path
            d="M 170 125 
               C 126 125, 110 155, 110 198 
               C 110 234, 108 252, 116 264 
               C 124 258, 132 265, 140 260 
               C 148 255, 156 263, 164 259 
               C 172 255, 180 263, 188 259 
               C 196 255, 204 263, 212 260 
               C 220 265, 228 258, 234 264 
               C 238 250, 236 234, 236 198 
               C 236 155, 214 125, 170 125 Z"
            fill="url(#ghostBodyGrad)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
            filter="drop-shadow(0 6px 14px rgba(0,0,0,0.3))"
          />

          {/* Cape Front Shoulders & Gold Clasp */}
          <path
            d="M 122 186 
               C 134 200, 152 206, 170 206 
               C 188 206, 206 200, 218 186 
               C 208 202, 188 210, 170 210 
               C 152 210, 132 202, 122 186 Z"
            fill="#581c87"
            stroke="#3b0764"
            strokeWidth="1.5"
          />
          {/* Gold Neck Clasp */}
          <circle cx="170" cy="208" r="5" fill="#facc15" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="170" cy="208" r="2.2" fill="#fef08a" />

          {/* ── Ghost Face Elements with Eye Tracking & Head Tilt ── */}
          <g style={{ transform: `rotate(${headTilt}deg)`, transformOrigin: '170px 170px' }}>
            
            {/* Blushing Cheeks */}
            <ellipse cx="138" cy="174" rx="9" ry="5.5" fill="#f472b6" opacity="0.7" />
            <ellipse cx="202" cy="174" rx="9" ry="5.5" fill="#f472b6" opacity="0.7" />

            {/* Left Eye */}
            <g style={{ transform: `translate(${eyeShiftX}px, ${eyeShiftY}px)` }}>
              <ellipse cx="146" cy="164" rx="7" ry="9" fill="#0f172a" />
              {/* Eye Catchlights */}
              <circle cx="144" cy="160" r="3" fill="#ffffff" />
              <circle cx="148" cy="166" r="1.5" fill="#ffffff" />
            </g>

            {/* Right Eye */}
            <g style={{ transform: `translate(${eyeShiftX}px, ${eyeShiftY}px)` }}>
              <ellipse cx="194" cy="164" rx="7" ry="9" fill="#0f172a" />
              {/* Eye Catchlights */}
              <circle cx="192" cy="160" r="3" fill="#ffffff" />
              <circle cx="196" cy="166" r="1.5" fill="#ffffff" />
            </g>

            {/* Responsive Smiling Mouth (Lip-syncs with speech!) */}
            <path
              d={
                isSpeaking
                  ? `M ${170 - mouthW / 2} 174 Q 170 ${174 + mouthH} ${170 + mouthW / 2} 174 Q 170 ${172 - mouthH / 3} ${170 - mouthW / 2} 174 Z`
                  : `M 163 173 Q 170 181 177 173`
              }
              fill={isSpeaking ? '#831843' : 'none'}
              stroke={isSpeaking ? '#9d174d' : '#0f172a'}
              strokeWidth={isSpeaking ? '1.5' : '2.5'}
              strokeLinecap="round"
            />
            {isSpeaking && (
              <path
                d={`M ${166} ${173 + mouthH * 0.45} Q 170 ${173 + mouthH} ${174} ${173 + mouthH * 0.45}`}
                fill="#fb7185"
              />
            )}
          </g>

          {/* ── Left Arm holding Pumpkin Bucket ── */}
          <g>
            {/* Curved Bucket Wire Handle */}
            <path
              d="M 98 188 C 92 172, 78 176, 76 196"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Ghost Little Left Hand / Arm */}
            <path
              d="M 118 190 Q 102 186 94 190 C 90 192, 91 200, 98 200 Q 108 198 120 198 Z"
              fill="url(#ghostBodyGrad)"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {/* Smiling Trick-or-Treat Pumpkin Bucket */}
            <g style={{ transform: 'translate(62px, 192px)' }}>
              {/* Pumpkin Body */}
              <ellipse cx="22" cy="22" rx="20" ry="17" fill="url(#bucketGrad)" stroke="#c2410c" strokeWidth="2" />
              <ellipse cx="15" cy="22" rx="14" ry="17" fill="url(#bucketGrad)" stroke="#c2410c" strokeWidth="1.5" />
              <ellipse cx="29" cy="22" rx="14" ry="17" fill="url(#bucketGrad)" stroke="#c2410c" strokeWidth="1.5" />
              {/* Highlight */}
              <ellipse cx="15" cy="16" rx="4" ry="7" fill="#fed7aa" opacity="0.45" />
              {/* Black Carved Face on Bucket */}
              <polygon points="13,18 17,23 10,23" fill="#1e1b4b" />
              <polygon points="31,18 34,23 27,23" fill="#1e1b4b" />
              <path d="M 14 26 Q 22 34 30 26 Q 27 30 22 27 Q 17 30 14 26 Z" fill="#1e1b4b" />
            </g>
          </g>

          {/* ── Right Arm Waving Cheerful Hello ── */}
          <path
            d="M 230 188 Q 248 182 254 174 C 258 169, 264 175, 258 182 Q 248 192 230 196 Z"
            fill="url(#ghostBodyGrad)"
            stroke="#cbd5e1"
            strokeWidth="2.5"
          />

          {/* ── Wizard Hat ── */}
          <g style={{ transform: `rotate(${headTilt * 0.8}deg)`, transformOrigin: '170px 135px' }}>
            {/* 1. Wide Hat Brim (Rendered behind the band & buckle) */}
            <ellipse
              cx="170"
              cy="138"
              rx="62"
              ry="16"
              fill="url(#hatBrimGrad)"
              stroke="#1e0936"
              strokeWidth="3.5"
            />
            {/* Brim Highlight curve */}
            <path
              d="M 120 138 C 142 145, 198 145, 222 138"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* 2. Hat Cone Body */}
            <path
              d="M 128 134 
                 C 132 115, 142 85, 155 58 
                 C 162 44, 172 30, 185 22 
                 C 188 20, 192 23, 188 30 
                 C 180 44, 182 65, 188 88 
                 C 194 108, 206 126, 214 134 Z"
              fill="url(#hatConeGrad)"
              stroke="#1e0936"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Stars on Hat Cone */}
            <polygon points="160,72 163,77 168,78 164,81 165,86 160,84 156,86 157,81 153,78 158,77" fill="#facc15" filter="url(#starGlow)" />
            <polygon points="178,54 180,57 184,58 181,60 182,64 179,62 176,64 177,60 174,58 178,57" fill="#facc15" />
            <polygon points="174,98 176,102 181,103 177,106 178,111 174,108 170,111 171,106 167,103 172,102" fill="#facc15" />
            <circle cx="148" cy="96" r="2.2" fill="#fef08a" />
            <circle cx="186" cy="76" r="2" fill="#fef08a" />

            {/* 3. Orange Hat Band (Rendered ON TOP of cone & brim base) */}
            <path
              d="M 126 132 
                 C 148 138, 192 138, 216 132 
                 L 218 141 
                 C 192 147, 148 147, 124 141 Z"
              fill="#f97316"
              stroke="#c2410c"
              strokeWidth="2"
            />

            {/* 4. Golden Square Buckle (Centered on the Orange Band) */}
            <g style={{ transform: 'translate(160px, 128px)' }}>
              <rect x="0" y="0" width="18" height="15" rx="3" fill="#facc15" stroke="#92400e" strokeWidth="2" />
              <rect x="4" y="3.5" width="10" height="8" rx="1.5" fill="#f97316" />
              <rect x="7" y="2.5" width="4" height="10" fill="#facc15" />
            </g>
          </g>

        </g>
      </svg>
    </div>
  );
}
