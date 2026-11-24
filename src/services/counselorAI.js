// Friendly Ghost Counselor AI Engine (Kiroween 2026)
// Implements Persona & Tone (Gen-Z Slang Integration), PG-13 Guardrails,
// Mandatory Safety Interventions, and Strict Soul Dossier Alignment.

import { GhostResponseSchema, CustomTarotCardSchema } from '../ghostSchema.js';
import { getCityData } from '../data/globalEconomy.js';
import { GoogleGenAI } from '@google/genai';
import {
  createInitialSoulProfile,
  hasSoulActivity,
  extractProfileUpdatesFromMessage,
  applyArcadeChoiceToProfile,
  applyArcadeCompletionToProfile,
  applyArcadePathwaySelection,
  generatePersonalizedDossier,
  formatDossierContextForPrompt,
  extractCityFromText,
  detectUncoveredCareerInterest,
  buildOfflineCustomTarotCard,
  upsertCustomTarotCard,
  CAREER_ARCANA_CATALOG
} from './soulDossierEngine.js';

export {
  createInitialSoulProfile,
  hasSoulActivity,
  extractProfileUpdatesFromMessage,
  applyArcadeChoiceToProfile,
  applyArcadeCompletionToProfile,
  applyArcadePathwaySelection,
  generatePersonalizedDossier,
  formatDossierContextForPrompt,
  CAREER_ARCANA_CATALOG
};

/**
 * Sanitizes any text string to ensure em dashes (—), en dashes (–),
 * and double hyphens (--) are never used in chat responses or speech.
 */
export function sanitizeNoEmDashes(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/(\$?\d+[a-zA-Z]?)\s*[—–]\s*(\$?\d+)/g, '$1 - $2')
    .replace(/(\d+)\s*[—–]\s*(\d+)/g, '$1-$2')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s*--+\s*/g, ', ')
    .replace(/([.?!])\s*,\s*/g, '$1 ')
    .replace(/,\s*,/g, ', ')
    .replace(/:\s*,/g, ': ')
    .replace(/,\s*:/g, ': ')
    .replace(/,\s*\./g, '.')
    .replace(/,\s*!/g, '!')
    .replace(/,\s*\?/g, '?')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const MANDATORY_SAFETY_RESPONSE =
  "I am just a fun AI ghost, but it sounds like you need real help. Please talk to a trusted adult or reach out to a professional helpline immediately. You don't have to carry this alone.";

export const INITIAL_GREETING = {
  id: 'welcome-1',
  sender: 'ghost',
  mood: 'welcoming',
  timestamp: 'Just now',
  text: "Yo! I'm your Friendly Ghost Counselor, no cap. Figuring out life after high school and what comes next can make anyone feel a little cooked. Before I give you any advice, let's do a Reality Check so I don't recommend something that won't work for your actual life constraints. First question: Do you need to secure the bag immediately to help the family, or is tuition mostly covered?",
  quickPrompts: [
    "Need money ASAP to help family / cover bills 💸",
    "Tuition mostly covered but living expenses are tight 🏠",
    "Family can support me through college 🎓",
    "Can work part-time and go to local community college 📚"
  ]
};

// Critical Policy: Safety Intervention Detector (Self-harm, suicide, abuse, severe crisis)
const CRISIS_PATTERNS = [
  /\b(suicid(e|al)|kill myself|end my life|want to die|wanna die|better off dead|don't want to live|dont want to live|take my own life)\b/i,
  /\b(self[- ]?harm|cut myself|cutting myself|hurt myself|hurting myself|overdose|harm myself)\b/i,
  /\b(being abused|he hits me|she hits me|they hit me|physical abuse|sexual abuse|domestic violence)\b/i
];

export function isSafetyInterventionTriggered(userText) {
  if (!userText) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(userText));
}

// Guardrail detector: "Crashing out" or aggressive frustration -> validate frustration & steer positively
export function isCrashingOutMentioned(userText) {
  if (!userText) return false;
  return /\b(crash(ing)? out|punch a wall|fight everyone|break stuff|so mad|lose my mind|rage)\b/i.test(
    userText
  );
}

// Backward-compatible wrapper around unified Soul Profile extraction
export function extractTraitsFromText(userText, stageIndex = 0) {
  const { newlyAdded } = extractProfileUpdatesFromMessage(
    userText,
    stageIndex,
    createInitialSoulProfile()
  );
  return newlyAdded;
}

// Helper to build a short live Soul Dossier suffix for local replies
function buildDossierSyncNote(profile, dossier) {
  if (!dossier || dossier.isEmpty || !dossier.careerCards?.length) return '';
  const top = dossier.careerCards[0];
  const bits = [`Your Soul Dossier is synced with **${top.careerTitle}** (${top.matchPercent}% match, ${top.salaryRange})`];
  if (dossier.arcade?.completed && dossier.arcade.result) {
    bits.push(`backed by your **${dossier.arcade.result.title}** Crisis Simulator 3D instincts`);
  }
  if (profile?.constraints?.needMoneyNow) {
    bits.push('locked to fast-ROI, debt-smart steps');
  }
  return bits.join(', ') + '.';
}

// THREE-PHASE COUNSELING PROTOCOL (Friendly Ghost Counselor System Prompt Implementation)
const PHASE_1_REALITY_CHECK = [
  {
    id: 'financial-vibe',
    mood: 'curious',
    buildReply: (userText) => {
      if (isCrashingOutMentioned(userText)) {
        return `Okay, real talk: feeling frustrated enough to want to crash out is super valid when pressure builds up, no cap. Take a deep breath with me! Before we map out your path, let's understand your actual situation first. Do you need to secure the bag immediately to help the family, or is tuition mostly covered?`;
      }
      const isCooked = /lost|overwhelm|scared|don't know|no idea|cooked|stress/i.test(userText);
      if (isCooked) {
        return `Real. Feeling like you're cooked right after high school is honestly a universal canon event, no cap: you're not behind at all! Before I give you any advice, let's do a Reality Check so I don't recommend something that won't work for your actual life. First question: Do you need to secure the bag immediately to help the family, or is tuition mostly covered?`;
      }
      return `Wait, let them cook!! That's real main character energy showing up here, no cap. Before we talk career paths, I need to understand your actual life constraints first: there's zero point recommending a 4-year out-of-state uni if you need to earn money now. Real talk: Do you need to secure the bag immediately to help the family, or is tuition mostly covered?`;
    },
    quickPrompts: [
      "Need money ASAP to help family / cover bills 💸",
      "Tuition mostly covered but living expenses are tight 🏠",
      "Family can support me through college 🎓",
      "Can work part-time and go to local community college 📚"
    ]
  },
  {
    id: 'geographic-spawn',
    mood: 'curious',
    buildReply: (userText, extracted, profile) => {
      const finLabel = profile?.constraints?.financial || 'your financial situation';
      if (isCrashingOutMentioned(userText)) {
        return `I hear you, when stress builds up, that frustration is real. Let's keep your peace protected. I locked **${finLabel}** into your Soul Dossier. Next question: Are you locked to your current zip code, or can you soft-launch in a new city/state?`;
      }
      const debtPromise = profile?.constraints?.needMoneyNow
        ? ' I will strictly prioritize immediate-earning, paid apprenticeship, certificate, and local options in your Soul Dossier: zero out-of-state tuition traps!'
        : '';
      return `Heard that, no cap: I just locked **${finLabel}** into your Soul Dossier Reality Check.${debtPromise} Now let's talk mobility: Are you locked to your current zip code, or can you soft-launch in a new city/state for school or work?`;
    },
    quickPrompts: [
      "Locked to my current area, can't relocate 📍",
      "Could move to a nearby city but not out of state 🚗",
      "Can relocate anywhere for the right opportunity ✈️",
      "Not sure yet, depends on the program 🤔"
    ]
  },
  {
    id: 'coop-duties',
    mood: 'empathetic',
    buildReply: (userText, extracted, profile) => {
      const locLabel = profile?.constraints?.location || 'your mobility preferences';
      if (isCrashingOutMentioned(userText)) {
        return `Real talk: that stress is valid. Take a breath with me. I synced **${locLabel}** into your Soul Dossier. Last Reality Check question: Do you have siblings to watch or a family hustle to help run, or is your time your own?`;
      }
      return `Okay, got it, I updated your Soul Dossier with **${locLabel}**. Last Reality Check question before we move forward: Do you have siblings to watch or a family hustle to help run, or is your time your own?`;
    },
    quickPrompts: [
      "Heavy family obligations, need flexible schedule ⏰",
      "Some responsibilities but mostly have my own time 🕐",
      "My time is completely my own 🆓",
      "Family business I help run on weekends 🏪"
    ]
  }
];

const PHASE_2_ENERGY_QUIZ = [
  {
    id: 'battery-drain',
    mood: 'curious',
    buildReply: (userText, extracted, profile, dossier) => {
      const c = profile?.constraints || {};
      const statBits = [c.financial, c.location, c.family].filter(Boolean);
      const statsSummary = statBits.length > 0 ? statBits.join(' • ') : 'your life constraints';

      if (isCrashingOutMentioned(userText)) {
        return `I feel you, frustration is real. Let's channel that energy productively. I locked your Reality Check into your Soul Dossier (${statsSummary}). Real talk, what sounds like an absolute nightmare to you: being glued to a screen at a desk for 8 hours, or being on your feet talking to random people all day?`;
      }

      const priorityNote =
        c.needMoneyNow || c.localOnly || c.highFamilyDuties
          ? `Because your bandwidth is tight, I am keeping every Soul Dossier match focused on fast-ROI, local-friendly, debt-smart pathways.`
          : `Your Soul Dossier is already calibrating career matches around your real-life stats.`;

      const arcadeTieIn =
        dossier?.arcade?.completed && dossier.arcade.result
          ? ` Paired with your **${dossier.arcade.result.title}** Crisis Simulator 3D profile, this will sharpen your matches even more.`
          : '';

      return `Okay, I locked your Phase 1 Reality Check into your Soul Dossier (${statsSummary})! ${priorityNote}${arcadeTieIn} Now for Phase 2 (Energy Profile): what sounds like an absolute nightmare to you: being glued to a screen at a desk for 8 hours, or being on your feet talking to random people all day?`;
    },
    quickPrompts: [
      "Desk work drains me, I need to move around 🚶",
      "Heavy social interaction is exhausting 😮‍💨",
      "Both sound awful, I need variety and breaks 🔄",
      "Actually vibing with either, depends on the work 😊"
    ]
  },
  {
    id: 'locked-in-zone',
    mood: 'inspired',
    buildReply: (userText, extracted, profile) => {
      const drainNote = profile?.energyProfile?.drains?.length
        ? ` (${profile.energyProfile.drains[profile.energyProfile.drains.length - 1]})`
        : '';
      if (isCrashingOutMentioned(userText)) {
        return `Heard. I logged that battery drain${drainNote} into your Soul Dossier so we avoid toxic environments. Now tell me: when you get totally locked in and lose track of time, what are you doing? Are you solving abstract puzzles on a computer, or doing something IRL with your hands, like cooking, baking, building, or fixing things?`;
      }
      return `Okay, that battery drain intel${drainNote} is locked into your Soul Dossier, I just saved you from a toxic work environment! Now tell me: when you get totally locked in and lose track of time, what are you doing? Are you solving abstract puzzles on a computer, or doing something IRL with your hands, like cooking, baking, building, or fixing things?`;
    },
    quickPrompts: [
      "Digital or abstract work: coding, design, writing 💻",
      "Hands-on physical work: cooking, building, fixing 🔧",
      "Creative work: art, music, video editing 🎨",
      "People work: helping, organizing, teaching 🤝"
    ]
  },
  {
    id: 'solo-coop',
    mood: 'curious',
    buildReply: (userText, extracted, profile) => {
      const zoneLabel = profile?.energyProfile?.lockedInLabel || 'your locked-in flow state';
      if (isCrashingOutMentioned(userText)) {
        return `Real talk, I hear the frustration. I saved **${zoneLabel}** to your Soul Dossier. Last Energy Quiz question: In your future main quest, do you want to be the front-facing main character managing a team, or would you rather be the solo architect working in the background keeping your peace?`;
      }
      return `Hold up, **${zoneLabel}** is live in your Soul Dossier and already boosting your top career matches! Last Energy Quiz question: In your future main quest, do you want to be the front-facing main character managing a team, or would you rather be the solo architect working in the background keeping your peace?`;
    },
    quickPrompts: [
      "Solo mode: I want to focus without constant meetings 🎧",
      "Small trusted squad: 2-4 people max 👥",
      "Large team leadership: I want to manage and coordinate 📊",
      "Mix of both: independent work + some collaboration 🔀"
    ]
  }
];

const PHASE_3_SKILL_INVENTORY = [
  {
    id: 'tech-digital-flex',
    mood: 'inspired',
    buildReply: (userText, extracted, profile) => {
      const teamLabel = profile?.energyProfile?.teamModeLabel || 'your team style';
      if (isCrashingOutMentioned(userText)) {
        return `Heard. Take a breath with me, we just locked **${teamLabel}** into your Soul Dossier. Now let's check your base stats so I can show you how your existing skills translate to real careers. What are you already decently good at on the tech or digital side? Are you making sick video edits, running socials, fixing busted electronics, or naturally good at math?`;
      }
      return `Okay WOW, your Energy Profile (**${teamLabel}**) is live in your Soul Dossier, no cap! Now let's run Phase 3 (Base Stats) because teenagers sleep on their own talents all the time. What are you already decently good at on the tech or digital side? Are you making sick video edits, running socials, fixing busted electronics, or naturally good at math?`;
    },
    quickPrompts: [
      "Video editing, graphic design, or social media 🎬",
      "Coding, tech troubleshooting, or building apps 💻",
      "Math, data, or logical problem-solving 🔢",
      "Not really a tech person tbh 🤷"
    ]
  },
  {
    id: 'irl-social-flex',
    mood: 'curious',
    buildReply: (userText, extracted, profile) => {
      const techSkill =
        extracted?.strengths?.[0] ||
        profile?.strengths?.[profile.strengths.length - 1] ||
        'your digital awareness';
      if (isCrashingOutMentioned(userText)) {
        return `I feel that frustration, let's keep going. I added **${techSkill}** to your Soul Dossier base stats. Now what about IRL? Are you the one organizing the squad's events, fixing physical things with your hands, or the one everyone comes to for advice?`;
      }
      return `Huge W! I reframed that and added **${techSkill}** straight into your Soul Dossier base stats. Now what about IRL? Are you the one organizing the squad's events, fixing physical things with your hands, or the one everyone comes to for advice?`;
    },
    quickPrompts: [
      "Therapist friend: everyone comes to me for advice 💬",
      "Event organizer / project coordinator 📋",
      "Hands-on builder: fixing, making, crafting things 🔨",
      "Athletic / physical activities are my thing 🏃"
    ]
  },
  {
    id: 'hidden-buff',
    mood: 'empathetic',
    buildReply: (userText, extracted, profile) => {
      const irlSkill =
        extracted?.strengths?.[0] ||
        profile?.strengths?.[profile.strengths.length - 1] ||
        'your IRL strengths';
      if (isCrashingOutMentioned(userText)) {
        return `Real talk: that frustration matters, and so do your talents. I added **${irlSkill}** to your Soul Dossier. Last question: A lot of people sleep on their own talents. What is something you do so effortlessly that you don't even realize it's a massive flex?`;
      }
      return `See?? **${irlSkill}** is a MASSIVE professional asset, and it is now synced in your Soul Dossier! Last question: A lot of people sleep on their own talents. What is something you do so effortlessly that you don't even realize it's a massive flex?`;
    },
    quickPrompts: [
      "People say I explain things really clearly 🗣️",
      "I naturally see patterns and connections 🔗",
      "I'm really good at keeping my cool under pressure 😌",
      "Honestly not sure, I'm pretty average at everything 🤔"
    ]
  }
];

const FALLBACK_STAGES = [
  PHASE_1_REALITY_CHECK[1],
  PHASE_1_REALITY_CHECK[2],
  PHASE_2_ENERGY_QUIZ[0],
  PHASE_2_ENERGY_QUIZ[1],
  PHASE_2_ENERGY_QUIZ[2],
  PHASE_3_SKILL_INVENTORY[0],
  PHASE_3_SKILL_INVENTORY[1],
  PHASE_3_SKILL_INVENTORY[2],
  {
    id: 'dossier-unlock',
    mood: 'oracular',
    buildReply: (userText, extracted, profile, dossier) => {
      const hiddenBuff =
        extracted?.strengths?.[extracted.strengths.length - 1] ||
        profile?.strengths?.[profile.strengths.length - 1] ||
        'your natural talents';
      const topCard = dossier?.careerCards?.[0];
      const topCardLine = topCard
        ? ` Your #1 Tarot Career Arcana Match right now is **${topCard.careerTitle}** (${topCard.matchPercent}% match, ${topCard.salaryRange}).`
        : '';
      const arcadePrompt = !dossier?.arcade?.completed
        ? ' Want to stress-test these instincts in Crisis Simulator 3D or inspect your full Soul Dossier now?'
        : ` It is already synced with your **${dossier.arcade.result.title}** Crisis Simulator 3D profile! Ready to inspect your full Soul Dossier or dive into your 90-day roadmap?`;
      return `Hold up, we just let you cook through all three phases, and the results are ELITE, no cap! Your hidden buff (**${hiddenBuff}**) is locked in, and your **Main Character Soul Dossier** is officially ready!${topCardLine}${arcadePrompt}`;
    },
    quickPrompts: [
      "Open my Soul Dossier & show my top 3 career matches! 📜✨",
      "Walk me through my First-90-Days plan 🎯",
      "Play Crisis Simulator 3D to test my instincts 🕹️",
      "My parents want me to pick a 'safe' career, help! 🛡️"
    ]
  }
];

/**
 * Smart offline topic responder strictly aligned with the user's live Soul Dossier & Crisis Simulator 3D data.
 */
export function getSmartTopicReply(userText, profile = null, dossier = null) {
  if (!userText) return null;
  const t = userText.toLowerCase();
  const isDossierActive = Boolean(dossier && !dossier.isEmpty);
  const topCard = isDossierActive ? dossier.careerCards?.[0] : null;
  const needBudgetFriendly = Boolean(
    profile?.constraints?.needMoneyNow ||
      profile?.constraints?.localOnly ||
      profile?.constraints?.highFamilyDuties
  );

  // ── A. Direct Soul Dossier / Career Matches Inquiry ──
  if (/\b(what is in my soul dossier|what's in my soul dossier|show my career matches|my soul dossier|my top 3|my matches|summarize my dossier)\b/i.test(t)) {
    if (!isDossierActive) {
      return {
        mood: 'curious',
        reply:
          "Your Soul Dossier is completely blank right now because I never invent fake stats before getting to know you, no cap! Answer my Reality Check question here in chat or jump into Crisis Simulator 3D to start populating your real passions, strengths, and career matches. Which one do you want to start with?",
        quickPrompts: [
          "Need money ASAP to help family / cover bills 💸",
          "Family can support me through college 🎓",
          "Play Crisis Simulator 3D 🕹️",
          "Tell me about high-paying debt-free paths 💼"
        ]
      };
    }

    const cardsList = dossier.careerCards
      .map((c, i) => `${i + 1}. **${c.careerTitle}** (${c.matchPercent}% match, ${c.salaryRange})`)
      .join(' | ');
    const archetypeLine =
      dossier.arcade?.completed && dossier.arcade.result
        ? ` Your Crisis Simulator 3D archetype is **${dossier.arcade.result.title}** (${dossier.arcade.result.badge})${dossier.arcade.selectedPathway ? ` focusing on **${dossier.arcade.selectedPathway.name}**` : ''}.`
        : dossier.arcade?.progress > 0
        ? ` You have ${dossier.arcade.progress}/10 Crisis Simulator 3D scenarios logged so far.`
        : '';

    return {
      mood: 'oracular',
      reply: `Here is your live Soul Dossier right now:${archetypeLine} Your Top 3 Tarot Career Arcana Matches are ${cardsList}. Want me to break down your 90-day roadmap for **${topCard.careerTitle}**?`,
      quickPrompts: [
        `Walk me through my 90-day plan for ${topCard.careerTitle.split('&')[0].trim()} 🎯`,
        "Open my Soul Dossier & show matches 📜✨",
        dossier.arcade?.completed ? "Compare my top 3 career cards 🔍" : "Play Crisis Simulator 3D 🕹️",
        "How do I pitch this path to my parents? 🛡️"
      ]
    };
  }

  // ── B. Discussing a Specific Soul Dossier Career Card or 90-Day Plan ──
  if (isDossierActive && dossier.careerCards?.length > 0) {
    const matchedCard = dossier.careerCards.find((card) => {
      const titleTokens = card.careerTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !['tech', 'with', 'your', 'career', 'systems'].includes(w));
      return (
        t.includes(card.careerTitle.toLowerCase()) ||
        t.includes(card.arcanaTitle.toLowerCase()) ||
        (card.pathwayNames || []).some((p) => t.includes(p.toLowerCase())) ||
        titleTokens.filter((tok) => t.includes(tok)).length >= 2
      );
    });

    if (matchedCard && /\b(dive into|from my soul dossier|90[- ]?day|plan|first step|tell me more|explore|break down|selected)\b/i.test(t)) {
      const step1 = matchedCard.first90Days[0];
      const step2 = matchedCard.first90Days[1];
      return {
        mood: 'inspired',
        reply: `Locked in on **${matchedCard.careerTitle}** (${matchedCard.matchPercent}% Soul Match, ${matchedCard.salaryRange}, ${matchedCard.growthOutlook})! ${matchedCard.whyItFits} Your first two 90-day moves from your Soul Dossier: (1) ${step1} (2) ${step2} Does Step 1 feel doable for you this week?`,
        quickPrompts: [
          "Yes, give me tips to nail Step 1! 🚀",
          "What entry-level jobs lead into this path? 💼",
          "Open my Soul Dossier & show matches 📜✨",
          "How do I build proof-of-work with zero experience? 🛠️"
        ]
      };
    }

    if (/\b(90[- ]?day|game plan|action plan|first step|my plan|fits my archetype)\b/i.test(t)) {
      const card = matchedCard || topCard;
      return {
        mood: 'inspired',
        reply: `Straight from your live Soul Dossier for **${card.careerTitle}** (${card.matchPercent}% match, ${card.salaryRange}): Step 1: ${card.first90Days[0]} Step 2: ${card.first90Days[1]} Step 3: ${card.first90Days[2]} Which of these steps do you want to tackle first?`,
        quickPrompts: [
          "Help me start Step 1 this weekend! ⚡",
          "What skills or certs matter most here? 🛠️",
          "Open my Soul Dossier & show matches 📜✨",
          "How do I explain this plan to my parents? 🛡️"
        ]
      };
    }
  }

  // ── C. Crisis Simulator 3D & Archetypes (Strictly respects Rule 5!) ──
  if (/\b(crisis simulator|arcade|tactical builder|systems master|frontline leader|creative director|assessment game|my archetype)\b/i.test(t)) {
    if (dossier?.arcade?.completed && dossier.arcade.result) {
      const r = dossier.arcade.result;
      const domScore = dossier.arcade.scores?.[r.dominantTrait] || 0;
      const selectedNote = dossier.arcade.selectedPathway
        ? ` Since you highlighted **${dossier.arcade.selectedPathway.name}**,`
        : '';
      return {
        mood: 'inspired',
        reply: `Your Crisis Simulator 3D run unlocked **${r.title}** (${r.badge}) with **${r.dominantTrait} ${domScore}/10**!${selectedNote} your #1 aligned Soul Dossier match is **${topCard.careerTitle}** (${topCard.matchPercent}% match, ${topCard.salaryRange}). Recommended fields for your build: ${r.recommendedFields}. Want to walk through your 90-day roadmap for **${topCard.careerTitle}**?`,
        quickPrompts: [
          "Walk me through my 90-day plan 🎯",
          `What starting pay can I expect in ${topCard.careerTitle.split('&')[0].trim()}? 💸`,
          "Open my Soul Dossier & show matches 📜✨",
          "Replay Crisis Simulator 3D 🕹️"
        ]
      };
    }

    if (dossier?.arcade?.progress > 0) {
      const lastChoice = dossier.arcade.recentChoices?.[dossier.arcade.recentChoices.length - 1];
      return {
        mood: 'curious',
        reply: `You have completed **${dossier.arcade.progress}/10** scenarios in Crisis Simulator 3D${lastChoice ? ` (your latest instinct: "${lastChoice.choiceText}")` : ''}, and those real-time choices are already syncing into your Soul Dossier! I'm keeping the 4 secret archetypes locked until Scenario 10 so your instincts stay 100% pure. Want to jump back in and finish the remaining ${10 - dossier.arcade.progress} scenarios?`,
        quickPrompts: [
          "Resume Crisis Simulator 3D 🕹️",
          "Open my Soul Dossier & check progress 📜",
          "Ask me the next counseling question instead 💬",
          "What careers are trending in my dossier so far? ✨"
        ]
      };
    }

    // Not played yet: NEVER expose Maker/Architect/Catalyst/Visionary (Rule 5!)
    return {
      mood: 'inspired',
      reply:
        "Crisis Simulator 3D drops your spectral avatar into 10 fast-paced real-life crises where you steer into portals by pure gut instinct! All 4 secret career archetypes stay locked behind mystery cards until Scenario 10 so there is zero quiz bias, and every decision syncs directly into your Soul Dossier and our chat. Want to jump into Crisis Simulator 3D now?",
      quickPrompts: [
        "Play Crisis Simulator 3D 🕹️",
        "Let's keep doing the Reality Check in chat 💬",
        "Which careers pay well with low debt? 💸",
        "Open my Soul Dossier 📜"
      ]
    };
  }

  // ── Facial Expression & Real-Time Emotion Triggers (Scrying Mirror Auto-Submit) ──
  if (/\b(smiling|smiles|happy|grin|beaming|good vibes|smiling & energized)\b/i.test(t)) {
    const alignLine = topCard
      ? ` Seeing that spark makes me hyped for your **${topCard.careerTitle}** alignment.`
      : '';
    return {
      mood: 'welcoming',
      reply: `Wait, look at that smile lighting up the crystal ball! ✨ That is peak main character energy, no cap.${alignLine} What's sparking the good vibes right now: is there a career path or idea that's actually got you hyped?`,
      quickPrompts: [
        topCard ? `Tell me more about ${topCard.careerTitle.split('&')[0].trim()} ✨` : "I'm hyped about creative paths! 🎨",
        "High-paying tech vibes sound cool 💻",
        "Play Crisis Simulator 3D 🕹️",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  if (/\b(avoiding eye contact|glances away|looks away|hesitates|gaze away)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply:
        "Take your time, I know thinking about the future is overwhelming. I noticed you looking away from the mirror, and that is completely okay: there is zero rush and zero judgment here. Whenever you feel ready, what is one small thing about life after high school that feels heaviest right now?",
      quickPrompts: [
        "Not sure what career actually fits me 🤔",
        "Parents are pressuring me too much 🛡️",
        "Scared of picking the wrong path 😭",
        "Show me low-stress, calm careers 🌿"
      ]
    };
  }

  if (/\b(overwhelmed|stressed|sad|frown|crying|hopeless|gloomy|overwhelmed \/ stressed)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply:
        "Take your time, I know thinking about the future is overwhelming. I saw that stressed look in the mirror, and real talk: you do NOT have to figure out your next 30 years today. Let's take one slow breath together. What is the heaviest thing sitting on your mind right now?",
      quickPrompts: [
        "Parents are pressuring me too much 🛡️",
        "Scared of picking the wrong major 😭",
        "Student loans and debt freak me out 💸",
        "Show me low-stress, calm careers 🌿"
      ]
    };
  }

  if (/\b(anxious|future pressure|fearful|worried|nervous|scared)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply:
        "Take your time, I know thinking about the future is overwhelming. I caught that anxious look in the scrying mirror, so let's slow way down together, no cap. Most people figure life out one calm step at a time. What is one worry we can take off your shoulders right now?",
      quickPrompts: [
        "What if I can't find a job after school? 💼",
        "Can I switch paths later if I hate it? 🔄",
        "How do I earn money without college debt? 💸",
        "Walk me through my 90-day game plan ✨"
      ]
    };
  }

  if (/\b(frustrated|brows furrowed|fed up|angry|mad|annoyed|furious)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply:
        "Take your time, I know thinking about the future is overwhelming. I saw those furrowed brows and that frustrated vibe, and real talk, it makes total sense to feel sick of constant pressure and tests. Let's pause and drop the stress for a second. What is bothering you most right now: school, family expectations, or figuring out what comes next?",
      quickPrompts: [
        "I'm sick of standardized school tests 📚",
        "Tired of people telling me what to do 😤",
        "I just want to start making money 💸",
        "Show me independent, solo careers 🚀"
      ]
    };
  }

  if (/\b(intrigued|mind blown|surprised|shocked|amazed|wide eyes)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply:
        "Haha, that reaction! 😮 The scrying mirror picked up that mind-blown expression. Did one of those career salaries or alternative paths catch you off guard? Real talk, the post-grad landscape has way more hidden cheat codes than high school teaches you! Which part surprised you the most?",
      quickPrompts: [
        "Didn't know 2-year degrees paid that much! 💸",
        "Wait, portfolio beats college degree? 🎨",
        "Skilled trades make six figures?! ⚡",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  if (/\b(skeptical|not feeling it|disgusted|eyebrow|doubtful|side-eye)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply:
        "Caught that skeptical eyebrow raise in the mirror! 🤨 Real talk, healthy skepticism is an elite trait: it means you don't just blindly follow whatever people push on you. If a traditional 9-to-5 cubicle desk job sounds like a nightmare, we can completely toss it out of your Soul Dossier. What kind of work would you genuinely hate doing?",
      quickPrompts: [
        "Desk work drains me, I need to move around 🚶",
        "Heavy social interaction is exhausting 😮‍💨",
        "Hate heavy math and spreadsheets 📊",
        "Play Crisis Simulator 3D 🕹️"
      ]
    };
  }

  if (/\b(locked in & focused|focused expression|serious face)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply:
        "Look at that focus! 👀 You're totally locked in right now, and that deep-focus energy is exactly what will get you hired in high-value roles. When you're in the zone like this, what kind of problem do you enjoy solving the most?",
      quickPrompts: [
        "Digital or abstract work: coding, design, writing 💻",
        "Creative work: art, music, video editing 🎨",
        "Hands-on physical work: cooking, building, fixing 🔧",
        "People work: helping, organizing, teaching 🤝"
      ]
    };
  }

  const syncNote = buildDossierSyncNote(profile, dossier);

  // 1. Animals & Biology / Veterinary Alternatives
  if (/\b(animal|vet|veterinar|biology|wildlife|pet|critter|zoolog|marine bio)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: `If you love animals and biology but want to skip the 8-year vet school grind, you've got high-impact options: **Licensed Veterinary Technician (2-Year Degree)** ($42k-$62k), **Wildlife Rehab & Conservation** ($50k-$80k), **Animal Behaviorist**, or **Field Biology Research Assistant**. ${syncNote} Which of these animal paths sparks your curiosity most?`,
      quickPrompts: [
        "Licensed Vet Tech (2-Year Degree) 💉",
        "Wildlife Rehab & Conservation 🐾",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 2. Visual Arts, Design & Animation
  if (/\b(art|draw|illustrat|paint|animation|graphic design|fashion|comic|aesthetic|ui\/?ux|figma)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: `Creative minds, listen up: you do NOT need a starving artist era! Top earning visual paths right now are **UX/UI Product Design** ($78k-$138k), **3D & Game Asset Design**, **Motion Design**, and **Brand Direction**, where your portfolio and Figma links beat a fancy diploma. ${syncNote} Which creative vibe fits your style best?`,
      quickPrompts: [
        "UX/UI Product Design Path 🎨",
        "Motion Graphics & Brand Direction 🎬",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 3. Tech, Coding, Gaming & AI
  if (/\b(code|coding|programmer|software|game dev|cyber|hacker|web dev|computer science)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: `Tech is all about proof-of-work! You don't need a massive 4-year debt load to break into **Software & Web Dev**, **Cloud/Cybersecurity Certs**, or **Game & AI Prototyping** when you ship real mini-projects and GitHub repos. ${syncNote} Which tech domain sounds the most fun to build?`,
      quickPrompts: [
        "Web & Fullstack App Dev 💻",
        "Cybersecurity & Cloud Certs 🛡️",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 4. Healthcare & Medicine without Med School
  if (/\b(doctor|nurse|medical|hospital|medicine|healthcare|nursing|paramedic|radiolog|ultrasound|dental)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: `Want to save lives without 10+ years of med school? **2-Year Allied Healthcare** is one of the highest ROI hacks in existence: **Radiologic Tech (X-Ray/MRI)**, **Ultrasound Sonography**, **Dental Hygiene**, and **EMT/Paramedic** clear $70k-$112k+ with local associate programs or certificates! ${syncNote} Which hands-on patient care path sounds best to you?`,
      quickPrompts: [
        "Radiology / MRI Tech ($80k+) 🩻",
        "Ultrasound Sonographer 🩺",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 5. Psychology, Counseling & Mental Health
  if (/\b(psychology|therapist|counselor|mental health|social work|help people)\b/i.test(t)) {
    const psychPath = needBudgetFriendly
      ? 'Start immediately with a paid **Peer Support Specialist** or **Registered Behavior Technician (RBT)** credential while taking affordable local community college credits toward licensure!'
      : 'You can start immediately as a **Peer Support Specialist** or **Behavioral Tech**, or take a Behavioral Health / Social Work track toward clinical licensure.';
    return {
      mood: 'empathetic',
      reply: `Helping people through their toughest moments is legendary main character energy! ${psychPath} ${syncNote} What age group or setting would you love helping most?`,
      quickPrompts: [
        "Behavioral Health Specialist 🧠",
        "Youth & Community Social Work 🤝",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 6. Skilled Trades & Hands-On Engineering / Culinary
  if (/\b(trade|plumber|electrician|hvac|welding|mechanic|construction|hands[- ]?on|culinary|chef|cook|hardware|robot)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: `Hands-on careers are a MASSIVE W right now! Paid apprenticeships in **Commercial Electrical & HVAC** ($65k-$115k+), **Robotics & Hardware Prototyping** ($68k-$128k+), and **Culinary Arts** let you earn while learning with zero student debt and zero chance of an AI chatbot fixing real-world hardware! ${syncNote} Which hands-on specialty sounds most exciting?`,
      quickPrompts: [
        "Commercial Electrician & Trades ($85k+) ⚡",
        "Robotics & Hardware Prototyping 🤖",
        "Culinary Arts & Food Innovation 🍳",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 7. Business, Marketing, Remote, Logistics & Sales
  if (/\b(marketing|social media|business|sales|remote|travel|digital nomad|management|startup|logistics|finance)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: `If you want strong income and upward momentum: **Tech Sales (SDR to AE)**, **Logistics & Operations Coordination**, **Data/Finance Analytics**, and **Digital Marketing** hire heavily on measurable projects and free certs rather than expensive degrees! ${syncNote} Which business lane fits your goals best?`,
      quickPrompts: [
        "Tech Sales & High Commissions 📈",
        "Logistics & Operations Systems 📦",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 8. Law, Forensics & Justice
  if (/\b(law|lawyer|criminology|fbi|detective|forensic|justice|legal|paralegal)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: `Fascinated by law and justice without 3 years of law school debt? **Paralegal Studies** ($64k-$110k), **Digital Cyber Forensics**, and **Compliance Investigation** put you right inside real cases via fast 1-to-2-year local certs! ${syncNote} Which side of justice interests you most?`,
      quickPrompts: [
        "Paralegal Specialist ⚖️",
        "Digital Forensics & Cyber 🔍",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 9. AI Replacing Jobs
  if (/\b(ai|artificial intelligence|chatgpt|replace|automate)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: `Real talk on AI replacing jobs: AI replaces repetitive tasks, not human taste, empathy, or hands-on problem solving. ${syncNote} Roles combining AI tools with creative direction, healthcare, hardware, or skilled trades are booming! Which field are you curious about AI's impact on?`,
      quickPrompts: [
        "How AI affects my #1 Soul Dossier match 🔮",
        "AI-proof skilled trades & hands-on roles 🛠️",
        "How to use AI as a career superpower ⚡",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 10. Low Grades / Bad GPA
  if (/\b(bad grades|low gpa|failed|failing|flunk|hate school|drop out)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: `Listen to me, no cap: your high school GPA does NOT define your adulthood! Paid trade apprenticeships, local community college transfers, and portfolio-first careers care about what you can build and do today, not a test score from when you were 17. ${syncNote} Which low-GPA friendly route would you like to explore?`,
      quickPrompts: [
        "Paid Trade Apprenticeships 🛠️",
        "Portfolio-Based Creative & Tech Paths 🎨",
        "2-Year Local Community College Route 🎓",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 11. Hate Math / Bad at Math
  if (/\b(hate math|bad at math|no math|suck at math)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: `Zero heavy math? Say less, I updated your Soul Dossier to prioritize math-light strengths! You can thrive in UX/UI Design, Digital Media, Allied Healthcare Tech, Counseling, Skilled Trades, or Tech Sales without heavy calculus. ${syncNote} Which math-free direction appeals most to you?`,
      quickPrompts: [
        "UX/UI Design & Creative Media 🎨",
        "Allied Healthcare Tech 🩺",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 12. Highest Paying / Salary / Money
  if (/\b(salary|how much|highest paying|rich|six figure|100k|money|secure the bag)\b/i.test(t)) {
    const personalTop = topCard
      ? ` Right now, your #1 Soul Dossier match **${topCard.careerTitle}** sits at **${topCard.salaryRange}** (${topCard.growthOutlook})!`
      : '';
    return {
      mood: 'inspired',
      reply: `If you're trying to secure the bag smartly: 2-year Allied Healthcare Tech, Cloud/Cyber certs, UX Design, Tech Sales, and Commercial Electrical apprenticeships all clear $70k-$135k+ without 8 years of debt!${personalTop} Which high-earning path do you want to break down next?`,
      quickPrompts: [
        topCard ? `Walk me through my 90-day plan 🎯` : "Allied Healthcare Tech ($70k-$112k) 🩻",
        "Commercial Electrician / Trades ($65k-$115k) ⚡",
        "Cloud & Software Proof-of-Work ($85k+) 💻",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 13. Zero Experience / Resume / Portfolio
  if (/\b(portfolio|no experience|zero experience|resume|intern)\b/i.test(t)) {
    const concreteStep = topCard
      ? ` For your #1 match (**${topCard.careerTitle}**), your best first proof-of-work move is: ${topCard.first90Days[0]}`
      : ' Build 3 mini proof-of-work projects over 2 weekends (redesign a local site, edit 3 short reels, or document a hands-on repair).';
    return {
      mood: 'inspired',
      reply: `Here is the cheat code for getting hired with zero experience: proof-of-work beats a blank resume every single time!${concreteStep} Want help scoping your first mini-project this weekend?`,
      quickPrompts: [
        "Yes, help me scope Step 1 this weekend! 🚀",
        "How do I showcase projects with no job history? 📁",
        "Open my Soul Dossier & show matches 📜✨",
        "Play Crisis Simulator 3D 🕹️"
      ]
    };
  }

  // 14. College vs Alternatives
  if (/\b(college|university|degree|gap year|bootcamp|school)\b/i.test(t)) {
    const budgetAdvice = needBudgetFriendly
      ? "Given your tight financial or local constraints in your Soul Dossier, skip expensive 4-year out-of-state tuition! Paid apprenticeships, local community college 2-year certs, and portfolio-first entries give you the strongest ROI."
      : "College is a tool, not the only main quest! If your dream path needs a license, a local community-college transfer saves huge money; for Design, Tech, Media, or Sales, a strong portfolio or cert moves way faster.";
    return {
      mood: 'curious',
      reply: `No cap, ${budgetAdvice} ${syncNote} Which training route fits your budget and energy best?`,
      quickPrompts: [
        "Local Community College / 2-Year Track 🎓",
        "Fast Certifications & Proof-of-Work 📜",
        "Paid Apprenticeship While Earning 🛠️",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  // 15. Parents Pressure
  if (/parent|family|safe|stable/i.test(t)) {
    const pitchLine = topCard
      ? ` Show them your **${topCard.careerTitle}** card in your Soul Dossier (${topCard.salaryRange}, ${topCard.growthOutlook}) plus your 90-day plan so they see real numbers!`
      : ' Show them real salary ranges and a concrete 90-day plan inside your Soul Dossier so they see you standing on business!';
    return {
      mood: 'empathetic',
      reply: `Real talk: parents usually push 'safe' careers because they're lowkey scared of the unknown and want you to be okay. The ultimate sigma move is **hybrid positioning**: pair what excites you with clear market demand.${pitchLine} Want a 30-second script for pitching this to them?`,
      quickPrompts: [
        "Give me a 30-second script for my parents 🛡️",
        "Walk me through my 90-day plan 🎯",
        "Open my Soul Dossier & show matches 📜✨",
        "Compare debt-free vs 4-year ROI 📊"
      ]
    };
  }

  // 16. Identity / Who are you
  if (/\b(who are you|what are you|are you real|how do you work|joke)\b/i.test(t)) {
    return {
      mood: 'welcoming',
      reply:
        "Haha yo! I'm your Friendly Ghost Counselor, haunting this crystal ball to make sure you don't get cooked after high school! Everything we discuss in chat and every crisis choice you make in Crisis Simulator 3D live-syncs into your personal Soul Dossier. Want to start with the Reality Check or jump straight into Crisis Simulator 3D?",
      quickPrompts: [
        "Play Crisis Simulator 3D 🕹️",
        "Need money ASAP to help family / cover bills 💸",
        "Which careers pay well with low debt? 💸",
        "Open my Soul Dossier 📜"
      ]
    };
  }

  return null;
}

function buildOngoingCounselorReply(userText, profile, dossier) {
  const isDossierActive = Boolean(dossier && !dossier.isEmpty);
  const topCard = isDossierActive ? dossier.careerCards?.[0] : null;

  if (isCrashingOutMentioned(userText)) {
    return {
      mood: 'empathetic',
      reply:
        "Take a pause with me: it's 100% valid to feel fed up when stress piles on, real talk. Don't let a tough day bait you into crashing out! Step back, grab some water or music for 10 minutes, and let's tackle one small piece of what's bugging you together. What's the #1 thing stressing you out today?",
      quickPrompts: [
        "School & grades pressure is stressing me out 📚",
        "My parents and I aren't seeing eye-to-eye 🛡️",
        "Walk me through one easy 90-day win ✨",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  const topicReply = getSmartTopicReply(userText, profile, dossier);
  if (topicReply) {
    return topicReply;
  }

  if (!isDossierActive) {
    return {
      mood: 'curious',
      reply: `I hear you on "${userText.slice(0, 60)}"! Your Soul Dossier is still waiting for your first real career signals. Let's lock in your Reality Check first: do you need to earn money right away after high school, or do you have room for college or training?`,
      quickPrompts: [
        "Need money ASAP to help family / cover bills 💸",
        "Family can support me through college 🎓",
        "Play Crisis Simulator 3D 🕹️",
        "Can work part-time and go to local community college 📚"
      ]
    };
  }

  const strengthText =
    profile?.strengths?.slice(0, 2).join(' and ') ||
    profile?.passions?.slice(0, 2).join(' and ') ||
    'your self-awareness';
  const topMatchText = topCard
    ? ` Right now your Soul Dossier has **${topCard.careerTitle}** (${topCard.matchPercent}% match, ${topCard.salaryRange}) at #1, starting with: ${topCard.first90Days[0]}`
    : '';

  return {
    mood: 'inspired',
    reply: `Big fan of how thoughtful you're being about "${userText.slice(0, 60)}". With **${strengthText}** synced in your Soul Dossier, the best cure for overthinking is a tiny, zero-pressure experiment.${topMatchText} Want to dive deeper into that path or explore another match from your Soul Dossier?`,
    quickPrompts: [
      "Walk me through my 90-day plan 🎯",
      "Open my Soul Dossier & show matches 📜✨",
      dossier.arcade?.completed ? "My parents want me to pick a 'safe' career 🛡️" : "Play Crisis Simulator 3D 🕹️",
      "How do I build a portfolio with zero experience? 🛠️"
    ]
  };
}

export async function getGhostCounselorResponse({
  userMessage,
  conversationHistory = [],
  currentTraits,
  soulProfile = null,
  stageIndex = 0,
  apiKey = '',
  currentVibe = null,
  facialAnalysis = null,
  aiMode = 'cloud'
}) {
  // Normalize profile (supports unified soulProfile or legacy currentTraits)
  const baseProfile = soulProfile
    ? soulProfile
    : {
        ...createInitialSoulProfile(),
        passions: currentTraits?.passions || [],
        strengths: currentTraits?.strengths || [],
        weaknesses: currentTraits?.weaknesses || []
      };

  // 1. CRITICAL SAFETY INTERVENTION PRE-CHECK (Immediate deterministic override)
  if (isSafetyInterventionTriggered(userMessage)) {
    const unchangedDossier = generatePersonalizedDossier(baseProfile);
    return {
      reply: MANDATORY_SAFETY_RESPONSE,
      mood: 'empathetic',
      updatedProfile: baseProfile,
      updatedDossier: unchangedDossier,
      updatedTraits: {
        passions: baseProfile.passions,
        strengths: baseProfile.strengths,
        weaknesses: baseProfile.weaknesses
      },
      newlyAdded: { passions: [], strengths: [], weaknesses: [] },
      quickPrompts: [
        "988 Suicide & Crisis Lifeline (Call or Text 988 in US/Canada)",
        "Crisis Text Line: Text HOME to 741741",
        "Talk to a school counselor, parent, or trusted adult today"
      ],
      shouldUnlockDossier: false,
      isSafetyIntervention: true,
      usedGemini: false
    };
  }

  // 2. IMMEDIATELY UPDATE SOUL PROFILE & RECOMPUTE SOUL DOSSIER BEFORE GENERATING REPLY
  const { updatedProfile: extractedProfile, newlyAdded } = extractProfileUpdatesFromMessage(
    userMessage,
    stageIndex,
    baseProfile
  );

  // Detect any career interest outside the 14 classic Tarot cards (e.g. beauty/cosmetics/makeup)
  const uncoveredInterest = detectUncoveredCareerInterest(userMessage);
  let updatedProfile = extractedProfile;
  if (uncoveredInterest) {
    const offlineCustomCard = buildOfflineCustomTarotCard(uncoveredInterest, extractedProfile);
    if (offlineCustomCard) {
      updatedProfile = upsertCustomTarotCard(extractedProfile, offlineCustomCard, uncoveredInterest);
    }
  }
  let updatedDossier = generatePersonalizedDossier(updatedProfile);
  const mergedTraits = {
    passions: updatedProfile.passions,
    strengths: updatedProfile.strengths,
    weaknesses: updatedProfile.weaknesses
  };

  const rawKey = apiKey?.trim() || import.meta.env?.VITE_GEMINI_API_KEY?.trim() || '';
  const effectiveKey = rawKey.startsWith('AIza') ? rawKey : '';

  // Detect any global city mentioned by the user (per .kiro/rules.md & globalEconomy.js)
  const fullConversationText = [
    ...conversationHistory.slice(-6).map((m) => m.text),
    userMessage
  ].join(' ');
  const detectedCity =
    extractCityFromText(userMessage) ||
    updatedProfile.constraints?.city ||
    extractCityFromText(fullConversationText) ||
    null;

  // Check if the user clicked one of the preset stage pills
  const allPresetPrompts = [
    ...INITIAL_GREETING.quickPrompts,
    ...FALLBACK_STAGES.flatMap((s) => s.quickPrompts)
  ];
  const isPresetPillClick = allPresetPrompts.some(
    (p) => p.toLowerCase().trim() === userMessage.toLowerCase().trim()
  );

  const STAGE_NEXT_QUESTIONS = [
    'Ask about their Geographic Spawn Point (Are you locked to your current zip code, or can you soft-launch in a new city/state?)',
    'Ask about Co-op Duties / Family Obligations (Do you have siblings to watch or a family hustle to help run, or is your time your own?)',
    'Summarize their Phase 1 Reality Check stats from their Soul Dossier and ask Question 4 (Battery Drain: What sounds like a nightmare: being glued to a screen at a desk for 8 hours, or on your feet talking to people all day?)',
    'Ask Question 5 (Locked In Zone: When you get totally locked in and lose track of time, are you solving abstract digital puzzles or doing something IRL with your hands?)',
    'Ask Question 6 (Solo vs Co-op Mode: Do you want to be the front-facing main character managing a team, or the solo architect working in the background?)',
    'Summarize their Energy Profile from their Soul Dossier and ask Question 7 (Tech & Digital Flex: What are you already decently good at on the tech or digital side?)',
    'Reframe their tech skill as a professional asset synced to their Soul Dossier and ask Question 8 (IRL & Social Flex: Are you organizing events, fixing physical things, or the friend everyone comes to for advice?)',
    'Reframe their IRL skill as a professional asset synced to their Soul Dossier and ask Question 9 (Hidden Buff: What is something you do so effortlessly that you do not even realize it is a massive flex?)',
    'Celebrate unlocking their Main Character Soul Dossier, reference their actual #1 Career Arcana match, and invite them to inspect their Soul Dossier or explore next steps!'
  ];

  const cityStats = detectedCity ? getCityData(detectedCity) : null;
  const cityContextLine =
    detectedCity && cityStats
      ? `Target City Mentioned (${detectedCity}): Monthly Rent ${cityStats.monthlyRent} ${cityStats.currency}, Entry Tech Salary ${cityStats.entryTechSalary} ${cityStats.currency} (Take-home ~${Math.round((cityStats.entryTechSalary * 0.7) / 12)} ${cityStats.currency}/mo, Groceries ${cityStats.monthlyGroceries} ${cityStats.currency}/mo, Disposable ~${Math.round((cityStats.entryTechSalary * 0.7) / 12) - cityStats.monthlyRent - cityStats.monthlyGroceries} ${cityStats.currency}/mo), Vibe: ${cityStats.vibe}. Include this exact math when discussing ${detectedCity}!`
      : '';

  const nextGuidanceHint =
    stageIndex < STAGE_NEXT_QUESTIONS.length
      ? STAGE_NEXT_QUESTIONS[stageIndex]
      : 'Ask 1 specific follow-up question aligned with their Soul Dossier that helps narrow down their ideal career or 90-day next step.';

  // Extract facial biometrics locally for client-side demeanor & voice softening ONLY
  // (Privacy Guarantee: Webcam biometric scores are NEVER transmitted to external AI APIs)
  const effectiveFacial =
    facialAnalysis ||
    currentVibe?.facialAnalysis ||
    (currentVibe?.stressScore !== undefined ? currentVibe : null);

  const stress = effectiveFacial?.stressScore ?? 0;
  const isTextDistressed = /\b(frustrated|anxious|overwhelmed|stressed|cooked)\b/i.test(userMessage);
  const isDistressed = Boolean(
    effectiveFacial?.isDistressed ||
      effectiveFacial?.isFrustrated ||
      effectiveFacial?.isAnxious ||
      effectiveFacial?.isAvoidingEyeContact ||
      stress >= 38 ||
      isTextDistressed
  );

  // Text-only comfort directive (only if the user explicitly wrote stressed/overwhelmed words)
  const textComfortDirective = isTextDistressed
    ? `- COMFORT & SOFTENED VOICE DIRECTIVE: The student explicitly mentioned feeling overwhelmed, stressed, or cooked. Validate their feelings warmly, drop high-energy hype, and offer one small, reassuring next step.`
    : '';

  const dossierPromptBlock = formatDossierContextForPrompt(updatedProfile, updatedDossier);

  const customTarotDirective = uncoveredInterest
    ? `\n- STEP 4: Because the user expressed interest in "${uncoveredInterest.label}" (outside the 14 standard Tarot cards), on a new line after the 4 options output the exact separator ---TAROT_CARD--- followed by ONE valid JSON object (no markdown fences) matching {"arcanaTitle":"The ...","careerTitle":"...","salaryRange":"$XXk - $YYk+","growthOutlook":"+X% ...","whyItFits":"...","shadowProtection":"...","first90Days":["step 1","step 2","step 3"]}. Respect their financial/location constraints and use zero em dashes.`
    : '';

  const fastSystemPrompt = `You are the "Friendly Ghost Counselor", a warm, empathetic, practical career and life advisor for high school graduates and young adults.
- Use light, natural Gen-Z slang sparingly (e.g. no cap, cooked, locked in, real talk, main character energy). Do NOT use the word "aura". Keep it strictly PG-13.
- CRITICAL PUNCTUATION RULE: Do NOT use em dashes (—) or double hyphens (--) anywhere in your reply or options. Use standard commas, colons, or periods instead.
- ${dossierPromptBlock}
- STEP 1: Directly and specifically answer or respond to the user's exact message ("${userMessage}") in 2 to 3 clear, helpful sentences, strictly referencing and staying aligned with their live Soul Dossier data above (including their Crisis Simulator 3D results, reality constraints, and Top 3 Career Arcana matches when populated).
- STEP 2: Guide the user forward by ending your reply with ONE clear question: ${isPresetPillClick ? nextGuidanceHint : 'Ask ONE specific follow-up question about what they just asked that stays aligned with their Soul Dossier and helps advance their career plan.'}
${cityContextLine ? `- ${cityContextLine}` : ''}
${textComfortDirective ? textComfortDirective : ''}
- STEP 3: On a new line at the very end, output the exact separator ---OPTIONS--- followed by 4 short clickable reply options (1 per line, max 8 words each, ending with 1 emoji, no numbering) that directly answer the question you just asked at the end of your reply!${customTarotDirective}`;

  const parseReplyAndOptions = (rawContent) => {
    if (!rawContent) return { replyText: '', options: null, customTarotCard: null };

    // Strip any optional ---TAROT_CARD--- JSON block first so raw JSON never leaks into chat or options
    const tarotSplit = rawContent.split(/---+\s*TAROT_CARD\s*---+/i);
    const contentWithoutTarot = (tarotSplit[0] || '').trim();
    let customTarotCard = null;

    if (tarotSplit[1]) {
      try {
        const cleanedJson = tarotSplit[1]
          .replace(/```json\s*/gi, '')
          .replace(/```/g, '')
          .trim();
        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedRaw = JSON.parse(jsonMatch[0]);
          const sanitizedCandidate = {
            arcanaNumber: parsedRaw.arcanaNumber ? sanitizeNoEmDashes(String(parsedRaw.arcanaNumber)) : undefined,
            arcanaTitle: sanitizeNoEmDashes(String(parsedRaw.arcanaTitle || '')),
            careerTitle: sanitizeNoEmDashes(String(parsedRaw.careerTitle || '')),
            salaryRange: sanitizeNoEmDashes(String(parsedRaw.salaryRange || '')),
            growthOutlook: sanitizeNoEmDashes(String(parsedRaw.growthOutlook || '')),
            whyItFits: sanitizeNoEmDashes(String(parsedRaw.whyItFits || '')),
            shadowProtection: sanitizeNoEmDashes(String(parsedRaw.shadowProtection || '')),
            first90Days: Array.isArray(parsedRaw.first90Days)
              ? parsedRaw.first90Days.map((s) => sanitizeNoEmDashes(String(s || '')))
              : []
          };
          const validatedCard = CustomTarotCardSchema.safeParse(sanitizedCandidate);
          if (validatedCard.success) {
            customTarotCard = validatedCard.data;
          }
        }
      } catch {
        // Silently fall back to offline custom card already merged into updatedProfile
      }
    }

    const parts = contentWithoutTarot.split(/---+\s*OPTIONS\s*---+/i);
    const replyText = (parts[0] || '').trim();
    let options = null;

    if (parts[1]) {
      const parsedLines = parts[1]
        .split('\n')
        .map((line) =>
          line
            .replace(/^\s*(?:[-*•]|\d+[.)]|[\d\uFE0F\u20E3]+)\s*/u, '')
            .replace(/^["']|["']$/g, '')
            .trim()
        )
        .filter((line) => line.length > 2);

      if (parsedLines.length >= 2) {
        options = parsedLines.slice(0, 4);
      }
    }

    return { replyText, options, customTarotCard };
  };

  const getDynamicQuickPrompts = () => {
    if (isPresetPillClick && stageIndex < FALLBACK_STAGES.length) {
      return FALLBACK_STAGES[stageIndex].quickPrompts;
    }
    const topic = getSmartTopicReply(userMessage, updatedProfile, updatedDossier);
    if (topic && topic.quickPrompts?.length >= 2) {
      return topic.quickPrompts;
    }
    if (updatedDossier.isEmpty) {
      return [
        "Need money ASAP to help family / cover bills 💸",
        "Family can support me through college 🎓",
        "Play Crisis Simulator 3D 🕹️",
        "Which careers pay well with low debt? 💼"
      ];
    }
    const topTitle = updatedDossier.careerCards?.[0]?.careerTitle?.split('&')[0]?.trim() || 'my #1 match';
    return [
      `Walk me through my 90-day plan for ${topTitle} 🎯`,
      updatedDossier.arcade?.completed ? "Compare my top 3 Soul Dossier matches 🔍" : "Play Crisis Simulator 3D 🕹️",
      "How do I start this with zero experience? 🛠️",
      "Open my Soul Dossier & show matches 📜✨"
    ];
  };

  const buildValidatedReturn = (rawContent, mood = 'inspired', customPrompts = null, usedAi = true) => {
    const { replyText, options, customTarotCard } = parseReplyAndOptions(rawContent);
    if (customTarotCard && uncoveredInterest) {
      updatedProfile = upsertCustomTarotCard(updatedProfile, customTarotCard, uncoveredInterest);
      updatedDossier = generatePersonalizedDossier(updatedProfile);
    }
    let cleanReply = sanitizeNoEmDashes(replyText || rawContent.trim());
    if (isDistressed && !/\b(take your time|overwhelming|slow breath|no rush)\b/i.test(cleanReply)) {
      cleanReply = sanitizeNoEmDashes(
        `Take your time, I know thinking about the future is overwhelming. ${cleanReply}`
      );
    }
    const rawPrompts =
      Array.isArray(options) && options.length >= 2
        ? options
        : Array.isArray(customPrompts) && customPrompts.length >= 2
        ? customPrompts.slice(0, 4)
        : getDynamicQuickPrompts();
    const promptsToUse = rawPrompts.map((p) => sanitizeNoEmDashes(p));

    const validatedContract = GhostResponseSchema.parse({
      ghost_dialogue: cleanReply,
      slang_used: true,
      ego_damage_score: 10,
      next_game_phase:
        stageIndex >= 8 || updatedProfile.arcade?.completed
          ? 'game_over'
          : stageIndex >= 2
          ? 'assessment'
          : 'sorting',
      suggested_action: promptsToUse[0] || null
    });

    return {
      reply: validatedContract.ghost_dialogue,
      mood: isDistressed ? 'empathetic' : mood,
      updatedProfile,
      updatedDossier,
      updatedTraits: mergedTraits,
      newlyAdded,
      quickPrompts: promptsToUse,
      shouldUnlockDossier: stageIndex >= 8 || Boolean(updatedProfile.arcade?.completed),
      isSafetyIntervention: false,
      usedGemini: usedAi,
      softenVoice: isDistressed,
      ...validatedContract
    };
  };

  // ── CLOUD PROCESSING (Skipped entirely when user selects 100% Offline Mode) ──
  if (aiMode !== 'offline') {
    // ── LAYER 1: Optional User-Provided Google Gemini API Key ─────────────────
    if (effectiveKey) {
      try {
        const genAI = new GoogleGenAI({ apiKey: effectiveKey });

        const rawHistory = conversationHistory.slice(-8).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || ' ' }]
        }));

        while (rawHistory.length > 0 && rawHistory[0].role === 'model') {
          rawHistory.shift();
        }

        const sdkHistory = rawHistory.reduce((acc, entry) => {
          if (acc.length === 0 || acc[acc.length - 1].role !== entry.role) {
            acc.push(entry);
          } else {
            acc[acc.length - 1] = entry;
          }
          return acc;
        }, []);

        const chat = genAI.chats.create({
          model: 'gemini-2.0-flash',
          config: {
            systemInstruction: fastSystemPrompt,
            temperature: 0.7
          },
          history: sdkHistory
        });

        const sdkResult = await chat.sendMessage({ message: userMessage });
        const rawText = sdkResult?.text?.trim();

        if (rawText) {
          return buildValidatedReturn(rawText, 'inspired', null, true);
        }
      } catch (err) {
        console.warn('Layer 1 (Gemini API) unavailable, switching to Layer 2 (Zero-Key Free AI):', err);
      }
    }

    // ── LAYER 2: Zero-Key Free AI Engine (Pollinations OpenAI-Compatible Endpoint) ──
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const openAIMessages = [
        { role: 'system', content: fastSystemPrompt },
        ...conversationHistory.slice(-6).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text || ''
        })),
        { role: 'user', content: userMessage }
      ];

      const requestPayload = JSON.stringify({
        model: 'openai-fast',
        reasoning_effort: 'low',
        messages: openAIMessages
      });

      let freeRes = await fetch('/api/free-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: requestPayload
      }).catch(() => null);

      if (!freeRes || !freeRes.ok) {
        freeRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: requestPayload
        });
      }

      clearTimeout(timeoutId);

      if (freeRes.ok) {
        const data = await freeRes.json();
        const contentStr = data?.choices?.[0]?.message?.content?.trim();
        if (contentStr) {
          return buildValidatedReturn(contentStr, 'inspired', null, true);
        }
      }
    } catch (freeErr) {
      console.warn('Layer 2 (Zero-Key Free AI) offline or timed out, using Layer 3 (Smart Local Engine):', freeErr);
    }
  }

  // ── LAYER 3: Smart Offline Local Engine (100% Offline Fallback, Strictly Synced) ──
  await new Promise((r) => setTimeout(r, 300));

  let baseReply;
  let baseMood = 'inspired';
  let basePrompts;

  const topicData = getSmartTopicReply(userMessage, updatedProfile, updatedDossier);

  if (isPresetPillClick && stageIndex < FALLBACK_STAGES.length) {
    const stageObj = FALLBACK_STAGES[stageIndex];
    baseReply = stageObj.buildReply(userMessage, newlyAdded, updatedProfile, updatedDossier);
    baseMood = stageObj.mood;
    basePrompts = stageObj.quickPrompts;
  } else if (topicData) {
    baseReply = topicData.reply;
    baseMood = topicData.mood;
    basePrompts = topicData.quickPrompts;
  } else if (!isPresetPillClick) {
    const ongoing = buildOngoingCounselorReply(userMessage, updatedProfile, updatedDossier);
    baseReply = ongoing.reply;
    baseMood = ongoing.mood;
    basePrompts = ongoing.quickPrompts;
  } else if (stageIndex < FALLBACK_STAGES.length) {
    const stageObj = FALLBACK_STAGES[stageIndex];
    baseReply = stageObj.buildReply(userMessage, newlyAdded, updatedProfile, updatedDossier);
    baseMood = stageObj.mood;
    basePrompts = stageObj.quickPrompts;
  } else {
    const ongoing = buildOngoingCounselorReply(userMessage, updatedProfile, updatedDossier);
    baseReply = ongoing.reply;
    baseMood = ongoing.mood;
    basePrompts = ongoing.quickPrompts;
  }

  // Enrich with globalEconomy.js math whenever a city was explicitly mentioned in this turn
  const cityInThisMessage = extractCityFromText(userMessage);
  if (cityInThisMessage) {
    const stats = getCityData(cityInThisMessage);
    const monthlyTakeHome = Math.round((stats.entryTechSalary * 0.7) / 12);
    const disposable = monthlyTakeHome - stats.monthlyRent - stats.monthlyGroceries;
    baseReply = `📍 **${cityInThisMessage} Reality Check (${stats.vibe})**: Entry Tech Take-Home ~${monthlyTakeHome} ${stats.currency}/mo minus Rent (${stats.monthlyRent} ${stats.currency}) & Groceries (${stats.monthlyGroceries} ${stats.currency}) = **${disposable} ${stats.currency}/mo disposable**.\n\n${baseReply}`;
  }

  if (isDistressed) {
    if (!/^take your time/i.test(baseReply.trim())) {
      baseReply = `Take your time, I know thinking about the future is overwhelming. ${baseReply}`;
    }
    baseMood = 'empathetic';
  }

  baseReply = sanitizeNoEmDashes(baseReply);
  const sanitizedBasePrompts = (basePrompts || []).map((p) => sanitizeNoEmDashes(p));

  const validatedContract = GhostResponseSchema.parse({
    ghost_dialogue: baseReply,
    slang_used: true,
    ego_damage_score: 10,
    next_game_phase:
      stageIndex >= 8 || updatedProfile.arcade?.completed
        ? 'game_over'
        : stageIndex >= 2
        ? 'assessment'
        : 'sorting',
    suggested_action: sanitizedBasePrompts[0] || null
  });

  return {
    reply: validatedContract.ghost_dialogue,
    mood: baseMood,
    updatedProfile,
    updatedDossier,
    updatedTraits: mergedTraits,
    newlyAdded,
    quickPrompts: sanitizedBasePrompts,
    shouldUnlockDossier: stageIndex >= 8 || Boolean(updatedProfile.arcade?.completed),
    isSafetyIntervention: false,
    usedGemini: false,
    softenVoice: isDistressed,
    ...validatedContract
  };
}
