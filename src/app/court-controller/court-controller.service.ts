import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Court } from '../court/court.component';

@Injectable({
  providedIn: 'root',
})
export class CourtControllerService {
  private courts$: BehaviorSubject<Court[]> = new BehaviorSubject<Court[]>([
    { courtNumber: 2, players: [] },
    { courtNumber: 3, players: [] },
    { courtNumber: 4, players: [] },
    { courtNumber: 5, players: [] },
    { courtNumber: 6, players: [] },
    { courtNumber: 7, players: [] },
    { courtNumber: 8, players: [] },
    { courtNumber: 22, players: [] },
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
  updateCourt(court: Court) {
    let courts = this.courts$.getValue();
    courts = courts.map((c) => {
      if (court.courtNumber === c.courtNumber) {
        return court;
      }
      return c;
    });
    this.courts$.next(courts);
  }
}
