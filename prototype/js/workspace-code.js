/*
  Workspace · Code tab — a shared thread with a live artifact.

  A Claude-style interface, built for collaboration rather than one person
  and one AI taking turns:
  - The thread has many voices — you, teammates (Sam), and the AI network
    (Devon, Maya, Priya, Content AI) — each tagged, each with a role.
  - AI agents propose changes as diffs inside the thread, with source,
    confidence and a "Why?"; a human applies or dismisses them.
  - The artifact (launch-embed.html) sits beside the thread and is built
    from the *active project*: the post title from Write, the headline and
    hero-stat caption from Design. Edit those tabs and the code follows.
  - A human review gate: request review -> approved. Any later change to
    the code flips the status to "changed since approval".

  Prototype notes: teammate replies and AI replies are scripted (the
  composer recognises @mentions / keywords); nothing calls a model.

  Plain script, loaded after workspace-project.js and workspace-design.js,
  before workspace.js (shares its global scope).
*/

const CODE_FILE = "launch-embed.html";

function codeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

// Proposals insert attribute lines after the data-theme line, in this order.
const CODE_PROPOSALS = [
  {
    id: "p-lazy",
    agent: "CONTENT AI",
    by: "Content AI",
    source: "Content AI",
    title: "Load the embed lazily",
    confidence: 91,
    why: "High confidence: the embed sits below the fold on most screens, and deferring it until it scrolls into view keeps the post fast without changing what readers see.",
    lines: () => [{ text: `  data-lazy="true"` }],
  },
  {
    id: "p-utm",
    agent: "PRIYA · DISTRIBUTION",
    by: "Priya",
    source: "Distribution AI · via Priya",
    title: "Tag traffic for attribution",
    confidence: 86,
    why: "High confidence: a campaign tag on the embed lets Week 6 results be attributed back to this post, which is what the Analyze tab's projections need to become measurements.",
    lines: () => [{ text: `  data-utm="blog_launch_w6"` }],
  },
  {
    id: "p-track",
    agent: "DEVON · RESEARCH",
    by: "Devon",
    source: "Research AI · via Devon",
    title: "Track scroll depth and CTA clicks",
    confidence: 78,
    why: "Medium confidence: tracking real behavior is the way to test the 3:1 visual-over-text finding on this audience, but the event names are a guess until you confirm what your analytics expects.",
    lines: () => [{ text: `  data-track="scroll-depth,cta-click"` }],
  },
  {
    id: "p-caption",
    agent: "MAYA · STRATEGY",
    by: "Maya",
    source: "Strategy AI · via Maya",
    title: "Echo the 3:1 finding in the embed",
    confidence: 90,
    why: "High confidence: the embed should say the same thing as the infographic. This line is linked to the Design tab's hero-stat caption, so it updates if that caption changes.",
    lines: () => [{ text: `  data-caption="${codeAttr(PROJECT.design.d.stat.caption)}"`, from: "Design" }],
  },
];

// Suggested prompts: asking an agent surfaces its proposal in the thread.
const CODE_PROMPTS = [
  {
    id: "q-utm",
    label: "@Priya tag this for attribution",
    text: "@Priya can we tag this embed so Week 6 traffic attributes back to this post?",
    proposal: "p-utm",
    reply: "Yes. I'm tagging it with the Week 6 campaign so Analyze can attribute results to this post. Proposed change below.",
  },
  {
    id: "q-track",
    label: "@Devon track engagement",
    text: "@Devon what should we track to test the visual-over-text finding?",
    proposal: "p-track",
    reply: "Scroll depth and CTA clicks. That tests the 3:1 finding against real reader behavior, not just interviews.",
  },
  {
    id: "q-caption",
    label: "@Maya echo the 3:1 finding",
    text: "@Maya can the embed echo the stat from our infographic?",
    proposal: "p-caption",
    reply: "Pulling the hero-stat caption from the Design brief, so the embed and the infographic always say the same thing.",
  },
];

const AGENTS = {
  "Content AI": { initials: "CA", role: "Content AI" },
  Priya: { initials: "PR", role: "Distribution" },
  Devon: { initials: "DV", role: "Research" },
  Maya: { initials: "MY", role: "Strategy" },
};

PROJECT.code = {
  proposals: { "p-lazy": "open", "p-utm": "hidden", "p-track": "hidden", "p-caption": "hidden" },
  thread: [
    { id: 1, kind: "human", who: "Sam Rivera", initials: "SR", color: "a", role: "Design Lead", time: "8m ago",
      text: "We need the live dashboard embedded in the post's hero section. Can someone draft the snippet?" },
    { id: 2, kind: "ai", who: "Content AI", time: "6m ago", proposal: "p-lazy",
      text: "Drafted launch-embed.html. It reads the post title from Write and the headline from Design, so the embed's label always matches the brief. One change I'd make before it goes live:" },
  ],
  nextId: 3,
  review: "draft", // draft | review | approved
  approvedText: null,
  copied: false,
};

const cstate = PROJECT.code;

/* ---------- Artifact ---------- */

function buildCode() {
  const d = PROJECT.design.d;
  const lines = [
    { text: `<!-- ${PROJECT.title} · hero embed -->`, from: "Write" },
    { text: `<script src="https://cdn.datapulse.example/embed.js" async></script>` },
    { text: `` },
    { text: `<div` },
    { text: `  data-datapulse-dashboard="launch-overview"` },
    { text: `  data-theme="dark"` },
  ];
  CODE_PROPOSALS.forEach((p) => {
    if (cstate.proposals[p.id] === "applied") {
      p.lines().forEach((l) => lines.push({ ...l, added: p.id }));
    }
  });
  lines.push({ text: `  aria-label="${codeAttr(d.headline.text)}"`, from: "Design" });
  lines.push({ text: `></div>` });
  return lines;
}

function codeText() {
  return buildCode().map((l) => l.text).join("\n");
}

function reviewStatus() {
  if (cstate.review === "approved") {
    return codeText() === cstate.approvedText ? "approved" : "changed";
  }
  return cstate.review; // draft | review
}

const STATUS_LABEL = {
  draft: "Draft · needs review",
  review: "In review · waiting on Sam",
  approved: "Approved by Sam",
  changed: "Changed since approval",
};

function appliedCount() {
  return Object.values(cstate.proposals).filter((s) => s === "applied").length;
}

function openProposalCount() {
  return Object.values(cstate.proposals).filter((s) => s === "open").length;
}

/* ---------- Render ---------- */

function contextHTML() {
  const d = PROJECT.design.d;
  const w = PROJECT.write;
  const words = (DRAFT_INTRO.join(" ") + (w.applied ? " " + APPLIED_PARAGRAPH : ""))
    .split(/\s+/)
    .filter(Boolean).length;
  const cap = cstate.proposals["p-caption"] === "applied";
  const utm = cstate.proposals["p-utm"] === "applied";
  const cards = [
    {
      tab: "write", label: "Write",
      title: PROJECT.title,
      meta: `${words} words · ${w.applied ? "competitive section drafted" : "intro drafted"}`,
      used: "Used in: comment header",
    },
    {
      tab: "design", label: "Design",
      title: d.headline.text,
      meta: `Hero stat ${d.stat.value}`,
      used: `Used in: aria-label${cap ? ", data-caption" : ""}`,
    },
    {
      tab: "analyze", label: "Analyze",
      title: "Target: +40% series completion",
      meta: "Network estimates · Priya",
      used: utm ? "Used in: data-utm" : "Not used yet",
    },
  ];
  return `
    <div class="cx-context-head">
      <h3>What this code can see</h3>
      <span class="live-pill"><span class="dot"></span>Live from ${escHTML(PROJECT.name)}</span>
    </div>
    <div class="cx-context-grid">
      ${cards
        .map(
          (c) => `
        <div class="cx-ctx">
          <div class="cx-ctx-top"><span class="activity-agent">${c.label}</span>
            <button class="move-why-btn" type="button" data-action="set-tab" data-tab="${c.tab}">Open →</button></div>
          <div class="cx-ctx-title">${escHTML(c.title)}</div>
          <div class="move-source">${escHTML(c.meta)}</div>
          <div class="cx-ctx-used">${c.used}</div>
        </div>`
        )
        .join("")}
    </div>`;
}

function diffHTML(p) {
  return p
    .lines()
    .map((l) => `<div class="diff-line"><span class="diff-sign">+</span><span>${escHTML(l.text)}</span></div>`)
    .join("");
}

function proposalHTML(p) {
  const st = cstate.proposals[p.id];
  const n = p.lines().length;
  let actions;
  if (st === "open") {
    actions = `<button class="btn btn-primary btn-sm" type="button" data-action="code-apply" data-id="${p.id}">Apply</button>
               <button class="btn btn-ghost btn-sm" type="button" data-action="code-dismiss" data-id="${p.id}">Dismiss</button>`;
  } else if (st === "applied") {
    actions = `<span class="dz-state dz-state--applied">✓ Applied</span>
               <button class="btn btn-ghost btn-sm" type="button" data-action="code-revert" data-id="${p.id}">Revert</button>`;
  } else {
    actions = `<span class="dz-state">Dismissed</span>
               <button class="btn btn-ghost btn-sm" type="button" data-action="code-revert" data-id="${p.id}">Restore</button>`;
  }
  return `
    <div class="cx-prop is-${st}">
      <div class="cx-prop-top">
        <div class="move-title">${p.title}</div>
        <div class="move-confidence">${p.confidence}%</div>
      </div>
      <div class="move-source">${p.source}</div>
      <div class="diff">${diffHTML(p)}</div>
      <div class="dz-actions">${actions}<span class="dz-state">+${n} line${n > 1 ? "s" : ""}</span></div>
      <button class="move-why-btn" type="button" data-action="code-why" data-id="${p.id}">${cstate.openWhy === p.id ? "Hide reasoning" : "Why? →"}</button>
      <div class="cx-why ${cstate.openWhy === p.id ? "is-open" : ""}">${p.why}</div>
    </div>`;
}

function messageHTML(m) {
  if (m.kind === "event") {
    return `<div class="msg msg--event"><span>${escHTML(m.text)}</span></div>`;
  }
  const ai = m.kind === "ai";
  const you = m.kind === "you";
  const meta = ai ? AGENTS[m.who] : null;
  const initials = you ? "JM" : ai ? meta.initials : m.initials;
  const role = you ? "Marketing Manager" : ai ? meta.role : m.role;
  const avatarStyle = ai ? "" : ` style="--peer: var(--peer-${you ? "you" : m.color})"`;
  const prop = m.proposal ? CODE_PROPOSALS.find((p) => p.id === m.proposal) : null;
  return `
    <div class="msg ${ai ? "msg--ai" : ""}">
      <span class="avatar avatar--sm ${ai ? "avatar--ai" : you ? "avatar--you" : ""}"${avatarStyle}>${initials}</span>
      <div class="msg-main">
        <div class="msg-top"><b>${escHTML(you ? "You" : m.who)}</b>
          ${ai ? '<span class="activity-agent">AI</span>' : ""}
          <span class="dz-role">${escHTML(role)}</span><span class="activity-time">${escHTML(m.time)}</span></div>
        <div class="msg-text">${escHTML(m.text)}</div>
        ${prop ? proposalHTML(prop) : ""}
      </div>
    </div>`;
}

function renderCodeThread(scroll) {
  const el = document.getElementById("code-thread");
  el.innerHTML = cstate.thread.map(messageHTML).join("");
  if (scroll) el.scrollTop = el.scrollHeight;
}

function renderCodePrompts() {
  const open = CODE_PROMPTS.filter((q) => cstate.proposals[q.proposal] === "hidden");
  document.getElementById("code-prompts").innerHTML = open
    .map((q) => `<button class="prompt-chip" type="button" data-action="code-ask" data-id="${q.id}">${escHTML(q.label)}</button>`)
    .join("");
}

function renderCodeArtifact() {
  const status = reviewStatus();
  const lines = buildCode();
  const body = lines
    .map(
      (l, i) => `
    <div class="cl ${l.added ? "is-added" : ""}">
      <span class="cl-n">${i + 1}</span>
      <span class="cl-code">${escHTML(l.text) || " "}</span>
      <span class="cl-tag">${l.from ? `from ${l.from}` : l.added ? "added" : ""}</span>
    </div>`
    )
    .join("");
  const canReview = status === "draft" || status === "changed";
  document.getElementById("code-artifact").innerHTML = `
    <div class="cx-art-head">
      <div class="cx-file"><b>${CODE_FILE}</b><span class="cx-chip cx-chip--${status}">${STATUS_LABEL[status]}</span></div>
      <div class="cx-art-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-action="code-copy">${cstate.copied ? "Copied ✓" : "Copy"}</button>
        <button class="btn btn-primary btn-sm" type="button" data-action="code-review" ${canReview ? "" : "disabled"}>Request review</button>
      </div>
    </div>
    <div class="code-block" role="region" aria-label="${CODE_FILE} source" tabindex="0">${body}</div>
    <div class="cx-art-foot">${appliedCount()} change${appliedCount() === 1 ? "" : "s"} applied · ${openProposalCount()} open proposal${openProposalCount() === 1 ? "" : "s"}${
      status === "approved" ? " · human approval recorded" : ""
    }</div>`;
}

function renderCode(scroll) {
  document.getElementById("code-context").innerHTML = contextHTML();
  renderCodeThread(scroll);
  renderCodePrompts();
  renderCodeArtifact();
}

/* ---------- Drawer preview ---------- */

function codePreview() {
  const status = reviewStatus();
  return {
    status: `<span>${appliedCount()} change${appliedCount() === 1 ? "" : "s"} applied</span><span>${STATUS_LABEL[status]}</span>`,
    body: `
      <div class="pv-code-head"><span>${CODE_FILE}</span><span>read-only</span></div>
      <pre class="pv-code"><code>${escHTML(codeText())}</code></pre>
      <p class="pv-note">A live read-only view of the artifact in the Code tab. It's built from this project's Write and Design content, so it changes when they do.</p>`,
    foot: `<div class="pv-progress-label">${openProposalCount()} open proposal${openProposalCount() === 1 ? "" : "s"} in the thread</div>`,
  };
}

/* ---------- Thread logic ---------- */

function pushMsg(m) {
  cstate.thread.push({ id: cstate.nextId++, time: "Just now", ...m });
}

function surface(proposalId, who, text) {
  if (cstate.proposals[proposalId] === "hidden") cstate.proposals[proposalId] = "open";
  pushMsg({ kind: "ai", who, text, proposal: proposalId });
}

function agentFor(id) {
  return CODE_PROPOSALS.find((p) => p.id === id).by;
}

function routeMessage(text) {
  pushMsg({ kind: "you", who: "You", text });
  const t = text.toLowerCase();
  const match =
    /@?priya|utm|attribut|campaign/.test(t) ? CODE_PROMPTS[0]
    : /@?devon|track|scroll|engage|analytics/.test(t) ? CODE_PROMPTS[1]
    : /@?maya|caption|3:1|stat|echo/.test(t) ? CODE_PROMPTS[2]
    : null;
  if (match && cstate.proposals[match.proposal] === "hidden") {
    surface(match.proposal, agentFor(match.proposal), match.reply);
  } else if (match) {
    pushMsg({ kind: "ai", who: agentFor(match.proposal), text: "That's already proposed in this thread — see the change above." });
  } else {
    pushMsg({
      kind: "ai",
      who: "Content AI",
      text: "Noted — it's in the thread for the team. (Prototype note: replies here are scripted; try asking @Priya, @Devon or @Maya.)",
    });
  }
}

function sendCodeMessage() {
  const input = document.getElementById("code-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  routeMessage(text);
  afterCodeChange(true);
}

function afterCodeChange(scroll) {
  renderCode(scroll);
  renderDrawer();
}

function handleCodeAction(action, el) {
  const id = el.dataset.id;
  switch (action) {
    case "code-ask": {
      const q = CODE_PROMPTS.find((x) => x.id === id);
      pushMsg({ kind: "you", who: "You", text: q.text });
      surface(q.proposal, agentFor(q.proposal), q.reply);
      afterCodeChange(true);
      return true;
    }
    case "code-send":
      sendCodeMessage();
      return true;
    case "code-why":
      cstate.openWhy = cstate.openWhy === id ? null : id;
      renderCodeThread(false);
      return true;
    case "code-apply": {
      const p = CODE_PROPOSALS.find((x) => x.id === id);
      cstate.proposals[id] = "applied";
      pushMsg({ kind: "event", text: `You applied ${p.by}'s change · ${p.title}` });
      afterCodeChange(true);
      return true;
    }
    case "code-dismiss": {
      const p = CODE_PROPOSALS.find((x) => x.id === id);
      cstate.proposals[id] = "dismissed";
      pushMsg({ kind: "event", text: `You dismissed ${p.by}'s change · ${p.title}` });
      afterCodeChange(true);
      return true;
    }
    case "code-revert": {
      const p = CODE_PROPOSALS.find((x) => x.id === id);
      const wasApplied = cstate.proposals[id] === "applied";
      cstate.proposals[id] = "open";
      pushMsg({ kind: "event", text: `You ${wasApplied ? "reverted" : "restored"} ${p.by}'s change · ${p.title}` });
      afterCodeChange(true);
      return true;
    }
    case "code-review":
      cstate.review = "review";
      pushMsg({ kind: "you", who: "You", text: `@Sam can you review ${CODE_FILE}? ${appliedCount()} change${appliedCount() === 1 ? "" : "s"} applied so far.` });
      afterCodeChange(true);
      // simulated teammate reply
      setTimeout(() => {
        cstate.review = "approved";
        cstate.approvedText = codeText();
        pushMsg({ kind: "human", who: "Sam Rivera", initials: "SR", color: "a", role: "Design Lead", text: "Reviewed. Looks good to me, approving." });
        afterCodeChange(true);
      }, 1100);
      return true;
    case "code-copy":
      copyText(codeText());
      cstate.copied = true;
      renderCodeArtifact();
      setTimeout(() => {
        cstate.copied = false;
        renderCodeArtifact();
      }, 1600);
      return true;
    default:
      return false;
  }
}

function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      return;
    }
  } catch (e) { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  } catch (e) { /* clipboard unavailable; the label still resets */ }
}

document.addEventListener("keydown", (e) => {
  if (state.tab !== "code") return;
  if (e.key === "Enter" && e.target.id === "code-input") {
    e.preventDefault();
    sendCodeMessage();
  }
});
