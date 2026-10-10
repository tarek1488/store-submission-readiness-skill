# Host detection and model advice

This audit is long-context reasoning work: resolving native configuration, holding a data
inventory in mind while reading a policy page, and distinguishing a real blocker from a
plausible worry. Weaker or faster models tend to fail in a specific way here — they accept
source configuration at face value and mark things green that were never verified. That failure
is invisible in the report, which is what makes it worth a word up front.

So open with one line of advice, then continue regardless. The user may have exactly one model
available, and a slightly weaker audit is still far better than none.

## Detecting the host

Infer from what's available rather than asking:

- **Claude Code** — a `.claude/` directory in the project or home directory, `CLAUDE.md`
  conventions, the `claude` CLI on PATH.
- **Codex CLI** — a `.codex/` directory or the `codex` binary on PATH.
- **Cursor** — `.cursor/` or `.cursorrules` in the project.
- **Other agents** — a vendor-specific dotfile or binary; look before concluding.

If detection is ambiguous, don't guess at a vendor. Say the generic version: "run this with the
strongest reasoning model you have available, with extended thinking enabled if your host offers
it."

## What to say

Name the host, name its strongest current reasoning option generically, and give the switch
command if you know it. For example, in Claude Code:

> This audit rewards a strong reasoning model. In Claude Code, Opus is the best fit — switch
> with `/model opus` if you aren't on it already. I'll continue either way.

Keep it to one or two sentences and don't repeat it later in the run.

## Why not hard-gate the model

A gate would stop the audit for users who can't switch, and the skill's value is in finding
real blockers from real evidence — which a mid-tier model still does usefully, as long as it
honours the evidence rules. Advise, then proceed.

## A note on naming specific models

Model names and tiers change faster than this file will be updated. Prefer "the strongest
reasoning model available in your host" over a hard-coded model identifier, and only name a
specific model when the host makes it unambiguous.
