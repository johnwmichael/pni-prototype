/*
  Workspace (formerly "First Collaboration") — vanilla JS, same pattern as
  dashboard.js: plain data + a small state object + a delegated click
  listener + re-render. Renamed as part of the Learn & Set Up / Use split:
  this screen is the ongoing, everyday workspace, not a one-time step, so
  it no longer carries "first" in its name or a step-N-of-5 eyebrow.

  Content sourced from the project's own docs:
  - NETWORK-ACTIVITY-FUNCTIONALITY.md → the four contribution types (Maya/
    Devon/Priya/Content AI) and their example user actions
  - PREDICTIVE-LOGIC-DESIGN.md → the "ready to write" prediction, the
    confidence tiers behind the 86/92/74% suggested-move scores, and the
    "7 prior decisions" context-weighting language
*/

const DRAFT_INTRO = [
  "DataPulse AI turns scattered product analytics into a single, shared source of truth — the kind of dashboard your whole go-to-market team can act on without waiting for a data pull.",
  "For PM and growth leaders drowning in tool sprawl, that means fewer meetings spent reconciling numbers and more time spent deciding what to do next.",
];

const APPLIED_PARAGRAPH =
  "Where Amplitude asks teams to piece the story together across a dozen dashboards, DataPulse AI leads with the story itself — visual by default, because your own research shows PM and growth audiences prefer visual data over text by 3:1. That's not a dashboard-fatigue workaround; it's the product's starting point.";

const ACTIVITY = [
  {
    agent: "MAYA · STRATEGY",
    time: "Just now",
    body: "Strategic insight: consider emphasizing ROI benefits for this PM audience — aligns with Q3 positioning.",
    actions: ["Apply to Content", "Add to Brief"],
  },
  {
    agent: "DEVON · RESEARCH",
    time: "2m ago",
    body: "Research finding: target audience prefers visual data over text, 3:1 — consider an infographic for the mid-section.",
    actions: ["Add Citation", "Create Visual Brief"],
  },
  {
    agent: "PRIYA · DISTRIBUTION",
    time: "6m ago",
    body: "Distribution insight: break into a 3-part series — 40% higher completion rate expected.",
    actions: ["Create Series Plan", "Modify Current"],
  },
  {
    agent: "CONTENT AI",
    time: "11m ago",
    body: "Quality enhancement: add a customer example to illustrate the ROI calculation.",
    actions: ["Apply Suggestion", "Request Examples"],
  },
];

const MOVES = [
  {
    title: "Suggest competitive differentiation vs. Amplitude",
    source: "Research AI · via Devon",
    confidence: 86,
    rationale:
      "High confidence: Devon's interview synthesis and this section's topic closely match prior competitive-differentiation sections that performed well in this project.",
  },
  {
    title: "Pull ICP language from Maya's positioning doc",
    source: "Strategy AI · via Maya",
    confidence: 92,
    rationale:
      "High confidence: strong pattern match plus network consensus — Maya's positioning doc was approved for this exact audience and campaign phase.",
  },
  {
    title: "Outline a LinkedIn cut-down for Priya",
    source: "Distribution AI · via Priya",
    confidence: 74,
    rationale:
      "Medium confidence: a partial pattern match. The network hasn't seen this content type paired with a LinkedIn cut-down before, so it's surfaced as a suggestion rather than auto-applied.",
  },
];

const state = {
  applied: false,
  openMove: null,
};

function wordCount(el) {
  return el.textContent.trim().split(/\s+/).filter(Boolean).length;
}

function renderPredictive() {
  const el = document.getElementById("predictive-card");
  if (state.applied) {
    el.classList.add("is-applied");
    el.innerHTML = `
      <div class="predictive-head">
        <div class="predictive-icon">✓</div>
        <div>
          <div class="predictive-title">Applied to draft</div>
          <div class="predictive-subtitle">The competitive-differentiation paragraph was added below.</div>
        </div>
      </div>
      <div class="predictive-footer">
        <div class="predictive-sources">
          Sources:
          <span class="source-chip">Devon + Research AI</span>
          <span class="source-chip">Maya + Strategy AI</span>
        </div>
      </div>
    `;
    return;
  }
  el.classList.remove("is-applied");
  el.innerHTML = `
    <div class="predictive-head">
      <div class="predictive-icon">✨</div>
      <div>
        <div class="predictive-title">Ready to write</div>
        <div class="predictive-subtitle">AI has synthesized your next step</div>
      </div>
    </div>
    <div class="predictive-body">
      Write the competitive differentiation section. Anchor it to Devon's research finding
      that your target audience prefers visual data over text, 3:1, and Maya's approved
      ROI-focused positioning for the PM/Growth-leader audience.
    </div>
    <div class="predictive-footer">
      <div class="predictive-sources">
        Sources:
        <span class="source-chip">Devon + Research AI</span>
        <span class="source-chip">Maya + Strategy AI</span>
      </div>
      <button class="btn btn-primary" data-action="start-writing">Start Writing →</button>
    </div>
  `;
}

function renderEditor() {
  const surface = document.getElementById("editor-surface");
  const paras = [...DRAFT_INTRO];
  let appliedHtml = "";
  if (state.applied) {
    appliedHtml = `<p class="is-new">${APPLIED_PARAGRAPH}</p>`;
  }
  surface.innerHTML = paras.map((p) => `<p>${p}</p>`).join("") + appliedHtml;
  document.getElementById("word-count").textContent = `${wordCount(surface)} words`;
}

function renderActivity() {
  document.getElementById("activity-feed").innerHTML = ACTIVITY.map(
    (a) => `
    <div class="activity-row">
      <div class="activity-top">
        <span class="activity-agent">${a.agent}</span>
        <span class="activity-time">${a.time}</span>
      </div>
      <div class="activity-body">${a.body}</div>
      <div class="activity-actions">
        ${a.actions.map((label) => `<button class="btn btn-ghost" type="button">${label}</button>`).join("")}
      </div>
    </div>
  `
  ).join("");
}

function renderMoves() {
  document.getElementById("moves-list").innerHTML = MOVES.map(
    (m, i) => `
    <div class="move-row ${state.openMove === i ? "is-open" : ""}">
      <div class="move-top">
        <div class="move-title">${m.title}</div>
        <div class="move-confidence">${m.confidence}%</div>
      </div>
      <div class="move-source">${m.source}</div>
      <button class="move-why-btn" data-action="toggle-why" data-index="${i}">
        ${state.openMove === i ? "Hide reasoning" : "Why? →"}
      </button>
      <div class="move-rationale">${m.rationale}</div>
    </div>
  `
  ).join("");
}

function render() {
  renderPredictive();
  renderEditor();
  renderActivity();
  renderMoves();
}

document.getElementById("workspace-app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  if (el.dataset.action === "start-writing") {
    state.applied = true;
    render();
  }
  if (el.dataset.action === "toggle-why") {
    const i = Number(el.dataset.index);
    state.openMove = state.openMove === i ? null : i;
    render();
  }
});

render();
