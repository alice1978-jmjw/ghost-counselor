// MediaPipe Face Landmarker Service (Web JavaScript)
// Real-time tracking of eyebrows, mouth curvature/openness, gaze avoidance, stress & confusion
// 100% Free & Local on-device execution via WebAssembly (no video frames ever leave the browser)

let landmarkerInstance = null;
let landmarkerLoadingPromise = null;
let lastVideoTimestampMs = 0;

/**
 * Requests webcam video stream directly (call synchronously inside a user click gesture
 * whenever possible so browsers and embedded webviews preserve permission activation).
 */
export async function requestWebcamStream() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const secErr = new Error(
      'Webcam API unavailable. Please open the app over http://localhost or HTTPS.'
    );
    secErr.name = 'SecurityError';
    throw secErr;
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });
  } catch (constraintErr) {
    if (
      constraintErr?.name === 'OverconstrainedError' ||
      constraintErr?.name === 'ConstraintNotSatisfiedError'
    ) {
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }
    throw constraintErr;
  }
}

/**
 * Checks browser Camera permission state ('granted' | 'denied' | 'prompt' | 'unknown').
 */
export async function queryCameraPermissionState() {
  try {
    if (!navigator.permissions?.query) return 'unknown';
    const status = await navigator.permissions.query({ name: 'camera' });
    return status?.state || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Guarantees strictly monotonically increasing integer timestamps (ms)
 * required by MediaPipe FaceLandmarker in VIDEO mode, even across ON/OFF toggles.
 */
export function getNextVideoTimestampMs() {
  const now = Math.floor(performance.now());
  const next = now > lastVideoTimestampMs ? now : lastVideoTimestampMs + 1;
  lastVideoTimestampMs = next;
  return next;
}

/**
 * Safely closes and clears any cached FaceLandmarker instance so recovery/retry always starts clean.
 */
export function resetFaceLandmarker() {
  try {
    landmarkerInstance?.close?.();
  } catch {
    // Ignore close errors
  }
  landmarkerInstance = null;
  landmarkerLoadingPromise = null;
}

function toAbsoluteUrl(relativePath) {
  if (typeof window === 'undefined') return relativePath;
  try {
    return new URL(relativePath, window.location.href).href;
  } catch {
    return relativePath;
  }
}

async function loadVisionModule(source) {
  if (source === 'local') {
    if (
      typeof window !== 'undefined' &&
      window.FaceLandmarker &&
      window.FilesetResolver &&
      window.__mediapipeSource === 'local'
    ) {
      return {
        FaceLandmarker: window.FaceLandmarker,
        FilesetResolver: window.FilesetResolver
      };
    }
    const localUrl = toAbsoluteUrl('./mediapipe/vision_bundle.mjs');
    const mod = await import(/* @vite-ignore */ localUrl);
    if (mod?.FaceLandmarker && mod?.FilesetResolver) {
      return { FaceLandmarker: mod.FaceLandmarker, FilesetResolver: mod.FilesetResolver };
    }
    throw new Error('Local MediaPipe vision bundle missing exports');
  }

  // CDN matched module
  if (
    typeof window !== 'undefined' &&
    window.FaceLandmarker &&
    window.FilesetResolver &&
    window.__mediapipeSource === 'cdn'
  ) {
    return {
      FaceLandmarker: window.FaceLandmarker,
      FilesetResolver: window.FilesetResolver
    };
  }
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
  const mod = await import(/* @vite-ignore */ cdnUrl);
  if (mod?.FaceLandmarker && mod?.FilesetResolver) {
    return { FaceLandmarker: mod.FaceLandmarker, FilesetResolver: mod.FilesetResolver };
  }
  throw new Error('CDN MediaPipe vision bundle missing exports');
}

/**
 * Initializes the FaceLandmarker with version-matched JS/WASM pairs and model task.
 * Local-first (100% on-device assets in public/mediapipe, public/wasm, public/models)
 * with graceful fallback to CDN if any local asset fails.
 * Uses CPU XNNPACK SIMD delegate first for rock-solid compatibility alongside Three.js WebGL.
 */
export async function getFaceLandmarker({ preferGpu = false } = {}) {
  if (landmarkerInstance) return landmarkerInstance;
  if (landmarkerLoadingPromise) return landmarkerLoadingPromise;

  const tiers = [
    {
      name: 'local-assets',
      moduleSource: 'local',
      wasmBase: toAbsoluteUrl('./wasm'),
      models: [
        toAbsoluteUrl('./models/face_landmarker.task'),
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      ]
    },
    {
      name: 'cdn-assets',
      moduleSource: 'cdn',
      wasmBase: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm',
      models: [
        toAbsoluteUrl('./models/face_landmarker.task'),
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      ]
    }
  ];

  const delegates = preferGpu ? ['GPU', 'CPU'] : ['CPU', 'GPU'];

  landmarkerLoadingPromise = (async () => {
    let lastErr = null;

    for (const tier of tiers) {
      try {
        const { FaceLandmarker, FilesetResolver } = await loadVisionModule(tier.moduleSource);
        const filesetResolver = await FilesetResolver.forVisionTasks(tier.wasmBase);

        for (const modelPath of tier.models) {
          for (const delegate of delegates) {
            try {
              const created = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                  modelAssetPath: modelPath,
                  delegate
                },
                outputFaceBlendshapes: true,
                outputFacialTransformationMatrixes: true,
                runningMode: 'VIDEO',
                numFaces: 1,
                minFaceDetectionConfidence: 0.35,
                minFacePresenceConfidence: 0.35,
                minTrackingConfidence: 0.35
              });

              if (created) {
                landmarkerInstance = created;
                console.log(
                  `[FaceLandmarker] Initialized via ${tier.name} (${delegate} delegate)`
                );
                return created;
              }
            } catch (attemptErr) {
              lastErr = attemptErr;
              console.warn(
                `[FaceLandmarker] Attempt failed (${tier.name}, ${delegate}, ${modelPath}):`,
                attemptErr
              );
            }
          }
        }
      } catch (tierErr) {
        lastErr = tierErr;
        console.warn(`[FaceLandmarker] Tier ${tier.name} failed:`, tierErr);
      }
    }

    throw lastErr || new Error('Unable to initialize MediaPipe Face Landmarker');
  })();

  try {
    return await landmarkerLoadingPromise;
  } catch (err) {
    // CRITICAL: Never cache a rejected promise so subsequent retries always work cleanly
    landmarkerLoadingPromise = null;
    throw err;
  }
}

function dist(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates stress score, confusion score, mouth curvature/openness,
 * eyebrow tension, and gaze avoidance from MediaPipe Face Landmarker result.
 */
export function calculateFacialBiometrics(detectionResult) {
  if (
    !detectionResult ||
    !detectionResult.faceLandmarks ||
    detectionResult.faceLandmarks.length === 0
  ) {
    return null;
  }

  const landmarks = detectionResult.faceLandmarks[0];
  const blendshapesList = detectionResult.faceBlendshapes?.[0]?.categories || [];

  const b = {};
  blendshapesList.forEach((item) => {
    b[item.categoryName] = item.score;
  });

  // ── 1. EYEBROW TRACKING (Blendshapes + Geometry) ──────────────────────────
  const browDownLeft = b.browDownLeft || 0;
  const browDownRight = b.browDownRight || 0;
  const browDown = (browDownLeft + browDownRight) / 2;
  const browInnerUp = b.browInnerUp || 0;
  const browOuterUp = ((b.browOuterUpLeft || 0) + (b.browOuterUpRight || 0)) / 2;

  let browTension = Math.max(0, Math.min(1, browDown * 0.72 + browInnerUp * 0.32));

  if (landmarks[107] && landmarks[336] && landmarks[33] && landmarks[263]) {
    const eyeWidth = dist(landmarks[33], landmarks[263]) || 0.2;
    const innerBrowGap = dist(landmarks[107], landmarks[336]) / eyeWidth;
    if (innerBrowGap < 0.31) {
      const geometricFurrow = Math.min(1, (0.31 - innerBrowGap) / 0.12);
      browTension = Math.max(browTension, geometricFurrow * 0.85);
    }
  }

  const browState =
    browTension > 0.22 ? 'Furrowed' : browOuterUp > 0.35 || browInnerUp > 0.38 ? 'Raised' : 'Relaxed';

  // ── 2. MOUTH TRACKING (Smile, Frown, Open) ────────────────────────────────
  const mouthFrownLeft = b.mouthFrownLeft || 0;
  const mouthFrownRight = b.mouthFrownRight || 0;
  const mouthFrown = (mouthFrownLeft + mouthFrownRight) / 2;

  const mouthSmileLeft = b.mouthSmileLeft || 0;
  const mouthSmileRight = b.mouthSmileRight || 0;
  const mouthSmile = (mouthSmileLeft + mouthSmileRight) / 2;

  const mouthPress = ((b.mouthPressLeft || 0) + (b.mouthPressRight || 0)) / 2;
  const jawOpen = b.jawOpen || 0;

  let mouthCurvature = Number((mouthSmile - mouthFrown).toFixed(2));

  // Subtle geometric validation ONLY when mouth is closed (avoids false smile when mouth is wide open)
  if (
    jawOpen < 0.18 &&
    landmarks[61] &&
    landmarks[291] &&
    landmarks[13] &&
    landmarks[14] &&
    landmarks[33] &&
    landmarks[263]
  ) {
    const eyeWidth = dist(landmarks[33], landmarks[263]) || 0.2;
    const avgCornerY = (landmarks[61].y + landmarks[291].y) / 2;
    const innerLipCenterY = (landmarks[13].y + landmarks[14].y) / 2;
    const geometricCurvature = (innerLipCenterY - avgCornerY) / (eyeWidth * 0.22);
    if (Math.abs(geometricCurvature) > 0.12) {
      mouthCurvature = Number(
        Math.max(-1, Math.min(1, mouthCurvature * 0.7 + geometricCurvature * 0.3)).toFixed(2)
      );
    }
  }

  const isMouthOpen = jawOpen > 0.28;
  const mouthState = isMouthOpen
    ? 'Open 😮'
    : mouthCurvature > 0.16 || mouthSmile > 0.25
    ? 'Smiling 🙂'
    : mouthCurvature < -0.14 || mouthFrown > 0.22
    ? 'Frowning 🙁'
    : 'Neutral 😐';

  // ── 3. EYE CONTACT & GAZE AVOIDANCE (Eye blendshapes + Head-turn Yaw/Pitch) ──
  const eyeLookDown = ((b.eyeLookDownLeft || 0) + (b.eyeLookDownRight || 0)) / 2;
  const eyeLookOut = ((b.eyeLookOutLeft || 0) + (b.eyeLookOutRight || 0)) / 2;
  const eyeLookIn = ((b.eyeLookInLeft || 0) + (b.eyeLookInRight || 0)) / 2;
  const eyeSquint = ((b.eyeSquintLeft || 0) + (b.eyeSquintRight || 0)) / 2;

  // Detect head turned left/right away from camera using nose tip vs outer face edges
  let headYawAvoidance = 0;
  if (landmarks[1] && landmarks[234] && landmarks[454]) {
    const faceSpan = Math.abs(landmarks[454].x - landmarks[234].x);
    if (faceSpan > 0.05) {
      const noseRatio = (landmarks[1].x - landmarks[234].x) / faceSpan; // ~0.50 centered
      const yawOffset = Math.abs(noseRatio - 0.5);
      if (yawOffset > 0.14) {
        headYawAvoidance = Math.min(1, (yawOffset - 0.14) / 0.18);
      }
    }
  }

  const horizontalGaze = Math.max(eyeLookOut, eyeLookIn);
  const gazeAvoidance = Math.max(
    Math.max(0, eyeLookDown - 0.16) * 1.15,
    horizontalGaze * 0.98,
    headYawAvoidance
  );
  const isAvoidingEyeContact =
    eyeLookDown > 0.46 || horizontalGaze > 0.36 || headYawAvoidance > 0.25 || gazeAvoidance > 0.34;
  const eyeContactScore = Math.max(
    0,
    Math.min(100, Math.round((1 - Math.min(1, gazeAvoidance)) * 100))
  );

  // ── 4. STRESS & CONFUSION SCORES ──────────────────────────────────────────
  const rawStress =
    browTension * 0.44 +
    mouthFrown * 0.34 +
    mouthPress * 0.14 +
    Math.min(1, gazeAvoidance) * 0.22 -
    mouthSmile * 0.30;
  const stressScore = Math.max(0, Math.min(100, Math.round(Math.max(0, rawStress) * 100)));

  const browAsymmetry = Math.abs(browDownLeft - browDownRight);
  const rawConfusion =
    browInnerUp * 0.42 +
    browAsymmetry * 0.24 +
    eyeSquint * 0.20 +
    Math.min(1, gazeAvoidance) * 0.14 -
    mouthSmile * 0.22;
  const confusionScore = Math.max(0, Math.min(100, Math.round(Math.max(0, rawConfusion) * 100)));

  // ── 5. STATE CLASSIFICATION ───────────────────────────────────────────────
  const isFrustrated =
    browTension > 0.21 ||
    (mouthFrown > 0.18 && browTension > 0.12) ||
    stressScore >= 38;

  const isAnxious =
    browInnerUp > 0.24 ||
    (browInnerUp > 0.17 && (mouthFrown > 0.10 || isAvoidingEyeContact)) ||
    (isAvoidingEyeContact && stressScore >= 24) ||
    stressScore >= 42;

  const isDistressed =
    isFrustrated ||
    isAnxious ||
    isAvoidingEyeContact ||
    stressScore >= 38 ||
    confusionScore >= 45;

  let stateLabel = 'Locked In & Focused';
  let stateEmoji = '👀';
  let stateColor = '#38bdf8';
  let description = 'Attentive and listening to the counselor';

  if (isAvoidingEyeContact && isAnxious) {
    stateLabel = 'Avoiding Eye Contact & Anxious';
    stateEmoji = '🙈';
    stateColor = '#c084fc';
    description = 'Feeling overwhelmed about what comes next';
  } else if (isAvoidingEyeContact) {
    stateLabel = 'Avoiding Eye Contact';
    stateEmoji = '🙈';
    stateColor = '#a855f7';
    description = 'Hesitating / looking away from the mirror';
  } else if (isFrustrated) {
    stateLabel = 'Frustrated / Overwhelmed';
    stateEmoji = '🔥';
    stateColor = '#f87171';
    description = 'Feeling stressed or pressured';
  } else if (isAnxious) {
    stateLabel = 'Anxious / Future Pressure';
    stateEmoji = '⚡';
    stateColor = '#fbbf24';
    description = 'Carrying heavy expectations';
  } else if (confusionScore >= 40) {
    stateLabel = 'Puzzled / Unsure';
    stateEmoji = '🤔';
    stateColor = '#38bdf8';
    description = 'Thinking through options';
  } else if (mouthCurvature > 0.20 || mouthSmile > 0.30) {
    stateLabel = 'Smiling & Energized';
    stateEmoji = '✨';
    stateColor = '#4ade80';
    description = 'Positive and optimistic';
  } else if (isMouthOpen) {
    stateLabel = 'Intrigued / Expressive';
    stateEmoji = '😮';
    stateColor = '#facc15';
    description = 'Reacting actively to the counselor';
  }

  return {
    faceDetected: true,
    landmarks,
    stressScore,
    confusionScore,
    browTension: Number(browTension.toFixed(2)),
    browState,
    mouthCurvature,
    mouthFrown: Number(mouthFrown.toFixed(2)),
    mouthSmile: Number(mouthSmile.toFixed(2)),
    jawOpen: Number(jawOpen.toFixed(2)),
    mouthState,
    eyeContactScore,
    gazeAvoidance: Number(gazeAvoidance.toFixed(2)),
    isAvoidingEyeContact,
    isFrustrated,
    isAnxious,
    isDistressed,
    stateLabel,
    stateEmoji,
    stateColor,
    description
  };
}
