import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ScrollText,
  KeyRound,
  RotateCcw,
  Wand2,
  Check,
  Radio,
  Camera,
  CameraOff,
  Gamepad2,
  Lock,
  LogOut,
  Mail,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Send,
  Info
} from 'lucide-react';
import FogOverlay from './components/FogOverlay';
import GhostSphere3D from './components/GhostSphere3D';
import SoulDossierModal from './components/SoulDossierModal';
import ArcadeAssessmentModal from './components/ArcadeAssessmentModal';
import ScryingMirror from './components/ScryingMirror';
import GreenFogBurst from './components/GreenFogBurst';
import {
  Pumpkin,
  Candle,
  CandyCorn,
  WrappedCandy,
  Bat,
  CornerSpiderweb,
  MiniGhost,
  Cauldron
} from './components/HalloweenDecorations';
import {
  INITIAL_GREETING,
  getGhostCounselorResponse,
  generatePersonalizedDossier,
  sanitizeNoEmDashes,
  createInitialSoulProfile,
  applyArcadeChoiceToProfile,
  applyArcadeCompletionToProfile,
  applyArcadePathwaySelection
} from './services/counselorAI';
import {
  soundEngine,
  speakGhostText,
  stopGhostSpeech,
  VOICE_PRESETS
} from './utils/soundEffects';
import { requestWebcamStream } from './services/faceLandmarkerService';
import { submitGuestAccessEmail, verifyConfirmationCode } from './services/waitlistService';

export default function App() {
  const [authRole, setAuthRole] = useState(() => sessionStorage.getItem('ghost_auth_role') || '');
  const [loginId, setLoginId] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Spectral Gate (Passcode & Guest Access)
  const [gateTab, setGateTab] = useState('passcode'); // 'passcode' | 'waitlist'
  const [guestFirstName, setGuestFirstName] = useState(() => sessionStorage.getItem('ghost_user_name') || '');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [waitlistSuccessMsg, setWaitlistSuccessMsg] = useState('');
  const [phase, setPhase] = useState('landing');
  const [mood, setMood] = useState('welcoming');

  // Voice & Audio States
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicePresetId, setVoicePresetId] = useState('spooky_oracle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Chat & Counseling Progression States
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [auraPoints, setAuraPoints] = useState(1000);
  const [quickPrompts, setQuickPrompts] = useState(INITIAL_GREETING.quickPrompts);

  // Unified Live Soul Profile (Single Source of Truth across Chat, Crisis Simulator 3D & Soul Dossier)
  const [soulProfile, setSoulProfile] = useState(() => createInitialSoulProfile());
  const soulProfileRef = useRef(soulProfile);
  useEffect(() => {
    soulProfileRef.current = soulProfile;
  }, [soulProfile]);
  const [sessionResetKey, setSessionResetKey] = useState(0);

  // Modals
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArcadeOpen, setIsArcadeOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ghost_gemini_api_key') || '');
  const [tempKey, setTempKey] = useState(apiKey);
  const [isScryingActive, setIsScryingActive] = useState(false);
  const [scryingStreamPromise, setScryingStreamPromise] = useState(null);
  const [currentVibe, setCurrentVibe] = useState(null);
  const [isVoiceSoftened, setIsVoiceSoftened] = useState(false);

  const handleSetScryingActive = (nextActive) => {
    if (nextActive) {
      // Request webcam synchronously inside the user click gesture so browser permission prompts work reliably
      const streamPromise = requestWebcamStream();
      // Attach no-op rejection handler so unhandledrejection never fires before ScryingMirror awaits it
      streamPromise.catch(() => {});
      setScryingStreamPromise(streamPromise);
      setIsScryingActive(true);
    } else {
      setIsScryingActive(false);
      setScryingStreamPromise(null);
      setCurrentVibe(null);
      setIsVoiceSoftened(false);
    }
  };

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fogBurstRef = useRef(null);
  const hasAutoSpokenRef = useRef(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
      setMousePosition({ x: xAxis, y: yAxis });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      stopGhostSpeech();
    };
  }, []);

  // 1-Click Email Confirmation Link Handler (?access_gate=confirmed or ?key=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const accessGate = params.get('access_gate') || params.get('access');
      const confirmedEmail = params.get('email') || params.get('confirm_email');
      const urlFirstName = params.get('firstname') || params.get('name') || params.get('FIRSTNAME');
      const key =
        params.get('key') ||
        params.get('code') ||
        params.get('confirm_code') ||
        params.get('token') ||
        params.get('confirm_token');
      const storedToken = sessionStorage.getItem('ghost_pending_token');

      const isKeyValid = key && verifyConfirmationCode(key, storedToken);

      if (accessGate === 'confirmed' || isKeyValid) {
        const guestEmail = confirmedEmail || sessionStorage.getItem('ghost_pending_email') || 'confirmed_guest';
        const storedName = urlFirstName || sessionStorage.getItem('ghost_pending_name') || sessionStorage.getItem('ghost_user_name');
        sessionStorage.setItem('ghost_auth_role', 'Guest');
        sessionStorage.setItem('ghost_user_email', guestEmail);
        if (storedName) {
          sessionStorage.setItem('ghost_user_name', storedName);
          setGuestFirstName(storedName);
        }
        sessionStorage.removeItem('ghost_pending_token');
        sessionStorage.removeItem('ghost_pending_email');
        sessionStorage.removeItem('ghost_pending_name');
        setAuthRole('Guest');
        soundEngine.playTraitChime('passion');

        // Analytics
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'counselor_email_link_confirmed',
            user_role: 'Guest',
            email: guestEmail,
            timestamp: new Date().toISOString()
          });
        } catch {
          // Ignore
        }

        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, interimTranscript]);

  const handleSpeakMessage = (msg, presetOverride) => {
    if (!msg?.text) return;
    if (!voiceEnabled) {
      setVoiceEnabled(true);
      soundEngine.isMuted = false;
    }
    soundEngine.playClickSound();
    speakGhostText(msg.text, {
      voiceEnabled: true,
      voicePresetId: presetOverride || voicePresetId,
      isSafetyIntervention: msg.isSafetyIntervention,
      softenVoice: Boolean(msg.softenVoice),
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onMouthUpdate: (val) => setMouthOpenness(val)
    });
  };

  const handleCycleVoicePreset = () => {
    const keys = Object.keys(VOICE_PRESETS);
    const nextIdx = (keys.indexOf(voicePresetId) + 1) % keys.length;
    const nextId = keys[nextIdx];
    setVoicePresetId(nextId);
    soundEngine.playClickSound();

    const lastGhostMsg = [...messages].reverse().find((m) => m.sender === 'ghost');
    if (lastGhostMsg && voiceEnabled) {
      speakGhostText(lastGhostMsg.text, {
        voiceEnabled: true,
        voicePresetId: nextId,
        isSafetyIntervention: lastGhostMsg.isSafetyIntervention,
        softenVoice: Boolean(lastGhostMsg.softenVoice),
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onMouthUpdate: (val) => setMouthOpenness(val)
      });
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        'Voice input (Web Speech API) is supported in Chrome, Edge, and Safari. You can still type or click any quick reply below!'
      );
      return;
    }

    soundEngine.playClickSound();

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    stopGhostSpeech(setMouthOpenness);
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) setInterimTranscript(interim);
      if (finalTranscript) {
        setInterimTranscript('');
        setIsListening(false);
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (overrideText, options = {}) => {
    const { overrideVibe = null, isFacialAutoCheck = false } = options;
    const textToSend = (overrideText ?? inputText).trim();
    if (!textToSend || isThinking) return;

    if (/^(open|inspect|view)\s+my\s+soul\s+dossier/i.test(textToSend)) {
      soundEngine.playDossierReveal();
      setIsDossierOpen(true);
      return;
    }

    if (/^(play|resume|replay)\s+crisis\s+simulator\s+3d/i.test(textToSend)) {
      soundEngine.playClickSound();
      setIsArcadeOpen(true);
      return;
    }

    if (!isFacialAutoCheck) {
      soundEngine.playClickSound();
    }
    stopGhostSpeech(setMouthOpenness);
    setIsSpeaking(false);
    setInputText('');
    setInterimTranscript('');

    const isExpressionAutoSubmit = isFacialAutoCheck || /\[Observed/i.test(textToSend);

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      isExpressionAutoSubmit,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsThinking(true);

    // Prefer overrideVibe passed directly from ScryingMirror to prevent stale React state race conditions
    const activeFacial = overrideVibe || (isScryingActive ? currentVibe : null);
    const immediateDistress = Boolean(
      activeFacial?.isDistressed ||
      activeFacial?.isFrustrated ||
      activeFacial?.isAnxious ||
      activeFacial?.isAvoidingEyeContact ||
      (activeFacial?.stressScore && activeFacial.stressScore >= 38)
    );
    if (immediateDistress) {
      setIsVoiceSoftened(true);
      setMood('empathetic');
    }

    const activeProfile = soulProfileRef.current;

    const response = await getGhostCounselorResponse({
      userMessage: textToSend,
      conversationHistory: messages,
      currentTraits: {
        passions: activeProfile.passions,
        strengths: activeProfile.strengths,
        weaknesses: activeProfile.weaknesses
      },
      soulProfile: activeProfile,
      stageIndex,
      apiKey,
      currentVibe: activeFacial,
      facialAnalysis: activeFacial
    });

    setIsThinking(false);
    setMood(response.mood || 'empathetic');

    if (response.updatedProfile) {
      setSoulProfile((prev) => {
        const merged = {
          ...response.updatedProfile,
          arcade: prev.arcade
        };
        soulProfileRef.current = merged;
        return merged;
      });
    }

    const shouldSoften = Boolean(
      response.softenVoice ||
      immediateDistress
    );
    setIsVoiceSoftened(shouldSoften);

    // Do not advance the 3-Phase quiz stage on an automatic facial comfort check-in
    const nextStage =
      response.isSafetyIntervention || isExpressionAutoSubmit
        ? stageIndex
        : Math.min(stageIndex + 1, 8);
    setStageIndex(nextStage);

    if (!response.isSafetyIntervention) {
      if (shouldSoften && !isFacialAutoCheck) {
        soundEngine.playCalmingTone();
      } else if (!isFacialAutoCheck) {
        const addedCount =
          (response.newlyAdded?.passions?.length || 0) +
          (response.newlyAdded?.strengths?.length || 0) +
          (response.newlyAdded?.weaknesses?.length || 0);
        soundEngine.playTraitChime(addedCount > 0 ? 'passion' : 'strength');
        setAuraPoints((prev) => prev + 500 + addedCount * 250);
      }
    }

    if (response.shouldUnlockDossier || nextStage >= 8) {
      soundEngine.playDossierReveal();
    }

    setQuickPrompts(
      response.quickPrompts && response.quickPrompts.length > 0
        ? response.quickPrompts
        : INITIAL_GREETING.quickPrompts
    );

    const cleanGhostReply = sanitizeNoEmDashes(response.reply);

    const ghostMsg = {
      id: `ghost-${Date.now()}`,
      sender: 'ghost',
      hostTitle: 'Friendly Ghost Counselor',
      mood: shouldSoften ? 'empathetic' : response.mood,
      text: cleanGhostReply,
      softenVoice: shouldSoften,
      isSafetyIntervention: response.isSafetyIntervention,
      usedGemini: response.usedGemini,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, ghostMsg]);

    if (voiceEnabled) {
      speakGhostText(cleanGhostReply, {
        voiceEnabled: true,
        voicePresetId,
        isSafetyIntervention: response.isSafetyIntervention,
        softenVoice: shouldSoften,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onMouthUpdate: (val) => setMouthOpenness(val)
      });
    }
  };

  const handleAutoSubmitVibe = (vibe) => {
    if (isThinking || isListening || !vibe) return;

    setCurrentVibe(vibe);

    let textToSend = '';
    if (vibe.isAvoidingEyeContact && vibe.isAnxious) {
      textToSend = `*Glances away feeling anxious and overwhelmed* [Observed: Avoiding Eye Contact & Anxious]`;
    } else if (vibe.isAvoidingEyeContact) {
      textToSend = `*Hesitates and avoids eye contact* [Observed: Avoiding Eye Contact]`;
    } else if (vibe.isFrustrated) {
      textToSend = `*Looks visibly frustrated / brows furrowed* [Observed: Frustrated]`;
    } else if (vibe.isAnxious) {
      textToSend = `*Looks anxious about the future* [Observed: Anxious]`;
    } else if (vibe.confusionScore >= 45) {
      textToSend = `*Looks puzzled and unsure* [Observed: Confused]`;
    } else if (vibe.mouthCurvature > 0.22) {
      textToSend = `*Smiles warmly at the crystal ball* [Observed: Smiling & Energized ✨]`;
    } else {
      textToSend = `*Locks in with focused attention* [Observed: Focused & Locked In 👀]`;
    }

    handleSendMessage(textToSend, { overrideVibe: vibe, isFacialAutoCheck: true });
  };

  const handleToggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    soundEngine.isMuted = !nextState;
    if (!nextState) {
      stopGhostSpeech(setMouthOpenness);
      setIsSpeaking(false);
    } else {
      soundEngine.playTraitChime('strength');
      const lastGhostMsg = [...messages].reverse().find((m) => m.sender === 'ghost');
      if (lastGhostMsg) {
        speakGhostText(lastGhostMsg.text, {
          voiceEnabled: true,
          voicePresetId,
          isSafetyIntervention: lastGhostMsg.isSafetyIntervention,
          softenVoice: Boolean(lastGhostMsg.softenVoice),
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onMouthUpdate: (val) => setMouthOpenness(val)
        });
      }
    }
  };

  const handleSummonCounselor = () => {
    soundEngine.playEmergenceSound();
    soundEngine.initContext();
    setPhase('emerging');

    setTimeout(() => {
      setPhase('counseling');
      if (voiceEnabled) {
        speakGhostText(INITIAL_GREETING.text, {
          voiceEnabled: true,
          voicePresetId,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onMouthUpdate: (val) => setMouthOpenness(val)
        });
      }
    }, 1200);
  };

  const handleReturnToLanding = () => {
    stopGhostSpeech(setMouthOpenness);
    setIsSpeaking(false);
    soundEngine.playClickSound();
    setPhase('landing');
  };

  const handleRestartSession = () => {
    stopGhostSpeech(setMouthOpenness);
    setIsSpeaking(false);
    soundEngine.playEmergenceSound();
    const freshProfile = createInitialSoulProfile();
    soulProfileRef.current = freshProfile;
    setSoulProfile(freshProfile);
    setSessionResetKey((k) => k + 1);
    setMessages([INITIAL_GREETING]);
    setQuickPrompts(INITIAL_GREETING.quickPrompts);
    setStageIndex(0);
    setAuraPoints(1000);
    setMood('welcoming');
    setIsDossierOpen(false);
    setIsArcadeOpen(false);
    setPhase('counseling');

    if (voiceEnabled) {
      speakGhostText(INITIAL_GREETING.text, {
        voiceEnabled: true,
        voicePresetId,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onMouthUpdate: (val) => setMouthOpenness(val)
      });
    }
  };

  // Continuous live sync on EVERY Crisis Simulator 3D portal choice
  const handleArcadeScenarioChoice = (choicePayload) => {
    setSoulProfile((prev) => {
      const next = applyArcadeChoiceToProfile(prev, choicePayload);
      soulProfileRef.current = next;
      return next;
    });
  };

  // Immediate auto-sync when Scenario 10 finishes in Crisis Simulator 3D
  const handleArcadeGameComplete = (finalResult, choices) => {
    if (!finalResult) return;
    setSoulProfile((prev) => {
      const next = applyArcadeCompletionToProfile(prev, finalResult, choices);
      soulProfileRef.current = next;
      return next;
    });
    setAuraPoints((prev) => prev + 1500);
    soundEngine.playTraitChime('passion');
    soundEngine.playDossierReveal();
  };

  // Immediate live sync whenever the user clicks a Recommended Pathway card on the End Screen
  const handleArcadePathwaySelect = (pathway) => {
    setSoulProfile((prev) => {
      const next = applyArcadePathwaySelection(prev, pathway);
      soulProfileRef.current = next;
      return next;
    });
  };

  // Post a strictly Soul-Dossier-aligned Crisis Simulator 3D debrief into Career Counselor Chat
  const postArcadeDebriefToChat = (
    profileSnapshot,
    { openDossier = false, speakReply = true, switchToCounseling = true } = {}
  ) => {
    const result = profileSnapshot?.arcade?.result;
    if (!result) return;

    if (switchToCounseling) {
      setPhase('counseling');
    }

    const syncedDossier = generatePersonalizedDossier(profileSnapshot);
    const topCard = syncedDossier.careerCards?.[0];
    const selectedPathway = profileSnapshot.arcade?.selectedPathway;
    const dominantKey = result.dominantTrait;
    const dominantScore = result.scores?.[dominantKey] || 0;

    const pathwayNote = selectedPathway
      ? ` You locked **${selectedPathway.name}** as your priority pathway.`
      : '';
    const topMatchNote = topCard
      ? ` Your #1 Tarot Career Arcana Match in your Soul Dossier is now **${topCard.careerTitle}** (${topCard.matchPercent}% match, ${topCard.salaryRange}).`
      : '';
    const constraintNote = profileSnapshot.constraints?.needMoneyNow
      ? ' Every 90-day roadmap step stays locked to your fast-ROI, debt-smart financial constraints.'
      : '';

    const cleanGhostReply = sanitizeNoEmDashes(
      `Yo! I just synced your Crisis Simulator 3D gameplay straight into your Soul Dossier, no cap. You unlocked **${result.title}** (${result.badge}) with **${dominantKey} ${dominantScore}/10** instinct choices.${pathwayNote}${topMatchNote}${constraintNote} Recommended fields for your build: ${result.recommendedFields}. Want to walk through your 90-day roadmap for ${topCard ? topCard.careerTitle : 'your top match'}?`
    );

    const ghostMsg = {
      id: `ghost-arcade-${Date.now()}`,
      sender: 'ghost',
      hostTitle: 'Friendly Ghost Counselor',
      mood: 'inspired',
      text: cleanGhostReply,
      isSafetyIntervention: false,
      usedGemini: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMood('inspired');
    setMessages((prev) => [...prev, ghostMsg]);

    // Mark this completed run as debriefed so closing via X doesn't duplicate it
    setSoulProfile((prev) => {
      const next = {
        ...prev,
        arcade: {
          ...prev.arcade,
          debriefedRunId: prev.arcade?.completedAt || Date.now()
        }
      };
      soulProfileRef.current = next;
      return next;
    });

    const primaryField =
      selectedPathway?.name ||
      topCard?.careerTitle?.split('&')[0]?.trim() ||
      (result.recommendedFields || 'your path').split(',')[0].trim();

    setQuickPrompts([
      `Walk me through my 90-day plan for ${primaryField} 🎯`,
      `Tell me more about ${result.title} careers! 💼`,
      `Show high-paying paths in ${primaryField} 💸`,
      `Open my Soul Dossier & show matches 📜✨`
    ]);

    if (voiceEnabled && speakReply) {
      speakGhostText(cleanGhostReply, {
        voiceEnabled: true,
        voicePresetId,
        isSafetyIntervention: false,
        softenVoice: false,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onMouthUpdate: (val) => setMouthOpenness(val)
      });
    }

    if (openDossier) {
      soundEngine.playDossierReveal();
      setIsDossierOpen(true);
    }
  };

  const handleArcadeSyncResult = (result) => {
    if (!result) return;

    let latestProfile = soulProfileRef.current;
    if (!latestProfile.arcade?.completed || latestProfile.arcade?.result?.title !== result.title) {
      latestProfile = applyArcadeCompletionToProfile(latestProfile, result);
    }
    if (result.selectedPathway) {
      latestProfile = applyArcadePathwaySelection(latestProfile, result.selectedPathway);
    }
    soulProfileRef.current = latestProfile;
    setSoulProfile(latestProfile);

    postArcadeDebriefToChat(latestProfile, {
      openDossier: true,
      speakReply: true,
      switchToCounseling: true
    });
  };

  const handleArcadeClose = () => {
    setIsArcadeOpen(false);
    const latest = soulProfileRef.current;
    if (
      latest?.arcade?.completed &&
      latest.arcade.result &&
      latest.arcade.completedAt &&
      latest.arcade.debriefedRunId !== latest.arcade.completedAt
    ) {
      postArcadeDebriefToChat(latest, {
        openDossier: false,
        speakReply: false,
        switchToCounseling: false
      });
    }
  };

  const handleDiscussCareerFromDossier = (card) => {
    if (!card) return;
    setIsDossierOpen(false);
    setPhase('counseling');
    handleSendMessage(
      `Let's dive into ${card.careerTitle} from my Soul Dossier! Walk me through my first 90-day step.`
    );
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('ghost_gemini_api_key', tempKey.trim());
    setApiKey(tempKey.trim());
    setIsSettingsOpen(false);
  };

  const completeRoleLogin = (matchedRole) => {
    setLoginError('');
    sessionStorage.setItem('ghost_auth_role', matchedRole);
    setAuthRole(matchedRole);
    soundEngine.playTraitChime('passion');

    // 1. Push login event to Google Tag Manager (GTM-MD44XGJP)
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'counselor_login',
        user_role: matchedRole,
        login_timestamp: new Date().toISOString()
      });
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'login', {
          method: 'SpectralGate',
          user_role: matchedRole
        });
      }
      window.history.replaceState(null, '', `#role=${matchedRole.toLowerCase()}`);
    } catch {
      // Ignore analytics errors
    }

    // 2. Send AdBlocker-proof server access log ping (for wareprise.com logs)
    fetch(`./?auth_event=login&role=${encodeURIComponent(matchedRole)}&t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    }).catch(() => {});
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const cleanId = loginId.trim().toLowerCase();
    const cleanPass = loginPasscode.trim();

    let matchedRole = null;
    if (cleanId === 'judge' && cleanPass === 'kiroween2026') {
      matchedRole = 'Judge';
    } else if (cleanId === 'dev' && cleanPass === 'wareprise') {
      matchedRole = 'Dev';
    }

    if (!matchedRole) {
      soundEngine.playClickSound();
      setLoginError('Invalid Access ID or Passcode. Please check your credentials.');
      return;
    }

    completeRoleLogin(matchedRole);
  };

  const handleGuestAccessSubmit = async (e) => {
    e.preventDefault();
    if (waitlistLoading) return;

    soundEngine.playClickSound();
    setWaitlistError('');
    setWaitlistSuccessMsg('');
    setWaitlistLoading(true);

    const result = await submitGuestAccessEmail(waitlistEmail, { firstName: guestFirstName });

    if (!result.success) {
      soundEngine.playClickSound();
      setWaitlistLoading(false);
      setWaitlistError(result.error);
      return;
    }

    setWaitlistLoading(false);
    setWaitlistSuccessMsg('✨ Welcome to the Sanctuary! Parting the mist now...');
    soundEngine.playTraitChime('passion');

    const confirmedEmail = result.email || waitlistEmail;
    const confirmedName = result.firstName || guestFirstName;

    sessionStorage.setItem('ghost_auth_role', 'Guest');
    sessionStorage.setItem('ghost_user_email', confirmedEmail);
    if (confirmedName) {
      sessionStorage.setItem('ghost_user_name', confirmedName);
      setGuestFirstName(confirmedName);
    }

    // 1. Analytics
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'counselor_guest_access_granted',
        user_role: 'Guest',
        email: confirmedEmail,
        first_name: confirmedName,
        signup_timestamp: new Date().toISOString()
      });
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'sign_up', {
          method: 'FormspreeGuestAccess',
          user_role: 'Guest'
        });
      }
      window.history.replaceState(null, '', '#role=guest');
    } catch {
      // Ignore
    }

    // 2. Server access ping
    fetch(`./?auth_event=guest_access&email=${encodeURIComponent(confirmedEmail)}&t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store'
    }).catch(() => {});

    setTimeout(() => {
      setAuthRole('Guest');
    }, 600);
  };

  const handleLogout = () => {
    soundEngine.playClickSound();
    stopGhostSpeech(setMouthOpenness);
    setIsSpeaking(false);
    sessionStorage.removeItem('ghost_auth_role');
    sessionStorage.removeItem('ghost_user_email');
    sessionStorage.removeItem('ghost_user_name');
    setAuthRole('');
    setLoginId('');
    setLoginPasscode('');
    setLoginError('');
    const freshProfile = createInitialSoulProfile();
    soulProfileRef.current = freshProfile;
    setSoulProfile(freshProfile);
    setSessionResetKey((k) => k + 1);
    setMessages([INITIAL_GREETING]);
    setQuickPrompts(INITIAL_GREETING.quickPrompts);
    setStageIndex(0);
    setAuraPoints(1000);
    setMood('welcoming');
    setIsDossierOpen(false);
    setIsArcadeOpen(false);
    setGuestFirstName('');
    setWaitlistEmail('');
    setWaitlistError('');
    setWaitlistSuccessMsg('');
    setPhase('landing');
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      // Ignore history errors
    }
  };

  const traits = useMemo(
    () => ({
      passions: soulProfile.passions || [],
      strengths: soulProfile.strengths || [],
      weaknesses: soulProfile.weaknesses || []
    }),
    [soulProfile.passions, soulProfile.strengths, soulProfile.weaknesses]
  );

  const currentDossier = useMemo(
    () => generatePersonalizedDossier(soulProfile),
    [soulProfile]
  );
  const isDossierEmpty = currentDossier.isEmpty;
  const isDossierUnlocked =
    !isDossierEmpty && (stageIndex >= 8 || Boolean(soulProfile.arcade?.completed));

  const activeVoicePreset = VOICE_PRESETS[voicePresetId] || VOICE_PRESETS.spooky_oracle;

  const displayPrompts = quickPrompts && quickPrompts.length >= 4 ? quickPrompts : INITIAL_GREETING.quickPrompts;

  // Phase Title Helper
  const getPhaseHeaderLabel = () => {
    const arcadeBadge = soulProfile.arcade?.completed && soulProfile.arcade?.result
      ? ` • ${soulProfile.arcade.result.badge} SYNCED`
      : soulProfile.arcade?.choices?.length > 0
      ? ` • CRISIS 3D ${soulProfile.arcade.choices.length}/10`
      : '';
    if (stageIndex >= 8) return `✨ MAIN CHARACTER SOUL DOSSIER READY!${arcadeBadge}`;
    if (stageIndex < 2) return `REALITY CHECK: CONSTRAINTS & LIFE${arcadeBadge}`;
    if (stageIndex < 5) return `ENERGY & ENVIRONMENT QUIZ${arcadeBadge}`;
    return `BASE STATS & SKILL INVENTORY${arcadeBadge}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-[#080214] text-slate-100 font-fredoka overflow-x-hidden selection:bg-purple-500/40 selection:text-white">
      {/* Volumetric Green Fog Particle Emitter Layer */}
      <GreenFogBurst ref={fogBurstRef} />

      {/* Deep purple radial ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(147, 51, 234, 0.16) 0%, rgba(30, 10, 50, 0.5) 45%, rgba(8, 2, 20, 0.98) 85%)'
        }}
      />
      {/* Neon purple side auras */}
      <div
        className="pointer-events-none fixed -left-32 top-1/4 h-96 w-96 rounded-full opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, #6b21a8 50%, transparent 75%)' }}
      />
      <div
        className="pointer-events-none fixed -right-32 bottom-1/4 h-96 w-96 rounded-full opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, #3b82f6 50%, transparent 75%)' }}
      />

      <FogOverlay density={phase === 'landing' ? 'thick' : phase === 'emerging' ? 'parting' : 'ambient'} />

      {!authRole ? (
        /* ════════════════════════════════════════════════════
            SPECTRAL SANCTUARY LOGIN GATE (JUDGE & DEV ACCESS)
            ════════════════════════════════════════════════════ */
        <div className="relative z-30 flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 select-none">
          <CornerSpiderweb position="top-left" className="absolute top-0 left-0 w-24 h-24 sm:w-36 sm:h-36 pointer-events-none z-10 opacity-70" />
          <CornerSpiderweb position="bottom-right" className="absolute bottom-0 right-0 w-24 h-24 sm:w-36 sm:h-36 pointer-events-none z-10 opacity-70" />

          <div
            className="spooky-panel-frame relative max-w-md w-full p-6 sm:p-8 text-center backdrop-blur-2xl animate-fade-in"
            style={{
              boxShadow: '0 0 50px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(126, 34, 206, 0.25)',
              border: '2px solid rgba(168, 85, 247, 0.5)'
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-950/80 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-purple-200 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>SPECTRAL SANCTUARY // ACCESS GATE</span>
            </div>

            <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-500/20 border-2 border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
              <span className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>👻</span>
            </div>

            <h1 className="mt-3.5 font-fredoka font-black text-xl sm:text-2xl tracking-wide text-white leading-tight">
              THE FRIENDLY GHOST<br />
              <span className="bg-gradient-to-r from-[#a3e635] via-amber-300 to-purple-300 bg-clip-text text-transparent">
                CAREER COUNSELOR
              </span>
            </h1>

            {/* Gate Tab Switcher */}
            <div className="mt-4 flex rounded-xl border border-purple-500/40 bg-[#0d031c]/90 p-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  setGateTab('passcode');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  gateTab === 'passcode'
                    ? 'bg-purple-600/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'text-purple-300/70 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Passcode</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  setGateTab('waitlist');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                  gateTab === 'waitlist'
                    ? 'bg-purple-600/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'text-purple-300/70 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Guest Access</span>
              </button>
            </div>

            {gateTab === 'waitlist' ? (
              /* Guest Access Email Form (Formspree) */
              <form onSubmit={handleGuestAccessSubmit} className="mt-4 space-y-3.5 text-left animate-fade-in">
                <p className="text-xs text-purple-200/80 text-center leading-relaxed">
                  Enter your email to gain immediate <span className="text-[#a3e635] font-bold">Guest Access</span> to test drive the counselor.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                      First Name <span className="text-purple-400/60 lowercase font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={guestFirstName}
                      onChange={(e) => {
                        setGuestFirstName(e.target.value);
                        if (waitlistError) setWaitlistError('');
                      }}
                      placeholder="e.g. Alice"
                      autoComplete="given-name"
                      disabled={waitlistLoading || !!waitlistSuccessMsg}
                      className="w-full rounded-xl border border-purple-500/40 bg-[#110622]/90 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:border-[#a3e635] focus:outline-none focus:ring-2 focus:ring-[#a3e635]/30 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => {
                        setWaitlistEmail(e.target.value);
                        if (waitlistError) setWaitlistError('');
                      }}
                      placeholder="student@example.com"
                      autoComplete="email"
                      required
                      disabled={waitlistLoading || !!waitlistSuccessMsg}
                      className="w-full rounded-xl border border-purple-500/40 bg-[#110622]/90 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:border-[#a3e635] focus:outline-none focus:ring-2 focus:ring-[#a3e635]/30 disabled:opacity-50"
                    />
                  </div>
                </div>

                {waitlistError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-200 font-medium text-center">
                    {waitlistError}
                  </div>
                )}

                {waitlistSuccessMsg ? (
                  <div className="rounded-xl border border-green-500/40 bg-green-950/60 p-3 text-center animate-fade-in">
                    <p className="text-xs text-[#a3e635] font-bold flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#a3e635]" />
                      <span>{waitlistSuccessMsg}</span>
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-full py-3 font-fredoka font-black text-sm tracking-wider uppercase text-slate-950 shadow-[0_0_25px_rgba(163,230,53,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 45%, #facc15 100%)',
                      border: '2px solid rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <span>{waitlistLoading ? '🔮 Unlocking Sanctuary...' : '✨ Enter Sanctuary as Guest'}</span>
                  </button>
                )}

                <div className="text-[10px] text-center text-purple-300/50 pt-1 font-mono">
                  <span>Powered by Formspree • Immediate Access • No spam</span>
                </div>
              </form>
            ) : (
              /* Passcode Form (Judge & Dev) */
              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3.5 text-left">
                <p className="text-xs text-purple-200/80 text-center">
                  Enter your assigned Access ID and Passcode to enter the sanctuary.
                </p>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    Access ID
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Judge or Dev"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-purple-500/40 bg-[#110622]/90 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:border-[#a3e635] focus:outline-none focus:ring-2 focus:ring-[#a3e635]/30"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    Passcode
                  </label>
                  <input
                    type="password"
                    value={loginPasscode}
                    onChange={(e) => {
                      setLoginPasscode(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-purple-500/40 bg-[#110622]/90 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:border-[#a3e635] focus:outline-none focus:ring-2 focus:ring-[#a3e635]/30"
                  />
                </div>

                {loginError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-200 font-medium text-center">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full py-3 font-fredoka font-black text-sm tracking-wider uppercase text-slate-950 shadow-[0_0_25px_rgba(163,230,53,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 45%, #facc15 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <span>🔮 Unlock Sanctuary</span>
                </button>
              </form>
            )}

            {/* One-Click Judge Demo Access (Kiroween Hackathon Rule Compliance) */}
            <div className="mt-4 pt-4 border-t border-purple-500/25 space-y-2">
              <button
                type="button"
                onClick={() => completeRoleLogin('Judge')}
                className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 font-fredoka font-bold text-xs tracking-wider uppercase text-amber-200 border border-amber-400/50 bg-amber-500/15 hover:bg-amber-400 hover:text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.25)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>👑 One-Click Judge Access (No Passcode Needed)</span>
              </button>
              <p className="font-mono text-[10px] text-purple-300/75">
                Kiroween Judges: click above or sign in with <strong className="text-amber-200">Judge</strong> / <strong className="text-amber-200">kiroween2026</strong>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-2 pointer-events-none opacity-85">
            <Pumpkin className="w-9 h-8" />
            <Pumpkin className="w-12 h-10" />
            <Pumpkin className="w-8 h-7" />
          </div>
        </div>
      ) : phase !== 'counseling' ? (
        /* ════════════════════════════════════════════════════
            BEGINNING FIRST PAGE // LANDING SCREEN & SPECTRAL SUMMONING
            ════════════════════════════════════════════════════ */
        <div className="relative z-30 flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 select-none">
          {/* Corner Spiderwebs */}
          <CornerSpiderweb position="top-left" className="absolute top-0 left-0 w-24 h-24 sm:w-36 sm:h-36 pointer-events-none z-10 opacity-70" />
          <CornerSpiderweb position="bottom-right" className="absolute bottom-0 right-0 w-24 h-24 sm:w-36 sm:h-36 pointer-events-none z-10 opacity-70" />

          {/* Floating Spooky Elements */}
          <div className="absolute top-12 left-10 sm:left-24 pointer-events-none opacity-80 animate-float-slow">
            <MiniGhost className="w-10 h-10 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]" />
          </div>
          <div className="absolute bottom-16 right-10 sm:right-24 pointer-events-none opacity-80 animate-float-slow" style={{ animationDelay: '1.5s' }}>
            <MiniGhost className="w-8 h-8 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
          </div>

          {/* Central 3D Frosted Glass Landing Card */}
          <div
            className={`spooky-panel-frame relative max-w-xl w-full p-6 sm:p-9 text-center backdrop-blur-2xl transition-all duration-700 ${
              phase === 'emerging' ? 'scale-110 opacity-0 blur-lg pointer-events-none' : 'scale-100 opacity-100'
            }`}
            style={{
              boxShadow: '0 0 50px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(126, 34, 206, 0.25)',
              border: '2px solid rgba(168, 85, 247, 0.5)'
            }}
          >
            {/* Active Session Role Badge + Logout */}
            <div className="absolute top-3.5 right-4 flex items-center gap-1.5">
              <span className="rounded-full border border-purple-400/40 bg-purple-950/70 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                {authRole === 'Judge'
                  ? '👑 Judge'
                  : authRole === 'Dev'
                  ? '🛠️ Dev'
                  : guestFirstName
                  ? `👻 ${guestFirstName} (Guest)`
                  : '👻 Guest Seeker'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Switch User / Logout"
                className="rounded-full p-1 text-purple-300/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-950/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-200 shadow-sm">
              <span>✨</span>
              <span>KIROWEEN 2026 // HACKATHON ENTRY</span>
              <span>🦇</span>
            </div>

            {/* Glowing Spectral Orb Icon */}
            <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-500/20 border-2 border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.6)] animate-pulse">
              <span className="text-4xl animate-bounce" style={{ animationDuration: '3s' }}>👻</span>
            </div>

            {/* Main Title */}
            <h1 className="mt-4 font-fredoka font-black text-2xl sm:text-4xl tracking-wide text-white leading-tight drop-shadow-[0_4px_16px_rgba(168,85,247,0.5)]">
              THE FRIENDLY GHOST<br />
              <span className="bg-gradient-to-r from-[#a3e635] via-amber-300 to-purple-300 bg-clip-text text-transparent">
                CAREER COUNSELOR
              </span>
            </h1>

            {/* Tagline / Subtitle */}
            <p className="mt-3.5 text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-md mx-auto">
              Feeling cooked about life after high school? Step into the mist for a 3-phase reality check, energy &amp; environment quiz, and unlock your custom Tarot Career Arcana Cards.
            </p>

            {/* 3 Phases Preview */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
              <div className="rounded-2xl border border-purple-500/30 bg-[#120524]/85 p-3 shadow-inner">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">Phase 01</div>
                <div className="text-xs font-bold text-white mt-0.5">Reality Check</div>
                <div className="text-[10px] text-purple-200/70 mt-0.5">Finances &amp; spawn point</div>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-[#120524]/85 p-3 shadow-inner">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#a3e635]">Phase 02</div>
                <div className="text-xs font-bold text-white mt-0.5">Energy Profile</div>
                <div className="text-[10px] text-purple-200/70 mt-0.5">Battery drain &amp; team flow</div>
              </div>
              <div className="rounded-2xl border border-purple-500/30 bg-[#120524]/85 p-3 shadow-inner">
                <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Phase 03</div>
                <div className="text-xs font-bold text-white mt-0.5">Soul Dossier</div>
                <div className="text-[10px] text-purple-200/70 mt-0.5">Career cards &amp; 90-day plan</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleSummonCounselor}
                className="group relative flex items-center gap-2.5 rounded-full px-7 py-3 font-fredoka font-black text-sm sm:text-base tracking-wider uppercase text-slate-950 shadow-[0_0_30px_rgba(163,230,53,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 45%, #facc15 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">🔮</span>
                <span>Part the Mist &amp; Summon Counselor</span>
                <span className="text-xl">✨</span>
              </button>

              {/* 3D Crisis Simulator Arcade Launcher */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClickSound();
                  setIsArcadeOpen(true);
                }}
                className="group flex items-center gap-2 rounded-full px-6 py-2.5 font-fredoka font-bold text-xs sm:text-sm tracking-wider uppercase text-purple-200 border border-purple-400/50 bg-purple-950/70 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-105 hover:bg-purple-900/90 hover:text-white active:scale-95"
              >
                <Gamepad2 className="w-4 h-4 text-purple-400 group-hover:animate-pulse" />
                <span>Play Crisis Simulator Arcade (3D)</span>
                <span className="text-xs">🕹️</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-purple-300/80 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-[#a3e635]" />
                <span>Interactive Voice &amp; Procedural Audio • Real-Time AI</span>
              </div>
            </div>
          </div>

          {/* Bottom Pumpkins Accent */}
          <div className="mt-6 flex items-end gap-2 pointer-events-none opacity-85">
            <Pumpkin className="w-9 h-8" />
            <Pumpkin className="w-12 h-10" />
            <Pumpkin className="w-8 h-7" />
          </div>
        </div>
      ) : (
        /* Main App Container */
        <div className="relative z-30 mx-auto flex max-w-7xl flex-col px-2.5 sm:px-4 py-2" style={{ height: '100svh', maxHeight: '100svh', overflow: 'hidden' }}>
        
        {/* ════════════════════════════════════════════════════
            TOP NAVIGATION / HEADER BAR
            ════════════════════════════════════════════════════ */}
        <header className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 px-2 py-1.5 shrink-0 select-none">
          {/* Left Title */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-fredoka font-black text-xs sm:text-sm md:text-[15px] tracking-wide text-white whitespace-nowrap drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)]">
              THE FRIENDLY GHOST CAREER COUNSELOR
            </h1>
          </div>

          {/* Right Colorful Jelly Pill Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Intro / Mist First Page Button - Purple Pill */}
            <button
              onClick={handleReturnToLanding}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-400/40 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Return to the Beginning Landing Page"
            >
              <span>🌫️</span>
              <span>Intro</span>
            </button>

            {/* Replay Intro - Pink Pill */}
            <button
              onClick={handleRestartSession}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-[#f472b6] hover:bg-[#ec4899] text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Replay Greeting & Reset Session"
            >
              <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Reset Chat</span>
            </button>

            {/* Voice: Crystal... - Neon Lime Pill */}
            <button
              onClick={handleCycleVoicePreset}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-[#a3e635] hover:bg-[#84cc16] text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Switch Voice Style"
            >
              <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Voice: {voicePresetId === 'spooky_oracle' ? 'Crystal...' : activeVoicePreset.label.split(' ')[0] + '...'}</span>
            </button>

            {/* Audio: ON / Muted - Purple Pill */}
            <button
              onClick={handleToggleVoice}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Toggle Audio"
            >
              {voiceEnabled ? <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <VolumeX className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              <span>Audio: {voiceEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Mirror: OFF / ON - Orange Pill */}
            <button
              onClick={() => {
                soundEngine.playClickSound();
                handleSetScryingActive(!isScryingActive);
              }}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-[#fb923c] hover:bg-[#f97316] text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Toggle Scrying Mirror (webcam emotion analysis)"
            >
              {isScryingActive ? <CameraOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Camera className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              <span>Mirror: {isScryingActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* AI Settings - Lavender Pill */}
            <button
              onClick={() => {
                setTempKey(apiKey);
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Configure API Settings"
            >
              <KeyRound className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>AI Settings</span>
            </button>

            {/* Soul Dossier - Golden Amber Pill */}
            <button
              onClick={() => {
                if (isDossierEmpty) {
                  soundEngine.playClickSound();
                } else {
                  soundEngine.playDossierReveal();
                }
                setIsDossierOpen(true);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold shadow-md transition-all hover:scale-105 active:scale-95 shrink-0 ${
                isDossierEmpty
                  ? 'bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-amber-400/40'
                  : 'bg-[#f59e0b] hover:bg-[#d97706] text-slate-950'
              } ${isDossierUnlocked ? 'animate-pulse ring-2 ring-amber-300' : ''}`}
              title={
                isDossierEmpty
                  ? 'Soul Dossier (Empty — chat or play Crisis Simulator 3D to populate)'
                  : 'Open Career Soul Dossier'
              }
            >
              <ScrollText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>
                Soul Dossier {isDossierEmpty ? '(Empty)' : isDossierUnlocked ? '✨' : '• Live'}
              </span>
            </button>

            {/* Crisis Simulator 3D Arcade - Fuchsia Gradient Pill */}
            <button
              onClick={() => {
                soundEngine.playClickSound();
                setIsArcadeOpen(true);
              }}
              className="flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-fredoka font-bold bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Play 3D Crisis Simulator Arcade Assessment"
            >
              <Gamepad2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-950" />
              <span>Crisis 3D 🕹️</span>
            </button>
          </div>
        </header>

        {/* ════════════════════════════════════════════════════
            TWO-PANEL COUNSELOR & CHAT LAYOUT
            Left: Spectral Sanctuary | Right: Career Counseling & Chat
            ════════════════════════════════════════════════════ */}
        <main className="mt-1 flex flex-row gap-3 overflow-hidden" style={{ flex: '1 1 0', minHeight: 0 }}>

          {/* ──────────────────────────────────────────────────
              LEFT PANEL // SEC. 01 // SPECTRAL CAREER SANCTUARY
              ────────────────────────────────────────────────── */}
          <div
            className="spooky-panel-frame relative flex flex-col overflow-hidden"
            style={{
              flex: '0 0 49%',
              minHeight: 0
            }}
          >
            {/* Top-Left White Corner Spiderweb */}
            <CornerSpiderweb position="top-left" className="absolute top-0 left-0 w-16 h-16 pointer-events-none z-10" />

            {/* Left Border Dripping Candle Accent */}
            <Candle className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-9 pointer-events-none z-10 opacity-70" />

            {/* Left Border Floating Mini Ghost Accent */}
            <MiniGhost className="absolute left-1 bottom-24 w-5 h-5 pointer-events-none z-10 opacity-60" />

            {/* ── Section Header Strip ── */}
            <div className="relative flex items-center justify-between px-4 py-2 border-b border-purple-500/30 shrink-0 bg-[#16082c]/80 z-20">
              <span className="font-fredoka font-black text-xs text-[#a3e635] tracking-wider whitespace-nowrap drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]">
                SPECTRAL CAREER SANCTUARY
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <Volume2 className="h-3.5 w-3.5 text-lime-400 opacity-80" />
                <CandyCorn className="w-3.5 h-3.5" />
                <Candle className="w-2.5 h-5" />
              </div>
            </div>

            {/* Enable Scrying Mirror Button positioned below header in showcase */}
            {!isScryingActive && (
              <div className="absolute top-10 right-3 z-30">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClickSound();
                    handleSetScryingActive(true);
                  }}
                  className="flex items-center gap-1 rounded-full px-2.5 py-0.5 font-fredoka font-bold text-[10px] border border-purple-400/50 bg-purple-950/80 text-purple-200 hover:text-white whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition"
                  title="Enable Scrying Mirror"
                >
                  <Camera className="h-3 w-3 text-amber-300" />
                  <span>Enable Scrying Mirror</span>
                </button>
              </div>
            )}

            {/* ── Centerpiece: Rainbow Ring Showcase Portal & Ghost Counselor ── */}
            <div
              className={`relative flex flex-1 items-center overflow-hidden min-h-0 ${
                isScryingActive ? 'justify-evenly gap-1.5 px-2' : 'justify-center'
              }`}
            >
              <div className="flex items-center justify-center min-w-0 flex-1 h-full">
                <GhostSphere3D
                  phase={phase}
                  mood={mood}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  isThinking={isThinking}
                  mouthOpenness={mouthOpenness}
                  auraPoints={auraPoints}
                  mousePosition={mousePosition}
                  isVoiceSoftened={isVoiceSoftened}
                  stageIndex={stageIndex}
                  compact={isScryingActive}
                />
              </div>

              {/* Scrying Mirror Component side-by-side when active (no overlap with Ghost or Outfit Switcher) */}
              {isScryingActive && (
                <div className="shrink-0 z-30 flex items-center justify-center">
                  <ScryingMirror
                    isActive={isScryingActive}
                    onToggleActive={handleSetScryingActive}
                    onVibeChange={(vibe) => setCurrentVibe(vibe)}
                    onAutoSubmitVibe={handleAutoSubmitVibe}
                    initialStreamPromise={scryingStreamPromise}
                    isThinking={isThinking}
                  />
                </div>
              )}
            </div>

            {/* ── Current Counseling Phase Banner ── */}
            <div className="px-3 mb-1 shrink-0">
              <div className="w-full text-center py-1 rounded-full bg-purple-950/85 border border-purple-500/40 font-fredoka font-bold text-xs text-purple-200 shadow-sm truncate">
                {getPhaseHeaderLabel()}
              </div>
            </div>

            {/* ── Voice Active Strip ── */}
            <div className="px-3 mb-1 flex items-center justify-between gap-2 shrink-0">
              <span className="font-fredoka font-bold text-[10px] text-slate-300 tracking-wider">
                QUICK REPLIES (TAP OR SPEAK):
              </span>
              <div className="flex items-center gap-1.5 font-fredoka text-[10px]">
                {isVoiceSoftened && (
                  <span className="rounded-full border border-cyan-400/50 bg-cyan-950/70 px-2 py-0.5 text-[9.5px] font-bold text-cyan-200 animate-pulse">
                    🕊️ Gentle Voice
                  </span>
                )}
                <div className="flex items-center gap-1 text-lime-300">
                  <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
                  <span>
                    {isSpeaking
                      ? isVoiceSoftened
                        ? 'Speaking gently...'
                        : 'Counselor speaking...'
                      : isListening
                      ? 'Listening...'
                      : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2x2 Grid of Stitched Quick-Reply Buttons ── */}
            <div className="px-3 pb-2 grid grid-cols-2 gap-2 shrink-0">
              {displayPrompts.slice(0, 4).map((prompt, idx) => {
                const styles = [
                  { bg: '#a3e635', color: '#022c10', stitch: '#f97316' },
                  { bg: '#f97316', color: '#1e1b4b', stitch: '#a3e635' },
                  { bg: '#fb923c', color: '#1e1b4b', stitch: '#ec4899' },
                  { bg: '#a3e635', color: '#022c10', stitch: '#84cc16' }
                ];
                const s = styles[idx % styles.length];
                return (
                  <HalloweenStitchedButton
                    key={idx}
                    text={prompt}
                    bgColor={s.bg}
                    textColor={s.color}
                    stitchColor={s.stitch}
                    onClick={() => handleSendMessage(prompt)}
                    onFogBurst={(x, y) => fogBurstRef.current?.trigger(x, y)}
                  />
                );
              })}
            </div>

            {/* ── Text Input Row with Mic, Placeholder, and Purple Cauldron Send ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2 px-3 pb-2 shrink-0"
            >
              <div className="flex-1 flex items-center rounded-full border border-purple-500/60 bg-[#16082c] px-3 py-1 shadow-inner">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1 rounded-full transition-all mr-1.5 ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'text-purple-300 hover:text-amber-300'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak to Counselor'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? 'Listening to your voice...' : 'Type your answer or ask anything...'}
                  className="flex-1 bg-transparent text-xs sm:text-sm font-fredoka text-white placeholder-purple-300/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="p-0.5 rounded-full text-purple-200 hover:text-white disabled:opacity-35 transition-transform hover:scale-110 active:scale-95"
                  title="Send to Counselor"
                >
                  <Cauldron className="w-6 h-6" bubbling={Boolean(inputText.trim())} />
                </button>
              </div>
            </form>
          </div>

          {/* ──────────────────────────────────────────────────
              RIGHT PANEL // SEC. 02 // CAREER COUNSELING & CHAT
              ────────────────────────────────────────────────── */}
          <div
            className="spooky-panel-frame relative flex flex-col overflow-hidden flex-1"
            style={{ minHeight: 0 }}
          >
            {/* Bottom-Right Corner Spiderweb */}
            <CornerSpiderweb position="bottom-right" className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none z-10" />

            {/* Right Border Dripping Candle Accent */}
            <Candle className="absolute -right-1 top-1/3 -translate-y-1/2 w-4 h-9 pointer-events-none z-10 opacity-70" />

            {/* Top-Right Border Purple Bat Accent */}
            <Bat className="absolute right-28 top-2 w-6 h-5 pointer-events-none z-10 opacity-70" />

            {/* Bottom smiling Jack-o'-lantern pumpkins (positioned above AI disclaimer strip) */}
            <div className="absolute right-12 bottom-9 z-10 pointer-events-none opacity-85">
              <Pumpkin className="w-8 h-7" />
            </div>

            {/* ── Section Header Strip ── */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-purple-500/30 shrink-0 bg-[#16082c]/80 z-20">
              <span className="font-fredoka font-black text-xs text-[#a3e635] tracking-wider drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]">
                CAREER COUNSELING &amp; CHAT
              </span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <WrappedCandy className="w-3.5 h-3.5" />
                <Candle className="w-2.5 h-5" />
              </div>
            </div>

            {/* ── Live Trait Compass Strip (Passions / Strengths / Boundaries / Crisis 3D) ── */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 bg-[#120524]/90 border-b border-purple-500/20 text-[11px] font-fredoka z-20 shrink-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-amber-300">🔥 Passions: <strong className="text-white">{traits.passions.length}</strong></span>
                <span className="text-lime-300">✨ Strengths: <strong className="text-white">{traits.strengths.length}</strong></span>
                <span className="text-cyan-300">🛡️ Boundaries: <strong className="text-white">{traits.weaknesses.length}</strong></span>
                {soulProfile.arcade?.completed && soulProfile.arcade?.result ? (
                  <span className="text-fuchsia-300">
                    {soulProfile.arcade.result.badge}{' '}
                    <strong className="text-white">
                      {soulProfile.arcade.result.title.split('/')[0].trim()}
                    </strong>
                  </span>
                ) : soulProfile.arcade?.choices?.length > 0 ? (
                  <span className="text-fuchsia-300">
                    🕹️ Crisis 3D: <strong className="text-white">{soulProfile.arcade.choices.length}/10</strong>
                  </span>
                ) : null}
                <span className="text-purple-300">⚡ Aura: <strong className="text-[#a3e635]">+{auraPoints.toLocaleString()}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isDossierEmpty) {
                    soundEngine.playClickSound();
                  } else {
                    soundEngine.playDossierReveal();
                  }
                  setIsDossierOpen(true);
                }}
                className="text-amber-200 hover:text-amber-100 font-bold underline flex items-center gap-1 transition"
              >
                <span>{isDossierEmpty ? 'Soul Dossier (Empty)' : 'Soul Dossier'}</span>
                <span className="text-xs">📜</span>
              </button>
            </div>

            {/* ── Scrollable Messages utilizing Full Height ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSafety = Boolean(msg.isSafetyIntervention);

                if (isUser) {
                  return (
                    <div key={msg.id} className="flex items-start gap-3">
                      {/* User Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-cyan-400 bg-[#0f172a] shadow-[0_0_12px_rgba(34,211,238,0.7)] flex items-center justify-center shrink-0">
                        <span className="text-base select-none">🎓</span>
                      </div>
                      {/* Bright Lime Neon Green Bubble */}
                      <div className="flex-1 rounded-[22px] bg-[#a3e635] text-slate-950 px-5 py-3 shadow-[0_0_16px_rgba(163,230,53,0.35)]">
                        <div className="font-fredoka font-black text-xs text-slate-950">
                          You
                        </div>
                        <div className="font-fredoka font-medium text-xs sm:text-sm text-slate-950 leading-relaxed mt-0.5 whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Friendly Ghost Counselor Message
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    {/* Counselor Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-purple-400 bg-[#1e0a35] shadow-[0_0_12px_rgba(168,85,247,0.7)] flex items-center justify-center shrink-0">
                      <MiniGhost className="w-6 h-6" />
                    </div>
                    {/* Deep Midnight Purple Card with Neon Purple (or Calming Cyan) Border */}
                    <div
                      className={`flex-1 rounded-[22px] bg-[#1a0a2e] border-2 text-white px-5 py-3 ${
                        msg.softenVoice
                          ? 'border-cyan-400/80 shadow-[0_0_22px_rgba(34,211,238,0.28)]'
                          : 'border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-fredoka font-black text-xs text-purple-200 flex items-center gap-1.5 flex-wrap">
                          <span>{msg.hostTitle || 'Friendly Ghost Counselor'}</span>
                          <span className="text-[10px] text-amber-300">✨</span>
                          {msg.softenVoice && (
                            <span className="rounded-full border border-cyan-400/50 bg-cyan-950/80 px-2 py-0.5 text-[9.5px] font-mono font-bold text-cyan-200">
                              🕊️ Softened Voice
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(msg)}
                          title="Hear this spoken aloud"
                          className="rounded-lg p-1 text-purple-300 hover:text-white hover:scale-110 transition"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="font-fredoka font-normal text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>

                      {isSafety && (
                        <div className="mt-3 rounded-xl border border-rose-400/50 bg-rose-950/70 p-2.5 text-xs text-rose-200 font-fredoka">
                          <strong>Immediate Resources:</strong> Call or text 988 (Suicide &amp; Crisis Lifeline) in the US/Canada or reach out to a trusted adult immediately.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Dossier Ready Callout Card when unlocked */}
              {isDossierUnlocked && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-amber-950/60 border border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📜</span>
                    <div>
                      <div className="font-fredoka font-black text-xs sm:text-sm text-amber-200">
                        Main Character Soul Dossier Synced!
                      </div>
                      <div className="text-[11px] text-purple-200/80">
                        {currentDossier.careerCards?.[0]
                          ? `Top Match: ${currentDossier.careerCards[0].careerTitle} (${currentDossier.careerCards[0].matchPercent}% Match) + 90-day roadmap ready.`
                          : 'Your 3 Tarot Career Arcana Cards & 90-day post-high-school roadmap are ready.'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playDossierReveal();
                      setIsDossierOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-full font-fredoka font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shrink-0 hover:scale-105 active:scale-95 transition"
                  >
                    Open Dossier ✨
                  </button>
                </div>
              )}

              {isThinking && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full border-2 border-purple-400 bg-[#1e0a35] flex items-center justify-center shrink-0">
                    <MiniGhost className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="rounded-[22px] bg-[#1a0a2e] border border-purple-500/50 px-4 py-2.5 text-xs text-purple-200 font-fredoka flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                    <span>Friendly Ghost Counselor is consulting the spectral realm...</span>
                  </div>
                </div>
              )}

              {isListening && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full border-2 border-cyan-400 bg-[#0f172a] flex items-center justify-center shrink-0">
                    <MiniGhost className="w-5 h-5" />
                  </div>
                  <div className="rounded-[22px] bg-[#172554] border border-cyan-400/50 px-4 py-2 text-xs text-cyan-200 font-fredoka flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
                    <span>{interimTranscript || 'Listening to your voice...'}</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ── AI Guidance Disclaimer Footer Strip ── */}
            <div
              role="note"
              className="flex items-center gap-2 border-t border-amber-400/25 bg-[#16082c]/95 px-5 py-2 text-[10.5px] sm:text-[11px] leading-snug text-purple-100/90 z-20 shrink-0"
            >
              <Info className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>
                <strong className="text-amber-200 font-semibold">Spectral Note:</strong> Our Ghost Counselor uses AI to brainstorm paths with you. Always double-check facts, salaries, and big decisions with a real-world mentor.
              </span>
            </div>
          </div>
        </main>
      </div>
      )}

      {/* Soul Dossier Modal */}
      <SoulDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        dossier={currentDossier}
        onStartChat={() => setPhase('counseling')}
        onLaunchArcade={() => {
          soundEngine.playClickSound();
          setIsArcadeOpen(true);
        }}
        onDiscussCareer={handleDiscussCareerFromDossier}
      />

      {/* 3D Crisis Simulator Arcade Assessment Modal */}
      <ArcadeAssessmentModal
        isOpen={isArcadeOpen}
        onClose={handleArcadeClose}
        onSyncResult={handleArcadeSyncResult}
        onScenarioChoice={handleArcadeScenarioChoice}
        onGameComplete={handleArcadeGameComplete}
        onSelectPathway={handleArcadePathwaySelect}
        onOpenDossier={() => {
          if (isDossierEmpty) {
            soundEngine.playClickSound();
          } else {
            soundEngine.playDossierReveal();
          }
          setIsDossierOpen(true);
        }}
        soulProfile={soulProfile}
        dossier={currentDossier}
        sessionResetKey={sessionResetKey}
        voiceEnabled={voiceEnabled}
        voicePresetId={voicePresetId}
      />

      {/* AI Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md font-fredoka">
          <div className="spooky-panel-frame w-full max-w-md overflow-hidden bg-[#16082c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <span className="font-fredoka font-black text-xs text-[#a3e635] uppercase tracking-wider">
                CONFIG // AI &amp; CHARACTER VOICE
              </span>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-300 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="pt-4">
              <form onSubmit={handleSaveApiKey}>
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Gemini API Key (Optional)
                </label>
                <p className="mt-1 text-[11px] text-purple-200/70">
                  For enhanced AI commentary. Leave blank to use built-in fallback engine.
                </p>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="mt-2 w-full rounded-xl bg-purple-950/60 border border-purple-400/40 px-3.5 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-[#a3e635]"
                />

                <div className="mt-5">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Character Voice Style</p>
                  <div className="mt-2 space-y-1.5">
                    {Object.entries(VOICE_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setVoicePresetId(key)}
                        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition ${
                          voicePresetId === key
                            ? 'border-[#a3e635] bg-[#a3e635]/15 text-lime-200 font-bold'
                            : 'border-purple-500/20 bg-purple-950/30 text-slate-300 hover:border-purple-400/50'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {voicePresetId === key && <Check className="h-4 w-4 text-[#a3e635]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Save Settings
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   HALLOWEEN STITCHED QUICK-HEX PILL BUTTON
   ========================================================================== */
function HalloweenStitchedButton({
  text,
  bgColor,
  textColor = '#0f172a',
  stitchColor = '#ea580c',
  onClick,
  onFogBurst
}) {
  const handleClick = (e) => {
    soundEngine.playJellySquishSound();
    soundEngine.playFogBurstSound();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      onFogBurst?.(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="halloween-stitched-btn relative w-full h-[36px] rounded-full px-2 py-0.5 flex items-center justify-center text-center font-fredoka font-bold text-[9.5px] sm:text-[10.5px] leading-tight select-none shadow-[0_3px_10px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: `2px dashed ${stitchColor}`,
      }}
    >
      <span className="truncate drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
        {text}
      </span>
    </button>
  );
}
