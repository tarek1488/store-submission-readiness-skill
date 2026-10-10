# Data inventory and policy comparison

Both stores ask the same underlying question in different forms: *what does this app collect,
who else receives it, and does your published policy say so?* Build the inventory once from the
code, then project it onto each store's questionnaire.

## Build it from the code, not from the policy

Read the policy last. If you read it first, you'll find yourself confirming it instead of
auditing it. Work outward in three rings:

1. **The app itself** — every field the UI collects or stores: account identifiers, profile
   details, user-entered content, media, device identifiers, local storage.
2. **The backend** — what the server persists, and what it only holds for the length of a
   request. These are different declarations, and the difference is often the most important
   fact in the whole report.
3. **Third-party SDKs and services** — anything that receives data: authentication providers,
   payment or subscription mediators, crash and analytics services, push delivery, model and
   speech providers, hosted databases, search or vector services.

For each item record: stored or transient, linked to the user's identity or not, purpose,
destination, and what happens to it on account deletion.

## The table to produce

| Data | Stored | Linked to user | Purpose | Processors | Store category |
|---|---|---|---|---|---|

Fill `Store category` with the target store's own vocabulary — see the store-specific reference
file for the category lists.

## Judgement calls that matter

- **Transient vs collected.** Data that is sent to a service, used to answer the request, and
  then discarded is often *not* "collected" under the stores' definitions — but it is still a
  transfer to a third party, so it belongs in the policy and usually in an ephemeral-processing
  checkbox. Say which of the two you concluded, and why.
- **Sensitive categories.** Location, contacts, photos and media, messages, financial details,
  health and body data, and anything about children carry extra duties on both stores. Which
  ones matter depends entirely on the app, so start from the inventory, not from a list. For
  each one present, quote the store's own definition of the candidate categories and say which
  you chose and why. The lines are often not obvious: precise versus approximate location, or
  health versus fitness for weight and nutrition data. Don't downgrade a category because the
  app is "just" a tracker, a map or a chat.
- **Analytics is not automatically tracking.** Tracking has a narrow definition: linking user or
  device data with data from other companies for advertising or measurement, or sharing it with
  data brokers. First-party crash reporting with no advertising identifier is not tracking. Say
  so explicitly rather than leaving it ambiguous.
- **Identifiers.** Distinguish a self-generated install identifier from a platform advertising
  identifier. Only the latter carries the advertising declarations.
- **User-generated content that outlives the account.** Anything contributed to a shared corpus
  needs the policy to state whether it survives deletion and whether it is detached from the
  author.

## Comparing against the published policy

Fetch the live policy and the terms. Then look for four specific kinds of mismatch, because
these are the ones that turn into store problems:

1. **Missing processor** — the code sends data somewhere the policy never names.
2. **Wrong processor** — the policy names a provider the code doesn't use, usually because the
   implementation changed. This reads as inaccurate disclosure even though it looks harmless.
3. **Retention contradiction** — the policy says something isn't kept while the code stores it,
   or promises a deletion window the implementation doesn't meet.
4. **Deletion mismatch** — the policy's list of what deletion removes doesn't match what the
   deletion path actually removes, in either direction. Over-promising is a compliance problem;
   describing data the app doesn't even have is a credibility problem and confuses reviewers.

Report each mismatch with the policy sentence quoted and the code evidence beside it. Flag
practical inconsistencies for the owner to resolve; don't present conclusions about legal
adequacy, which isn't yours or the model's call.

## Where declarations and policy must agree

The store questionnaire answers, the published policy, and the code all need to tell one story.
When the user says a questionnaire is already filed, your job is to check that the code still
matches what was declared — a feature added after the declaration is the usual way these drift
apart.
