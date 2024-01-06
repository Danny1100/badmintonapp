import { TestBed } from '@angular/core/testing';

import { CourtControllerService } from './court-controller.service';

describe('CourtControllerService', () => {
  let service: CourtControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
