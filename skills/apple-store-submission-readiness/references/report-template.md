# Report template

The report is the whole deliverable. Someone reads it to answer one question: *can I submit
this build today without an obvious technical or policy rejection?* Everything in it should
serve that question, and anything that can't be backed by evidence should say so out loud.

## Where it goes

Each store gets its own file, so running the second audit never overwrites the first:

- Apple: `docs/app-submission-readiness-apple.md`
- Google Play: `docs/app-submission-readiness-google-play.md`

These paths are inside the app project you located at the start — the audited app's own
repository, so the report travels with the code it describes. Use that project's root if it has
no `docs/` directory. The interview states this path and lets the user name a different one, so
use what was settled there and don't ask again before writing. In a run where nobody can answer,
write to the default and say where the file went. Write nothing else.

## Status glyphs

Use these consistently, because readers scan for them:

- `✅ Verified` — you inspected it and it is correct. Name what you inspected.
- `❌ Blocker` — a defect you have evidence for, likely to prevent upload, submission, approval,
  purchases, sign-in, or core use.
- `⚠️ Warning` — evidenced, may not guarantee rejection, but should be fixed before submitting.
- `🔲 Manual verification required` — true state lives in a console or a signed build you can't read.
- `N/A` — the requirement doesn't apply, and it's worth saying why in one clause.

## Blockers need evidence of a defect

The most damaging mistake this report can make is to promote things you couldn't see into
blockers. "The Data Safety form may not be filed", "the signing fingerprint is unconfirmed" and
"purchases are unproven end to end" are not blockers — they are things you had no way to check.
A report with five blockers where four are really unknowns teaches the reader that the blocker
list is noise, and then the one real defect gets skimmed.

So a finding is a blocker only when you can point at the thing that is wrong: a line of code, a
resolved config value, a policy sentence that contradicts the implementation, a page that doesn't
load. Everything you couldn't verify goes to manual verification, however important it is. When
an unverifiable item would stop the submission if it turned out wrong, say so in the manual
checklist — mark it **confirm before submitting** and put it first — rather than relabelling it.

Evidence is necessary for a blocker, not sufficient. The defect also has to stop *this*
submission: the upload is refused, review is likely to fail, or a reviewer or first-run user hits
a broken core flow. A defect that only bites later, under a condition that isn't true yet — a
store link used by a forced-update screen nobody has triggered, a placeholder on a dormant
path — is a warning. If it can't be repaired after release because it is baked into the binary,
say **fix before this build ships** in the warning's first line. That keeps the verdict honest:
"almost ready, one blocker" should never describe a build that review would pass.

## Structure

```markdown
# Submission Readiness Audit — <Store>

Audited: <repo>@<commit>, <date>. No files were modified.

## 1. Executive Summary
🟢 READY TO SUBMIT | 🟡 ALMOST READY | 🔴 NOT READY
Three to six sentences: what passes, what blocks, and what is only console work.

## 2. Submission Blockers
### BLOCKER-001 — <short name>
**Platform:** <store> **Severity:** Critical
**Evidence:** `path/to/file:line`, plus the command output or quoted policy line
**Current behavior:** what the code or config does today
**Requirement/problem:** the rule, quoted from the official source you fetched
**Required fix:** the precise change — file, setting, and new value. No vague advice.

## 3. High-Priority Warnings
Same evidence-driven format, numbered WARN-001 onward.

## 4. Verified Ready
One line per item: what holds, and the evidence in parentheses.

## 5. <Store> Checklist
Table of requirement → glyph, covering build identity, permissions, auth, deletion,
privacy, and subscriptions.

## 6. Privacy & Data Declaration Matrix
Data → stored? → linked to user? → purpose → processors → store declaration category.

## 7. Permissions Matrix
Every effective permission → source → why → needed? → action.

## 8. Purchases & Subscriptions
Separate application code, the purchase provider, and the store console.
If the app sells nothing: one line, N/A, with the evidence.

## 9. Manual Console Tasks
A checklist of what remains outside the repository, with "confirm before submitting" items first.

## 10. Recommended Review Notes
Draft reviewer notes. Use placeholders like `<DEMO_EMAIL>` — never invent credentials.

## 11. Final Go/No-Go
Technical readiness: READY / NOT READY
Policy readiness: READY / NOT READY / MANUAL CHECKS REMAIN
Console readiness: READY / MANUAL CHECKS REMAIN
READY TO SUBMIT: YES / NO
If NO, list only the exact remaining blockers.
```

## Fit the report to the app

Keep all eleven sections so reports are comparable, but fill them from the feature profile. A
section or checklist row for something the app doesn't have is one `N/A` line with the evidence
of absence — "no account system: no auth library, no sign-in screen" — and nothing more. Don't
pad it with generic advice, and don't hunt for findings in an area the app never enters. A
simple app should produce a short report.

## Length

Aim for a report someone will read in one sitting — roughly 250 to 400 lines for a typical app.
The evidence has to be there, but evidence is a file path, a line number and one quoted sentence,
not a transcript of how you found it.

Where the length goes wrong in practice:

- **Verified Ready** balloons because each item gets a paragraph. Give each one line. The reader
  wants to know it was checked and how, nothing more.
- **Blockers and warnings** restate the whole investigation. State the defect, show the evidence,
  give the fix.
- **Matrices** grow explanatory prose around them. Put the reasoning in the cell or in one
  sentence under the table.

If a finding needs more room than this, that's a sign it is two findings.

## Honesty rules that make the report worth reading

A report that marks things green because they're probably fine is worse than no report: the
user submits on the strength of it and gets rejected anyway. So:

- Never write `✅` for something you inferred from documentation, a comment, or a filename.
  If you didn't see it, it's `🔲`.
- An earlier readiness report, audit document or checklist in the repository is a claim, not
  evidence. Don't copy its conclusions; re-verify anything you intend to state, because the code
  has usually moved since it was written.
- Resolved configuration beats source configuration. A permission can enter from a dependency's
  own manifest, so "it isn't in app.json" proves nothing on its own.
- When a check needs a signed build or a console you can't read, say `REQUIRES MANUAL
  VERIFICATION` and name the exact screen or file where the user can confirm it.
- Quote policy text rather than paraphrasing it. Paraphrase is how a requirement quietly
  becomes a different requirement. If you cite a rule you didn't fetch this run, say so.
