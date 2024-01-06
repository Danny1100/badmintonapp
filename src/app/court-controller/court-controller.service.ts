import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Court } from '../court/court.component';

@Injectable({
  providedIn: 'root',
})
export class CourtControllerService {
  courts$: BehaviorSubject<Court[]> = new BehaviorSubject<Court[]>([
    {
      courtNumber: 1,
      players: [
        { id: 1, name: 'Danny Cai', skillId: 0 },
        { id: 2, name: 'Nishamini Gunasingher', skillId: 1 },
        { id: 3, name: 'Darren Lin', skillId: 2 },
        { id: 4, name: 'Danny Cai', skillId: 3 },
      ],
    },
    {
      courtNumber: 1,
      players: [],
    },
  ]);

  constructor() {}

  getCourts() {
    return this.courts$;
  }
  addCourt() {}
  removeCourt() {}
}
