import {
  AGENTS,
  AUTONOMY_LEVELS,
  AGENT_THRESHOLDS,
  DEFAULT_AUTONOMY,
  WIZARD_QUESTIONS,
  JOURNEY_STEPS,
  CALIBRATION_SUBSTEPS,
} from "./data.js";

/*
  Partnership Calibration prototype — vanilla JS, zero build step.

  Why vanilla JS: this sandbox's egress policy blocks the npm registry and
  every CDN, so a React/Vite/TanStack build couldn't be installed or
  verified here. The app below mirrors what a React version would look
  like function-for-function — each `render*` function is a component,
  `state` is what would be context/store state, and `dispatch` is what
  would be a reducer. Porting notes are in README.md at the project root.

  State lives only in memory (module scope), by design — no
  localStorage/sessionStorage, per prototype conventions.
*/

const state = {
  route: "calibration", // 'welcome' | 'calibration' | 'network' | 'collaboration' | 'dashboard'
  calibrationStep: 0, // 0: wizard, 1: agents, 2: roles & review
  wizardAnswers: {}, // { [questionId]: optionId }
  autonomy: { ...DEFAULT_AUTONOMY }, // { [agentId]: levelId }
  responsibilities: Object.fromEntries(
    AGENTS.map((a) => [a.id, Object.fromEntries(a.responsibilities.map((r) => [r.id, r.checked]))])
  ),
};

const root = document.getElementById("view");
const topnavStepper = document.getElementById("stepper");

function levelById(id) {
  return AUTONOMY_LEVELS.find((l) => l.id === id);
}

function agentWithThresholds(agent) {
  return { ...agent, ...AGENT_THRESHOLDS[agent.id] };
}

function trustClass(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

// ---------- Top-level journey stepper (always visible) ----------

function renderStepper() {
  const activeIndex = JOURNEY_STEPS.findIndex((s) => s.id === state.route);
  topnavStepper.innerHTML = JOURNEY_STEPS.map((step, i) => {
    const isActive = i === activeIndex;
    const isDone = i < activeIndex;
    return `
      ${i > 0 ? `<div class="stepper-sep"></div>` : ""}
      <button
        class="stepper-step ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}"
        data-action="goto-journey" data-route="${step.id}"
      >
        <span class="dot"></span>${step.label}
      </button>
    `;
  }).join("");
}

// ---------- Route: Welcome ----------

function renderWelcome() {
  return `
    <div class="page-header">
      <div class="eyebrow">Partnership Network Intelligence</div>
      <h1>Welcome to your AI partnership</h1>
      <p>
        PNI moves beyond individual AI productivity into team-level collaborative
        intelligence. Before your network goes to work, you'll calibrate how much
        autonomy each partner gets and how they should communicate uncertainty.
      </p>
    </div>
    <div class="card">
      <div class="card-title">What happens next</div>
      <div class="card-subtitle" style="margin-top: var(--space-3); line-height: 1.6;">
        1. Partnership Calibration — set trust, autonomy, and roles for Maya, Devon, and Priya.<br/>
        2. Multi-AI Network Setup — confirm how the three agents coordinate with each other.<br/>
        3. First Collaboration — run a live task through the calibrated network.<br/>
        4. Partnership Dashboard — track trust, confidence, and outcomes over time.
      </div>
      <div class="step-actions">
        <span></span>
        <button class="btn btn-primary" data-action="goto-journey" data-route="calibration">
          Begin Partnership Calibration
        </button>
      </div>
    </div>
  `;
}

// ---------- Route: Partnership Calibration ----------

function renderCalibrationSubsteps() {
  return `
    <div class="substeps">
      ${CALIBRATION_SUBSTEPS.map((s, i) => {
        const cls =
          i === state.calibrationStep ? "is-active" : i < state.calibrationStep ? "is-done" : "";
        return `
          <div class="substep ${cls}">
            <span class="num">${i + 1}</span>${s.label}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderWizardStep() {
  return WIZARD_QUESTIONS.map((q) => {
    const selected = state.wizardAnswers[q.id];
    return `
      <div class="card">
        <div class="section-label">${q.capability}</div>
        <div class="card-title" style="margin-bottom: var(--space-4);">${q.prompt}</div>
        <div class="choice-group">
          ${q.options
            .map(
              (opt) => `
            <button
              class="choice ${selected === opt.id ? "is-selected" : ""}"
              data-action="select-wizard" data-question="${q.id}" data-option="${opt.id}"
            >
              <span class="radio"></span>
              <span class="choice-body">
                <div class="choice-label">${opt.label}</div>
                <div class="choice-desc">${opt.desc}</div>
              </span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }).join("");
}

function renderAgentsStep() {
  return `
    <div class="hint" style="margin-bottom: var(--space-5);">
      Each partner's autonomy can be recalibrated any time from the Trust Dashboard —
      this just sets where they start.
    </div>
    <div class="agent-grid">
      ${AGENTS.map((agent) => {
        const full = agentWithThresholds(agent);
        const currentLevelId = state.autonomy[agent.id];
        const currentLevel = levelById(currentLevelId);
        return `
          <div class="agent-card">
            <div class="agent-head">
              <div class="agent-identity">
                <div class="agent-avatar">${agent.initials}</div>
                <div>
                  <div class="agent-name">${agent.name}</div>
                  <div class="agent-role">${agent.role}</div>
                </div>
              </div>
              <span class="trust-pill ${trustClass(currentLevel.trustScore)}">
                ${currentLevel.trustScore}% trust
              </span>
            </div>
            <p class="hint" style="margin-bottom: var(--space-4);">${agent.blurb}</p>
            <div class="choice-group">
              ${AUTONOMY_LEVELS.map(
                (level) => `
                <button
                  class="choice ${currentLevelId === level.id ? "is-selected" : ""}"
                  data-action="select-autonomy" data-agent="${agent.id}" data-level="${level.id}"
                >
                  <span class="radio"></span>
                  <span class="choice-body">
                    <div class="choice-label">${level.label}</div>
                    <div class="choice-desc">${level.describe(full)}</div>
                  </span>
                </button>
              `
              ).join("")}
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderRolesStep() {
  const overviewRows = AGENTS.map((agent) => {
    const level = levelById(state.autonomy[agent.id]);
    return { agent, score: level.trustScore };
  });
  const overallHealth = Math.round(
    overviewRows.reduce((sum, r) => sum + r.score, 0) / overviewRows.length
  );

  return `
    <div class="agent-grid">
      ${AGENTS.map(
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
          </div>
          <div class="section-label">Responsibilities in scope</div>
          <div class="check-list">
            ${agent.responsibilities
              .map((resp) => {
                const checked = state.responsibilities[agent.id][resp.id];
                return `
                <div
                  class="check-item ${checked ? "is-checked" : ""}"
                  data-action="toggle-responsibility" data-agent="${agent.id}" data-resp="${resp.id}"
                >
                  <span class="check-box"></span>
                  <span class="check-label">${resp.label}</span>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `
      ).join("")}
    </div>

    <div class="card">
      <div class="card-title">Partnership Trust Overview</div>
      <div class="card-subtitle">Live preview — recalculates as you calibrate above.</div>
      <div class="trust-overview" style="margin-top: var(--space-5);">
        <div class="trust-row">
          <span class="label">Overall health</span>
          <div class="trust-track"><div class="trust-fill" style="width:${overallHealth}%"></div></div>
          <span class="value">${overallHealth}%</span>
        </div>
        ${overviewRows
          .map(
            (r) => `
          <div class="trust-row">
            <span class="label">${r.agent.name} · ${r.agent.role}</span>
            <div class="trust-track"><div class="trust-fill" style="width:${r.score}%"></div></div>
            <span class="value">${r.score}%</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderCalibration() {
  const stepRenderers = [renderWizardStep, renderAgentsStep, renderRolesStep];
  const isLast = state.calibrationStep === CALIBRATION_SUBSTEPS.length - 1;
  const isFirst = state.calibrationStep === 0;

  return `
    <div class="page-header">
      <div class="eyebrow">Step 2 of 5 · Partnership Calibration</div>
      <h1>Calibrate your AI partnership network</h1>
      <p>
        Set trust, autonomy, and role scope for Maya, Devon, and Priya. These settings
        implement the four Collaborative AI capabilities — metacognition, contextual
        mode-switching, uncertainty-aware action, and adaptive human collaboration.
      </p>
    </div>

    ${renderCalibrationSubsteps()}

    ${stepRenderers[state.calibrationStep]()}

    <div class="step-actions">
      <button class="btn btn-ghost" data-action="calibration-back" ${isFirst ? "disabled" : ""}>
        Back
      </button>
      ${
        isLast
          ? `<button class="btn btn-primary" data-action="complete-calibration">
              Complete Calibration → Multi-AI Network Setup
            </button>`
          : `<button class="btn btn-primary" data-action="calibration-next">Continue</button>`
      }
    </div>
  `;
}

// ---------- Link-out cards for journey steps built as their own pages ----------

function renderJourneyLink({ title, description, href, cta }) {
  return `
    <div class="page-header">
      <h1>${title}</h1>
      <p>${description}</p>
    </div>
    <div class="card">
      <div class="card-title">Ready to view</div>
      <p class="hint" style="margin-top: var(--space-2);">
        This step is a separate page in the journey, so it lives on its own screen
        rather than inside this step-by-step flow.
      </p>
      <div class="step-actions">
        <button class="btn btn-ghost" data-action="goto-journey" data-route="calibration">
          ← Back to Partnership Calibration
        </button>
        <a class="btn btn-primary" href="${href}">${cta}</a>
      </div>
    </div>
  `;
}

function renderNetworkLink() {
  return renderJourneyLink({
    title: "Multi-AI Network Setup",
    description: "Meet Maya, Devon, Priya, and Content AI, and preview how the network surfaces cross-agent agreement.",
    href: "../network-setup/index.html",
    cta: "Open Multi-AI Network Setup →",
  });
}

function renderCollaborationLink() {
  return renderJourneyLink({
    title: "First Collaboration",
    description: "Run a live task through the calibrated network — a predictive next step, a shared draft, and the network working alongside you.",
    href: "../first-collaboration/index.html",
    cta: "Open First Collaboration →",
  });
}

function renderDashboardLink() {
  return renderJourneyLink({
    title: "Partnership Dashboard",
    description: "Trust evolution, network intelligence, collaboration quality, and the decision trail — built as its own page.",
    href: "../dashboard/index.html",
    cta: "Open Partnership Dashboard →",
  });
}

// ---------- Router ----------

function render() {
  renderStepper();
  switch (state.route) {
    case "welcome":
      root.innerHTML = renderWelcome();
      break;
    case "calibration":
      root.innerHTML = renderCalibration();
      break;
    case "network":
      root.innerHTML = renderNetworkLink();
      break;
    case "collaboration":
      root.innerHTML = renderCollaborationLink();
      break;
    case "dashboard":
      root.innerHTML = renderDashboardLink();
      break;
  }
}

// ---------- Event delegation ----------

document.getElementById("app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case "goto-journey":
      state.route = el.dataset.route;
      break;

    case "goto-substep":
      state.calibrationStep = Number(el.dataset.step);
      break;

    case "select-wizard":
      state.wizardAnswers[el.dataset.question] = el.dataset.option;
      break;

    case "select-autonomy":
      state.autonomy[el.dataset.agent] = el.dataset.level;
      break;

    case "toggle-responsibility": {
      const { agent, resp } = el.dataset;
      state.responsibilities[agent][resp] = !state.responsibilities[agent][resp];
      break;
    }

    case "calibration-next":
      state.calibrationStep = Math.min(
        state.calibrationStep + 1,
        CALIBRATION_SUBSTEPS.length - 1
      );
      break;

    case "calibration-back":
      state.calibrationStep = Math.max(state.calibrationStep - 1, 0);
      break;

    case "complete-calibration":
      state.route = "network";
      break;

    default:
      return;
  }
  render();
});

render();
