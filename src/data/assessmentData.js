// 2D Arcade Career Assessment Game Data ("Crisis Simulator")
// Sourced from docs/assessment.txt with spectral enhancements

export const ASSESSMENT_SCENARIOS = [
  {
    id: 1,
    scenario: "The School Project Rescue: The night before a massive group project is due, everything is a mess. Your group is panicking. What is your immediate reaction?",
    zones: [
      { position: "top", text: "Physically build the prototype.", trait: "Maker", color: "#9B59B6" },
      { position: "right", text: "Fix the formatting & logic.", trait: "Architect", color: "#F1C40F" },
      { position: "bottom", text: "Calm everyone & present it.", trait: "Catalyst", color: "#E74C3C" },
      { position: "left", text: "Make the slides look amazing.", trait: "Visionary", color: "#3498DB" }
    ]
  },
  {
    id: 2,
    scenario: "The Food Truck Rush: A massive crowd shows up at your food truck. Orders are piling up fast. Where do you jump in?",
    zones: [
      { position: "left", text: "Get on the grill.", trait: "Maker", color: "#3498DB" },
      { position: "top", text: "Organize the order system.", trait: "Architect", color: "#E74C3C" },
      { position: "right", text: "Keep waiting customers happy.", trait: "Catalyst", color: "#9B59B6" },
      { position: "bottom", text: "Draw a cool Sold Out sign.", trait: "Visionary", color: "#F1C40F" }
    ]
  },
  {
    id: 3,
    scenario: "The E-Sports Tournament: Your community is hosting a gaming tournament. Which job do you want?",
    zones: [
      { position: "bottom", text: "Set up PCs & cables.", trait: "Maker", color: "#F1C40F" },
      { position: "left", text: "Manage brackets & scores.", trait: "Architect", color: "#9B59B6" },
      { position: "top", text: "Hype crowd & interview.", trait: "Catalyst", color: "#3498DB" },
      { position: "right", text: "Design logos & stream overlays.", trait: "Visionary", color: "#E74C3C" }
    ]
  },
  {
    id: 4,
    scenario: "The Broken Gadget: A friend drops an expensive drone and it breaks into pieces. How do you help?",
    zones: [
      { position: "right", text: "Try to physically piece it together.", trait: "Maker", color: "#E74C3C" },
      { position: "bottom", text: "Troubleshoot & find repair costs.", trait: "Architect", color: "#3498DB" },
      { position: "left", text: "Comfort your friend.", trait: "Catalyst", color: "#F1C40F" },
      { position: "top", text: "Edit a funny video about the disaster.", trait: "Visionary", color: "#9B59B6" }
    ]
  },
  {
    id: 5,
    scenario: "The Weekend Road Trip: You and your friends are taking a road trip. What is your main responsibility?",
    zones: [
      { position: "top", text: "Pack trunk & drive.", trait: "Maker", color: "#3498DB" },
      { position: "left", text: "Map route & calculate tolls.", trait: "Architect", color: "#F1C40F" },
      { position: "right", text: "Manage playlist & energy.", trait: "Catalyst", color: "#E74C3C" },
      { position: "bottom", text: "Plan stops for scenic photos.", trait: "Visionary", color: "#9B59B6" }
    ]
  },
  {
    id: 6,
    scenario: "The Zombie Apocalypse Survival: Your group finds an abandoned warehouse to use as a safe house. What is your first move?",
    zones: [
      { position: "bottom", text: "Board up doors & windows.", trait: "Maker", color: "#9B59B6" },
      { position: "right", text: "Count & ration the food.", trait: "Architect", color: "#E74C3C" },
      { position: "top", text: "Stop panicking & solve arguments.", trait: "Catalyst", color: "#F1C40F" },
      { position: "left", text: "Sketch a map of danger zones.", trait: "Visionary", color: "#3498DB" }
    ]
  },
  {
    id: 7,
    scenario: "The Pop-Up Market Stall: Your class is running a stall at a weekend street market. How do you contribute?",
    zones: [
      { position: "left", text: "Build the physical tent.", trait: "Maker", color: "#F1C40F" },
      { position: "top", text: "Handle pricing & track profits.", trait: "Architect", color: "#9B59B6" },
      { position: "bottom", text: "Pitch product to people walking by.", trait: "Catalyst", color: "#3498DB" },
      { position: "right", text: "Arrange the product display.", trait: "Visionary", color: "#E74C3C" }
    ]
  },
  {
    id: 8,
    scenario: "The Mystery Box Challenge: You get a box with duct tape, a battery, a buzzer, and wires. What do you do?",
    zones: [
      { position: "right", text: "Tape things to make a sound.", trait: "Maker", color: "#3498DB" },
      { position: "bottom", text: "Figure out circuit logic first.", trait: "Architect", color: "#F1C40F" },
      { position: "left", text: "Ask a friend to solve it together.", trait: "Catalyst", color: "#9B59B6" },
      { position: "top", text: "Sculpt something visually cool.", trait: "Visionary", color: "#E74C3C" }
    ]
  },
  {
    id: 9,
    scenario: "The Neighborhood Store Upgrade: A messy shop hires you to help modernize. Where do you start?",
    zones: [
      { position: "top", text: "Fix broken shelves & clean.", trait: "Maker", color: "#E74C3C" },
      { position: "right", text: "Type receipts into a spreadsheet.", trait: "Architect", color: "#3498DB" },
      { position: "bottom", text: "Greet regular customers.", trait: "Catalyst", color: "#9B59B6" },
      { position: "left", text: "Redo front window display.", trait: "Visionary", color: "#F1C40F" }
    ]
  },
  {
    id: 10,
    scenario: "The Escape Room: You are locked in an escape room and the clock is ticking. What is your role?",
    zones: [
      { position: "bottom", text: "Fiddle with locks & furniture.", trait: "Maker", color: "#F1C40F" },
      { position: "left", text: "Decode math & logic puzzles.", trait: "Architect", color: "#E74C3C" },
      { position: "right", text: "Keep team communicating.", trait: "Catalyst", color: "#3498DB" },
      { position: "top", text: "Look for visual clues & colors.", trait: "Visionary", color: "#9B59B6" }
    ]
  }
];

export const ARCHETYPE_PROFILES = {
  Maker: {
    key: "Maker",
    title: "The Tactical Builder",
    tagline: "Physical execution, rapid prototyping, and hands-on grit",
    description: "You thrive on physical execution, prototyping, and getting your hands dirty to solve immediate problems.",
    recommendedFields: "Engineering, Culinary, Hardware, Trades",
    recommendedPathwayCards: [
      { icon: "⚙️", name: "Engineering", trait: "Maker", subtitle: "Robotics, CAD & physical builds" },
      { icon: "🍳", name: "Culinary Arts", trait: "Maker", subtitle: "High-pace kitchen & food craft" },
      { icon: "🔌", name: "Hardware Tech", trait: "Maker", subtitle: "Circuits, drones & IoT devices" },
      { icon: "🛠️", name: "Skilled Trades", trait: "Maker", subtitle: "Hands-on fabrication & systems" }
    ],
    suggestedPassions: ["Hands-On Fabrication & Crafting", "Interactive Systems & Hardware"],
    suggestedStrengths: ["Rapid Physical Prototyping", "Direct Problem Solver Under Pressure"],
    color: "#E74C3C",
    badge: "🔨"
  },
  Architect: {
    key: "Architect",
    title: "The Systems Master",
    tagline: "Logical frameworks, structured data, and strategic order",
    description: "You excel at structuring chaos, analyzing data, and building logical frameworks.",
    recommendedFields: "Software Dev, Logistics, Data Analysis, Finance",
    recommendedPathwayCards: [
      { icon: "💻", name: "Software Dev", trait: "Architect", subtitle: "Apps, backend & automation" },
      { icon: "📦", name: "Logistics & Ops", trait: "Architect", subtitle: "Supply chain & routing systems" },
      { icon: "📊", name: "Data Analysis", trait: "Architect", subtitle: "Patterns, metrics & insights" },
      { icon: "📈", name: "Finance & Strategy", trait: "Architect", subtitle: "Budgets, models & planning" }
    ],
    suggestedPassions: ["Logic & Systems Architecture", "Analytics & Problem Solving"],
    suggestedStrengths: ["Locked-In Logic & Framework Design", "High-Focus Optimization"],
    color: "#3498DB",
    badge: "📐"
  },
  Catalyst: {
    key: "Catalyst",
    title: "The Frontline Leader",
    tagline: "Human connection, high empathy, and team alignment",
    description: "You are a natural at human interaction, empathy, and managing team dynamics under pressure.",
    recommendedFields: "Hospitality, Healthcare, Counseling, Sales",
    recommendedPathwayCards: [
      { icon: "🤝", name: "Hospitality & Events", trait: "Catalyst", subtitle: "Guest experience & live energy" },
      { icon: "🩺", name: "Healthcare", trait: "Catalyst", subtitle: "Frontline care & patient support" },
      { icon: "🧠", name: "Counseling", trait: "Catalyst", subtitle: "Empathy, wellness & guidance" },
      { icon: "🚀", name: "Sales & Community", trait: "Catalyst", subtitle: "Pitching, leadership & deals" }
    ],
    suggestedPassions: ["Human Connection & Community Impact", "Mentorship & Guidance"],
    suggestedStrengths: ["Deep Empathy & W Listener", "Natural Charisma & De-escalation"],
    color: "#F1C40F",
    badge: "⚡"
  },
  Visionary: {
    key: "Visionary",
    title: "The Creative Director",
    tagline: "Aesthetic vision, storytelling, and imaginative worldbuilding",
    description: "You focus on aesthetics, storytelling, and designing the bigger picture.",
    recommendedFields: "Digital Design, Marketing, Media, Arts",
    recommendedPathwayCards: [
      { icon: "🎨", name: "Digital & UI/UX", trait: "Visionary", subtitle: "Interfaces, 3D & visual systems" },
      { icon: "📣", name: "Creative Marketing", trait: "Visionary", subtitle: "Brand storytelling & campaigns" },
      { icon: "🎬", name: "Media & Content", trait: "Visionary", subtitle: "Video, streaming & direction" },
      { icon: "✨", name: "Visual & Concept Art", trait: "Visionary", subtitle: "Illustration, style & worlds" }
    ],
    suggestedPassions: ["Visual Arts & Aesthetic Design", "Narrative & Creative Direction"],
    suggestedStrengths: ["Main Character Creative Vision", "Visual Brand Identity"],
    color: "#9B59B6",
    badge: "🔮"
  }
};

/**
 * Calculates dominant archetype and handles ties by concatenating top two.
 * @param {Record<string, number>} traitScores - Counts for Maker, Architect, Catalyst, Visionary
 */
export function calculateArchetypeResult(traitScores) {
  const scores = {
    Maker: traitScores?.Maker || 0,
    Architect: traitScores?.Architect || 0,
    Catalyst: traitScores?.Catalyst || 0,
    Visionary: traitScores?.Visionary || 0
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topKey, topScore] = sorted[0];
  const [runnerKey, runnerScore] = sorted[1];

  const topProfile = ARCHETYPE_PROFILES[topKey];
  const runnerProfile = ARCHETYPE_PROFILES[runnerKey];

  const isTie = topScore > 0 && topScore === runnerScore;

  if (isTie) {
    return {
      dominantTrait: topKey,
      secondaryTrait: runnerKey,
      isTie: true,
      title: `${topProfile.title} / ${runnerProfile.title}`,
      tagline: `${topProfile.tagline}; ${runnerProfile.tagline}`,
      description: `${topProfile.description} Blended with ${runnerProfile.title.toLowerCase()} talents: ${runnerProfile.description}`,
      recommendedFields: `${topProfile.recommendedFields}, ${runnerProfile.recommendedFields}`,
      pathwayCards: [
        ...(topProfile.recommendedPathwayCards || []).slice(0, 2),
        ...(runnerProfile.recommendedPathwayCards || []).slice(0, 2)
      ],
      suggestedPassions: Array.from(new Set([...topProfile.suggestedPassions, ...runnerProfile.suggestedPassions])),
      suggestedStrengths: Array.from(new Set([...topProfile.suggestedStrengths, ...runnerProfile.suggestedStrengths])),
      scores,
      color: topProfile.color,
      badge: `${topProfile.badge}${runnerProfile.badge}`
    };
  }

  return {
    dominantTrait: topKey,
    secondaryTrait: runnerKey,
    isTie: false,
    title: topProfile.title,
    tagline: topProfile.tagline,
    description: topProfile.description,
    recommendedFields: topProfile.recommendedFields,
    pathwayCards: topProfile.recommendedPathwayCards || [],
    suggestedPassions: topProfile.suggestedPassions,
    suggestedStrengths: topProfile.suggestedStrengths,
    scores,
    color: topProfile.color,
    badge: topProfile.badge
  };
}
