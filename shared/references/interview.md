# The interview

Most of the audit comes from the repository and from official policy pages. A handful of facts
can't be derived from either: where the published policy pages live, where the rest of the
system's code is, what the product does that the stores care about, and which console
declarations are already filed. Ask for those once, in a single batch, then get out of the
user's way.

Ask before running the long probes, so the answers are available while reading the code. Use
the host's structured question tool when it has one; otherwise ask as a short numbered list and
accept a single paste-in answer.

Read the invocation message first. Anything the user already told you — a policy URL, a backend
path, "first submission" — is answered; don't ask it again. If that leaves nothing to ask, say
which folder and report path you're using in one line and carry on.

## The batch

1. **App folder and report path** — less a question than a statement the user can correct: name
   the folder you found the app in, and say the report will go to
   `docs/app-submission-readiness-<store>.md` inside it. If several folders could be the app,
   ask which. Settling both here means nothing interrupts the run later.
2. **Published policy pages** — the live URL of the privacy policy, the terms of service, and
   (if separate) a web page describing account deletion. "Not published yet" is a valid answer
   and becomes a finding rather than a blocked audit.
3. **Support contact** — the support URL or email the store listing will use.
4. **Where the rest of the code lives** — the path to the backend or API source, and to the
   website source if the policy pages are built from a repository you can read. The mobile app
   alone can't tell you what the server stores, which processors it calls, or what account
   deletion really removes, so without the backend those parts of the data inventory are
   reported as unverified. "Not available" is a valid answer.
5. **What the app does that the stores treat specially** — account creation; location, camera,
   microphone, photos or contacts; health, financial or children's data; content from users
   that other users see; ads or third-party analytics; external AI or speech services; whether
   children are in the audience; and whether it sells digital goods, physical goods, or nothing.
   You will confirm each from the code; asking first tells you where to look and catches
   features that live only on the server. "None of these" is a fine answer and shortens the
   audit.
6. **Store identity and builds** — bundle identifier and/or package name, and whether this is
   the first submission or an update to a live app. You will check the public listing either
   way (`evidence-probes.md` §1). Also ask whether a production build file is on disk; if one
   is, its path, because it shows exactly what ships.
7. **Already-filed declarations** — which of these are done: age/content rating, privacy or
   data-safety answers, health-related declarations, account-deletion declaration, ads
   declaration. Anything the user says is filed, you still check for *consistency with the
   code*, but you report it as filed rather than missing.
8. **Monetization** — free, paid up front, ads, in-app purchases or subscriptions? If it sells
   anything in the app, which provider mediates purchases (direct store APIs, or a service such
   as RevenueCat), and are free trials or introductory offers configured?
9. **Anything intentionally out of scope** — a known limitation the user has already decided to
   ship with. Record it as an accepted risk instead of re-litigating it.

## Follow-ups worth asking only when the code raises them

Don't front-load these. Ask when a probe turns one up, because then the question is concrete:

- A third-party processor appears in the code (speech-to-text, a model provider, analytics) but
  not in the published policy → "is this provider meant to be listed in the policy, or is it
  being replaced before launch?"
- Credentials are needed to reach the main flow → "what demo account should reviewers use?"
  Never invent one; leave a placeholder in the review notes.
- A permission is declared that nothing in the code calls → "is this feature planned for this
  release, or can the permission be dropped?"

## When you can't ask

In a non-interactive run there is nobody to answer. Take what the invocation message gives you,
use the app folder you found and the default report path, discover what you can from the code
(legal URLs and support addresses are often constants), and record every remaining question as
an open item in the report. State any assumption you had to make — for example "treated as a
first submission" — in the executive summary, where the reader will see it, rather than letting
it shape findings silently.

## What to do with "I don't know"

Treat it as `🔲 Manual verification required` and name the screen where the user can look it
up. An unanswered question is an open item, not a defect and not a reason to stop.
