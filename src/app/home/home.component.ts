import { Component, HostListener } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court, CourtComponent } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { AddCourtComponent } from '../add-court/add-court.component';
import { PlayerComponent } from '../player/player.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CourtComponent, AddCourtComponent, PlayerComponent, AsyncPipe],
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
}
