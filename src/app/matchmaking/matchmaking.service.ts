import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Player } from '../player/services/player.service';
import { PlayerListService } from '../player-list/player-list.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { Court } from '../court/court.component';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  addedPlayer$: ReplaySubject<Player> =
    this.playerListService.getAddedPlayerStream();
  playerList$: BehaviorSubject<Player[]> = this.playerListService.getPlayers();
  playerList!: Player[];
  waitingPlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>(
    [],
  );
  courtList$: BehaviorSubject<Court[]> =
    this.courtControllerService.getCourts();
  courtList!: Court[];

  getWaitingPlayers() {
    return this.waitingPlayers$;
  }
  removeWaitingPlayer(playerId: number) {
    let waitingPlayers = this.waitingPlayers$.getValue();
    waitingPlayers = waitingPlayers.filter((player) => player.id !== playerId);
    this.waitingPlayers$.next(waitingPlayers);
  }
  cycleCourt(court: Court) {
    console.log(court);
    // if there are players on the court, move them all to the bottom of the waiting players list
    // if not, run matchmaking algorithm, remove them from the waiting players list, and put them in a court
  }

  constructor(
    private playerListService: PlayerListService,
    private courtControllerService: CourtControllerService,
  ) {
    // whenever a new player is added they are automatically added to the waiting player list
    this.addedPlayer$.subscribe((player) => {
      let waitingPlayers = this.waitingPlayers$.getValue();
      waitingPlayers.push(player);
      this.waitingPlayers$.next(waitingPlayers);
    });
    this.playerList$.subscribe((players) => (this.playerList = players));
    this.courtList$.subscribe((courts) => (this.courtList = courts));
  }

  // what happens when you remove a court with existing players - players should be moved to waiting players list
}
