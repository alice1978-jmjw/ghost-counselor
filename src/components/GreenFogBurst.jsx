import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

const GreenFogBurst = forwardRef(function GreenFogBurst(props, ref) {
  const [bursts, setBursts] = useState([]);

  // Trigger a volumetric green fog burst at (x, y) coordinates
  const triggerBurst = useCallback((x, y) => {
    const burstId = Date.now() + Math.random();
    const particleCount = 18;

    const particles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 25 + Math.random() * 55;
      const vx = Math.cos(angle) * speed;
      // Slight upward lift for natural smoke/fog billowing
      const vy = Math.sin(angle) * speed - (15 + Math.random() * 30);
      const size = 32 + Math.random() * 38;
      const duration = 0.75 + Math.random() * 0.45;
      const delay = Math.random() * 0.08;

      const colors = [
        'radial-gradient(circle, rgba(134, 239, 172, 0.95) 0%, rgba(34, 197, 94, 0.6) 45%, rgba(20, 83, 45, 0) 75%)',
        'radial-gradient(circle, rgba(74, 222, 128, 0.9) 0%, rgba(22, 163, 74, 0.55) 45%, rgba(5, 46, 22, 0) 75%)',
        'radial-gradient(circle, rgba(167, 243, 208, 0.95) 0%, rgba(74, 222, 128, 0.5) 40%, transparent 70%)',
        'radial-gradient(circle, rgba(34, 197, 94, 0.85) 0%, rgba(21, 128, 61, 0.6) 50%, transparent 75%)',
      ];

      return {
        id: `${burstId}-${i}`,
        vx,
        vy,
        size,
        duration,
        delay,
        color: colors[i % colors.length],
        rotate: Math.random() * 360,
      };
    });

    const newBurst = { id: burstId, x, y, particles };
    setBursts((prev) => [...prev, newBurst]);

    // Cleanup burst after animation completes
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 1300);
  }, []);

  useImperativeHandle(ref, () => ({
    trigger: triggerBurst,
  }), [triggerBurst]);

  if (bursts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{ left: `${burst.x}px`, top: `${burst.y}px` }}
        >
          {burst.particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${-p.size / 2}px`,
                top: `${-p.size / 2}px`,
                background: p.color,
                filter: 'blur(8px)',
                animation: `greenFogBillow ${p.duration}s cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s forwards`,
                '--fog-vx': `${p.vx}px`,
                '--fog-vy': `${p.vy}px`,
                '--fog-rotate': `${p.rotate}deg`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

export default GreenFogBurst;
