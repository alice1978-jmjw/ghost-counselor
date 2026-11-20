# Requirements Document

## Introduction
Graduating high school students face intense anxiety ("feeling cooked") when deciding their post-graduation path. Traditional career tools rely on exhausting text questionnaires and often ignore real-world financial and family obligations, defaulting to expensive 4-year university recommendations that do not fit every student's life constraints or energy profile.

**The Friendly Ghost Career Counselor** reimagines career guidance for the **Kiroween Costume Contest** by combining a constraint-aware 3-phase counseling protocol, unrestricted voice and text mentorship, real-time webcam facial expression empathy, and a 3D arcade crisis assessment game inside an unforgettable spectral sanctuary.

---

## Glossary

- **Friendly Ghost Career Counselor**: An AI-powered career guidance system designed for graduating high school students, using 2026 slang and an empathetic, supportive persona.
- **Phase 1: The Reality Check**: First counseling phase focusing on mapping real-world constraints (financial needs, geographic mobility, family obligations).
- **Phase 2: The Energy & Environment Quiz**: Second counseling phase assessing ideal working conditions and energy sources (digital vs. physical, solo vs. collaborative).
- **Phase 3: The Skill Inventory (Base Stats)**: Third counseling phase identifying and reframing natural talents as professional assets.
- **Soul Dossier**: A comprehensive exportable summary of the student's passions, strengths, boundaries, career archetypes, and 90-day action plan.
- **Scrying Mirror**: On-device webcam-based facial expression detection system using MediaPipe Face Landmarker for real-time emotional state tracking.
- **Crisis Simulator 3D**: A WebGL-based 3D arcade game that assesses career instincts through 10 real-life crisis scenarios, revealing one of 4 psychometric archetypes.
- **Spectral Archetypes**: Four career personality types revealed through the Crisis Simulator (Maker, Architect, Catalyst, Visionary).
- **Auto-Comfort Mode**: Automatic empathetic intervention triggered when facial stress indicators exceed thresholds.
- **Aura**: Gamification metric displayed to celebrate user engagement and progress.

---

## Requirements

### Iteration 1: Core Counseling Protocol & Safety Guardrails

### Requirement 1: Three-Phase Constraint-Aware Counseling & Open Q&A
**User Story:** As a graduating student, I want a supportive ghost counselor that asks one clear question at a time about my real-world constraints, work energy, and everyday talents—while also answering any freeform career question I ask by voice or text—so I get realistic guidance without feeling overwhelmed.

#### Acceptance Criteria
1. WHEN the counseling session begins THEN the system SHALL guide the student through **Phase 1: The Reality Check** across three sequential stages:
   - Stage `01` (`Financial Vibe`): Immediate earning needs vs. covered tuition.
   - Stage `02` (`Geographic Spawn Point`): Local zip-code constraints vs. relocation mobility.
   - Stage `03` (`Co-op Duties`): Family caregiving or household income responsibilities.
2. IF a student indicates high family obligations and immediate financial need THEN the system SHALL prioritize immediate earning pathways, paid apprenticeships, local community colleges, and certificate programs rather than 4-year out-of-state universities.
3. WHEN Phase 1 completes THEN the system SHALL transition to **Phase 2: The Energy & Environment Quiz** (`04 Battery Drain`, `05 Locked In`, `06 Solo vs Co-op`) to map whether the student thrives in hands-on physical work, structured systems, or social collaboration.
4. WHEN Phase 2 completes THEN the system SHALL transition to **Phase 3: The Skill Inventory (Base Stats)** (`07 Tech Flex`, `08 IRL Flex`, `09 Hidden Buff`) and reframe everyday teenage talents into professional career assets.
5. WHILE in any counseling phase THEN the Ghost Counselor SHALL ask strictly **one question at a time** and wait for the student's reply via microphone voice input, freeform keyboard text, or quick-reply pill.
6. WHEN a user speaks or types any open-ended career or life question outside the standard prompts THEN the Ghost Counselor SHALL directly answer their specific question in persona before gently continuing the counseling flow.

### Requirement 2: Mandatory Safety Interventions & De-escalation
**User Story:** As a student who may be experiencing severe stress or crisis, I need the counselor to immediately recognize crisis signals and provide safe, responsible support resources.

#### Acceptance Criteria
1. IF a user message matches any self-harm, suicide, or abuse crisis pattern THEN the system SHALL immediately halt normal persona slang and return the `MANDATORY_SAFETY_RESPONSE` directing the user to a trusted adult and emergency helpline resources (`988`).
2. IF a user expresses acute frustration ("crashing out") THEN the system SHALL validate their feelings empathetically and steer the conversation toward constructive boundary-setting.

---

### Iteration 2: Costume Contest UI, Voice Personas & Soul Dossier

### Requirement 3: Haunting Costume UI, Outfit Switcher & Multimodal Voice
**User Story:** As a user exploring the app, I want an atmospheric, spooky-yet-welcoming interface with customizable ghost costumes and voice styles so career counseling feels like an engaging interactive experience rather than a clinical form.

#### Acceptance Criteria
1. WHEN the user loads the landing screen THEN the system SHALL render multi-layered drifting volumetric fog and procedural Web Audio soundscapes.
2. WHEN the user clicks **"Part the Mist & Summon Counselor"** THEN the Ghost Counselor SHALL emerge inside the Spectral Career Sanctuary with reactive aura rings, blinking eyes, procedural mouth lip-sync during speech synthesis, and an Aura counter (`+1,000 AURA`).
3. WHEN the user clicks the **Costume Switcher** THEN the Ghost Counselor SHALL toggle smoothly between distinct Kiroween outfits (**🎧 Streetwear Fit** with neon headphones, grad cap, and glasses vs. **🧙‍♂️ Wizard Hat Fit** with pointed wizard hat, cloak collar, and pumpkin candy bucket).
4. WHEN the user cycles the **Voice Selector** THEN the system SHALL switch speech synthesis pitch, rate, and cadence across three distinct personas (*Friendly Ghost Bestie*, *Chill Spectral Mentor*, and *Crystal Ball Oracle*).

### Requirement 4: Live Trait Compass & Exportable Soul Dossier
**User Story:** As a student completing the session, I want a tangible summary of my passions, strengths, boundaries, and matched career paths with a concrete 90-day action plan.

#### Acceptance Criteria
1. WHEN the student sends a response THEN the system SHALL extract and display **Inner Embers (Passions)**, **Spectral Gifts (Strengths)**, and **Shadows & Boundaries (Weaknesses Reframed)** in real time.
2. WHEN the student opens the **Soul Dossier** THEN the system SHALL generate 3 personalized **Tarot Career Arcana Cards** with match percentages, compensation outlook, shadow protection tips, and a **First-90-Days Post-High-School Roadmap**, exportable via Print/PDF or Markdown scroll download.

---

### Iteration 3: Scrying Mirror — Webcam Face, Mouth & Eyebrow Detection

### Requirement 5: On-Device Facial Expression Telemetry & Auto-Comfort Mode
**User Story:** As an anxious student discussing stressful future decisions, I want the counselor to notice non-verbal facial cues (like furrowed eyebrows or a tense frown) and comfort me automatically, while keeping my webcam feed 100% private on my device.

#### Acceptance Criteria
1. WHEN the user enables the **Scrying Mirror** THEN the system SHALL run MediaPipe Face Landmarker locally in the browser via WebAssembly to track **Eyebrow State** (`Relaxed` vs. `Furrowed`), **Mouth State** (`Neutral`, `Smiling`, `Open`), eye contact, and a real-time **Stress Gauge (%)**.
2. IF **Auto-Comfort Mode** is enabled AND the Scrying Mirror detects sustained brow tension, frowning, or elevated stress ($\ge 38\%$) THEN the system SHALL automatically trigger an empathetic check-in from the Ghost Counselor and soften the counselor's spoken voice cadence.

---

### Iteration 4: Crisis Simulator 3D — Career Assessment Arcade Game

### Requirement 6: 3D WebGL Crisis Assessment & Psychometric De-biasing
**User Story:** As a student who dislikes long multiple-choice questionnaires, I want to test my career instincts inside a 3D arcade game where I steer a ghost avatar into portals during real-life crises and sync my unlocked archetype directly to my counselor and Soul Dossier.

#### Acceptance Criteria
1. WHEN the user opens **Crisis Simulator 3D** THEN the start screen SHALL tease **4 Secret Spectral Archetypes** using visual locked mystery cards (`???`) without exposing the underlying dimension names (`Maker`, `Architect`, `Catalyst`, `Visionary`) up front.
2. WHEN the simulation starts THEN the system SHALL render a Three.js 3D arena across **10 real-life crisis scenarios** with built-in **Read Aloud / Auto-Read** voice narration.
3. WHILE playing a scenario THEN the user SHALL be able to steer the 3D ghost avatar into any of the 4 answer portals using a **single Mouse Click / Touch Tap** (on a portal or floor) or **WASD / Arrow Keys**.
4. WHEN transitioning across the 10 scenarios THEN the system SHALL rotate **both** the compass direction (`top`, `bottom`, `left`, `right`) and the goalpost color (`Red`, `Blue`, `Yellow`, `Purple`) for each trait so users cannot develop a directional or color bias.
5. WHEN all 10 scenarios complete THEN the system SHALL reveal the unlocked archetype, a dimension score breakdown, and an interactive **4-card grid of Recommended Pathways** that syncs directly into the Ghost Counselor chat and Soul Dossier.
