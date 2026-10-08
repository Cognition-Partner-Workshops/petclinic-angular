# Angular 16 → 22 upgrade notes

This document records every breaking change encountered while upgrading
`spring-petclinic-angular` from **Angular 16.2** to **Angular 22.2**, what the
official migration (`ng update`) did automatically, and what had to be fixed by
hand. The upgrade was performed one major version at a time following the
[Angular update guide](https://angular.dev/update-guide), and each step is a
separate commit so it can be reviewed or bisected independently.

## Toolchain summary

| | Before | After |
|---|---|---|
| Angular (core, common, router, forms, …) | 16.2.1 | 22.2.1 |
| Angular CLI | 16.2.0 | 22.2.2 |
| Angular Material / CDK / moment adapter | 16.2.1 | 22.2.2 |
| Build system | `@angular-devkit/build-angular:browser` (webpack) | `@angular/build:application` (esbuild + Vite dev server) |
| Unit-test builder | `@angular-devkit/build-angular:karma` | `@angular/build:karma` |
| TypeScript | 4.9.5 | 6.0.3 |
| RxJS | 6.x | 7.8.2 |
| zone.js | 0.13.x | 0.16.3 |
| Node.js | 16 (Dockerfile) | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` (`engines`, `.nvmrc`, Dockerfile `node:22-alpine`) |
| ESLint | 8 (`.eslintrc.json`) | 10 (`eslint.config.js` flat config) |
| angular-eslint | 16.1 (individual plugins) | 22.5 (`angular-eslint` meta package) |
| typescript-eslint | 6 (`@typescript-eslint/*`) | 8.71 (`typescript-eslint` meta package) |
| Jasmine / Karma | jasmine-core 3.6, karma 6.3, karma-jasmine 4 | jasmine-core 5.13, karma 6.4, karma-jasmine 5.1 |
| Coverage reporter | `karma-coverage-istanbul-reporter` (deprecated) | `karma-coverage` |
| Bootstrap / jQuery | 3.3.7 / 3.3.1 | 3.4.1 / 3.7.1 (latest 3.x lines, see below) |
| moment | 2.29 | 2.31 |
| `@types/node` | 12 | 22 |
| nginx (Dockerfile) | 1.17.6 | 1.29-alpine |

Removed packages: `protractor`, `@types/jasminewd2`, `jasmine-spec-reporter`,
`ts-node`, `codelyzer`, `karma-cli`, `karma-coverage-istanbul-reporter`,
`eslint-config-prettier`, `eslint-plugin-prettier`, `@angular-eslint/eslint-plugin`,
`@angular-eslint/eslint-plugin-template`, `@angular-eslint/template-parser`,
`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `tether`,
`core-js`, `@angular-devkit/build-angular`.

Added packages: `@angular/build`, `angular-eslint`, `typescript-eslint`,
`@stylistic/eslint-plugin`, `karma-coverage`, `istanbul-lib-instrument`
(required by the v22 Karma builder for coverage).

---

## Angular 16 → 17

| Breaking change / deprecation | Impact on this repo | Resolution |
|---|---|---|
| Node.js 16 support dropped (v17 requires Node 18.13+) | Local toolchain and Dockerfile used Node 16 | Node 22 used for the whole upgrade (final requirement is set by v22, see below). |
| TypeScript < 5.2 no longer supported | TS 4.9.5 | Upgraded by `ng update` (later to 6.0). |
| zone.js < 0.14 no longer supported | zone.js 0.13 | Upgraded by `ng update` (later to 0.16). |
| `browserTarget` option of `dev-server` / `extract-i18n` builders deprecated in favour of `buildTarget` | `angular.json` `serve` and `extract-i18n` targets | Migrated automatically (`browserTarget` → `buildTarget`). |
| Material/CDK 17 and angular-eslint 17 must match the framework major | Peer-dependency conflicts | Updated together with `ng update @angular/material@17 @angular-eslint/schematics@17`. |
| New built-in control flow (`@if`, `@for`) and standalone defaults for new code (non-breaking) | None at this step | Control flow migration was applied in v21 (see below). |

## Angular 17 → 18

| Breaking change / deprecation | Impact on this repo | Resolution |
|---|---|---|
| `HttpClientModule`, `HttpClientTestingModule` deprecated | `AppModule` and all six `*.service.spec.ts` files | Migrated automatically to `provideHttpClient(withInterceptorsFromDi())` and `provideHttpClient(...)` + `provideHttpClientTesting()`. |
| `async()` test helper from `@angular/core/testing` removed (deprecated since v11) | `owner-add`, `owner-edit`, `specialty-add` specs failed to compile (`TS2305: Module '"@angular/core/testing"' has no exported member 'async'`) | Manually replaced with `waitForAsync()` and removed the import. |
| Material 18: M3 theming becomes the default for new Sass themes | App uses prebuilt CSS, not Sass theming | No change needed. |

## Angular 18 → 19

| Breaking change / deprecation | Impact on this repo | Resolution |
|---|---|---|
| `standalone: true` becomes the default for components/directives/pipes | All 23 components and the `RouterLinkStubDirective` are declared in NgModules | Migration added explicit `standalone: false` to every declaration. |
| angular-eslint 19 enables `@angular-eslint/prefer-standalone` in `recommended` | 25 lint errors on the `standalone: false` declarations | Rule turned off in the lint config — the app intentionally stays NgModule-based in this upgrade (converting to standalone is a separate refactor: `ng generate @angular/core:standalone`). |
| TypeScript < 5.5 no longer supported | — | Updated by `ng update`. |

## Angular 19 → 20

| Breaking change / deprecation | Impact on this repo | Resolution |
|---|---|---|
| Node.js 18 support dropped (v20 requires Node 20.19+/22.12+) | — | Already on Node 22. |
| `TestBed.get()` removed (deprecated since v9) | `owner.service.spec.ts`, `owner-add`, `owner-detail`, `owner-edit` specs | Migrated automatically to `TestBed.inject()`. |
| `InjectFlags` removed, `DOCUMENT` moved to `@angular/core` | Not used | No change. |
| `moduleResolution: "node"` (node10) superseded; CLI migrates to `"bundler"` | `tsconfig.json` | Migrated automatically. |
| New style guide: CLI generates files without `.component`/`.service` suffixes | Would change naming of newly generated files | Migration added `type`/`typeSeparator` schematic defaults in `angular.json` to keep the existing naming convention. |
| angular-eslint 20 enables `@angular-eslint/prefer-inject` in `recommended` | 70 lint errors on constructor-parameter injection | Ran the official `ng generate @angular/core:inject` migration: every component/service/resolver now uses `inject()` field initializers. |
| `*ngIf` / `*ngFor` / `*ngSwitch` structural directives deprecated | 19 templates | Migrated in v21 (see below). |

## Angular 20 → 21

| Breaking change / deprecation | Impact on this repo | Resolution |
|---|---|---|
| Zoneless change detection is the default for new apps; existing NgModule apps must opt in to zone-based change detection explicitly | `src/main.ts` bootstraps `AppModule` with zone.js | Migration added `applicationProviders: [provideZoneChangeDetection()]` to `bootstrapModule()` — behaviour unchanged. |
| Structural-directive control flow (`*ngIf`, `*ngFor`) replaced by built-in control flow | 19 component templates | Migration converted all templates to `@if` / `@for (...; track ...)` / `@else`. The migration re-formatted the templates with Prettier; license headers were re-indented afterwards. |
| `lib` option no longer needed in `tsconfig.json` (derived from `target`) | `"lib": ["es2017", "dom"]` | Removed by migration. |
| TypeScript < 5.9 no longer supported | — | Updated by `ng update`. |

## Angular 21 → 22

| Breaking change / deprecation | Impact on this repo | Resolution |
|---|---|---|
| Component default change-detection behaviour changes in v22 (the migration pins existing components with the new explicit `ChangeDetectionStrategy.Eager`) | All 24 components | Migration added `changeDetection: ChangeDetectionStrategy.Eager` to every component to keep pre-v22 behaviour. angular-eslint 22's `prefer-on-push-component-change-detection` rule is disabled for the same reason (moving to `OnPush` is a behavioural change, out of scope). |
| `HttpClient` no longer uses `HttpXhrBackend` implicitly; XHR must be opted into with `withXhr()` | `AppModule` and the six service specs | Migration added `withXhr()` to every `provideHttpClient(...)` call to keep XHR semantics (e.g. upload progress events). |
| New extended diagnostics `nullishCoalescingNotNullable` / `optionalChainNotNullable` are errors by default | — | Migration added `"suppress"` entries to `src/tsconfig.app.json` / `src/tsconfig.spec.json`. |
| Karma builder now needs `istanbul-lib-instrument` for coverage | — | Added to `devDependencies` by migration. |
| **TypeScript 6.0 required** (`>=6.0 <6.1`) | Many compile errors | See *TypeScript 6* below. |
| Node.js requirement `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` | Dockerfile used `node:16.3-alpine` | Dockerfile now uses `node:22-alpine`; `engines` and `.nvmrc` added. |
| angular-eslint 22 requires ESLint 9/10 (ESLint 10 dropped `.eslintrc.*` support) and typescript-eslint 8 | `ng lint` failed: *Could not find config file* | Rewrote config as `eslint.config.js` (flat config), see *Linting* below. |

### TypeScript 6

TypeScript 6.0 changed several compiler defaults and deprecated old options:

| Change | Impact | Resolution |
|---|---|---|
| `strict` now defaults to `true` | ~100 `TS2564` / `TS2322` errors (uninitialised fields, `null` assignments) across components and specs | Added `"strict": false` to `tsconfig.json` to preserve the project's existing (non-strict) type checking. Enabling strict mode is a worthwhile follow-up but changes a lot of code. |
| `baseUrl` deprecated (`TS5101`) | `tsconfig.json`, `src/tsconfig.app.json`, `src/tsconfig.spec.json` set it; `vet-add.component.ts` relied on it (`import ... from "app/specialties/specialty.service"`) | Removed `baseUrl` everywhere and changed the import to a relative path. |
| `esModuleInterop` is always enabled | `import * as moment from 'moment'` became non-callable (`TS2349`) in `pet-add`, `pet-edit`, `visit-add`, `visit-edit` | Switched to `import moment from 'moment'`. |

### RxJS 7

| Change | Impact | Resolution |
|---|---|---|
| Package `exports` map: deep imports such as `rxjs/index` are no longer resolvable | 4 specs imported `of` from `'rxjs/index'` | Import from `'rxjs'`. `rxjs/operators` still works and is kept. |

### Jasmine 5

| Change | Impact | Resolution |
|---|---|---|
| A `describe()` with no specs is an error | `vet-add` and `vet-edit` specs had their only `it()` commented out; Jasmine aborted and mis-nested every subsequent suite | Restored the placeholder as a pending `xit('should create', ...)` so the TODO remains visible. |

### Build system: application builder (esbuild)

The webpack-based `@angular-devkit/build-angular:browser` builder is deprecated.
The optional `ng update @angular/cli --name use-application-builder` migration
was applied:

* `build` → `@angular/build:application` (`main` → `browser`, `polyfills` as an
  array, removed `vendorChunk` / `buildOptimizer`).
* `serve`, `extract-i18n`, `test` → `@angular/build:*`.
* `karma.conf.js` no longer loads the `@angular-devkit/build-angular` framework/plugin.
* `@angular-devkit/build-angular` replaced by `@angular/build`.
* The application builder writes to `dist/browser/` by default. `outputPath.browser`
  is set to `""` so artifacts remain in `dist/` and the Dockerfile / nginx /
  Apache deployment instructions keep working.
* `--deploy-url` is not supported by the application builder; README deploy
  instructions now use `--base-href` only. `--prod` was removed in Angular 12 and
  is replaced by `--configuration production`.
* esbuild refuses to emit two different files to the same path:
  `src/assets/css/petclinic.css` and Bootstrap's own CSS both reference a
  `glyphicons-halflings-regular.svg`, and the copy in `src/assets/fonts` was an
  older revision. It was replaced with the Bootstrap 3.4.1 file (the other four
  font files were already byte-identical).
* Production builds log one harmless critical-CSS warning
  (`Unmatched selector: %`) originating from the legacy bundled stylesheet; the
  rule still applies once the stylesheet loads.

### Linting

* `.eslintrc.json` (and `e2e/.eslintrc.json`) replaced by `eslint.config.js`
  using `angular.configs.tsRecommended` / `templateRecommended` and
  `angular.processInlineTemplates`.
* `@typescript-eslint/quotes` was removed in typescript-eslint 8 (formatting rules
  moved to ESLint Stylistic); replaced with `@stylistic/quotes` with the same
  options.
* Rules disabled to keep the upgrade behaviour-neutral (each corresponds to an
  optional refactor): `@angular-eslint/prefer-standalone`,
  `@angular-eslint/prefer-on-push-component-change-detection`. The pre-existing
  `@angular-eslint/no-empty-lifecycle-method: off` is kept.
* Several migrations re-formatted files with double quotes; `eslint --fix` was run
  to restore the project's single-quote style.

### Removed: Protractor e2e

Protractor reached end of life and the `@angular-devkit/build-angular:protractor`
builder is gone with the move to `@angular/build`. The
`spring-petclinic-angular-e2e` project, `protractor.conf.js`, `e2e/`, the `e2e`
npm script, and the related packages (`protractor`, `@types/jasminewd2`,
`jasmine-spec-reporter`, `ts-node`) were removed. The suite only contained a
single placeholder spec. `ng e2e` now offers to add a supported framework
(Playwright, Cypress, …).

### Other dependency decisions

* **Codelyzer** — TSLint-based, unmaintained, incompatible with Angular > 12; removed (ESLint is already used).
* **tether** — only needed by Bootstrap 4 alphas; Bootstrap 3 does not use it. Removed from `package.json` and from the `scripts` arrays in `angular.json`.
* **core-js** — not imported anywhere (polyfills only load `zone.js`); removed.
* **Bootstrap 3 / jQuery** — kept on their latest compatible lines (Bootstrap 3.4.1, jQuery 3.7.1). The UI's markup, Glyphicons and `petclinic.css` theme are Bootstrap 3 specific, so moving to Bootstrap 5 / jQuery 4 would be a UI rewrite rather than a dependency bump. Note `npm audit` reports a moderate, unfixed advisory for Bootstrap 3.x (XSS via `data-*` attributes in tooltip/popover/scrollspy); the app does not use those plugins.
* **moment** — kept (still required by `@angular/material-moment-adapter`), updated to 2.31.
* **Karma** — still supported by Angular 22 via `@angular/build:karma`, so it is kept. Angular now defaults to Vitest; `ng update @angular/cli --name migrate-karma-to-vitest` is the suggested follow-up. The remaining `npm audit` "high" findings are dev-only transitive dependencies of Karma (`chokidar` → `braces`) and the dev server (`http-proxy-middleware` → `micromatch`), not shipped to the browser.

### Dockerfile

* `node:16.3-alpine` → `node:22-alpine` (Angular 22 minimum).
* `nginx:1.17.6` → `nginx:1.29-alpine`.
* `npm install` → `npm ci` for reproducible installs; `as` → `AS` (BuildKit lint).
* Added `.dockerignore` so the host's `node_modules`/`dist` are not sent in the build context.

## Optional migrations not applied

These are offered by `ng update` but change application code/behaviour beyond a
version upgrade, so they are left as follow-ups:

* `ng generate @angular/core:standalone` — convert NgModules to standalone components.
* Switch components from `ChangeDetectionStrategy.Eager` to `OnPush` / zoneless.
* `ng update @angular/cli --name migrate-karma-to-vitest` — move tests to Vitest.
* `ng update @angular/core --name router-current-navigation` — no usages of `Router.getCurrentNavigation()` in this app.
* Enable TypeScript `strict` mode.

## Verification

All on Node 22.23.3 after `npm ci`:

* `npx ng build` and `npx ng build --configuration production` — succeed.
* `npm run test-headless` — 43 specs pass, 2 pending (the `xit` placeholders above). Baseline on Angular 16 was 43 passing.
* `npm run lint` — all files pass.
* `docker build .` — succeeds; container serves the app on port 8080.
