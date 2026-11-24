# 👻 The Friendly Ghost Career Counselor (Kiroween 2026)

> **Category:** Costume Contest  
> **Live App (HTTPS):** [https://www.wareprise.com/counselor](https://www.wareprise.com/counselor)  
> **Judge Access:** Use the private Access ID & Passcode (or private 1-click Judge link) provided in our Devpost Testing Instructions, or enter immediately via the **Guest Access** tab *(no Gemini API key required — works out of the box!)*  
> **Built with:** Kiro (`.kiro/specs`, `.kiro/steering`, `.kiro/hooks`, `.kiro/settings/mcp.json`, `.kiro/rules.md`), React 18, Vite, Tailwind CSS, Three.js WebGL, Google MediaPipe Face Landmarker (100% local WASM), Web Speech & Web Audio APIs, Zod, and Google Gemini (`gemini-2.0-flash`) + zero-key AI / offline fallback

An interactive **Friendly Ghost Career Counselor** web application built for the **Kiroween Hackathon (Costume Contest)**, designed to guide students who feel "cooked" about life after high school through **open-ended voice & text mentorship**, **on-device webcam face, mouth, eyebrow & eye-contact distress detection**, a **3D WebGL Crisis Simulator career assessment game**, and a live-synced Tarot-style **Soul Dossier**.

---

## 🧪 Judge Testing Guide (Zero-Config Ready)

1. Open the live HTTPS app at **[https://www.wareprise.com/counselor](https://www.wareprise.com/counselor)** *(or run locally via `npm run dev` on `http://localhost:5173`)*. Use **Chrome or Edge** over HTTPS/localhost for live webcam & voice features.
2. Sign in on the **Passcode** tab using the private Judge credentials (or private 1-click Judge link) provided in our Devpost Testing Instructions — or switch to **Guest Access** to try it immediately with any email.
3. **No API key required:** The counseling engine automatically cascades across optional Gemini (`gemini-2.0-flash`), zero-key free AI, and a full deterministic local counseling engine — all validated via `GhostResponseSchema` (Zod).
4. **Suggested 60-Second Flow:**
   - Click **Part the Mist & Summon Counselor**, then open **Soul Dossier** first to verify it starts in a clean **Empty State** before any chat or gameplay.
   - Answer 1–2 Phase 1 Reality Check questions (or type any open career question) and watch **Soul Dossier** populate live with constraints, traits, and matched Tarot Career Arcana cards.
   - Toggle **Costume Switcher** (**🎧 Streetwear Fit** ↔ **🧙‍♂️ Wizard Hat**) and **Voice Presets**.
   - Click **Enable Scrying Mirror** (allow webcam, or click **Manual Vibe Mode** if testing without a camera). Furrowing your brows, looking worried, or looking away triggers **Auto-Comfort Mode**, softening the Ghost's voice (`"Take your time, I know thinking about the future is overwhelming."`).
   - Launch **Crisis 3D 🕹️** to steer your 3D ghost avatar across 10 crisis scenarios (click/tap or WASD/Arrows), unlock your hidden archetype, select a Recommended Pathway card, and inspect your fully synced **Soul Dossier** (with **Discuss This Path in Chat**, Markdown `.md` export, and Print/PDF).

---

## 🎃 Why This Fits the "Costume Contest" Category

Career counseling is traditionally dry, intimidating, and out of touch with real student constraints. Every spooky design element in our **Spectral Career Sanctuary** directly enhances the app's counseling functionality:

- **Volumetric Mist & Spectral Summoning (`src/components/FogOverlay.jsx`, `GreenFogBurst.jsx`, `HalloweenDecorations.jsx`)**: Opens veiled in drifting multi-layered fog with spiderwebs, flickering candles, bats, and cauldrons. Clicking **"🔮 Part the Mist & Summon Counselor ✨"** triggers procedural Web Audio wind and spectral chimes.
- **Interactive Costume Contest Outfit Switcher (`src/components/CostumeGhostAvatar.jsx` & `GhostSphere3D.jsx`)**: Dress your Ghost Counselor on the fly between the **🎧 Streetwear Fit** (neon glow headphones, graduation cap, hipster glasses, smartphone) and the **🧙‍♂️ Wizard Hat Fit** (pointed wizard hat with brass buckle, cloak collar, pumpkin candy bucket, and celestial stars), complete with real-time voice lip-sync and mood-reactive aura rings.
- **Unrestricted Voice & Text Counseling (`src/App.jsx`, `src/services/counselorAI.js`, `src/services/soulDossierEngine.js`)**: Speak via microphone (**"Speak to Counselor"**) or type *any* question into the chat. The Ghost Counselor answers any user question in a warm Gen-Z mentor voice while guiding them through a constraint-aware **3-Phase Counseling Protocol** (`Phase 1: Reality Check`, `Phase 2: Energy Profile`, `Phase 3: Skill Inventory`), with **3 switchable TTS Voice Personas** (*Friendly Ghost Bestie*, *Chill Spectral Mentor*, *Crystal Ball Oracle*) and mandatory `988` safety crisis guardrails.
- **The Scrying Mirror — Face, Eyebrow, Mouth & Gaze Detection (`src/components/ScryingMirror.jsx` & `src/services/faceLandmarkerService.js`)**: Runs **Google MediaPipe Face Landmarker** 100% locally in-browser via WebAssembly (`/mediapipe/vision_bundle.mjs`, `/wasm/`, `/models/face_landmarker.task`) with a live mirrored spectral landmark overlay tracking **Eyebrows** (`Relaxed` / `Furrowed` / `Raised`), **Mouth** (`Neutral` / `Smiling` / `Frowning` / `Open`), **Eye Contact & Head Yaw** (`Gaze OK` / `Away`), and a live **Stress Gauge (%)**. When frustration, anxiety, or gaze avoidance is detected, **Auto-Comfort Mode** plays a calming chime, visibly softens the Ghost's spoken voice cadence/volume, and replies warmly starting with `"Take your time, I know thinking about the future is overwhelming."` Also includes an optional **Manual Vibe Mode** fallback if a device lacks a webcam or blocks browser camera access.
- **Crisis Simulator 3D — Career Assessment Arcade Game (`src/components/ArcadeAssessmentModal.jsx` & `ArcadeAssessment3DCanvas.jsx`)**: A full **Three.js WebGL** 3D arena across **10 real-life crisis scenarios**. Starts with **4 locked visual mystery cards (`???`)** and rotates portal directions and colors across every scenario to eliminate bias. Players steer their 3D ghost avatar into portals via a **single Mouse Click / Touch Tap** or **WASD / Arrow Keys**. Every single portal choice live-syncs to the Soul Dossier without leaking the 4 dimension names before completion; finishing Scenario 10 unlocks the archetype and card-based **Recommended Pathways** synced directly into Counselor Chat and Soul Dossier.
- **Unified Live-Synced Tarot Soul Dossier (`src/services/soulDossierEngine.js` & `src/components/SoulDossierModal.jsx`)**: Begins in a strict **Empty State** until the student engages Chat or Crisis Simulator 3D. Once active, it acts as the single source of truth across Chat, Crisis Simulator 3D, and Dossier — synthesizing Reality Check constraints, Energy Profile, Passions, Strengths, Boundaries, and Crisis 3D instincts into **Top 3 Tarot Career Arcana Cards** (selected from a 14-pathway catalog) with Soul Match %, salary/growth outlook, burnout protection, constraint-safe **First-90-Days Roadmaps**, one-click **"Discuss This Path in Chat"**, and Markdown `.md` / Print-PDF export.

---

## 🛠️ How We Built It Incrementally with Kiro (`/.kiro`)

Our repository includes the complete **`/.kiro`** directory at the project root (explicitly tracked in `.gitignore`) showing how we used Kiro from Day 1 across four incremental iterations:

1. **Kiro Specifications (`.kiro/specs/ghost-career-counselor/`)**:
   - [`requirements.md`](.kiro/specs/ghost-career-counselor/requirements.md): EARS-formatted requirements across **Iteration 1** (3-Phase Protocol, Open Q&A & Safety Guardrails), **Iteration 2** (Costume Switcher, Voice Personas & Soul Dossier), **Iteration 3** (Scrying Mirror Face, Mouth & Eyebrow Telemetry + Auto-Comfort), and **Iteration 4** (Crisis Simulator 3D & Psychometric De-biasing).
   - [`design.md`](.kiro/specs/ghost-career-counselor/design.md): System architecture diagram and engineering decisions for the dual-engine AI, MediaPipe WASM pipeline, and Three.js raycast/physics loop.
   - [`tasks.md`](.kiro/specs/ghost-career-counselor/tasks.md): Incremental sprint checklist tracking all four iterations from foundation to 3D assessment sync.
2. **Kiro Steering Documents (`.kiro/steering/` & `.kiro/rules.md`)**:
   - [`.kiro/rules.md`](.kiro/rules.md): Project-wide rules enforcing Zod schema validation (`GhostResponseSchema`), global economic context (`src/data/globalEconomy.js`), psychometric secrecy/color rotation in the 3D assessment, and on-device webcam privacy.
   - [`.kiro/steering/friendly_ghost_counselor_system_prompt.md`](.kiro/steering/friendly_ghost_counselor_system_prompt.md): Defines the Ghost Counselor persona, the one-question-at-a-time rule, open-ended question handling, Phase 1–3 protocols, Scrying Mirror biometric empathy, and 3D archetype debriefs.
3. **Kiro Agent Hooks (`.kiro/hooks/`)**:
   - [`safety-guardrail-check.json`](.kiro/hooks/safety-guardrail-check.json): Automated hook verifying 1-question-per-turn pacing, open Q&A responsiveness, Phase 1 financial constraints, Zod schema compliance, and mandatory `988` crisis intervention.
   - [`assessment-and-scrying-sync.json`](.kiro/hooks/assessment-and-scrying-sync.json): Automated hook verifying that Crisis Simulator 3D keeps core dimensions hidden up front, rotates portal colors/positions across scenarios, supports click/tap + keyboard movement, and keeps Scrying Mirror facial telemetry 100% local.
4. **Kiro MCP Configuration (`.kiro/settings/mcp.json`)**:
   - [`mcp.json`](.kiro/settings/mcp.json): Context7 MCP server setup used to reference accurate MediaPipe Tasks Vision blendshapes/landmarks, Three.js WebGL APIs, and Google GenAI SDK methods without hallucinations.
5. **Kiro CLI Custom Agent (`.kiro/agents/ghost-auditor.json`)**:
   - [`ghost-auditor.json`](.kiro/agents/ghost-auditor.json): Read-only semantic safety, privacy, and psychometric compliance auditor for **Kiro CLI** (`kiro-cli`). Reuses `.kiro/rules.md`, `.kiro/specs/`, and `.kiro/steering/` to audit `988` crisis guardrails, Cloud vs. Offline AI consent, on-device webcam privacy, SHA-256 role auth, 3D psychometric de-biasing, Zod schemas, and hybrid Tarot filtering right from the terminal before commits or deploys:
     ```bash
     kiro-cli chat --agent ghost-auditor "Run a full pre-deploy compliance audit and output the PASS/FAIL table."
     ```

---

## 🚀 Quick Start & Environment Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment (Optional)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   * `JUDGE_PASSCODE` / `DEV_PASSCODE`: Private passcodes for the Judge and Dev roles. Because they have no `VITE_` prefix, `vite.config.js` hashes them with salted SHA-256 at build time so plaintext passcodes are never embedded in the frontend bundle or committed to GitHub.
   * `VITE_FORMSPREE_FORM_ID`: Your [Formspree](https://formspree.io) form ID to capture guest access emails. *(If left blank, the gate runs in local simulation mode for instant testing!)*
   * `VITE_GEMINI_API_KEY`: Optional Gemini API key for Layer 1 AI responses. *(If left blank, the app automatically uses zero-key free AI and offline fallback!)*

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open **http://localhost:5173/** in Chrome or Edge.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔑 Spectral Gate Access

The sanctuary gate supports two clean access modes without exposing private passcodes in source code:
* **Passcode Login (Judge & Dev)**: Passcodes are configured locally in `.env` (`JUDGE_PASSCODE` / `DEV_PASSCODE`), salted & hashed with SHA-256 at build time by `vite.config.js`, and verified client-side against the hash.
* **Guest Access (Formspree)**: Switch to the **Guest Access** tab and enter any valid email to enter immediately as a **Guest Seeker**.

---

## 📄 License

Distributed under the **MIT License** (OSI-approved open-source license). See [`LICENSE`](LICENSE) for details.
