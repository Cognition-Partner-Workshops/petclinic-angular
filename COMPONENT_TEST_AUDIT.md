# Component Test Audit — petclinic-angular

Scope: every `@Component` under `src/app` and its colocated `*.component.spec.ts` (Karma + Jasmine, Angular 16).
Baseline run before changes: **43 specs, all passing** (`npm run test-headless`). After changes: **74 specs, all passing**.

## Scoring rubric

Each dimension is scored **0 (none) / 1 (partial) / 2 (good)**. `N/A` = the component has no such surface (e.g. no form).

| Dimension | What earns a 2 |
|---|---|
| **Tests behavior** | Asserts what the user sees or what leaves the component (rendered DOM, service calls with payloads, navigation), not private methods or `spy.calls.any()` on methods invoked directly from the test. |
| **Tests errors** | Drives the service/observable error path and asserts the outcome (no navigation, state preserved, error recorded/shown). |
| **Tests validation** | Types into inputs and asserts validation messages and the disabled/enabled submit button. |
| **Mock quality** | Only the collaborators the component uses, typed spies, realistic data that actually emits, no unused or misleading spies, no duplicate TestBed setup. |

## Results (before changes)

| Component | Has spec? | Active tests | Tests behavior? | Tests errors? | Tests validation? | Mock quality | Total | Notes |
|---|---|---|---|---|---|---|---|---|
| `AppComponent` | Yes | 1 | 0 | N/A | N/A | 1 | 1/4 | Only `toBeTruthy()`. Static shell; `CUSTOM_ELEMENTS_SCHEMA` hides nav template errors. |
| `WelcomeComponent` | Yes | 1 | 0 | N/A | N/A | 2 | 2/4 | Static page; creation test is acceptable but could assert the heading. |
| `PageNotFoundComponent` | Yes | 1 | 0 | N/A | N/A | 2 | 2/4 | Static page; same as above. |
| `OwnerListComponent` | Yes | 3 | 1 | 0 | N/A | 1 | 2/6 | Good: asserts rendered owner full name. Weak: "calls ngOnInit" checks a spy, not output. `searchByLastName` untested. Imports the entire `OwnersModule` + `PartsModule` instead of declaring the component. |
| `OwnerDetailComponent` | Yes | 3 | 0 | 0 | N/A | 0 | 0/6 | **False positive**: "find owner using ownerId" asserts inside an un-awaited `whenStable().then()` — Karma reports *"has no expectations"*. Routing test expects `['/owners']` for Edit and Add Pet (wrong routes; passes only because the first click already matched) and calls `spyOn` *after* clicking. Stub owner (`id: 1`, no address) doesn't match the asserted fixture. TestBed configured twice; unused `import ... from 'constants'`. |
| `OwnerAddComponent` | Yes | 3 | 1 | 0 | 0 | 1 | 2/8 | Back-button navigation is a real behavior check. "add owner" spies `component.onSubmit` (implementation detail) and never asserts `addOwner` payload or navigation. Seven validated fields, none tested. TestBed configured twice; `RouterTestingModule` *and* `RouterStub`; deprecated `async`. |
| `OwnerEditComponent` | Yes | 3 | 1 | 0 | 0 | 1 | 2/8 | Same pattern as OwnerAdd: spies `onSubmit`; stub lacks `updateOwner`, so the save path cannot be exercised. Validation untested. |
| `PetListComponent` | Yes | 2 | 0 | 0 | N/A | 1 | 1/6 | Calls `component.deletePet()` directly and checks `spy.calls.any()`; never clicks the button or checks the row disappears. Edit/Add Visit navigation untested. |
| `PetAddComponent` | Yes | 1 | 0 | 0 | 0 | 0 | 0/8 | Spies `petService.getPetById`, which this component never calls. Stubs lack `addPet`; `getPetTypes`/`getOwnerById` return empty `of()` that never emits. |
| `PetEditComponent` | Yes | 1 | 0 | 0 | 0 | 0 | 0/8 | Spies `updatePet` but `getPetById` returns `of()` so nothing loads; `OwnerServiceStub` is empty (would throw if the pet ever emitted). |
| `PettypeListComponent` | Yes | 2 | 0 | 0 | N/A | 1 | 1/6 | Direct method call + `spy.calls.any()`. `getPetTypes` stub never emits; list rendering untested. |
| `PettypeAddComponent` | Yes | 1 | 0 | 0 | 0 | 1 | 1/8 | Creation only. Provides `Router`/`ActivatedRoute` the component doesn't inject. `newPetType` output untested. |
| `PettypeEditComponent` | Yes | 1 | 0 | 0 | 0 | 1 | 1/8 | Creation only; `updatePetType` not stubbed. |
| `SpecialtyListComponent` | Yes | 2 | 0 | 0 | N/A | 1 | 1/6 | Same pattern as PettypeList. |
| `SpecialtyAddComponent` | Yes | 1 | 0 | 0 | 0 | 0 | 0/8 | Creation only; TestBed configured twice; deprecated `async` import; unneeded router providers. |
| `SpecialtyEditComponent` | Yes | 1 | 0 | 0 | 0 | 1 | 1/8 | Creation only; `updateSpecialty` not stubbed. |
| `VetListComponent` | Yes | 1 | 0 | 0 | N/A | 1 | 1/6 | Creation only; `getVets` stub never emits; delete/edit/add untested. |
| **`VetAddComponent`** | Yes | **0** | 0 | 0 | 0 | 0 | **0/8** | All tests commented out (`// TODO complete test`). No providers for `VetService`/`SpecialtyService`/`Router` — the setup would throw if a test were enabled. |
| **`VetEditComponent`** | Yes | **0** | 0 | 0 | 0 | 0 | **0/8** | All tests commented out. Imports `FormsModule` for a reactive form, no `ReactiveFormsModule`/`MatSelectModule`, no resolver data — setup cannot work. |
| **`VisitAddComponent`** | Yes | 1 | 0 | 0 | 0 | 0 | **0/8** | Spies `petService.addPet` (irrelevant to adding a visit). `VisitServiceStub` and `OwnerServiceStub` are empty, so the primary flow (`addVisit`) can't be exercised. |
| `VisitEditComponent` | Yes | 1 | 0 | 0 | 0 | 0 | 0/8 | Spy returns a visit without `petId`; `getPetById` returns `of()`; empty `OwnerServiceStub`. |
| `VisitListComponent` | Yes | 2 | 0 | 0 | N/A | 1 | 1/6 | Direct method call + `spy.calls.any()`; "no visits" state untested. |
| `DummyComponent`, `RouterOutletStubComponent` (`testing/`) | No | — | N/A | N/A | N/A | N/A | — | Test helpers, not app components; no spec needed. |

**Coverage of spec files:** 22/22 app components have a spec file. **Coverage of meaningful behavior:** low — 14/22 specs contain at most one test (usually just `toBeTruthy()`), 0/22 test an error path, 0/12 form components test validation.

### Choosing the 3 weakest

`VetAddComponent` and `VetEditComponent` are unambiguous: zero active tests and broken setup. Several components tie at 0/8 for the third slot (`PetAdd`, `PetEdit`, `VisitAdd`, `VisitEdit`, `SpecialtyAdd`). `VisitAddComponent` was chosen because its only spy targets the wrong service method and its `VisitService` stub has no `addVisit`, so the component's core purpose had no coverage at all.

## Improvements made

| Component | Before | After | What's now covered |
|---|---|---|---|
| `VetAddComponent` | 0 tests | 11 tests | Specialty dropdown populated from API; Save disabled until valid; submit payload (`id: null`, names, selected specialty or `[]`) + navigation to `/vets`; Back button; required / letters-only / 30-char validation messages; invalid form never calls API; `addVet` error keeps user on form; `getSpecialties` error still allows creating a vet. |
| `VetEditComponent` | 0 tests | 10 tests | Form pre-filled from resolver data (incl. mat-select display via `compareSpecFn`); edit + save payload and navigation; choosing an extra specialty through the real `mat-select` overlay; Back button; required / letters-only / min-length validation; invalid form never calls API; `updateVet` error keeps user on form. |
| `VisitAddComponent` | 1 test | 11 tests | Pet loaded from route id and owner from `pet.ownerId`; pet/owner summary row rendered; previous visits passed to `<app-visit-list>` (stubbed child, not `CUSTOM_ELEMENTS_SCHEMA`); Add Visit disabled until date + description; submit sends ISO `YYYY-MM-DD` date and navigates to owner; Back button; required/unparseable-date validation; `addVisit` error and `getPetById` 404 handling. |

Practices applied: typed `jasmine.createSpyObj` with only the methods each component calls; realistic PetClinic sample data (George Franklin / Leo / Helen Leary); interaction through the DOM (`input` events, button clicks, real `mat-select`) rather than calling component methods; no `CUSTOM_ELEMENTS_SCHEMA`; fresh spies per test; `async/await` with `whenStable()` instead of un-awaited promises.

Sanity check: temporarily breaking navigation in `VetAdd`/`VetEdit` and the date format in `VisitAdd` made 5 of the new tests fail, confirming they guard real behavior.

## Cross-cutting findings

1. **Errors are mostly invisible to users.** Components store `errorMessage`, but only `OwnerEditComponent`'s template renders it. Error-path tests can therefore only assert "stayed on page / didn't navigate / state recorded". Recommend adding a dismissable alert bound to `errorMessage`, then upgrading the error tests to assert the visible text.
2. **`of()` stubs never emit.** Most stubs return `of()` (completes immediately with no value), so success paths and rendering were never exercised. Return realistic data with `of(value)`.
3. **Spying on the component under test** (`spyOn(component, 'onSubmit')`) proves only that Angular wired the click, not what the feature does. Assert service payloads and navigation instead.
4. **Un-awaited async assertions** (`fixture.whenStable().then(() => expect(...))` without `waitForAsync`/`await`) silently pass — confirmed by Karma's *"has no expectations"* warning on `OwnerDetailComponent`.
5. **`CUSTOM_ELEMENTS_SCHEMA` everywhere** hides template typos and unknown inputs. Prefer importing the real module or declaring small stub components.
6. **Duplicate `TestBed.configureTestingModule`** blocks in `OwnerAdd`, `OwnerDetail`, `SpecialtyAdd`; deprecated `async`, `TestBed.get`, and `rxjs/index` imports across specs.
7. **Product issues surfaced while testing** (not changed in this PR):
   - `VetEditComponent` enforces `Validators.minLength(2)` but the message says "must be at least 1 characters long".
   - `PetEditComponent` pet-type validation messages read "First name is required" / "First name must be at least 2 characters long".

## Suggested next targets

`OwnerDetailComponent` (fix the false-positive and wrong route expectations), then `PetAdd`, `PetEdit`, `VisitEdit` — same pattern as the `VisitAdd` rewrite.
