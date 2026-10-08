/*
 *
 *  * Copyright 2016-2017 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */


import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSelectModule} from '@angular/material/select';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of, throwError} from 'rxjs';

import {VetEditComponent} from './vet-edit.component';
import {VetService} from '../vet.service';
import {Vet} from '../vet';
import {SpecialtyService} from '../../specialties/specialty.service';
import {Specialty} from '../../specialties/specialty';

describe('VetEditComponent', () => {
  const specs: Specialty[] = [
    {id: 1, name: 'radiology'},
    {id: 2, name: 'surgery'},
    {id: 3, name: 'dentistry'}
  ];

  let resolvedVet: Vet;
  let fixture: ComponentFixture<VetEditComponent>;
  let vetService: jasmine.SpyObj<VetService>;
  let router: jasmine.SpyObj<Router>;

  const el = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const saveButton = () => el('button[type="submit"]') as HTMLButtonElement;
  const helpTexts = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.help-block'))
      .map((node: HTMLElement) => node.textContent.trim());

  function type(selector: string, value: string) {
    const input = el(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    // Resolver data uses separate object instances so the specialty compareWith is exercised.
    resolvedVet = {
      id: 2,
      firstName: 'Helen',
      lastName: 'Leary',
      specialties: [{id: 1, name: 'radiology'}]
    };
    vetService = jasmine.createSpyObj<VetService>('VetService', ['updateVet']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [VetEditComponent],
      imports: [ReactiveFormsModule, MatSelectModule, NoopAnimationsModule],
      providers: [
        {provide: VetService, useValue: vetService},
        {provide: SpecialtyService, useValue: {}},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: {snapshot: {data: {vet: resolvedVet, specs}}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VetEditComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  describe('on load', () => {
    it('pre-fills the form with the resolved vet', () => {
      expect(el('h2').textContent).toContain('Edit Veterinarian');
      expect((el('#firstName') as HTMLInputElement).value).toBe('Helen');
      expect((el('#lastName') as HTMLInputElement).value).toBe('Leary');
      expect(el('.mat-mdc-select-value-text').textContent.trim()).toBe('radiology');
      expect(saveButton().disabled).toBeFalse();
    });

    it('navigates back to the vet list when "Back" is clicked', () => {
      (el('button[type="button"]') as HTMLButtonElement).click();
      expect(router.navigate).toHaveBeenCalledWith(['/vets']);
      expect(vetService.updateVet).not.toHaveBeenCalled();
    });
  });

  describe('submitting', () => {
    it('saves the edited vet and returns to the vet list', () => {
      vetService.updateVet.and.returnValue(of({...resolvedVet, lastName: 'Leary-Smith'}));

      type('#lastName', 'Learysmith');
      saveButton().click();

      expect(vetService.updateVet).toHaveBeenCalledOnceWith('2', {
        id: 2,
        firstName: 'Helen',
        lastName: 'Learysmith',
        specialties: [{id: 1, name: 'radiology'}]
      });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/vets']);
    });

    it('saves specialties chosen in the multi-select', async () => {
      vetService.updateVet.and.returnValue(of(resolvedVet));

      (el('.mat-mdc-select-trigger') as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();
      const options = Array.from(document.querySelectorAll('mat-option')) as HTMLElement[];
      options.find(option => option.textContent.trim() === 'surgery').click();
      fixture.detectChanges();

      expect(el('.mat-mdc-select-value-text').textContent.trim()).toBe('radiology, surgery');

      saveButton().click();
      const [, savedVet] = vetService.updateVet.calls.mostRecent().args;
      expect(savedVet.specialties.map(s => s.name)).toEqual(['radiology', 'surgery']);
    });

    it('stays on the form and records the error when the API rejects the update', () => {
      vetService.updateVet.and.returnValue(throwError('server returned code 400 with body "Bad Request"'));

      saveButton().click();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(fixture.componentInstance.errorMessage).toContain('400');
      expect((el('#firstName') as HTMLInputElement).value).toBe('Helen');
    });
  });

  describe('validation', () => {
    it('shows a required message and disables save when first name is cleared', () => {
      type('#firstName', '');

      expect(helpTexts()).toContain('First Name is required');
      expect(saveButton().disabled).toBeTrue();
    });

    it('shows a required message and disables save when last name is cleared', () => {
      type('#lastName', '');

      expect(helpTexts()).toContain('Last Name is required');
      expect(saveButton().disabled).toBeTrue();
    });

    it('rejects names containing non-letters', () => {
      type('#firstName', 'Helen1');

      expect(helpTexts()).toContain('First Name may only consist of letters');
      expect(saveButton().disabled).toBeTrue();
    });

    it('rejects single-letter names', () => {
      type('#lastName', 'L');

      expect(saveButton().disabled).toBeTrue();
    });

    it('does not call the API when the form is invalid', () => {
      type('#firstName', '');
      saveButton().click();

      expect(vetService.updateVet).not.toHaveBeenCalled();
    });
  });
});
