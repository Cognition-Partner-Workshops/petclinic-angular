# Angular upgrade notes

The frontend was upgraded from Angular 16 to Angular 22 in successive major
versions. The application retains its NgModule architecture, zone.js-based
change detection, Karma/Jasmine tests, Bootstrap 3 styling, and flat `dist/`
output.

## Before and after

| Package or runtime | Before | After |
| --- | --- | --- |
| Node.js | No declared requirement; baseline tested on 18.20.8 | Node 22, minimum `^22.22.3`; final gate on 22.23.3 |
| Angular framework | 16.2.1 | 22.2.1 |
| Angular CLI | 16.2.0 | 22.2.2 |
| Build tooling | `@angular-devkit/build-angular` 16.2.x | `@angular/build` 22.2.2 |
| Material/CDK | 16.2.1 | 22.2.1 |
| TypeScript | 4.9.5 | 6.0.3 |
| RxJS / zone.js | 6.3.1 / 0.13.1 | 7.8.2 / 0.16.3 |
| tslib | 2.0.0 | 2.8.1 |
| Bootstrap / jQuery | 3.3.7 / 3.3.1 | 3.4.1 / 3.7.1 |
| Moment | 2.29.4 | 2.31.0 |
| ESLint / angular-eslint | 8.39.x / 16.1.x | 9.39.5 / 22.5.0 |
| Karma / Jasmine | 6.3.16 / 3.6 | 6.4.4 / 5.13 |

`.nvmrc` selects Node 22; `package.json` requires `^22.22.3`.

## Major-version hop summary

| Hop | Node | Exact update command | Resulting versions | Commit |
| --- | --- | --- | --- | --- |
| 16 → 17 | 18.20.8 | `npx ng update @angular/core@17 @angular/cli@17 @angular/material@17 @angular-eslint/schematics@17` | Angular 17.3.12; CLI/build 17.3.17; Material/CDK 17.3.10; TS 5.4.5; angular-eslint 17.5.3; zone.js 0.14.10 | `0c97eac` |
| 17 → 18 | 20.20.2 | `npx ng update @angular/core@18 @angular/cli@18 @angular/material@18 @angular-eslint/schematics@18` | Angular 18.2.14; CLI/build 18.2.21; Material/CDK 18.2.14; TS 5.4.5; angular-eslint 18.4.3; zone.js 0.14.10 | `e05f66f` |
| 18 → 19 | 20.20.2 | `npx ng update @angular/core@19 @angular/cli@19 @angular/material@19 @angular-eslint/schematics@19` | Angular 19.2.25; CLI/build 19.2.27; Material/CDK 19.2.19; TS 5.8.3; angular-eslint 19.8.1; zone.js 0.15.1 | `1491144` |
| 19 → 20 | 20.20.2 | `npx ng update @angular/core@20 @angular/cli@20 @angular/material@20 @angular-eslint/schematics@20` | Angular 20.3.33; CLI/build 20.3.39; Material/CDK 20.2.14; TS 5.8.3; angular-eslint 20.7.0; zone.js 0.15.1 | `176c293` |
| 20 → 21 | 20.20.2 | `npx ng update @angular/core@21 @angular/cli@21 @angular/material@21 @angular-eslint/schematics@21` | Angular 21.2.25; CLI/build 21.2.26; Material/CDK 21.2.14; TS 5.9.3; angular-eslint 21.4.0; zone.js 0.15.1 | `f4a794a` |
| 21 → 22 | 22.23.3 | `npx ng update @angular/core@22 @angular/cli@22 @angular/material@22 @angular-eslint/schematics@22 --allow-dirty` | Angular 22.2.1; CLI/build 22.2.2; Material/CDK 22.2.1; TS 6.0.3; angular-eslint 22.5.0; zone.js 0.16.3 | `407b405` |

The follow-on commits were `b410b57` (API/test modernization), `6f1823b`
(initial upgrade notes), `196b406` (remaining deprecated APIs, see
"Follow-up fixes" below) and a final docs commit expanding these notes.

## Per-hop details

### Angular 16 → 17

- Node 18.20.8; the installed CLI was old, so the update used temporary CLI
  17.3.17. CLI migrations replaced deprecated workspace options in
  `angular.json`; core, Material, and CDK made no source changes. The
  Material migration skipped the Protractor project because no tsconfig could
  be determined for it.
- `npm ci`, production build, headless tests (43), and lint passed. No blocker,
  peer override, or `--force`.

### Angular 17 → 18

- Node 20.20.2. The HTTP provider migration changed `AppModule`, six services,
  and six service specs to provider functions. The optional
  `use-application-builder` migration was offered but deferred.
- Attempts to run that optional migration did not apply changes: an unpinned
  CLI selected temporary CLI 22.2.2 and rejected Node 20; pinning CLI 18 with
  `--name` reported the package was not installed; `--from` and `--name` are
  mutually exclusive.
- Initial test compilation failed because Angular 18 removed `async` from
  Angular testing. The owner-add, owner-edit, and specialty-add specs switched
  to `waitForAsync` (and an unnecessary wrapper was removed); tests then
  passed (43). No `--force` or peer bypass.

### Angular 18 → 19

- Node 20.20.2. The scoped `@angular-eslint/schematics@19` dependency was
  updated; an initial attempt to update unscoped `angular-eslint@19` failed
  because it was not a dependency.
- The migration added `standalone: false` to 24 NgModule component and test
  stub files. The optional application-builder migration was deferred.
  Lint found 25 `prefer-standalone` errors; the rule was explicitly disabled
  to retain NgModules. npm warned that Karma 6.3.16 missed the builder's
  `^6.4.0` peer range. Build, tests (43), and lint passed without force or
  legacy peer resolution.

### Angular 19 → 20

- Node 20.20.2. The CLI changed TypeScript resolution to `bundler`. The core
  migration changed `TestBed.get` to `TestBed.inject` in the owner service,
  owner-add, owner-detail, and owner-edit specs. The optional application
  builder and control-flow migrations were not run.
- Lint found 70 existing constructor-injection uses under `prefer-inject`;
  that rule was explicitly disabled instead of rewriting unrelated services.
  The Karma peer warning continued. Build and tests (43) passed; no
  `--force` or `--legacy-peer-deps`.

### Angular 20 → 21

- Node 20.20.2; the CLI raised the TypeScript library target to `es2022`.
  The core migration added `provideZoneChangeDetection()` to `main.ts` and
  converted 19 templates from `*ngIf`/`*ngFor` to `@if`/`@for`.
- Optional `router-current-navigation` and application-builder migrations
  were skipped. Lint found four double-quoted imports introduced by the
  bootstrap migration; these were changed to single quotes. Karma's peer
  warning continued; build and tests (43) passed without bypass flags.

### Angular 21 → 22

- Node 22.23.3. Initial dependency resolution was blocked by obsolete
  packages; those were removed before retrying with `--allow-dirty`. Neither
  `--force` nor `--legacy-peer-deps` was used.
- The v22 migration added `ChangeDetectionStrategy.Eager` to every application
  component and component test stub, retaining eager zone-based behavior with
  Angular 22's change-detection default change.
- Added `withXhr()` to application `provideHttpClient()` and HTTP test
  providers because Angular 22 changed the default backend to Fetch; XHR
  preserves the prior backend behavior.
- Replaced the legacy browser builder with `@angular/build` application,
  dev-server, extract-i18n, and Karma builders. Production is the default
  build, serve defaults to development, and `outputPath` is
  `{"base":"dist","browser":""}` so Docker receives flat `dist/`. Bootstrap
  and jQuery global assets remain configured.
- App/test polyfills became `zone.js` and `["zone.js","zone.js/testing"]`;
  `src/polyfills.ts` and `src/test.ts` were removed. The deleted test entry
  point had `teardown: { destroyAfterEach: false }`; Angular's default
  `destroyAfterEach: true` now applies.
- `karma.conf.js` uses the Angular Karma builder plugin setup and
  `karma-coverage` instead of the Istanbul reporter. The duplicate `browsers`
  key was removed; `ChromeHeadlessCI` retains `--no-sandbox`.
- TypeScript 6 compatibility keeps `strictNullChecks` and
  `strictPropertyInitialization` explicitly false for existing model/component
  nullability. App/spec configs suppress only the
  `nullishCoalescingNotNullable` and `optionalChainNotNullable` extended
  diagnostics used by existing code. The follow-up removed `baseUrl` and
  `ignoreDeprecations: "6.0"` after making the only aliased import relative.
- Migrated to flat `eslint.config.js`, ESLint 9, angular-eslint 22, and
  `typescript-eslint`, with explicit exceptions for NgModules, constructor
  injection, eager change detection, and existing empty lifecycle methods.
- Removed the duplicate Glyphicons `@font-face` from vendored
  `src/assets/css/petclinic.css`: both it and
  `node_modules/bootstrap/dist/css/bootstrap.css` declared the same face,
  producing duplicate Glyphicons font output with the application builder.
  The installed Bootstrap CSS still supplies the font face and icon rules.
- The Docker build stage uses Node 22 Alpine, `npm ci`, and `npm run build`;
  stable Alpine nginx serves the flat `dist/` output.
- Early v22 builds/tests exposed TypeScript 6 compatibility errors,
  non-public `rxjs/index` imports, empty-array typing issues, duplicate
  Glyphicons output, and missing `SpecialtyService`/`VetService` test
  providers. These were corrected before the Angular 22 gate passed.

## Follow-up fixes (`196b406`)

- Enabled type-aware TypeScript linting with
  `parserOptions.projectService: true` and `tsconfigRootDir`, and made
  `@typescript-eslint/no-deprecated` an error. It found deprecated
  `RouterTestingModule` uses in owner specs; these now use `provideRouter`
  where routes are needed and existing router stubs elsewhere. No inline
  deprecation suppressions were added.
- Changed `platformBrowserDynamic()` to `platformBrowser()` while retaining
  `provideZoneChangeDetection()`. Removed `BrowserAnimationsModule` after
  confirming there are no animation triggers in app source, then removed the
  unused `@angular/animations` and `@angular/platform-browser-dynamic` deps.
- Changed the sole non-relative TypeScript import to a relative path, removed
  all `baseUrl` settings and `ignoreDeprecations: "6.0"`.
- Normalized migrated observer-object subscriptions, put migrated template
  control-flow blocks on separate lines, and merged adjacent identical
  `@if` blocks.

## Deprecated APIs and patterns fixed

- `platformBrowserDynamic` → `platformBrowser`; removed
  `BrowserAnimationsModule` and its unused dependency.
- Deprecated `RouterTestingModule` → `provideRouter` or router stubs.
- `baseUrl` path alias → relative import; removed the TypeScript 6
  `ignoreDeprecations` workaround.
- `HttpClientModule` → `provideHttpClient(withInterceptorsFromDi())`;
  application and HTTP test providers explicitly use `withXhr()`.
- `HttpClientTestingModule` → `provideHttpClientTesting()`.
- Class-based vet/specialty resolvers → functional `ResolveFn` resolvers.
- Multi-callback `subscribe` → observer objects; `toPromise()` →
  `firstValueFrom`/`lastValueFrom`.
- `TestBed.get` → `TestBed.inject`; removed Angular `async` → `waitForAsync`;
  Jasmine matcher message args → `.withContext(...)`.
- Removed `enableProdMode()`, changed `throwError` to the factory form, and
  switched deep `rxjs/index` imports to the public `rxjs` entry point.
- Enabled type-aware `@typescript-eslint/no-deprecated` for source and specs.

## Removed packages and tooling

- Protractor/e2e config and support packages — the obsolete e2e suite was not
  retained or replaced.
- `codelyzer` and TSLint-era config/directives — linting now uses flat ESLint.
- `@angular-devkit/build-angular` — replaced by `@angular/build`.
- `karma-coverage-istanbul-reporter` — replaced by `karma-coverage`.
- `karma-cli` — Angular CLI invokes Karma directly.
- `tether` — not required by Bootstrap 3.
- `source-map-explorer` — unused by project scripts.
- `core-js` — no application imports or workspace references remained.
- Unused Prettier ESLint integration packages — not enabled by the ESLint
  config.
- `@angular/animations` and `@angular/platform-browser-dynamic` — no app or
  spec imports remain. `@angular/animations` can still be installed as
  `@angular/platform-browser`'s optional peer; it is no longer a direct
  dependency.

## Test changes

The baseline had 28 spec files and 43 passing tests. All 28 spec files remain;
two vet smoke tests were added, bringing the final suite to 45. Per-spec
changes:

| Spec | Change |
| --- | --- |
| `src/app/app.component.spec.ts` | Removed stale TSLint unused-variable directive; retained the smoke test. |
| `src/app/owners/owner-add/owner-add.component.spec.ts` | `async` → `waitForAsync`; `TestBed.get` → `inject`; uses router stubs instead of deprecated `RouterTestingModule`. |
| `src/app/owners/owner-detail/owner-detail.component.spec.ts` | `TestBed.get` → `inject`; uses existing route/router stubs instead of `RouterTestingModule`. |
| `src/app/owners/owner-edit/owner-edit.component.spec.ts` | `async` → `waitForAsync`; `TestBed.get` → `inject`; uses existing stubs instead of `RouterTestingModule`. |
| `src/app/owners/owner-list/owner-list.component.spec.ts` | Matcher now has `.withContext('getOwners called')`; `provideRouter` replaces `RouterTestingModule.withRoutes()`. |
| `src/app/owners/owner.service.spec.ts` | Uses HTTP providers and observer subscriptions; adds matcher contexts; flushes an actual 404 and asserts the handled service error (the old test never flushed or asserted it). |
| `src/app/parts/page-not-found/page-not-found.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/parts/welcome/welcome.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/pets/pet-add/pet-add.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/pets/pet-edit/pet-edit.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/pets/pet-list/pet-list.component.spec.ts` | Matcher now has `.withContext('deletePet called')`. |
| `src/app/pets/pet.service.spec.ts` | Uses `provideHttpClient()` and `provideHttpClientTesting()` with the `waitForAsync`/`inject` smoke test. |
| `src/app/pettypes/pettype-add/pettype-add.component.spec.ts` | No rewrite was needed; retained in the suite. |
| `src/app/pettypes/pettype-edit/pettype-edit.component.spec.ts` | Deep `rxjs/index` import changed to public `rxjs`. |
| `src/app/pettypes/pettype-list/pettype-list.component.spec.ts` | Public `rxjs` import; matcher `.withContext('deletePetType called')`. |
| `src/app/pettypes/pettype.service.spec.ts` | HTTP provider functions and `waitForAsync`/`inject` smoke test. |
| `src/app/specialties/specialty-add/specialty-add.component.spec.ts` | Replaced removed Angular `async` helper with `waitForAsync` after Angular 18 test compilation failed. |
| `src/app/specialties/specialty-edit/specialty-edit.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/specialties/specialty-list/specialty-list.component.spec.ts` | Public `rxjs` import; matcher `.withContext('deleteSpecialty called')`. |
| `src/app/specialties/specialty.service.spec.ts` | HTTP provider functions and `waitForAsync`/`inject` smoke test. |
| `src/app/vets/vet-add/vet-add.component.spec.ts` | Added specialty/vet/router stubs and `should create` to replace a commented-out test in the empty suite. |
| `src/app/vets/vet-edit/vet-edit.component.spec.ts` | Added route/service stubs, reactive forms and Material test modules, and `should create` to replace the empty suite. |
| `src/app/vets/vet-list/vet-list.component.spec.ts` | Deep `rxjs/index` import changed to public `rxjs`. |
| `src/app/vets/vet.service.spec.ts` | HTTP provider functions and `waitForAsync`/`inject` smoke test. |
| `src/app/visits/visit-add/visit-add.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/visits/visit-edit/visit-edit.component.spec.ts` | Removed stale TSLint directive; retained the component test. |
| `src/app/visits/visit-list/visit-list.component.spec.ts` | Matcher now has `.withContext('deleteVisit called')`. |
| `src/app/visits/visit.service.spec.ts` | HTTP provider functions and `waitForAsync`/`inject` smoke test. |

The six HTTP service specs use `provideHttpClient(withXhr(),
withInterceptorsFromDi())` followed by `provideHttpClientTesting()`. No test
suite was deleted.

## Verification and known issues

Final follow-up gate, run on Node 22.23.3:

- `npm ci` succeeded; 637 packages installed. npm reported 16 audit findings
  (2 moderate, 14 high) and a deprecation warning for the optional
  `@angular/animations` peer.
- `npx ng build` passed. It emitted the existing non-blocking critical-CSS
  warning for the unmatched `%` selector.
- `npm run test-headless` passed: 45/45 tests across 28 spec files. Karma
  emitted non-blocking legacy asset URL 404s and the existing
  no-expectations warning for the owner-detail spec. Removing
  `BrowserAnimationsModule` did not break the test suite. The Material
  datepicker was not separately visually exercised.
- `npm run lint` passed: all files pass linting.

- Bootstrap 3 is end-of-life; it remains to preserve existing templates and
  jQuery integration.
- Moment is in maintenance mode.
- Recent Angular CLI versions default new projects to Vitest; this repository
  intentionally retains Karma/Jasmine via `@angular/build:karma`, which is a
  candidate for a future migration.
- Protractor was removed and no replacement browser e2e suite exists.
- `npm ci` reports 16 audit findings (2 moderate, 14 high); audit was not
  suppressed or bypassed.
- Production build emits a non-blocking critical-CSS warning for an unmatched
  `%` selector.
- Karma logs non-blocking 404 warnings for legacy font/image URLs from the
  Bootstrap-era asset stylesheet.

Run the application and checks with:

```sh
npm ci
npm start
npm run build
npm run test-headless
npm run lint
```

The dev server uses port 4200 and expects the REST API at
`http://localhost:9966/petclinic/api/`.
