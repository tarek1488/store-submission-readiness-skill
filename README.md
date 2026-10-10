# Store Submission Readiness

Two agent skills that audit an Expo or React Native app before you submit it, and tell you, with
evidence, whether it would pass review today. They only read your project and never change your
code.

- `/apple-store-submission-readiness` for the Apple App Store
- `/google-play-submission-readiness` for Google Play

## Install

For any agent that supports skills (Claude Code, Codex, Cursor and others):

```bash
npx skills add tarek1488/store-submission-readiness-skill
```

Or as a Claude Code plugin:

```
/plugin marketplace add tarek1488/store-submission-readiness-skill
/plugin install store-submission-readiness@tarek1488
```

## Use

Open your agent in the app's repository and run one of the two commands. Installed as a plugin,
they carry the plugin prefix, for example
`/store-submission-readiness:apple-store-submission-readiness`.

The skill asks a few questions once, then works on its own: where your privacy policy, terms and
account-deletion page are published, where the backend code lives, and which store declarations
you have already filed. Put what you already know in the same message and it won't ask again.

A run takes a while. It resolves the native configuration your build will produce, runs the
checks your project already defines, and fetches the current store policies. Use the strongest
reasoning model your agent offers.

## What you get

One report per store, written to `docs/app-submission-readiness-apple.md` or
`docs/app-submission-readiness-google-play.md` in your project:

- A verdict: ready, almost ready, or not ready.
- Numbered blockers and warnings, each with `file:line` evidence, the quoted store requirement,
  and the exact fix.
- A privacy and data matrix mapped to App Privacy or Data Safety categories, checked against your
  published privacy policy.
- A permissions matrix with each permission traced to the config, plugin or dependency that adds
  it.
- A checklist of the console tasks that can't be seen from the code, and draft reviewer notes.

The audit covers only what your app has. An app with no sign-in and nothing for sale gets a short
report, not a list of rules that don't apply.

## Read-only

- No edits, installs, commits or store API calls. The only file written is the report.
- `git status` is checked before and after, so "no files were modified" is observed, not assumed.
- `.env` files are left unopened, and reviewer credentials are placeholders you fill in.
- Fixes are described, not applied. Apply them in a separate session.

The skill's instructions are what enforce this, so keep your agent's permission prompts on. The
report flags practical gaps between your policy and your code; it is not legal advice.

## Scope

Built for Expo (including continuous native generation) and bare React Native. On other stacks
the skill says so and offers the policy half of the audit only.

## Tested on

The skills were developed and evaluated against one real Expo app with accounts, auto-renewable
subscriptions, health-related data, voice and AI features, and a backend. Guidance for ads,
location, user-generated content, children's apps and physical goods is included but has not
been run against a real app yet, so read those parts of a report with more care.

If the skill misses a rejection reason or flags something wrongly on your app, please
[open an issue](https://github.com/tarek1488/store-submission-readiness-skill/issues) with the
finding. That is how the lighter areas improve.

## Contributing

Guidance both skills share lives in `shared/references/`. Edit it there, then copy it into each
skill:

```bash
node scripts/sync-shared.mjs
```

## License

[MIT](LICENSE)
