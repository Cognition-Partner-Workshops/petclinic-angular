# Angular 16 → 22 upgrade notes

This document records every breaking change hit while upgrading `spring-petclinic-angular`
from Angular 16.2 to Angular 22.2 (the `latest` npm tag at the time of the upgrade), and what
was done about it. The upgrade followed the [Angular update guide](https://angular.dev/update-guide)
one major version at a time (`ng update @angular/core@N @angular/cli@N`), so each major has its own commit.

**Result:** `ng build` (dev + production), `ng lint` and `ng test` (45/45 specs) all pass on Angular 22.2.

## Requirements

| | Before | After |
|---|---|---|
| Node.js | 16+ | `^22.22.3 \|\| ^24.15.0 \|\| >=26` (Angular 22 engine requirement) |
| TypeScript | 4.9.5 | 6.0.3 (Angular 22 requires `>=6.0 <6.1`) |
| Build system | Webpack (`@angular-devkit/build-angular:browser`) | esbuild/Vite (`@angular/build:application`) |
| Docker build image | `node:16.3-alpine` | `node:24-alpine` (and `npm ci` instead of `npm install`) |

## Breaking changes by version

### Angular 16 → 17

| Breaking change | Impact on this app | Resolution |
|---|---|---|
| `browserTarget` option of `dev-server` / `extract-i18n` builders deprecated in favour of `buildTarget`. | `angular.json` used `browserTarget`. | `ng update` migration renamed it to `buildTarget`. |
| `@angular-eslint` 16 has a peer dependency on Angular CLI `<17`. | `ng update` refused to run. | Updated `@angular-eslint/*` together with Angular in the same `ng update` call. |
| Node.js 16 no longer supported (Node `^18.13 \|\| ^20.9`). | Docker image used Node 16. | Fixed in the final Dockerfile update (Node 24). |

### Angular 17 → 18

| Breaking change | Impact on this app | Resolution |
|---|---|---|
| `HttpClientModule` / `HttpClientTestingModule` deprecated in favour of `provideHttpClient()` / `provideHttpClientTesting()`. | `AppModule` imported `HttpClientModule`; 6 service specs imported `HttpClientTestingModule`. | `ng update` migration: `AppModule` now has `provideHttpClient(withInterceptorsFromDi())` in `providers`; specs use `provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()`. |
| Minimum TypeScript 5.4. | TS 4.9 no longer supported. | TypeScript upgraded with each major (final: 6.0.3). |

### Angular 18 → 19

| Breaking change | Impact on this app | Resolution |
|---|---|---|
| `standalone: true` became the default for components, directives and pipes. | Every declaration in this NgModule-based app would have become standalone and broken its module. | `ng update` migration added `standalone: false` to all 24 components and the test stub directives/components. |
| `@angular-eslint` 19 enables `@angular-eslint/prefer-standalone` in `recommended`. | 25 lint errors. | Rule turned off in `eslint.config.js` (the app intentionally stays NgModule-based; a standalone conversion is a separate refactor). |
| `@typescript-eslint` 8 removed the formatting rule `@typescript-eslint/quotes`. | ESLint crashed: "Definition for rule '@typescript-eslint/quotes' was not found". | Removed the rule; the core `quotes` rule (already configured) remains. |

### Angular 19 → 20

| Breaking change | Impact on this app | Resolution |
|---|---|---|
| `TestBed.get()` removed (deprecated since v9). | Specs used `TestBed.get(...)`. | `ng update` migration replaced with `TestBed.inject(...)`. |
| New projects / workspaces use `"moduleResolution": "bundler"`; `node` (node10) resolution is deprecated. | `tsconfig.json` used `"node"`. | `ng update` migration switched to `"bundler"`. |
| Schematic defaults changed (no more `.component`/`.service` suffixes by default). | Only affects `ng generate`. | `ng update` added `type`/`typeSeparator` defaults to `angular.json` so generated file names keep the old style. |
| `@angular-eslint` 20 enables `@angular-eslint/prefer-inject` in `recommended`. | 70 lint errors (constructor injection everywhere). | Rule turned off; converting to `inject()` is a style refactor, not required for the upgrade. |
| Node 18 dropped (Node `^20.19 \|\| ^22.12 \|\| ^24`). | — | Node 24 used. |

### Angular 20 → 21

| Breaking change | Impact on this app | Resolution |
|---|---|---|
| Zoneless change detection is the default for new apps; zone-based apps must opt in explicitly. | App relies on Zone.js. | `ng update` migration added `applicationProviders: [provideZoneChangeDetection()]` to `bootstrapModule()` in `src/main.ts`. |
| Structural directives `*ngIf` / `*ngFor` / `*ngSwitch` are deprecated in favour of built-in control flow. | All templates used `*ngIf` / `*ngFor`. | Ran `ng g @angular/core:control-flow-migration --format=false` (no reformatting). `@for` blocks track by `id` (e.g. `track owner.id`) instead of object identity. |
| `async()` test helper removed from `@angular/core/testing` (deprecated since v10). | 3 specs failed to compile. | Replaced with `waitForAsync()` (or a plain `async` function where no zone wrapping was needed). |
| TypeScript `lib` target bumped. | — | Migration updated `tsconfig.json`. |

### Angular 21 → 22

| Breaking change | Impact on this app | Resolution |
|---|---|---|
| **`ChangeDetectionStrategy.OnPush` is now the default**; the old default was renamed `ChangeDetectionStrategy.Eager` (`Default` is deprecated). | Components that mutate state outside inputs/signals would stop re-rendering. | `ng update` migration added `changeDetection: ChangeDetectionStrategy.Eager` to all 24 components, keeping the previous behaviour. `@angular-eslint/prefer-on-push-component-change-detection` is turned off for now. |
| **`HttpClient` uses the `fetch` backend by default.** | App code/specs used the XHR backend implicitly. | `ng update` migration added `withXhr()` to every `provideHttpClient(...)` call (app + 6 specs), keeping XHR semantics (upload progress, etc.). |
| `strictTemplates` reports `nullishCoalescingNotNullable` / `optionalChainNotNullable` as errors. | Templates use `?.` / `??` on non-nullable values. | Migration set both checks to `"suppress"` in `src/tsconfig.app.json` and `src/tsconfig.spec.json`. |
| Karma builds require `istanbul-lib-instrument` for coverage. | — | Migration added it to `devDependencies`. |
| `codelyzer` (TSLint based) has a peer dependency on Angular `<13`. | `ng update` refused to run. | Removed `codelyzer` (unused – linting is done with ESLint). |
| **TypeScript 6** (required by Angular 22): `strict` now defaults to `true`. | Hundreds of `strictNullChecks` / `strictPropertyInitialization` errors in code that was never written for strict mode. | Set `"strict": false` explicitly in `tsconfig.json` to keep the previous compiler behaviour. Enabling strict mode is a follow-up. |
| TypeScript 6: `baseUrl` is deprecated (error TS5101). | `tsconfig.json`, `tsconfig.app.json` and `tsconfig.spec.json` set `baseUrl`. | Removed `baseUrl`; the single non-relative import that relied on it (`'app/specialties/specialty.service'` in `vet-add.component.ts`) is now relative. Added explicit `rootDir`. |
| TypeScript 6: `esModuleInterop` is always on, so namespace imports of CommonJS modules are not callable. | `import * as moment from 'moment'` → "This expression is not callable" in 4 components. | Changed to `import moment from 'moment'`. |
| ESLint 9+ removed `.eslintrc.*` support (flat config only); `@angular-eslint` 22 targets ESLint 9/10. | `ng lint` failed: "Could not find config file". | Replaced `.eslintrc.json` with an equivalent `eslint.config.js` using the `angular-eslint` and `typescript-eslint` meta-packages (individual `@angular-eslint/*` / `@typescript-eslint/*` plugin packages removed). |
| The Protractor builder (`@angular-devkit/build-angular:protractor`) no longer exists; Protractor is end-of-life. | `ng e2e` was already broken. | Removed `protractor`, `protractor.conf.js`, the `e2e/` folder, the `spring-petclinic-angular-e2e` project, the `e2e` npm script, and its helpers (`@types/jasminewd2`, `jasmine-spec-reporter`, `ts-node`). `ng e2e` will now offer to set up Cypress/Playwright/etc. |
| The Webpack-based `@angular-devkit/build-angular:browser` builder is deprecated. | Build printed a deprecation warning. | Ran the `use-application-builder` migration: `build`/`serve`/`extract-i18n`/`test` now use `@angular/build:*` (esbuild). `@angular-devkit/build-angular` replaced by `@angular/build`. `outputPath.browser` is set to `""` so artifacts still land in `dist/` (Dockerfile and Apache instructions unchanged). Removed obsolete options (`main` → `browser`, `vendorChunk`, `buildOptimizer`). |
| esbuild rejects two different assets with the same output name. | `src/assets/fonts/glyphicons-halflings-regular.svg` differed from Bootstrap's copy only by a license comment, so `media/glyphicons-halflings-regular.svg` collided. | Replaced the asset with Bootstrap's original file (glyph data is identical). |

## Other dependency changes

| Change | Why |
|---|---|
| `rxjs` 6 → 7.8 | Angular 22 supports `^6.5.3 \|\| ^7.4.0`; 6.x is unmaintained. |
| `throwError(value)` → `throwError(() => value)` (`error.service.ts`) | Value form deprecated in RxJS 7. |
| `subscribe(next, error)` → `subscribe({next, error})` (36 call sites) | Multiple-callback signature deprecated in RxJS 7 (removed in 8). |
| `rxjs/operators` and `rxjs/index` imports → `rxjs` | Operators are exported from `rxjs` since 7.2; deep import paths are deprecated. |
| `zone.js` 0.13 → 0.16 | Angular 22 peer range `~0.15.0 \|\| ~0.16.0`. |
| `jasmine-core` 3.6 → 5.13, `@types/jasmine` 3.6 → 5.1, `karma-jasmine` 4 → 5.1, `karma-jasmine-html-reporter` 1.5 → 2.3, `karma` 6.3 → 6.4, `karma-chrome-launcher` 3.1 → 3.2 | Current versions used by Angular CLI. Jasmine 5 fails on `describe()` blocks with no specs, so the commented-out tests in `vet-add.component.spec.ts` / `vet-edit.component.spec.ts` were re-enabled with service/router stubs. |
| `karma-coverage-istanbul-reporter` → `karma-coverage` | The former is deprecated; `karma.conf.js` now uses `coverageReporter`. |
| `karma-cli` removed | Unused (`ng test` drives Karma). |
| `eslint-config-prettier`, `eslint-plugin-prettier` removed | Never referenced by the lint config. |
| `tether` removed (and its script entry in `angular.json`) | Only needed by Bootstrap 4 alphas; Bootstrap 3 doesn't use it. |
| `@types/node` 12 → 24, `core-js`, `moment`, `jquery` (3.x), `tslib`, `source-map-explorer`, `bootstrap` (3.4.1) | Latest compatible versions. |

Full before/after version list:

| Package | Before | After |
|---|---|---|
| `@angular/*` (core, common, compiler, forms, router, animations, platform-browser[-dynamic]) | 16.2.1 | 22.2.1 |
| `@angular/cdk`, `@angular/material`, `@angular/material-moment-adapter` | 16.2.1 | 22.2.2 |
| `@angular/cli` | 16.2.0 | 22.2.2 |
| `@angular/compiler-cli`, `@angular/language-service` | 16.2.1 | 22.2.1 |
| `@angular-devkit/build-angular` | ^16.2.16 | removed (→ `@angular/build` ^22.2.2) |
| `@angular-eslint/builder`, `@angular-eslint/schematics` | 16.1.0 | 22.5.0 |
| `@angular-eslint/eslint-plugin`, `-plugin-template`, `template-parser` | ^16.1.0 | removed (→ `angular-eslint` ^22.5.0) |
| `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` | ^6.4.0 | removed (→ `typescript-eslint` ^8.71.1) |
| `eslint` | ^8.39.0 | ^10.12.0 |
| `typescript` | 4.9.5 | 6.0.3 |
| `rxjs` | ^6.3.1 | ^7.8.2 |
| `zone.js` | ~0.13.1 | ^0.16.3 |
| `tslib` | ^2.0.0 | ^2.8.1 |
| `core-js` | ^3.32.1 | ^3.50.0 |
| `moment` | ^2.29.4 | ^2.31.0 |
| `jquery` | ^3.3.1 | ^3.7.1 |
| `bootstrap` | ^3.3.7 | ^3.4.1 |
| `@types/node` | ^12.11.1 | ^24.19.1 |
| `@types/jasmine` | ~3.6.0 | ~5.1.15 |
| `jasmine-core` | ~3.6.0 | ~5.13.0 |
| `karma` | ~6.3.16 | ~6.4.4 |
| `karma-chrome-launcher` | ~3.1.0 | ~3.2.0 |
| `karma-jasmine` | ~4.0.0 | ~5.1.0 |
| `karma-jasmine-html-reporter` | ^1.5.0 | ~2.3.0 |
| `karma-coverage` | — | ~2.2.1 |
| `istanbul-lib-instrument` | — | ^6.0.3 |
| `source-map-explorer` | ^1.5.0 | ^2.5.3 |
| `codelyzer`, `protractor`, `tether`, `ts-node`, `karma-cli`, `karma-coverage-istanbul-reporter`, `jasmine-spec-reporter`, `@types/jasminewd2`, `eslint-config-prettier`, `eslint-plugin-prettier` | various | removed |

## Intentionally not done (follow-ups)

- **Bootstrap 3 → 5 / jQuery 4:** Bootstrap 5 drops jQuery, glyphicons and most Bootstrap 3 markup, so it is a UI rewrite rather than a dependency bump. Bootstrap 3.4.1 is EOL and `npm audit` still reports a moderate XSS advisory for it.
- **TypeScript 7:** not supported by Angular 22 (`typescript >=6.0 <6.1`).
- **Karma → Vitest:** Karma is deprecated; the optional `migrate-karma-to-vitest` schematic was not run to keep the existing test setup.
- **Standalone components, `inject()`, OnPush, strict mode:** the related lint rules are off and `strict: false` is set so the upgrade does not change architecture or behaviour. Each can be adopted incrementally.
- **Remaining `npm audit` findings** (`braces`/`picomatch`/`micromatch`) are transitive dev-only dependencies of the Angular CLI dev server and are fixed only by upstream releases.
- The production build prints a cosmetic warning from the critical-CSS inliner (`Could not parse 1 selector ... 0%`) coming from the bundled third-party CSS; the rule still applies once the stylesheet loads.
