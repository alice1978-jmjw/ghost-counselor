// Unified Soul Dossier & Profile Synchronization Engine (Kiroween 2026)
// Single source of truth connecting Career Counselor Chat, Crisis Simulator 3D, and Soul Dossier.

import { getCityData } from '../data/globalEconomy.js';

export function createInitialSoulProfile() {
  return {
    passions: [],
    strengths: [],
    weaknesses: [],
    constraints: {
      financial: null,
      needMoneyNow: false,
      location: null,
      localOnly: false,
      city: null,
      family: null,
      highFamilyDuties: false
    },
    energyProfile: {
      drains: [],
      avoidDesk: false,
      avoidHeavySocial: false,
      lockedInZone: null,
      lockedInLabel: null,
      teamMode: null,
      teamModeLabel: null
    },
    discussedTopics: [],
    chatHighlights: [],
    chatTurnCount: 0,
    arcade: {
      choices: [],
      scores: {
        Maker: 0,
        Architect: 0,
        Catalyst: 0,
        Visionary: 0
      },
      completed: false,
      completedAt: null,
      debriefedRunId: null,
      result: null,
      selectedPathway: null
    }
  };
}

function dedupe(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

/**
 * Returns true ONLY if the user has actual discovered data from
 * Career Counselor Chat or Crisis Simulator 3D gameplay.
 */
export function hasSoulActivity(profile) {
  if (!profile) return false;
  const hasTraits =
    (profile.passions?.length || 0) > 0 ||
    (profile.strengths?.length || 0) > 0 ||
    (profile.weaknesses?.length || 0) > 0;
  const hasConstraints = Boolean(
    profile.constraints?.financial ||
      profile.constraints?.location ||
      profile.constraints?.city ||
      profile.constraints?.family
  );
  const hasEnergy = Boolean(
    (profile.energyProfile?.drains?.length || 0) > 0 ||
      profile.energyProfile?.lockedInZone ||
      profile.energyProfile?.teamMode
  );
  const hasTopics = (profile.discussedTopics?.length || 0) > 0;
  const hasArcade =
    Boolean(profile.arcade?.completed) || (profile.arcade?.choices?.length || 0) > 0;

  return hasTraits || hasConstraints || hasEnergy || hasTopics || hasArcade;
}

const KNOWN_CITIES = ['San Francisco', 'London', 'Tokyo', 'New York', 'Digital Nomad'];

export function extractCityFromText(text) {
  if (!text) return null;
  for (const city of KNOWN_CITIES) {
    if (new RegExp(city, 'i').test(text)) return city;
  }
  if (/\bSF\b|Bay Area|Silicon Valley/i.test(text)) return 'San Francisco';
  if (/\bNYC\b|Manhattan|Brooklyn/i.test(text)) return 'New York';
  if (/nomad|remote.*(world|anywhere|travel)|travel.*work/i.test(text)) return 'Digital Nomad';
  return null;
}

const TRAIT_PATTERNS = {
  passions: [
    { regex: /\b(art|draw|drawing|paint|design|illustrat|fashion|aesthetic|visual|animation|graphic|ui\/?ux|figma)\b/i, label: 'Visual Arts & Aesthetic Design' },
    { regex: /\b(music|song|audio|instrument|sing|band|sound|film|video|cinema|edit|editing|tiktok|youtube|stream|content)\b/i, label: 'Storytelling & Digital Media' },
    { regex: /\b(write|writing|story|stories|journal|book|poet|literature|copywrit)\b/i, label: 'Creative Writing & Narrative' },
    { regex: /\b(code|coding|program|software|game|gaming|tech|computer|ai|web|app|cyber|cloud)\b/i, label: 'Technology & Interactive Systems' },
    { regex: /\b(robot|hardware|drone|circuit|electron|3d print|cad|engineer|mechanic)\b/i, label: 'Hardware, Robotics & Engineering' },
    { regex: /\b(cook|cooking|bak(e|ing)|chef|culinary|food|kitchen|recipe|restaurant)\b/i, label: 'Culinary Arts & Food Craft' },
    { regex: /\b(trade|electrician|hvac|weld|plumb|carpent|construct|build|fix|hands[- ]?on|craft|tinker|diy)\b/i, label: 'Hands-On Fabrication & Building' },
    { regex: /\b(math|data|puzzle|logic|physics|analytics|finance|numbers|spreadsheet|pattern|logistics|supply chain)\b/i, label: 'Logic, Data & Systems Architecture' },
    { regex: /\b(help|people|psych|mental health|counsel|listen|empathy|care|support|advice|therap|social work)\b/i, label: 'Human Connection & Emotional Support' },
    { regex: /\b(nurse|doctor|med|hospital|healthcare|radiolog|ultrasound|sonograph|dental|paramedic|emt|patient)\b/i, label: 'Healthcare & Frontline Patient Care' },
    { regex: /\b(teach|mentor|kids|education|community|advoca|youth)\b/i, label: 'Mentorship & Community Impact' },
    { regex: /\b(lead|business|entrepreneur|startup|market|sell|sales|organize|event|manage|hospitality|ecommerce)\b/i, label: 'Entrepreneurship, Events & Leadership' },
    { regex: /\b(animal|vet|veterinar|wildlife|pet|zoolog|marine)\b/i, label: 'Animal Care & Wildlife Biology' },
    { regex: /\b(nature|environment|climate|biology|science|lab|space|outdoors|sustainab)\b/i, label: 'Natural Sciences & Sustainability' },
    { regex: /\b(law|legal|paralegal|forensic|detective|criminolog|justice|investig)\b/i, label: 'Law, Forensics & Investigation' }
  ],
  strengths: [
    { regex: /\b(listen|empathetic|kind|support|understand|patient|caring|mediator|advice|therapist friend)\b/i, label: 'Deep Empathy & Peer Counseling' },
    { regex: /\b(creative|imagin|original|idea|brainstorm|invent|artistic|vision)\b/i, label: 'Main Character Creative Vision' },
    { regex: /\b(video edit|editing|tiktok|social media|graphic design|content creation|reels)\b/i, label: 'Digital Media & Content Creation' },
    { regex: /\b(solve|problem|logical|analy|detail|research|curious|fast learner|decode|troubleshoot)\b/i, label: 'Locked-In Analytical Problem Solving' },
    { regex: /\b(pattern|patterns|connections|systems)\b/i, label: 'Strategic Pattern Recognition' },
    { regex: /\b(explain|clear|clearly|teach|communicat|pitch|present|speak|rizz|charisma)\b/i, label: 'Clear Communication & Persuasion' },
    { regex: /\b(lead|organiz|plan|coordinat|event|manage|team|motivat|decisive)\b/i, label: 'Project Coordination & Leadership' },
    { regex: /\b(keep.*cool|cool under pressure|calm|resilien|adapt|independent|self-taught|persist|dependable)\b/i, label: 'Calm Composure Under Pressure' },
    { regex: /\b(build|make|hands[- ]?on|craft|fix|tinker|prototype|repair|athletic|physical)\b/i, label: 'Hands-On Execution & Technical Repair' },
    { regex: /\b(family business|hustle|run.*store|weekend.*business)\b/i, label: 'Real-World Business Operations' }
  ],
  weaknesses: [
    { regex: /\b(overwhelm|burnout|stress|anxious|anxiety|overthink|worry|worried|fear|scared|terrified|cooked)\b/i, label: 'Future Pressure & Overthinking (Reframed: High care factor that thrives with clear 90-day steps)' },
    { regex: /\b(procrastinat|distract|bored|routine|monoton|adhd|variety and breaks)\b/i, label: 'Allergic to Monotonous Routines (Reframed: Built for dynamic sprints & variety)' },
    { regex: /\b(shy|introvert|public speaking|crowd|social battery|stage fright|quiet|social interaction is exhausting|heavy social)\b/i, label: 'Low Social Battery in Crowds (Reframed: Deep-focus specialist who shines 1-on-1 or in small studios)' },
    { regex: /\b(desk work drains|glued to a screen|hate sitting|sit at a desk|move around)\b/i, label: 'Desk-Work Drain (Reframed: Energized by active, hands-on movement)' },
    { regex: /\b(hate math|bad at math|no math|suck at math|heavy math|calculus|spreadsheet)\b/i, label: 'Heavy Math Drain (Reframed: Visual, human, or hands-on thinker paired with modern tools)' },
    { regex: /\b(perfectionis|imposter|doubt|not good enough|average at everything|fail|comparing|behind|lost|unsure)\b/i, label: 'Self-Doubt & Comparison Trap (Reframed: High standards that thrive on low-pressure prototypes)' },
    { regex: /\b(conflict|saying no|people pleas|boundaries|parents.*pressur|family.*expect)\b/i, label: 'External Expectations & Boundaries (Reframed: Needs clear data-backed plans to protect peace)' },
    { regex: /\b(not really a tech person|hate coding|no coding)\b/i, label: 'Non-Tech Preference (Reframed: Excels in IRL human, creative, or physical roles)' }
  ]
};

const TOPIC_DETECTORS = [
  { key: 'animals', regex: /\b(animal|vet|veterinar|wildlife|pet|zoolog|marine bio)\b/i },
  { key: 'design', regex: /\b(art|draw|illustrat|paint|animation|graphic design|fashion|ui\/?ux|ux|figma|visual|aesthetic|concept art)\b/i },
  { key: 'media', regex: /\b(video edit|film|media|content|youtube|tiktok|motion|brand story|marketing|social media|creative director)\b/i },
  { key: 'software', regex: /\b(code|coding|program|software|game dev|cyber|web dev|app|computer science|ai tools|developer)\b/i },
  { key: 'data', regex: /\b(data|analytics|math|numbers|finance|budget|patterns|metrics|systems master)\b/i },
  { key: 'logistics', regex: /\b(logistics|supply chain|operations|routing|inventory|scheduling|project coordinator)\b/i },
  { key: 'healthcare', regex: /\b(doctor|nurse|medical|hospital|medicine|healthcare|nursing|paramedic|emt|radiolog|ultrasound|sonograph|dental|patient)\b/i },
  { key: 'counseling', regex: /\b(psych|therapist|counsel|mental health|social work|help people|advice|peer support|youth)\b/i },
  { key: 'hospitality', regex: /\b(hospitality|event|events|organizer|hotel|concert|tournament|crowd|frontline leader)\b/i },
  { key: 'trades', regex: /\b(trade|trades|plumber|electrician|hvac|welding|mechanic|construction|hands[- ]?on|fabricat|tactical builder)\b/i },
  { key: 'hardware', regex: /\b(hardware|robot|robotics|drone|circuit|electronics|iot|cad|engineering|prototype|fix.*phone)\b/i },
  { key: 'culinary', regex: /\b(cook|cooking|baking|chef|culinary|food truck|kitchen|restaurant|pastry)\b/i },
  { key: 'business', regex: /\b(business|sales|remote|travel|digital nomad|management|startup|entrepreneur|ecommerce|commission)\b/i },
  { key: 'law', regex: /\b(law|lawyer|criminolog|fbi|detective|forensic|justice|legal|paralegal)\b/i },
  { key: 'environment', regex: /\b(nature|environment|climate|biology|science|sustainab|green tech|conservation)\b/i },
  { key: 'low_math', regex: /\b(hate math|bad at math|no math|suck at math|without heavy math)\b/i },
  { key: 'fast_earning', regex: /\b(need money|asap|secure the bag|pay well|high[- ]?paying|salary|debt|no college|without college|apprenticeship|2-year|certificate|portfolio)\b/i },
  { key: 'active_physical', regex: /\b(move around|athletic|physical|hands[- ]?on|desk work drains|on my feet)\b/i },
  { key: 'non_tech', regex: /\b(not really a tech person|non-tech|no coding)\b/i }
];

/**
 * Extracts structured traits, Phase 1 constraints, Phase 2 energy preferences,
 * and discussed career topics from a user chat message and returns an updated soulProfile.
 */
export function extractProfileUpdatesFromMessage(userText, stageIndex = 0, currentProfile = createInitialSoulProfile()) {
  const base = currentProfile || createInitialSoulProfile();
  const clean = (userText || '').trim();
  const newlyAdded = { passions: [], strengths: [], weaknesses: [] };

  if (!clean) {
    return { updatedProfile: base, newlyAdded };
  }

  const isMetaOnly = /^(hi|hey|hello|yo|sup|test|ok|okay|thanks|thank you|open my soul dossier.*|what is in my soul dossier\??|show my soul dossier)$/i.test(clean);
  const isObservedVibe = /\[Observed/i.test(clean);

  const foundPassions = [];
  const foundStrengths = [];
  const foundWeaknesses = [];
  const foundTopics = [];

  if (!isMetaOnly) {
    TRAIT_PATTERNS.passions.forEach((item) => {
      if (item.regex.test(clean)) foundPassions.push(item.label);
    });
    TRAIT_PATTERNS.strengths.forEach((item) => {
      if (item.regex.test(clean)) foundStrengths.push(item.label);
    });
    TRAIT_PATTERNS.weaknesses.forEach((item) => {
      if (item.regex.test(clean)) foundWeaknesses.push(item.label);
    });
    TOPIC_DETECTORS.forEach((item) => {
      if (item.regex.test(clean)) foundTopics.push(item.key);
    });
  }

  // Clone constraints & energyProfile
  const constraints = { ...base.constraints };
  const energyProfile = {
    ...base.energyProfile,
    drains: [...(base.energyProfile?.drains || [])]
  };

  if (!isMetaOnly && !isObservedVibe) {
    // City detection
    const detectedCity = extractCityFromText(clean);
    if (detectedCity) {
      constraints.city = detectedCity;
    }

    // Phase 1A: Financial bandwidth
    if (/\b(need money|asap|cover bills|help family|broke|no money|can't afford|cant afford|pay bills|earn immediately|low funds)\b/i.test(clean)) {
      constraints.financial = 'Immediate earning priority (supporting family / covering bills)';
      constraints.needMoneyNow = true;
      foundWeaknesses.push('Immediate Financial Pressure (Priority: debt-free, fast-earning pathways)');
      foundTopics.push('fast_earning');
    } else if (/\b(part-time.*community college|community college|work part-time)\b/i.test(clean)) {
      constraints.financial = 'Part-time work + local community college budget';
      constraints.needMoneyNow = true;
      constraints.localOnly = true;
      foundTopics.push('fast_earning');
    } else if (/\b(tuition.*covered|living expenses.*tight|tight budget)\b/i.test(clean)) {
      constraints.financial = 'Tuition mostly covered; living expenses tight';
      constraints.needMoneyNow = false;
      foundWeaknesses.push('Tight Living Budget (Priority: paid internships or flexible part-time income)');
    } else if (/\b(family can support|tuition.*paid|parents.*pay.*college|support me through college)\b/i.test(clean)) {
      constraints.financial = 'Family can support college or training tuition';
      constraints.needMoneyNow = false;
    }

    // Phase 1B: Geographic mobility
    if (/\b(locked to my current|can't relocate|cant relocate|stay local|current zip|stay home|can't move|cant move)\b/i.test(clean)) {
      constraints.location = 'Local area only (cannot relocate right now)';
      constraints.localOnly = true;
    } else if (/\b(nearby city|not out of state|in-state|in state)\b/i.test(clean)) {
      constraints.location = 'Regional mobility (nearby city / in-state)';
      constraints.localOnly = false;
    } else if (/\b(relocate anywhere|move anywhere|any city|soft-launch in a new|new city|new state|moving to)\b/i.test(clean)) {
      constraints.location = detectedCity ? `Open to relocating (${detectedCity})` : 'Open to relocating anywhere';
      constraints.localOnly = false;
    } else if (/depends on the program|not sure.*relocat/i.test(clean)) {
      constraints.location = 'Flexible location depending on program ROI';
    }

    // Phase 1C: Family / Co-op obligations
    if (/\b(heavy family obligations|flexible schedule|watch.*sibling|caregiv|take care of.*family)\b/i.test(clean)) {
      constraints.family = 'Heavy family obligations (flexible schedule needed)';
      constraints.highFamilyDuties = true;
      foundWeaknesses.push('Caregiving & Family Obligations (Needs flexible or local scheduling)');
    } else if (/\b(family business|family hustle)\b/i.test(clean)) {
      constraints.family = 'Helps run family business on weekends';
      constraints.highFamilyDuties = true;
      foundStrengths.push('Real-World Business Operations');
      foundTopics.push('business');
    } else if (/\b(some responsibilities.*own time|mostly have my own time)\b/i.test(clean)) {
      constraints.family = 'Light family responsibilities; mostly own schedule';
      constraints.highFamilyDuties = false;
    } else if (/\b(completely my own|time is my own|no family obligations)\b/i.test(clean)) {
      constraints.family = 'Full schedule independence';
      constraints.highFamilyDuties = false;
    }

    // Phase 2A: Battery Drain
    if (/\b(desk work drains|glued to a screen|need to move around|hate sitting|hate desk)\b/i.test(clean)) {
      energyProfile.drains = dedupe([...energyProfile.drains, 'Long hours glued to a desk']);
      energyProfile.avoidDesk = true;
      foundTopics.push('active_physical');
    }
    if (/\b(heavy social interaction is exhausting|talking to random people|customers.*exhaust|social.*exhaust|drain.*people)\b/i.test(clean)) {
      energyProfile.drains = dedupe([...energyProfile.drains, 'Nonstop social interaction with crowds']);
      energyProfile.avoidHeavySocial = true;
    }
    if (/\b(both sound awful|need variety and breaks)\b/i.test(clean)) {
      energyProfile.drains = dedupe([...energyProfile.drains, 'Repetitive work without variety or breaks']);
    }
    if (/\b(vibing with either|depends on the work)\b/i.test(clean)) {
      energyProfile.drains = dedupe([...energyProfile.drains, 'Low-meaning work (adaptable environment)']);
      foundStrengths.push('High Environmental Adaptability');
    }

    // Phase 2B: Locked-In Zone
    if (/\b(digital or abstract|abstract puzzles|coding, design, writing)\b/i.test(clean)) {
      energyProfile.lockedInZone = 'digital';
      energyProfile.lockedInLabel = 'Digital & abstract problem-solving';
    } else if (/\b(hands-on physical|cooking, building, fixing|irl with.*hands)\b/i.test(clean)) {
      energyProfile.lockedInZone = 'hands_on';
      energyProfile.lockedInLabel = 'Hands-on physical building & craft';
    } else if (/\b(creative work: art|art, music, video editing)\b/i.test(clean)) {
      energyProfile.lockedInZone = 'creative';
      energyProfile.lockedInLabel = 'Creative art, media & design';
    } else if (/\b(people work: helping|helping, organizing, teaching)\b/i.test(clean)) {
      energyProfile.lockedInZone = 'people';
      energyProfile.lockedInLabel = 'Helping, organizing & mentoring people';
    }

    // Phase 2C: Solo vs Co-op Mode
    if (/\b(solo mode|solo architect|focus without constant meetings|work alone)\b/i.test(clean)) {
      energyProfile.teamMode = 'solo';
      energyProfile.teamModeLabel = 'Solo deep-focus architect';
      foundWeaknesses.push('Meeting Fatigue (Thrives with protected solo deep-work blocks)');
    } else if (/\b(small trusted squad|2-4 people|small team)\b/i.test(clean)) {
      energyProfile.teamMode = 'small_squad';
      energyProfile.teamModeLabel = 'Small trusted squad (2-4 people)';
    } else if (/\b(large team leadership|manage and coordinate|front-facing main character)\b/i.test(clean)) {
      energyProfile.teamMode = 'leadership';
      energyProfile.teamModeLabel = 'Frontline leadership & team coordination';
      foundStrengths.push('Project Coordination & Leadership');
    } else if (/\b(mix of both|independent work \+ some collaboration)\b/i.test(clean)) {
      energyProfile.teamMode = 'hybrid';
      energyProfile.teamModeLabel = 'Balanced independent + collaborative hybrid';
    }

    // Phase 3C: Hidden Buff self-doubt catch
    if (/\b(pretty average at everything|not sure.*talent)\b/i.test(clean)) {
      foundStrengths.push('Versatile Generalist Adaptability');
    }
  }

  const nextPassions = dedupe([...base.passions, ...foundPassions]);
  const nextStrengths = dedupe([...base.strengths, ...foundStrengths]);
  const nextWeaknesses = dedupe([...base.weaknesses, ...foundWeaknesses]);
  const nextTopics = dedupe([...(base.discussedTopics || []), ...foundTopics]);

  newlyAdded.passions = nextPassions.filter((p) => !base.passions.includes(p));
  newlyAdded.strengths = nextStrengths.filter((s) => !base.strengths.includes(s));
  newlyAdded.weaknesses = nextWeaknesses.filter((w) => !base.weaknesses.includes(w));

  const shouldLogHighlight = !isMetaOnly && !isObservedVibe && clean.length > 3;
  const nextHighlights = shouldLogHighlight
    ? [
        ...(base.chatHighlights || []).slice(-11),
        {
          text: clean.slice(0, 140),
          stageIndex,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    : base.chatHighlights || [];

  const updatedProfile = {
    ...base,
    passions: nextPassions,
    strengths: nextStrengths,
    weaknesses: nextWeaknesses,
    constraints,
    energyProfile,
    discussedTopics: nextTopics,
    chatHighlights: nextHighlights,
    chatTurnCount: (base.chatTurnCount || 0) + (isMetaOnly ? 0 : 1)
  };

  return { updatedProfile, newlyAdded };
}

// Map an individual Crisis Simulator 3D portal choice to a non-spoiling instinct strength
function getNonSpoilingInstinctLabel(trait) {
  switch (trait) {
    case 'Maker':
      return 'Hands-On Crisis Action & Prototyping';
    case 'Architect':
      return 'Structured Planning & Analytical Troubleshooting';
    case 'Catalyst':
      return 'Calm Team Alignment & People Support';
    case 'Visionary':
      return 'Creative Visual Storytelling & Presentation';
    default:
      return null;
  }
}

/**
 * Updates the unified Soul Profile on EVERY Crisis Simulator 3D portal choice
 * so gameplay stays continuously synced with the Soul Dossier without leaking
 * the 4 hidden dimension labels prior to 10/10 completion.
 */
export function applyArcadeChoiceToProfile(currentProfile, payload) {
  const base = currentProfile || createInitialSoulProfile();
  if (!payload) return base;

  const {
    scenarioId,
    scenario,
    choiceText,
    trait,
    position,
    scores,
    isNewRun = false
  } = payload;

  const scenarioTitle = (scenario || '').split(':')[0]?.trim() || `Scenario ${scenarioId}`;
  const prevChoices = isNewRun ? [] : (base.arcade?.choices || []);
  const filteredPrev = prevChoices.filter((c) => c.scenarioId !== scenarioId);
  const nextChoices = [
    ...filteredPrev,
    {
      scenarioId,
      scenarioTitle,
      scenario,
      choiceText,
      trait,
      position
    }
  ].sort((a, b) => a.scenarioId - b.scenarioId);

  const nextScores = scores
    ? {
        Maker: scores.Maker || 0,
        Architect: scores.Architect || 0,
        Catalyst: scores.Catalyst || 0,
        Visionary: scores.Visionary || 0
      }
    : {
        Maker: nextChoices.filter((c) => c.trait === 'Maker').length,
        Architect: nextChoices.filter((c) => c.trait === 'Architect').length,
        Catalyst: nextChoices.filter((c) => c.trait === 'Catalyst').length,
        Visionary: nextChoices.filter((c) => c.trait === 'Visionary').length
      };

  // Add non-spoiling instinct strength once the user demonstrates a repeated pattern (>=2) or first choice
  const instinctLabel = getNonSpoilingInstinctLabel(trait);
  const nextStrengths =
    instinctLabel && (nextScores[trait] >= 2 || nextChoices.length === 1)
      ? dedupe([...base.strengths, instinctLabel])
      : base.strengths;

  return {
    ...base,
    strengths: nextStrengths,
    arcade: {
      ...(isNewRun
        ? {
            completed: false,
            completedAt: null,
            debriefedRunId: null,
            result: null,
            selectedPathway: null
          }
        : base.arcade),
      choices: nextChoices,
      scores: nextScores
    }
  };
}

/**
 * Locks in completed 10/10 Crisis Simulator 3D results into the unified Soul Profile.
 */
export function applyArcadeCompletionToProfile(currentProfile, finalResult, choices = null) {
  const base = currentProfile || createInitialSoulProfile();
  if (!finalResult) return base;

  const dominant = finalResult.dominantTrait;
  const archetypeBoundaryMap = {
    Maker: 'Pure Theory Burnout (Reframed: Thrives with tangible hands-on builds instead of endless slides)',
    Architect: 'Unstructured Chaos Drain (Reframed: Needs clear goals, logical systems, and focused problem-solving)',
    Catalyst: 'Isolated Solo Grind Drain (Reframed: Energized by real human impact and energized team momentum)',
    Visionary: 'Rigid Cookie-Cutter Work Drain (Reframed: Needs creative agency to design and elevate ideas)'
  };

  const completionBoundary = archetypeBoundaryMap[dominant];

  return {
    ...base,
    passions: dedupe([...base.passions, ...(finalResult.suggestedPassions || [])]),
    strengths: dedupe([...base.strengths, ...(finalResult.suggestedStrengths || [])]),
    weaknesses: completionBoundary
      ? dedupe([...base.weaknesses, completionBoundary])
      : base.weaknesses,
    arcade: {
      ...base.arcade,
      choices: choices || base.arcade?.choices || [],
      scores: finalResult.scores || base.arcade?.scores,
      completed: true,
      completedAt: Date.now(),
      result: finalResult,
      selectedPathway: base.arcade?.selectedPathway || null
    }
  };
}

/**
 * Updates the selected Recommended Pathway card from Crisis Simulator 3D
 * directly inside the Soul Profile so Soul Dossier & Chat immediately align.
 */
export function applyArcadePathwaySelection(currentProfile, pathway) {
  const base = currentProfile || createInitialSoulProfile();
  return {
    ...base,
    arcade: {
      ...base.arcade,
      selectedPathway: pathway || null
    }
  };
}

// ============================================================================
// COMPREHENSIVE TAROT CAREER ARCANA CATALOG
// Covers all 4 Crisis Simulator 3D dimensions, all 16 pathway cards, and all Chat domains
// ============================================================================
export const CAREER_ARCANA_CATALOG = [
  {
    id: 'skilled-trades-specialist',
    arcanaNumber: 'IV',
    arcanaTitle: 'The Ironwright',
    careerTitle: 'Commercial Electrician, HVAC & Smart Trades Tech',
    arcadeTrait: 'Maker',
    pathwayNames: ['Skilled Trades'],
    tags: ['maker', 'trades', 'hands_on', 'active_physical', 'fast_earning', 'non_tech'],
    matchBase: 76,
    salaryRange: '$65k - $115k+',
    growthOutlook: '+15% AI-Proof Demand',
    fastEarningFriendly: true,
    handsOn: true,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: true,
    whyItFits: 'Turns hands-on physical execution and calm crisis problem-solving into an AI-proof, high-earning trade without sitting at a desk.',
    shadowProtection: 'Protects against student debt and cubicle burnout through paid apprenticeships and tangible daily wins.',
    first90Days: [
      'Apply to 3 local union or commercial paid apprenticeship programs (IBEW, HVAC, or smart-building tech).',
      'Complete an OSHA-10 safety certificate online in one weekend to stand out immediately.',
      'Shadow a licensed local electrician or HVAC technician for a day to see real job-site workflows.',
      'Document 2 hands-on repair or DIY electrical/mechanical builds in a photo portfolio.'
    ],
    budgetFriendlyFirst90Days: [
      'Apply directly to local paid apprenticeships where you earn hourly wages from Week 1 with $0 tuition debt.',
      'Earn your low-cost OSHA-10 safety cert online this month to jump ahead of other entry applicants.',
      'Visit your local community college trade center for state-funded apprenticeship grants.',
      'Start as a paid helper/installer locally while logging certified apprentice hours.'
    ]
  },
  {
    id: 'hardware-robotics-builder',
    arcanaNumber: 'VIII',
    arcanaTitle: 'The Forge Tinkerer',
    careerTitle: 'Robotics, Hardware Prototyping & Mechatronics Tech',
    arcadeTrait: 'Maker',
    secondaryTrait: 'Architect',
    pathwayNames: ['Hardware Tech', 'Engineering'],
    tags: ['maker', 'hardware', 'engineering', 'tech', 'hands_on', 'fast_earning'],
    matchBase: 77,
    salaryRange: '$68k - $128k+',
    growthOutlook: '+18% Hardware & Robotics',
    fastEarningFriendly: true,
    handsOn: true,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: false,
    whyItFits: 'Blends rapid physical prototyping and tinkering with real electronics, drones, and mechanical engineering systems.',
    shadowProtection: 'Keeps your hands building real prototypes instead of getting trapped in dry theory or endless meetings.',
    first90Days: [
      'Build and document 1 working hardware prototype using Arduino, Raspberry Pi, or drone repair kits.',
      'Learn free CAD modeling (Fusion 360 or Onshape) and export a custom 3D-printable part.',
      'Explore 2-year Mechatronics / Electronics Tech programs or Engineering Technology pathways.',
      'Join a local makerspace, robotics club, or hardware repair shop to gain hands-on shop hours.'
    ],
    budgetFriendlyFirst90Days: [
      'Start an affordable local 2-year Mechatronics or Industrial Maintenance Tech certificate with high job placement.',
      'Apply for entry-level electronics repair, field service tech, or hardware assembly roles to earn immediately.',
      'Build a free portfolio of 3 documented gadget repairs or microcontroller builds.',
      'Check local employer tuition-reimbursement programs in manufacturing or robotics.'
    ]
  },
  {
    id: 'culinary-food-artisan',
    arcanaNumber: 'VI',
    arcanaTitle: 'The Hearth Alchemist',
    careerTitle: 'Culinary Arts, Food Innovation & Kitchen Operations',
    arcadeTrait: 'Maker',
    secondaryTrait: 'Visionary',
    pathwayNames: ['Culinary Arts'],
    tags: ['maker', 'culinary', 'hands_on', 'creative', 'active_physical', 'fast_earning', 'low_math', 'non_tech'],
    matchBase: 75,
    salaryRange: '$52k - $98k+',
    growthOutlook: '+13% Craft Food & Hospitality',
    fastEarningFriendly: true,
    handsOn: true,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: true,
    whyItFits: 'Channels high-pace physical instinct, creativity, and tactile execution into crafting real food experiences under pressure.',
    shadowProtection: 'Eliminates boring desk routines and lets you see immediate, tangible results from your craft every shift.',
    first90Days: [
      'Earn your local Food Handler / ServSafe certification online in a single weekend.',
      'Stage or work part-time in a fast-paced bakery, specialty cafe, or scratch kitchen to master knife and prep flow.',
      'Document 5 original recipes or plated creations in a clean visual culinary portfolio.',
      'Compare paid kitchen apprenticeships vs. local community college culinary certificates.'
    ],
    budgetFriendlyFirst90Days: [
      'Skip expensive private culinary debt: get your Food Handler cert and land a paid prep/line role immediately.',
      'Learn costing, menu design, and high-volume kitchen systems on the job while saving money.',
      'Look for local community college culinary certificates with scholarship aid if you want formal pastry/management credentials.',
      'Test a weekend pop-up or cottage-food micro-batch to practice food entrepreneurship.'
    ]
  },
  {
    id: 'ai-interactive-engineer',
    arcanaNumber: 'VII',
    arcanaTitle: 'The Code Alchemist',
    careerTitle: 'Software, Game & AI Systems Developer',
    arcadeTrait: 'Architect',
    secondaryTrait: 'Maker',
    pathwayNames: ['Software Dev'],
    tags: ['architect', 'software', 'tech', 'digital', 'fast_earning'],
    matchBase: 78,
    salaryRange: '$85k - $155k+',
    growthOutlook: '+22% Rapid Expansion',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: true,
    socialHeavy: false,
    lowMathFriendly: false,
    whyItFits: 'Turns structured logical problem-solving and deep focus into building software, interactive apps, games, and AI workflows.',
    shadowProtection: 'Respects your social battery by rewarding deep solo focus and proof-of-work over nonstop small talk.',
    first90Days: [
      'Ship 1 working web app, automation tool, or indie game prototype on GitHub that solves a real problem.',
      'Build core fluency in JavaScript or Python plus modern AI APIs using free interactive curricula.',
      'Enter 1 weekend hackathon or open-source sprint to get real engineering feedback.',
      'Compare Computer Science transfers, Cloud/Cybersecurity certs, and portfolio-first junior dev tracks.'
    ],
    budgetFriendlyFirst90Days: [
      'Use 100% free resources (freeCodeCamp, The Odin Project, CS50) to build 3 deployed portfolio apps.',
      'Earn an affordable IT/Cloud cert (CompTIA A+/Security+ or AWS Cloud Practitioner) to land paid entry tech roles fast.',
      'Start at a local community college CS transfer track only if you want a degree without massive debt.',
      'Offer a small local business a clean web upgrade or automation script as paid proof-of-work.'
    ]
  },
  {
    id: 'data-systems-analyst',
    arcanaNumber: 'IX',
    arcanaTitle: 'The Pattern Weaver',
    careerTitle: 'Data Analyst & Financial Systems Strategist',
    arcadeTrait: 'Architect',
    pathwayNames: ['Data Analysis', 'Finance & Strategy'],
    tags: ['architect', 'data', 'finance', 'tech', 'digital', 'fast_earning'],
    matchBase: 76,
    salaryRange: '$74k - $132k+',
    growthOutlook: '+23% Booming Demand',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: true,
    socialHeavy: false,
    lowMathFriendly: false,
    whyItFits: 'Rewards pattern recognition, structured frameworks, and clear analytical thinking to decode complex metrics and guide decisions.',
    shadowProtection: 'Replaces chaotic guesswork with clear, objective data and structured independent problem-solving.',
    first90Days: [
      'Learn SQL and Excel/Google Sheets pivot tables + dashboards through free guided datasets.',
      'Analyze a real public dataset (gaming, sports, music, or city rent) and publish a 1-page visual insight report.',
      'Earn the Google Data Analytics Certificate or Microsoft Power BI foundational badge.',
      'Explore Business Analytics, Finance, or Data Science community-college-to-university tracks.'
    ],
    budgetFriendlyFirst90Days: [
      'Complete the low-cost Google Data Analytics or SQL/Excel certification on financial aid in 8-12 weeks.',
      'Publish 2 clean interactive dashboards (Tableau Public / Power BI) using public datasets as instant proof-of-work.',
      'Apply for paid entry-level Operations Analyst, Junior Bookkeeper, or Data Coordinator roles locally or remotely.',
      'Use employer education benefits later if you decide to add a formal Finance or Analytics degree.'
    ]
  },
  {
    id: 'logistics-ops-architect',
    arcanaNumber: 'X',
    arcanaTitle: 'The Grand Strategist',
    careerTitle: 'Logistics, Supply Chain & Operations Coordinator',
    arcadeTrait: 'Architect',
    secondaryTrait: 'Catalyst',
    pathwayNames: ['Logistics & Ops', 'Finance & Strategy'],
    tags: ['architect', 'logistics', 'business', 'leadership', 'fast_earning'],
    matchBase: 75,
    salaryRange: '$68k - $120k+',
    growthOutlook: '+18% Global Supply Demand',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: true,
    whyItFits: 'Turns your instinct for organizing chaos, routing systems, and tracking budgets into keeping high-stakes real-world operations moving.',
    shadowProtection: 'Balances structured planning with active real-world coordination so you are never trapped in pointless busywork.',
    first90Days: [
      'Master spreadsheet tracking, inventory workflows, and basic project management tools (Notion, Trello, Excel).',
      'Take a short Supply Chain or Project Management foundations certificate (CAPM / Google Project Management).',
      'Apply for paid entry-level Logistics Coordinator, Dispatch, or Operations Assistant roles.',
      'Document an event, club budget, or weekend market stall you organized as a real operations case study.'
    ],
    budgetFriendlyFirst90Days: [
      'Apply directly to local paid Operations, Warehouse Systems, or Supply Chain Coordinator roles that train on the job.',
      'Earn the Google Project Management Certificate online in under 90 days to qualify for higher starting pay.',
      'Check local community college Supply Chain / Operations certificates that fit around part-time work.',
      'Highlight any family-business scheduling, inventory, or event-planning experience right at the top of your resume.'
    ]
  },
  {
    id: 'forensics-paralegal-investigator',
    arcanaNumber: 'XI',
    arcanaTitle: 'The Truth Seeker',
    careerTitle: 'Digital Forensics Tech & Legal Operations Paralegal',
    arcadeTrait: 'Architect',
    pathwayNames: ['Data Analysis', 'Software Dev'],
    tags: ['architect', 'law', 'forensics', 'tech', 'low_math', 'fast_earning'],
    matchBase: 73,
    salaryRange: '$64k - $112k+',
    growthOutlook: '+16% Cyber & Legal Growth',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: true,
    whyItFits: 'Channels investigative curiosity, logic, and attention to detail into solving real cases and compliance puzzles without 7 years of law school.',
    shadowProtection: 'Gives you high-stakes intellectual purpose with clear rules and zero bar-exam debt trap.',
    first90Days: [
      'Explore an ABA-approved local community college Paralegal Certificate or intro Digital Forensics lab (TryHackMe).',
      'Practice summarizing case facts cleanly and organizing digital evidence timelines.',
      'Reach out to 2 local paralegals or cyber analysts for a 15-minute career chat.',
      'Apply for entry-level Legal Assistant, Court Clerk, or Compliance Coordinator openings.'
    ],
    budgetFriendlyFirst90Days: [
      'Target a fast 1-to-2-year local Paralegal Certificate or free TryHackMe Cyber Forensics path instead of expensive pre-law debt.',
      'Apply for paid entry-level Legal Assistant or Records Specialist roles locally while certifying.',
      'Build 2 sample investigative write-ups or compliance checklists to prove your sharp attention to detail.',
      'Look for law firms or public agencies that reimburse paralegal/cyber certification fees.'
    ]
  },
  {
    id: 'allied-healthcare-specialist',
    arcanaNumber: 'XII',
    arcanaTitle: 'The Lifeline Guardian',
    careerTitle: 'Allied Healthcare Tech (Radiology, Ultrasound & EMT)',
    arcadeTrait: 'Catalyst',
    secondaryTrait: 'Maker',
    pathwayNames: ['Healthcare'],
    tags: ['catalyst', 'healthcare', 'empathy', 'hands_on', 'science', 'active_physical', 'fast_earning', 'low_math'],
    matchBase: 77,
    salaryRange: '$70k - $112k+',
    growthOutlook: '+19% High-ROI Medical',
    fastEarningFriendly: true,
    handsOn: true,
    deskHeavy: false,
    socialHeavy: true,
    lowMathFriendly: true,
    whyItFits: 'Delivers meaningful frontline patient care and hands-on medical impact with one of the fastest salary-to-tuition ROIs available.',
    shadowProtection: 'Avoids 10 years of med-school debt and pure desk work while giving you structured shifts and real human impact.',
    first90Days: [
      'Compare local community college 2-year programs in Radiologic Tech, Diagnostic Sonography, or Respiratory Therapy.',
      'Earn your CPR/BLS certification this month and explore an EMT-Basic or Patient Care Tech fast-track.',
      'Shadow a local hospital imaging tech or clinic team for a half-day to feel the real pace.',
      'Check prerequisite classes (Anatomy & Physiology) you can knock out locally at low cost.'
    ],
    budgetFriendlyFirst90Days: [
      'Start a 6-to-12-week local EMT, Phlebotomy, or CNA credential to start earning healthcare pay immediately.',
      'Apply to hospitals that pay 100% of your local 2-year Radiology or Ultrasound tuition while you work part-time.',
      'Get CPR/BLS certified right away so you are job-ready for local clinics and health systems.',
      'Skip out-of-state pre-med debt and lock into high-demand local Allied Health associate degrees.'
    ]
  },
  {
    id: 'human-soul-guide',
    arcanaNumber: 'XIV',
    arcanaTitle: 'The Empathy Anchor',
    careerTitle: 'Counseling Psychologist & Youth Wellness Specialist',
    arcadeTrait: 'Catalyst',
    pathwayNames: ['Counseling'],
    tags: ['catalyst', 'counseling', 'empathy', 'people', 'low_math', 'non_tech'],
    matchBase: 77,
    salaryRange: '$64k - $118k+',
    growthOutlook: '+19% Essential Need',
    fastEarningFriendly: false,
    handsOn: false,
    deskHeavy: false,
    socialHeavy: true,
    lowMathFriendly: true,
    whyItFits: 'Honors your deep empathy, calm listening, and emotional intelligence by helping people navigate real life challenges.',
    shadowProtection: 'Focuses on meaningful 1-on-1 conversations and healthy boundaries instead of chaotic corporate sales floors.',
    first90Days: [
      'Volunteer with a peer-support network, youth mentorship program, or local community wellness center.',
      'Take an intro class in Psychology, Behavioral Health, or Human Development.',
      'Explore entry roles like Registered Behavior Technician (RBT) or Certified Peer Support Specialist.',
      'Interview a school counselor or licensed therapist about their favorite part of the job.'
    ],
    budgetFriendlyFirst90Days: [
      'Earn a fast Registered Behavior Technician (RBT) or Peer Support Specialist cert (often employer-paid) to earn while helping people right away.',
      'Take affordable local community college Psychology/Social Work credits that transfer cleanly later.',
      'Look into state Behavioral Health workforce scholarships and loan-repayment programs.',
      'Build real-world experience in local youth centers or clinics with flexible shift hours.'
    ]
  },
  {
    id: 'hospitality-events-lead',
    arcanaNumber: 'XIX',
    arcanaTitle: 'The Atmosphere Catalyst',
    careerTitle: 'Live Events Producer & Hospitality Experience Lead',
    arcadeTrait: 'Catalyst',
    secondaryTrait: 'Visionary',
    pathwayNames: ['Hospitality & Events'],
    tags: ['catalyst', 'hospitality', 'people', 'leadership', 'active_physical', 'fast_earning', 'low_math', 'non_tech'],
    matchBase: 75,
    salaryRange: '$58k - $108k+',
    growthOutlook: '+15% Live Experience Boom',
    fastEarningFriendly: true,
    handsOn: true,
    deskHeavy: false,
    socialHeavy: true,
    lowMathFriendly: true,
    whyItFits: 'Harnesses your crowd energy, quick de-escalation, and live coordination instincts to run unforgettable events and guest experiences.',
    shadowProtection: 'Keeps you moving in dynamic spaces with real people instead of staring at spreadsheets for 8 hours.',
    first90Days: [
      'Volunteer or work crew on 2 local concerts, esports tournaments, pop-up markets, or community festivals.',
      'Build a 1-page Event Portfolio showing timelines, vendor coordination, and guest-experience wins.',
      'Learn basic event production budgeting and run-of-show templates.',
      'Apply for paid Event Coordinator Assistant or Boutique Hospitality Lead roles.'
    ],
    budgetFriendlyFirst90Days: [
      'Land paid weekend event-crew, venue-operations, or hospitality-coordinator shifts immediately with zero degree needed.',
      'Offer to coordinate a local community tournament or pop-up market to build a real portfolio fast.',
      'Master run-of-show checklists and guest recovery skills to move quickly into salaried Event Producer roles.',
      'Look for hospitality groups offering flexible shifts and internal management fast-tracks.'
    ]
  },
  {
    id: 'sales-community-catalyst',
    arcanaNumber: 'XV',
    arcanaTitle: 'The Deal Weaver',
    careerTitle: 'Tech Sales (SDR/AE) & Community Growth Lead',
    arcadeTrait: 'Catalyst',
    secondaryTrait: 'Architect',
    pathwayNames: ['Sales & Community'],
    tags: ['catalyst', 'business', 'sales', 'leadership', 'people', 'fast_earning', 'low_math'],
    matchBase: 75,
    salaryRange: '$72k - $145k+',
    growthOutlook: '+17% High-Commission Growth',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: false,
    socialHeavy: true,
    lowMathFriendly: true,
    whyItFits: 'Turns natural charisma, clear communication, and relationship building into fast career acceleration and uncapped income potential.',
    shadowProtection: 'Rewards authentic problem-solving and communication rather than requiring heavy calculus or 6 years of school.',
    first90Days: [
      'Learn modern consultative selling and CRM basics (HubSpot Academy free certifications).',
      'Practice recording 60-second value pitches for products or brands you genuinely love.',
      'Build a tight LinkedIn profile and connect with 5 Sales Development Reps (SDRs) or Community Managers.',
      'Apply to entry-level SDR, Customer Success, or Brand Ambassador programs that hire on grit and communication.'
    ],
    budgetFriendlyFirst90Days: [
      'Complete free HubSpot Sales & Customer Success certifications in 2 weeks to stand out immediately.',
      'Apply directly to remote or local base-plus-commission SDR and Account Coordinator roles (no 4-year degree required).',
      'Highlight customer service, pitching, or family-business wins with clear numbers on your resume.',
      'Focus on ethical, high-retention tech or service companies with structured paid onboarding.'
    ]
  },
  {
    id: 'ux-product-architect',
    arcanaNumber: 'I',
    arcanaTitle: 'The Aesthetic Architect',
    careerTitle: 'UX / Product Designer & Creative Technologist',
    arcadeTrait: 'Visionary',
    secondaryTrait: 'Architect',
    pathwayNames: ['Digital & UI/UX', 'Visual & Concept Art'],
    tags: ['visionary', 'design', 'creative', 'tech', 'empathy', 'digital', 'low_math', 'fast_earning'],
    matchBase: 78,
    salaryRange: '$78k - $138k+',
    growthOutlook: '+16% High Demand',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: true,
    socialHeavy: false,
    lowMathFriendly: true,
    whyItFits: 'Combines aesthetic taste, visual systems thinking, and human empathy to design digital products people love using.',
    shadowProtection: 'Protects against burnout and perfectionism with rapid visual prototyping and modern portfolio-first hiring.',
    first90Days: [
      'Redesign 1 mobile app flow that annoys you in Figma (free) and document why it feels smoother.',
      'Publish a 2-minute walkthrough video explaining your design decisions.',
      'Team up with student coders in a weekend hackathon as the UI/UX designer.',
      'Explore Human-Computer Interaction (HCI), Digital Product Design, or Google UX Design Certificate tracks.'
    ],
    budgetFriendlyFirst90Days: [
      'Use Figma (100% free) + Google UX Design Certificate to build 3 sharp portfolio case studies in 90 days.',
      'Redesign a local small business website or menu app for a real paid freelance win.',
      'Share your Figma prototypes in design communities for free mentorship instead of pricey design-school debt.',
      'Apply for junior UI/UX, Web Design, or Digital Product internships where portfolios beat degrees.'
    ]
  },
  {
    id: 'narrative-media-director',
    arcanaNumber: 'III',
    arcanaTitle: 'The Story Director',
    careerTitle: 'Creative Director, Video Producer & Brand Marketer',
    arcadeTrait: 'Visionary',
    secondaryTrait: 'Catalyst',
    pathwayNames: ['Media & Content', 'Creative Marketing', 'Visual & Concept Art'],
    tags: ['visionary', 'media', 'creative', 'business', 'leadership', 'low_math', 'fast_earning'],
    matchBase: 77,
    salaryRange: '$65k - $128k+',
    growthOutlook: '+14% Evolving Media',
    fastEarningFriendly: true,
    handsOn: false,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: true,
    whyItFits: 'Channels storytelling instinct, visual identity, and creative direction into videos, campaigns, and memorable brand worlds.',
    shadowProtection: 'Keeps every project dynamic and creative so you never get trapped in a repetitive 9-to-5 loop.',
    first90Days: [
      'Produce a tight 3-to-5-piece reel (short-form edits, motion overlays, or brand campaign mockups).',
      'Reverse-engineer how your top 3 creators or studios hook attention in the first 3 seconds.',
      'Collaborate with a local creator, musician, or small business on a real launch campaign.',
      'Explore Digital Media Production, Motion Graphics, or Creative Strategy pathways.'
    ],
    budgetFriendlyFirst90Days: [
      'Build a free portfolio using CapCut/DaVinci Resolve (free) with 3 crisp short-form edits or brand mockups.',
      'Pitch local businesses, streamers, or student orgs for paid social-video and branding packages right away.',
      'Earn free Meta/Google Digital Marketing credentials to pair creative flair with measurable business ROI.',
      'Skip expensive film-school debt and grow from paid freelance retainers into agency Creative Direction.'
    ]
  },
  {
    id: 'animal-eco-specialist',
    arcanaNumber: 'XVII',
    arcanaTitle: 'The Wild Guardian',
    careerTitle: 'Veterinary Tech, Wildlife Rehab & Eco-Science Specialist',
    arcadeTrait: 'Maker',
    secondaryTrait: 'Catalyst',
    pathwayNames: ['Healthcare', 'Engineering'],
    tags: ['animals', 'environment', 'science', 'hands_on', 'empathy', 'active_physical', 'fast_earning'],
    matchBase: 73,
    salaryRange: '$52k - $105k+',
    growthOutlook: '+18% Bio & Conservation',
    fastEarningFriendly: true,
    handsOn: true,
    deskHeavy: false,
    socialHeavy: false,
    lowMathFriendly: false,
    whyItFits: 'Connects love for animals, biology, and the natural world with tangible hands-on fieldwork and care.',
    shadowProtection: 'Gives you meaningful outdoor/clinical hands-on purpose without mandatory 8-year vet school debt.',
    first90Days: [
      'Volunteer or work part-time at a local animal clinic, wildlife rehab center, or conservation group.',
      'Compare 2-year Accredited Vet Tech programs vs. Environmental Field Technician certificates.',
      'Learn basic ecological data mapping or animal handling protocols from certified specialists.',
      'Connect with 2 working vet techs or conservation biologists about their daily routines.'
    ],
    budgetFriendlyFirst90Days: [
      'Start as a paid Veterinary Assistant or local parks/conservation crew member while gaining hands-on hours.',
      'Target an affordable 2-year community college Licensed Vet Tech (LVT) or Environmental Tech program instead of 8-year debt.',
      'Look for local municipal wildlife, water-quality, or sustainability fellowships that pay a stipend.',
      'Document fieldwork or animal-care certifications cleanly to qualify for rapid promotions.'
    ]
  }
];

/**
 * Generates the unified, strictly aligned Soul Dossier from the live Soul Profile.
 * - If the user has NOT yet shared career/life signals in Chat AND has NOT played Crisis Simulator 3D,
 *   returns `{ isEmpty: true, ... }` with NO fabricated passions, strengths, weaknesses, or career cards.
 * - Once active, strictly synthesizes ALL Chat data + Crisis Simulator 3D gameplay into aligned
 *   Traits, Constraints, Energy Profile, Archetype Summary, and Top 3 Tarot Career Arcana Cards.
 */
export function generatePersonalizedDossier(profileOrTraits, conversationHistory = []) {
  // Backward-compatibility shim if an old caller passes legacy `{ passions, strengths, weaknesses }`
  let profile;
  if (profileOrTraits && ('arcade' in profileOrTraits || 'constraints' in profileOrTraits)) {
    profile = profileOrTraits;
  } else {
    profile = createInitialSoulProfile();
    if (profileOrTraits) {
      profile.passions = dedupe(profileOrTraits.passions || []);
      profile.strengths = dedupe(profileOrTraits.strengths || []);
      profile.weaknesses = dedupe(profileOrTraits.weaknesses || []);
    }
    const userMessages = (conversationHistory || []).filter((m) => m.sender === 'user');
    userMessages.forEach((m, idx) => {
      const { updatedProfile } = extractProfileUpdatesFromMessage(m.text, idx, profile);
      profile = updatedProfile;
    });
  }

  const active = hasSoulActivity(profile);
  const hasChatActivity =
    (profile.chatTurnCount || 0) > 0 || (profile.chatHighlights?.length || 0) > 0;
  const arcadeChoicesCount = profile.arcade?.choices?.length || 0;
  const hasArcadeActivity = Boolean(profile.arcade?.completed) || arcadeChoicesCount > 0;

  // EMPTY STATE: Display nothing / empty dossier until the user engages Chat or Crisis Simulator 3D
  if (!active) {
    return {
      isEmpty: true,
      hasChatActivity: false,
      hasArcadeActivity: false,
      chatTurnCount: 0,
      arcadeProgress: 0,
      arcadeCompleted: false,
      title: 'Friendly Ghost Counselor: Main Character Soul Dossier',
      counselorSignOff: '',
      passions: [],
      strengths: [],
      weaknesses: [],
      constraints: null,
      energyProfile: null,
      arcade: null,
      careerCards: []
    };
  }

  const arcade = profile.arcade || createInitialSoulProfile().arcade;
  const constraints = profile.constraints || {};
  const energy = profile.energyProfile || {};
  const topics = new Set(profile.discussedTopics || []);
  const selectedPathway = arcade.selectedPathway || null;
  const arcadeResult = arcade.completed ? arcade.result : null;
  const arcadeScores = arcade.scores || { Maker: 0, Architect: 0, Catalyst: 0, Visionary: 0 };

  // Build text corpus STRICTLY from user-derived traits + user chat highlights + user arcade choices
  // (NEVER from ghost's own INITIAL_GREETING!)
  const userCorpus = [
    ...(profile.passions || []),
    ...(profile.strengths || []),
    ...(profile.weaknesses || []),
    ...(profile.chatHighlights || []).map((h) => h.text),
    ...(arcade.choices || []).map((c) => c.choiceText),
    selectedPathway?.name || '',
    arcadeResult?.recommendedFields || ''
  ].join(' ');

  const needBudgetFriendly = Boolean(
    constraints.needMoneyNow || constraints.localOnly || constraints.highFamilyDuties
  );

  const cityEconomics = constraints.city ? getCityData(constraints.city) : null;

  // Score every Career Arcana card deterministically against ALL live user signals
  const scoredCards = CAREER_ARCANA_CATALOG.map((card) => {
    let score = card.matchBase;
    const reasons = [];
    const alignmentBadges = [];

    // 1. Selected Pathway Card from Crisis Simulator 3D (strongest direct user intent)
    if (selectedPathway && card.pathwayNames?.includes(selectedPathway.name)) {
      score += 24;
      alignmentBadges.push(`🎯 Selected: ${selectedPathway.name}`);
      reasons.push(`Directly matches the ${selectedPathway.name} pathway you selected in Crisis Simulator 3D`);
    }

    // 2. Crisis Simulator 3D Scores & Unlocked Archetype
    if (hasArcadeActivity) {
      const primaryScore = arcadeScores[card.arcadeTrait] || 0;
      const secondaryScore = card.secondaryTrait ? arcadeScores[card.secondaryTrait] || 0 : 0;

      if (arcade.completed && arcadeResult) {
        if (arcadeResult.dominantTrait === card.arcadeTrait) {
          score += 14 + primaryScore * 1.1;
          alignmentBadges.push(`🕹️ ${arcadeResult.badge} ${arcadeResult.title.split('/')[0].trim()}`);
          reasons.push(`Aligned with your ${arcadeResult.title} instincts (${arcadeResult.dominantTrait} ${primaryScore}/10)`);
        } else if (arcadeResult.isTie && arcadeResult.secondaryTrait === card.arcadeTrait) {
          score += 13 + primaryScore * 1.0;
          alignmentBadges.push(`🕹️ Dual-Archetype Match`);
          reasons.push(`Aligned with your dual ${arcadeResult.title} crisis instincts`);
        } else if (arcadeResult.secondaryTrait === card.arcadeTrait && primaryScore >= 2) {
          score += 6 + primaryScore * 0.7;
          alignmentBadges.push(`🕹️ Secondary Instinct`);
        }
        if (card.secondaryTrait && arcadeResult.dominantTrait === card.secondaryTrait) {
          score += 4 + secondaryScore * 0.4;
        }
      } else {
        // Mid-game (1-9 choices): align career scoring WITHOUT exposing dimension names!
        if (primaryScore > 0) {
          score += primaryScore * 3.5;
          alignmentBadges.push(`🕹️ Crisis Instinct Match`);
          reasons.push(`Matches the real-time instincts you chose in Crisis Simulator 3D`);
        }
        if (secondaryScore > 0) {
          score += secondaryScore * 1.2;
        }
      }
    }

    // 3. Chat Discussed Topics & Interests
    let topicHits = 0;
    card.tags.forEach((tag) => {
      if (topics.has(tag)) {
        topicHits += 1;
        // Boost strongly for specific career domains explicitly discussed by the user
        const isSpecificDomain = ![
          'maker',
          'architect',
          'catalyst',
          'visionary',
          'fast_earning',
          'active_physical',
          'low_math',
          'non_tech'
        ].includes(tag);
        score += isSpecificDomain ? 12 : 4;
      }
    });
    if (topicHits > 0) {
      alignmentBadges.push('💬 Chat Aligned');
    }

    // 4. Keyword reinforcement from actual user passions/strengths/chat
    if (card.id === 'animal-eco-specialist' && /\b(animal|vet|wildlife|biology|nature|environment)\b/i.test(userCorpus)) {
      score += 16;
      reasons.push('Directly reflects your interest in animals, biology, and the natural world');
    }
    if (card.id === 'culinary-food-artisan' && /\b(cook|bak|chef|culinary|food|kitchen)\b/i.test(userCorpus)) {
      score += 16;
      reasons.push('Directly reflects your passion for cooking and hands-on food craft');
    }
    if (card.id === 'forensics-paralegal-investigator' && /\b(law|legal|forensic|detective|paralegal|justice)\b/i.test(userCorpus)) {
      score += 16;
      reasons.push('Directly reflects your interest in law, forensics, and investigative work');
    }
    if (card.id === 'allied-healthcare-specialist' && /\b(nurse|doctor|medical|hospital|healthcare|radiolog|ultrasound|emt|paramedic)\b/i.test(userCorpus)) {
      score += 14;
      reasons.push('Matches your interest in frontline healthcare with high 2-year ROI');
    }
    if (card.id === 'skilled-trades-specialist' && /\b(trade|electrician|hvac|weld|mechanic|plumb|construction)\b/i.test(userCorpus)) {
      score += 14;
      reasons.push('Matches your hands-on skilled trades interest with paid apprenticeship entry');
    }
    if (card.id === 'ux-product-architect' && /\b(ux|ui|figma|design|art|draw|aesthetic|visual)\b/i.test(userCorpus)) {
      score += 10;
      reasons.push('Matches your visual design and creative problem-solving vibe');
    }
    if (card.id === 'ai-interactive-engineer' && /\b(code|coding|software|game|developer|program|cyber|app)\b/i.test(userCorpus)) {
      score += 12;
      reasons.push('Matches your coding, gaming, or software building energy');
    }
    if (card.id === 'human-soul-guide' && /\b(psych|counsel|therap|mental health|advice|listen|empathy)\b/i.test(userCorpus)) {
      score += 10;
      reasons.push('Honors your strong empathy and listener instincts from our chat');
    }

    // 5. Phase 1 Reality Constraints Alignment (CRITICAL GUARDRAIL)
    if (needBudgetFriendly) {
      if (card.fastEarningFriendly) {
        score += 7;
        alignmentBadges.push('💸 Fast-ROI / Debt-Smart');
      } else {
        score -= 6;
      }
    }

    // 6. Phase 2 Energy & Environment Profile Alignment
    if (energy.avoidDesk) {
      if (card.handsOn || !card.deskHeavy) {
        score += 7;
        reasons.push('Respects your need to stay active and avoid 8-hour desk burnout');
      } else {
        score -= 10;
      }
    }
    if (energy.avoidHeavySocial) {
      if (!card.socialHeavy) {
        score += 6;
      } else {
        score -= 8;
      }
    }
    if (energy.lockedInZone === 'hands_on' && card.handsOn) score += 8;
    if (energy.lockedInZone === 'digital' && card.tags.includes('digital')) score += 8;
    if (energy.lockedInZone === 'creative' && (card.tags.includes('creative') || card.tags.includes('media'))) score += 8;
    if (energy.lockedInZone === 'people' && (card.tags.includes('people') || card.tags.includes('empathy'))) score += 8;

    if (energy.teamMode === 'solo' && !card.socialHeavy) score += 4;
    if (energy.teamMode === 'leadership' && card.tags.includes('leadership')) score += 6;

    if (topics.has('low_math')) {
      if (card.lowMathFriendly) score += 6;
      else score -= 8;
    }

    // Build personalized Why It Fits, Shadow Protection, and Constraint-Aware First 90 Days
    const tailoredWhy =
      reasons.length > 0
        ? `${reasons[0]}. ${card.whyItFits}`
        : card.whyItFits;

    let tailoredShadow = card.shadowProtection;
    if (constraints.needMoneyNow && card.fastEarningFriendly) {
      tailoredShadow = `Built for immediate financial bandwidth: skips unaffordable out-of-state tuition debt. ${card.shadowProtection}`;
    } else if (energy.avoidDesk && !card.deskHeavy) {
      tailoredShadow = `Protects you from desk-work burnout with active, engaging daily variety. ${card.shadowProtection}`;
    } else if (energy.avoidHeavySocial && !card.socialHeavy) {
      tailoredShadow = `Protects your social battery with focused work blocks rather than nonstop crowd energy. ${card.shadowProtection}`;
    }

    const activeFirst90Days =
      needBudgetFriendly && card.budgetFriendlyFirst90Days
        ? card.budgetFriendlyFirst90Days
        : card.first90Days;

    return {
      ...card,
      _rawScore: score,
      matchPercent: Math.max(72, Math.min(99, Math.round(score))),
      whyItFits: tailoredWhy,
      shadowProtection: tailoredShadow,
      first90Days: activeFirst90Days,
      alignmentBadges: dedupe(alignmentBadges).slice(0, 3)
    };
  }).sort((a, b) => b._rawScore - a._rawScore);

  const maxRawScore = scoredCards[0]?._rawScore || 100;
  const top3 = scoredCards.slice(0, 3).map((card, idx) => {
    const { _rawScore, ...cleanCard } = card;
    let displayPercent = cleanCard.matchPercent;
    if (idx > 0 && maxRawScore > 99) {
      const gap = Math.max(2, Math.round((maxRawScore - _rawScore) * 0.35));
      displayPercent = Math.max(74, Math.min(99 - idx * 2, 99 - gap));
    }
    return {
      ...cleanCard,
      matchPercent: displayPercent
    };
  });
  const topCard = top3[0];

  // Dynamic, strictly aligned counselor sign-off
  const signOffParts = [];
  if (arcade.completed && arcadeResult) {
    signOffParts.push(
      `Your Crisis Simulator 3D run unlocked ${arcadeResult.title}${selectedPathway ? ` with a focus on ${selectedPathway.name}` : ''}.`
    );
  } else if (arcadeChoicesCount > 0) {
    signOffParts.push(
      `You have logged ${arcadeChoicesCount}/10 real-time crisis instincts so far (finish all 10 in Crisis Simulator 3D to unveil your full Spectral Archetype).`
    );
  }
  if (constraints.needMoneyNow) {
    signOffParts.push(
      `Every roadmap below is locked to your real financial priority: fast ROI, zero out-of-state tuition traps.`
    );
  } else if (hasChatActivity && profile.passions.length > 0) {
    signOffParts.push(
      `Your chat discoveries around ${profile.passions.slice(0, 2).join(' and ')} pair tightly with ${topCard.careerTitle} (${topCard.matchPercent}% match).`
    );
  } else {
    signOffParts.push(
      `Your #1 current alignment is ${topCard.careerTitle} (${topCard.matchPercent}% match). Keep chatting or play Crisis Simulator 3D to sharpen it even further.`
    );
  }

  const hasAnyConstraints = Boolean(
    constraints.financial || constraints.location || constraints.city || constraints.family
  );
  const hasAnyEnergy = Boolean(
    (energy.drains?.length || 0) > 0 || energy.lockedInLabel || energy.teamModeLabel
  );

  return {
    isEmpty: false,
    hasChatActivity,
    hasArcadeActivity,
    chatTurnCount: profile.chatTurnCount || 0,
    arcadeProgress: arcadeChoicesCount,
    arcadeCompleted: Boolean(arcade.completed),
    title:
      arcade.completed && arcadeResult
        ? `Soul Dossier: ${arcadeResult.title}`
        : 'Friendly Ghost Counselor: Live Soul Dossier',
    counselorSignOff: signOffParts.join(' '),
    passions: profile.passions || [],
    strengths: profile.strengths || [],
    weaknesses: profile.weaknesses || [],
    constraints: hasAnyConstraints
      ? {
          ...constraints,
          cityEconomics
        }
      : null,
    energyProfile: hasAnyEnergy ? energy : null,
    arcade: hasArcadeActivity
      ? {
          completed: Boolean(arcade.completed),
          progress: arcadeChoicesCount,
          // Strictly hide dimension labels & breakdown until all 10 scenarios complete (.kiro/rules.md Rule 5)
          result: arcade.completed ? arcadeResult : null,
          scores: arcade.completed ? arcadeScores : null,
          selectedPathway: arcade.completed ? selectedPathway : null,
          recentChoices: (arcade.choices || []).map((c) => ({
            scenarioId: c.scenarioId,
            scenarioTitle: c.scenarioTitle,
            choiceText: c.choiceText
          }))
        }
      : null,
    careerCards: top3
  };
}

/**
 * Formats the live Soul Dossier into a compact Single-Source-of-Truth context block
 * injected directly into AI prompts (Layer 1 Gemini & Layer 2 Pollinations).
 * Strictly obeys Rule 5 (never exposes hidden Crisis 3D dimension names before 10/10 completion).
 */
export function formatDossierContextForPrompt(profile, dossier) {
  if (!dossier || dossier.isEmpty) {
    return `USER'S LIVE SOUL DOSSIER STATUS: EMPTY (The user has not shared career traits/constraints or played Crisis Simulator 3D yet. Do NOT invent fake dossier traits or fake career matches. Invite them to share their reality constraints or play Crisis Simulator 3D to start populating their Soul Dossier.)`;
  }

  const lines = ['USER\'S LIVE SOUL DOSSIER (SINGLE SOURCE OF TRUTH - STAY STRICTLY ALIGNED WITH THIS DATA):'];

  if (dossier.constraints) {
    const c = dossier.constraints;
    const constraintBits = [];
    if (c.financial) constraintBits.push(`Financial: ${c.financial}`);
    if (c.location) constraintBits.push(`Location: ${c.location}`);
    if (c.city) constraintBits.push(`Target City: ${c.city}`);
    if (c.family) constraintBits.push(`Family/Schedule: ${c.family}`);
    if (constraintBits.length > 0) {
      lines.push(`- Reality Check Constraints: ${constraintBits.join(' | ')}`);
    }
    if (c.needMoneyNow || c.localOnly || c.highFamilyDuties) {
      lines.push(
        `- MANDATORY CONSTRAINT RULE: User has tight financial, local, or family constraints. ONLY recommend immediate earning pathways, paid apprenticeships, local community colleges, certificates, or portfolio routes. NEVER recommend unaffordable 4-year out-of-state universities.`
      );
    }
  }

  if (dossier.energyProfile) {
    const e = dossier.energyProfile;
    const eBits = [];
    if (e.drains?.length) eBits.push(`Drains: ${e.drains.join(', ')}`);
    if (e.lockedInLabel) eBits.push(`Locked-In Zone: ${e.lockedInLabel}`);
    if (e.teamModeLabel) eBits.push(`Team Mode: ${e.teamModeLabel}`);
    if (eBits.length > 0) lines.push(`- Energy Profile: ${eBits.join(' | ')}`);
  }

  if (dossier.passions.length > 0) {
    lines.push(`- Inner Embers (Passions): ${dossier.passions.join(', ')}`);
  }
  if (dossier.strengths.length > 0) {
    lines.push(`- Spectral Gifts (Strengths): ${dossier.strengths.join(', ')}`);
  }
  if (dossier.weaknesses.length > 0) {
    lines.push(`- Shadows & Boundaries: ${dossier.weaknesses.join('; ')}`);
  }

  if (dossier.arcade) {
    if (dossier.arcade.completed && dossier.arcade.result) {
      const r = dossier.arcade.result;
      const scoreSummary = Object.entries(dossier.arcade.scores || {})
        .map(([k, v]) => `${k} ${v}/10`)
        .join(', ');
      lines.push(
        `- Crisis Simulator 3D (COMPLETED 10/10): Unlocked "${r.title}" (${r.badge}) | Scores: ${scoreSummary} | Recommended Fields: ${r.recommendedFields}${
          dossier.arcade.selectedPathway
            ? ` | User's Selected Pathway Card: ${dossier.arcade.selectedPathway.name} (${dossier.arcade.selectedPathway.subtitle})`
            : ''
        }`
      );
      const sampleChoices = (dossier.arcade.recentChoices || [])
        .slice(-3)
        .map((c) => `${c.scenarioTitle}: "${c.choiceText}"`)
        .join('; ');
      if (sampleChoices) {
        lines.push(`- Recent Crisis Instinct Choices: ${sampleChoices}`);
      }
    } else if (dossier.arcade.progress > 0) {
      const sampleChoices = (dossier.arcade.recentChoices || [])
        .slice(-3)
        .map((c) => `${c.scenarioTitle}: "${c.choiceText}"`)
        .join('; ');
      lines.push(
        `- Crisis Simulator 3D (IN PROGRESS ${dossier.arcade.progress}/10): Choices so far: ${sampleChoices}. PSYCHOMETRIC RULE: Do NOT mention or reveal the 4 secret dimension names (Maker, Architect, Catalyst, Visionary) until the user completes all 10 scenarios.`
      );
    }
  } else {
    lines.push(
      `- Crisis Simulator 3D: Not played yet. PSYCHOMETRIC RULE: If mentioning the game, NEVER expose the 4 secret archetype dimension names before the user completes it.`
    );
  }

  if (dossier.careerCards?.length > 0) {
    const cardsSummary = dossier.careerCards
      .map(
        (c, idx) =>
          `#${idx + 1} ${c.careerTitle} (${c.matchPercent}% match, ${c.salaryRange}, First Step: ${c.first90Days[0]})`
      )
      .join(' | ');
    lines.push(`- Top 3 Soul Dossier Tarot Career Arcana Matches: ${cardsSummary}`);
  }

  lines.push(
    `- ALIGNMENT DIRECTIVE: Reference the user's actual Soul Dossier items above whenever relevant, stay 100% consistent with their top 3 career matches and Crisis Simulator results, and never contradict their discovered constraints or archetype.`
  );

  return lines.join('\n');
}
