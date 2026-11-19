# 👻 The Friendly Ghost Career Counselor (Kiroween 2026)

> **Category:** Costume Contest  
> **Built with:** Kiro (`.kiro/specs`, `.kiro/steering`, `.kiro/hooks`, `.kiro/settings/mcp.json`, `.kiro/rules.md`), React 18, Vite, Tailwind CSS, Three.js WebGL, Google MediaPipe Face Landmarker (WASM), Web Speech & Web Audio APIs, Zod, and Google Gemini (`gemini-2.5-flash`)

An interactive **Friendly Ghost Career Counselor** web application built for the **Kiroween Hackathon (Costume Contest)**, designed to guide students who feel "cooked" about life after high school through **open-ended voice & text mentorship**, **on-device webcam face, mouth, and eyebrow stress detection**, a **3D WebGL Crisis Simulator career assessment game**, and a printable Tarot-style **Soul Dossier**.

---

## 🎃 Why This Fits the "Costume Contest" Category

Career counseling is traditionally dry, intimidating, and out of touch with real student constraints. Every spooky design element in our **Spectral Career Sanctuary** directly enhances the app's counseling functionality:

- **Volumetric Mist & Spectral Summoning (`src/components/FogOverlay.jsx`, `GreenFogBurst.jsx`, `HalloweenDecorations.jsx`)**: Opens veiled in drifting multi-layered fog with spiderwebs, flickering candles, bats, and cauldrons. Clicking **"🔮 Part the Mist & Summon Counselor ✨"** triggers procedural Web Audio wind and spectral chimes.
- **Interactive Costume Contest Outfit Switcher (`src/components/CostumeGhostAvatar.jsx` & `GhostSphere3D.jsx`)**: Dress your Ghost Counselor on the fly between the **🎧 Streetwear Fit** (neon glow headphones, graduation cap, hipster glasses, smartphone) and the **🧙‍♂️ Wizard Hat Fit** (pointed wizard hat with brass buckle, cloak collar, pumpkin candy bucket, and celestial stars), complete with real-time voice lip-sync and mood-reactive aura rings.
- **Unrestricted Voice & Text Counseling (`src/App.jsx` & `src/services/counselorAI.js`)**: Speak via microphone (**"Speak to Counselor"**) or type *any* question into the chat. The Ghost Counselor answers any user question in a warm Gen-Z mentor voice while guiding them through a constraint-aware **3-Phase Counseling Protocol** (`Phase 1: Reality Check`, `Phase 2: Energy Profile`, `Phase 3: Skill Inventory`), with **3 switchable TTS Voice Personas** (*Friendly Ghost Bestie*, *Chill Spectral Mentor*, *Crystal Ball Oracle*).
- **The Scrying Mirror — Face, Mouth & Eyebrow Detection (`src/components/ScryingMirror.jsx` & `src/services/faceLandmarkerService.js`)**: Runs **Google MediaPipe Face Landmarker** 100% locally in-browser via WebAssembly to track **Eyebrows** (`Relaxed` vs. `Furrowed`), **Mouth** (`Neutral`, `Smiling`, `Open`), and a live **Stress Gauge (%)**. With **Auto-Comfort Mode** enabled, when facial tension or brow furrowing rises, the Ghost Counselor automatically steps in with grounding encouragement and softens its voice tone.
- **Crisis Simulator 3D — Career Assessment Arcade Game (`src/components/ArcadeAssessmentModal.jsx` & `ArcadeAssessment3DCanvas.jsx`)**: A full **Three.js WebGL** 3D arena across **10 real-life crisis scenarios**. Starts with **4 locked visual mystery cards (`???`)** and rotates portal directions and colors across every scenario to eliminate bias. Players steer their 3D ghost avatar into portals via a **single Mouse Click / Touch Tap** or **WASD / Arrow Keys**, unlocking card-based **Recommended Pathways** that sync directly into the counselor chat and Soul Dossier.
- **Tarot Career Arcana & Printable Soul Dossier (`src/components/SoulDossierModal.jsx`)**: Synthesizes passions, strengths, boundaries, and 3D assessment instincts into **3 Tarot Career Arcana Cards** with Soul Match %, salary/growth outlook, burnout protection, and a **First-90-Days Roadmap** (exportable as Markdown `.md` or Print/PDF).

---

## 🛠️ How We Built It Incrementally with Kiro (`/.kiro`)

Our repository includes the complete **`/.kiro`** directory at the project root showing how we used Kiro from Day 1 across four incremental iterations:

1. **Kiro Specifications (`.kiro/specs/ghost-career-counselor/`)**:
   - [`requirements.md`](.kiro/specs/ghost-career-counselor/requirements.md): EARS-formatted requirements across **Iteration 1** (3-Phase Protocol, Open Q&A & Safety Guardrails), **Iteration 2** (Costume Switcher, Voice Personas & Soul Dossier), **Iteration 3** (Scrying Mirror Face, Mouth & Eyebrow Telemetry + Auto-Comfort), and **Iteration 4** (Crisis Simulator 3D & Psychometric De-biasing).
   - [`design.md`](.kiro/specs/ghost-career-counselor/design.md): System architecture diagram and engineering decisions for the dual-engine AI, MediaPipe WASM pipeline, and Three.js raycast/physics loop.
   - [`tasks.md`](.kiro/specs/ghost-career-counselor/tasks.md): Incremental sprint checklist tracking all four iterations from foundation to 3D assessment sync.
2. **Kiro Steering Documents (`.kiro/steering/` & `.kiro/rules.md`)**:
   - [`.kiro/rules.md`](.kiro/rules.md): Project-wide rules enforcing Zod schema validation (`GhostResponseSchema`), global economic context, psychometric secrecy/color rotation in the 3D assessment, and on-device webcam privacy.
   - [`.kiro/steering/friendly_ghost_counselor_system_prompt.md`](.kiro/steering/friendly_ghost_counselor_system_prompt.md): Defines the Ghost Counselor persona, the one-question-at-a-time rule, open-ended question handling, Phase 1–3 protocols, Scrying Mirror biometric empathy, and 3D archetype debriefs.
3. **Kiro Agent Hooks (`.kiro/hooks/`)**:
   - [`safety-guardrail-check.json`](.kiro/hooks/safety-guardrail-check.json): Automated hook verifying 1-question-per-turn pacing, open Q&A responsiveness, Phase 1 financial constraints, Zod schema compliance, and mandatory `988` crisis intervention.
   - [`assessment-and-scrying-sync.json`](.kiro/hooks/assessment-and-scrying-sync.json): Automated hook verifying that Crisis Simulator 3D keeps core dimensions hidden up front, rotates portal colors/positions across scenarios, supports click/tap + keyboard movement, and keeps Scrying Mirror facial telemetry 100% local.
4. **Kiro MCP Configuration (`.kiro/settings/mcp.json`)**:
   - [`mcp.json`](.kiro/settings/mcp.json): Context7 MCP server setup used to reference accurate MediaPipe Tasks Vision blendshapes/landmarks, Three.js WebGL APIs, and Google GenAI SDK methods without hallucinations.

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
   * `VITE_FORMSPREE_FORM_ID`: Your [Formspree](https://formspree.io) form ID to capture waitlist subscriber emails. *(If left blank, the gate runs in local simulation mode for instant testing!)*
   * `VITE_GEMINI_API_KEY`: Optional Gemini API key for Layer 1 AI responses.

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open **http://localhost:5173/** in your browser.

---

## 🔑 Spectral Gate Access

The sanctuary gate provides two access pathways:
* **Join Waitlist & Guest Pass**: Enter any valid email to join the waitlist (powered by Formspree) and gain immediate access as a **Guest Seeker**.
* **Passcode Login**:
  * **Judge**: Access ID: `judge` / Passcode: `kiroween2026`
  * **Dev**: Access ID: `dev` / Passcode: `wareprise`

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
