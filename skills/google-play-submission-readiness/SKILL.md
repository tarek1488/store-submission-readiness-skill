---
name: google-play-submission-readiness
description: Read-only Google Play pre-submission audit for Expo and React Native apps. Shows the effective target API level and the full permission set with each permission's source, fetches Google's current requirements, compares the published privacy policy with what the code actually collects, and writes an evidence-backed readiness report with blockers, exact fixes, a proposed Data Safety mapping, the Health apps declaration, and the Play Console tasks that remain. Run only when the user explicitly invokes it; it never modifies the project.
disable-model-invocation: true
disallowed-tools: Edit NotebookEdit
allowed-tools: Read Grep Glob WebFetch WebSearch Bash(git status *) Bash(git rev-parse *) Bash(npx expo config *)
---

# Google Play submission readiness

You are auditing an app the way Play's review and policy checks would, and the user is deciding
whether to submit today. The decision is only as good as the evidence, so the discipline that
matters most is refusing to mark anything verified that you did not actually inspect.

Audit Android on its own terms. Passing on another store proves nothing here: the declarations,
the permission model, the target-API requirement and the release process are all different.

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

Work through these phases in order, announcing each in one short line so the run doesn't read as
a hang.

### Phase 0 — Model advice and scope

Open with one line of advice: this audit rewards the strongest reasoning model the host offers,
because weaker models tend to accept source configuration at face value and mark things verified
that were never checked. Then continue on whatever model is running.

Then locate the app. In a monorepo it may not be the working directory, so find the
`package.json` that depends on `expo` or `react-native`. Don't stop to confirm the folder here;
the interview does that. Establish the stack from `references/evidence-probes.md` §1. The
structural probes assume Expo or bare React Native. For a different stack — native Kotlin,
Flutter, Capacitor — say so plainly, offer the policy half of the audit only, and let the user
decide whether that's useful.

Then write the feature profile from §1: what this app has, and what it doesn't. Every app is
different, and the profile is what scopes the rest of the run. Requirements for features the
app lacks are `N/A` with the evidence of absence, not findings and not padding.

### Phase 1 — Interview

Run the batched interview in `references/interview.md`. Ask once, before the long probes, and
skip anything the user already told you when they invoked the skill. It also confirms the app
folder and the report path, which makes it the only planned stop of the run. "I don't know" is
acceptable and becomes a manual-verification item.

### Phase 2 — Current requirements

Fetch the live Play pages listed in `references/official-sources.md`. The target API level
requirement and its enforcement date are the clearest example of why this matters: they move
every year, and a stale number turns the report's main technical conclusion into a guess. If the
network is unavailable, say so in the summary and mark date-sensitive items for manual
verification.

### Phase 3 — Evidence

Work through `references/evidence-probes.md`. Two things carry most of the weight on Android:

- The **effective** target, compile and minimum SDK levels, shown from the resolved
  configuration with their source — not inferred from the framework version.
- The **effective permission set**, attributed per permission to the project config, a config
  plugin, a dependency's bundled manifest, or a native artifact that only appears in the built
  bundle. Permissions inherited from dependencies are the single most common surprise, and the
  ones that need a console justification are usually not in the project's own config at all.

While reading, trace the flows in §10 that this app has — first launch, permission-gated
features, purchase, restore, deletion, store links — and note dead ends, controls that only
produce errors, and missing error handling. If the user gave you the backend's location, read
it: what the server stores and which services it calls decide most of the Data Safety answers.
Read it; don't run its tests.

Check the public Play listing early (§1), and if the user has a production bundle on disk, read
its merged manifest (§3). Both replace an assumption with something you saw.

### Phase 4 — Play-specific review

Read `references/play-requirements.md` and go through it. Build the data inventory with
`references/data-inventory.md`, then produce the proposed Data Safety mapping and the answers
for the declarations every app files (the Health apps declaration is one, and "no health
features" is a valid answer), marking clearly which parts depend on console configuration you
can't see.

### Phase 5 — Classify

Sort every finding:

- **Blocker** — a defect you can point at that stops this submission: likely to prevent upload,
  approval, purchases, authentication, privacy compliance, or core use in review or on first run.
- **Warning** — evidenced, won't necessarily cause rejection, but should be fixed first. A defect
  that only bites after release, under a condition that isn't true yet, belongs here; mark it
  "fix before this build ships" when it can't be repaired later.
- **Verified** — you inspected it and it holds. Name the evidence.
- **Manual** — the truth lives in a console or a built artifact you can't read. Name the screen.

The line between blocker and manual is evidence, not importance. Play has many requirements that
live entirely in the console — declarations, signing fingerprints, testing gates, product setup —
and none of them is a blocker merely because you can't see it. Put those in the manual checklist,
flag the ones that would stop the release as "confirm before submitting", and keep the blocker
list for defects you can show. The opposite mistake matters too: an unreadable console must not
hide a code problem that would make a declaration false.

### Phase 6 — Report

Write the report using `references/report-template.md`, to the path settled in the interview —
by default `docs/app-submission-readiness-google-play.md` inside the audited app's project.
Don't stop to ask again: the user should come back to a finished report. Keep it to the length
the template asks for. Then summarise in chat: where the report is, the verdict, the blocker
count, and the single most important next action.

Offer to hand the fixes to a normal session. Don't apply them here.

## Evidence standards

Every finding carries a file path with a line number, a command and its output, or a quoted
sentence from an official page — ideally the rule and the code side by side. "Documentation says
the app does X" is not evidence that it does; read the implementation. The same goes for an
earlier audit or checklist sitting in the repository: it tells you where to look, not what is
true now.

When something can only be confirmed in the built bundle or the console, write `REQUIRES MANUAL
VERIFICATION` and name the exact place to look. An honest gap is worth more than a confident
guess, because the user is about to act on this.
