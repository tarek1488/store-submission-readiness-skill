# Evidence probes (Expo / React Native)

Every probe here inspects, resolves or reports. None of them is meant to change the project.

The reason to run these rather than read `app.json` alone: the configuration that ships is the
*resolved* configuration. Config plugins and the native manifests inside dependencies add
permissions, services and Info.plist keys that never appear in the project's own files. An
audit based on source config misses exactly the findings that get apps rejected.

The commands are written for a POSIX shell. On Windows, run them through Git Bash or translate
them; the intent of each probe matters more than its exact spelling.

## 0. Bracket the run

Before anything else, in each repository you will inspect:

```bash
git status --porcelain
git rev-parse --short HEAD
```

Record both. Run `git status --porcelain` again at the end and compare. If the output differs,
something you ran wrote to the working tree: say so at the top of the report, name the files, and
do not clean them up yourself — the user decides what to do with them. This check is what lets
the report say "no files were modified" as a fact rather than an intention.

Keep scratch output (resolved config dumps, extracted templates) in a temporary directory outside
the repository.

## 1. Stack and SDK identity

Find the app first — in a monorepo it is often not the working directory. Look for the
`package.json` that depends on `expo` or `react-native`, and treat its folder as the project root
for every command below.

```bash
cat package.json                 # dependencies, scripts, the gates that exist
cat app.json app.config.* 2>/dev/null
cat eas.json 2>/dev/null
ls ios android 2>/dev/null       # present = prebuilt/bare; absent = CNG, generated at build time
```

If `ios/` and `android/` are absent and `app.json` exists, this is continuous native
generation: the native projects are produced during the build, so resolved config is the only
way to see what ships. Do not run a prebuild to look — it writes native folders into the project.

### Feature profile

Before anything store-specific, write down what this app has. The rest of the audit is scoped by
it: a requirement for a feature the app lacks is `N/A`, not a finding. Derive it from the
dependencies and the resolved config, then confirm with the user's interview answers:

| Feature | Where it shows |
|---|---|
| Accounts and sign-in | auth libraries, sign-in screens, a session store |
| Purchases, subscriptions | store or mediator SDKs, a paywall |
| Ads, tracking, analytics | ad or attribution SDKs, analytics SDKs |
| Sensitive permissions | location, camera, microphone, photos, contacts, Bluetooth, health modules |
| Notifications | a push module, token registration |
| Content from users shown to others | feeds, comments, profiles, uploads, chat |
| External AI or speech services | model or transcription calls in the app or the backend |
| Over-the-air updates | an updates module, and whether it is enabled |
| Web content | a WebView as the main surface |
| Audience | anything aimed at children |

State absences with their evidence ("no purchase SDK in `package.json`"), so an `N/A` later in
the report is something you checked rather than something you assumed.

### Is the app already live?

"First submission" is a claim like any other, and the audit changes if it's wrong. Check the
public listings with the identifiers from the config:

```bash
curl -s "https://itunes.apple.com/lookup?bundleId=<bundle-id>"     # resultCount, version, trackId
curl -s -o /dev/null -w "%{http_code}\n" "https://play.google.com/store/apps/details?id=<package>"
```

The Apple lookup searches the US storefront unless you add `&country=<code>`, and a 404 from
Play means "not publicly listed", not "never uploaded" — so a hit proves more than a miss. When
the app is live:

- Compare the released version with `version` in the config. Apple refuses a new build for a
  marketing version that is already released; Play needs only a higher version code. Automatic
  increment settings usually bump the build number or version code and leave the marketing
  version alone, so an unbumped version is a defect you can show.
- Audit it as an update. The reviewer notes have to say what changed since the released version.
- The lookup returns the real numeric app ID, which settles any placeholder found in §6.
- The public listing shows the age rating, description, in-app purchase names and privacy
  labels. Compare them with the code and the terms; a mismatch is a finding with evidence on
  both sides.

## 2. Resolved native configuration

```bash
npx expo config --type introspect --json > <tmp>/introspect.json
```

Then read from that JSON, rather than guessing:

- `android.permissions` and `_internal.modResults.android.manifest.manifest["uses-permission"]`
  — the permissions the manifest will declare.
- `_internal.modResults.android.manifest.manifest.application[0]` — `allowBackup`, services, and
  each service's `foregroundServiceType`.
- `_internal.modResults.ios.infoPlist` — usage-description strings, `UIBackgroundModes`,
  `NSAppTransportSecurity`, URL schemes, supported orientations.
- `_internal.modResults.ios.entitlements` — capabilities such as Sign in with Apple and push.
- `ios.supportsTablet`, `version`, `sdkVersion`.

A caveat worth stating in the report: introspection renders config plugins against a base
template, so a value that looks like a default (App Transport Security, `allowBackup`) should be
cross-checked against the real prebuild template inside `node_modules/expo/template.tgz` before
you call it a finding. Extract the template into the temporary directory, never into the project.

## 3. Permissions that arrive from dependencies

JavaScript-level dependencies ship their own Android manifests:

```bash
find node_modules -path "*/android/src/main/AndroidManifest.xml" -not -path "*/example/*" -print0 |
while IFS= read -r -d '' f; do
  perms=$(grep -oE '<uses-permission[^>]*android:name="[^"]+"' "$f" | sed 's/.*name="//;s/"//' | tr '\n' ' ')
  [ -n "$perms" ] && echo "$f: $perms"
done
```

Native-only libraries (billing clients, messaging SDKs) contribute permissions from their
published artifacts, which aren't in `node_modules`. Those can only be confirmed in the built
bundle, so report them as `🔲` and point the user at the store console's bundle explorer.

If the user has a production build on disk — an `.aab`, `.apk` or `.ipa` — it is the best
evidence there is, because it holds the merged manifest or final Info.plist that actually ships.
Copy it to the temporary directory and unpack it there (all three are zip archives):

- App bundle: `base/manifest/AndroidManifest.xml`, in a binary encoding. Use `bundletool` or
  `aapt2` if one is installed; otherwise the readable strings in the file are enough to list
  permission names and declared services. `base/resources.pb` shows whether push configuration
  such as a sender ID made it into the build.
- iOS archive: `Payload/<App>.app/Info.plist` and the embedded entitlements.

Say in the report which build you read and whether the source has moved since. Don't pull builds
from the build service on your own initiative: that needs the user's login, so ask for a path in
the interview and treat "none" as the normal case.

To find which package introduces a specific permission or entitlement:

```bash
grep -rln "<PERMISSION_NAME>" node_modules --include=*.xml --include=*.js --include=*.gradle
```

That is how you attribute a surprising permission to the config plugin that added it, and
usually the plugin has an option to turn the underlying feature off.

## 4. Effective Android SDK levels

Don't assume the framework version satisfies the current target-API requirement; show it:

```bash
grep -iE "minSdk|targetSdk|compileSdk" node_modules/react-native/gradle/libs.versions.toml
grep -rn "targetSdkVersion" node_modules/expo-modules-autolinking/android --include=*.kt | head
```

The version catalogue holds the numbers; the autolinking plugin is what applies them to every
module. Report the number and where it came from.

## 5. Project gates

Run the checks the project already has, and report every failure verbatim:

```bash
npx expo-doctor
npm run typecheck   # or npx tsc --noEmit
npm run lint
npm run format:check
npx jest --silent   # or the project's own test script
```

These are not store requirements, but a failing gate is a reason to delay a submission, and
`expo-doctor` surfaces dependency mismatches that cause build-time surprises.

Run the gates of the app being submitted, and only those. The backend and website are read for
the data inventory, not tested: their suites usually need a database or containers, and a
failure there says something about the audit machine and nothing about store readiness.

Two cautions, both about staying read-only:

- Run a gate only if the project has already set it up. A lint command in a project with no
  lint configuration may offer to install and configure one; decline, and report the gate as not
  configured.
- Never pass a flag that rewrites files (`--fix`, `--write`, `-u`), and don't accept a prompt to
  install or upgrade anything.

Gates may write caches into ignored directories. That is expected; the bracket in §0 tells you
whether anything tracked changed.

## 6. Identifiers and placeholders that must match the store identity

Hard-coded identifiers drift from the real ones, and the result is a flow that fails only in the
released app:

```bash
grep -rnE "<bundle-id-prefix>|apps\.apple\.com|play\.google\.com/store|market://|itms-apps://" src app.json
grep -rnE "REPLACE_|CHANGEME|YOUR_[A-Z_]+|TODO|example\.com" src app.json eas.json
```

Compare every store link, package name and app ID found in the source against the bundle
identifier and package name in the resolved config. A store link built from a slightly different
package name, or an app ID still set to a placeholder, breaks update prompts, rating prompts and
subscription-management links — and a forced-update screen that can't open the store is a dead
end for the user.

## 7. Published pages and production endpoints

```bash
for u in <privacy_url> <terms_url> <deletion_url> <api_base>; do
  printf "%s -> " "$u"; curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L --max-time 15 "$u"
done
```

A policy URL that doesn't return 200 is a blocker on both stores. Then fetch the policy text and
compare it against the data inventory — see `data-inventory.md`.

## 8. Production configuration

Establish which configuration the production build will use, working from names and code rather
than from stored values:

- Read `.env.example` and the places the code reads configuration to learn which variables
  exist and what each is for. Leave `.env` and other local environment files unopened: they hold
  the developer's working values, they are not what a hosted production build uses, and nothing
  in this audit needs their contents.
- Check how the client distinguishes public from server-side configuration. In Expo, only
  `EXPO_PUBLIC_`-prefixed variables are inlined into the app bundle, so a variable that is meant
  to stay on the server or in the build pipeline must not carry that prefix.
- Check that the code reads its API base URL from configuration and that the example and the
  documentation point it at an HTTPS production host.
- Check whether the code refuses sandbox or test-mode payment configuration in a release build,
  and say so either way.

What the hosted build service is actually configured with lives in that service, not in the
repository. Report it as `🔲` and tell the user where to look (for EAS: the project's environment
variables for the production environment). Offer the listing command as something the user can
run themselves if they want it in the report; it needs their login and prints the non-secret
values, so it is their call, not a default step.

## 9. Store assets

```bash
node -e 'const b=require("fs").readFileSync(process.argv[1]);console.log(b.readUInt32BE(16)+"x"+b.readUInt32BE(20),"colorType="+b[25])' <icon.png>
```

Confirms icon dimensions and whether an alpha channel is present. Note that some build
pipelines flatten transparency for the store icon automatically; check the pipeline before
reporting it as a defect.

## 10. Flow tracing (reading, not running)

For each flow the stores care about, follow the code and record where it can dead-end. Trace
the ones the feature profile says exist, and skip the rest:

- **First launch** → auth → onboarding → home.
- **Permission-gated feature** → is the permission requested at the point of use, with an
  in-context explanation first?
- **Purchase** → paywall → purchase → entitlement → relaunch → entitlement still active.
- **Restore** → reinstall or second device → sign in → restore.
- **Account deletion** → entry point → confirmation → server call → data removal → local
  session cleared → what happens on failure.
- **Update prompts and store links** → does every exit from a blocking screen lead somewhere?
- **Notifications** → permission prompt → token registration → who sends? A prompt for a
  feature that nothing delivers has no purpose to disclose. Check that delivery can work on each
  platform: a sender exists, and on Android the push configuration file is referenced in the
  config and a notification channel is created before the permission request.

On each platform, check that every visible control can work there. A sign-in button or feature
entry point that is rendered on a platform where its implementation returns "unavailable" is a
defect a reviewer will find in the first minute.

Note request timeouts on calls that must not fail silently (deletion, purchase activation), and
note any state that can show a spinner with no exit.
