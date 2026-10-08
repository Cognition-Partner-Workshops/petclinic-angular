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


/**
 * @author Vitaliy Fedoriv
 */

import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
// Other imports
import { TestBed } from '@angular/core/testing';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';

import { HttpErrorHandler } from '../error.service';

import { OwnerService } from './owner.service';
import { Owner } from './owner';

describe('OwnerService', () => {
  let httpTestingController: HttpTestingController;
  let ownerService: OwnerService;
  let expectedOwners: Owner[];
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        OwnerService,
        HttpErrorHandler,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    ownerService = TestBed.inject(OwnerService);
    expectedOwners = [
      { id: 1, firstName: 'A' },
      { id: 2, firstName: 'B' },
    ] as Owner[];
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should return expected owners (called once)', () => {
    ownerService
      .getOwners()
      .subscribe(
        {
          next: (owners) =>
            expect(owners)
              .withContext('should return expected owners')
              .toEqual(expectedOwners),
          error: fail,
        },
      );

    // OwnerService should have made one request to GET owners from expected URL
    const req = httpTestingController.expectOne(ownerService.entityUrl);
    expect(req.request.method).toEqual('GET');

    // Respond with the mock owners
    req.flush(expectedOwners);
  });

  it('search the owner by id', () => {
    ownerService.getOwnerById(1).subscribe((owners) => {
      expect(owners).toEqual(expectedOwners[0]);
    });
    const id = '1';
    const req = httpTestingController.expectOne(
      ownerService.entityUrl + '/' + id,
    );
    expect(req.request.method).toEqual('GET');
    req.flush(expectedOwners[0]);
  });

  it('add owner', () => {
    const owner: Owner = {
      id: 0,
      firstName: 'Mary',
      lastName: 'John',
      address: '110 W. Church St.',
      city: 'Madison',
      telephone: '6085551023',
      pets: [],
    };

    ownerService
      .addOwner(owner)
      .subscribe(
        {
        next: (data) =>
          expect(data).withContext('should return new owner').toEqual(owner),
          error: fail,
        },
      );

    const req = httpTestingController.expectOne(ownerService.entityUrl);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(owner);

    //expect the server to return the owner after POST
    const expectedResponse = new HttpResponse({
      status: 201,
      statusText: 'Created',
      body: owner,
    });
    req.event(expectedResponse);
  });

  it('updateOwner', () => {
    const owner: Owner = {
      id: 1,
      firstName: 'George',
      lastName: 'Franklin',
      address: '110 W. Church St.',
      city: 'Madison',
      telephone: '6085551023',
      pets: [],
    };

    ownerService
      .updateOwner(owner.id.toString(), owner)
      .subscribe({
        next: (data) =>
          expect(data).withContext('updated owner').toEqual(owner),
        error: fail,
      });

    const req = httpTestingController.expectOne(
      ownerService.entityUrl + '/' + owner.id,
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(owner);
    const expectedResponse = new HttpResponse({
      status: 204,
      statusText: 'No Content',
      body: owner,
    });
    req.event(expectedResponse);
  });

  it('delete Owner', () => {
    console.log('Inside Delete Owner');
    ownerService.deleteOwner('1').subscribe();
    const req = httpTestingController.expectOne(ownerService.entityUrl + '/1');
    expect(req.request.method).toEqual('DELETE');
    expect(req.request.body).toEqual(null);
  });

  it('search for delete Owner', () => {
    ownerService.getOwnerById(1).subscribe({
      next: () => fail('Should have failed with 404 error'),
      error: (error: string) =>
        expect(error).toContain('server returned code 404 with body "404 error"'),
    });

    const req = httpTestingController.expectOne({
      method: 'GET',
      url: ownerService.entityUrl + '/1',
    });
    req.flush('404 error', { status: 404, statusText: 'Not Found' });
  });
});
