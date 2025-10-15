import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Court } from '../court/court.component';

@Injectable({
  providedIn: 'root',
})
export class CourtControllerService {
  readonly LOCAL_STORAGE_KEY: string = 'courts';
  readonly DEFAULT_COURT_NUMBERS: number[] = [2, 3, 4, 5, 6, 7, 8, 22];
  private courts$: BehaviorSubject<Court[]> = new BehaviorSubject<Court[]>(
    this.getDefaultCourts(this.DEFAULT_COURT_NUMBERS),
  );

  private ngUnsubscribe$: Subject<boolean> = new Subject();

  constructor() {
    const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const courts = JSON.parse(data);
        this.courts$ = new BehaviorSubject<Court[]>(courts);
      } catch (e) {
        this.courts$ = new BehaviorSubject<Court[]>(
          this.getDefaultCourts(this.DEFAULT_COURT_NUMBERS),
        );
      }
    }

    this.courts$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((courts) => {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(courts));
    });
  }

  getDefaultCourts(defaultCourtNumbers: number[]): Court[] {
    return defaultCourtNumbers.map((courtNumber) => ({
      courtNumber,
      players: [],
    }));
  }
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

  updateCourtsFromLocalStorage() {
    const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (data) {
      try {
        const courts = JSON.parse(data);
        this.courts$.next(courts);
      } catch (e) {
        alert('Error parsing courts from local storage');
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
