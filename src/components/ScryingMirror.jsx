import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Sparkles,
  AlertCircle,
  HeartHandshake,
  Eye,
  EyeOff,
  RotateCcw,
  ScanFace,
  Sliders
} from 'lucide-react';
import {
  getFaceLandmarker,
  resetFaceLandmarker,
  getNextVideoTimestampMs,
  calculateFacialBiometrics,
  requestWebcamStream,
  queryCameraPermissionState
} from '../services/faceLandmarkerService';
import { soundEngine } from '../utils/soundEffects';

// Key MediaPipe FaceMesh landmark indices for subtle spectral tracking overlay
const LEFT_BROW = [70, 63, 105, 66, 107];
const RIGHT_BROW = [336, 296, 334, 293, 300];
const OUTER_LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];
const EYE_POINTS = [33, 133, 159, 145, 362, 263, 386, 374];

const INITIAL_BIOMETRICS = {
  faceDetected: false,
  stressScore: 0,
  confusionScore: 0,
  browTension: 0,
  browState: 'Relaxed',
  mouthCurvature: 0,
  mouthState: 'Neutral 😐',
  eyeContactScore: 100,
  isAvoidingEyeContact: false,
  isFrustrated: false,
  isAnxious: false,
  isDistressed: false,
  stateLabel: 'Attuning mirror...',
  stateEmoji: '✨',
  stateColor: '#38bdf8',
  description: 'Initializing local MediaPipe Face Landmarker'
};

// Camera-free Manual Vibe presets (used ONLY if the user chooses Manual Vibe Mode when camera is blocked)
const MANUAL_VIBE_PRESETS = [
  {
    id: 'smiling',
    short: 'Smiling',
    emoji: '✨',
    color: '#4ade80',
    data: {
      faceDetected: true,
      stressScore: 8,
      confusionScore: 5,
      browTension: 0.05,
      browState: 'Relaxed',
      mouthCurvature: 0.55,
      mouthState: 'Smiling 🙂',
      eyeContactScore: 95,
      isAvoidingEyeContact: false,
      isFrustrated: false,
      isAnxious: false,
      isDistressed: false,
      stateLabel: 'Smiling & Energized',
      stateEmoji: '✨',
      stateColor: '#4ade80',
      description: 'Positive and optimistic'
    }
  },
  {
    id: 'focused',
    short: 'Focused',
    emoji: '👀',
    color: '#38bdf8',
    data: {
      faceDetected: true,
      stressScore: 14,
      confusionScore: 10,
      browTension: 0.1,
      browState: 'Relaxed',
      mouthCurvature: 0.04,
      mouthState: 'Neutral 😐',
      eyeContactScore: 96,
      isAvoidingEyeContact: false,
      isFrustrated: false,
      isAnxious: false,
      isDistressed: false,
      stateLabel: 'Locked In & Focused',
      stateEmoji: '👀',
      stateColor: '#38bdf8',
      description: 'Attentive and listening to the counselor'
    }
  },
  {
    id: 'puzzled',
    short: 'Puzzled',
    emoji: '🤔',
    color: '#38bdf8',
    data: {
      faceDetected: true,
      stressScore: 30,
      confusionScore: 52,
      browTension: 0.2,
      browState: 'Raised',
      mouthCurvature: -0.05,
      mouthState: 'Neutral 😐',
      eyeContactScore: 82,
      isAvoidingEyeContact: false,
      isFrustrated: false,
      isAnxious: false,
      isDistressed: true,
      stateLabel: 'Puzzled / Unsure',
      stateEmoji: '🤔',
      stateColor: '#38bdf8',
      description: 'Thinking through options'
    }
  },
  {
    id: 'anxious',
    short: 'Anxious',
    emoji: '⚡',
    color: '#fbbf24',
    data: {
      faceDetected: true,
      stressScore: 56,
      confusionScore: 44,
      browTension: 0.34,
      browState: 'Furrowed',
      mouthCurvature: -0.22,
      mouthState: 'Frowning 🙁',
      eyeContactScore: 70,
      isAvoidingEyeContact: false,
      isFrustrated: false,
      isAnxious: true,
      isDistressed: true,
      stateLabel: 'Anxious / Future Pressure',
      stateEmoji: '⚡',
      stateColor: '#fbbf24',
      description: 'Carrying heavy expectations'
    }
  },
  {
    id: 'frustrated',
    short: 'Stressed',
    emoji: '🔥',
    color: '#f87171',
    data: {
      faceDetected: true,
      stressScore: 68,
      confusionScore: 38,
      browTension: 0.48,
      browState: 'Furrowed',
      mouthCurvature: -0.34,
      mouthState: 'Frowning 🙁',
      eyeContactScore: 76,
      isAvoidingEyeContact: false,
      isFrustrated: true,
      isAnxious: false,
      isDistressed: true,
      stateLabel: 'Frustrated / Overwhelmed',
      stateEmoji: '🔥',
      stateColor: '#f87171',
      description: 'Feeling stressed or pressured'
    }
  },
  {
    id: 'gaze_away',
    short: 'Gaze Away',
    emoji: '🙈',
    color: '#c084fc',
    data: {
      faceDetected: true,
      stressScore: 52,
      confusionScore: 36,
      browTension: 0.28,
      browState: 'Furrowed',
      mouthCurvature: -0.18,
      mouthState: 'Frowning 🙁',
      eyeContactScore: 32,
      isAvoidingEyeContact: true,
      isFrustrated: false,
      isAnxious: true,
      isDistressed: true,
      stateLabel: 'Avoiding Eye Contact & Anxious',
      stateEmoji: '🙈',
      stateColor: '#c084fc',
      description: 'Feeling overwhelmed about what comes next'
    }
  }
];

function drawFacialOverlay(canvas, video, landmarks, accentColor) {
  if (!canvas || !video) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (!landmarks || landmarks.length === 0 || !video.videoWidth || !video.videoHeight) return;

  const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
  const drawW = video.videoWidth * scale;
  const drawH = video.videoHeight * scale;
  const offsetX = (w - drawW) / 2;
  const offsetY = (h - drawH) / 2;

  const pt = (idx) => {
    const lm = landmarks[idx];
    if (!lm) return null;
    return { x: offsetX + lm.x * drawW, y: offsetY + lm.y * drawH };
  };

  ctx.save();
  ctx.strokeStyle = accentColor || '#38bdf8';
  ctx.fillStyle = accentColor || '#38bdf8';
  ctx.shadowColor = accentColor || '#38bdf8';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.8;

  const drawPath = (indices) => {
    ctx.beginPath();
    let started = false;
    for (const idx of indices) {
      const p = pt(idx);
      if (!p) continue;
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  };

  drawPath(LEFT_BROW);
  drawPath(RIGHT_BROW);
  drawPath(OUTER_LIPS);

  for (const idx of EYE_POINTS) {
    const p = pt(idx);
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function getFriendlyCameraError(err, permState = 'unknown') {
  if (!err) {
    return {
      title: 'Mirror Unavailable',
      detail: 'Could not start webcam or MediaPipe Face Landmarker.'
    };
  }
  const name = err.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    if (permState === 'denied') {
      return {
        title: 'Camera Permission Blocked',
        detail:
          'Allow Camera in the browser address bar (or open http://localhost:5174/ in Chrome/Edge if using an embedded preview tab), then tap Retry.'
      };
    }
    return {
      title: 'Camera Access Denied',
      detail:
        'Grant Camera permission in your browser/Windows Privacy Settings (or open http://localhost:5174/ in Chrome/Edge), then tap Retry.'
    };
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      title: 'No Webcam Found',
      detail: 'Connect a webcam and tap Retry, or switch to Manual Vibe Mode below.'
    };
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return {
      title: 'Camera Busy in Another App',
      detail:
        'Another app (such as OBS Studio or Zoom) is holding your camera. Release it and tap Retry.'
    };
  }
  if (name === 'SecurityError') {
    return {
      title: 'Secure Origin Required',
      detail: 'Webcam access requires http://localhost or HTTPS.'
    };
  }
  return {
    title: 'Scrying Mirror Error',
    detail: err.message || 'Could not start webcam or MediaPipe Face Landmarker.'
  };
}

export default function ScryingMirror({
  isActive,
  onToggleActive,
  onVibeChange,
  onAutoSubmitVibe,
  initialStreamPromise = null,
  isThinking = false
}) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const loopTimeoutIdRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const noFaceFramesRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);
  const didRecoverRef = useRef(false);
  const consumedInitialPromiseRef = useRef(null);
  const retryStreamPromiseRef = useRef(null);

  const [trackingStatus, setTrackingStatus] = useState('initializing'); // 'initializing' | 'camera_ready' | 'no_face' | 'tracking' | 'error' | 'manual'
  const [errorInfo, setErrorInfo] = useState(null);
  const [retryTick, setRetryTick] = useState(0);
  const [isAutoSubmitEnabled, setIsAutoSubmitEnabled] = useState(true);
  const [isManualMode, setIsManualMode] = useState(false);
  const [justNoticedVibe, setJustNoticedVibe] = useState(null);
  const [biometrics, setBiometrics] = useState(INITIAL_BIOMETRICS);

  const isThinkingRef = useRef(isThinking);
  isThinkingRef.current = isThinking;

  const onAutoSubmitVibeRef = useRef(onAutoSubmitVibe);
  onAutoSubmitVibeRef.current = onAutoSubmitVibe;

  const isAutoSubmitEnabledRef = useRef(isAutoSubmitEnabled);
  isAutoSubmitEnabledRef.current = isAutoSubmitEnabled;

  const onVibeChangeRef = useRef(onVibeChange);
  onVibeChangeRef.current = onVibeChange;

  const candidateStateRef = useRef(null);
  const candidateCountRef = useRef(0);
  const lastSubmittedStateRef = useRef('neutral');
  const lastAutoSubmitTimeRef = useRef(0);

  const stopCamera = useCallback(() => {
    if (loopTimeoutIdRef.current) {
      clearTimeout(loopTimeoutIdRef.current);
      loopTimeoutIdRef.current = null;
    }
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
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopCamera();
      onVibeChangeRef.current?.(null);
      return;
    }
    if (isManualMode) {
      stopCamera();
      setTrackingStatus('manual');
      return;
    }

    let isCancelled = false;
    let faceLandmarker = null;
    let activeStreamPromise = null;

    async function startCameraAndTracking() {
      setTrackingStatus('initializing');
      setErrorInfo(null);
      setBiometrics(INITIAL_BIOMETRICS);
      candidateStateRef.current = null;
      candidateCountRef.current = 0;
      lastSubmittedStateRef.current = 'neutral';
      lastAutoSubmitTimeRef.current = 0;
      lastVideoTimeRef.current = -1;
      noFaceFramesRef.current = 0;
      consecutiveErrorsRef.current = 0;
      didRecoverRef.current = false;

      try {
        // Prefer the stream promise started synchronously inside the user's click gesture
        if (retryStreamPromiseRef.current) {
          activeStreamPromise = retryStreamPromiseRef.current;
          retryStreamPromiseRef.current = null;
        } else if (
          initialStreamPromise &&
          consumedInitialPromiseRef.current !== initialStreamPromise
        ) {
          consumedInitialPromiseRef.current = initialStreamPromise;
          activeStreamPromise = initialStreamPromise;
        } else {
          activeStreamPromise = requestWebcamStream();
        }

        const landmarkerPromise = getFaceLandmarker();
        const stream = await activeStreamPromise;

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          const videoEl = videoRef.current;
          videoEl.srcObject = stream;
          await new Promise((resolve) => {
            if (videoEl.readyState >= 1 && videoEl.videoWidth > 0) {
              resolve();
              return;
            }
            const onLoaded = () => {
              videoEl.removeEventListener('loadedmetadata', onLoaded);
              resolve();
            };
            videoEl.addEventListener('loadedmetadata', onLoaded);
            setTimeout(resolve, 1500);
          });
          await videoEl.play().catch(() => {});
        }

        if (isCancelled) return;
        setTrackingStatus('camera_ready');

        faceLandmarker = await landmarkerPromise;
        if (isCancelled) return;

        const processFrame = async () => {
          if (isCancelled) return;

          const video = videoRef.current;
          if (
            faceLandmarker &&
            video &&
            video.readyState >= 2 &&
            video.videoWidth > 0 &&
            video.videoHeight > 0 &&
            !video.paused &&
            !video.ended
          ) {
            try {
              if (video.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = video.currentTime;

                const timestampMs = getNextVideoTimestampMs();
                const detectionResult = faceLandmarker.detectForVideo(video, timestampMs);
                consecutiveErrorsRef.current = 0;

                const data = calculateFacialBiometrics(detectionResult);
                if (data) {
                  noFaceFramesRef.current = 0;
                  setTrackingStatus('tracking');
                  setBiometrics(data);
                  drawFacialOverlay(overlayCanvasRef.current, video, data.landmarks, data.stateColor);

                  if (onVibeChangeRef.current) {
                    onVibeChangeRef.current(data);
                  }

                  if (
                    isAutoSubmitEnabledRef.current &&
                    onAutoSubmitVibeRef.current &&
                    !isThinkingRef.current
                  ) {
                    const currentState = data.isDistressed
                      ? data.isAvoidingEyeContact
                        ? 'avoiding_eye_contact'
                        : data.isFrustrated
                        ? 'frustrated'
                        : 'anxious'
                      : 'calm';

                    if (candidateStateRef.current === currentState) {
                      candidateCountRef.current += 1;
                    } else {
                      candidateStateRef.current = currentState;
                      candidateCountRef.current = 1;
                    }

                    if (!data.isDistressed && candidateCountRef.current >= 6) {
                      // Reset once user returns to a calm state so future distress is detected again
                      lastSubmittedStateRef.current = 'neutral';
                    } else if (data.isDistressed && candidateCountRef.current >= 6) {
                      const now = Date.now();
                      const isDifferent = currentState !== lastSubmittedStateRef.current;
                      const cooledDown =
                        lastAutoSubmitTimeRef.current === 0 ||
                        now - lastAutoSubmitTimeRef.current > 8000;

                      if (isDifferent && cooledDown) {
                        lastSubmittedStateRef.current = currentState;
                        lastAutoSubmitTimeRef.current = now;

                        soundEngine.playCalmingTone();
                        setJustNoticedVibe(data);
                        setTimeout(() => setJustNoticedVibe(null), 4000);

                        onAutoSubmitVibeRef.current(data);
                      }
                    }
                  }
                } else {
                  drawFacialOverlay(overlayCanvasRef.current, video, null, '#94a3b8');
                  noFaceFramesRef.current += 1;
                  if (noFaceFramesRef.current >= 5) {
                    setTrackingStatus('no_face');
                    setBiometrics((prev) => ({
                      ...prev,
                      faceDetected: false,
                      stressScore: 0,
                      stateLabel: 'Show face to mirror',
                      stateEmoji: '🔍',
                      stateColor: '#94a3b8',
                      description: 'Center your face in the mirror to track expressions'
                    }));
                  }
                }
              }
            } catch (frameErr) {
              consecutiveErrorsRef.current += 1;
              console.warn('[ScryingMirror] Frame inference error:', frameErr);

              if (consecutiveErrorsRef.current >= 5 && !didRecoverRef.current) {
                didRecoverRef.current = true;
                consecutiveErrorsRef.current = 0;
                try {
                  resetFaceLandmarker();
                  faceLandmarker = await getFaceLandmarker({ preferGpu: false });
                } catch (recErr) {
                  if (!isCancelled) {
                    setTrackingStatus('error');
                    setErrorInfo(getFriendlyCameraError(recErr));
                    return;
                  }
                }
              } else if (consecutiveErrorsRef.current >= 10) {
                if (!isCancelled) {
                  setTrackingStatus('error');
                  setErrorInfo({
                    title: 'Tracking Paused',
                    detail: 'Repeated frame inference errors occurred. Tap Retry to restart.'
                  });
                  return;
                }
              }
            }
          }

          loopTimeoutIdRef.current = setTimeout(() => {
            if (!isCancelled) {
              animFrameIdRef.current = requestAnimationFrame(processFrame);
            }
          }, 70);
        };

        animFrameIdRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        if (!isCancelled) {
          console.warn('MediaPipe Scrying Mirror error:', err);
          const permState = await queryCameraPermissionState();
          if (!isCancelled) {
            setErrorInfo(getFriendlyCameraError(err, permState));
            setTrackingStatus('error');
          }
        }
      }
    }

    startCameraAndTracking();

    return () => {
      isCancelled = true;
      // Ensure any still-pending pre-acquired camera stream is cleanly released on unmount
      if (activeStreamPromise) {
        activeStreamPromise
          .then((s) => {
            if (s && s !== streamRef.current) {
              s.getTracks().forEach((t) => t.stop());
            }
          })
          .catch(() => {});
      }
      stopCamera();
    };
  }, [isActive, isManualMode, retryTick, initialStreamPromise, stopCamera]);

  // Synchronously invoke getUserMedia inside the click gesture on Retry!
  const handleRetryCamera = () => {
    soundEngine.playClickSound();
    stopCamera();
    resetFaceLandmarker();
    setErrorInfo(null);
    setIsManualMode(false);
    const nextStreamPromise = requestWebcamStream();
    nextStreamPromise.catch(() => {});
    retryStreamPromiseRef.current = nextStreamPromise;
    setRetryTick((t) => t + 1);
  };

  const handleEnterManualMode = () => {
    soundEngine.playClickSound();
    stopCamera();
    setErrorInfo(null);
    setIsManualMode(true);
    const defaultPreset = MANUAL_VIBE_PRESETS[1].data; // Focused
    setBiometrics(defaultPreset);
    onVibeChange?.(defaultPreset);
  };

  const handlePickManualVibe = (preset) => {
    soundEngine.playClickSound();
    setBiometrics(preset.data);
    onVibeChange?.(preset.data);
    if (preset.data.isDistressed) {
      soundEngine.playCalmingTone();
    }
    if (!isThinking && onAutoSubmitVibe) {
      setJustNoticedVibe(preset.data);
      setTimeout(() => setJustNoticedVibe(null), 2800);
      onAutoSubmitVibe(preset.data);
    }
  };

  const handleManualCheckVibe = () => {
    if (!biometrics.faceDetected || isThinking || !onAutoSubmitVibe) return;
    soundEngine.playClickSound();
    setJustNoticedVibe(biometrics);
    setTimeout(() => setJustNoticedVibe(null), 2800);
    onAutoSubmitVibe(biometrics);
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-purple-400/40 bg-[#0d041c]/90 p-2 shadow-[0_0_24px_rgba(168,85,247,0.3)] backdrop-blur-xl w-[184px] sm:w-[200px] animate-fadeIn">
      {/* Compact Header */}
      <div className="w-full flex items-center justify-between mb-1 px-0.5">
        <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300">
          <ScanFace className="h-3 w-3" />
          <span>{isManualMode ? 'Vibe Mirror' : 'Scrying Mirror'}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClickSound();
            stopCamera();
            onVibeChange?.(null);
            onToggleActive?.(false);
          }}
          className="rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
          title="Turn off Scrying Mirror"
        >
          OFF ✕
        </button>
      </div>

      {/* Camera-Free Manual Vibe Mode (when user selects fallback after camera block) */}
      {isManualMode ? (
        <div className="w-full flex flex-col items-center space-y-1.5">
          <div
            className="w-full rounded-xl border px-2 py-1 text-center font-mono text-[9.5px] font-bold"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderColor: `${biometrics.stateColor}66`,
              color: biometrics.stateColor
            }}
          >
            {biometrics.stateEmoji} {biometrics.stateLabel}
          </div>

          <div className="w-full flex items-center justify-between px-2 py-0.5 rounded-md bg-slate-950/90 border border-white/10 text-[9px] font-mono">
            <span className="text-slate-400">Stress:</span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
            <span className="font-bold text-slate-200">{biometrics.stressScore}%</span>
          </div>

          <div className="w-full grid grid-cols-2 gap-1">
            {MANUAL_VIBE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={isThinking}
                onClick={() => handlePickManualVibe(preset)}
                className="flex items-center justify-center gap-1 rounded-lg border border-purple-400/30 bg-purple-950/50 px-1.5 py-1 text-[9.5px] font-mono font-bold text-slate-100 hover:border-amber-300 hover:bg-purple-900/70 disabled:opacity-45 transition"
              >
                <span>{preset.emoji}</span>
                <span>{preset.short}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRetryCamera}
            className="w-full flex items-center justify-center gap-1 rounded-lg border border-cyan-400/40 bg-cyan-950/40 px-2 py-1 font-mono text-[9px] font-bold text-cyan-200 hover:bg-cyan-900/60 transition"
          >
            <Camera className="h-3 w-3" />
            <span>Try Live Webcam</span>
          </button>
        </div>
      ) : errorInfo ? (
        /* Clear Error Recovery Card (Never auto-unmounts!) */
        <div className="w-full rounded-xl border border-rose-500/45 bg-rose-950/55 p-2 text-center space-y-1.5">
          <AlertCircle className="mx-auto h-4 w-4 text-rose-400" />
          <div className="font-mono text-[10px] font-bold text-rose-200">{errorInfo.title}</div>
          <p className="text-[9.5px] leading-snug text-rose-100/90">{errorInfo.detail}</p>
          <div className="flex flex-col gap-1 pt-0.5">
            <button
              type="button"
              onClick={handleRetryCamera}
              className="w-full flex items-center justify-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 font-mono text-[9.5px] font-bold text-slate-950 hover:bg-amber-300 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry Webcam</span>
            </button>
            <button
              type="button"
              onClick={handleEnterManualMode}
              className="w-full flex items-center justify-center gap-1 rounded-lg border border-purple-400/50 bg-purple-950/70 px-2 py-1 font-mono text-[9.5px] font-bold text-purple-100 hover:bg-purple-800/80 transition"
            >
              <Sliders className="h-3 w-3 text-cyan-300" />
              <span>Manual Vibe Mode</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Circular Webcam Mirror + Live Spectral Landmark Canvas */}
          <div
            className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full p-[2px] transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${biometrics.stateColor}cc, rgba(168,85,247,0.75), ${biometrics.stateColor}44)`,
              boxShadow: `0 0 22px ${biometrics.stateColor}55`
            }}
          >
            <div className="relative h-full w-full rounded-full overflow-hidden bg-slate-950 border border-white/20">
              {trackingStatus === 'initializing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 text-center p-2 z-20">
                  <Sparkles className="h-4 w-4 text-cyan-300 animate-spin" />
                  <span className="font-mono text-[8.5px] text-cyan-200 mt-1">
                    Starting camera...
                  </span>
                </div>
              )}

              {trackingStatus === 'camera_ready' && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-slate-950/85 border border-cyan-400/40 px-2 py-0.5 font-mono text-[8px] text-cyan-200">
                  Loading AI model...
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

              {/* Real-time Eyebrow/Eye/Mouth Spectral Tracking Overlay */}
              <canvas
                ref={overlayCanvasRef}
                width={128}
                height={128}
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Spectral Vignette Overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    'inset 0 0 14px rgba(15, 23, 42, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.2)'
                }}
              />
            </div>

            {/* Live Status Pulse Dot */}
            <div
              className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 animate-pulse"
              style={{
                backgroundColor: biometrics.faceDetected ? biometrics.stateColor : '#94a3b8',
                boxShadow: `0 0 8px ${biometrics.faceDetected ? biometrics.stateColor : '#94a3b8'}`
              }}
              title={biometrics.faceDetected ? 'Face actively tracked' : 'Waiting for face'}
            />
          </div>

          {/* Live Vibe Chip */}
          <div
            className="mt-1.5 max-w-full flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-mono font-bold border backdrop-blur-md transition-all duration-300 truncate"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderColor: `${biometrics.stateColor}66`,
              color: biometrics.stateColor
            }}
          >
            <span>{biometrics.stateEmoji}</span>
            <span className="truncate uppercase">{biometrics.stateLabel}</span>
          </div>

          {/* Stress & Eye Contact Bar */}
          <div className="mt-1 w-full flex items-center justify-between gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/90 border border-white/10 text-[9px] font-mono">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Stress:</span>
              <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
                  biometrics.stressScore >= 38 ? 'text-rose-300' : 'text-slate-200'
                }`}
              >
                {biometrics.stressScore}%
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {!biometrics.faceDetected ? (
                <span className="text-slate-400">No Face</span>
              ) : biometrics.isAvoidingEyeContact ? (
                <span className="flex items-center gap-0.5 text-purple-300">
                  <EyeOff className="h-2.5 w-2.5" /> Away
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-cyan-300">
                  <Eye className="h-2.5 w-2.5" /> Gaze OK
                </span>
              )}
            </div>
          </div>

          {/* Eyebrows & Mouth Readout */}
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-slate-300">
            <span>
              Brows: <strong className="text-white">{biometrics.browState}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span>
              Mouth: <strong className="text-white">{biometrics.mouthState}</strong>
            </span>
          </div>

          {/* Distress / Vibe Toast */}
          {justNoticedVibe && (
            <div className="mt-1 w-full flex items-center justify-center gap-1 rounded-lg bg-cyan-950/95 border border-cyan-400/80 px-2 py-0.5 text-[9px] font-mono text-cyan-200 animate-pulse">
              <HeartHandshake className="h-3 w-3 text-cyan-300 shrink-0" />
              <span className="truncate">
                {justNoticedVibe.isDistressed ? 'Softening voice 🕊️' : 'Sent vibe to Ghost ✨'}
              </span>
            </div>
          )}

          {/* Controls: Auto-Comfort Toggle + Instant Read Vibe */}
          <div className="mt-1.5 w-full flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsAutoSubmitEnabled((prev) => !prev)}
              className={`flex-1 rounded-lg px-1.5 py-1 text-[9px] font-mono font-bold transition truncate ${
                isAutoSubmitEnabled
                  ? 'border border-emerald-400/60 bg-emerald-950/60 text-emerald-200'
                  : 'border border-white/15 bg-slate-900/70 text-slate-400 hover:text-white'
              }`}
              title="Automatically comfort when stress, furrowed brows, or gaze avoidance is detected"
            >
              {isAutoSubmitEnabled ? '⚡ Auto: ON' : '⏸ Auto: OFF'}
            </button>

            <button
              type="button"
              disabled={!biometrics.faceDetected || isThinking}
              onClick={handleManualCheckVibe}
              className="flex-1 rounded-lg border border-amber-400/50 bg-amber-500/15 px-1.5 py-1 text-[9px] font-mono font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition truncate"
              title={
                biometrics.faceDetected
                  ? 'Have the Ghost Counselor react to your current live facial expression'
                  : 'Center your face in the mirror first'
              }
            >
              ✨ Read Vibe
            </button>
          </div>

          {/* On-device privacy micro-text */}
          <span className="mt-1 text-[7.5px] font-mono text-slate-400 text-center select-none">
            🔒 100% Local On-Device WASM
          </span>
        </>
      )}
    </div>
  );
}
