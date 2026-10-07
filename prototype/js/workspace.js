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

// UI-level state only. Per-project work (Write draft, Design canvas, Code
// thread) lives on PROJECT — see workspace-project.js.
const state = {
  tab: "write", // write | design | code | analyze
  drawerOpen: false,
};

/*
  Preview drawer — an overlay from the right showing a read-only preview of
  the work-in-progress for the *currently selected* tab only (the drawer
  itself has no tabs; switching Write/Design/Code/Analyze in the page
  switches what the drawer previews). Content is mock data sourced from the
  same network findings as the activity feed (Devon's 3:1 visual-data
  finding, Priya's 3-part-series completion lift, Maya's ROI positioning).
*/

const TAB_META = {
  write: { eyebrow: "Write · in progress", title: "Article preview", status: "Live draft" },
  design: { eyebrow: "Design · in progress", title: "Visual brief preview", status: "Live canvas" },
  code: { eyebrow: "Code · in progress", title: "Embed snippet preview", status: "Live artifact" },
  analyze: { eyebrow: "Analyze · in progress", title: "Projected impact preview", status: "Estimates only" },
};

const WRITE_PLACEHOLDERS = [
  "ROI example — add a customer story",
  "Closing call to action",
];

const ANALYZE_METRICS = [
  { label: "Series completion rate", value: "+40%", source: "Priya · Distribution", tier: "high", note: "If split into a 3-part series" },
  { label: "Visual-over-text preference", value: "3:1", source: "Devon · Research", tier: "high", note: "PM / Growth-leader audience" },
  { label: "Positioning fit", value: "92%", source: "Maya · Strategy", tier: "high", note: "ROI-focused, approved for this phase" },
  { label: "LinkedIn cut-down fit", value: "74%", source: "Priya · Distribution", tier: "medium", note: "Partial pattern match" },
];

function readTime(words) {
  return Math.max(1, Math.round(words / 220));
}

function wordCount(el) {
  return el.textContent.trim().split(/\s+/).filter(Boolean).length;
}

function renderPredictive() {
  const el = document.getElementById("predictive-card");
  if (PROJECT.write.applied) {
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
  if (PROJECT.write.applied) {
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
    <div class="move-row ${PROJECT.write.openMove === i ? "is-open" : ""}">
      <div class="move-top">
        <div class="move-title">${m.title}</div>
        <div class="move-confidence">${m.confidence}%</div>
      </div>
      <div class="move-source">${m.source}</div>
      <button class="move-why-btn" data-action="toggle-why" data-index="${i}">
        ${PROJECT.write.openMove === i ? "Hide reasoning" : "Why? →"}
      </button>
      <div class="move-rationale">${m.rationale}</div>
    </div>
  `
  ).join("");
}

function renderTabs() {
  document.querySelectorAll("#tab-list .tab").forEach((btn) => {
    const active = btn.dataset.tab === state.tab;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
}

function drawerWritePreview() {
  const paras = PROJECT.write.applied ? [...DRAFT_INTRO, APPLIED_PARAGRAPH] : DRAFT_INTRO;
  const words = paras.join(" ").split(/\s+/).filter(Boolean).length;
  const placeholders = PROJECT.write.applied
    ? WRITE_PLACEHOLDERS
    : ["Competitive differentiation — waiting on Start Writing", ...WRITE_PLACEHOLDERS];
  const drafted = paras.length;
  const total = paras.length + placeholders.length;
  return {
    status: `<span>${words} words</span><span>~${readTime(words)} min read</span>`,
    body: `
      <article class="pv-article">
        <div class="pv-kicker">Blog · Product launch</div>
        <h3 class="pv-headline">DataPulse AI: one shared source of truth for your go-to-market team</h3>
        ${paras
          .map((p, i) => `<p class="${PROJECT.write.applied && i === paras.length - 1 ? "is-new" : ""}">${p}</p>`)
          .join("")}
        ${placeholders.map((t) => `<div class="pv-placeholder">${t}</div>`).join("")}
      </article>`,
    foot: `
      <div class="pv-progress-label">${drafted} of ${total} sections drafted</div>
      <div class="pv-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${drafted}">
        <span style="width:${Math.round((drafted / total) * 100)}%"></span>
      </div>`,
  };
}

function drawerDesignPreview() {
  return designPreview(); // live view of the Design canvas (js/workspace-design.js)
}

function drawerCodePreview() {
  return codePreview(); // live view of the Code artifact (js/workspace-code.js)
}

function drawerAnalyzePreview() {
  return {
    status: `<span>${ANALYZE_METRICS.length} signals</span><span>Network estimates</span>`,
    body: `
      <div class="pv-metrics">
        ${ANALYZE_METRICS.map(
          (m) => `
          <div class="pv-metric">
            <div class="pv-metric-top">
              <span class="pv-metric-label">${m.label}</span>
              <span class="pv-metric-value tier-${m.tier}">${m.value}</span>
            </div>
            <div class="pv-metric-meta">${m.note} · ${m.source}</div>
          </div>`
        ).join("")}
      </div>
      <p class="pv-note">These are predictions drawn from the network, not measured results. They firm up once the post is live.</p>`,
    foot: `<div class="pv-progress-label">Updates automatically as the draft changes</div>`,
  };
}

function renderDrawer() {
  const meta = TAB_META[state.tab];
  const builders = {
    write: drawerWritePreview,
    design: drawerDesignPreview,
    code: drawerCodePreview,
    analyze: drawerAnalyzePreview,
  };
  const pv = builders[state.tab]();
  document.getElementById("drawer-eyebrow").textContent = meta.eyebrow;
  document.getElementById("drawer-title").textContent = meta.title;
  document.getElementById("drawer-status").innerHTML =
    `<span class="pv-live"><span class="dot"></span>${meta.status}</span>${pv.status}`;
  document.getElementById("drawer-body").innerHTML = pv.body;
  document.getElementById("drawer-foot").innerHTML = pv.foot;
}

function setDrawer(open) {
  if (state.drawerOpen === open) return;
  state.drawerOpen = open;
  const drawer = document.getElementById("preview-drawer");
  const scrim = document.getElementById("drawer-scrim");
  const trigger = document.getElementById("preview-btn");
  drawer.classList.toggle("is-open", open);
  scrim.classList.toggle("is-open", open);
  document.body.classList.toggle("drawer-open", open);
  trigger.setAttribute("aria-expanded", String(open));
  if (open) {
    drawer.removeAttribute("inert");
    document.getElementById("drawer-close").focus();
  } else {
    drawer.setAttribute("inert", "");
    trigger.focus();
  }
}

function renderViews() {
  const design = state.tab === "design";
  document.getElementById("write-view").hidden = state.tab === "design" || state.tab === "code";
  document.getElementById("design-view").hidden = !design;
  document.getElementById("code-view").hidden = state.tab !== "code";
}

function render() {
  renderProjectHeader();
  renderTabs();
  renderViews();
  renderDesign();
  renderCode(false);
  renderPredictive();
  renderEditor();
  renderActivity();
  renderMoves();
  renderDrawer();
}

document.getElementById("workspace-app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "start-writing") {
    PROJECT.write.applied = true;
    render();
  }
  if (action === "toggle-why") {
    const i = Number(el.dataset.index);
    PROJECT.write.openMove = PROJECT.write.openMove === i ? null : i;
    render();
  }
  if (action === "set-tab") {
    state.tab = el.dataset.tab;
    render();
  }
  if (action === "toggle-drawer") setDrawer(!state.drawerOpen);
  if (action === "close-drawer") setDrawer(false);
  handleDesignAction(action, el); // Design tab actions (js/workspace-design.js)
  handleCodeAction(action, el); // Code tab actions (js/workspace-code.js)
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state.drawerOpen) setDrawer(false);
});

render();
