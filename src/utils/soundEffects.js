// Web Audio API Procedural Soundscape & Web Speech API Voice Handler
// Friendly Ghost Counselor Edition (Kiroween 2026) // 100% Local & Free Browser APIs

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Subtle tactile crystal tap when user sends a message or clicks a 3D pill
  playClickSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.08); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignore audio errors if blocked
    }
  }

  // Satisfying tactile squishy jelly sound when user presses on an answer button
  playJellySquishSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch scoops down and wobbles back up like elastic gelatin
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch {
      // Ignore audio errors if blocked
    }
  }

  // Silky elastic twang when the virtual spiderweb stretches and snaps back
  playWebSnapSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High-frequency harmonic twang
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.22);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1260, now);
      osc2.frequency.exponentialRampToValueAtTime(390, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.26);
      osc2.stop(now + 0.26);
    } catch {
      // Ignore audio errors
    }
  }

  // Soft ectoplasmic whoosh when green fog particles burst from an answer button
  playFogBurstSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // White noise buffer for soft gas/fog puff
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Lowpass filter for deep muffled fog puff
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.22);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch {
      // Ignore audio errors
    }
  }

  // Gentle, warm calming chime played when the ghost detects stress/anxiety and softens voice
  playCalmingTone() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Gentle soft major chord (E4, G#4, B4, E5) with soft attack & long soothing decay
      const notes = [329.63, 415.30, 493.88, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.038, now + idx * 0.1 + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.1 + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 2.6);
      });
    } catch {
      // Ignore
    }
  }

  // Friendly magical spooky-cute whoosh & sparkling chime when summoned from the mist
  playEmergenceSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Soft misty breeze whoosh
      const bufferSize = this.ctx.sampleRate * 2.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(220, now);
      bandpass.frequency.exponentialRampToValueAtTime(880, now + 1.1);
      bandpass.frequency.exponentialRampToValueAtTime(320, now + 2.4);
      bandpass.Q.value = 3.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.9);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);
      whiteNoise.stop(now + 2.5);

      // 2. Warm, magical major-9th crystal ball arpeggio (F4, A4, C5, E5, G5)
      const freqs = [349.23, 440.0, 523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.1 * idx);

        gain.gain.setValueAtTime(0.001, now + 0.1 * idx);
        gain.gain.linearRampToValueAtTime(0.065, now + 0.35 + 0.1 * idx);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 2.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.1 * idx);
        osc.stop(now + 2.7);
      });
    } catch {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  }

  // Upbeat "+Aura" sparkle chime when the Ghost Counselor responds or a trait is discovered
  playTraitChime(type = 'strength') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq =
        type === 'passion' ? 587.33 : type === 'strength' ? 523.25 : 440.0;

      [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.07);

        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.055, now + i * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + i * 0.07 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.95);
      });
    } catch {
      // Ignore
    }
  }

  // Magical chord when Soul Dossier is unlocked
  playDossierReveal() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [329.63, 392.0, 493.88, 587.33, 783.99];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.001, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.06, now + i * 0.09 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + i * 0.09 + 1.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 2.0);
      });
    } catch {
      // Ignore
    }
  }

  // 8-bit retro arcade portal warp chirp when avatar collides with a choice portal
  playArcadePortalWarp(trait = 'Maker') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = trait === 'Maker' ? 440 : trait === 'Architect' ? 523.25 : trait === 'Catalyst' ? 659.25 : 783.99;

      // Fast rising arpeggio blips
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);

        gain.gain.setValueAtTime(0.001, now + idx * 0.035);
        gain.gain.linearRampToValueAtTime(0.045, now + idx * 0.035 + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.035 + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  // Subtle 8-bit blip for arcade game steps or UI hover
  playArcadeStep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Ignore
    }
  }

  // Triumphant 8-bit character unlock fanfare for assessment completion
  playArcadeUnlockFanfare() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.09 },
        { f: 783.99, t: 0.18 },
        { f: 1046.5, t: 0.27 },
        { f: 880.0,  t: 0.42 },
        { f: 1046.5, t: 0.54 }
      ];

      chords.forEach(({ f, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(0.06, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + t + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();

// Voice Presets so the user can switch between Friendly Gen-Z Bestie, Chill Spectral Mentor, or Haunting Oracle
export const VOICE_PRESETS = {
  friendly_genz: {
    id: 'friendly_genz',
    label: 'Friendly Ghost Bestie (Upbeat)',
    pitch: 1.15,
    rate: 1.06,
    preferredNames: [
      'Microsoft Aria Online (Natural)',
      'Microsoft Jenny Online (Natural)',
      'Microsoft Ana Online (Natural)',
      'Google US English',
      'Samantha',
      'Ava',
      'Zoe',
      'Victoria',
      'Microsoft Zira'
    ]
  },
  chill_mentor: {
    id: 'chill_mentor',
    label: 'Chill Spectral Mentor (Warm)',
    pitch: 0.96,
    rate: 1.0,
    preferredNames: [
      'Microsoft Guy Online (Natural)',
      'Microsoft Christopher Online (Natural)',
      'Microsoft Roger Online (Natural)',
      'Google UK English Male',
      'Daniel',
      'Alex',
      'Microsoft David'
    ]
  },
  spooky_oracle: {
    id: 'spooky_oracle',
    label: 'Crystal Ball Oracle (Ethereal)',
    pitch: 0.82,
    rate: 0.92,
    preferredNames: [
      'Microsoft Sonia Online (Natural)',
      'Microsoft Libby Online (Natural)',
      'Google UK English Female',
      'Microsoft Hazel',
      'Moira',
      'Karen',
      'Microsoft Zira'
    ]
  }
};

// Module-level references to prevent Chromium from garbage-collecting active utterances mid-speech
let activeSpeechInterval = null;
let activeSpeakTimeout = null;
let currentUtterance = null;
let cachedVoices = [];

function loadVoices() {
  if (!('speechSynthesis' in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list && list.length > 0) {
    cachedVoices = list;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function stopGhostSpeech(onMouthUpdate) {
  if (activeSpeakTimeout) {
    clearTimeout(activeSpeakTimeout);
    activeSpeakTimeout = null;
  }
  if (activeSpeechInterval) {
    clearInterval(activeSpeechInterval);
    activeSpeechInterval = null;
  }
  currentUtterance = null;
  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore
    }
  }
  if (onMouthUpdate) onMouthUpdate(0);
}

export function speakGhostText(
  text,
  {
    voiceEnabled = true,
    voicePresetId = 'friendly_genz',
    isSafetyIntervention = false,
    softenVoice = false,
    onStart,
    onEnd,
    onMouthUpdate
  } = {}
) {
  // Clear timers and cancel any ongoing speech
  if (activeSpeakTimeout) {
    clearTimeout(activeSpeakTimeout);
    activeSpeakTimeout = null;
  }
  if (activeSpeechInterval) {
    clearInterval(activeSpeechInterval);
    activeSpeechInterval = null;
  }
  if (onMouthUpdate) onMouthUpdate(0);

  if (!voiceEnabled || soundEngine.isMuted || !('speechSynthesis' in window) || !text) {
    if (onEnd) onEnd();
    return;
  }

  const wasSpeaking =
    window.speechSynthesis.speaking || window.speechSynthesis.pending;
  if (wasSpeaking) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }

  // Strip markdown formatting and emojis for smooth, natural speech synthesis
  const cleanText = text
    .replace(/[*_~`#>-]/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\+1,000/g, 'plus 1000')
    .replace(/\+5,000/g, 'plus 5000')
    .replace(/\+500/g, 'plus 500')
    .replace(/\+\/-|\+/g, ' plus ')
    .replace(/\bIRL\b/g, 'in real life')
    .replace(/\bngl\b/gi, 'not gonna lie')
    .replace(/\btbh\b/gi, 'to be honest')
    .replace(/\bASAP\b/g, 'as soon as possible')
    .replace(/\n+/g, '. ')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // Wait 60ms if we just canceled previous speech to avoid Chromium's cancel-kills-next-speak bug
  const delayMs = wasSpeaking ? 65 : 10;

  activeSpeakTimeout = setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance = utterance; // Prevent GC mid-utterance

      const preset = VOICE_PRESETS[voicePresetId] || VOICE_PRESETS.friendly_genz;
      const voices = loadVoices();
      let chosenVoice = null;

      for (const nameFragment of preset.preferredNames) {
        chosenVoice = voices.find(
          (v) => v.lang.startsWith('en') && v.name.includes(nameFragment)
        );
        if (chosenVoice) break;
      }

      if (!chosenVoice) {
        chosenVoice =
          voices.find((v) => v.lang.startsWith('en-US') && v.name.includes('Natural')) ||
          voices.find((v) => v.lang.startsWith('en-US')) ||
          voices.find((v) => v.lang.startsWith('en'));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }

      if (isSafetyIntervention) {
        utterance.pitch = 1.0;
        utterance.rate = 0.92;
        utterance.volume = 1.0;
      } else if (softenVoice) {
        // Noticeably softened, calm, hushed comfort voice across all voice presets
        utterance.pitch = Math.max(0.75, (preset.pitch || 1.0) * 0.9);
        utterance.rate = Math.max(0.76, (preset.rate || 1.0) * 0.82);
        utterance.volume = 0.58;
      } else {
        utterance.pitch = preset.pitch;
        utterance.rate = preset.rate;
        utterance.volume = 1.0;
      }

      const startMouthAnimation = () => {
        if (onStart) onStart();
        if (activeSpeechInterval) clearInterval(activeSpeechInterval);
        activeSpeechInterval = setInterval(() => {
          // Keep Chromium online voices from auto-pausing on long sentences
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          if (onMouthUpdate) {
            const openness = 0.3 + Math.random() * 0.7;
            onMouthUpdate(openness);
          }
        }, 90);
      };

      utterance.onstart = startMouthAnimation;

      utterance.onboundary = () => {
        if (onMouthUpdate) {
          onMouthUpdate(0.45 + Math.random() * 0.55);
        }
      };

      const cleanup = () => {
        if (currentUtterance === utterance) {
          currentUtterance = null;
        }
        if (activeSpeechInterval) {
          clearInterval(activeSpeechInterval);
          activeSpeechInterval = null;
        }
        if (onMouthUpdate) onMouthUpdate(0);
        if (onEnd) onEnd();
      };

      utterance.onend = cleanup;
      utterance.onerror = cleanup;

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onMouthUpdate) onMouthUpdate(0);
      if (onEnd) onEnd();
    }
  }, delayMs);
}
