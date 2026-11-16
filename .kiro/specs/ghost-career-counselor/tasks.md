# Implementation Tasks: The Friendly Ghost Career Counselor

## Iteration 1: Core Counseling Protocol & Safety Guardrails
- [x] **Task 1.1: Kiro Steering & Persona Protocol Setup**
  - [x] Define 3-phase counseling rules, one-question-per-turn constraint, and 2026 teen/gaming slang guidelines in `.kiro/steering/friendly_ghost_counselor_system_prompt.md`.
  - [x] Define Zod output schema (`GhostResponseSchema`) and project steering rules in `.kiro/rules.md`.
- [x] **Task 1.2: Dual-Engine Counseling AI & Crisis Guardrails**
  - [x] Implement mandatory crisis intervention (`isSafetyInterventionTriggered` & `MANDATORY_SAFETY_RESPONSE` with `988` resources).
  - [x] Implement "crashing out" frustration de-escalation and empathetic boundary reframing.
  - [x] Build 10-stage progression engine with Google Gemini (`gemini-2.5-flash`), open-ended user question answering, and zero-config offline fallback.
  - [x] Build real-time trait extraction (`Passions`, `Strengths`, and `Reframed Weaknesses`).

## Iteration 2: Costume Contest Sanctuary, Outfit Switcher & Soul Dossier
- [x] **Task 2.1: Haunting Sanctuary & Interactive Costume Rig**
  - [x] Build multi-layered drifting volumetric fog (`FogOverlay`) and atmospheric Halloween decorations (spiderwebs, bats, candles, cauldrons).
  - [x] Build interactive Ghost Counselor avatar with **Costume Contest Switcher** (**🎧 Streetwear Fit** vs. **🧙‍♂️ Wizard Hat Fit**) and real-time mouth lip-sync.
  - [x] Implement procedural Web Audio sound effects, microphone speech recognition (`SpeechRecognition`), and 3 switchable TTS voice personas.
- [x] **Task 2.2: Printable Soul Dossier & Tarot Career Arcana**
  - [x] Generate 3 personalized Tarot Career Arcana cards with Soul Match %, salary range, shadow protection, and First-90-Days roadmap.
  - [x] Add print/PDF stylesheet and Markdown scroll export (`.md`).

## Iteration 3: Scrying Mirror — Webcam Face, Mouth & Eyebrow Detection
- [x] **Task 3.1: On-Device MediaPipe Face Landmarker Integration**
  - [x] Integrate in-browser MediaPipe Face Landmarker (`vision_bundle.mjs` WASM) to detect eyebrow tension (`Relaxed` vs. `Furrowed`), mouth state (`Neutral`, `Smiling`, `Open`), and eye contact.
  - [x] Build circular Scrying Mirror HUD with live **Stress Gauge (%)** telemetry.
- [x] **Task 3.2: Biometric Auto-Comfort Loop**
  - [x] Implement **Auto-Comfort Mode** toggle that automatically triggers a comforting counselor response and softens TTS voice cadence when elevated facial stress or brow tension is detected.

## Iteration 4: Crisis Simulator 3D — Career Assessment Arcade Game
- [x] **Task 4.1: Three.js 3D Arena & Hybrid Controls**
  - [x] Build 3D WebGL arena with isometric camera, spectral ghost avatar, and 4 glowing dimensional portals across 10 real-life crisis scenarios.
  - [x] Implement hybrid movement supporting **single Mouse Click / Touch Tap** raycasting (with floor target ring) and **WASD / Arrow Key** physics.
  - [x] Add **Read Aloud** and **Auto-Read** voice accessibility narration for each crisis question.
- [x] **Task 4.2: Psychometric De-biasing & Soul Dossier Sync**
  - [x] Replace exposed start-screen dimension names with 4 visual locked mystery archetype cards (`???`).
  - [x] Rotate portal compass directions and goalpost colors across all 10 scenarios to prevent color or directional bias.
  - [x] Build interactive card-based **Recommended Pathways** on the completion screen and wire one-click sync into the Ghost Counselor chat and Soul Dossier.
