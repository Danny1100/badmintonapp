import { TestBed } from '@angular/core/testing';

import { LinkedPlayersService } from './linked-players.service';

describe('LinkedPlayersService', () => {
  let service: LinkedPlayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkedPlayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
