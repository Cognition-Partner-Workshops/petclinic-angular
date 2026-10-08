# Angular 16 → 22 upgrade notes

This document records the upgrade of Spring Petclinic Angular from **Angular 16.2** to **Angular 22.2** (the `latest` dist-tag at the time of the upgrade).

The upgrade followed the [official Angular update guide](https://angular.dev/update-guide), going **one major version at a time** (16 → 17 → 18 → 19 → 20 → 21 → 22). Each step ran:

```bash
npx ng update @angular/core@<N> @angular/cli@<N> @angular-eslint/schematics@<N>
npx ng update @angular/material@<N>   # also updates @angular/cdk and @angular/material-moment-adapter
npx ng build
```

Each step is a separate commit, so `git log` shows what every schematic changed.

The application is still **NgModule-based** (it was not converted to standalone components), it uses constructor injection, and change detection works as before (zone.js with Eager/Default change detection).

## Node.js requirements

| Angular | Node.js used for the step | Supported Node.js range |
|---------|---------------------------|-------------------------|
| 16 (baseline) | 18.20.8 | `^16.14 \|\| ^18.10` |
| 17 | 18.20.8 | `^18.13 \|\| ^20.9` |
| 18 | 20.19.5 | `^18.19.1 \|\| ^20.11.1 \|\| ^22` |
| 19 | 20.19.5 | `^18.19.1 \|\| ^20.11.1 \|\| >=22` |
| 20 | 20.19.5 | `^20.19 \|\| ^22.12 \|\| >=24` |
| 21 | 20.19.5 / 22.22.3 | `^20.19 \|\| ^22.12 \|\| >=24` |
| **22 (final)** | **22.22.3** | **`^22.22.3 \|\| ^24.15.0 \|\| >=26`** |

The `Dockerfile` build stage now uses `node:22-alpine` (it was `node:16.3-alpine`) and runs `npm ci` instead of `npm install`.

## Dependency versions (before → after)

### Runtime dependencies

| Package | Before | After |
|---------|--------|-------|
| `@angular/animations`, `common`, `compiler`, `core`, `forms`, `platform-browser`, `platform-browser-dynamic`, `router` | 16.2.1 | 22.2.1 |
| `@angular/cdk`, `@angular/material`, `@angular/material-moment-adapter` | 16.2.1 | 22.2.2 |
| `rxjs` | ^6.3.1 | ~7.8.2 |
| `zone.js` | ~0.13.1 | ~0.16.3 |
| `tslib` | ^2.0.0 | ^2.8.1 |
| `moment` | ^2.29.4 | ^2.31.0 |
| `jquery` | ^3.3.1 | ^3.7.1 |
| `bootstrap` | ^3.3.7 | ^3.3.7 (unchanged) |
| `tether` | ^1.4.4 | ^1.4.4 (unchanged) |
| `core-js` | ^3.32.1 | **removed** (not imported anywhere; all supported browsers ship ES2022) |

### Dev dependencies

| Package | Before | After |
|---------|--------|-------|
| `@angular/cli` | 16.2.0 | 22.2.2 |
| `@angular/compiler-cli`, `@angular/language-service` | 16.2.1 | 22.2.1 |
| `@angular-devkit/build-angular` | ^16.2.16 | **replaced by** `@angular/build` ^22.2.2 |
| `@angular-eslint/builder` | ^16.1.0 | ^22.5.0 |
| `@angular-eslint/schematics` | 16.1.0 | 22.5.0 |
| `@angular-eslint/eslint-plugin`, `eslint-plugin-template`, `template-parser` | ^16.1.0 | **replaced by** the `angular-eslint` ~22.5.0 meta package |
| `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` | ^6.4.0 | **replaced by** the `typescript-eslint` ^8.71.1 meta package |
| `eslint` | ^8.39.0 | ^10.12.0 |
| `eslint-config-prettier`, `eslint-plugin-prettier` | ^9.0.0 / ^5.0.0 | **removed** (not used in the ESLint config) |
| `typescript` | 4.9.5 | ~6.0.3 |
| `@types/node` | ^12.11.1 | ^22.20.5 |
| `@types/jasmine` | ~3.6.0 | ~6.0.0 |
| `@types/jasminewd2` | ~2.0.2 | **removed** (Protractor only) |
| `jasmine-core` | ~3.6.0 | ~6.3.0 |
| `jasmine-spec-reporter` | ~5.0.0 | **removed** (Protractor only) |
| `karma` | ~6.3.16 | ~6.4.4 |
| `karma-chrome-launcher` | ~3.1.0 | ~3.2.0 |
| `karma-jasmine` | ~4.0.0 | ~5.1.0 |
| `karma-jasmine-html-reporter` | ^1.5.0 | ~2.3.0 |
| `karma-coverage-istanbul-reporter` | ~3.0.2 | **replaced by** `karma-coverage` ~2.2.1 |
| `karma-cli` | ~1.0.1 | **removed** (use `npx ng test` / npm scripts) |
| `istanbul-lib-instrument` | (none) | ^6.0.3 (needed by `@angular/build:karma` for `codeCoverage`) |
| `source-map-explorer` | ^1.5.0 | ^2.5.3 |
| `codelyzer` | ^6.0.0 | **removed** (TSLint-era) |
| `protractor` | ~7.0.0 | **removed** (deprecated) |
| `ts-node` | ~4.1.0 | **removed** (only used by Protractor) |

## Tooling removals

- **Protractor (e2e)**: Protractor is deprecated, and the Angular CLI no longer provides an e2e builder for it. Removed `e2e/` (specs, page object, `tsconfig.e2e.json`, `.eslintrc.json`), `protractor.conf.js`, the `e2e` architect target in `angular.json`, the `e2e` npm script, the e2e entries in `.gitignore`, and the Protractor-only packages (`protractor`, `@types/jasminewd2`, `jasmine-spec-reporter`, `ts-node`). The CLI does not ship a maintained replacement. Cypress, Playwright, WebdriverIO or Puppeteer can be added later with `ng e2e`.
- **codelyzer**: a TSLint-era package that no longer did anything (the project already linted with ESLint). Removed.
- **karma-coverage-istanbul-reporter**: replaced by `karma-coverage` (the reporter the Angular CLI generates). Coverage is still written to `coverage/` (html, lcovonly, text-summary).
- **karma-cli**, **core-js**, **eslint-plugin-prettier / eslint-config-prettier**: unused, removed.
- **`.eslintrc.json` → `eslint.config.js`**: ESLint 9+ uses flat config only, so the legacy config was converted to a flat config based on `angular-eslint` and `typescript-eslint`. The rules are the same as before.

## Builder changes

| Target | Before | After |
|--------|--------|-------|
| build | `@angular-devkit/build-angular:browser` (webpack) | `@angular/build:application` (esbuild + Vite) |
| serve | `@angular-devkit/build-angular:dev-server` | `@angular/build:dev-server` |
| extract-i18n | `@angular-devkit/build-angular:extract-i18n` | `@angular/build:extract-i18n` |
| test | `@angular-devkit/build-angular:karma` | `@angular/build:karma` |
| lint | `@angular-eslint/builder:lint` | `@angular-eslint/builder:lint` (unchanged) |

Builder-related `angular.json` changes:

- `main` → `browser`, and `polyfills` became an array (`["src/polyfills.ts"]`) (migration `use-application-builder`).
- `outputPath` became `{ "base": "dist", "browser": "" }`, so build output still goes straight into `dist/` (instead of the new default `dist/browser/`). The Dockerfile, which copies `dist/`, did not need to change.
- `vendorChunk` and `buildOptimizer` were removed. The application builder does not support them.
- `"outputHashing": "media"` was added to the development options. Bootstrap 3's CSS and `src/assets/css/petclinic.css` both reference a different `glyphicons-halflings-regular.*` font. Without hashing, esbuild fails with *"Multiple assets emit different content to the same filename"*. Production keeps `"outputHashing": "all"`.
- The `test` target no longer bundles `node_modules/bootstrap/dist/css/bootstrap.css`, for the same font name clash (the karma builder has no `outputHashing` option). No spec depends on Bootstrap CSS.
- `browserTarget` → `buildTarget` in the `serve` and `extract-i18n` targets.
- `--deploy-url` is not supported by the application builder. The README now uses `--base-href` only.
- The scripts (`jquery`, `tether`, `bootstrap.js`) and styles (`bootstrap.css`, `src/styles.css`) are still loaded through `angular.json` and work with the new builder and dev server.

## Per-version changes

### 16 → 17

- **Schematics** (`ng update @angular/core@17 @angular/cli@17 @angular-eslint/schematics@17`):
  - `angular.json`: `browserTarget` → `buildTarget` in `serve` (both configurations) and `extract-i18n`.
  - TypeScript 4.9.5 → 5.4.5, zone.js → ~0.14.
- **Material** (`ng update @angular/material@17`): package bump only. The app does not use any legacy (`MatLegacy*`) components. It only uses `MatDatepickerModule`, `MatInputModule`, `MatFormFieldModule` and `MatMomentDateModule`.
- **Manual**: `@angular-eslint/schematics@17` had to be part of the same `ng update` call because of peer dependencies.
- Files: `angular.json`, `package.json`, `package-lock.json`.

### 17 → 18

- **Schematics**:
  - `HttpClientModule` (deprecated) → `provideHttpClient(withInterceptorsFromDi())` in `src/app/app.module.ts`.
  - `HttpClientTestingModule` → `provideHttpClient(withInterceptorsFromDi())` + `provideHttpClientTesting()` in every service spec (`owner`, `pet`, `pettype`, `specialty`, `vet`, `visit`).
  - The `@NgModule` metadata in `app.module.ts` was rewritten, then reformatted by hand.
- **Material**: package bump only.
- Files: `src/app/app.module.ts`, `src/app/*/*.service.ts` (import formatting), `src/app/*/*.service.spec.ts`, `src/app/error.service.ts`.

### 18 → 19

- **Schematics**:
  - Standalone became the default for components, directives and pipes. The migration added **`standalone: false`** to every NgModule-declared component and directive (all `*.component.ts`, `src/app/testing/dummy.component.ts`, `src/app/testing/router-stubs.ts`).
  - TypeScript → 5.8, zone.js → ~0.15.
- **Material**: package bump only.
- Files: 24 component/directive files, `package.json`.

### 19 → 20

- **Schematics**:
  - `TestBed.get()` (removed) → `TestBed.inject()` in `owner-add`, `owner-edit`, `owner-detail` component specs and `owner.service.spec.ts`.
  - `tsconfig.json`: `moduleResolution: "node"` → `"bundler"`.
  - `angular.json`: generator defaults added to keep the old file naming (`type: component/directive/service`, `typeSeparator: "."`), following the v20 style guide change.
- **Material**: package bump only.
- **Manual**: removed the unused `eslint-plugin-prettier` / `eslint-config-prettier`. Their peer ranges blocked later updates.

### 20 → 21

- **Schematics**:
  - **Control flow migration**: `*ngIf` / `*ngFor` → `@if` / `@for` blocks in the owner, pettype, specialty and visit templates (`owner-detail`, `owner-edit`, `owner-list`, `pettype-*`, `specialty-*`, `visit-edit`, `visit-list`). The v21 `ng update` ran this migration. Rendering is unchanged.
  - `src/main.ts`: zone-based change detection is now explicit: `bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })`. Angular 21 defaults new apps to zoneless, so this keeps the existing behavior.
  - `tsconfig.json`: removed the explicit `lib: ["es2017", "dom"]` (TypeScript derives it from `target: ES2022`).
  - TypeScript → 5.9.
- **Material**: package bump only.
- **Application builder** (`ng update @angular/cli@21 --name use-application-builder`): see [Builder changes](#builder-changes).
- **Manual fixes needed by the application builder**:
  - `import * as moment from 'moment'` → `import moment from 'moment'` (plus `"esModuleInterop": true` in `tsconfig.json`) in `pet-add`, `pet-edit`, `visit-add` and `visit-edit`. esbuild does not allow calling a namespace import.
  - `outputPath` / `outputHashing` changes described above.

### 21 → 22

- **Schematics**:
  - **HttpClient now uses the Fetch backend by default.** The migration added `withXhr()` (`provideHttpClient(withXhr(), withInterceptorsFromDi())`) in `app.module.ts` and the service specs, so the app keeps the XHR backend it used before.
  - **Default change detection**: the migration added `changeDetection: ChangeDetectionStrategy.Eager` to every component, which keeps the change detection behavior the components had before the upgrade.
  - Added `extendedDiagnostics` (`nullishCoalescingNotNullable`, `optionalChainNotNullable` set to `suppress`) to `src/tsconfig.app.json` and `src/tsconfig.spec.json`.
  - TypeScript → 6.0.
- **Material** (`ng update @angular/material@22`): package bump. The prebuilt theme import `@angular/material/prebuilt-themes/indigo-pink.css` in `src/styles.css` still exists and still works. The datepicker renders as before.
- **angular-eslint 22 / ESLint 10 / typescript-eslint 8**:
  - Converted `.eslintrc.json` to the flat `eslint.config.js`, and replaced the per-package plugins with the `angular-eslint` and `typescript-eslint` meta packages. `angular.json` `cli.schematicCollections` → `["angular-eslint"]`.
  - `@typescript-eslint/quotes` was removed in typescript-eslint 8 and is replaced by the core `quotes` rule with the same options.
  - New recommended rules that require architecture changes are turned off on purpose, to keep this upgrade focused: `@angular-eslint/prefer-standalone`, `@angular-eslint/prefer-inject`, `@angular-eslint/prefer-on-push-component-change-detection`.
- **Manual TypeScript 6 fixes**:
  - TypeScript 6 turns `strict` on by default. The project was never strict (it relied on the TS 4/5 default), so `tsconfig.json` now sets `"strict": false` explicitly to keep the old type-checking level. Turning on strict mode is a separate follow-up.
  - `baseUrl` is deprecated (TS5101), so it was removed from `tsconfig.json`, `src/tsconfig.app.json` and `src/tsconfig.spec.json`. The imports that relied on it were fixed: `app/specialties/specialty.service` → relative import in `vet-add.component.ts`, the `rxjs/index` import → `rxjs`, and an unused `constants` import was dropped from `owner-detail.component.spec.ts`.
- **RxJS 6 → 7.8** (manual):
  - `throwError(message)` → `throwError(() => message)` in `src/app/error.service.ts`.
  - Every deprecated multi-argument `subscribe(next, error[, complete])` call → observer objects `subscribe({ next, error })` in the components and specs (owners, pets, pettypes, specialties, vets, visits). Single-callback `subscribe(next)` is not deprecated and was left as is.
  - The code never used `toPromise()`.
- **Test tooling** (manual):
  - Switched the test builder to `@angular/build:karma`. `karma.conf.js` no longer loads `@angular-devkit/build-angular/plugins/karma` and uses `karma-coverage`.
  - `async()` from `@angular/core/testing` was removed, so it was replaced with `waitForAsync()` in `owner-add`, `owner-edit` and `specialty-add` specs.
  - Jasmine 6 throws on a `describe` with no specs. `vet-add.component.spec.ts` and `vet-edit.component.spec.ts` only contained commented-out tests, which made every later suite fail. The commented test is now an `xit` (pending) with the same body.
  - `owner-detail.component.spec.ts` "find owner using ownerId" now awaits `fixture.whenStable()` instead of using a floating `.then()`, so its expectation actually runs.

## Behavior changes

- No changes to app features or routes. The app shell, navigation, Owners, Vets, Pet Types, Specialties and the Material datepicker render as before. HTTP still uses XHR, change detection is still zone.js-based and Eager.
- Templates use the built-in `@if` / `@for` control flow (from the v21 migration). The rendered DOM is the same.
- Development builds now put a content hash in media file names (`media/*-HASH.*`) because of the glyphicons name clash.
- The production build prints a harmless warning: *"Could not parse 1 selector in styles-*.css ... 0% (Unmatched selector: %)"*. It comes from the critical-CSS inliner (enabled by the application builder's production optimization) failing to parse the `0%` keyframe selector inside Bootstrap 3's vendor-prefixed `@-o-keyframes progress-bar-stripes` rule. The rule still applies once the full stylesheet loads.
- Unit tests: baseline (Angular 16, Node 18) **43/43 passed**. Final (Angular 22, Node 22) **43 passed, 0 failed, 2 skipped**. The 2 skipped are the `vet-add` / `vet-edit` placeholder specs that used to be empty `describe` blocks. The `OwnerService search for delete Owner` spec already had no expectations in the baseline and still has none.
