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
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';

import {VetAddComponent} from './vet-add.component';
import {VetService} from '../vet.service';
import {Vet} from '../vet';
import {SpecialtyService} from '../../specialties/specialty.service';
import {Specialty} from '../../specialties/specialty';

describe('VetAddComponent', () => {
  const specialties: Specialty[] = [
    {id: 1, name: 'radiology'},
    {id: 2, name: 'surgery'},
    {id: 3, name: 'dentistry'}
  ];

  let fixture: ComponentFixture<VetAddComponent>;
  let vetService: jasmine.SpyObj<VetService>;
  let specialtyService: jasmine.SpyObj<SpecialtyService>;
  let router: jasmine.SpyObj<Router>;

  const el = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const saveButton = () => el('button[type="submit"]') as HTMLButtonElement;
  const helpTexts = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.help-block'))
      .map((node: HTMLElement) => node.textContent.trim());

  async function type(selector: string, value: string) {
    const input = el(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function selectSpecialty(index: number) {
    const select = el('#specialties') as HTMLSelectElement;
    select.value = select.options[index].value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function createComponent() {
    fixture = TestBed.createComponent(VetAddComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vetService = jasmine.createSpyObj<VetService>('VetService', ['addVet']);
    specialtyService = jasmine.createSpyObj<SpecialtyService>('SpecialtyService', ['getSpecialties']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    specialtyService.getSpecialties.and.returnValue(of(specialties));

    await TestBed.configureTestingModule({
      declarations: [VetAddComponent],
      imports: [FormsModule],
      providers: [
        {provide: VetService, useValue: vetService},
        {provide: SpecialtyService, useValue: specialtyService},
        {provide: Router, useValue: router}
      ]
    }).compileComponents();
  });

  describe('on load', () => {
    beforeEach(createComponent);

    it('shows the "New Veterinarian" form with the specialties from the API', () => {
      expect(el('h2').textContent).toContain('New Veterinarian');
      const options = Array.from((el('#specialties') as HTMLSelectElement).options)
        .map(option => option.textContent.trim());
      expect(options).toEqual(['radiology', 'surgery', 'dentistry']);
    });

    it('keeps "Save Vet" disabled while the required fields are empty', () => {
      expect(saveButton().disabled).toBeTrue();
    });

    it('navigates back to the vet list when "Back" is clicked', () => {
      (el('button[type="button"]') as HTMLButtonElement).click();
      expect(router.navigate).toHaveBeenCalledWith(['/vets']);
      expect(vetService.addVet).not.toHaveBeenCalled();
    });
  });

  describe('submitting', () => {
    beforeEach(createComponent);

    it('creates the vet with the selected specialty and returns to the vet list', async () => {
      const created: Vet = {id: 7, firstName: 'James', lastName: 'Carter', specialties: [specialties[1]]};
      vetService.addVet.and.returnValue(of(created));

      await type('#firstName', 'James');
      await type('#lastName', 'Carter');
      await selectSpecialty(1);
      expect(saveButton().disabled).toBeFalse();

      saveButton().click();

      expect(vetService.addVet).toHaveBeenCalledOnceWith(jasmine.objectContaining({
        id: null,
        firstName: 'James',
        lastName: 'Carter',
        specialties: [specialties[1]]
      }));
      expect(router.navigate).toHaveBeenCalledOnceWith(['/vets']);
    });

    it('creates the vet with no specialties when none is selected', async () => {
      vetService.addVet.and.returnValue(of({id: 8, firstName: 'Linda', lastName: 'Douglas', specialties: []}));

      await type('#firstName', 'Linda');
      await type('#lastName', 'Douglas');
      saveButton().click();

      expect(vetService.addVet).toHaveBeenCalledOnceWith(jasmine.objectContaining({specialties: []}));
    });

    it('stays on the form and records the error when the API rejects the vet', async () => {
      vetService.addVet.and.returnValue(throwError('server returned code 500 with body "Internal Server Error"'));

      await type('#firstName', 'James');
      await type('#lastName', 'Carter');
      saveButton().click();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(fixture.componentInstance.errorMessage).toContain('500');
      expect((el('#firstName') as HTMLInputElement).value).toBe('James');
    });
  });

  describe('validation', () => {
    beforeEach(createComponent);

    it('shows a required message and disables save when first name is cleared', async () => {
      await type('#firstName', 'J');
      await type('#firstName', '');

      expect(helpTexts()).toContain('First name is required');
      expect(saveButton().disabled).toBeTrue();
    });

    it('rejects names containing non-letters', async () => {
      await type('#firstName', 'James2');
      await type('#lastName', 'Carter!');

      expect(helpTexts()).toContain('First Name may only consist of letters');
      expect(helpTexts()).toContain('Last Name may only consist of letters');
      expect(saveButton().disabled).toBeTrue();
    });

    it('caps names at 30 characters and accepts names of that length', async () => {
      const input = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLInputElement;
      expect(input('#firstName').maxLength).toBe(30);
      expect(input('#lastName').maxLength).toBe(30);

      await type('#firstName', 'A'.repeat(30));
      await type('#lastName', 'Carter');

      expect(helpTexts()).not.toContain('First Name may be only 30 characters long');
      expect(saveButton().disabled).toBeFalse();
    });

    it('does not call the API when the form is invalid', async () => {
      await type('#firstName', 'James');
      saveButton().click();

      expect(vetService.addVet).not.toHaveBeenCalled();
    });
  });

  describe('when specialties fail to load', () => {
    beforeEach(async () => {
      specialtyService.getSpecialties.and.returnValue(throwError('server returned code 503 with body "Service Unavailable"'));
      await createComponent();
    });

    it('still lets the user create a vet without a specialty', async () => {
      expect((el('#specialties') as HTMLSelectElement).options.length).toBe(0);
      expect(fixture.componentInstance.errorMessage).toContain('503');

      vetService.addVet.and.returnValue(of({id: 9, firstName: 'Helen', lastName: 'Leary', specialties: []}));
      await type('#firstName', 'Helen');
      await type('#lastName', 'Leary');
      saveButton().click();

      expect(vetService.addVet).toHaveBeenCalledOnceWith(jasmine.objectContaining({specialties: []}));
    });
  });
});
