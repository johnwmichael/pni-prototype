/*
  Partnership Dashboard — vanilla JS, mirrors the pattern from app.js
  (calibration): plain state object, delegated click listener, re-render
  on change. The only new piece is drawing the Trust Evolution line
  chart by hand as inline SVG (no charting library — see README).

  Chart color methodology: see the comment at the top of css/dashboard.css.
  The three series hues (--series-maya/devon/priya) are validated
  categorical slots (dataviz skill, scripts/validate_palette.js) against
  this app's own dark card surface — not hand-picked.
*/

const WEEKS = ["8wk ago", "7wk", "6wk", "5wk", "4wk", "3wk", "2wk", "This week"];

const SERIES = [
  { id: "maya", label: "Maya", color: "var(--series-maya)", data: [68, 72, 76, 80, 84, 86, 89, 91] },
  { id: "devon", label: "Devon", color: "var(--series-devon)", data: [60, 63, 67, 71, 76, 80, 85, 89] },
  { id: "priya", label: "Priya", color: "var(--series-priya)", data: [70, 74, 79, 83, 86, 89, 91, 93] },
];

const KPIS = [
  { value: "3", label: "Active partnerships" },
  { value: "24", label: "Insights shared across the network this month" },
  { value: "82%", label: "Suggestion acceptance rate" },
];

const INSIGHTS = [
  {
    icon: "M",
    body: "Maya's ROI-focused positioning from the DataPulse campaign was shared with Devon and Priya — now informing 2 other active projects.",
    meta: "2 hours ago",
  },
  {
    icon: "D",
    body: "Devon's research on PM-audience preferences (visual data over text, 3:1) was added to the shared knowledge base for the whole network.",
    meta: "Yesterday",
  },
  {
    icon: "P",
    body: "Priya's Tuesday 10am timing pattern was confirmed across 3 campaigns and promoted to a network-wide recommendation.",
    meta: "3 days ago",
  },
];

const QUALITY_METRICS = [
  { value: "82%", label: "Suggestion acceptance rate" },
  { value: "9%", label: "Override frequency" },
  { value: "88%", label: "Avg. decision confidence" },
  { value: "~14 hrs", label: "Time saved this month" },
];

const TRAIL = [
  { time: "09:15", agent: "M", body: "Suggested ROI-focused positioning strategy", conf: 89, action: "Applied", level: "high" },
  { time: "09:18", agent: "D", body: "Provided 3 supporting research sources", conf: 92, action: "Applied", level: "high" },
  { time: "09:22", agent: "P", body: "Recommended Tuesday 10am send time", conf: 74, action: "Reviewed", level: "medium" },
  { time: "10:03", agent: "M", body: "Flagged messaging conflict with earlier campaign", conf: 65, action: "Needs review", level: "medium" },
  { time: "10:41", agent: "D", body: "Updated Q1 statistic with newer data", conf: 95, action: "Applied", level: "high" },
];

const REVIEW_ACTIONS = [
  "Show AI Contributions",
  "Export Decision Rationale",
  "Generate Review Summary",
  "Confidence Report",
];

const state = {
  visible: { maya: true, devon: true, priya: true },
};

function levelClass(score) {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

// ---------- Chart ----------

const CHART_W = 760;
const CHART_H = 220;
const PAD_L = 34;
const PAD_R = 16;
const PAD_T = 12;
const PAD_B = 24;
const Y_MIN = 50;
const Y_MAX = 100;

function xFor(i) {
  const usable = CHART_W - PAD_L - PAD_R;
  return PAD_L + (usable * i) / (WEEKS.length - 1);
}
function yFor(v) {
  const usable = CHART_H - PAD_T - PAD_B;
  const t = (v - Y_MIN) / (Y_MAX - Y_MIN);
  return PAD_T + usable * (1 - t);
}

function renderChart() {
  const gridSteps = [50, 60, 70, 80, 90, 100];
  const gridlines = gridSteps
    .map((v) => {
      const y = yFor(v);
      return `
        <line class="chart-gridline" x1="${PAD_L}" y1="${y}" x2="${CHART_W - PAD_R}" y2="${y}"></line>
        <text class="chart-axis-label" x="${PAD_L - 8}" y="${y + 3}" text-anchor="end">${v}</text>
      `;
    })
    .join("");

  const xLabels = WEEKS.map((w, i) => {
    if (i % 2 !== 0 && i !== WEEKS.length - 1) return "";
    const x = xFor(i);
    const isFirst = i === 0;
    const isLast = i === WEEKS.length - 1;
    const anchor = isFirst ? "start" : isLast ? "end" : "middle";
    return `<text class="chart-axis-label" x="${x}" y="${CHART_H - 4}" text-anchor="${anchor}">${w}</text>`;
  }).join("");

  const lines = SERIES.map((s) => {
    if (!state.visible[s.id]) return "";
    const points = s.data.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");
    const dots = s.data
      .map((v, i) => {
        const x = xFor(i);
        const y = yFor(v);
        return `<circle cx="${x}" cy="${y}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2">
          <title>${s.label} — ${WEEKS[i]}: ${v}%</title>
        </circle>`;
      })
      .join("");
    return `
      <polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>
      ${dots}
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${CHART_W} ${CHART_H}" role="img" aria-label="Trust evolution for Maya, Devon, and Priya over the last 8 weeks">
      ${gridlines}
      ${xLabels}
      ${lines}
    </svg>
  `;
}

function renderLegend() {
  return SERIES.map((s) => {
    const isOn = state.visible[s.id];
    const current = s.data[s.data.length - 1];
    return `
      <button class="legend-item ${isOn ? "" : "is-off"}" data-action="toggle-series" data-series="${s.id}">
        <span class="swatch" style="background:${s.color}"></span>
        ${s.label} <span class="legend-value">${current}%</span>
      </button>
    `;
  }).join("");
}

// ---------- Static sections ----------

function renderKpiRow() {
  return KPIS.map(
    (k) => `
    <div class="kpi-tile">
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>
  `
  ).join("");
}

function renderInsights() {
  return INSIGHTS.map(
    (i) => `
    <div class="insight-row">
      <div class="insight-icon">${i.icon}</div>
      <div>
        <div class="insight-body">${i.body}</div>
        <div class="insight-meta">${i.meta}</div>
      </div>
    </div>
  `
  ).join("");
}

function renderQualityGrid() {
  return QUALITY_METRICS.map(
    (m) => `
    <div class="kpi-tile">
      <div class="kpi-value">${m.value}</div>
      <div class="kpi-label">${m.label}</div>
    </div>
  `
  ).join("");
}

function renderTrail() {
  return TRAIL.map(
    (t) => `
    <div class="trail-row">
      <span class="trail-time">${t.time}</span>
      <span class="trail-avatar">${t.agent}</span>
      <div class="trail-body">
        ${t.body}
        <div class="trail-conf">${t.conf}% confidence · ${t.action}</div>
      </div>
      <span class="trail-status ${t.level}">${t.level === "high" ? "High" : t.level === "medium" ? "Review" : "Low"}</span>
    </div>
  `
  ).join("");
}

function renderReviewActions() {
  return REVIEW_ACTIONS.map((label) => `<button class="btn btn-ghost" type="button">${label}</button>`).join("");
}

// ---------- Mount ----------

function render() {
  document.getElementById("kpi-row").innerHTML = renderKpiRow();
  document.getElementById("chart-legend").innerHTML = renderLegend();
  document.getElementById("chart-svg-wrap").innerHTML = renderChart();
  document.getElementById("insight-feed").innerHTML = renderInsights();
  document.getElementById("quality-grid").innerHTML = renderQualityGrid();
  document.getElementById("trail-list").innerHTML = renderTrail();
  document.getElementById("review-actions").innerHTML = renderReviewActions();
}

document.getElementById("dashboard-app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  if (el.dataset.action === "toggle-series") {
    const id = el.dataset.series;
    state.visible[id] = !state.visible[id];
    render();
  }
});

render();
