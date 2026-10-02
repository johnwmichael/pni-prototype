/*
  Network (Use app's ongoing tab) — the same agent roster as the
  onboarding Multi-AI Network Setup screen (js/network-setup.js), shown
  with settings framing instead of introductory framing since this is
  reached from the persistent app-nav, not the onboarding stepper.

  Intentionally duplicated rather than imported: this is a flat
  multi-file prototype with no shared module system across plain
  scripts. When this ports to React (see README.md), both screens should
  read from one AGENTS source instead of two copies.
*/

const AGENTS = [
  {
    id: "maya",
    name: "Maya",
    role: "Strategy",
    initials: "M",
    trust: 91,
    blurb: "Aligns positioning, messaging, and campaign direction with your strategic goals.",
    specializations: [
      "Positioning & messaging recommendations",
      "Strategic alignment checks on drafts",
      "Campaign roadmap sequencing",
    ],
  },
  {
    id: "devon",
    name: "Devon",
    role: "Research",
    initials: "D",
    trust: 89,
    blurb: "Surfaces market research, citations, and competitive context to back every claim.",
    specializations: [
      "Market & competitive research",
      "Fact-checking & source citation",
      "Statistical claim verification",
    ],
  },
  {
    id: "priya",
    name: "Priya",
    role: "Distribution",
    initials: "P",
    trust: 93,
    blurb: "Plans channel mix, timing, and distribution mechanics once content is ready.",
    specializations: [
      "Channel & format selection",
      "Send / publish timing recommendations",
      "Cross-channel repurposing suggestions",
    ],
  },
  {
    id: "content",
    name: "Content AI",
    role: "Writing & Editing",
    initials: "C",
    trust: 76,
    blurb: "Refines drafts for clarity, tone consistency, and completeness as the network's writing partner.",
    specializations: [
      "Writing enhancement & clarity suggestions",
      "Tone and brand-voice consistency checks",
      "Content gap identification (missing CTAs, examples)",
    ],
  },
];

function trustClass(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function renderAgentGrid() {
  return AGENTS.map(
    (agent) => `
    <div class="agent-card">
      <div class="agent-head">
        <div class="agent-identity">
          <div class="agent-avatar">${agent.initials}</div>
          <div>
            <div class="agent-name">${agent.name}</div>
            <div class="agent-role">${agent.role}</div>
          </div>
        </div>
        <span class="trust-pill ${trustClass(agent.trust)}">${agent.trust}% trust</span>
      </div>
      <p class="hint" style="margin-bottom: var(--space-4);">${agent.blurb}</p>
      <div class="section-label">Specializations</div>
      <div class="check-list specialization-list">
        ${agent.specializations
          .map(
            (label) => `
          <div class="check-item is-checked">
            <span class="check-box"></span>
            <span class="check-label">${label}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `
  ).join("");
}

document.getElementById("agent-grid").innerHTML = renderAgentGrid();
