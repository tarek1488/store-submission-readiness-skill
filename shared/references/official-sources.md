# Official sources, and why to fetch them every run

Store requirements move, and they move on dates that matter: minimum SDK versions, target API
levels, new questionnaire sections, new disclosure duties. A model's training data is the wrong
place to learn the current deadline from, and an audit that cites a superseded rule is worse
than one that admits uncertainty.

So: fetch the primary pages at the start of each audit, and quote them in the report. If the
network is unavailable, say so in the executive summary and mark every date-sensitive item
`🔲 Manual verification required` rather than filling it in from memory.

Prefer first-party sources. Blog posts and aggregators are useful for orientation and wrong
often enough to be dangerous as citations.

Each store has pages every audit needs and pages that matter only when the app has the feature.
Fetch the first group every run, and the second according to the feature profile
(`evidence-probes.md` §1) — reading the ads policy for an app with no ads is wasted effort, and
skipping it for an app that has them is a gap.

## Apple

Every run:

- App Review Guidelines — `https://developer.apple.com/app-store/review/guidelines/`
- Upcoming requirements (SDK and submission deadlines) — `https://developer.apple.com/news/upcoming-requirements/`
- App privacy details on the App Store — `https://developer.apple.com/app-store/app-privacy-details/`
- Privacy manifests and required-reason APIs — `https://developer.apple.com/documentation/bundleresources/privacy-manifest-files`
- Third-party SDK requirements — `https://developer.apple.com/support/third-party-SDK-requirements/`
- App Store Connect Help — `https://developer.apple.com/help/app-store-connect/`

When the app has the feature:

- Accounts → Offering account deletion — `https://developer.apple.com/support/offering-account-deletion-in-your-app/`
- Subscriptions → Auto-renewable subscriptions — `https://developer.apple.com/app-store/subscriptions/`
- Ads, analytics or any cross-company data use → User privacy and data use — `https://developer.apple.com/app-store/user-privacy-and-data-use/`
- iPad support or store assets in scope → Screenshot specifications — `https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/`

## Google Play

Every run:

- Developer Policy Center — `https://play.google.com/about/developer-content-policy/`
- Target API level requirements — `https://support.google.com/googleplay/android-developer/answer/11926878`
- Data safety — `https://support.google.com/googleplay/android-developer/answer/10787469`
- User Data policy — `https://support.google.com/googleplay/android-developer/answer/10144311`
- Permissions and APIs that access sensitive information — `https://support.google.com/googleplay/android-developer/answer/9888170`
- Health apps declaration (every app files it, including to say "none") — `https://support.google.com/googleplay/android-developer/answer/14738291`
- App testing requirements for new personal developer accounts — `https://support.google.com/googleplay/android-developer/answer/14151465`
- 16 KB page size support (apps with native libraries) — `https://developer.android.com/guide/practices/page-sizes`

When the app has the feature:

- Accounts → Account deletion requirements — `https://support.google.com/googleplay/android-developer/answer/13327111`
- Purchases → Payments — `https://support.google.com/googleplay/android-developer/answer/9858738`
- Subscriptions — `https://support.google.com/googleplay/android-developer/answer/140504`
- Ads → Ads policy — `https://support.google.com/googleplay/android-developer/answer/9857753`
- Children in the audience → Families policies — `https://support.google.com/googleplay/android-developer/answer/9893335`
- Content from users shown to others → User Generated Content — `https://support.google.com/googleplay/android-developer/answer/9876937`
- Generated text, images or audio → AI-Generated Content — `https://support.google.com/googleplay/android-developer/answer/14094294`
- Photo, video or other restricted permissions → `https://support.google.com/googleplay/android-developer/answer/14115180`
- Background location → `https://support.google.com/googleplay/android-developer/answer/9799150`
- Foreground services or full-screen intents → `https://support.google.com/googleplay/android-developer/answer/13392821`
- Health features → Health Content and Services — `https://support.google.com/googleplay/android-developer/answer/9878878`

## Framework and service documentation

- Expo application services and config — `https://docs.expo.dev/`
- Android developer documentation — `https://developer.android.com/`
- The subscription provider's own docs, when one mediates purchases.

## How to cite

In each finding, quote the sentence that creates the obligation and name the page it came from.
One quoted sentence beats three paragraphs of summary: the user can act on it, and a reader can
check it. When a page gives a date, carry the date into the report, because "required since" and
"required from" lead to different decisions about whether to submit today.
