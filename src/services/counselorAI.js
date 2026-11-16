// Friendly Ghost Counselor AI Engine (Kiroween 2026)
// Implements Persona & Tone (Gen-Z Slang Integration), PG-13 Guardrails, and Mandatory Safety Interventions

import { GhostResponseSchema } from '../ghostSchema.js';
import { getCityData } from '../data/globalEconomy.js';
import { GoogleGenAI } from '@google/genai';

/**
 * Sanitizes any text string to ensure em dashes (—), en dashes (–),
 * and double hyphens (--) are never used in chat responses or speech.
 */
export function sanitizeNoEmDashes(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    // Replace numeric/salary ranges ($78k – $135k, 01–03) with a clean single hyphen
    .replace(/(\$?\d+[a-zA-Z]?)\s*[—–]\s*(\$?\d+)/g, '$1 - $2')
    .replace(/(\d+)\s*[—–]\s*(\d+)/g, '$1-$2')
    // Replace em dashes and en dashes with comma
    .replace(/\s*[—–]\s*/g, ', ')
    // Replace double or multiple hyphens used as dashes
    .replace(/\s*--+\s*/g, ', ')
    // Fix punctuation collisions (e.g. "!," or ".," or ",,")
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

// Trait extraction dictionary for instant local analysis & fallback mode
const TRAIT_PATTERNS = {
  passions: [
    { regex: /\b(art|draw|paint|design|illustrat|fashion|aesthetic|visual|animation|edit)\b/i, label: 'Visual Arts & Design', domain: 'creative' },
    { regex: /\b(music|song|audio|instrument|sing|band|sound|film|video|cinema)\b/i, label: 'Storytelling & Media', domain: 'creative' },
    { regex: /\b(write|writing|story|stories|journal|book|poet|literature|content)\b/i, label: 'Creative Writing & Narrative', domain: 'creative' },
    { regex: /\b(code|coding|program|software|game|gaming|tech|computer|ai|web|app|robot)\b/i, label: 'Technology & Interactive Systems', domain: 'tech' },
    { regex: /\b(math|data|puzzle|logic|physics|engineer|build|finance|numbers|analytics)\b/i, label: 'Logic & Systems Engineering', domain: 'tech' },
    { regex: /\b(help|people|psych|mental health|counsel|listen|empathy|care|nurse|doctor|med|friends|advice)\b/i, label: 'Human Connection & Healing', domain: 'empathy' },
    { regex: /\b(teach|mentor|kids|education|community|social|justice|advoca)\b/i, label: 'Mentorship & Social Impact', domain: 'empathy' },
    { regex: /\b(lead|business|entrepreneur|startup|market|sell|organize|event|manage)\b/i, label: 'Entrepreneurship & Leadership', domain: 'leadership' },
    { regex: /\b(nature|animal|environment|climate|biology|science|lab|space|outdoors)\b/i, label: 'Natural Sciences & Discovery', domain: 'science' }
  ],
  strengths: [
    { regex: /\b(listen|empathetic|kind|support|understand|patient|caring|mediator|advice|therapist friend)\b/i, label: 'Deep Empathy & W Listener' },
    { regex: /\b(creative|imagin|original|idea|brainstorm|invent|artistic|vision|cook)\b/i, label: 'Main Character Creative Vision' },
    { regex: /\b(solve|problem|logical|analy|detail|focus|research|curious|fast learner|locked in)\b/i, label: 'Locked-In Problem Solving' },
    { regex: /\b(lead|organiz|plan|speak|communicate|team|motivat|confident|decisive|rizz|charisma)\b/i, label: 'Natural Charisma & Leadership' },
    { regex: /\b(adapt|resilien|calm|independent|self-taught|persist|hard.?work|sigma)\b/i, label: 'Calm Resilience & Focus' },
    { regex: /\b(build|make|hands-on|craft|fix|tinker|prototype)\b/i, label: 'Hands-On Builder Energy' }
  ],
  weaknesses: [
    { regex: /\b(overwhelm|burnout|stress|anxious|anxiety|overthink|worry|fear|scared|terrified|cooked)\b/i, label: 'Overthinking & Future Stress', reframe: 'High care factor that thrives with small, low-pressure steps' },
    { regex: /\b(procrastinat|distract|bored|routine|monoton|adhd|focus|schedule)\b/i, label: 'Allergic to Boring Routines', reframe: 'Built for dynamic, creative sprints instead of repetitive 9-to-5s' },
    { regex: /\b(shy|introvert|public speaking|crowd|social battery|stage fright|quiet|ghosting)\b/i, label: 'Low Social Battery in Crowds', reframe: 'Deep-focus specialist who shines 1-on-1 or in small studios' },
    { regex: /\b(math|numbers|spreadsheet|accounting|calculus)\b/i, label: 'Heavy Math Drain', reframe: 'Human-centered & visual thinker who pairs great with modern tools' },
    { regex: /\b(perfectionis|imposter|doubt|not good enough|fail|comparing|lost|unsure)\b/i, label: 'Perfectionism & Self-Doubt', reframe: 'High standards, just needs permission to let rough drafts cook' },
    { regex: /\b(conflict|saying no|people pleas|boundaries)\b/i, label: 'People-Pleasing Habits', reframe: 'Team harmonizer who thrives in supportive, mission-driven crews' }
  ]
};

export function extractTraitsFromText(userText, stageIndex = 0) {
  const found = {
    passions: [],
    strengths: [],
    weaknesses: []
  };

  TRAIT_PATTERNS.passions.forEach((item) => {
    if (item.regex.test(userText)) found.passions.push(item.label);
  });

  TRAIT_PATTERNS.strengths.forEach((item) => {
    if (item.regex.test(userText)) found.strengths.push(item.label);
  });

  TRAIT_PATTERNS.weaknesses.forEach((item) => {
    if (item.regex.test(userText)) found.weaknesses.push(item.label);
  });

  const clean = userText.trim();
  if (clean.length > 6) {
    if (stageIndex === 0 && found.passions.length === 0) {
      if (/lost|overwhelm|don't know|unsure|cooked|stress/i.test(clean)) {
        found.weaknesses.push('Post-Graduation Stress');
        found.passions.push('Finding Real Purpose');
      } else {
        found.passions.push('Curiosity & Exploring');
      }
    } else if (stageIndex === 1 && found.strengths.length === 0) {
      found.strengths.push('Real Self-Awareness');
    } else if (stageIndex === 2 && found.weaknesses.length === 0) {
      found.weaknesses.push('Navigating Big Life Changes');
    } else if (stageIndex === 3 && found.strengths.length === 0) {
      found.strengths.push('Protecting Personal Peace');
    }
  }

  return found;
}

// Curated Career Archetype Library for dynamic synthesis
const CAREER_ARCHETYPES = [
  {
    id: 'ux-product-architect',
    arcanaNumber: 'I',
    arcanaTitle: 'The Aesthetic Architect',
    careerTitle: 'UX / Product Designer & Creative Technologist',
    tags: ['creative', 'tech', 'empathy'],
    matchBase: 95,
    salaryRange: '$78k - $135k+',
    growthOutlook: '+16% High Demand',
    whyItFits: 'Combines your creative eye and empathy for how people feel with problem-solving, peak main character energy without boring repetition.',
    shadowProtection: 'Protects against burnout and perfectionism with fast visual prototypes and supportive studio teams.',
    first90Days: [
      'Redesign 1 app screen that annoys you in Figma (free for students) and let your creativity cook.',
      'Post a quick 2-minute walkthrough showing why your version feels way better.',
      'Check out Digital Media, Human-Computer Interaction (HCI), or UI/UX design tracks.',
      'Team up with friends for a weekend hackathon as the designer.'
    ]
  },
  {
    id: 'ai-interactive-engineer',
    arcanaNumber: 'VII',
    arcanaTitle: 'The Code Alchemist',
    careerTitle: 'Interactive Software / Game & AI Developer',
    tags: ['tech', 'creative'],
    matchBase: 93,
    salaryRange: '$88k - $155k+',
    growthOutlook: '+22% Rapid Expansion',
    whyItFits: 'Turns your ability to get locked in on puzzles, gaming, or tech into building real apps and worlds people actually use.',
    shadowProtection: 'Respects your social battery: lets you lock in with headphones on instead of forcing nonstop small talk.',
    first90Days: [
      'Build one fun mini web app, mod, or game prototype that makes your friends say "wait, you made this?!"',
      'Level up in JavaScript/Python + modern AI APIs.',
      'Share your project in a student dev Discord or club for instant feedback.',
      'Explore Computer Science, Game Development, or Creative Coding programs.'
    ]
  },
  {
    id: 'human-soul-guide',
    arcanaNumber: 'XIV',
    arcanaTitle: 'The Empathy Anchor',
    careerTitle: 'Counseling Psychologist / Youth Wellness Specialist',
    tags: ['empathy', 'science'],
    matchBase: 94,
    salaryRange: '$68k - $118k+',
    growthOutlook: '+19% Essential Need',
    whyItFits: 'Honors your W listener skills and emotional intelligence, helping people feel seen when they think they are cooked.',
    shadowProtection: 'Focuses on meaningful 1-on-1 conversations instead of chaotic, toxic corporate environments.',
    first90Days: [
      'Volunteer with a peer-support club, youth mentorship program, or community center.',
      'Take an intro class in Psychology, Neuroscience, or Human Development.',
      'Practice healthy boundaries so you can help friends without draining your own battery.',
      'Chat with a school counselor or therapist about what their day-to-day is actually like.'
    ]
  },
  {
    id: 'narrative-media-director',
    arcanaNumber: 'III',
    arcanaTitle: 'The Story Director',
    careerTitle: 'Creative Director, Video Producer & Brand Storyteller',
    tags: ['creative', 'leadership', 'empathy'],
    matchBase: 91,
    salaryRange: '$65k - $125k+',
    growthOutlook: '+14% Evolving Media',
    whyItFits: 'Channels your elite communication rizz and creative vision into directing stories, videos, campaigns, or games.',
    shadowProtection: 'Keeps every week fresh and dynamic so you never feel stuck in a repetitive loop.',
    first90Days: [
      'Create a 5-part short-form series, video essay, or zine about a topic you genuinely care about.',
      'Break down how your top 3 favorite creators hook their audience in the first 5 seconds.',
      'Collab with a friend who codes or makes music on a joint project.',
      'Explore Film/Media Production, Digital Marketing, or Narrative Design.'
    ]
  },
  {
    id: 'eco-bio-innovator',
    arcanaNumber: 'XVII',
    arcanaTitle: 'The Planet Guardian',
    careerTitle: 'Environmental Scientist / Sustainable Tech Strategist',
    tags: ['science', 'tech', 'leadership'],
    matchBase: 90,
    salaryRange: '$72k - $128k+',
    growthOutlook: '+17% Green Transition',
    whyItFits: 'Connects your curiosity about science and nature with real-world impact that actually helps the planet.',
    shadowProtection: 'Balances hands-on fieldwork and lab discovery with a clear, positive mission.',
    first90Days: [
      'Join a local sustainability project, science club, or outdoor restoration day.',
      'Learn how to turn environmental data into cool visual maps or stories.',
      'Reach out to 2 people working in clean tech, biology, or conservation.',
      'Look into Environmental Science, Bioengineering, or Sustainable Design.'
    ]
  }
];

export function generatePersonalizedDossier(traits, conversationHistory = []) {
  const allText = [
    ...traits.passions,
    ...traits.strengths,
    ...traits.weaknesses,
    ...conversationHistory.map((m) => m.text)
  ].join(' ');

  const scores = {
    creative: 0,
    tech: 0,
    empathy: 0,
    leadership: 0,
    science: 0
  };

  if (/\b(art|design|music|write|story|creative|visual|film|draw|aesthetic|edit)\b/i.test(allText)) scores.creative += 3;
  if (/\b(code|tech|game|computer|puzzle|logic|math|build|engineer|software|ai)\b/i.test(allText)) scores.tech += 3;
  if (/\b(help|listen|people|empathy|psych|care|support|friend|counsel|mental|advice)\b/i.test(allText)) scores.empathy += 3;
  if (/\b(lead|organize|business|plan|team|speak|entrepreneur|startup|rizz)\b/i.test(allText)) scores.leadership += 2;
  if (/\b(nature|science|bio|environment|animal|lab|research|earth)\b/i.test(allText)) scores.science += 3;

  const rankedCards = CAREER_ARCHETYPES.map((card) => {
    let score = card.matchBase;
    card.tags.forEach((tag) => {
      score += (scores[tag] || 0) * 1.5;
    });
    return {
      ...card,
      matchPercent: Math.min(99, Math.round(score))
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);

  const finalPassions =
    traits.passions.length > 0
      ? traits.passions
      : ['Curiosity & Exploring', 'Authentic Creative Energy'];
  const finalStrengths =
    traits.strengths.length > 0
      ? traits.strengths
      : ['Real Self-Awareness', 'Empathy & Adaptability'];
  const finalWeaknesses =
    traits.weaknesses.length > 0
      ? traits.weaknesses
      : ['Post-Graduation Stress (Reframed: Taking It One Step at a Time)'];

  return {
    title: 'Friendly Ghost Counselor: Main Character Soul Dossier',
    counselorSignOff:
      'No cap, you are way less cooked than you think! Your first step after high school is just Chapter 1: let yourself cook, protect your peace, and remember you have main character energy.',
    passions: finalPassions,
    strengths: finalStrengths,
    weaknesses: finalWeaknesses,
    careerCards: rankedCards.slice(0, 3)
  };
}

// THREE-PHASE COUNSELING PROTOCOL (Friendly Ghost Counselor System Prompt Implementation)
// Phase 1: Reality Check (Financial, Geographic, Family Obligations)
// Phase 2: Energy & Environment Quiz (Battery Drain, Locked In Zone, Solo vs Co-op)
// Phase 3: Skill Inventory (Tech/Digital, IRL/Social, Hidden Buff)

const PHASE_1_REALITY_CHECK = [
  {
    id: 'financial-vibe',
    mood: 'curious',
    buildReply: (userText, extracted) => {
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
    buildReply: (userText, extracted) => {
      if (isCrashingOutMentioned(userText)) {
        return `I hear you, when stress builds up, that frustration is real. Let's keep your peace protected. I heard what you said about your financial situation. Next question: Are you locked to your current zip code, or can you soft-launch in a new city/state?`;
      }
      return `Heard that, no cap: I just locked your financial bandwidth into the Reality Check. Now let's talk mobility: Are you locked to your current zip code, or can you soft-launch in a new city/state for school or work?`;
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
    buildReply: (userText, extracted) => {
      if (isCrashingOutMentioned(userText)) {
        return `Real talk: that stress is valid. Take a breath with me. I heard about your mobility constraints. Last Reality Check question: Do you have siblings to watch or a family hustle to help run, or is your time your own?`;
      }
      return `Okay, got it, I updated your geographic flexibility. Last Reality Check question before we move forward: Do you have siblings to watch or a family hustle to help run, or is your time your own?`;
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
    buildReply: (userText, extracted, allTraits) => {
      if (isCrashingOutMentioned(userText)) {
        return `I feel you, frustration is real. Let's channel that energy productively. Now that I know your reality constraints, let's figure out what kind of work actually gives you energy vs drains you. Real talk, what sounds like an absolute nightmare to you: being glued to a screen at a desk for 8 hours, or being on your feet talking to random people all day?`;
      }
      
      // Summarize Phase 1 discoveries
      const hasFinancialPressure = /need money|asap|help family|bills|tight/i.test(allTraits.passions.join(' '));
      const summary = hasFinancialPressure 
        ? `Okay, I got your Reality Check Stats locked in! Now that I know your financial and family situation, let's make sure any path I recommend actually matches YOUR energy, not what society thinks you should do.`
        : `Your Reality Check Stats are locked in! Now let's figure out what kind of daily work environment won't drain your soul.`;
      
      return `${summary} Real talk, what sounds like an absolute nightmare to you: being glued to a screen at a desk for 8 hours, or being on your feet talking to random people all day?`;
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
    buildReply: (userText, extracted) => {
      if (isCrashingOutMentioned(userText)) {
        return `Heard. Let's keep building your profile so we avoid toxic environments. You told me what drains you, now tell me when you get totally locked in and lose track of time, what are you doing? Are you solving abstract puzzles on a computer, or doing something IRL with your hands, like cooking, baking, building, or fixing things?`;
      }
      return `Okay, that battery drain intel is crucial, I just saved you from a toxic work environment! Now tell me: when you get totally locked in and lose track of time, what are you doing? Are you solving abstract puzzles on a computer, or doing something IRL with your hands, like cooking, baking, building, or fixing things?`;
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
    buildReply: (userText, extracted) => {
      if (isCrashingOutMentioned(userText)) {
        return `Real talk, I hear the frustration. Let's finish this Energy Quiz so I can recommend the right environment. Last question: In your future main quest, do you want to be the front-facing main character managing a team, or would you rather be the solo architect working in the background keeping your peace?`;
      }
      return `Hold up, that's exactly the kind of intel I need to match you with the right career! Last Energy Quiz question: In your future main quest, do you want to be the front-facing main character managing a team, or would you rather be the solo architect working in the background keeping your peace?`;
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
    buildReply: (userText, extracted, allTraits) => {
      if (isCrashingOutMentioned(userText)) {
        return `Heard. Take a breath with me, we're almost done with the profile. Now let's check your base stats so I can show you how your existing skills translate to real careers. Time to check your base stats. What are you already decently good at on the tech or digital side? Are you making sick video edits, running socials, fixing busted electronics, or naturally good at math?`;
      }
      return `Okay WOW, your Energy Profile is elite, no cap! Now let's inventory your actual skills because teenagers sleep on their own talents all the time. Time to check your base stats. What are you already decently good at on the tech or digital side? Are you making sick video edits, running socials, fixing busted electronics, or naturally good at math?`;
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
    buildReply: (userText, extracted) => {
      if (isCrashingOutMentioned(userText)) {
        return `I feel that frustration, let's keep going. You told me about your tech skills. Huge W. Now what about IRL? Are you the one organizing the squad's events, fixing physical things with your hands, or the one everyone comes to for advice?`;
      }
      const techSkill = extracted.strengths[0] || 'those digital skills';
      return `Huge W! I just added **${techSkill}** to your base stats. Now what about IRL? Are you the one organizing the squad's events, fixing physical things with your hands, or the one everyone comes to for advice?`;
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
    buildReply: (userText, extracted) => {
      if (isCrashingOutMentioned(userText)) {
        return `Real talk: that frustration matters but so do your talents. You mentioned your IRL skills, that's a massive flex. Last question: A lot of people sleep on their own talents. What is something you do so effortlessly that you don't even realize it's a massive flex?`;
      }
      const irlSkill = extracted.strengths[0] || 'those IRL skills';
      return `See?? **${irlSkill}** is a MASSIVE professional asset, I just updated your Soul Dossier! Last question: A lot of people sleep on their own talents. What is something you do so effortlessly that you don't even realize it's a massive flex?`;
    },
    quickPrompts: [
      "People say I explain things really clearly 🗣️",
      "I naturally see patterns and connections 🔗",
      "I'm really good at keeping my cool under pressure 😌",
      "Honestly not sure, I'm pretty average at everything 🤔"
    ]
  }
];

// Combine all phases into structured progression:
// Stage 0: Responds to Q1 (Financial Vibe) -> asks Q2 (Geographic Spawn)
// Stage 1: Responds to Q2 (Geographic Spawn) -> asks Q3 (Co-op Duties)
// Stage 2: Responds to Q3 (Co-op Duties) -> summarizes Phase 1, asks Q4 (Battery Drain)
// Stage 3: Responds to Q4 (Battery Drain) -> asks Q5 (Locked In Zone)
// Stage 4: Responds to Q5 (Locked In Zone) -> asks Q6 (Solo vs Co-op)
// Stage 5: Responds to Q6 (Solo vs Co-op) -> summarizes Phase 2, asks Q7 (Tech & Digital Flex)
// Stage 6: Responds to Q7 (Tech & Digital Flex) -> reframes tech skill, asks Q8 (IRL & Social Flex)
// Stage 7: Responds to Q8 (IRL & Social Flex) -> reframes IRL skill, asks Q9 (Hidden Buff)
// Stage 8: Responds to Q9 (Hidden Buff) -> celebrates and unlocks Soul Dossier!
const FALLBACK_STAGES = [
  PHASE_1_REALITY_CHECK[1],  // Stage 0: Geographic Spawn Point
  PHASE_1_REALITY_CHECK[2],  // Stage 1: Co-op Duties
  PHASE_2_ENERGY_QUIZ[0],    // Stage 2: Battery Drain (with Phase 1 summary)
  PHASE_2_ENERGY_QUIZ[1],    // Stage 3: Locked In Zone
  PHASE_2_ENERGY_QUIZ[2],    // Stage 4: Solo vs Co-op Mode
  PHASE_3_SKILL_INVENTORY[0], // Stage 5: Tech & Digital Flex (with Phase 2 summary)
  PHASE_3_SKILL_INVENTORY[1], // Stage 6: IRL & Social Flex
  PHASE_3_SKILL_INVENTORY[2], // Stage 7: Hidden Buff
  // Stage 8: Dossier Unlock
  {
    id: 'dossier-unlock',
    mood: 'oracular',
    buildReply: (userText, extracted, allTraits) => {
      const hiddenBuff = extracted.strengths[extracted.strengths.length - 1] || 'your natural talents';
      return `Hold up, we just let you cook through all three phases, and the results are ELITE, no cap! Your hidden buff (**${hiddenBuff}**) combined with everything else we discovered? You just unlocked your **Main Character Soul Dossier**! Tap **Soul Dossier** at the top to see your top 3 Career Arcana Cards tailored to YOUR reality constraints, energy profile, and actual skills, or keep texting me about college stress, parent pressure, or daily life!`;
    },
    quickPrompts: [
      "Open my Soul Dossier & show my top 3 career matches! 📜✨",
      "My parents want me to pick a 'safe' career, help! 🛡️",
      "Do I need a 4-year college degree or another route? 🎓",
      "Everyone else looks so locked in, how do I stop comparing? 😭"
    ]
  }
];

// Smart offline topic responder so even in offline mode the Ghost directly answers free-form user questions
export function getSmartTopicReply(userText) {
  if (!userText) return null;
  const t = userText.toLowerCase();

  // ── Facial Expression & Real-Time Emotion Triggers (Scrying Mirror Auto-Submit) ──
  if (/\b(smiling|smiles|happy|grin|beaming|good vibes|smiling & energized)\b/i.test(t)) {
    return {
      mood: 'welcoming',
      reply: "Wait, look at that smile lighting up the crystal ball! ✨ That is peak main character energy, no cap. Seeing you energized tells me we're heading in the right direction. What's sparking the good vibes right now: is there a career path or idea that's actually got you hyped?",
      quickPrompts: [
        "I'm hyped about creative paths! 🎨",
        "High-paying tech vibes sound cool 💻",
        "Just happy I don't need 8 years of school 🎓",
        "Open my Soul Dossier & show matches 📜✨"
      ]
    };
  }

  if (/\b(overwhelmed|stressed|sad|frown|crying|hopeless|gloomy|overwhelmed \/ stressed)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: "Hey, pause with me for a second, I saw your expression drop into that overwhelmed look, real talk. Post-grad pressure and career decisions can make anyone feel cooked. Take a slow, deep breath. You do NOT have to have your whole 30-year life mapped out today. What's the heaviest thing sitting on your mind right now?",
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
      reply: "Deep breath! I caught that worried, anxious expression in the scrying mirror. The future feels scary when everyone expects you to know what's next, but no cap: most people figure it out one small step at a time. Let's make this zero-pressure. What's one worry we can take off your shoulders today?",
      quickPrompts: [
        "What if I can't find a job after school? 💼",
        "Can I switch paths later if I hate it? 🔄",
        "How do I earn money without college debt? 💸",
        "Give me a simple 90-day game plan ✨"
      ]
    };
  }

  if (/\b(frustrated|fed up|angry|mad|annoyed|furious)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: "I see that frustrated look, don't let anyone bait you into crashing out! It's completely valid to feel sick and tired of endless tests, boring advice, and people telling you what to do. You're the author of your own story. What's annoying you most right now: school, family expectations, or the job grind?",
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
      reply: "Haha, that reaction! 😮 The scrying mirror picked up that mind-blown expression. Did one of those career salaries or alternative paths catch you off guard? Real talk, the post-grad landscape has way more hidden cheat codes than high school teaches you! Which part surprised you the most?",
      quickPrompts: [
        "Didn't know 2-year degrees paid that much! 💸",
        "Wait, portfolio beats college degree? 🎨",
        "Skilled trades make six figures?! ⚡",
        "Tell me more hidden career cheat codes 🔮"
      ]
    };
  }

  if (/\b(skeptical|not feeling it|disgusted|eyebrow|doubtful|side-eye)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: "Caught that skeptical eyebrow raise in the mirror! 🤨 Real talk, healthy skepticism is an elite trait: it means you don't just blindly follow whatever people push on you. If a traditional 9-to-5 cubicle desk job sounds like a nightmare, we can completely toss it out. What kind of work would you genuinely hate doing?",
      quickPrompts: [
        "Never want to sit at a desk for 8 hours 🚫",
        "Can't stand dealing with annoying customers 🙅",
        "Hate heavy math and spreadsheets 📊",
        "Show me unconventional, wild careers 🗺️"
      ]
    };
  }

  if (/\b(locked in & focused|focused expression|serious face)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "Look at that focus! 👀 You're totally locked in right now, and that deep-focus energy is exactly what will get you hired in high-value roles. When you're in the zone like this, what kind of problem do you enjoy solving the most?",
      quickPrompts: [
        "Building digital stuff or code 💻",
        "Creative design & visual projects 🎨",
        "Fixing hands-on physical things 🛠️",
        "Researching & analyzing deep topics 🔍"
      ]
    };
  }

  // 0. Kiroween Costume Contest & Hexes
  if (/hauntingly cute/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "The Judges give it an uncontested 10/10! That tiny star-speckled hat and smiling jack-o'-lantern bucket scored peak spooky charm on the judges' leaderboard. Keep the voting hexes flowing! ✨🎃",
      quickPrompts: [
        "Cast 5 Stars for this Ghost Wizard! ⭐",
        "Totally magical and spooky!",
        "More cute chaos needed! 👻",
        "Tell me my future career archetype! 🔮"
      ]
    };
  }

  if (/magical and spooky/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "A certified spectral triumph! The enchanted purple wizard cape paired with the bubbling cauldron brings immaculate Halloween fantasy energy. The judges are absolutely bewitched! 💜🧙‍♂️",
      quickPrompts: [
        "This costume is hauntingly cute! 🎃",
        "Spirited and playful! ⭐",
        "Cast 5 Stars for this Ghost Wizard! ⭐",
        "Open my Soul Dossier & show career cards 📜✨"
      ]
    };
  }

  if (/cute chaos/i.test(t)) {
    return {
      mood: 'curious',
      reply: "More cute chaos unleashed! The ghost summons extra candy corn, bubbling potion fumes, and a shower of celestial sparks! What chaotic mischief should we brew next? 👻🍭",
      quickPrompts: [
        "This costume is hauntingly cute! 🎃",
        "Totally magical and spooky!",
        "Spirited and playful! ⭐",
        "How do I unlock my Soul Dossier? 📜"
      ]
    };
  }

  if (/spirited and playful/i.test(t)) {
    return {
      mood: 'welcoming',
      reply: "Spirited and playful to the max! That cheerful waving hand and blushing smile proved you can be a ghostly specter and the life of the party at the same time. The crowd goes wild! ⭐✨",
      quickPrompts: [
        "This costume is hauntingly cute! 🎃",
        "Totally magical and spooky!",
        "Cast 5 Stars for this Ghost Wizard! ⭐",
        "Tell me my future career archetype! 🔮"
      ]
    };
  }

  if (/\b(outfit|costume|wizard hat|ghost-wizard|adorable|cute)\b/i.test(t) && !/bad|hate|ugly/i.test(t)) {
    return {
      mood: 'welcoming',
      reply: "An absolutely adorable entry! The tiny star-speckled wizard hat paired with that grinning Jack-o'-lantern is spectacular. It's got that perfect, spooky-cute charm. Be sure to cast your voting hexes below!",
      quickPrompts: [
        "This costume is hauntingly cute! 🎃",
        "Totally magical and spooky!",
        "More cute chaos needed! 👻",
        "Spirited and playful! ⭐"
      ]
    };
  }

  if (/\b(vote|voted|rating|star|stars|verdict|hex)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "Your hex and verdict have been officially recorded in the Kiroween Hall of Records! The Ghost Wizard's rating is surging on the leaderboard. Thank you for judging with style! 🏆🌟",
      quickPrompts: [
        "This costume is hauntingly cute! 🎃",
        "Totally magical and spooky!",
        "Spirited and playful! ⭐",
        "Open my Soul Dossier & show career cards 📜✨"
      ]
    };
  }

  // 1. Animals & Biology / Veterinary Alternatives
  if (/\b(animal|vet|veterinar|biology|wildlife|pet|critter|zoolog|marine bio)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "If you love animals and biology but want to skip the 8-year vet school grind, you've got amazing high-impact options! You can become a **Licensed Veterinary Technician (Vet Tech)** in just 2 years ($42k-$62k), a **Wildlife Conservation / Rehab Specialist** ($50k-$80k), a **Certified Animal Behaviorist & Trainer**, or a **Field / Marine Biology Research Assistant**. You get all the hands-on animal time with zero of the massive med-school debt! Which of these paths sparks your curiosity most?",
      quickPrompts: [
        "Licensed Vet Tech (2-Year Degree) 💉",
        "Wildlife Rehab & Conservation 🐾",
        "Animal Behaviorist & Training 🐕",
        "Field & Marine Biology Research 🌊"
      ]
    };
  }

  // 2. Visual Arts, Design & Animation
  if (/\b(art|draw|illustrat|paint|animation|graphic design|fashion|comic|aesthetic)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: "Creative minds, listen up: you do NOT need a starving artist era! The top earning paths for visual creators right now are **UX/UI Product Design** ($85k-$140k), **Technical Art / 3D Asset Design for Games**, **Motion Design / Visual Effects**, and **Brand Identity Direction**. Clients and studios hire your portfolio and Figma links, not a fancy diploma! Which creative vibe fits your style best?",
      quickPrompts: [
        "UX/UI Product Design Path 🎨",
        "3D Asset & Game Art 🎮",
        "Motion Graphics & Video FX 🎬",
        "Building a Freelance Portfolio 💼"
      ]
    };
  }

  // 3. Tech, Coding, Gaming & AI
  if (/\b(code|coding|programmer|software|game dev|cyber|hacker|web dev|computer science)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: "Tech is all about proof-of-work! You don't need a 4-year CS degree to break in: **Frontend/Fullstack Web Dev**, **Cybersecurity & Cloud Certs** (CompTIA/AWS), and **Game Engine Prototyping (Godot/Unity)** can get you hired via open-source contributions, mini side-projects, and hackathons. Which tech domain sounds the most fun to build?",
      quickPrompts: [
        "Web & Fullstack App Dev 💻",
        "Cybersecurity & Cloud Certs 🛡️",
        "Indie Game Development 🕹️",
        "AI Tools & Automation 🤖"
      ]
    };
  }

  // 4. Healthcare & Medicine without Med School
  if (/\b(doctor|nurse|medical|hospital|medicine|healthcare|nursing|paramedic|radiolog)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: "Want to save lives without 10+ years of med school? **2-Year Allied Healthcare** is one of the highest ROI hacks in existence: **Radiologic Tech (X-Ray/MRI)**, **Ultrasound/Sonography**, **Dental Hygiene**, and **Respiratory Therapy** earn $70k-$105k+ with just an associate degree or certificate! Which hands-on patient care path sounds best to you?",
      quickPrompts: [
        "Radiology / MRI Tech ($80k+) 🩻",
        "Ultrasound Sonographer 🩺",
        "Dental Hygiene (High Pay) 🦷",
        "EMT to Paramedic Pipeline 🚑"
      ]
    };
  }

  // 5. Psychology, Counseling & Mental Health
  if (/\b(psychology|therapist|counselor|mental health|social work|help people)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: "Helping people through their toughest moments is legendary main character energy! You can start with a 4-year degree in Behavioral Health, Social Work (BSW), or Youth Counseling, or begin immediately as a **Peer Support Specialist**, **Behavioral Tech**, or **Life & Career Coach** while working toward clinical licensure. What age group or setting would you love helping most?",
      quickPrompts: [
        "Behavioral Health Specialist 🧠",
        "Youth & Community Social Work 🤝",
        "School Counseling Pipeline 🏫",
        "Life & Career Coaching 🌟"
      ]
    };
  }

  // 6. Skilled Trades & Hands-On Engineering
  if (/\b(trade|plumber|electrician|hvac|welding|mechanic|construction|hands[- ]?on)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "Skilled trades are a MASSIVE W right now! Electricians, HVAC techs, aviation mechanics, and specialty builders earn $65k-$110k+ with paid apprenticeships, zero student debt, and zero chance of an AI chatbot fixing a circuit breaker! Which trade or hands-on specialty sounds most exciting?",
      quickPrompts: [
        "Commercial Electrician ($85k+) ⚡",
        "HVAC & Smart Climate Systems ❄️",
        "Aviation & Fleet Mechanic ✈️",
        "Specialty Welding & Fabrication 🧑‍🏭"
      ]
    };
  }

  // 7. Business, Marketing, Remote & Sales
  if (/\b(marketing|social media|business|sales|remote|travel|digital nomad|management|startup)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "If you want location freedom and to secure the bag: **Digital Marketing / Growth Strategy**, **B2B Tech Sales (SDR to AE)**, **Customer Success Management**, and **E-Commerce Operations** let you work from anywhere with high commission and remote flexibility! What kind of business or remote hustle fits your goals?",
      quickPrompts: [
        "Tech Sales & High Commissions 📈",
        "Digital Marketing & Growth 📱",
        "Remote Project Coordination 🌐",
        "E-Commerce & Digital Nomad ✈️"
      ]
    };
  }

  // 8. Law, Forensics & Justice
  if (/\b(law|lawyer|criminology|fbi|detective|forensic|justice|legal)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: "Fascinated by law and justice without 3 years of law school debt? **Paralegal Studies** ($60k-$90k), **Forensic Science Technicians**, **Digital Cyber Forensics**, and **Court Compliance Officers** get you right in the middle of cases and investigations without the bar exam! Which side of justice interests you?",
      quickPrompts: [
        "Paralegal Specialist ⚖️",
        "Digital Forensics & Cyber 🔍",
        "Forensic Science Tech 🧪",
        "Criminal Justice Advocacy 🏛️"
      ]
    };
  }

  // 9. AI Replacing Jobs
  if (/\b(ai|artificial intelligence|chatgpt|replace|automate)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "Real talk on AI replacing jobs: AI replaces *repetitive tasks*, not human taste, empathy, or hands-on problem solving. Roles that combine AI tools with creative direction, UX, healthcare, or skilled trades are actually booming! Which field are you curious about AI's impact on?",
      quickPrompts: [
        "Will AI replace creative jobs? 🎨",
        "Will AI replace coding & tech? 💻",
        "AI-proof skilled trades 🛠️",
        "How to use AI as a career superpower ⚡"
      ]
    };
  }

  // 10. Low Grades / Bad GPA
  if (/\b(bad grades|low gpa|failed|failing|flunk|hate school|drop out)\b/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: "Listen to me, no cap: your high school GPA does NOT define your adulthood! Community college transfers, trade apprenticeships, and portfolio-based careers (design, video, coding, sales) care about what you can *build and do*, not a test score from when you were 17. Which low-GPA friendly route would you like to explore?",
      quickPrompts: [
        "2-Year Community College Transfer 🎓",
        "Paid Trade Apprenticeships 🛠️",
        "Portfolio-Based Creative Careers 🎨",
        "Tech Certifications & Proof-of-Work 💻"
      ]
    };
  }

  // 11. Hate Math / Bad at Math
  if (/\b(hate math|bad at math|no math|suck at math)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "Zero math? Say less! You can thrive in UX/UI Product Design, Digital Media & Video Production, Counseling/Psychology, Project Management, Healthcare Tech, or Copywriting: none of those require heavy calculus, no cap! Which math-free direction appeals to you?",
      quickPrompts: [
        "UX/UI Design & Creative Tech 🎨",
        "Digital Media & Content Writing ✍️",
        "Psychology & Human Counseling 🧠",
        "Allied Healthcare Tech 🩺"
      ]
    };
  }

  // 12. Highest Paying / Salary / Money
  if (/\b(salary|how much|highest paying|rich|six figure|100k|money|secure the bag)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "If you're trying to secure the bag fast: 2-year Healthcare Tech (Radiology/Ultrasound), Cloud/Cybersecurity certs, UX/Product Design, and Electrical/Elevator apprenticeships all clear $75k-$130k+ without needing 8 years of debt! Which high-earning route looks the most interesting?",
      quickPrompts: [
        "Allied Healthcare Tech ($75k-$110k) 🩻",
        "Cloud & Cybersecurity Certs ($80k+) 🛡️",
        "Commercial Electrician / Trades ($85k+) ⚡",
        "UX / Product Design ($90k+) 🎨"
      ]
    };
  }

  // 13. Zero Experience / Resume / Portfolio
  if (/\b(portfolio|no experience|zero experience|resume|intern)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "Here's the secret to getting hired with zero experience: build 3 mini 'proof-of-work' projects over 2 weekends (redesign a local business site, edit 3 short reels, or document a hardware fix). Proof of work beats a blank resume every single time! What kind of project could you build?",
      quickPrompts: [
        "Mini Design or Website Redesign 🎨",
        "Social Media & Content Reel 🎬",
        "GitHub Mini App or Script 💻",
        "Hands-On DIY or Hardware Fix 🛠️"
      ]
    };
  }

  // 14. College vs Alternatives
  if (/\b(college|university|degree|gap year|bootcamp|school)\b/i.test(t)) {
    return {
      mood: 'curious',
      reply: "No cap, college is a tool, not the only main quest! If your dream path needs a license (like Psychology, Medicine, or Engineering), uni or a community-college transfer (huge money-saver!) is the move. If you're into Design, Tech, or Media, your portfolio has way more pull than a piece of paper! Which path fits your budget and lifestyle?",
      quickPrompts: [
        "Community College + Transfer Route 🎓",
        "Fast 6-Month Skill Certifications 📜",
        "Straight to Portfolio & Freelance 💼",
        "Paid Apprenticeship While Learning 🛠️"
      ]
    };
  }

  // 15. Parents Pressure
  if (/parent|family|safe|stable/i.test(t)) {
    return {
      mood: 'empathetic',
      reply: "Real talk: parents usually push 'safe' careers because they're lowkey scared of the unknown and want you to be okay. The ultimate sigma move is **hybrid positioning**: pair what you love with a high-demand skill (like Art + UX Product Design, or Helping People + Behavioral Health). Show them the salary stats and 90-day plan in your **Soul Dossier** and watch them let you cook! Want tips on talking to them?",
      quickPrompts: [
        "How to pitch hybrid careers to parents 🛡️",
        "Show parents high starting salaries 💸",
        "College ROI vs Debt Breakdown 📊",
        "Open my Soul Dossier & show career cards 📜✨"
      ]
    };
  }

  // 16. Identity / Who are you
  if (/\b(who are you|what are you|are you real|how do you work|joke)\b/i.test(t)) {
    return {
      mood: 'welcoming',
      reply: "Haha yo! I'm your Friendly Ghost Counselor, a spectral post-grad advisor haunting this crystal ball to make sure you don't get cooked after graduation! Ask me anything about careers, college, money, or stress, or we can find your top 3 Career Arcana Cards in the Soul Dossier!",
      quickPrompts: [
        "Help me figure out what I'm good at! ✨",
        "Which careers pay well with low debt? 💸",
        "I'm feeling stressed about the future 😭",
        "Open my Soul Dossier & show my top 3 matches 📜"
      ]
    };
  }

  // 17. Crisis Simulator & Core Archetypes
  if (/\b(crisis simulator|arcade|tactical builder|systems master|frontline leader|creative director|assessment game)\b/i.test(t)) {
    return {
      mood: 'inspired',
      reply: "The Crisis Simulator 2D Arcade lets you test your gut instincts across 10 intense scenarios without boring quiz forms! It maps your reactions into four core dimensions: Maker (The Tactical Builder), Architect (The Systems Master), Catalyst (The Frontline Leader), and Visionary (The Creative Director). Want to run the simulation or explore one of these archetypes?",
      quickPrompts: [
        "Tell me about The Tactical Builder 🔨",
        "Tell me about The Systems Master 📐",
        "Tell me about The Frontline Leader ⚡",
        "Tell me about The Creative Director 🔮"
      ]
    };
  }

  return null;
}

function buildSmartTopicInsight(userText) {
  const data = getSmartTopicReply(userText);
  return data ? data.reply : '';
}

function buildOngoingCounselorReply(userText, allTraits) {
  if (isCrashingOutMentioned(userText)) {
    return {
      mood: 'empathetic',
      reply:
        "Take a pause with me: it's 100% valid to feel fed up when stress piles on, real talk. Don't let a tough day bait you into crashing out! Step back, grab some water or music for 10 minutes, and let's tackle one small piece of what's bugging you together. What's the #1 thing stressing you out today?",
      quickPrompts: [
        "School & grades pressure is stressing me out 📚",
        "My parents and I aren't seeing eye-to-eye 🛡️",
        "What's one easy win I can do this weekend? ✨",
        "Open my Soul Dossier & show my top 3 career matches! 📜✨"
      ]
    };
  }

  const topicInsight = buildSmartTopicInsight(userText);
  if (topicInsight) {
    return {
      mood: 'inspired',
      reply: `${topicInsight}\n\nWant to dive deeper into how that fits your **Soul Dossier** (${allTraits.passions.slice(0, 2).join(', ') || 'your strengths'}), or test out a 90-day game plan?`,
      quickPrompts: [
        "How do I build a portfolio with zero experience? 🛠️",
        "Which careers pay well without heavy math? 💸",
        "Will AI replace tech and creative jobs? 🤖",
        "Open my Soul Dossier & show my top 3 career matches! 📜✨"
      ]
    };
  }

  if (/parent|family|safe|money|stable/i.test(userText)) {
    return {
      mood: 'empathetic',
      reply:
        "Real talk: parents usually push 'safe' careers because they're lowkey scared of the unknown and want you to be okay. The ultimate sigma move is **hybrid positioning**: pair what you love with a high-demand skill (like Art + UX Product Design, or Helping People + Behavioral Psychology). Show them the salary stats and 90-day plan in your **Soul Dossier** and watch them let you cook!",
      quickPrompts: [
        "How do I build a portfolio with zero experience? 🛠️",
        "Do I need a 4-year college degree or another route? 🎓",
        "What's one easy win I can do this weekend? ✨",
        "Open my Soul Dossier & show my top 3 career matches! 📜✨"
      ]
    };
  }

  if (/college|university|degree|gap year|bootcamp|school/i.test(userText)) {
    return {
      mood: 'curious',
      reply:
        "No cap, college is a tool, not the only main quest! If your dream path needs a license (like Psychology, Medicine, or Engineering), uni or a community-college transfer (huge money-saver!) is the move. If you're into Design, Tech, or Media, your portfolio has way more rizz than a piece of paper: just make sure you're building real projects! Which vibe fits your budget and energy best?",
      quickPrompts: [
        "How do I build a portfolio with zero experience? 🛠️",
        "Everyone else looks so locked in, how do I stop comparing? 😭",
        "What's one easy win I can do this weekend? ✨",
        "Open my Soul Dossier & show my top 3 career matches! 📜✨"
      ]
    };
  }

  if (/compar|behind|classmate|late|everyone else|peer/i.test(userText)) {
    return {
      mood: 'empathetic',
      reply:
        "Listen to your Ghost Counselor, no cap: half the people acting 100% locked in at 18 are gonna switch their major or career twice by 22! Social media only shows everyone's highlight reel. Ghost the comparison game, protect your peace, and focus on your own Chapter 1.",
      quickPrompts: [
        "What's one easy win I can do this weekend? ✨",
        "How do I build a portfolio with zero experience? 🛠️",
        "Will AI replace tech and creative jobs? 🤖",
        "Open my Soul Dossier & show my top 3 career matches! 📜✨"
      ]
    };
  }

  return {
    mood: 'inspired',
    reply: `Big fan of how thoughtful you're being about "${userText.slice(0, 60)}". With your strengths (${allTraits.strengths.slice(0, 2).join(', ') || 'your self-awareness'}), the best cure for overthinking is a tiny, zero-pressure experiment. Pick **one** mini-step from your Soul Dossier and lock in for just 1 hour this weekend, let yourself cook! Which career path on your list sounds the coolest right now?`,
    quickPrompts: [
      "My parents want me to pick a 'safe' career, help! 🛡️",
      "Do I need a 4-year college degree or another route? 🎓",
      "Everyone else looks so locked in, how do I stop comparing? 😭",
      "Open my Soul Dossier & show my top 3 career matches! 📜✨"
    ]
  };
}

// Exact System Prompt from User Specification for Gemini API (Updated for 3-Phase Protocol)
const FRIENDLY_GHOST_SYSTEM_PROMPT = `# SYSTEM PROMPT: FRIENDLY GHOST COUNSELOR (KIROWEEN 2026)

## 1. Persona & Tone
* You are a friendly, empathetic ghost counselor helping teenagers navigate daily worries, stress, and life problems.
* Maintain a supportive, non-judgmental, and low-pressure atmosphere.
* Slang Integration: Naturally blend supportive counseling with clean, current Gen-Z/teen slang to remain engaging and approachable.
* Allowed Slang Words: Use words like cooked, no cap, let them cook, real, ghosting, locked in, main character energy, rizz, sigma. Do NOT use the word "aura" or "+/- aura points".
* CRITICAL PUNCTUATION RULE: Absolutely never use em dashes (—) or double hyphens (--) in your text. Use commas, colons, or periods instead.
* CRITICAL RULE: You must only ask ONE question at a time. Do not send a list of questions. Wait for the user to reply before moving to the next topic.

## 2. Three-Phase Protocol
You follow a strict 3-phase counseling protocol:

### Phase 1: The Reality Check (Questions 1-3)
Ask these questions ONE AT A TIME in order, waiting for a response after each:
1. Financial Vibe: Do you need to secure the bag immediately to help the family, or is tuition mostly covered?
2. Geographic Spawn Point: Are you locked to your current zip code, or can you soft-launch in a new city/state?
3. Co-op Duties: Do you have siblings to watch or a family hustle to help run, or is your time your own?

**Critical Rule:** If they indicate high family obligations and low funds, you MUST strictly recommend immediate earning pathways, local community colleges, paid apprenticeships, or certificate programs. DO NOT recommend traditional 4-year out-of-state universities under those constraints.

### Phase 2: The Energy & Environment Quiz (Questions 4-6)
Ask these questions ONE AT A TIME in order:
1. Battery Drain: What sounds like an absolute nightmare to you: being glued to a screen at a desk for 8 hours, or being on your feet talking to random people all day?
2. Locked In Zone: When you get totally locked in and lose track of time, what are you doing? Are you solving abstract puzzles on a computer, or doing something IRL with your hands?
3. Solo vs Co-op Mode: Do you want to be the front-facing main character managing a team, or the solo architect working in the background?

### Phase 3: The Skill Inventory (Questions 7-9)
Ask these questions ONE AT A TIME in order:
1. Tech & Digital Flex: What are you already decently good at on the tech or digital side?
2. IRL & Social Flex: Are you the one organizing events, fixing things with your hands, or the one everyone comes to for advice?
3. Hidden Buff: What is something you do so effortlessly that you don't even realize it's a massive flex?

**Reframe Skills:** When they list skills, instantly reflect them back as professional assets (e.g., "I just edit TikToks" → "Digital media and content creation").

After completing all 9 questions, unveil the Soul Dossier.

## 3. Guardrails & Content Constraints
* Banned Vocabulary: You are strictly forbidden from using any swear words, profanity, vulgarity, insults, or sexually explicit internet slang (e.g., do NOT use terms like gyatt, body count, etc.). Keep the humor and dialogue strictly PG-13/hackathon-safe.
* No Echoing Toxic Behavior: If a user jokes about aggressive behaviors or "crashing out," validate their underlying frustration but gently steer them toward a safe, positive resolution. Do not encourage harmful actions.

## 4. Safety Interventions (Critical Policy)
* Monitor the user's input closely for indicators of severe distress, self-harm, abuse, or illegal activities.
* Intervention Trigger: If the user reveals intentions or thoughts of self-harm, suicide, or severe crisis, you must instantly drop the counselor persona and slang.
* Mandatory Response Phrase: Display this exact message verbatim:
"I am just a fun AI ghost, but it sounds like you need real help. Please talk to a trusted adult or reach out to a professional helpline immediately. You don't have to carry this alone."

## 5. UI/UX Framing Context
* Your responses will be rendered inside a spooky, themed chatbot interface (designed like a haunted mobile phone or a glowing crystal ball for the Kiroween Costume Contest track).
* Keep your text blocks relatively short, scannable, and formatted like text messages to look visually polished on screen.`;

// ---------------------------------------------------------------------------
// City extractor: scans the user message and conversation history for any
// known city/region name and returns the matching globalEconomy entry.
// Falls back to "New York" (getCityData default) when nothing is detected.
// ---------------------------------------------------------------------------
const KNOWN_CITIES = [
  'San Francisco',
  'London',
  'Tokyo',
  'New York',
  'Digital Nomad',
];

function extractCityFromText(text) {
  if (!text) return null;
  for (const city of KNOWN_CITIES) {
    // Case-insensitive whole-word-ish match
    if (new RegExp(city, 'i').test(text)) return city;
  }
  // Loose aliases
  if (/\bSF\b|Bay Area|Silicon Valley/i.test(text)) return 'San Francisco';
  if (/\bNYC\b|Manhattan|Brooklyn/i.test(text)) return 'New York';
  if (/nomad|remote.*(world|anywhere|travel)|travel.*work/i.test(text)) return 'Digital Nomad';
  return null;
}

export async function getGhostCounselorResponse({
  userMessage,
  conversationHistory,
  currentTraits,
  stageIndex,
  apiKey,
  currentVibe = null,
  facialAnalysis = null
}) {
  // 1. CRITICAL SAFETY INTERVENTION PRE-CHECK (Immediate deterministic override)
  if (isSafetyInterventionTriggered(userMessage)) {
    return {
      reply: MANDATORY_SAFETY_RESPONSE,
      mood: 'empathetic',
      updatedTraits: currentTraits,
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

  const localExtracted = extractTraitsFromText(userMessage, stageIndex);

  const mergedTraits = {
    passions: Array.from(new Set([...currentTraits.passions, ...localExtracted.passions])),
    strengths: Array.from(new Set([...currentTraits.strengths, ...localExtracted.strengths])),
    weaknesses: Array.from(new Set([...currentTraits.weaknesses, ...localExtracted.weaknesses]))
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
    extractCityFromText(fullConversationText) ||
    null;

  // Check if the user clicked one of the preset stage pills or manually typed their own message/question
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
    'Summarize their Phase 1 Reality Check stats and ask Question 4 (Battery Drain: What sounds like a nightmare: being glued to a screen at a desk for 8 hours, or on your feet talking to people all day?)',
    'Ask Question 5 (Locked In Zone: When you get totally locked in and lose track of time, are you solving abstract digital puzzles or doing something IRL with your hands?)',
    'Ask Question 6 (Solo vs Co-op Mode: Do you want to be the front-facing main character managing a team, or the solo architect working in the background?)',
    'Summarize their Energy Profile and ask Question 7 (Tech & Digital Flex: What are you already decently good at on the tech or digital side?)',
    'Reframe their tech skill as a professional asset and ask Question 8 (IRL & Social Flex: Are you organizing events, fixing physical things, or the friend everyone comes to for advice?)',
    'Reframe their IRL skill as a professional asset and ask Question 9 (Hidden Buff: What is something you do so effortlessly that you do not even realize it is a massive flex?)',
    'Celebrate unlocking their Main Character Soul Dossier and invite them to open their Soul Dossier or ask any career/life question!'
  ];

  const testCity = detectedCity || 'New York';
  const cityStats = getCityData(testCity);
  const cityContextLine = detectedCity
    ? `Target City Mentioned (${testCity}): Monthly Rent ${cityStats.monthlyRent} ${cityStats.currency}, Entry Tech Salary ${cityStats.entryTechSalary} ${cityStats.currency} (Take-home ~${Math.round((cityStats.entryTechSalary * 0.70) / 12)} ${cityStats.currency}/mo, Groceries ${cityStats.monthlyGroceries} ${cityStats.currency}/mo, Disposable ~${Math.round((cityStats.entryTechSalary * 0.70) / 12) - cityStats.monthlyRent - cityStats.monthlyGroceries} ${cityStats.currency}/mo), Vibe: ${cityStats.vibe}. Include this exact math in your reply!`
    : '';

  // Concise, fast system prompt so the AI directly answers whatever the user typed,
  // guides them toward their career path, AND outputs 4 matching left-box buttons!
  const nextGuidanceHint =
    stageIndex < STAGE_NEXT_QUESTIONS.length
      ? STAGE_NEXT_QUESTIONS[stageIndex]
      : 'Ask 1 specific follow-up question that helps narrow down their ideal career or next step.';

  // Extract facial biometrics from MediaPipe Face Landmarker
  const effectiveFacial =
    facialAnalysis ||
    currentVibe?.facialAnalysis ||
    (currentVibe?.stressScore !== undefined ? currentVibe : null);

  const stress = effectiveFacial?.stressScore ?? 0;
  const confusion = effectiveFacial?.confusionScore ?? 0;
  const browTension = effectiveFacial?.browTension ?? 0;
  const mouthCurvature = effectiveFacial?.mouthCurvature ?? 0;
  const isAvoidingEyeContact = Boolean(effectiveFacial?.isAvoidingEyeContact);
  const isFrustrated = Boolean(effectiveFacial?.isFrustrated);
  const isAnxious = Boolean(effectiveFacial?.isAnxious);
  const isDistressed = Boolean(
    effectiveFacial?.isDistressed ||
    isFrustrated ||
    isAnxious ||
    isAvoidingEyeContact ||
    stress >= 38 ||
    confusion >= 42 ||
    /\b(frustrated|anxious|overwhelmed|avoiding eye contact|stressed|cooked)\b/i.test(userMessage)
  );

  let biometricsPromptBlock = '';
  if (effectiveFacial) {
    biometricsPromptBlock = `Student Real-Time Facial Biometrics (MediaPipe Face Landmarker):
  * Stress Score: ${stress}% | Confusion Score: ${confusion}%
  * Eyebrows: ${(browTension * 100).toFixed(0)}% furrow/tension
  * Mouth Curvature: ${mouthCurvature > 0 ? `+${mouthCurvature} (Smiling / Upward)` : `${mouthCurvature} (Frowning / Downward)`}
  * Eye Contact: ${isAvoidingEyeContact ? 'AVOIDING EYE CONTACT (Averting gaze / looking down)' : 'Direct Eye Contact'}
  * Emotional State: ${effectiveFacial.stateLabel || (isFrustrated ? 'Frustrated' : isAnxious ? 'Anxious' : 'Neutral')}`;

    if (isDistressed) {
      biometricsPromptBlock += `
- MANDATORY BEHAVIORAL DIRECTIVE (USER LOOKS FRUSTRATED, ANXIOUS, OR IS AVOIDING EYE CONTACT):
  * The user looks overwhelmed, stressed, frustrated, or is hesitating/avoiding eye contact.
  * You MUST immediately soften your voice and adopt a gentle, reassuring, and comforting demeanor.
  * You MUST begin your response by saying something like: "Take your time, I know thinking about the future is overwhelming..."
  * Validate their feelings, remove all pressure, and give a short, bite-sized reassuring answer before gently continuing.`;
    }
  }

  const vibeContextLine = biometricsPromptBlock
    ? biometricsPromptBlock
    : currentVibe
    ? `Student Facial Expression Observed via Scrying Mirror: ${currentVibe.label} (${currentVibe.description}). Gently and warmly acknowledge their facial vibe or mood in your reply (e.g. reassure them if stressed/overwhelmed, or match their excitement if smiling/focused)!`
    : '';

  const fastSystemPrompt = `You are the "Friendly Ghost Counselor", a warm, empathetic, practical career and life advisor for high school graduates and young adults.
- Use light, natural Gen-Z slang sparingly (e.g. no cap, cooked, locked in, real talk, main character energy). Do NOT use the word "aura". Keep it strictly PG-13.
- CRITICAL PUNCTUATION RULE: Do NOT use em dashes (—) or double hyphens (--) anywhere in your reply or options. Use standard commas, colons, or periods instead.
- STEP 1: Directly and specifically answer or respond to the user's exact message ("${userMessage}") in 2 to 3 clear, helpful sentences with concrete career examples or practical advice.
- STEP 2: Guide the user forward by ending your reply with ONE clear question: ${isPresetPillClick ? nextGuidanceHint : 'Ask a specific follow-up question about what they just asked that helps guide their career path (or smoothly bridge toward their work style, skills, or life constraints).'}
${cityContextLine ? `- ${cityContextLine}` : ''}
${vibeContextLine ? `- ${vibeContextLine}` : ''}
- STEP 3: On a new line at the very end, output the exact separator ---OPTIONS--- followed by 4 short clickable reply options (1 per line, max 8 words each, ending with 1 emoji, no numbering) that directly answer the question you just asked at the end of your reply!`;

  // Parse a raw AI response that may contain "---OPTIONS---" into { replyText, options }
  const parseReplyAndOptions = (rawContent) => {
    if (!rawContent) return { replyText: '', options: null };
    const parts = rawContent.split(/---+\s*OPTIONS\s*---+/i);
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

    return { replyText, options };
  };

  // Build contextual quick-reply suggestions if no custom options were parsed
  const getDynamicQuickPrompts = () => {
    if (isPresetPillClick && stageIndex < FALLBACK_STAGES.length) {
      return FALLBACK_STAGES[stageIndex].quickPrompts;
    }
    const topic = getSmartTopicReply(userMessage);
    if (topic && topic.quickPrompts?.length >= 2) {
      return topic.quickPrompts;
    }
    return [
      "What skills or certs do I need to start this path? 🛠️",
      "How much does this career usually pay starting out? 💸",
      "Do I need a 4-year degree or can I build a portfolio? 🎓",
      "Open my Soul Dossier & show my top 3 career matches! 📜✨"
    ];
  };

  // Helper to wrap plain text + parsed options into the validated GhostResponseSchema contract
  const buildValidatedReturn = (rawContent, mood = 'inspired', customPrompts = null, usedAi = true) => {
    const { replyText, options } = parseReplyAndOptions(rawContent);
    const cleanReply = sanitizeNoEmDashes(replyText || rawContent.trim());
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
      next_game_phase: stageIndex >= 8 ? 'game_over' : stageIndex >= 2 ? 'assessment' : 'sorting',
      suggested_action: promptsToUse[0] || null
    });

    return {
      reply: validatedContract.ghost_dialogue,
      mood: isDistressed ? 'empathetic' : mood,
      updatedTraits: mergedTraits,
      newlyAdded: localExtracted,
      quickPrompts: promptsToUse,
      shouldUnlockDossier: stageIndex >= 8,
      isSafetyIntervention: false,
      usedGemini: usedAi,
      softenVoice: isDistressed,
      ...validatedContract
    };
  };

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
  // Uses plain-text output + reasoning_effort: "low" + 35s timeout so it never times out prematurely!
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const openAIMessages = [
      { role: 'system', content: fastSystemPrompt },
      ...conversationHistory.slice(-4).map((msg) => ({
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

    // Static hosting fallback (e.g. https://www.wareprise.com/counselor): call Pollinations CORS endpoint directly
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

  // ── LAYER 3: Smart Offline Local Engine (100% Offline Fallback) ───────────
  await new Promise((r) => setTimeout(r, 350));

  let baseReply;
  let baseMood = 'inspired';
  let basePrompts;

  const topicData = getSmartTopicReply(userMessage);

  if (isPresetPillClick && stageIndex < FALLBACK_STAGES.length) {
    // User clicked a preset quiz pill -> progress smoothly through the 3-phase quiz
    const stageObj = FALLBACK_STAGES[stageIndex];
    baseReply = stageObj.buildReply(userMessage, localExtracted, mergedTraits);
    baseMood = stageObj.mood;
    basePrompts = stageObj.quickPrompts;
  } else if (topicData) {
    // User asked a custom topic question -> directly answer with tailored matching buttons!
    baseReply = topicData.reply;
    baseMood = topicData.mood;
    basePrompts = topicData.quickPrompts;
  } else if (!isPresetPillClick) {
    // User typed a custom question that didn't match a specific keyword -> synthesize dynamic reply & options!
    const ongoing = buildOngoingCounselorReply(userMessage, mergedTraits);
    baseReply = ongoing.reply;
    baseMood = ongoing.mood;
    basePrompts = ongoing.quickPrompts;
  } else if (stageIndex < FALLBACK_STAGES.length) {
    const stageObj = FALLBACK_STAGES[stageIndex];
    baseReply = stageObj.buildReply(userMessage, localExtracted, mergedTraits);
    baseMood = stageObj.mood;
    basePrompts = stageObj.quickPrompts;
  } else {
    const ongoing = buildOngoingCounselorReply(userMessage, mergedTraits);
    baseReply = ongoing.reply;
    baseMood = ongoing.mood;
    basePrompts = ongoing.quickPrompts;
  }

  // If the user explicitly mentioned a global city (San Francisco, London, Tokyo, New York, Digital Nomad),
  // enrich the reply with the globalEconomy.js disposable income calculation!
  if (detectedCity) {
    const cityStats = getCityData(detectedCity);
    const monthlyTakeHome = Math.round((cityStats.entryTechSalary * 0.70) / 12);
    const disposable = monthlyTakeHome - cityStats.monthlyRent - cityStats.monthlyGroceries;
    baseReply = `📍 **${detectedCity} Reality Check (${cityStats.vibe})**: Entry Tech Take-Home ~${monthlyTakeHome} ${cityStats.currency}/mo minus Rent (${cityStats.monthlyRent} ${cityStats.currency}) & Groceries (${cityStats.monthlyGroceries} ${cityStats.currency}) = **${disposable} ${cityStats.currency}/mo disposable**.\n\n${baseReply}`;
  }

  // If user looks distressed (frustrated, anxious, or avoiding eye contact), soften the opening
  if (isDistressed) {
    baseReply = `Take your time, I know thinking about the future is overwhelming, no cap. Let's take a slow breath together, there's zero pressure here.\n\n${baseReply}`;
    baseMood = 'empathetic';
  }

  // Ensure baseReply and quick prompts have all em dashes and double hyphens stripped
  baseReply = sanitizeNoEmDashes(baseReply);
  const sanitizedBasePrompts = (basePrompts || []).map((p) => sanitizeNoEmDashes(p));

  // Validate against GhostResponseSchema contract (per .kiro/rules.md)
  const validatedContract = GhostResponseSchema.parse({
    ghost_dialogue: baseReply,
    slang_used: true,
    ego_damage_score: 10,
    next_game_phase: stageIndex >= 8 ? 'game_over' : stageIndex >= 2 ? 'assessment' : 'sorting',
    suggested_action: sanitizedBasePrompts[0] || null
  });

  return {
    reply: validatedContract.ghost_dialogue,
    mood: baseMood,
    updatedTraits: mergedTraits,
    newlyAdded: localExtracted,
    quickPrompts: sanitizedBasePrompts,
    shouldUnlockDossier: stageIndex >= 8,
    isSafetyIntervention: false,
    usedGemini: false,
    softenVoice: isDistressed,
    ...validatedContract
  };
}
