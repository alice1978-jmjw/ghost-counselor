# The Friendly Ghost Career Counselor - Kiro Steering Rules

1. **Strict Data Contracts:** All LLM outputs MUST be strictly typed and validated using Zod via `GhostResponseSchema` before reaching the UI state.
2. **Global Context:** Do not hardcode localized regional data (like RM or specific local colleges). The counseling architecture must support international users, dynamically adjusting cost-of-living and salary advice for global contexts.
3. **Resilient Error Handling & Zero-Config Fallback:** All external AI calls must be wrapped in `try/catch` blocks with a deterministic, stage-aware fallback counseling engine so the app never crashes and remains testable out of the box without an API key.
4. **Costume Contest Visual System:** Use Tailwind CSS paired with custom dark-velvet and gothic-neon utilities. Every spooky visual element (volumetric mist, costume switcher, aura rings, tarot cards) must directly reinforce counseling usability and readability.
5. **Psychometric Integrity in 3D Assessment:** Never expose the 4 core dimension labels (`Maker`, `Architect`, `Catalyst`, `Visionary`) prior to assessment completion. Always rotate portal colors and compass directions across scenarios so players choose based on instinct rather than color or directional habit.
6. **Privacy-First On-Device Vision:** Webcam facial landmark detection (eyebrows, mouth, eye contact, and stress gauge) must execute 100% client-side in the browser via WebAssembly—no video frames or biometric streams may leave the user's device.
