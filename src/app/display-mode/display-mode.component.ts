import { Component } from '@angular/core';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { BehaviorSubject } from 'rxjs';
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

  constructor(private courtControllerService: CourtControllerService) {}
}
