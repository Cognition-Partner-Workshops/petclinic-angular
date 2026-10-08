# Angular upgrade notes

This repository was upgraded from Angular 16 to Angular 22. The upgrade was
performed one major version at a time on Node.js 22 for the final hop. The
existing NgModule architecture, zone.js change detection, Karma/Jasmine tests,
Bootstrap 3 styling, and flat `dist/` output were retained.

## Version summary

| Package or runtime | Before | After |
| --- | --- | --- |
| Node.js | 18.x baseline | 22.22.3 or newer 22.x |
| Angular framework | 16.2.1 | 22.2.1 |
| Angular CLI | 16.2.0 | 22.2.2 |
| Angular build tooling | `@angular-devkit/build-angular` 16.x | `@angular/build` 22.2.2 |
| Angular Material/CDK | 16.2.1 | 22.2.1 |
| TypeScript | 4.9.5 | 6.0.3 |
| RxJS | 6.x | 7.8.2 |
| zone.js | 0.13.x | 0.16.3 |
| tslib | 2.x | 2.8.1 |
| Bootstrap | 3.3.x | 3.4.1 |
| jQuery | 3.x | 3.7.1 |
| Moment | 2.x | 2.31.0 |
| ESLint | 8.x | 9.39.5 |
| angular-eslint | 16.x | 22.5.0 |
| Karma/Jasmine | Karma 6, Jasmine 3 | Karma 6.4.4, Jasmine 5.13.0 |

The exact dependency ranges are recorded in `package.json` and
`package-lock.json`. `.nvmrc` contains `22`, and the package engine requires
Node.js `^22.22.3`.

## Sequential major-version hops

Each completed hop used Angular's update tooling and was committed before the
next major-version update:

| Hop | Commit | Result |
| --- | --- | --- |
| 16 → 17 | `0c97eac` | Angular 17 update and migrations completed |
| 17 → 18 | `e05f66` | Angular 18 update and migrations completed |
| 18 → 19 | `1491144` | Angular 19 update and migrations completed; declared NgModule components were explicitly marked `standalone: false` |
| 19 → 20 | `176c293` | Angular 20 update and migrations completed |
| 20 → 21 | `f4a794a` | Angular 21 update and migrations completed |
| 21 → 22 | Pending final upgrade commit | Angular 22 update, application-builder configuration, dependency cleanup, and compatibility fixes |

The Angular 22 update was run without `--force` and without
`--legacy-peer-deps`. Obsolete dependencies were removed before the update so
that the peer dependency graph could be resolved normally.

## Angular 22 changes

### Application and test builders

- Migrated the application to `@angular/build`.
- Configured the application builder, dev server, i18n extraction, and Karma
  builders.
- Kept the production build as the default build configuration.
- Kept development serving on the development configuration.
- Kept flat output in `dist/` with:

  ```json
  "outputPath": {
    "base": "dist",
    "browser": ""
  }
  ```

- Replaced the source polyfills entry point with `zone.js` for the application
  and `zone.js/testing` for Karma.
- Removed obsolete application-builder options.
- Retained Bootstrap and jQuery global styles and scripts.
- Retained Karma/Jasmine and the `ChromeHeadlessCI` launcher with
  `--no-sandbox`.
- Replaced Istanbul's old Karma reporter package with `karma-coverage`.

### TypeScript and linting

- Switched to TypeScript 6 and bundler module resolution.
- Preserved `strictTemplates`.
- Kept the repository's prior effective nullability behavior with
  `strictNullChecks: false` and `strictPropertyInitialization: false`.
- Added `ignoreDeprecations: "6.0"` for TypeScript's `baseUrl` deprecation
  while retaining the existing `src` path configuration.
- Replaced the legacy ESLint configuration with `eslint.config.js`,
  `typescript-eslint`, angular-eslint 22, and `@stylistic/eslint-plugin`.
- Disabled these rules explicitly:
  - `@angular-eslint/prefer-standalone`: the application intentionally remains
    NgModule-based.
  - `@angular-eslint/prefer-inject`: existing constructor injection is retained
    rather than rewriting unrelated services.
  - `@angular-eslint/prefer-on-push-component-change-detection`: Angular 22's
    migration inserted eager change detection, and the application continues
    to use zone-based behavior.
  - `@angular-eslint/no-empty-lifecycle-method`: existing lifecycle methods are
    retained where required by the application.

### API modernization

- Replaced `HttpClientModule` with `provideHttpClient` and
  `withInterceptorsFromDi`.
- Replaced `HttpClientTestingModule` with `provideHttpClient` and
  `provideHttpClientTesting`.
- Converted the vet and specialty resolvers to functional `ResolveFn`
  resolvers.
- Converted multi-callback RxJS subscriptions to observer objects.
- Replaced deprecated promise conversion and testing APIs, including
  `toPromise`, `TestBed.get`, and Angular's deprecated `async` helper.
- Moved Jasmine matcher messages to `withContext`.
- Changed Moment namespace imports to default imports.
- Removed the obsolete `enableProdMode` call.
- Updated `throwError` calls to the RxJS factory form.
- Updated RxJS test imports to use the public `rxjs` entry point.

### Removed tooling

The following unused or obsolete tooling was removed:

- Protractor and its e2e project and configuration.
- codelyzer and TSLint-era directives/configuration.
- `tether`.
- `source-map-explorer`.
- `core-js` where it was no longer imported.
- `karma-cli`.
- `karma-coverage-istanbul-reporter`.
- Protractor support packages and the old e2e TypeScript configuration.
- The generated `src/polyfills.ts` and `src/test.ts` entry points, which are no
  longer required by the Angular 22 builders.

No existing `docs/` output was modified.

## Test changes

The existing 28 spec files remain in the repository. The changed specs were
updated for Angular's current testing providers, RxJS 7 imports, typed test
data, and observer-style subscriptions:

- `src/app/app.component.spec.ts`
- `src/app/owners/owner-add/owner-add.component.spec.ts`
- `src/app/owners/owner-detail/owner-detail.component.spec.ts`
- `src/app/owners/owner-edit/owner-edit.component.spec.ts`
- `src/app/owners/owner-list/owner-list.component.spec.ts`
- `src/app/owners/owner.service.spec.ts`
- `src/app/parts/page-not-found/page-not-found.component.spec.ts`
- `src/app/parts/welcome/welcome.component.spec.ts`
- `src/app/pets/pet-add/pet-add.component.spec.ts`
- `src/app/pets/pet-edit/pet-edit.component.spec.ts`
- `src/app/pets/pet-list/pet-list.component.spec.ts`
- `src/app/pets/pet.service.spec.ts`
- `src/app/pettypes/pettype-edit/pettype-edit.component.spec.ts`
- `src/app/pettypes/pettype-list/pettype-list.component.spec.ts`
- `src/app/pettypes/pettype.service.spec.ts`
- `src/app/specialties/specialty-edit/specialty-edit.component.spec.ts`
- `src/app/specialties/specialty-list/specialty-list.component.spec.ts`
- `src/app/specialties/specialty.service.spec.ts`
- `src/app/vets/vet-add/vet-add.component.spec.ts`
- `src/app/vets/vet-edit/vet-edit.component.spec.ts`
- `src/app/vets/vet-list/vet-list.component.spec.ts`
- `src/app/vets/vet.service.spec.ts`
- `src/app/visits/visit-add/visit-add.component.spec.ts`
- `src/app/visits/visit-edit/visit-edit.component.spec.ts`
- `src/app/visits/visit-list/visit-list.component.spec.ts`
- `src/app/visits/visit.service.spec.ts`

The vet add and edit suites now include smoke tests because Jasmine 5 rejects
empty `describe` blocks. No test suite was removed. The final headless run
executes 45 tests successfully across these 28 spec files.

## Verification

The final Node.js 22 verification produced:

- `npm ci`: completed successfully without peer-dependency bypass flags.
- `npx ng build`: passed and emitted flat output under `dist/`.
- `npm run test-headless`: passed with `TOTAL: 45 SUCCESS`.
- `npm run lint`: passed with all files clean.

The production build reports one non-blocking critical-CSS warning for an
unmatched `%` selector. Karma reports non-blocking 404 warnings for some
font/image URLs from the legacy Bootstrap-era asset stylesheet; the tests
still complete successfully.

Run the application and checks with:

```sh
npm ci
npm start
npm run build
npm run test-headless
npm run lint
```

The development server is available at `http://localhost:4200/`. The frontend
expects the Spring PetClinic REST API at
`http://localhost:9966/petclinic/api/`.

## Known risks and follow-up considerations

- Bootstrap 3 and its jQuery integration are retained for compatibility and
  are legacy dependencies.
- Moment is in maintenance mode.
- Karma remains supported for this application but is a legacy test-runner
  choice in the Angular ecosystem.
- The Protractor e2e suite was removed as requested; the repository currently
  contains unit/component tests but no replacement browser e2e suite.
- The critical-CSS parser warning and legacy asset URL warnings should be
  revisited if the stylesheet is substantially modernized.

The Angular 16 baseline details, including the baseline dependency versions and
test result, are preserved in `/home/ubuntu/UPGRADE_BASELINE.md`.
