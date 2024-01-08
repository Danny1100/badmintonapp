import { Component } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerListService } from '../player-list/player-list.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  waitingPlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getWaitingPlayers();
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();

  constructor(
    private playerListService: PlayerListService,
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  removePlayer(playerId: number) {
    this.playerListService.removePlayer(playerId);
    this.matchmakingService.removeWaitingPlayer(playerId);
  }
}
