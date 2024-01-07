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
      courtNumber: 2,
      players: [],
    },
    {
      courtNumber: 3,
      players: [],
    },
  ]);

  constructor() {}

  getCourts() {
    return this.courts$;
  }
  addCourt(courtNumber: number) {
    const courts = this.courts$.getValue();
    if (courts.find((court) => court.courtNumber === courtNumber)) {
      alert('Court already exists');
      return;
    }
    courts.push({ courtNumber, players: [] });
    this.courts$.next(courts);
  }
  removeCourt(courtNumber: number) {
    let courts = this.courts$.getValue();
    courts = courts.filter((court) => court.courtNumber !== courtNumber);
    this.courts$.next(courts);
  }
}
