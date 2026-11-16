// MediaPipe Face Landmarker Service (Web JavaScript)
// Real-time tracking of eyebrows, mouth curvature, gaze avoidance, stress & confusion
// 100% Free & Local on-device execution (no external charges)

let landmarkerInstance = null;
let landmarkerLoadingPromise = null;

/**
 * Ensures MediaPipe Tasks Vision (FaceLandmarker, FilesetResolver) is ready.
 * Checks window (injected by index.html) or dynamically imports.
 */
async function getMediaPipeVision() {
  if (window.FaceLandmarker && window.FilesetResolver) {
    return {
      FaceLandmarker: window.FaceLandmarker,
      FilesetResolver: window.FilesetResolver
    };
  }

  // If HTML module is still loading, wait briefly
  if (typeof window !== 'undefined') {
    const readyFromWindow = await new Promise((resolve) => {
      let timeout;
      const handler = () => {
        clearTimeout(timeout);
        window.removeEventListener('mediapipe-face-landmarker-ready', handler);
        resolve({
          FaceLandmarker: window.FaceLandmarker,
          FilesetResolver: window.FilesetResolver
        });
      };
      window.addEventListener('mediapipe-face-landmarker-ready', handler);
      timeout = setTimeout(() => {
        window.removeEventListener('mediapipe-face-landmarker-ready', handler);
        resolve(null);
      }, 1200);
    });

    if (readyFromWindow?.FaceLandmarker) {
      return readyFromWindow;
    }
  }

  // Fallback to direct dynamic import using CDN
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
  return await import(/* @vite-ignore */ cdnUrl);
}

/**
 * Initializes the FaceLandmarker with wasm binaries and model task.
 * Supports GPU acceleration with CPU graceful fallback.
 */
export async function getFaceLandmarker() {
  if (landmarkerInstance) return landmarkerInstance;
  if (landmarkerLoadingPromise) return landmarkerLoadingPromise;

  landmarkerLoadingPromise = (async () => {
    const { FaceLandmarker, FilesetResolver } = await getMediaPipeVision();

    // 1. Resolve Wasm Fileset (local first, fallback to CDN)
    let filesetResolver;
    try {
      filesetResolver = await FilesetResolver.forVisionTasks('./wasm');
    } catch (wasmErr) {
      console.warn('[FaceLandmarker] Local wasm path failed, using CDN wasm:', wasmErr);
      filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
    }

    // 2. Create FaceLandmarker options (local model first, fallback to Google Cloud CDN)
    const modelCandidates = [
      './models/face_landmarker.task',
      'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
    ];

    let createdLandmarker = null;
    let lastErr = null;

    for (const modelPath of modelCandidates) {
      try {
        // Try GPU delegate first for optimal performance
        createdLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });
        if (createdLandmarker) break;
      } catch (gpuErr) {
        console.warn(`[FaceLandmarker] GPU delegate failed for ${modelPath}, trying CPU:`, gpuErr);
        try {
          // Fallback to CPU delegate if GPU is unsupported
          createdLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: modelPath,
              delegate: 'CPU'
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO',
            numFaces: 1
          });
          if (createdLandmarker) break;
        } catch (cpuErr) {
          lastErr = cpuErr;
        }
      }
    }

    if (!createdLandmarker) {
      throw lastErr || new Error('Unable to initialize MediaPipe Face Landmarker');
    }

    landmarkerInstance = createdLandmarker;
    return landmarkerInstance;
  })();

  return landmarkerLoadingPromise;
}

/**
 * Euclidean distance helper
 */
function dist(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = (p1.x - p2.x);
  const dy = (p1.y - p2.y);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates stress score, confusion score, mouth curvature, eyebrow tension,
 * and gaze avoidance from MediaPipe Face Landmarker result.
 */
export function calculateFacialBiometrics(detectionResult) {
  if (!detectionResult || !detectionResult.faceLandmarks || detectionResult.faceLandmarks.length === 0) {
    return null;
  }

  const landmarks = detectionResult.faceLandmarks[0];
  const blendshapesList = detectionResult.faceBlendshapes?.[0]?.categories || [];

  // Convert blendshapes array to fast lookup dictionary
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

  // Eyebrow tension: combination of furrowing down and inner contraction
  let browTension = Math.max(0, Math.min(1, browDown * 0.65 + browInnerUp * 0.35));

  // Geometric eyebrow validation if landmarks exist
  if (landmarks[107] && landmarks[336] && landmarks[33] && landmarks[263]) {
    const eyeWidth = dist(landmarks[33], landmarks[263]) || 0.2;
    const innerBrowGap = dist(landmarks[107], landmarks[336]) / eyeWidth;
    // Normalized inner brow gap is ~0.38 neutral. If < 0.30, brows are strongly furrowed
    if (innerBrowGap < 0.32) {
      const geometricFurrow = Math.min(1, (0.32 - innerBrowGap) / 0.12);
      browTension = Math.max(browTension, geometricFurrow * 0.85);
    }
  }

  // ── 2. MOUTH CURVATURE TRACKING (Frown vs Smile) ───────────────────────────
  const mouthFrownLeft = b.mouthFrownLeft || 0;
  const mouthFrownRight = b.mouthFrownRight || 0;
  const mouthFrown = (mouthFrownLeft + mouthFrownRight) / 2;

  const mouthSmileLeft = b.mouthSmileLeft || 0;
  const mouthSmileRight = b.mouthSmileRight || 0;
  const mouthSmile = (mouthSmileLeft + mouthSmileRight) / 2;

  const mouthPress = ((b.mouthPressLeft || 0) + (b.mouthPressRight || 0)) / 2;
  const mouthPucker = b.mouthPucker || 0;

  // Curvature: -1.0 (deep frown) to +1.0 (broad smile)
  let mouthCurvature = Number((mouthSmile - mouthFrown).toFixed(2));

  // Geometric mouth curvature validation: Y position of corners (61, 291) vs center (0, 17)
  if (landmarks[61] && landmarks[291] && landmarks[0] && landmarks[17] && landmarks[33] && landmarks[263]) {
    const eyeWidth = dist(landmarks[33], landmarks[263]) || 0.2;
    const avgCornerY = (landmarks[61].y + landmarks[291].y) / 2;
    const centerLipY = (landmarks[0].y + landmarks[17].y) / 2;
    // In image coordinates, larger Y is lower down.
    // If corners are lower than center (avgCornerY > centerLipY), it's a downward droop/frown.
    const geometricCurvature = (centerLipY - avgCornerY) / (eyeWidth * 0.2);
    if (Math.abs(geometricCurvature) > 0.15) {
      mouthCurvature = Number(
        Math.max(-1, Math.min(1, mouthCurvature * 0.6 + geometricCurvature * 0.4)).toFixed(2)
      );
    }
  }

  // ── 3. EYE CONTACT & GAZE AVOIDANCE ───────────────────────────────────────
  const eyeLookDown = ((b.eyeLookDownLeft || 0) + (b.eyeLookDownRight || 0)) / 2;
  const eyeLookOut = ((b.eyeLookOutLeft || 0) + (b.eyeLookOutRight || 0)) / 2;
  const eyeLookIn = ((b.eyeLookInLeft || 0) + (b.eyeLookInRight || 0)) / 2;
  const eyeSquint = ((b.eyeSquintLeft || 0) + (b.eyeSquintRight || 0)) / 2;

  // Gaze avoidance: looking down away from camera or glancing away to sides
  const gazeAvoidance = Math.max(eyeLookDown * 1.1, (eyeLookOut + eyeLookIn) * 0.85);
  const isAvoidingEyeContact = gazeAvoidance > 0.26 || eyeLookDown > 0.28;
  const eyeContactScore = Math.max(0, Math.min(100, Math.round((1 - gazeAvoidance) * 100)));

  // ── 4. STRESS & CONFUSION SCORES ──────────────────────────────────────────
  // Stress score (0 to 100): Combines brow tension, downward mouth frown, mouth press, and gaze avoidance
  const rawStress =
    browTension * 0.38 +
    mouthFrown * 0.32 +
    mouthPress * 0.12 +
    gazeAvoidance * 0.22 -
    mouthSmile * 0.30;
  const stressScore = Math.max(0, Math.min(100, Math.round(Math.max(0, rawStress) * 100)));

  // Confusion score (0 to 100): Brow inner raise (worry/uncertainty) + asymmetry + squint + gaze avoidance
  const browAsymmetry = Math.abs(browDownLeft - browDownRight);
  const rawConfusion =
    browInnerUp * 0.42 +
    browAsymmetry * 0.22 +
    eyeSquint * 0.20 +
    gazeAvoidance * 0.16 -
    mouthSmile * 0.20;
  const confusionScore = Math.max(0, Math.min(100, Math.round(Math.max(0, rawConfusion) * 100)));

  // ── 5. STATE CLASSIFICATION ───────────────────────────────────────────────
  const isFrustrated =
    browTension > 0.24 ||
    (mouthFrown > 0.20 && browTension > 0.14) ||
    stressScore >= 42;

  const isAnxious =
    (browInnerUp > 0.20 && (mouthFrown > 0.10 || isAvoidingEyeContact)) ||
    (isAvoidingEyeContact && stressScore >= 25) ||
    stressScore >= 45;

  const isDistressed =
    isFrustrated ||
    isAnxious ||
    isAvoidingEyeContact ||
    stressScore >= 38 ||
    confusionScore >= 45;

  // Categorical Label & Emoji
  let stateLabel = 'Locked In & Focused';
  let stateEmoji = '👀';
  let stateColor = '#e2e8f0';
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
    description = 'Hesitating / looking away from the future';
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
  } else if (mouthCurvature > 0.22) {
    stateLabel = 'Smiling & Energized';
    stateEmoji = '✨';
    stateColor = '#4ade80';
    description = 'Positive and optimistic';
  }

  return {
    stressScore,
    confusionScore,
    browTension: Number(browTension.toFixed(2)),
    mouthCurvature,
    mouthFrown: Number(mouthFrown.toFixed(2)),
    mouthSmile: Number(mouthSmile.toFixed(2)),
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
