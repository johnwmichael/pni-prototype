# Partnership Calibration — working prototype

A working, click-through implementation of the **Partnership Calibration** step
from the PNI user journey (Welcome → **Partnership Calibration** → Multi-AI
Network Setup → First Collaboration → Partnership Dashboard).

Open `index.html` directly in a browser, or serve the folder
(`python3 -m http.server` from inside it) — no build step, no dependencies.

## Why vanilla JS instead of React/Vite/TanStack Router

This was built in a sandboxed environment whose network policy blocks the
npm registry and every CDN (only `github.com` was reachable). That meant
`npm install` for React, Vite, or `@tanstack/react-router` couldn't succeed,
and there was no way to verify a build that used them. Rather than hand you
untested source, this prototype is plain HTML/CSS/JS, built to be trivial to
port into `ai-partner-canvas`'s real stack:

| This prototype | Ports to |
|---|---|
| `js/data.js` | Seed data for a React context / store (`AGENTS`, `AUTONOMY_LEVELS`, `WIZARD_QUESTIONS`, etc. — copy as-is) |
| `state` object in `js/app.js` | `useReducer` / context state shape |
| Each `render*()` function | A React component (`WizardStep`, `AgentAutonomyCard`, `RolesReview`, `JourneyStepper`) |
| The single delegated click listener + `switch` | A reducer's `switch` on action type |
| `css/theme.css` `:root` variables | Your Tailwind theme tokens / CSS-in-JS theme object |

Nothing here needed a framework — it's straight DOM rendering from a state
object, re-rendering on every state change — so the logic maps over cleanly
once you're in an environment with registry access.

## What's implemented

**Partnership Calibration** (the full deliverable), as a 3-step flow:

1. **Trust Calibration** — the four wizard questions from
   `TRUST-MECHANISM-IMPLEMENTATION.md`, each mapped to one of the four
   Collaborative AI capabilities (metacognition, contextual mode-switching,
   uncertainty-aware action, adaptive human collaboration).
2. **AI Autonomy Levels** — per-agent (Maya/Devon/Priya) autonomy radios
   (High / Medium / Low / Advisory Only) with the agent-specific
   auto-apply/approval thresholds from the same doc.
3. **Role Definitions & Review** — editable responsibility checklists per
   agent, plus a live "Partnership Trust Overview" preview that recalculates
   as you calibrate.

The top journey stepper is wired and clickable across all five steps; only
Partnership Calibration is fully built — the other four render as clearly
labeled stubs so the whole journey is navigable end to end.

## Content sourced from your own docs, not invented

The wizard copy, autonomy level definitions, per-agent thresholds, and trust
dashboard format all came from `TRUST-MECHANISM-IMPLEMENTATION.md` and
`SITE-ARCHITECTURE.md` in the `pni-prototype` repo (the `ai-partner-canvas`
repo itself is private and wasn't reachable from this session — see the note
in the parent project doc).

## Design tokens

`css/theme.css` implements the nocturne theme exactly as specified: `#161826`
background, `#232532` surface, `#e9e9ed` text, `#9184d9` accent used only as
lines/highlights (never flooded), 8px radius, outlined buttons, left-aligned
layout. Inter is referenced by name with a system-font fallback chain, since
Google Fonts wasn't reachable here — swap in the real webfont link once
you're building somewhere with network access.
