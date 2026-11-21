import React from 'react';
import {
  Sparkles,
  Flame,
  ShieldAlert,
  Compass,
  Printer,
  Download,
  X,
  CheckCircle2,
  TrendingUp,
  Award,
  MessageSquare,
  Gamepad2,
  Lock,
  Trophy,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { ARCHETYPE_PROFILES } from '../data/assessmentData';

export default function SoulDossierModal({
  isOpen,
  onClose,
  dossier,
  onStartChat,
  onLaunchArcade,
  onDiscussCareer
}) {
  if (!isOpen) return null;

  const isEmpty = !dossier || dossier.isEmpty;

  const handlePrint = () => {
    if (isEmpty) return;
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (isEmpty) return;

    const lines = [
      `# 🕯️ ${dossier.title}`,
      `*Inscribed by The Friendly Ghost Counselor (Kiroween 2026)*\n`,
      `> "${dossier.counselorSignOff}"\n`
    ];

    if (dossier.constraints) {
      lines.push(`## 🧭 Reality Check Constraints`);
      if (dossier.constraints.financial) lines.push(`- **Financial Bandwidth:** ${dossier.constraints.financial}`);
      if (dossier.constraints.location) lines.push(`- **Geographic Mobility:** ${dossier.constraints.location}`);
      if (dossier.constraints.city) lines.push(`- **Target City:** ${dossier.constraints.city}`);
      if (dossier.constraints.family) lines.push(`- **Family / Schedule Duties:** ${dossier.constraints.family}`);
      lines.push('');
    }

    if (dossier.energyProfile) {
      lines.push(`## ⚡ Work Energy & Environment Profile`);
      if (dossier.energyProfile.drains?.length) {
        lines.push(`- **Energy Drains:** ${dossier.energyProfile.drains.join(', ')}`);
      }
      if (dossier.energyProfile.lockedInLabel) {
        lines.push(`- **Locked-In Zone:** ${dossier.energyProfile.lockedInLabel}`);
      }
      if (dossier.energyProfile.teamModeLabel) {
        lines.push(`- **Team Mode:** ${dossier.energyProfile.teamModeLabel}`);
      }
      lines.push('');
    }

    if (dossier.arcade?.completed && dossier.arcade.result) {
      const r = dossier.arcade.result;
      lines.push(`## 🕹️ Crisis Simulator 3D Archetype`);
      lines.push(`- **Unlocked Archetype:** ${r.badge} ${r.title}`);
      lines.push(`- **Tagline:** ${r.tagline}`);
      if (dossier.arcade.selectedPathway) {
        lines.push(`- **Selected Pathway:** ${dossier.arcade.selectedPathway.name}`);
      }
      if (dossier.arcade.scores) {
        const scoreLine = Object.entries(dossier.arcade.scores)
          .map(([k, v]) => `${k}: ${v}/10`)
          .join(' | ');
        lines.push(`- **Dimension Breakdown:** ${scoreLine}`);
      }
      lines.push('');
    } else if (dossier.arcade?.progress > 0) {
      lines.push(`## 🕹️ Crisis Simulator 3D Progress (${dossier.arcade.progress}/10 Scenarios Logged)`);
      (dossier.arcade.recentChoices || []).forEach((c) => {
        lines.push(`- Q${c.scenarioId} (${c.scenarioTitle}): ${c.choiceText}`);
      });
      lines.push('');
    }

    lines.push(`## 🔥 01 // Inner Embers (Core Passions)`);
    if (dossier.passions.length > 0) {
      dossier.passions.forEach((p) => lines.push(`- ${p}`));
    } else {
      lines.push(`- *Not discovered yet*`);
    }

    lines.push(`\n## ✨ 02 // Spectral Gifts (Natural Strengths)`);
    if (dossier.strengths.length > 0) {
      dossier.strengths.forEach((s) => lines.push(`- ${s}`));
    } else {
      lines.push(`- *Not discovered yet*`);
    }

    lines.push(`\n## 🌒 03 // Shadow Work (Boundaries & Reframes)`);
    if (dossier.weaknesses.length > 0) {
      dossier.weaknesses.forEach((w) => lines.push(`- ${w}`));
    } else {
      lines.push(`- *Not discovered yet*`);
    }

    lines.push(`\n## 🃏 Your Top 3 Arcana Career Pathways\n`);
    (dossier.careerCards || []).forEach((card, i) => {
      lines.push(
        `### ${i + 1}. Arcana ${card.arcanaNumber}: ${card.arcanaTitle} - ${card.careerTitle} (${card.matchPercent}% Soul Match)`
      );
      lines.push(`- **Compensation & Outlook:** ${card.salaryRange} | ${card.growthOutlook}`);
      lines.push(`- **Why It Fits Your Soul:** ${card.whyItFits}`);
      lines.push(`- **Shadow Protection:** ${card.shadowProtection}`);
      lines.push(`- **First 90 Days After High School:**`);
      card.first90Days.forEach((step, idx) => {
        lines.push(`  ${idx + 1}. ${step}`);
      });
      lines.push('');
    });

    lines.push(
      `---\n*Spectral Note: Our Ghost Counselor uses AI to brainstorm paths with you. Always double-check facts, salaries, and big decisions with a real-world mentor.*`
    );

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Friendly-Ghost-Career-Soul-Dossier.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-xl">
      <div className="glass-editorial-panel relative w-full max-w-5xl max-h-[96vh] print:max-h-none rounded-3xl text-slate-100 flex flex-col overflow-hidden print:overflow-visible">
        {/* Swiss Editorial Top Metadata Bar + Pinned Top-Right Close Button (matches 3D Crisis) */}
        <div className="flex items-center justify-between gap-3 border-b border-white/15 bg-white/[0.03] px-5 py-3 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 truncate">
            DOSSIER № 2026-TG // VICTORIAN ARMOIRE ARCHIVE
          </span>
          <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300 shrink-0">
            {isEmpty ? 'AWAITING SIGNAL // EMPTY DOSSIER' : 'LIVE SYNCED // CHAT × CRISIS 3D'}
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
              WARD CONFIDENTIAL
            </span>
            <button
              type="button"
              onClick={onClose}
              className="no-print rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Soul Dossier"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto print:overflow-visible p-5 sm:p-8">
          {/* Top Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Kiroween 2026 • Spectral Ward Registry</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                {isEmpty ? 'Soul Dossier // Empty' : dossier.title}
              </h2>
            </div>

            {!isEmpty && (
              <div className="no-print flex items-center gap-2.5">
                <button
                  onClick={handleDownloadMarkdown}
                  className="glass-pill flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-amber-200"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Scroll (.md)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition hover:from-amber-200 hover:to-amber-400"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              EMPTY STATE (User has NOT used Career Counselor Chat or Crisis 3D)
              ══════════════════════════════════════════════════════════════════ */}
          {isEmpty ? (
            <div className="my-10 flex flex-col items-center justify-center text-center px-4 py-8 rounded-2xl border border-dashed border-purple-400/35 bg-purple-950/20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-amber-300/50 bg-amber-500/10 text-3xl shadow-[0_0_25px_rgba(251,191,36,0.2)]">
                📜
              </div>
              <h3 className="mt-4 font-serif text-xl sm:text-2xl font-bold text-white">
                Your Soul Dossier Is Currently Empty
              </h3>
              <p className="mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-slate-300">
                Nothing has been recorded yet. Start a conversation in the{' '}
                <strong className="text-lime-300">Career Counselor Chat</strong> or play the{' '}
                <strong className="text-purple-300">Crisis Simulator 3D</strong> arcade game.
                Every discussion and every crisis decision will automatically populate and sync
                your live Soul Dossier here.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onStartChat?.();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#a3e635] to-amber-300 px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(163,230,53,0.4)] transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Counselor Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onLaunchArcade?.();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(168,85,247,0.45)] transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Play Crisis Simulator 3D</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Live Data Source Sync Strip */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${
                      dossier.hasChatActivity
                        ? 'border-lime-400/40 bg-lime-500/10 text-lime-200'
                        : 'border-white/15 bg-white/5 text-slate-400'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>
                      Counselor Chat:{' '}
                      {dossier.hasChatActivity
                        ? `${dossier.chatTurnCount} ${dossier.chatTurnCount === 1 ? 'exchange' : 'exchanges'} synced`
                        : 'Not started yet'}
                    </span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${
                      dossier.arcade?.completed
                        ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                        : dossier.arcade?.progress > 0
                        ? 'border-purple-400/50 bg-purple-500/15 text-purple-200'
                        : 'border-white/15 bg-white/5 text-slate-400'
                    }`}
                  >
                    <Gamepad2 className="h-3 w-3" />
                    <span>
                      Crisis Simulator 3D:{' '}
                      {dossier.arcade?.completed && dossier.arcade.result
                        ? `${dossier.arcade.result.badge} ${dossier.arcade.result.title} (10/10)`
                        : dossier.arcade?.progress > 0
                        ? `${dossier.arcade.progress}/10 instincts logged`
                        : 'Not played yet'}
                    </span>
                  </span>
                </div>

                <div className="no-print flex items-center gap-2">
                  {!dossier.arcade?.completed && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose?.();
                        onLaunchArcade?.();
                      }}
                      className="rounded-lg border border-purple-400/40 bg-purple-950/60 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-purple-200 hover:bg-purple-800/70 transition"
                    >
                      {dossier.arcade?.progress > 0 ? 'Resume Crisis 3D 🕹️' : 'Play Crisis 3D 🕹️'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      onStartChat?.();
                    }}
                    className="rounded-lg border border-lime-400/40 bg-lime-950/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-lime-200 hover:bg-lime-900/50 transition"
                  >
                    Back to Chat 💬
                  </button>
                </div>
              </div>

              {/* Counselor's Editorial Pull-Quote */}
              {dossier.counselorSignOff && (
                <div className="glass-subcard mt-5 rounded-2xl border-l-2 border-l-amber-300 p-4 text-sm italic text-amber-100/95">
                  “{dossier.counselorSignOff}”
                  <span className="mt-1.5 block text-right font-mono text-[10px] font-semibold uppercase tracking-widest not-italic text-amber-300">
                    // FRIENDLY GHOST COUNSELOR // LIVE SOUL SYNC
                  </span>
                </div>
              )}

              {/* Reality Check Constraints & Energy Profile (only shown when discovered in Chat) */}
              {(dossier.constraints || dossier.energyProfile) && (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {dossier.constraints && (
                    <div className="glass-subcard rounded-2xl p-4 border border-lime-400/25">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-lime-300 font-semibold text-xs">
                        <span className="flex items-center gap-2">
                          <SlidersHorizontal className="h-4 w-4" />
                          <span>Reality Check Constraints (From Chat)</span>
                        </span>
                        {dossier.constraints.needMoneyNow && (
                          <span className="rounded-full bg-lime-500/20 px-2 py-0.5 font-mono text-[10px] text-lime-200">
                            FAST-ROI LOCKED
                          </span>
                        )}
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-slate-200">
                        {dossier.constraints.financial && (
                          <li>
                            <strong className="text-lime-200">Finances:</strong> {dossier.constraints.financial}
                          </li>
                        )}
                        {dossier.constraints.location && (
                          <li>
                            <strong className="text-lime-200">Mobility:</strong> {dossier.constraints.location}
                          </li>
                        )}
                        {dossier.constraints.city && (
                          <li>
                            <strong className="text-lime-200">Target City:</strong> {dossier.constraints.city}
                            {dossier.constraints.cityEconomics
                              ? ` (Rent ~${dossier.constraints.cityEconomics.monthlyRent} ${dossier.constraints.cityEconomics.currency}/mo)`
                              : ''}
                          </li>
                        )}
                        {dossier.constraints.family && (
                          <li>
                            <strong className="text-lime-200">Schedule / Family:</strong> {dossier.constraints.family}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {dossier.energyProfile && (
                    <div className="glass-subcard rounded-2xl p-4 border border-cyan-400/25">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-cyan-300 font-semibold text-xs">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          <span>Work Energy Profile (From Chat)</span>
                        </span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-slate-200">
                        {dossier.energyProfile.drains?.length > 0 && (
                          <li>
                            <strong className="text-cyan-200">Battery Drains:</strong>{' '}
                            {dossier.energyProfile.drains.join(', ')}
                          </li>
                        )}
                        {dossier.energyProfile.lockedInLabel && (
                          <li>
                            <strong className="text-cyan-200">Locked-In Zone:</strong>{' '}
                            {dossier.energyProfile.lockedInLabel}
                          </li>
                        )}
                        {dossier.energyProfile.teamModeLabel && (
                          <li>
                            <strong className="text-cyan-200">Team Style:</strong>{' '}
                            {dossier.energyProfile.teamModeLabel}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Crisis Simulator 3D Instinct Profile (only shown when played) */}
              {dossier.arcade && (
                <div className="glass-subcard mt-5 rounded-2xl p-4 border border-purple-400/35">
                  {dossier.arcade.completed && dossier.arcade.result ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-300" />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                            Crisis Simulator 3D Archetype Synced
                          </span>
                        </div>
                        <span className="rounded-full border border-purple-400/40 bg-purple-950/60 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                          {dossier.arcade.result.badge} {dossier.arcade.result.title}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {dossier.arcade.result.description}
                          </p>
                          {dossier.arcade.selectedPathway && (
                            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-mono text-amber-200">
                              <span>{dossier.arcade.selectedPathway.icon}</span>
                              <span>
                                Selected Pathway: <strong>{dossier.arcade.selectedPathway.name}</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {dossier.arcade.scores && (
                          <div className="space-y-1.5">
                            {Object.entries(dossier.arcade.scores).map(([trait, count]) => {
                              const prof = ARCHETYPE_PROFILES[trait];
                              const pct = Math.round((count / 10) * 100);
                              return (
                                <div key={trait} className="flex items-center gap-2.5 text-[11px] font-mono">
                                  <span className="w-20 text-slate-300 font-semibold">{trait}</span>
                                  <div className="flex-1 h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${pct}%`,
                                        backgroundColor: prof?.color || '#a855f7'
                                      }}
                                    />
                                  </div>
                                  <span className="w-14 text-right font-bold text-white">
                                    {count}/10
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mid-game Crisis Simulator 3D Progress — strictly hides the 4 dimension names! */
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-purple-300">
                          <Lock className="h-3.5 w-3.5 text-amber-300" />
                          <span>
                            Crisis Simulator 3D In Progress ({dossier.arcade.progress}/10 Scenarios Logged)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-200/90">
                          Finish all 10 to unlock your secret archetype
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all"
                          style={{ width: `${Math.min(100, dossier.arcade.progress * 10)}%` }}
                        />
                      </div>
                      {dossier.arcade.recentChoices?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dossier.arcade.recentChoices.slice(-4).map((c) => (
                            <span
                              key={c.scenarioId}
                              className="rounded-lg border border-purple-400/25 bg-purple-950/50 px-2.5 py-1 text-[11px] text-purple-100"
                            >
                              Q{c.scenarioId}: “{c.choiceText}”
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Three Pillars Summary (Swiss Editorial 3-Column Grid — Strictly Real Data) */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* 01 / Passions */}
                <div className="glass-subcard rounded-2xl p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-amber-300 font-semibold text-xs">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      <span>Inner Embers (Passions)</span>
                    </span>
                    <span className="font-mono text-[10px] text-amber-200/70">
                      01 ({dossier.passions.length})
                    </span>
                  </div>
                  {dossier.passions.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-200">
                      {dossier.passions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs italic text-slate-400">
                      Not discovered yet. Share what excites you in Chat or complete Crisis Simulator 3D.
                    </p>
                  )}
                </div>

                {/* 02 / Strengths */}
                <div className="glass-subcard rounded-2xl p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-cyan-300 font-semibold text-xs">
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Spectral Gifts (Strengths)</span>
                    </span>
                    <span className="font-mono text-[10px] text-cyan-200/70">
                      02 ({dossier.strengths.length})
                    </span>
                  </div>
                  {dossier.strengths.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-200">
                      {dossier.strengths.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs italic text-slate-400">
                      Not discovered yet. Keep chatting or test your instincts in Crisis Simulator 3D.
                    </p>
                  )}
                </div>

                {/* 03 / Weaknesses / Shadows Reframed */}
                <div className="glass-subcard rounded-2xl p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-purple-300 font-semibold text-xs">
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Shadows &amp; Boundaries</span>
                    </span>
                    <span className="font-mono text-[10px] text-purple-200/70">
                      03 ({dossier.weaknesses.length})
                    </span>
                  </div>
                  {dossier.weaknesses.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-200">
                      {dossier.weaknesses.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs italic text-slate-400">
                      None logged yet. Tell the Counselor what drains you or worries you to add burnout protection.
                    </p>
                  )}
                </div>
              </div>

              {/* Tarot-Style Career Arcana Cards */}
              <div className="mt-8">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    <span>SEC. 04 // TOP 3 TAROT CAREER ARCANA MATCHES</span>
                  </span>
                  <span className="text-slate-400">LIVE RANKED 01-03</span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {dossier.careerCards.map((card, idx) => (
                    <div
                      key={card.id}
                      className={`glass-subcard flex flex-col justify-between rounded-2xl p-5 transition-all ${
                        idx === 0
                          ? 'border-amber-400/50 shadow-[0_0_35px_rgba(251,191,36,0.14)]'
                          : ''
                      }`}
                    >
                      <div>
                        {/* Swiss Tarot Header */}
                        <div className="flex items-center justify-between border-b border-white/15 pb-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300">
                            ARCANA {card.arcanaNumber} // {card.arcanaTitle}
                          </span>
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                            {card.matchPercent}% MATCH
                          </span>
                        </div>

                        {/* Live Source Alignment Badges */}
                        {card.alignmentBadges?.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {card.alignmentBadges.map((badge, bIdx) => (
                              <span
                                key={bIdx}
                                className="rounded-md border border-purple-400/35 bg-purple-950/50 px-2 py-0.5 font-mono text-[10px] text-purple-200"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Career Title */}
                        <h3 className="mt-3 font-serif text-lg font-bold text-white">
                          {card.careerTitle}
                        </h3>

                        {/* Salary & Growth Badges */}
                        <div className="mt-2.5 flex flex-wrap gap-2 font-mono text-[11px]">
                          <span className="glass-pill rounded-md px-2.5 py-1 text-slate-100">
                            {card.salaryRange}
                          </span>
                          <span className="glass-pill flex items-center gap-1 rounded-md border-amber-400/35 px-2.5 py-1 text-amber-200">
                            <TrendingUp className="h-3 w-3" />
                            {card.growthOutlook}
                          </span>
                        </div>

                        {/* Why It Fits Your Soul */}
                        <div className="mt-4">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                            01 / Why It Fits Your Soul
                          </p>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-200/90">
                            {card.whyItFits}
                          </p>
                        </div>

                        {/* Shadow Protection */}
                        <div className="mt-3 rounded-xl border border-purple-400/25 bg-purple-950/25 p-3">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-300">
                            02 / Shadow Protection
                          </p>
                          <p className="mt-0.5 text-xs text-slate-200/90">
                            {card.shadowProtection}
                          </p>
                        </div>
                      </div>

                      {/* First 90 Days After Graduation Action Plan */}
                      <div className="mt-5 border-t border-white/15 pt-3.5">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                          03 / First 90 Days After High School
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {card.first90Days.map((step, sIdx) => (
                            <li
                              key={sIdx}
                              className="flex items-start gap-2 text-xs text-slate-200/90"
                            >
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>

                        {onDiscussCareer && (
                          <button
                            type="button"
                            onClick={() => onDiscussCareer(card)}
                            className="no-print mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 font-mono text-[11px] font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Discuss This Path in Chat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Guidance Disclaimer Footer */}
              <div
                role="note"
                className="mt-6 flex items-start sm:items-center gap-2 rounded-2xl border border-purple-400/25 bg-white/[0.03] px-4 py-2.5 text-[11px] leading-relaxed text-slate-300"
              >
                <Info className="mt-0.5 sm:mt-0 h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>
                  <strong className="text-amber-200 font-semibold">Spectral Note:</strong> Our Ghost Counselor uses AI to brainstorm paths with you. Always double-check facts, salaries, and big decisions with a real-world mentor.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
