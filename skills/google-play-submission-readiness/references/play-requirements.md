# Google Play: what to check, and where the rule lives

A map of where Play rejections and policy flags come from. The numbers and deadlines change, so
fetch the pages listed in `official-sources.md` and quote the live text
in each finding.

Audit Android on its own terms. An app that is clean on the other store can still fail here,
because the declarations, the permission model and the testing requirements are different.

## Start from what this app has

Apps differ, and much of this file is conditional. "Build and bundle", "Permissions", the Data
safety form and the release process apply to every app. Accounts, purchases, ads, content from
users, health features and children's audiences apply only when the feature profile
(`evidence-probes.md` §1) says the app has them. For a part that doesn't apply, write one `N/A`
line with the evidence of absence and move on. A simple app should get a short audit.

The reverse matters as much: this map is not exhaustive. If the app does something Play
regulates that isn't listed here — financial services, gambling, VPN, news, government,
crypto, accessibility services — find the matching policy page and audit against its live
text. The App content page in the console also adds declarations over time; tell the user to
complete whatever it lists rather than relying on this file's list.

## Build and bundle

- **Target API level.** New submissions and updates must target a given API level by a stated
  date, with a possible extension window. Read the current requirement from the support page,
  then show the project's *effective* target level from the resolved native configuration — not
  from the framework version, and not from an assumption that the framework is current.
  Report the number and where it came from.
- **App bundle.** Play requires an Android App Bundle for new apps. Check what the release build
  profile produces.
- **16 KB page size.** Apps with native libraries that target recent API levels must support
  16 KB memory pages. Read the current rule, then check the framework version's own support
  and any native dependency that ships prebuilt libraries. Only the built bundle proves
  alignment, so without one this is a manual check.
- **Package identity and version code.** Package name, version code source, and whether it
  increments automatically. Check the public listing to see whether the app is already live,
  and if a production bundle is on disk, read the target level and permissions from it.
- **Signing.** Note that Play App Signing re-signs the upload. The practical consequence is in
  the OAuth section below.
- **Icons and store assets.** Adaptive icon layers, optional monochrome layer, and the listing
  assets the console requires.
- **Network and backup.** Whether cleartext traffic is permitted in release builds, and whether
  automatic backup is enabled. Backup that includes authentication state is worth flagging even
  though it isn't a policy violation.
- **Exported components and deep links.** Any exported activity or service, and whether declared
  link schemes are intentional.

## Permissions

List every permission the shipped manifest will contain, and attribute each one to its source:
the project's own configuration, a config plugin, a dependency's bundled manifest, or a native
artifact resolved at build time. For each, decide whether the app actually uses it.

Points that attract policy attention:

- Microphone, camera, location and contacts need a clear in-app purpose, and the permission
  prompt should come at the point of use.
- Foreground service types require a qualifying user-visible use and a justification in the
  console. A foreground service permission added by a dependency's default options is a common
  and avoidable finding — check whether the plugin has an option to disable the feature.
- Notification permission on modern Android versions, and whether the app asks in context.
  Also check that push can actually arrive: a push configuration file referenced in the app
  config, a notification channel created before the permission request, and something that
  sends. A prompt for notifications that can't be delivered is a finding.
- Storage and media permissions are frequently inherited and frequently unnecessary. Broad
  photo and video access is restricted to apps whose core purpose needs it; an app that only
  lets the user pick an image should use the system picker and drop the permission.
- Background location needs a declaration form, an in-app disclosure before the prompt, and a
  feature that genuinely depends on it. Foreground-only location does not.
- Other permissions with their own declaration or restriction: all-files access, querying all
  packages, exact alarms, full-screen intents, accessibility services, SMS and call log. If any
  is in the effective set, fetch its page and check the app's use against it.
- Advertising identifier: declare whether it's used. A self-generated install identifier is not
  an advertising identifier.
- Package visibility queries, if present.

Where a permission can only be confirmed in the built artifact, say so and point the user at the
bundle explorer in the console.

## Declarations the console requires

These are console tasks, but each one has to match the code, which is what makes them part of
the audit:

- **Data safety.** Build the inventory first (`data-inventory.md`), then
  map it to Play's categories, marking for each: collected, shared, required or optional,
  encrypted in transit, deletable on request, and whether processing is ephemeral. Ephemeral
  processing is the right answer for data that is sent to a service, used to answer the request,
  and not retained — and it has to be true in the code.
- **Health apps declaration.** Every developer completes the form, including declaring that no
  health features are offered. For an app with health or fitness functionality, select the
  categories that match the real feature set. Don't select medical categories for an app that
  tracks rather than diagnoses or treats, and don't understate categories to avoid the form.
- **Account deletion.** Applies only if the app lets users create an account. Play expects an in-app deletion path *and* a publicly reachable web
  resource where deletion can be requested. The web page must load, be scoped to this app or
  developer, and make the request path easy to find. Verify the page exists, loads, and
  describes what deletion removes in terms that match the implementation.
- **Content rating, target audience, ads declaration.** Check these against the app's actual
  content and monetization, and against any age limit stated in the terms.
- **App access.** If sign-in is required, reviewers need instructions and credentials. Leave
  credentials as placeholders.

## Policy areas worth reading the code for

- **Broken or incomplete functionality.** A visible control that only produces an error is a
  real risk here. A sign-in option that cannot work on Android — for instance a provider button
  shown on both platforms but implemented only for the other one — is the classic example, and
  the fix is usually to hide the control on the platform where it isn't supported.
- **Payments.** If the app sells digital content or features, they go through Play's billing
  system; physical goods and real-world services do not. A web checkout or external link for
  digital goods is the defect to look for, subject to the exceptions in the live policy.
- **Ads.** If an ad SDK is present: the ads declaration says "contains ads", the advertising ID
  permission and declaration match, ads don't imitate the app's own controls or interrupt in
  ways the Ads policy forbids, and the SDK is acceptable for the declared audience.
- **Children.** If the target audience includes children, the Families policies apply: only
  approved ad SDKs, no advertising ID for child users, and stricter data rules. The target
  audience answer, the content rating and any age gate in the code have to agree.
- **Content from users.** If users can post anything other users see, Play expects moderation,
  in-app reporting and blocking, and terms that define what is objectionable.
- **Generated content.** If the app produces text, images or audio with a generative model,
  Play expects a way to report offensive output from inside the app.
- **Health and medical claims.** For apps with health features, search product copy for diagnosis, treatment, clinical
  validation or guaranteed outcomes. Check that estimated or automated values are labelled as
  estimates.
- **Deceptive behaviour and misleading claims.** Compare what the store listing and paywall
  promise against what the code delivers, including words like "unlimited" where a server-side
  limit exists.
- **Subscriptions.** If the app has them: price, billing period, renewal, and trial terms disclosed before purchase;
  cancellation and management reachable; entitlement correct across expiry, cancellation and
  billing retry.

## The OAuth signing pitfall

If the app uses Google sign-in, it only works for Play-distributed builds when the SHA-1 of the
Play App Signing certificate is registered on the Android OAuth client. The upload key's
fingerprint alone is not enough. When this is missing, sign-in works in internal testing builds
and fails for the reviewer, which looks like a broken app. This can't be verified from the
repository, so raise it as a high-priority manual task with the exact console screens: the app
signing page for the fingerprint, and the cloud console's credentials page to add it.

## Release process

New developer accounts may face additional requirements before production access, such as a
closed test of a given size and duration. Check the current rule and the account type rather
than assuming, and present it as a scheduling constraint — it changes *when* the user can
submit, which is the question the report answers.
