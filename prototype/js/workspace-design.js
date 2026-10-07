/*
  Workspace · Design tab — a collaborative infographic-brief canvas.

  Where a single-user design tool is "you + one AI trading prompts," this is a
  shared canvas with several participants, each with a clear role:

  - The AI network (Devon, Maya, Priya, Content AI) pins suggestions to
    specific elements, each with a source, confidence score and a "Why?" —
    the same idiom as the Write tab's suggested moves. A human decides:
    Apply or Dismiss. Nothing changes silently.
  - Human teammates (Sam, Jordan) are shown as *simulated* presence — peer
    outlines, cursors, comment threads. The prototype is single-browser, so
    this is the intended experience, not real multiplayer.
  - Every change (manual edit, applied suggestion, undo) lands in a decision
    trail: who or what made it.

  Plain script, loaded before workspace.js: it shares workspace.js's global
  scope (state, renderDrawer) and exposes handleDesignAction() / renderDesign()
  / designPreview().
*/

function escHTML(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- Data ---------- */

function designDefault() {
  return {
    headline: { text: "One shared source of truth for your go-to-market team", size: "m" },
    stat: { value: "3:1", caption: "PM and growth audiences prefer visual data over text" },
    tiles: [
      { title: "One story", body: "Lead with the outcome, not a dozen dashboards." },
      { title: "Visual by default", body: "Charts and tiles first; supporting text second." },
      { title: "Decide faster", body: "One shared source of truth for the whole go-to-market team." },
    ],
    foot: { source: "Source: Devon + Research AI", chip: "" },
  };
}

// Suggestions anchored to canvas elements. `apply` mutates a design object.
const DESIGN_SUGGESTIONS = [
  {
    id: "s-devon",
    agent: "DEVON · RESEARCH",
    by: "Devon",
    target: "stat",
    source: "Research AI · via Devon",
    title: "State the finding precisely",
    confidence: 90,
    why: "High confidence: this is Devon's own interview finding, and a precise claim reads as more credible to a PM / Growth audience than a loose one.",
    change: "Caption → “PM and growth leaders prefer visual data over text, 3 to 1”",
    apply: (d) => { d.stat.caption = "PM and growth leaders prefer visual data over text, 3 to 1"; },
  },
  {
    id: "s-maya",
    agent: "MAYA · STRATEGY",
    by: "Maya",
    target: "headline",
    source: "Strategy AI · via Maya",
    title: "Lead with the ROI angle",
    confidence: 92,
    why: "High confidence: strong pattern match plus network consensus — Maya's ROI-focused positioning was approved for this audience and campaign phase.",
    change: "Headline → “Fewer dashboards, faster decisions”",
    apply: (d) => { d.headline.text = "Fewer dashboards, faster decisions"; },
  },
  {
    id: "s-priya",
    agent: "PRIYA · DISTRIBUTION",
    by: "Priya",
    target: "foot",
    source: "Distribution AI · via Priya",
    title: "Tag it as part of a 3-part series",
    confidence: 74,
    why: "Medium confidence: a partial pattern match. The network hasn't paired this content type with a series tag before, so it's surfaced as a suggestion rather than auto-applied.",
    change: "Adds a “Part 1 of 3” tag to the footer",
    apply: (d) => { d.foot.chip = "Part 1 of 3"; },
  },
  {
    id: "s-content",
    agent: "CONTENT AI",
    by: "Content AI",
    target: "tile-2",
    source: "Content AI",
    title: "Add a customer example",
    confidence: 81,
    why: "Medium-high confidence: ROI claims land better with a concrete example. This inserts a clearly marked placeholder — it needs a real customer figure from you before it ships.",
    change: "Tile 3 body → a bracketed placeholder for a real customer example",
    apply: (d) => { d.tiles[2].body = "[Customer example: weekly reporting time before vs. after]"; },
  },
];

// Simulated teammates (presence is mock — single-browser prototype).
const PEERS = [
  { name: "Sam Rivera", short: "Sam", initials: "SR", role: "Design Lead", color: "a", el: "headline", mode: "editing", cursor: { x: 84, y: 5 } },
  { name: "Jordan Lee", short: "Jordan", initials: "JL", role: "Growth", color: "b", el: "stat", mode: "viewing", cursor: { x: 78, y: 43 } },
];

function seedComments() {
  return [
    { id: "c1", target: "headline", author: "Sam Rivera", initials: "SR", role: "Design Lead", color: "a", time: "8m ago", text: "Can we keep this to one line on mobile?", resolved: false, replies: [] },
    { id: "c2", target: "stat", author: "Jordan Lee", initials: "JL", role: "Growth", color: "b", time: "3m ago", text: "Love leading with the stat. Do we have the source handy for legal?", resolved: false, replies: [] },
  ];
}

function seedTrail() {
  return [{ who: "You + Maya", text: "Created the brief from the Write tab's competitive-differentiation section", time: "12m ago" }];
}

function freshSugStatus() {
  const s = {};
  DESIGN_SUGGESTIONS.forEach((x) => { s[x.id] = "open"; });
  return s;
}

const dstate = (PROJECT.design = {
  d: designDefault(),
  sug: freshSugStatus(),
  comments: seedComments(),
  trail: seedTrail(),
  history: [],
  selected: null,
  panel: "ai", // ai | comments | trail
  openWhy: null,
  focusItem: null,
  editSnap: null,
});

/* ---------- Helpers ---------- */

function elLabel(id) {
  if (id === "headline") return "Headline";
  if (id === "stat") return "Hero stat";
  if (id === "foot") return "Footer";
  if (id && id.startsWith("tile-")) return `Tile ${Number(id.split("-")[1]) + 1}`;
  return "";
}

function snap() {
  return JSON.stringify({ d: dstate.d, sug: dstate.sug });
}

function pushHistory(s) {
  dstate.history.push(s || snap());
  if (dstate.history.length > 50) dstate.history.shift();
}

function logTrail(who, text) {
  dstate.trail.unshift({ who, text, time: "Just now" });
}

function setField(path, value) {
  const parts = path.split(".");
  let o = dstate.d;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = value;
}

function suggestionsFor(elId) {
  return DESIGN_SUGGESTIONS.filter((s) => s.target === elId && dstate.sug[s.id] === "open");
}

function commentsFor(elId) {
  return dstate.comments.filter((c) => c.target === elId && !c.resolved);
}

/* ---------- Artboard (shared by canvas + drawer preview) ---------- */

function pinsHTML(id) {
  const ai = suggestionsFor(id)
    .map((s) => {
      const n = DESIGN_SUGGESTIONS.indexOf(s) + 1;
      return `<button class="pin pin-ai" type="button" data-action="pin-ai" data-id="${s.id}" aria-label="AI suggestion ${n} from ${escHTML(s.by)} on ${elLabel(id)}">${n}</button>`;
    })
    .join("");
  const cm = commentsFor(id);
  const cmPin = cm.length
    ? `<button class="pin pin-cm" type="button" data-action="pin-comment" data-id="${cm[0].id}" aria-label="${cm.length} open comment${cm.length > 1 ? "s" : ""} on ${elLabel(id)}">${cm.length}</button>`
    : "";
  return ai || cmPin ? `<span class="pins">${ai}${cmPin}</span>` : "";
}

function artEl(id, cls, inner, interactive) {
  if (!interactive) return `<div class="art-el ${cls}">${inner}</div>`;
  const peer = PEERS.find((p) => p.el === id);
  const peerAttrs = peer ? ` data-peer="${peer.short} · ${peer.mode}" style="--peer: var(--peer-${peer.color})"` : "";
  const sel = dstate.selected === id ? " is-selected" : "";
  return `<div class="art-el ${cls}${sel}" role="group" tabindex="0" data-action="design-select" data-el="${id}" aria-label="${elLabel(id)} — press Enter to edit"${peerAttrs}>${inner}${pinsHTML(id)}</div>`;
}

function artboardHTML(interactive) {
  const d = dstate.d;
  const tiles = d.tiles
    .map((t, i) =>
      artEl(
        `tile-${i}`,
        "art-tile",
        `<div class="art-tile-icon"></div>
         <div class="art-tile-title">${escHTML(t.title)}</div>
         <div class="art-tile-body ${t.body.startsWith("[") ? "is-placeholder" : ""}">${escHTML(t.body)}</div>`,
        interactive
      )
    )
    .join("");
  const chip = d.foot.chip ? `<span class="art-chip">${escHTML(d.foot.chip)}</span>` : "";
  return `
    <div class="art ${interactive ? "art--live" : "art--mini"}" ${interactive ? 'data-action="design-clear"' : ""}>
      ${artEl("headline", `art-headline size-${d.headline.size}`, escHTML(d.headline.text), interactive)}
      ${artEl(
        "stat",
        "art-stat",
        `<div class="art-stat-num">${escHTML(d.stat.value)}</div><div class="art-stat-cap">${escHTML(d.stat.caption)}</div>`,
        interactive
      )}
      <div class="art-tiles">${tiles}</div>
      ${artEl("foot", "art-foot", `<span class="art-source">${escHTML(d.foot.source)}</span>${chip}`, interactive)}
    </div>`;
}

function cursorsHTML() {
  return PEERS.map(
    (p) => `
    <div class="peer-cursor peer-cursor--${p.color}" style="left:${p.cursor.x}%; top:${p.cursor.y}%; --peer: var(--peer-${p.color})" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 1l11 5.2-4.6 1.4L6.9 12.5z" fill="currentColor"/></svg>
      <span>${p.short}</span>
    </div>`
  ).join("");
}

/* ---------- Render: toolbar, canvas, panel ---------- */

function renderDesignToolbar() {
  document.getElementById("design-toolbar").innerHTML = `
    <div class="dz-title"><b>Infographic brief</b><span>Mid-section · DataPulse AI launch post</span></div>
    <div class="dz-right">
      <div class="presence" role="group" aria-label="Collaborators here now">
        <span class="avatar avatar--you" title="You (John Michael)">JM</span>
        ${PEERS.map((p) => `<span class="avatar" style="--peer: var(--peer-${p.color})" title="${p.name} · ${p.role}">${p.initials}</span>`).join("")}
        <span class="presence-note">3 here · AI network watching</span>
      </div>
      <button class="btn btn-sm" type="button" data-action="design-undo" ${dstate.history.length ? "" : "disabled"}>Undo</button>
      <button class="btn btn-ghost btn-sm" type="button" data-action="design-reset">Reset</button>
    </div>`;
}

function renderDesignCanvas() {
  document.getElementById("design-canvas").innerHTML = `
    <div class="art-wrap" data-action="design-clear">
      ${artboardHTML(true)}
      ${cursorsHTML()}
    </div>`;
}

function fieldRow(label, path, value, kind) {
  const v = escHTML(value);
  const control =
    kind === "textarea"
      ? `<textarea rows="2" data-field="${path}">${v}</textarea>`
      : `<input type="text" data-field="${path}" value="${v}" />`;
  return `<label class="dz-field"><span>${label}</span>${control}</label>`;
}

function propsHTML() {
  const sel = dstate.selected;
  if (!sel) {
    return `<div class="sidebar-card"><p class="network-note">Select an element on the canvas to edit it.
      <b>Numbered purple pins</b> are AI suggestions; <b>speech-bubble pins</b> are teammate comments.</p></div>`;
  }
  const d = dstate.d;
  let fields = "";
  if (sel === "headline") {
    fields =
      fieldRow("Text", "headline.text", d.headline.text, "textarea") +
      `<div class="dz-field"><span>Size</span><div class="seg" role="group" aria-label="Headline size">
        ${["s", "m", "l"].map((z) => `<button type="button" class="seg-btn ${d.headline.size === z ? "is-active" : ""}" data-action="set-size" data-size="${z}" aria-pressed="${d.headline.size === z}">${z.toUpperCase()}</button>`).join("")}
      </div></div>`;
  } else if (sel === "stat") {
    fields = fieldRow("Stat", "stat.value", d.stat.value) + fieldRow("Caption", "stat.caption", d.stat.caption, "textarea");
  } else if (sel === "foot") {
    fields = fieldRow("Source line", "foot.source", d.foot.source) + fieldRow("Series tag (optional)", "foot.chip", d.foot.chip);
  } else if (sel.startsWith("tile-")) {
    const i = Number(sel.split("-")[1]);
    fields = fieldRow("Title", `tiles.${i}.title`, d.tiles[i].title) + fieldRow("Body", `tiles.${i}.body`, d.tiles[i].body, "textarea");
  }
  return `
    <div class="sidebar-card">
      <div class="sidebar-head"><h3>Editing · ${elLabel(sel)}</h3>
        <button class="move-why-btn" type="button" data-action="design-clear">Done</button></div>
      <div class="dz-fields">${fields}</div>
    </div>`;
}

function suggestionsHTML() {
  return DESIGN_SUGGESTIONS.map((s, i) => {
    const st = dstate.sug[s.id];
    const why = dstate.openWhy === s.id;
    let actions;
    if (st === "open") {
      actions = `<button class="btn btn-primary btn-sm" type="button" data-action="sug-apply" data-id="${s.id}">Apply</button>
                 <button class="btn btn-ghost btn-sm" type="button" data-action="sug-dismiss" data-id="${s.id}">Dismiss</button>`;
    } else if (st === "applied") {
      actions = `<span class="dz-state dz-state--applied">✓ Applied</span>`;
    } else {
      actions = `<span class="dz-state">Dismissed</span>
                 <button class="btn btn-ghost btn-sm" type="button" data-action="sug-restore" data-id="${s.id}">Restore</button>`;
    }
    return `
      <div class="move-row dz-sug ${why ? "is-open" : ""} ${dstate.focusItem === s.id ? "is-focus" : ""} is-${st}" id="sug-${s.id}">
        <div class="move-top">
          <div class="dz-sug-head"><span class="dz-pin-num">${i + 1}</span><span class="activity-agent">${s.agent}</span></div>
          <div class="move-confidence">${s.confidence}%</div>
        </div>
        <div class="move-title" style="margin-top:8px">${s.title}</div>
        <div class="move-source">On ${elLabel(s.target)} · ${s.source}</div>
        <div class="dz-change">${escHTML(s.change)}</div>
        <div class="dz-actions">${actions}</div>
        <button class="move-why-btn" type="button" data-action="sug-why" data-id="${s.id}">${why ? "Hide reasoning" : "Why? →"}</button>
        <div class="move-rationale">${s.why}</div>
      </div>`;
  }).join("");
}

function commentsHTML() {
  return dstate.comments
    .map(
      (c) => `
    <div class="dz-comment ${c.resolved ? "is-resolved" : ""} ${dstate.focusItem === c.id ? "is-focus" : ""}" id="cm-${c.id}">
      <div class="dz-comment-top">
        <span class="avatar avatar--sm" style="--peer: var(--peer-${c.color})">${c.initials}</span>
        <b>${escHTML(c.author)}</b><span class="dz-role">${escHTML(c.role)}</span>
        <span class="activity-time">${escHTML(c.time)}</span>
      </div>
      <div class="move-source">On ${elLabel(c.target)}</div>
      <p class="dz-comment-text">${escHTML(c.text)}</p>
      ${c.replies.map((r) => `<div class="dz-reply"><b>${escHTML(r.author)}</b> ${escHTML(r.text)}</div>`).join("")}
      <div class="dz-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-action="comment-resolve" data-id="${c.id}">${c.resolved ? "Reopen" : "Resolve"}</button>
      </div>
      ${
        c.resolved
          ? ""
          : `<div class="dz-reply-row"><input type="text" data-reply="${c.id}" placeholder="Reply…" aria-label="Reply to ${escHTML(c.author)}" />
             <button class="btn btn-sm" type="button" data-action="comment-reply" data-id="${c.id}">Send</button></div>`
      }
    </div>`
    )
    .join("");
}

function trailHTML() {
  return dstate.trail
    .map(
      (t) => `
    <div class="dz-trail-row">
      <div class="dz-trail-top"><b>${escHTML(t.who)}</b><span class="activity-time">${escHTML(t.time)}</span></div>
      <div class="dz-trail-text">${escHTML(t.text)}</div>
    </div>`
    )
    .join("");
}

function renderDesignPanel() {
  const openSug = Object.values(dstate.sug).filter((s) => s === "open").length;
  const openCm = dstate.comments.filter((c) => !c.resolved).length;
  const tabs = [
    ["ai", `Suggestions${openSug ? ` · ${openSug}` : ""}`],
    ["comments", `Comments${openCm ? ` · ${openCm}` : ""}`],
    ["trail", "Trail"],
  ];
  const body = dstate.panel === "ai" ? suggestionsHTML() : dstate.panel === "comments" ? commentsHTML() : trailHTML();
  document.getElementById("design-panel").innerHTML = `
    ${propsHTML()}
    <div class="sidebar-card" style="margin-top:var(--space-4)">
      <div class="seg seg--wide" role="tablist" aria-label="Collaboration panel">
        ${tabs.map(([id, label]) => `<button type="button" role="tab" aria-selected="${dstate.panel === id}" class="seg-btn ${dstate.panel === id ? "is-active" : ""}" data-action="set-dpanel" data-panel="${id}">${label}</button>`).join("")}
      </div>
      <div class="dz-list" style="margin-top:var(--space-3)">${body}</div>
    </div>`;
}

function renderDesign() {
  renderDesignToolbar();
  renderDesignCanvas();
  renderDesignPanel();
}

/* ---------- Drawer preview (live view of the same state) ---------- */

function designPreview() {
  const applied = Object.values(dstate.sug).filter((s) => s === "applied").length;
  const openCm = dstate.comments.filter((c) => !c.resolved).length;
  return {
    status: `<span>${applied} of ${DESIGN_SUGGESTIONS.length} suggestions applied</span><span>${openCm} open comment${openCm === 1 ? "" : "s"}</span>`,
    body: `
      <div class="art-mini-wrap">${artboardHTML(false)}</div>
      <p class="pv-note">A live read-only view of the brief on the canvas — manual edits and applied suggestions appear here as they happen.</p>`,
    foot: `<div class="pv-progress-label">Collaborating with Sam, Jordan, Devon, Maya, Priya and Content AI</div>`,
  };
}

/* ---------- Actions ---------- */

function selectEl(id) {
  dstate.selected = id;
  dstate.focusItem = null;
}

function afterChange() {
  renderDesign();
  renderDrawer();
}

function focusPanelItem(prefix, id) {
  const node = document.getElementById(`${prefix}-${id}`);
  if (node) node.scrollIntoView({ block: "nearest" });
}

function handleDesignAction(action, el) {
  switch (action) {
    case "design-select":
      selectEl(el.dataset.el);
      renderDesign();
      return true;
    case "design-clear":
      if (!dstate.selected) return true;
      dstate.selected = null;
      renderDesign();
      return true;
    case "set-dpanel":
      dstate.panel = el.dataset.panel;
      renderDesignPanel();
      return true;
    case "pin-ai": {
      const s = DESIGN_SUGGESTIONS.find((x) => x.id === el.dataset.id);
      dstate.selected = s.target;
      dstate.panel = "ai";
      dstate.focusItem = s.id;
      renderDesign();
      focusPanelItem("sug", s.id);
      return true;
    }
    case "pin-comment": {
      const c = dstate.comments.find((x) => x.id === el.dataset.id);
      dstate.selected = c.target;
      dstate.panel = "comments";
      dstate.focusItem = c.id;
      renderDesign();
      focusPanelItem("cm", c.id);
      return true;
    }
    case "sug-why":
      dstate.openWhy = dstate.openWhy === el.dataset.id ? null : el.dataset.id;
      renderDesignPanel();
      return true;
    case "sug-apply": {
      const s = DESIGN_SUGGESTIONS.find((x) => x.id === el.dataset.id);
      pushHistory();
      s.apply(dstate.d);
      dstate.sug[s.id] = "applied";
      logTrail(`You + ${s.by}`, `Applied ${s.by}'s suggestion — ${s.change}`);
      dstate.selected = s.target;
      dstate.focusItem = null;
      afterChange();
      return true;
    }
    case "sug-dismiss": {
      const s = DESIGN_SUGGESTIONS.find((x) => x.id === el.dataset.id);
      pushHistory();
      dstate.sug[s.id] = "dismissed";
      logTrail("You", `Dismissed ${s.by}'s suggestion — ${s.title}`);
      afterChange();
      return true;
    }
    case "sug-restore": {
      const s = DESIGN_SUGGESTIONS.find((x) => x.id === el.dataset.id);
      pushHistory();
      dstate.sug[s.id] = "open";
      logTrail("You", `Restored ${s.by}'s suggestion — ${s.title}`);
      afterChange();
      return true;
    }
    case "set-size":
      pushHistory();
      dstate.d.headline.size = el.dataset.size;
      logTrail("You", `Set headline size to ${el.dataset.size.toUpperCase()}`);
      afterChange();
      return true;
    case "comment-resolve": {
      const c = dstate.comments.find((x) => x.id === el.dataset.id);
      c.resolved = !c.resolved;
      logTrail("You", `${c.resolved ? "Resolved" : "Reopened"} ${c.author.split(" ")[0]}'s comment on ${elLabel(c.target).toLowerCase()}`);
      afterChange();
      return true;
    }
    case "comment-reply":
      submitReply(el.dataset.id);
      return true;
    case "design-undo": {
      const prev = dstate.history.pop();
      if (!prev) return true;
      const s = JSON.parse(prev);
      dstate.d = s.d;
      dstate.sug = s.sug;
      logTrail("You", "Undid the last change");
      afterChange();
      return true;
    }
    case "design-reset":
      dstate.d = designDefault();
      dstate.sug = freshSugStatus();
      dstate.comments = seedComments();
      dstate.trail = seedTrail();
      dstate.history = [];
      dstate.selected = null;
      dstate.openWhy = null;
      dstate.focusItem = null;
      afterChange();
      return true;
    default:
      return false;
  }
}

function submitReply(id) {
  const input = document.querySelector(`[data-reply="${id}"]`);
  const text = input && input.value.trim();
  if (!text) return;
  const c = dstate.comments.find((x) => x.id === id);
  c.replies.push({ author: "You", text });
  logTrail("You", `Replied to ${c.author.split(" ")[0]} on ${elLabel(c.target).toLowerCase()}`);
  renderDesignPanel();
  renderDesignToolbar();
}

/* Live text editing: update canvas + drawer on each keystroke; record one
   history/trail entry per committed edit (when the field loses focus). */

document.addEventListener("focusin", (e) => {
  if (e.target.matches("[data-field]")) dstate.editSnap = snap();
});

document.addEventListener("input", (e) => {
  if (!e.target.matches("[data-field]")) return;
  setField(e.target.dataset.field, e.target.value);
  renderDesignCanvas();
  renderDrawer();
});

document.addEventListener("change", (e) => {
  if (!e.target.matches("[data-field]") || dstate.editSnap == null) return;
  if (snap() !== dstate.editSnap) {
    pushHistory(dstate.editSnap);
    logTrail("You", `Edited ${elLabel(dstate.selected).toLowerCase()}`);
    renderDesignToolbar();
    if (dstate.panel === "trail") renderDesignPanel();
  }
  dstate.editSnap = null;
});

document.addEventListener("keydown", (e) => {
  if (state.tab !== "design") return;
  const t = e.target;
  if ((e.key === "Enter" || e.key === " ") && t.matches && t.matches('.art-el[data-action="design-select"]')) {
    e.preventDefault();
    handleDesignAction("design-select", t);
    // keep keyboard focus on the element after the canvas re-renders
    const again = document.querySelector(`.art-el[data-el="${dstate.selected}"]`);
    if (again) again.focus();
    return;
  }
  if (e.key === "Enter" && t.matches && t.matches("[data-reply]")) {
    e.preventDefault();
    submitReply(t.dataset.reply);
    return;
  }
  if (e.key === "Escape" && !state.drawerOpen && dstate.selected) {
    dstate.selected = null;
    renderDesign();
  }
});
