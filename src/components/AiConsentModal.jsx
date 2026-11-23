import React from 'react';
import { Shield, Sparkles, Lock, Cpu, CheckCircle, Info, ExternalLink } from 'lucide-react';

export default function AiConsentModal({
  isOpen,
  onSelectMode,
  currentMode = ''
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-purple-500/40 bg-gradient-to-b from-[#180930] via-[#100520] to-[#0a0214] text-slate-100 shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-purple-500/30 bg-purple-950/40 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Shield className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h2 id="ai-consent-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              AI Disclosure & Consent
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Privacy First
              </span>
            </h2>
            <p className="text-xs text-purple-200/80">
              Choose how your counseling conversations and career advice are processed.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 text-xs sm:text-sm text-slate-200">
          
          {/* Core Privacy Guarantee Highlight */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 mt-0.5">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-200 text-xs sm:text-sm">
                100% On-Device Camera Privacy Guarantee
              </p>
              <p className="text-[11.5px] sm:text-xs text-emerald-300/90 leading-relaxed mt-0.5">
                Camera permission enables the local <strong>Scrying Mirror</strong> only. Facial expressions and stress scores are calculated <strong>100% on your device</strong> in your browser via local WebAssembly and are <strong>never sent to any server or AI provider</strong>.
              </p>
            </div>
          </div>

          <p className="text-xs text-purple-200/90">
            Please select your preferred processing mode before continuing. You can change this at any time in the footer:
          </p>

          {/* Mode Option 1: Cloud AI */}
          <div className="rounded-xl border border-purple-500/40 bg-purple-950/25 p-4 hover:border-purple-400/70 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-purple-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Cloud AI Mode (Google Gemini)
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                Dynamic, open-ended conversational counseling using Google Gemini.
              </p>
              <div className="mt-2.5 space-y-1 text-[11px] text-purple-200/75 border-t border-purple-500/20 pt-2">
                <p>• <strong>What is sent:</strong> Your chat messages, career choices, and high-level archetype matches.</p>
                <p>• <strong>Who receives it:</strong> Google Gemini API (or zero-key proxy).</p>
                <p>• <strong>What is NOT sent:</strong> Camera video, biometric facial landmarks, and stress ratings are strictly excluded.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectMode('cloud')}
              className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-900/40 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Use Cloud AI Mode
            </button>
          </div>

          {/* Mode Option 2: 100% Offline Local Engine */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4 hover:border-emerald-400/60 transition-all flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-200 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  Offline Mode (100% On-Device)
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Zero Network Calls
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                Smart local rule-engine, economic cost calculators, and 3D Crisis Simulator run 100% inside your browser.
              </p>
              <div className="mt-2.5 space-y-1 text-[11px] text-slate-300/75 border-t border-emerald-500/20 pt-2">
                <p>• <strong>What is sent:</strong> Nothing. Zero network requests.</p>
                <p>• <strong>Who receives it:</strong> Nobody. All processing stays strictly inside your device.</p>
                <p>• <strong>Local Features:</strong> Scrying mirror, voice synthesis, and soul dossier all remain active.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectMode('offline')}
              className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-500/40 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-100 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Lock className="h-4 w-4 text-emerald-300" />
              Use 100% Offline Mode
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <div className="border-t border-purple-500/30 bg-[#0f041d] px-5 py-3 text-[11px] text-purple-300/70 flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
          <span>You can switch between Cloud AI and Offline mode at any time using the toggle in the bottom status strip.</span>
        </div>

      </div>
    </div>
  );
}
