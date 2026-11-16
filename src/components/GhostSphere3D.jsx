import React, { useState } from 'react';
import GhostAvatar from './GhostAvatar';
import CostumeGhostAvatar from './CostumeGhostAvatar';
import { Pumpkin, CandyCorn, Cauldron } from './HalloweenDecorations';
import { soundEngine } from '../utils/soundEffects';

export default function GhostSphere3D({
  phase = 'counseling',
  mood = 'welcoming',
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  mouthOpenness = 0,
  auraPoints = 1000,
  mousePosition = null,
  isVoiceSoftened = false,
  stageIndex = 0
}) {
  const [useCostume, setUseCostume] = useState(false);

  const toggleAvatarStyle = () => {
    soundEngine.playClickSound();
    setUseCostume((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[220px] select-none px-2 py-1">
      {/* ── Center Stage: Rainbow Portal & Parallax Sphere ── */}
      <div className="relative flex items-center justify-center w-[270px] h-[270px] sm:w-[300px] sm:h-[300px] max-w-full">
        
        {/* Subtle Background Glow behind the Rainbow Portal */}
        <div
          className="absolute inset-1 rounded-full opacity-60 blur-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(6, 182, 212, 0.3) 45%, transparent 75%)'
          }}
        />

        {/* Floating Relic: Candy Corn top-left */}
        <div className="absolute top-3 left-4 z-20 pointer-events-none animate-float-slow">
          <CandyCorn className="w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        </div>

        {/* Floating Relic: Ghost skull mid-left */}
        <div className="absolute top-20 left-1 z-20 pointer-events-none opacity-80 animate-float-slow" style={{ animationDelay: '1.2s' }}>
          <span className="text-sm drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">💀</span>
        </div>

        {/* ── Outer Rainbow Neon Glowing Ring Portal ── */}
        <div
          className="relative w-[230px] h-[230px] sm:w-[260px] sm:h-[260px] rounded-full p-[3.5px] rainbow-portal-ring flex items-center justify-center transition-transform duration-300"
          style={{
            transform: isSpeaking ? 'scale(1.02)' : 'scale(1)'
          }}
        >
          {/* Inner Dark Cosmic Sanctuary Circle */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center border border-white/10"
            style={{
              background: 'radial-gradient(circle at 50% 40%, #1e0e38 0%, #110624 55%, #0a0216 100%)'
            }}
          >
            {/* Soft cosmic sparkle dust inside portal */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-4 left-8 w-1 h-1 bg-cyan-300 rounded-full" />
              <div className="absolute top-12 right-10 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse" />
              <div className="absolute bottom-10 left-12 w-1 h-1 bg-pink-300 rounded-full" />
              <div className="absolute bottom-6 right-8 w-1 h-1 bg-purple-300 rounded-full" />
            </div>

            {/* Ghost Avatar: Streetwear Counselor or Wizard Costume scaled to fit fully within the cosmic portal */}
            <div className="w-full h-full flex items-center justify-center transform scale-[0.74] sm:scale-[0.76] origin-center">
              {useCostume ? (
                <CostumeGhostAvatar
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isThinking={isThinking}
                  mouthOpenness={mouthOpenness}
                  mousePosition={mousePosition}
                />
              ) : (
                <GhostAvatar
                  phase={phase}
                  mood={mood}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isThinking={isThinking}
                  mouthOpenness={mouthOpenness}
                  auraPoints={auraPoints}
                  isVoiceSoftened={isVoiceSoftened}
                  mousePosition={mousePosition}
                />
              )}
            </div>
          </div>
        </div>


        {/* ── Left Smiling Pumpkins (Bottom-left of portal) ── */}
        <div className="absolute left-1 sm:left-3 bottom-0 z-20 flex items-end -space-x-2 pointer-events-none">
          <Pumpkin className="w-11 h-9 sm:w-13 sm:h-11" />
          <Pumpkin className="w-7 h-6 sm:w-8 sm:h-7" />
        </div>

        {/* ── Right Smiling Pumpkin & Bubbling Cauldron (Bottom-right of portal) ── */}
        <div className="absolute right-1 sm:right-3 bottom-0 z-20 flex items-end gap-1 pointer-events-none">
          <Pumpkin className="w-8 h-7 sm:w-9 sm:h-8" />
          <Cauldron className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        {/* ── Wardrobe Toggle Capsule Button (Centered under portal) ── */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30">
          <button
            type="button"
            onClick={toggleAvatarStyle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full font-fredoka font-bold text-[10.5px] uppercase tracking-wider text-purple-200 border border-purple-400/40 bg-purple-950/85 hover:bg-purple-900 shadow-[0_0_12px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            title="Toggle Ghost Outfit (Streetwear Counselor vs Wizard Costume)"
          >
            <span>{useCostume ? '🧙‍♂️ Wizard Hat' : '🎧 Streetwear Fit'}</span>
            <span className="text-[9px] text-amber-300">↻</span>
          </button>
        </div>
      </div>
    </div>
  );
}
