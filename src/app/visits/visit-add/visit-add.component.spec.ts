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


import {Component, Input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MY_DATE_FORMATS} from '../visits.module';
import {of, throwError} from 'rxjs';

import {VisitAddComponent} from './visit-add.component';
import {VisitService} from '../visit.service';
import {Visit} from '../visit';
import {PetService} from '../../pets/pet.service';
import {Pet} from '../../pets/pet';
import {OwnerService} from '../../owners/owner.service';
import {Owner} from '../../owners/owner';

@Component({selector: 'app-visit-list', template: ''})
class VisitListStubComponent {
  @Input() visits: Visit[];
}

describe('VisitAddComponent', () => {
  let owner: Owner;
  let pet: Pet;
  let fixture: ComponentFixture<VisitAddComponent>;
  let visitService: jasmine.SpyObj<VisitService>;
  let petService: jasmine.SpyObj<PetService>;
  let ownerService: jasmine.SpyObj<OwnerService>;
  let router: jasmine.SpyObj<Router>;

  const el = (selector: string): HTMLElement => fixture.nativeElement.querySelector(selector);
  const addButton = () => el('button[type="submit"]') as HTMLButtonElement;
  const buttonByText = (text: string) =>
    (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .find(button => button.textContent.trim() === text);
  const helpTexts = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.help-block'))
      .map((node: HTMLElement) => node.textContent.trim());
  const petRowText = () =>
    Array.from(fixture.nativeElement.querySelectorAll('table tr:last-child td'))
      .map((cell: HTMLElement) => cell.textContent.trim());

  async function type(selector: string, value: string) {
    const input = el(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function createComponent() {
    fixture = TestBed.createComponent(VisitAddComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    owner = {
      id: 1,
      firstName: 'George',
      lastName: 'Franklin',
      address: '110 W. Liberty St.',
      city: 'Madison',
      telephone: '6085551023',
      pets: []
    };
    pet = {
      id: 1,
      ownerId: 1,
      name: 'Leo',
      birthDate: '2010-09-07',
      type: {id: 1, name: 'cat'},
      owner: null,
      visits: [{id: 1, date: '2013-01-01', description: 'rabies shot', pet: null, petId: 1}]
    };

    visitService = jasmine.createSpyObj<VisitService>('VisitService', ['addVisit']);
    petService = jasmine.createSpyObj<PetService>('PetService', ['getPetById']);
    ownerService = jasmine.createSpyObj<OwnerService>('OwnerService', ['getOwnerById']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    petService.getPetById.and.returnValue(of(pet));
    ownerService.getOwnerById.and.returnValue(of(owner));

    await TestBed.configureTestingModule({
      declarations: [VisitAddComponent, VisitListStubComponent],
      imports: [FormsModule, MatDatepickerModule, MatMomentDateModule],
      providers: [
        {provide: VisitService, useValue: visitService},
        {provide: PetService, useValue: petService},
        {provide: OwnerService, useValue: ownerService},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: {snapshot: {params: {id: '1'}}}},
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
      ]
    }).compileComponents();
  });

  describe('on load', () => {
    beforeEach(createComponent);

    it('loads the pet from the route id and its owner', () => {
      expect(petService.getPetById).toHaveBeenCalledTimes(1);
      expect(String(petService.getPetById.calls.argsFor(0)[0])).toBe('1');
      expect(ownerService.getOwnerById).toHaveBeenCalledOnceWith(1);
    });

    it('shows the pet name, birth date, type and owner', () => {
      expect(el('h2').textContent).toContain('New Visit');
      expect(petRowText()).toEqual(['Leo', '2010-09-07', 'cat', 'George Franklin']);
    });

    it('passes the pet\'s previous visits to the visit list', () => {
      const list = fixture.debugElement.query(By.directive(VisitListStubComponent))
        .componentInstance as VisitListStubComponent;
      expect(list.visits).toEqual(pet.visits);
    });

    it('keeps "Add Visit" disabled until date and description are entered', async () => {
      expect(addButton().disabled).toBeTrue();
      await type('#description', 'annual checkup');
      expect(addButton().disabled).toBeTrue();
      await type('input[name="date"]', '2024/03/15');
      expect(addButton().disabled).toBeFalse();
    });

    it('navigates back to the owner when "Back" is clicked', () => {
      buttonByText('Back').click();
      expect(router.navigate).toHaveBeenCalledWith(['/owners', 1]);
      expect(visitService.addVisit).not.toHaveBeenCalled();
    });
  });

  describe('submitting', () => {
    beforeEach(createComponent);

    async function fillValidForm() {
      await type('input[name="date"]', '2024/03/15');
      await type('#description', 'annual checkup');
    }

    it('creates the visit for the pet with an ISO date and returns to the owner', async () => {
      visitService.addVisit.and.returnValue(of({id: 5, date: '2024-03-15', description: 'annual checkup', pet}));

      await fillValidForm();
      addButton().click();

      expect(visitService.addVisit).toHaveBeenCalledOnceWith(jasmine.objectContaining({
        id: null,
        date: '2024-03-15',
        description: 'annual checkup',
        pet: jasmine.objectContaining({id: 1, ownerId: 1})
      }));
      expect(router.navigate).toHaveBeenCalledOnceWith(['/owners', 1]);
    });

    it('stays on the form and records the error when the API rejects the visit', async () => {
      visitService.addVisit.and.returnValue(throwError('server returned code 500 with body "Internal Server Error"'));

      await fillValidForm();
      addButton().click();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(fixture.componentInstance.addedSuccess).toBeFalse();
      expect(fixture.componentInstance.errorMessage).toContain('500');
    });
  });

  describe('validation', () => {
    beforeEach(createComponent);

    it('shows "Description is required" when the description is cleared', async () => {
      await type('#description', 'x');
      await type('#description', '');

      expect(helpTexts()).toContain('Description is required');
      expect(addButton().disabled).toBeTrue();
    });

    it('shows "Date is required" when the date is cleared', async () => {
      await type('input[name="date"]', '2024/03/15');
      await type('input[name="date"]', '');

      expect(helpTexts()).toContain('Date is required');
      expect(addButton().disabled).toBeTrue();
    });

    it('rejects a date that cannot be parsed', async () => {
      await type('#description', 'annual checkup');
      await type('input[name="date"]', 'not a date');

      expect(addButton().disabled).toBeTrue();
    });
  });

  describe('when the pet cannot be loaded', () => {
    beforeEach(async () => {
      petService.getPetById.and.returnValue(throwError('server returned code 404 with body "Not Found"'));
      await createComponent();
    });

    it('records the error and does not request an owner', () => {
      expect(fixture.componentInstance.errorMessage).toContain('404');
      expect(ownerService.getOwnerById).not.toHaveBeenCalled();
      expect(petRowText()).toEqual(['', '', '', '']);
    });
  });
});
