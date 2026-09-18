/*
  Content & reference data for the Partnership Calibration screen.

  Sourced from the project's own docs (not invented for the prototype):
  - TRUST-MECHANISM-IMPLEMENTATION.md → wizard questions, autonomy levels,
    per-agent auto-apply thresholds
  - SITE-ARCHITECTURE.md → agent roster, trust pill / dashboard format
  - PRD-v2.md → the four Collaborative AI capabilities this screen maps to

  Kept as plain data on purpose: when this ports into ai-partner-canvas,
  this file becomes the seed for a React context / store, and the render
  functions in app.js become components that read it via props.
*/

export const AGENTS = [
  {
    id: "maya",
    name: "Maya",
    role: "Strategy",
    initials: "M",
    blurb:
      "Aligns positioning, messaging, and campaign direction with your strategic goals.",
    responsibilities: [
      { id: "positioning", label: "Positioning & messaging recommendations", checked: true },
      { id: "strategic-review", label: "Strategic alignment checks on drafts", checked: true },
      { id: "brand-voice", label: "Brand voice calibration", checked: false },
      { id: "roadmap", label: "Campaign roadmap sequencing", checked: true },
    ],
  },
  {
    id: "devon",
    name: "Devon",
    role: "Research",
    initials: "D",
    blurb:
      "Surfaces market research, citations, and competitive context to back every claim.",
    responsibilities: [
      { id: "market-research", label: "Market & competitive research", checked: true },
      { id: "fact-check", label: "Fact-checking & source citation", checked: true },
      { id: "stat-verify", label: "Statistical claim verification", checked: true },
      { id: "trend-watch", label: "Ongoing trend monitoring", checked: false },
    ],
  },
  {
    id: "priya",
    name: "Priya",
    role: "Distribution",
    initials: "P",
    blurb:
      "Plans channel mix, timing, and distribution mechanics once content is ready.",
    responsibilities: [
      { id: "channel-plan", label: "Channel & format selection", checked: true },
      { id: "timing", label: "Send / publish timing recommendations", checked: true },
      { id: "performance", label: "Post-publish performance analysis", checked: false },
      { id: "repurpose", label: "Cross-channel repurposing suggestions", checked: true },
    ],
  },
];

// Four autonomy levels, identical shape for every agent per
// TRUST-MECHANISM-IMPLEMENTATION.md "Individual AI Agent Trust Levels".
// `threshold` text is agent-specific (their example thresholds), the rest
// of the copy is level-generic.
export const AUTONOMY_LEVELS = [
  {
    id: "high",
    label: "High Autonomy",
    trustScore: 90,
    describe: (agent) =>
      `Auto-apply ${agent.role.toLowerCase()} suggestions above ${agent.autoApplyThreshold}% confidence.`,
  },
  {
    id: "medium",
    label: "Medium Autonomy",
    trustScore: 74,
    describe: (agent) =>
      `Show suggestions, require your approval above ${agent.approvalThreshold}% confidence.`,
  },
  {
    id: "low",
    label: "Low Autonomy",
    trustScore: 55,
    describe: () => "Always ask permission before acting on a suggestion.",
  },
  {
    id: "advisory",
    label: "Advisory Only",
    trustScore: 35,
    describe: (agent) =>
      `${agent.name} provides input but never issues direct recommendations.`,
  },
];

// Per-agent threshold copy referenced by AUTONOMY_LEVELS.describe(agent)
export const AGENT_THRESHOLDS = {
  maya: { autoApplyThreshold: 80, approvalThreshold: 60 },
  devon: { autoApplyThreshold: 85, approvalThreshold: 70 },
  priya: { autoApplyThreshold: 82, approvalThreshold: 65 },
};

// Default starting autonomy per agent, matching the example in the docs.
export const DEFAULT_AUTONOMY = {
  maya: "high",
  devon: "medium",
  priya: "high",
};

// Trust Calibration Wizard — verbatim structure from
// TRUST-MECHANISM-IMPLEMENTATION.md "Trust Calibration Wizard".
export const WIZARD_QUESTIONS = [
  {
    id: "comfort",
    prompt: "How comfortable are you with AI writing suggestions?",
    capability: "Adaptive Human Collaboration",
    options: [
      { id: "very", label: "Very comfortable", desc: "Let the network move quickly and apply suggestions freely." },
      { id: "somewhat", label: "Somewhat comfortable", desc: "Suggest freely, but keep me in the loop on anything notable." },
      { id: "cautious", label: "Cautious", desc: "Show me suggestions before anything gets applied." },
      { id: "manual", label: "Prefer manual", desc: "I'll ask when I want AI input; don't surface it proactively." },
    ],
  },
  {
    id: "oversight",
    prompt: "What level of oversight do you prefer for strategic decisions?",
    capability: "Contextual Mode-Switching",
    options: [
      { id: "decide", label: "AI can decide", desc: "Execute mode: act on strategic calls within agreed guardrails." },
      { id: "options", label: "Show options", desc: "Explore mode: present a short list of strategic options to choose from." },
      { id: "ask", label: "Always ask", desc: "Escalate mode: nothing strategic moves without your explicit go-ahead." },
      { id: "advisory", label: "Advisory only", desc: "Strategic input is available on request, never pushed." },
    ],
  },
  {
    id: "explanation",
    prompt: "How important is detailed explanation for AI reasoning?",
    capability: "Metacognition",
    options: [
      { id: "essential", label: "Essential", desc: "Always show full reasoning, sources, and confidence breakdown." },
      { id: "helpful", label: "Helpful", desc: "Show a short rationale by default, full breakdown on request." },
      { id: "occasional", label: "Occasional", desc: "Only explain when confidence is low or a suggestion is unusual." },
      { id: "minimal", label: "Minimal", desc: "Keep the interface quiet; I'll ask 'why?' when I want it." },
    ],
  },
  {
    id: "mistakeHandling",
    prompt: "What happens when AI makes a mistake?",
    capability: "Uncertainty-Aware Action",
    options: [
      { id: "learn", label: "Learn from it", desc: "Log it, adjust future confidence scoring, keep moving." },
      { id: "reduce", label: "Reduce AI autonomy", desc: "Automatically lower autonomy for that agent in similar contexts." },
      { id: "review", label: "Manual review", desc: "Flag it for me to review before anything similar happens again." },
      { id: "disable", label: "Disable AI", desc: "Pause that agent entirely until I re-enable it." },
    ],
  },
];

export const JOURNEY_STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "calibration", label: "Partnership Calibration" },
  { id: "network", label: "Multi-AI Network Setup" },
  { id: "collaboration", label: "First Collaboration" },
  { id: "dashboard", label: "Partnership Dashboard" },
];

export const CALIBRATION_SUBSTEPS = [
  { id: "wizard", label: "Trust Calibration" },
  { id: "agents", label: "AI Autonomy Levels" },
  { id: "roles", label: "Role Definitions & Review" },
];
