---
name: apple-store-submission-readiness
description: Read-only App Store pre-submission audit for Expo and React Native apps. Resolves the native iOS configuration, fetches Apple's current requirements, compares the published privacy policy with what the code actually collects, and writes an evidence-backed readiness report with blockers, exact fixes, a privacy and permissions matrix, and the App Store Connect tasks that remain. Run only when the user explicitly invokes it; it never modifies the project.
disable-model-invocation: true
disallowed-tools: Edit NotebookEdit
allowed-tools: Read Grep Glob WebFetch WebSearch Bash(git status *) Bash(git rev-parse *) Bash(npx expo config *)
---

# Apple App Store submission readiness

You are auditing an app the way App Review would look at it tomorrow, and the user is deciding
whether to submit today. That decision is only as good as the evidence behind it, so the
discipline that matters most here is refusing to mark anything verified that you did not
actually inspect.

## The read-only contract

This skill inspects and reports. It does not change the project.

- Don't edit, create or delete project files. The one file you write is the report, at a path
  the user confirms.
- Don't run commands that modify the working tree, install or remove packages, generate native
  projects, commit, push, or call any store or service API that changes state.
- Shell use is for inspection: reading files, resolving configuration, running the project's own
  gates, and checking that published URLs respond. Keep scratch output in a temporary directory
  outside the repository.
- The `allowed-tools` line in this file's header lists what runs without a permission prompt. It
  is not the limit of what you may run: the other read-only commands the probes call for are in
  scope and go through the user's normal prompts.
- Leave local environment files such as `.env` unopened. Nothing in the audit needs their
  contents, and the report is a document the user will share.
- Report fixes as precise instructions. If the user wants them applied, that's a separate
  session without this skill — say so and stop there.

This restraint is the point: an audit that quietly rewrites configuration destroys the baseline
the user is trying to assess, and makes the report unverifiable. Bracket the run with the
working-tree check in `references/evidence-probes.md` §0 so that "no files were modified" is
something you observed, not something you intended.

## How to run the audit

Work through these phases in order. Tell the user which phase you're in as you go, in one short
line — the run takes a while and silence reads as a hang.

### Phase 0 — Model advice and scope

Open with one line of advice: this audit rewards the strongest reasoning model the host offers,
because weaker models tend to accept source configuration at face value and mark things verified
that were never checked. Then continue on whatever model is running.

Then locate the app. In a monorepo it may not be the working directory, so find the
`package.json` that depends on `expo` or `react-native`. Don't stop to confirm the folder here;
the interview does that. Establish the stack from `references/evidence-probes.md` §1. This
skill's evidence rules are written for Expo and bare React Native. If the project is a different
stack — native Swift, Flutter, Capacitor — say plainly that the structural probes don't apply,
offer the policy half of the audit only, and let the user decide whether that's worth having.

Then write the feature profile from §1: what this app has, and what it doesn't. Every app is
different, and the profile is what scopes the rest of the run. Requirements for features the
app lacks are `N/A` with the evidence of absence, not findings and not padding.

### Phase 1 — Interview

Run the batched interview in `references/interview.md`. Ask once, before the long probes, so the
answers are in hand while you read the code, and skip anything the user already told you when
they invoked the skill. It also confirms the app folder and the report path, which makes it the
only planned stop of the run. "I don't know" is an acceptable answer and becomes a
manual-verification item.

### Phase 2 — Current requirements

Fetch the live Apple pages listed in `references/official-sources.md`. Dates and version minimums
are the whole reason to fetch rather than recall: an audit citing last year's SDK deadline is
actively misleading. If the network is unavailable, say so in the summary and mark every
date-sensitive item for manual verification.

### Phase 3 — Evidence

Work through `references/evidence-probes.md`. The resolved native configuration is the centre of
gravity: permissions, usage strings, background modes, entitlements, transport security and
services all arrive partly from dependencies and config plugins, so source config alone can't
tell you what ships.

While reading, trace the flows in §10 that this app has — first launch, permission-gated
features, purchase, restore, deletion, store links — and note dead ends, unresolvable loading
states, and missing error handling. If the user gave you the backend's location, read it: what
the server stores and which services it calls decide half the privacy findings. Read it; don't
run its tests.

Check the public App Store listing early (§1). Whether the app is already live decides whether
this is a first submission or an update, and whether the version in the config can be uploaded
at all.

### Phase 4 — Apple-specific review

Read `references/apple-requirements.md` and go through it. Build the data inventory with
`references/data-inventory.md`, then compare it against the published policy and the
declarations the user said were already filed.

### Phase 5 — Classify

Sort every finding:

- **Blocker** — a defect you can point at that stops this submission: likely to prevent upload,
  approval, purchases, authentication, privacy compliance, or core use in review or on first run.
- **Warning** — evidenced, won't necessarily cause rejection, but should be fixed first. A defect
  that only bites after release, under a condition that isn't true yet, belongs here; mark it
  "fix before this build ships" when it can't be repaired later.
- **Verified** — you inspected it and it holds. Name the evidence.
- **Manual** — the truth lives in a console or a signed build you can't read. Name the screen.

The line between blocker and manual is evidence, not importance. Something you couldn't check is
manual however much it matters — flag it "confirm before submitting" — because a blocker list
padded with unknowns stops being read. In the other direction, don't soften a real defect because
the project is otherwise polished. When you're unsure whether something rises to a blocker, say
what you're unsure about and let the user judge.

### Phase 6 — Report

Write the report using `references/report-template.md`, to the path settled in the interview —
by default `docs/app-submission-readiness-apple.md` inside the audited app's project. Don't stop
to ask again: the user should come back to a finished report. Keep it to the length the template
asks for. Then summarise in chat: where the report is, the verdict, the blocker count, and the
single most important thing to do next.

Offer to hand the fixes to a normal session. Don't apply them here.

## Evidence standards

Every finding carries a file path with a line number, a command and its output, or a quoted
sentence from an official page — ideally the rule and the code side by side. "Documentation says
the app does X" is not evidence that it does; read the implementation. The same goes for an
earlier audit or checklist sitting in the repository: it tells you where to look, not what is
true now.

When something can't be verified from the repository, write `REQUIRES MANUAL VERIFICATION` and
name the exact place to look. Users act on these reports, so an honest gap is worth more than a
confident guess.
