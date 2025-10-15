import { Component } from '@angular/core';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Court, CourtComponent } from '../court/court.component';
import { AsyncPipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-display-mode',
  standalone: true,
  imports: [AsyncPipe, DragDropModule, CourtComponent],
  templateUrl: './display-mode.component.html',
  styleUrl: './display-mode.component.css',
})
export class DisplayModeComponent {
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();

  private ngUnsubscribe$: Subject<boolean> = new Subject();

  constructor(private courtControllerService: CourtControllerService) {}

  ngOnInit() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.courtControllerService.LOCAL_STORAGE_KEY) {
        this.courtControllerService.updateCourtsFromLocalStorage();
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
