import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Volume2,
  Lock,
  ScrollText,
  Play
} from 'lucide-react';
import {
  ASSESSMENT_SCENARIOS,
  ARCHETYPE_PROFILES,
  calculateArchetypeResult
} from '../data/assessmentData';
import { soundEngine, speakGhostText, stopGhostSpeech } from '../utils/soundEffects';
import ArcadeAssessment3DCanvas from './ArcadeAssessment3DCanvas';

const ZERO_SCORES = {
  Maker: 0,
  Architect: 0,
  Catalyst: 0,
  Visionary: 0
};

export default function ArcadeAssessmentModal({
  isOpen,
  onClose,
  onSyncResult,
  onScenarioChoice,
  onGameComplete,
  onSelectPathway,
  onOpenDossier,
  soulProfile = null,
  dossier = null,
  sessionResetKey = 0,
  voiceEnabled = true,
  voicePresetId = 'friendly_genz'
}) {
  const [gameState, setGameState] = useState('START_SCREEN'); // 'START_SCREEN' | 'PLAYING_SCENARIO' | 'END_SCREEN'
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenarioIndexRef = useRef(0);
  useEffect(() => {
    scenarioIndexRef.current = scenarioIndex;
  }, [scenarioIndex]);

  const [traitScores, setTraitScores] = useState({ ...ZERO_SCORES });
  const traitScoresRef = useRef({ ...ZERO_SCORES });
  useEffect(() => {
    traitScoresRef.current = traitScores;
  }, [traitScores]);

  const choicesHistoryRef = useRef([]);
  const [loggedChoicesCount, setLoggedChoicesCount] = useState(0);

  const [latestChoice, setLatestChoice] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [autoVoiceNarration, setAutoVoiceNarration] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false
  });
  const isTransitioningRef = useRef(false);

  const onScenarioChoiceRef = useRef(onScenarioChoice);
  const onGameCompleteRef = useRef(onGameComplete);
  useEffect(() => {
    onScenarioChoiceRef.current = onScenarioChoice;
  }, [onScenarioChoice]);
  useEffect(() => {
    onGameCompleteRef.current = onGameComplete;
  }, [onGameComplete]);

  // Reset modal internal state whenever the global session is reset
  useEffect(() => {
    if (sessionResetKey === 0) return;
    stopGhostSpeech();
    setIsSpeakingQuestion(false);
    traitScoresRef.current = { ...ZERO_SCORES };
    setTraitScores({ ...ZERO_SCORES });
    choicesHistoryRef.current = [];
    setLoggedChoicesCount(0);
    scenarioIndexRef.current = 0;
    setScenarioIndex(0);
    setLatestChoice(null);
    setFinalResult(null);
    setSelectedPathway(null);
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setGameState('START_SCREEN');
  }, [sessionResetKey]);

  // Keep selectedPathway mirrored with soulProfile.arcade when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const syncedPathway = soulProfile?.arcade?.selectedPathway || null;
    if (syncedPathway?.name !== selectedPathway?.name) {
      setSelectedPathway(syncedPathway);
    }
  }, [isOpen, soulProfile?.arcade?.selectedPathway]);

  // Safe index clamped between 0 and 9 (total 10 scenarios)
  const safeIndex = Math.min(Math.max(0, scenarioIndex), ASSESSMENT_SCENARIOS.length - 1);
  const currentScenario = ASSESSMENT_SCENARIOS[safeIndex] || ASSESSMENT_SCENARIOS[0];

  // Read out the current scenario question using Web Speech API
  const readCurrentQuestion = useCallback(() => {
    if (!voiceEnabled || !currentScenario) return;
    stopGhostSpeech();
    const textToRead = `Question ${safeIndex + 1}. ${currentScenario.scenario}`;
    speakGhostText(textToRead, {
      voiceEnabled: true,
      voicePresetId,
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => setIsSpeakingQuestion(false)
    });
  }, [currentScenario, safeIndex, voiceEnabled, voicePresetId]);

  const handleToggleReadQuestion = () => {
    if (isSpeakingQuestion) {
      stopGhostSpeech();
      setIsSpeakingQuestion(false);
    } else {
      readCurrentQuestion();
    }
  };

  useEffect(() => {
    if (gameState === 'PLAYING_SCENARIO' && isOpen && autoVoiceNarration && voiceEnabled) {
      const timer = setTimeout(() => {
        readCurrentQuestion();
      }, 350);
      return () => {
        clearTimeout(timer);
        stopGhostSpeech();
        setIsSpeakingQuestion(false);
      };
    }
  }, [gameState, scenarioIndex, isOpen, autoVoiceNarration, voiceEnabled, readCurrentQuestion]);

  // Start a fresh 10-scenario simulation run
  const handleStartGame = () => {
    soundEngine.playArcadeStep();
    stopGhostSpeech();
    setIsSpeakingQuestion(false);
    const zeroScores = { ...ZERO_SCORES };
    traitScoresRef.current = zeroScores;
    setTraitScores(zeroScores);
    choicesHistoryRef.current = [];
    setLoggedChoicesCount(0);
    scenarioIndexRef.current = 0;
    setScenarioIndex(0);
    setLatestChoice(null);
    setFinalResult(null);
    setSelectedPathway(null);
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setGameState('PLAYING_SCENARIO');
  };

  // Resume an in-progress run without losing logged instincts
  const handleResumeGame = () => {
    soundEngine.playArcadeStep();
    stopGhostSpeech();
    setIsSpeakingQuestion(false);
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setGameState('PLAYING_SCENARIO');
  };

  // Keyboard handlers
  useEffect(() => {
    if (!isOpen || gameState !== 'PLAYING_SCENARIO') return;

    const handleKeyDown = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        keysRef.current.up = true;
        e.preventDefault();
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        keysRef.current.down = true;
        e.preventDefault();
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        keysRef.current.left = true;
        e.preventDefault();
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        keysRef.current.right = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.down = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysRef.current = { up: false, down: false, left: false, right: false };
    };
  }, [isOpen, gameState]);

  // Zone collision logic — continuously syncs EVERY portal choice to the Soul Dossier!
  const handleZoneHit = useCallback((zone) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    stopGhostSpeech();
    setIsSpeakingQuestion(false);
    setLatestChoice(zone);
    soundEngine.playArcadePortalWarp(zone.trait);

    const currentIdx = scenarioIndexRef.current;
    const activeScenario = ASSESSMENT_SCENARIOS[currentIdx] || ASSESSMENT_SCENARIOS[0];
    const currentScores = traitScoresRef.current;
    const nextScores = {
      ...currentScores,
      [zone.trait]: (currentScores[zone.trait] || 0) + 1
    };
    traitScoresRef.current = nextScores;
    setTraitScores(nextScores);

    const choiceRecord = {
      scenarioId: activeScenario.id,
      scenarioTitle: (activeScenario.scenario || '').split(':')[0]?.trim() || `Scenario ${activeScenario.id}`,
      scenario: activeScenario.scenario,
      choiceText: zone.text,
      trait: zone.trait,
      position: zone.position
    };
    const nextChoices = [
      ...choicesHistoryRef.current.filter((c) => c.scenarioId !== activeScenario.id),
      choiceRecord
    ].sort((a, b) => a.scenarioId - b.scenarioId);
    choicesHistoryRef.current = nextChoices;
    setLoggedChoicesCount(nextChoices.length);

    // Real-time Soul Dossier sync for EVERY single portal hit
    if (onScenarioChoiceRef.current) {
      onScenarioChoiceRef.current({
        ...choiceRecord,
        scores: nextScores,
        isNewRun: currentIdx === 0
      });
    }

    setTimeout(() => {
      if (currentIdx < ASSESSMENT_SCENARIOS.length - 1) {
        const nextIdx = currentIdx + 1;
        scenarioIndexRef.current = nextIdx;
        setScenarioIndex(nextIdx);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      } else {
        // All 10 questions complete: calculate final results and auto-sync into Soul Dossier
        const finalArchetype = calculateArchetypeResult(nextScores);
        setFinalResult(finalArchetype);
        setGameState('END_SCREEN');
        soundEngine.playArcadeUnlockFanfare();
        if (onGameCompleteRef.current) {
          onGameCompleteRef.current(finalArchetype, nextChoices);
        }
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      }
    }, 350);
  }, []);

  const handleTouchDirection = (dir, isDown) => {
    if (dir === 'up') keysRef.current.up = isDown;
    if (dir === 'down') keysRef.current.down = isDown;
    if (dir === 'left') keysRef.current.left = isDown;
    if (dir === 'right') keysRef.current.right = isDown;
  };

  // Select or toggle a Recommended Pathway card and immediately update Soul Dossier
  const handlePathwayClick = (card, isAlreadySelected) => {
    soundEngine.playClickSound();
    const nextPathway = isAlreadySelected ? null : card;
    setSelectedPathway(nextPathway);
    onSelectPathway?.(nextPathway);
  };

  // Sync to Chat + Soul Dossier & Close
  const handleSyncAndClose = () => {
    stopGhostSpeech();
    setIsSpeakingQuestion(false);
    if (finalResult && onSyncResult) {
      const syncedResult = selectedPathway
        ? {
            ...finalResult,
            selectedPathway,
            recommendedFields: finalResult.recommendedFields.includes(selectedPathway.name)
              ? finalResult.recommendedFields
              : `${selectedPathway.name}, ${finalResult.recommendedFields}`
          }
        : finalResult;
      onSyncResult(syncedResult);
    }
    onClose();
  };

  const handleClose = () => {
    stopGhostSpeech();
    setIsSpeakingQuestion(false);
    onClose();
  };

  if (!isOpen) return null;

  const hasInProgressRun =
    !finalResult && loggedChoicesCount > 0 && loggedChoicesCount < ASSESSMENT_SCENARIOS.length;
  const hasActiveChatDossier = Boolean(dossier && !dossier.isEmpty && dossier.hasChatActivity);
  const topDossierCard = dossier && !dossier.isEmpty ? dossier.careerCards?.[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[96vh] rounded-3xl border-2 border-purple-500/50 bg-[#0b0819] text-white shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col overflow-hidden">

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-3 bg-purple-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest uppercase text-purple-300">
              Crisis Simulator // 3D Career Assessment
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {gameState === 'PLAYING_SCENARIO' && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-400/30">
                  <Sparkles className="w-3 h-3" />
                  <span>DOSSIER SYNC: {loggedChoicesCount}/10</span>
                </span>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-900/60 text-purple-200 border border-purple-400/30">
                  SCENARIO {String(safeIndex + 1).padStart(2, '0')} / 10
                </span>
              </>
            )}
            <button
              onClick={handleClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Assessment"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PROMINENT FIXED QUESTION BANNER WITH VOICE READ-OUT CONTROLS */}
        {gameState === 'PLAYING_SCENARIO' && (
          <div className="border-b-2 border-purple-500/40 bg-gradient-to-b from-[#1e0a3a] via-[#140728] to-[#0d041a] px-4 sm:px-6 py-3.5 text-center shrink-0 shadow-lg z-20">
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="font-mono text-xs font-black tracking-widest text-amber-300 uppercase">
                CRISIS QUESTION {safeIndex + 1} OF 10
              </span>

              {/* Speaker Voice Read-Out Button */}
              <button
                type="button"
                onClick={handleToggleReadQuestion}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  isSpeakingQuestion
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse'
                    : 'bg-purple-900/70 text-purple-200 border border-purple-400/50 hover:bg-purple-800 hover:text-white'
                }`}
                title={isSpeakingQuestion ? 'Stop voice read-out' : 'Read crisis question aloud'}
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeakingQuestion ? 'animate-bounce text-slate-950' : 'text-amber-300'}`} />
                <span>{isSpeakingQuestion ? 'Reading Aloud...' : 'Read Aloud 🔊'}</span>
              </button>

              {/* Auto-Read Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (autoVoiceNarration && isSpeakingQuestion) {
                    stopGhostSpeech();
                    setIsSpeakingQuestion(false);
                  }
                  setAutoVoiceNarration((prev) => !prev);
                }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                  autoVoiceNarration
                    ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300 font-semibold'
                    : 'border-white/10 bg-white/5 text-slate-400'
                }`}
                title="Toggle automatic voice read-out when scenario changes"
              >
                Auto-Read: {autoVoiceNarration ? 'ON' : 'OFF'}
              </button>
            </div>

            <p className="font-sans normal-case text-xs sm:text-sm md:text-[15px] font-semibold text-white leading-snug max-w-4xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {currentScenario.scenario}
            </p>
          </div>
        )}

        {/* Modal Body: State Machine Rendering */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center justify-start">

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STATE 1: START SCREEN */}
          {/* ══════════════════════════════════════════════════════════ */}
          {gameState === 'START_SCREEN' && (
            <div className="w-full max-w-2xl flex flex-col items-center text-center py-4 space-y-5 animate-fade-in">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-purple-400/40 bg-purple-950/40 text-purple-300 text-xs font-mono font-medium">
                <span>FULL 3D ARCADE GAME // 10 REAL-LIFE CRISES</span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                  CRISIS SIMULATOR 3D
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
                  Ditch the boring multi-choice survey. Steer your 3D spectral avatar into the portal that reflects your instant gut instinct when things get cooked. Every decision updates your Soul Dossier in real time.
                </p>
              </div>

              {/* Active Soul Dossier Context Banner (Strictly no dimension spoilers!) */}
              {hasActiveChatDossier && (
                <div className="w-full rounded-2xl border border-lime-400/35 bg-lime-950/25 px-4 py-3 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-lime-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Linked to Your Active Soul Dossier</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {soulProfile?.constraints?.needMoneyNow
                        ? 'Calibrating your 3D instincts alongside your immediate-earning priority'
                        : soulProfile?.passions?.length > 0
                        ? `Calibrating alongside your chat passions (${soulProfile.passions.slice(0, 2).join(', ')})`
                        : `Synced with ${dossier.chatTurnCount} Counselor Chat exchanges`}
                      {topDossierCard ? ` • Leading match: ${topDossierCard.careerTitle}` : ''}.
                    </p>
                  </div>
                  {onOpenDossier && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onOpenDossier();
                      }}
                      className="shrink-0 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 font-mono text-[11px] font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 transition"
                    >
                      Inspect Dossier 📜
                    </button>
                  )}
                </div>
              )}

              {/* Existing Completed Run Banner */}
              {finalResult && (
                <div className="w-full rounded-2xl border border-amber-400/40 bg-amber-950/25 px-4 py-3 text-left flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Synced Archetype in Soul Dossier
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {finalResult.badge} {finalResult.title}
                      {selectedPathway ? ` • ${selectedPathway.name}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGameState('END_SCREEN')}
                    className="rounded-xl border border-amber-400/50 bg-amber-400/20 px-3 py-1.5 font-mono text-xs font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 transition"
                  >
                    View Results &amp; Pathways
                  </button>
                </div>
              )}

              {/* Visual Icon-Driven Mystery Cards (Rule 5: NEVER expose dimension labels before completion!) */}
              <div className="w-full space-y-2.5">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 font-bold tracking-wider uppercase">
                  <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>4 Secret Archetypes — Play to Unlock Yours</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  {[
                    {
                      id: '01',
                      icon: '🔨',
                      border: 'border-red-500/40 hover:border-red-400',
                      bg: 'from-red-950/35 to-slate-950/90',
                      glow: 'hover:shadow-[0_0_24px_rgba(239,68,68,0.3)]',
                      ring: 'border-red-400/50 bg-red-500/10 shadow-[0_0_18px_rgba(239,68,68,0.25)]',
                      accent: 'text-red-400',
                      bar: 'bg-red-400'
                    },
                    {
                      id: '02',
                      icon: '📐',
                      border: 'border-blue-500/40 hover:border-blue-400',
                      bg: 'from-blue-950/35 to-slate-950/90',
                      glow: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]',
                      ring: 'border-blue-400/50 bg-blue-500/10 shadow-[0_0_18px_rgba(59,130,246,0.25)]',
                      accent: 'text-blue-400',
                      bar: 'bg-blue-400'
                    },
                    {
                      id: '03',
                      icon: '⚡',
                      border: 'border-yellow-500/40 hover:border-yellow-400',
                      bg: 'from-yellow-950/35 to-slate-950/90',
                      glow: 'hover:shadow-[0_0_24px_rgba(234,179,8,0.3)]',
                      ring: 'border-yellow-400/50 bg-yellow-500/10 shadow-[0_0_18px_rgba(234,179,8,0.25)]',
                      accent: 'text-yellow-400',
                      bar: 'bg-yellow-400'
                    },
                    {
                      id: '04',
                      icon: '🔮',
                      border: 'border-purple-500/40 hover:border-purple-400',
                      bg: 'from-purple-950/35 to-slate-950/90',
                      glow: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.3)]',
                      ring: 'border-purple-400/50 bg-purple-500/10 shadow-[0_0_18px_rgba(168,85,247,0.25)]',
                      accent: 'text-purple-400',
                      bar: 'bg-purple-400'
                    }
                  ].map((card) => (
                    <div
                      key={card.id}
                      className={`group relative py-4 px-3 rounded-2xl border bg-gradient-to-b ${card.border} ${card.bg} ${card.glow} transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center`}
                    >
                      <div className={`relative w-14 h-14 rounded-full border-2 border-dashed ${card.ring} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <span className="text-2xl blur-[5px] opacity-50 select-none">
                          {card.icon}
                        </span>
                        <span className={`absolute font-mono text-xl font-black ${card.accent} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`}>
                          ?
                        </span>
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow">
                          <Lock className={`w-2.5 h-2.5 ${card.accent} group-hover:animate-bounce`} />
                        </span>
                      </div>

                      <div className={`mt-3 font-mono text-sm font-black tracking-widest ${card.accent}`}>
                        ???
                      </div>

                      <div className="mt-2 flex items-center gap-1">
                        <span className={`w-3 h-1 rounded-full ${card.bar} opacity-80`} />
                        <span className={`w-3 h-1 rounded-full ${card.bar} opacity-40`} />
                        <span className="w-3 h-1 rounded-full bg-white/15" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 w-full text-xs text-slate-300 flex items-center justify-center gap-4">
                <span className="font-mono text-purple-300 font-semibold">CONTROLS:</span>
                <span><strong>Click / Tap</strong> any portal (or use <strong>WASD / Arrow Keys</strong>) to glide your 3D ghost into your choice.</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                {hasInProgressRun && (
                  <button
                    onClick={handleResumeGame}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono font-black text-sm tracking-wider uppercase hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Resume Simulation (Q{safeIndex + 1}/10)</span>
                  </button>
                )}

                <button
                  onClick={handleStartGame}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-mono font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {hasInProgressRun
                    ? 'Restart Fresh Simulation'
                    : finalResult
                    ? 'Replay 3D Simulation'
                    : 'Insert Ecto-Coin & Start 3D Simulation'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STATE 2: PLAYING SCENARIO */}
          {/* ══════════════════════════════════════════════════════════ */}
          {gameState === 'PLAYING_SCENARIO' && (
            <div className="w-full flex flex-col items-center space-y-2">
              {/* 3D WebGL Career Assessment Arena */}
              <div className="relative w-full max-w-3xl aspect-[760/520] max-h-[58vh] sm:max-h-[62vh] rounded-2xl border-2 border-purple-500/50 bg-slate-950 overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.9)] mx-auto">
                <ArcadeAssessment3DCanvas
                  scenario={currentScenario}
                  scenarioIndex={safeIndex}
                  onZoneHit={handleZoneHit}
                  isTransitioning={isTransitioning}
                  keysRef={keysRef}
                />
              </div>

              {/* Bottom Steering + Live Non-Spoiling Soul Dossier Sync Indicator */}
              <div className="pt-1 flex flex-col items-center gap-1 text-center">
                <div className="text-[11px] sm:text-xs font-mono text-purple-200/90 font-medium">
                  Steer your 3D avatar into the portal matching your choice! <strong className="text-amber-300 font-bold">Click / Tap</strong> any portal or use <strong className="text-amber-300 font-bold">WASD / Arrow Keys</strong> to move.
                </div>
                {latestChoice && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-950/40 px-3 py-0.5 text-[10px] font-mono text-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>
                      Synced to Soul Dossier ({loggedChoicesCount}/10): “{latestChoice.text}”
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Mobile Controls (Touch D-Pad) */}
              <div className="w-full max-w-3xl flex sm:hidden items-center justify-center pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onPointerDown={() => handleTouchDirection('left', true)}
                    onPointerUp={() => handleTouchDirection('left', false)}
                    className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 active:bg-purple-600"
                    aria-label="Move Left"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onPointerDown={() => handleTouchDirection('up', true)}
                      onPointerUp={() => handleTouchDirection('up', false)}
                      className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 active:bg-purple-600"
                      aria-label="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onPointerDown={() => handleTouchDirection('down', true)}
                      onPointerUp={() => handleTouchDirection('down', false)}
                      className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 active:bg-purple-600"
                      aria-label="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onPointerDown={() => handleTouchDirection('right', true)}
                    onPointerUp={() => handleTouchDirection('right', false)}
                    className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 active:bg-purple-600"
                    aria-label="Move Right"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STATE 3: END SCREEN (LOOT DROP / CHARACTER UNLOCK) */}
          {/* ══════════════════════════════════════════════════════════ */}
          {gameState === 'END_SCREEN' && finalResult && (
            <div className="w-full max-w-2xl flex flex-col items-center text-center py-4 space-y-5 animate-scale-up">
              {/* Unlock Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-950/40 text-amber-300 text-xs font-mono font-bold tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>CHARACTER UNLOCKED // SYNCED TO SOUL DOSSIER</span>
              </div>

              {/* Title & Badge */}
              <div>
                <div className="text-4xl mb-2">{finalResult.badge}</div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                  {finalResult.title}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-purple-200 italic max-w-lg mx-auto">
                  “{finalResult.tagline}”
                </p>
              </div>

              {/* Trait Breakdown Card */}
              <div className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-purple-300 font-bold border-b border-white/10 pb-2">
                  <span>DIMENSION SCORE BREAKDOWN</span>
                  <span>CHOICES / 10</span>
                </div>

                <div className="space-y-2">
                  {Object.entries(finalResult.scores).map(([trait, count]) => {
                    const prof = ARCHETYPE_PROFILES[trait];
                    const percent = (count / 10) * 100;
                    return (
                      <div key={trait} className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-20 font-semibold text-slate-300">{trait}:</span>
                        <div className="flex-1 h-3 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: prof?.color || '#a855f7'
                            }}
                          />
                        </div>
                        <span className="w-20 whitespace-nowrap text-right font-bold text-white">{count} ({percent}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Archetype Description & Card-Based Recommended Pathways */}
              <div className="w-full p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 text-left space-y-3">
                <div className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                  Spectral Career Alignment
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {finalResult.description}
                </p>

                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                      Recommended Pathways
                    </span>
                    <span className="text-[11px] font-mono text-amber-200">
                      {selectedPathway
                        ? `Locked to Dossier: ${selectedPathway.name}`
                        : 'Click a card to prioritize in your Soul Dossier'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(finalResult.pathwayCards && finalResult.pathwayCards.length > 0
                      ? finalResult.pathwayCards
                      : (finalResult.recommendedFields || '')
                          .split(',')
                          .map((f) => ({ icon: '✨', name: f.trim(), subtitle: 'Recommended career track' }))
                    ).map((card, idx) => {
                      const isSelected = selectedPathway?.name === card.name;
                      return (
                        <button
                          key={`${card.name}-${idx}`}
                          type="button"
                          onClick={() => handlePathwayClick(card, isSelected)}
                          className={`group p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(251,191,36,0.28)] -translate-y-0.5'
                              : 'border-purple-500/30 bg-slate-950/70 hover:border-purple-400/70 hover:bg-purple-900/30 hover:-translate-y-0.5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xl">{card.icon}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                              )}
                            </div>
                            <div className="mt-2 font-mono text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                              {card.name}
                            </div>
                            {card.subtitle && (
                              <div className="mt-1 text-[11px] text-slate-400 leading-snug">
                                {card.subtitle}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Synced Soul Dossier Top Match Preview */}
              {topDossierCard && (
                <div className="w-full p-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-950/35 via-purple-950/40 to-amber-950/35 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      <ScrollText className="w-3.5 h-3.5" />
                      <span>Live Soul Dossier #1 Tarot Arcana Match</span>
                    </div>
                    <div className="mt-1 text-sm sm:text-base font-bold text-white">
                      {topDossierCard.careerTitle}{' '}
                      <span className="text-emerald-300 font-mono text-xs">
                        ({topDossierCard.matchPercent}% Match • {topDossierCard.salaryRange})
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-purple-200/85">
                      {hasActiveChatDossier
                        ? 'Combined with your Career Counselor Chat constraints & discoveries.'
                        : 'Ready in your Soul Dossier — discuss with your Ghost Counselor to refine with real-world constraints!'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-1">
                <button
                  onClick={handleStartGame}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-purple-200 font-mono text-xs font-bold hover:bg-purple-900/60 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay Simulation</span>
                </button>

                <button
                  onClick={handleSyncAndClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white font-mono text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Sync to Chat &amp; Open Soul Dossier</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
