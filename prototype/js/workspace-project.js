/*
  Workspace · project model.

  Until now the Workspace was hardcoded to one project. This is the
  foundation for many: everything that belongs to "the work in progress" —
  the Write draft, the Design canvas, the Code thread — hangs off a single
  PROJECT object, and the header (title, context chips) renders from it.

  Today there is exactly one project and it is always the active one. The
  later "switch / create project" pass should make this a registry
  ({ [id]: project } + an activeProjectId) and turn the per-module aliases
  (`dstate` in workspace-design.js, `cstate` in workspace-code.js, and
  PROJECT.write here) into accessors on the active project, then re-render.

  Loaded first: workspace-design.js and workspace-code.js attach their own
  slices (PROJECT.design / PROJECT.code) when they load.
*/

const PROJECT = {
  id: "datapulse-launch",
  name: "DataPulse AI Launch",
  title: "DataPulse AI — Product Launch Blog Post",
  phase: "Week 6 / 12 · Pre-launch",
  audience: "PM / Growth leaders",
  userRole: "Marketing Manager",
  priorDecisions: 7,

  // Slices owned by each tab. Write lives here; the others attach on load.
  write: { applied: false, openMove: null },
  design: null, // set in workspace-design.js
  code: null, // set in workspace-code.js
};

function renderProjectHeader() {
  document.getElementById("project-title").textContent = PROJECT.title;
  document.getElementById("context-bar").innerHTML = `
    <span class="context-chip"><b>You:</b> ${escHTML(PROJECT.userRole)}</span>
    <span class="context-chip"><b>Project:</b> ${escHTML(PROJECT.name)}</span>
    <span class="context-chip"><b>Phase:</b> ${escHTML(PROJECT.phase)}</span>
    <span class="context-chip"><b>Audience:</b> ${escHTML(PROJECT.audience)}</span>
    <span class="context-chip is-accent">✨ Context loaded from ${PROJECT.priorDecisions} prior decisions</span>`;
}
