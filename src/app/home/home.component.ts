import { Component, HostListener } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court, CourtComponent } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { AddCourtComponent } from '../add-court/add-court.component';
import { PlayerComponent } from '../player/player.component';
import { AsyncPipe } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CourtComponent,
    AddCourtComponent,
    PlayerComponent,
    AsyncPipe,
    DragDropModule,
  ],
})
export class HomeComponent {
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();
  matchmakingQueuedGroups$: BehaviorSubject<Player[][]> =
    this.matchmakingService.getMatchmakingQueuedGroups();
  nonMatchmadePlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getNonMatchmadePlayers();

  constructor(
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.preventDefault();
  }

  drop(event: CdkDragDrop<Player[]>) {
    if (event === null || event.previousContainer === event.container) return;
    
    // ensures max number of players in a matchmadeGroup is 4
    const targetElement: HTMLElement = event.container.element.nativeElement;
    if (targetElement.className.includes("waiting-group-players-container") && event.container.data.length >= 4) return;
    
    transferArrayItem(
      event.previousContainer.data ?? [],
      event.container.data ?? [],
      event.previousIndex,
      event.currentIndex,
    );
    const newMatchmakingQueuedGroups =
      this.matchmakingService.getUpdatedMatchmakingQueuedGroups(
        this.matchmakingQueuedGroups$.getValue(),
        this.matchmakingService.getWaitingPlayers().getValue(),
      );
    this.matchmakingQueuedGroups$.next(newMatchmakingQueuedGroups);

    const newNonMatchmadePlayers = this.matchmakingService.getUpdatedNonMatchmadePlayers(this.matchmakingQueuedGroups$.getValue(), this.matchmakingService.getWaitingPlayers().getValue());
    this.nonMatchmadePlayers$.next(newNonMatchmadePlayers)
  }
}
