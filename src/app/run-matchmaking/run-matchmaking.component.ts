import { Component } from '@angular/core';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../player/services/player.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-run-matchmaking',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './run-matchmaking.component.html',
  styleUrl: './run-matchmaking.component.css',
})
export class RunMatchmakingComponent {
  numberOfPlayersToMatchmake: number = 4;
  waitingPlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.waitingPlayers$;

  constructor(private matchmakingService: MatchmakingService) {}

  matchmake() {
    this.matchmakingService.matchmake(
      this.waitingPlayers$.getValue(),
      this.numberOfPlayersToMatchmake,
    );
  }
}
