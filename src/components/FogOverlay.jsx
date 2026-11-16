import React from 'react';

export default function FogOverlay({ density = 'thick' }) {
  // density: 'thick' (landing screen), 'parting' (emergence zoom-out), 'ambient' (counseling room)
  const isThick = density === 'thick';
  const isParting = density === 'parting';

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 overflow-hidden transition-opacity duration-1000 ${
        isThick ? 'opacity-100' : isParting ? 'opacity-80' : 'opacity-45'
      }`}
      aria-hidden="true"
    >
      {/* Layer 1: Cold Desaturated Silt & Tallow Low-Hanging Mist */}
      <div
        className={`absolute -inset-x-1/4 bottom-0 h-[85vh] animate-fog-right transition-transform duration-[2500ms] ease-out ${
          isParting ? 'scale-125 opacity-60' : ''
        }`}
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 78%, rgba(212, 197, 122, 0.18) 0%, rgba(15, 20, 28, 0.82) 55%, transparent 100%)',
          filter: 'blur(36px)'
        }}
      />

      {/* Layer 2: Drifting Mid-Screen Victorian Corridor Fog Bank */}
      <div
        className={`absolute -inset-x-1/3 top-[8%] h-[78vh] animate-fog-left transition-all duration-[2400ms] ${
          isThick
            ? 'opacity-95 translate-y-0'
            : isParting
            ? 'opacity-50 -translate-y-16 scale-110'
            : 'opacity-25 translate-y-24'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 70% 48% at 45% 50%, rgba(148, 163, 184, 0.24) 0%, rgba(234, 179, 8, 0.14) 42%, rgba(6, 7, 10, 0.88) 80%, transparent 100%)',
          filter: 'blur(42px)'
        }}
      />

      {/* Layer 3: Thick Upper Curtain of Dust & Tallow Mist */}
      <div
        className={`absolute -inset-1/4 animate-fog-swirl transition-all duration-[2800ms] ease-in-out ${
          isThick
            ? 'opacity-90 scale-100'
            : isParting
            ? 'opacity-30 scale-150'
            : 'opacity-12 scale-150'
        }`}
        style={{
          background:
            'radial-gradient(circle at 60% 38%, rgba(202, 138, 4, 0.16) 0%, rgba(100, 116, 139, 0.18) 38%, rgba(10, 12, 18, 0.92) 74%, transparent 100%)',
          filter: 'blur(48px)'
        }}
      />

      {/* Bottom Ground Mist Wisp */}
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{
          background:
            'linear-gradient(to top, rgba(5, 7, 11, 0.96) 0%, rgba(161, 98, 7, 0.1) 50%, transparent 100%)'
        }}
      />
    </div>
  );
}
