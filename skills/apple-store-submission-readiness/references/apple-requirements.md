# Apple: what to check, and where the rule lives

Treat this file as a map of where rejections come from, not as the current text of the rules.
Fetch the pages in `official-sources.md` and quote the live wording in
each finding, because the guidelines are explicitly a living document.

## Start from what this app has

Apps differ, and most of this file is conditional. "Build and upload validity", "Permissions and
usage strings", "Privacy", "Metadata and device support" and "Reviewer experience" apply to
every app. Every other section applies only when the feature profile (`evidence-probes.md` §1)
says the app has that feature. For a section that doesn't apply, write one `N/A` line with the
evidence of absence and move on; a note-taking app with no accounts and no purchases has a short
audit, and that is the right result.

The reverse matters as much: this map is not exhaustive. If the app does something the
guidelines treat specially that isn't listed here — gambling, crypto, VPN, medical devices,
loans, dating, streaming games — find the section of the live guidelines that covers it and
audit against that text.

## Build and upload validity

These stop the upload rather than the review, so they come first:

- **SDK / toolchain minimum.** Apple sets a date after which uploads must be built with a given
  Xcode and platform SDK. Check the upcoming-requirements page for the current date and version,
  then check what the project's build pipeline uses. For hosted builds, the build image
  determines this, so if you can't read the image configuration, mark it `🔲`.
- **Privacy manifest and required-reason APIs.** The app and its SDKs must declare approved
  reasons for certain APIs. In a React Native project, the CocoaPods integration aggregates the
  manifests of pods that ship one; verify the mechanism exists in the project's dependency
  tooling and point the user at Xcode's privacy report on the archive for final confirmation.
  Also check whether any SDK on Apple's list of SDKs that require a signature and manifest is
  present.
- **Encryption declaration.** `ITSAppUsesNonExemptEncryption` in Info.plist, or the export
  compliance questions at submission.
- **Bundle identity.** Bundle ID, marketing version, build number, and whether build numbers
  increment automatically. If the public listing shows the app is live, the marketing version
  must be higher than the released one — automatic build-number increments don't do that, and
  the upload is refused otherwise.
- **Device family and orientation.** Whether iPad is supported, and whether the declared
  orientations match what the UI actually handles.

## Permissions and usage strings

Every permission needs a purpose string that describes the actual use in plain language, and
the prompt should appear when the user reaches the feature rather than at launch. Read the
resolved Info.plist for the full set, then check each one against code that uses it. A
permission with no caller is a finding: either dead configuration or an undisclosed feature.

If the app shows its own screen before a system prompt, look at the buttons. A pre-prompt whose
exit ("Not now", "Skip") avoids the system prompt has drawn rejections under 5.1.1(iv); the
expected pattern is a neutral "Continue" that always leads to the system prompt. Report it as a
warning and say that it rests on review practice rather than a sentence you can quote.

Some permissions have their own traps. Location: "always" and background access need a feature
the user can see running, and the string must say why background access is needed. Photos: an
app that only lets the user pick an image doesn't need full library access, because the system
picker requires no permission. Camera, contacts, Bluetooth and motion: each needs a string that
names the feature, not "to improve your experience". Background modes in the resolved
Info.plist must each match a feature that uses them (2.5.4).

Pay attention to strings inherited from development tooling — a local-network usage description
added by a development client is harmless at runtime but worth reporting, since it describes
behaviour the shipped app doesn't have.

## Authentication

- If the app uses a third-party or social login to establish the primary account, guideline 4.8
  requires an equivalent privacy-preserving option, with specific properties about data
  collection and email privacy. Verify the equivalent option exists, is presented with
  comparable prominence, and actually works on first login, on return, and for relay-email
  users.
- Account identity must not rest on the email address alone, since relay addresses and provider
  email changes break that assumption. Look for the provider's stable subject identifier.
- Cancelling a sign-in must leave the user on a usable screen.
- A frequent, concrete rejection: asking the user to type a name or email that Sign in with
  Apple already supplied. If the app requests only the email scope and then requires name entry
  during onboarding, report it, and prefer the fix of requesting the full-name scope and
  pre-filling from the credential on first authorization.

## Account deletion

Required whenever the app supports account creation. Check the whole chain: discoverable entry
point in settings, a real confirmation, a server call that deletes the account record and
associated data, cleanup of local session and cached state, and sensible failure handling.
Temporary deactivation alone doesn't satisfy it, and support-only flows are restricted to
narrow categories of app.

Two specifics worth their own findings:

- Subscribers must be told that billing continues through the store and asked to cancel
  separately.
- Apps offering Sign in with Apple are directed to revoke tokens through the Sign in with Apple
  REST API on deletion. An implementation that only deletes the local account record doesn't do
  this, and the identity flow used for sign-in determines whether the credential needed for
  revocation was ever captured.

## Privacy

- Build the inventory (`data-inventory.md`) and map it to the App
  Privacy questionnaire's categories: contact info, health and fitness, user content,
  identifiers, purchases, usage data, diagnostics, and so on. Explain why each category applies
  rather than asserting it.
- If the app handles health, fitness or medical data, it carries extra duties, including
  restrictions on sharing for advertising or data mining. Apps that record weight, diet,
  symptoms or cycles are in scope even without HealthKit.
- Tracking has a narrow definition and triggers App Tracking Transparency. Don't declare
  tracking for first-party analytics that doesn't link to other companies' data. If an ad or
  attribution SDK is present, check that the tracking prompt appears before any tracking
  starts, that the app works when the user declines, and that the App Privacy answers say
  tracking is used.
- Guideline 5.1.2(i) governs sharing personal data with third parties, including third-party AI
  services, and the current text addresses disclosure and permission. Fetch it and read it
  closely when the app sends user content — audio, text, images — to an external model or
  speech provider. Determine whether the app's existing disclosure and consent satisfy the live
  wording, quote that wording, and if consent is missing, describe the smallest in-app change
  that would obtain it.

## Purchases and subscriptions

Applies only if the app sells something. First decide what is being sold, because the rule
differs: digital content and features unlocked in the app must use in-app purchase (3.1.1);
physical goods and services consumed outside the app must not (3.1.3). An app that takes
payment for digital goods through a web checkout or an external link is the defect to look
for, and the live text of 3.1.1 and 3.1.3 decides the exceptions. For consumables and one-time
unlocks, check that non-consumables can be restored.

For subscriptions:

- The purchase screen should state what the subscription unlocks, the price, the billing period,
  that it renews automatically, and the terms of any trial or introductory offer. If the code
  never reads introductory-offer fields but the store has one configured, the disclosure will be
  missing at runtime.
- Restore must be available where purchases can be restored.
- Links to terms and privacy should be reachable from the purchase flow.
- Verify the entitlement survives a relaunch and a reinstall, and that expiry, cancellation and
  billing-retry states resolve to the right access level.
- For a first submission, the first auto-renewable subscription is submitted together with the
  app version, and the paid-applications agreement, tax and banking details must be in place.
  These are console tasks: report them as such rather than as code defects.

## Content from users

If users can post anything other users see — text, images, profiles, names on a leaderboard —
guideline 1.2 asks for a way to filter objectionable material, a way to report it, the ability
to block abusive users, and published contact information. Look for each in the code. Apps
where content is visible only to its author are out of scope.

## Children

If the app is aimed at children or sits in the Kids category, 1.3 and 5.1.4 restrict third-party
analytics and advertising and require parental gates on links out of the app and on purchases.
Check the SDK list against those limits. For other apps, check that the age rating answers match
what the app actually contains.

## Downloaded code and web content

- If over-the-air updates are enabled, 2.5.2 limits what downloaded code may change. Fixes and
  content are the intended use; an update that changes the app's purpose or adds an unreviewed
  feature is not. Report whether updates are on, and which channel the production build reads.
- An app whose main surface is a website in a WebView risks 4.2 (minimum functionality). Say so
  when that is what the code shows.
- A development client must not be what ships. Check that the production build profile doesn't
  produce a development build.

## Notifications

If the app requests notification permission: push must not be required for the app to work, and
marketing notifications need an opt-in and a way to opt out (4.5.4). Check that something
actually sends notifications, and that the pre-prompt, if there is one, says what will arrive.

## Health and medical content

Applies to apps that give health, fitness or medical information or measurements. They attract
more scrutiny. Accuracy claims about health measurements need supporting data and methodology.
Search the product copy for claims of diagnosis, treatment, clinical validation or guaranteed
outcomes, and check that estimated values are labelled as estimates in the interface rather
than presented as measured facts.

## Metadata and device support

- If the config enables iPad support, the app is reviewed on iPad and needs iPad screenshots.
  Check that layouts and orientations hold there. An iPhone-only app still runs on iPad in
  compatibility mode, so a layout that breaks at small sizes can be found either way.
- Placeholder text, test data and "coming soon" screens are incomplete-app findings (2.1).
- References to other platforms in the app or its metadata — an "also on Android" banner, a
  Play badge — are a 2.3.10 finding. Search the copy and the assets.
- Screenshots and description have to show the app as it is (2.3). You can't see the store
  listing unless it is public; if the app is live, compare the listing with the code.

## Reviewer experience

Decide whether a reviewer can exercise the whole app on a fresh device. If a login, a
subscription, or a hardware capability stands in the way, draft review notes covering demo
credentials (as placeholders), how to reach the main flow, what any permission is used for, and
how automated or estimated results are produced.
