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
  Award
} from 'lucide-react';

export default function SoulDossierModal({ isOpen, onClose, dossier }) {
  if (!isOpen || !dossier) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const lines = [
      `# 🕯️ ${dossier.title}`,
      `*Inscribed by The Friendly Ghost Counselor (Kiroween 2026)*\n`,
      `> "${dossier.counselorSignOff}"\n`,
      `## 🔥 01 // Inner Embers (Core Passions)`,
      ...dossier.passions.map((p) => `- ${p}`),
      `\n## ✨ 02 // Spectral Gifts (Natural Strengths)`,
      ...dossier.strengths.map((s) => `- ${s}`),
      `\n## 🌒 03 // Shadow Work (Weaknesses Reframed & Boundaries)`,
      ...dossier.weaknesses.map((w) => `- ${w}`),
      `\n## 🃏 Your Top 3 Arcana Career Pathways\n`
    ];

    dossier.careerCards.forEach((card, i) => {
      lines.push(
        `### ${i + 1}. Arcana ${card.arcanaNumber}: ${card.arcanaTitle}: ${card.careerTitle} (${card.matchPercent}% Soul Match)`
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

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Friendly-Ghost-Career-Soul-Dossier.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-xl overflow-y-auto">
      <div className="glass-editorial-panel relative my-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl text-slate-100">
        {/* Swiss Editorial Top Metadata Bar */}
        <div className="flex items-center justify-between border-b border-white/15 bg-white/[0.03] px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300">
          <span>DOSSIER № 2026-TG // VICTORIAN ARMOIRE ARCHIVE</span>
          <span className="text-amber-300">SWISS EDITORIAL × TALLOW EDITION</span>
          <span>WARD CONFIDENTIAL</span>
        </div>

        <div className="p-5 sm:p-8">
          {/* Top Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Kiroween 2026 • Spectral Ward Registry</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                {dossier.title}
              </h2>
            </div>

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
              <button
                onClick={onClose}
                className="glass-pill rounded-xl p-2 text-slate-300 hover:text-white"
                aria-label="Close Soul Dossier"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Counselor's Editorial Pull-Quote */}
          <div className="glass-subcard mt-5 rounded-2xl border-l-2 border-l-amber-300 p-4 text-sm italic text-amber-100/95">
            “{dossier.counselorSignOff}”
            <span className="mt-1.5 block text-right font-mono text-[10px] font-semibold uppercase tracking-widest not-italic text-amber-300">
              // FRIENDLY GHOST COUNSELOR // KIROWEEN 2026
            </span>
          </div>

          {/* Three Pillars Summary (Swiss Editorial 3-Column Grid) */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* 01 / Passions */}
            <div className="glass-subcard rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-amber-300 font-semibold text-xs">
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  <span>Inner Embers (Passions)</span>
                </span>
                <span className="font-mono text-[10px] text-amber-200/70">01</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-200">
                {dossier.passions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 02 / Strengths */}
            <div className="glass-subcard rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-cyan-300 font-semibold text-xs">
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Spectral Gifts (Strengths)</span>
                </span>
                <span className="font-mono text-[10px] text-cyan-200/70">02</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-200">
                {dossier.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 03 / Weaknesses / Shadows Reframed */}
            <div className="glass-subcard rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-purple-300 font-semibold text-xs">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Shadows & Boundaries</span>
                </span>
                <span className="font-mono text-[10px] text-purple-200/70">03</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-200">
                {dossier.weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tarot-Style Career Arcana Cards */}
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              <span className="flex items-center gap-2">
                <Compass className="h-4 w-4" />
                <span>SEC. 04 // TOP 3 TAROT CAREER ARCANA MATCHES</span>
              </span>
              <span className="text-slate-400">INDEX 01-03</span>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
