import { Component } from '@angular/core';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { Court, CourtComponent } from '../court/court.component';
import { AsyncPipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { MatchmakingGroup } from '../matchmaking/matchmaking.util';
import { PlayerComponent } from '../player/player.component';

@Component({
  selector: 'app-display-mode',
  standalone: true,
  imports: [AsyncPipe, DragDropModule, CourtComponent, PlayerComponent],
  templateUrl: './display-mode.component.html',
  styleUrl: './display-mode.component.css',
})
export class DisplayModeComponent {
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();
  matchmakingQueuedGroups$: BehaviorSubject<MatchmakingGroup[]> =
    this.matchmakingService.getMatchmakingQueuedGroups();

  private ngUnsubscribe$: Subject<boolean> = new Subject();

  constructor(
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
