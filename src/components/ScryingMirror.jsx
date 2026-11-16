import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Sparkles, AlertCircle, HeartHandshake, Eye, EyeOff } from 'lucide-react';
import { getFaceLandmarker, calculateFacialBiometrics } from '../services/faceLandmarkerService';
import { soundEngine } from '../utils/soundEffects';

export default function ScryingMirror({
  isActive,
  onToggleActive,
  onVibeChange,
  onAutoSubmitVibe,
  isThinking = false
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAutoSubmitEnabled, setIsAutoSubmitEnabled] = useState(true);
  const [justNoticedVibe, setJustNoticedVibe] = useState(null);

  // Live real-time biometric telemetry
  const [biometrics, setBiometrics] = useState({
    stressScore: 0,
    confusionScore: 0,
    browTension: 0,
    mouthCurvature: 0,
    eyeContactScore: 100,
    isAvoidingEyeContact: false,
    isFrustrated: false,
    isAnxious: false,
    isDistressed: false,
    stateLabel: 'Attuning mirror...',
    stateEmoji: '✨',
    stateColor: '#38bdf8',
    description: 'Looking into the scrying mirror'
  });

  // Fresh references for real-time loop
  const isThinkingRef = useRef(isThinking);
  isThinkingRef.current = isThinking;

  const onAutoSubmitVibeRef = useRef(onAutoSubmitVibe);
  onAutoSubmitVibeRef.current = onAutoSubmitVibe;

  const isAutoSubmitEnabledRef = useRef(isAutoSubmitEnabled);
  isAutoSubmitEnabledRef.current = isAutoSubmitEnabled;

  const onVibeChangeRef = useRef(onVibeChange);
  onVibeChangeRef.current = onVibeChange;

  // Auto-submit stability & cooldown tracking
  const candidateStateRef = useRef(null);
  const candidateCountRef = useRef(0);
  const lastSubmittedStateRef = useRef('neutral');
  const lastAutoSubmitTimeRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;
    let faceLandmarker = null;

    async function startCameraAndTracking() {
      if (!isActive) return;
      setIsLoading(true);
      setError(null);
      candidateStateRef.current = null;
      candidateCountRef.current = 0;
      lastSubmittedStateRef.current = 'neutral';
      lastAutoSubmitTimeRef.current = Date.now();

      try {
        // 1. Initialize MediaPipe Face Landmarker
        faceLandmarker = await getFaceLandmarker();
        if (isCancelled) return;

        // 2. Request webcam video stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: false
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setIsLoading(false);

        // 3. Real-time frame analysis loop using MediaPipe Face Landmarker
        const processFrame = () => {
          if (isCancelled) return;

          const video = videoRef.current;
          if (video && video.readyState >= 2 && !video.paused && !video.ended) {
            try {
              if (video.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = video.currentTime;

                const detectionResult = faceLandmarker.detectForVideo(
                  video,
                  performance.now()
                );

                const data = calculateFacialBiometrics(detectionResult);
                if (data) {
                  setBiometrics(data);

                  if (onVibeChangeRef.current) {
                    onVibeChangeRef.current(data);
                  }

                  // ── AUTO-REACT WHEN DISTRESS (FRUSTRATION / ANXIETY / AVOIDING EYE CONTACT) IS DETECTED ──
                  if (
                    isAutoSubmitEnabledRef.current &&
                    onAutoSubmitVibeRef.current &&
                    !isThinkingRef.current
                  ) {
                    const currentState = data.isDistressed
                      ? (data.isAvoidingEyeContact ? 'avoiding_eye_contact' : data.isFrustrated ? 'frustrated' : 'anxious')
                      : data.stateLabel;

                    if (candidateStateRef.current === currentState) {
                      candidateCountRef.current += 1;
                    } else {
                      candidateStateRef.current = currentState;
                      candidateCountRef.current = 1;
                    }

                    // Must hold the distress or expression stably for ~1.2 seconds (~12 frames at 100ms)
                    if (candidateCountRef.current >= 8) {
                      const now = Date.now();
                      const isDifferent = currentState !== lastSubmittedStateRef.current;
                      const cooledDown = now - lastAutoSubmitTimeRef.current > 5000;

                      if (isDifferent && cooledDown && data.isDistressed) {
                        lastSubmittedStateRef.current = currentState;
                        lastAutoSubmitTimeRef.current = now;

                        soundEngine.playCalmingTone();
                        setJustNoticedVibe(data);
                        setTimeout(() => setJustNoticedVibe(null), 3500);

                        onAutoSubmitVibeRef.current(data);
                      }
                    }
                  }
                }
              }
            } catch {
              // Ignore single frame glitch
            }
          }

          // Run at ~15-20 fps to conserve CPU / GPU
          setTimeout(() => {
            if (!isCancelled) {
              animFrameIdRef.current = requestAnimationFrame(processFrame);
            }
          }, 60);
        };

        animFrameIdRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        if (!isCancelled) {
          console.warn('MediaPipe Scrying Mirror camera error:', err);
          setError(
            err.name === 'NotAllowedError'
              ? 'Webcam permission denied in browser.'
              : 'Could not access webcam or load MediaPipe Face Landmarker.'
          );
          setIsLoading(false);
          if (onToggleActive) onToggleActive(false);
        }
      }
    }

    if (isActive) {
      startCameraAndTracking();
    } else {
      stopCamera();
    }

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isActive]);

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Active Video Portal */}
      {isActive && (
        <div className="relative mb-2 flex flex-col items-center animate-fadeIn">
          {/* Gothic Spectral Frame with Biometric State Glow */}
          <div
            className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full p-[2px] transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${biometrics.stateColor}bb, rgba(168,85,247,0.7), ${biometrics.stateColor}44)`,
              boxShadow: `0 0 25px ${biometrics.stateColor}55`
            }}
          >
            <div className="relative h-full w-full rounded-full overflow-hidden bg-slate-950 border border-white/20">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-2 z-20">
                  <Sparkles className="h-4 w-4 text-cyan-300 animate-spin" />
                  <span className="font-mono text-[9px] text-cyan-200 mt-1">
                    Attuning MediaPipe...
                  </span>
                </div>
              )}

              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Spectral Vignette Overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    'inset 0 0 16px rgba(15, 23, 42, 0.8), inset 0 0 6px rgba(255, 255, 255, 0.2)'
                }}
              />
            </div>

            {/* Glowing Live Dot */}
            <div
              className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 animate-pulse"
              style={{
                backgroundColor: biometrics.stateColor,
                boxShadow: `0 0 10px ${biometrics.stateColor}`
              }}
            />
          </div>

          {/* Live Vibe Chip */}
          <div
            className="mt-1.5 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border backdrop-blur-md transition-all duration-300"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              borderColor: `${biometrics.stateColor}66`,
              color: biometrics.stateColor,
              boxShadow: `0 0 12px ${biometrics.stateColor}25`
            }}
          >
            <span>{biometrics.stateEmoji}</span>
            <span className="tracking-wide uppercase">{biometrics.stateLabel}</span>
          </div>

          {/* Real-Time Stress & Eye Contact Telemetry Bar */}
          <div className="mt-1 flex items-center gap-2 px-2 py-0.5 rounded-md bg-slate-950/80 border border-white/10 text-[9px] font-mono">
            {/* Stress meter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Stress:</span>
              <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${biometrics.stressScore}%`,
                    backgroundColor:
                      biometrics.stressScore > 50
                        ? '#f87171'
                        : biometrics.stressScore > 25
                        ? '#fbbf24'
                        : '#4ade80'
                  }}
                />
              </div>
              <span
                className={`font-bold ${
                  biometrics.stressScore > 40 ? 'text-rose-300' : 'text-slate-300'
                }`}
              >
                {biometrics.stressScore}%
              </span>
            </div>

            <span className="text-white/20">|</span>

            {/* Eye contact or mouth curvature status */}
            <div className="flex items-center gap-1">
              {biometrics.isAvoidingEyeContact ? (
                <span className="flex items-center gap-0.5 text-purple-300">
                  <EyeOff className="h-3 w-3" /> Gaze Away
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-cyan-300">
                  <Eye className="h-3 w-3" /> Engaged
                </span>
              )}
            </div>
          </div>

          {/* Micro telemetry: Eyebrows & Mouth curvature readout */}
          <div className="mt-0.5 flex items-center gap-1.5 text-[8px] font-mono text-slate-400">
            <span>
              Brows:{' '}
              <strong className="text-slate-200">
                {biometrics.browTension > 0.22 ? 'Furrowed' : 'Relaxed'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Mouth:{' '}
              <strong className="text-slate-200">
                {biometrics.mouthCurvature < -0.15
                  ? 'Frown 🙁'
                  : biometrics.mouthCurvature > 0.15
                  ? 'Smile 🙂'
                  : 'Neutral 😐'}
              </strong>
            </span>
          </div>

          {/* Distress Detected Glow Toast */}
          {justNoticedVibe && (
            <div className="mt-1 flex items-center gap-1.5 rounded-full bg-cyan-950/95 border border-cyan-400/90 px-3 py-1 text-[10px] font-mono text-cyan-200 animate-bounce shadow-[0_0_15px_rgba(34,211,238,0.6)]">
              <HeartHandshake className="h-3.5 w-3.5 text-cyan-300" />
              <span>Ghost noticed distress 🕊️ Softening voice...</span>
            </div>
          )}
        </div>
      )}

      {/* Error banner if permission denied */}
      {error && (
        <div className="mb-2 max-w-[220px] rounded-xl border border-rose-500/40 bg-rose-950/60 p-2 text-center text-[10px] text-rose-200">
          <AlertCircle className="mx-auto mb-1 h-3.5 w-3.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Camera Toggle Pill */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onToggleActive(!isActive)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
            isActive
              ? 'border border-cyan-400/50 bg-cyan-950/50 text-cyan-200 hover:bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-white'
          }`}
          title={isActive ? 'Turn off webcam mirror' : 'Turn on webcam mirror to detect expressions with MediaPipe'}
        >
          {isActive ? (
            <>
              <CameraOff className="h-3.5 w-3.5 text-cyan-400" />
              <span>Scrying Mirror: ON</span>
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5 text-amber-300" />
              <span>Enable Scrying Mirror</span>
            </>
          )}
        </button>

        {isActive && (
          <button
            type="button"
            onClick={() => setIsAutoSubmitEnabled(!isAutoSubmitEnabled)}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-mono font-semibold transition ${
              isAutoSubmitEnabled
                ? 'border border-emerald-400/60 bg-emerald-950/60 text-emerald-200 shadow-[0_0_10px_rgba(74,222,128,0.3)]'
                : 'border border-white/10 bg-slate-900/70 text-slate-400 hover:text-white'
            }`}
            title="Automatically comfort when distress, anxiety, or gaze avoidance is detected"
          >
            <span>{isAutoSubmitEnabled ? '⚡ Auto-Comfort: ON' : '⏸️ Auto-Comfort: OFF'}</span>
          </button>
        )}
      </div>

      {/* Privacy guarantee micro-text */}
      {isActive && (
        <span className="mt-1 text-[8px] font-mono text-slate-400 select-none">
          🔒 100% Free & Local (MediaPipe on-device Face Landmarker)
        </span>
      )}
    </div>
  );
}
