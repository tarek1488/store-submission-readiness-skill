# store-submission-readiness

Two agent skills that audit a mobile app before you submit it, and tell you — with evidence —
whether it would survive review today.

- **`/apple-store-submission-readiness`** — Apple App Store
- **`/google-play-submission-readiness`** — Google Play

Both run **only when you invoke them**, and neither changes your code.

They are written for any Expo or React Native app, not one kind of product. Each run starts by
working out what your app actually has — accounts, purchases, ads, location or camera access,
content from users, health data, notifications — and audits only those areas. An app with no
sign-in and nothing for sale gets a short report, not a list of rules that don't apply.

## What these skills do, and what they touch

Each skill runs the audit a release engineer would run by hand and ends with a written report.
To do that, a skill will:

1. **Read your codebase.** It reads your project configuration, resolves the *native*
   configuration your build will actually produce (permissions, usage strings, entitlements,
   background modes, SDK levels), reads the Android manifests bundled inside your dependencies,
   and traces your sign-in, permission, purchase, restore and account-deletion flows in the
   source. If you tell it where your backend lives, it reads that too, because what the server
   stores and which services it calls decide most of the privacy findings. It also runs the
   checks your app project already defines — type checks, linting, tests, `expo-doctor` — and
   reports every failure verbatim. The backend is read, never tested. If you have a production
   build file on disk and give its path, the skill copies it to a temporary directory and reads
   the manifest that actually ships.
2. **Use the web.** Store requirements change on specific dates — minimum SDKs, target API
   levels, new disclosure duties — so each run fetches the current first-party policy pages from
   Apple and Google and quotes the live wording in each finding, rather than relying on what the
   model remembers. It also looks up your app's public store listing by bundle or package
   identifier, to see whether it is already live and whether the version needs bumping.
3. **Read the locations you provide.** The skill asks you, once, where your published privacy
   policy, terms of service, account-deletion page and support contact live, where your backend
   and website source are, what the app does that the stores treat specially, your bundle or
   package identifiers, and which store declarations you have already filed. It fetches those
   pages and compares them with what your code actually collects and sends — so a processor
   that appears in your code but not in your policy, or a retention promise your implementation
   doesn't keep, shows up as a finding.

It does not open local environment files such as `.env`, and it never prints credential values
into the report.

## What they will not do

- **No code changes.** The instructions forbid editing, installing, generating native projects,
  committing, or calling any store API. In Claude Code the skills also remove the `Edit` and
  `NotebookEdit` tools while they run. The one file a skill writes is the report, at a path you
  confirm — and because `Write` is not pre-approved, your agent asks you before creating it.
- **No applied fixes.** Each blocker comes with the exact change to make — file, setting, new
  value. Applying it is a separate session, without the skill loaded.
- **No invented credentials.** Reviewer notes use placeholders you fill in.
- **No legal advice.** Policy-versus-code mismatches are flagged as practical inconsistencies
  for you or your counsel to resolve.

Each run checks `git status` before and after, so the report's "no files were modified" line is
something the skill observed. Project checks such as tests may write caches into ignored
directories; anything that touches tracked files is reported rather than hidden.

### How the safeguards work in Claude Code

| Frontmatter | Effect |
|---|---|
| `disable-model-invocation: true` | The skill never starts on its own. It runs only when you type its name. |
| `disallowed-tools: Edit NotebookEdit` | Those tools are unavailable while the skill is active. |
| `allowed-tools` | Pre-approves only read-only tools and three inspection commands (`git status`, `git rev-parse`, `npx expo config`). Every other shell command, and the report write, still goes through your normal permission prompts. |

`allowed-tools` pre-approves; it does not restrict. The restriction comes from `disallowed-tools`
and from your own permission settings, so if you run your agent with prompts disabled, the
written contract is what holds the skill to read-only.

Other agents ignore these Claude Code fields. For Codex, each skill ships an
`agents/openai.yaml` that turns off implicit invocation. Elsewhere, the read-only contract in
the skill's instructions is the safeguard.

## What you get

One report per store, written inside your app's own project so it travels with the code. The
skill tells you the path and asks whether you want a different one before it writes:

- `docs/app-submission-readiness-apple.md`
- `docs/app-submission-readiness-google-play.md`

Each answers one question — *can I submit this build today?* — with:

- An executive verdict: ready, almost ready, or not ready.
- Numbered blockers and warnings, each with `file:line` evidence, the quoted requirement, and
  the precise fix. A blocker is always a defect the skill can point at that would stop this
  submission; defects that only bite after release are warnings.
- What was verified, and what needs manual verification with the exact console screen named.
- A privacy and data declaration matrix mapped to App Privacy or Data Safety categories.
- A permissions matrix with each permission attributed to its source.
- Purchase and subscription readiness, split into code, provider, and console — or one line
  saying it doesn't apply.
- A checklist of the console tasks that remain outside your repository.
- Draft reviewer notes.

## Scope

Built for **Expo** (including continuous native generation) and **bare React Native**. On other
stacks the structural probes don't apply; the skill says so and offers the policy half of the
audit instead of pretending otherwise.

## Model recommendation

The audit is long-context reasoning work, and weaker models tend to fail in one specific way
here: they accept your source configuration at face value and mark things verified that were
never checked. At the start of a run each skill detects which agent it's running in and
recommends the strongest reasoning model available there — then continues either way.

## Usage

From your app's repository:

```
/apple-store-submission-readiness
/google-play-submission-readiness
```

Installed as a Claude Code plugin, the same skills are also available under the plugin's
namespace, for example `/store-submission-readiness:apple-store-submission-readiness`.

You can put what you already know in the same message — policy URLs, backend path, "first
submission" — and the skill won't ask for it again. Expect the run to take a while: it resolves
native configuration, runs your checks, and fetches live policy pages.

Install instructions are added when the package is published.

## Repository layout

```
store-submission-readiness/
├── .claude-plugin/plugin.json
├── shared/references/          source of truth for guidance both skills use
├── scripts/sync-shared.mjs     copies shared references into each skill
└── skills/
    ├── apple-store-submission-readiness/
    │   ├── SKILL.md
    │   ├── agents/openai.yaml
    │   └── references/         apple-requirements.md + synced shared files
    └── google-play-submission-readiness/
        ├── SKILL.md
        ├── agents/openai.yaml
        └── references/         play-requirements.md + synced shared files
```

Skills are installed one folder at a time, so each carries its own copy of the shared guidance.
Edit files in `shared/references/` only, then run:

```bash
node scripts/sync-shared.mjs          # write the copies
node scripts/sync-shared.mjs --check  # fail if any copy is stale
```

## License

MIT.
#   s t o r e - s u b m i s s i o n - r e a d i n e s s - s k i l l  
 