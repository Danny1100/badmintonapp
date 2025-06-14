import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Player } from '../../player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerListService {
  private currentPlayerId$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  private playerList$: BehaviorSubject<Player[]> = new BehaviorSubject<
    Player[]
  >([]);
  private addedPlayer$: ReplaySubject<Player> = new ReplaySubject<Player>();

  constructor() {}

  getCurrentPlayerId() {
    return this.currentPlayerId$;
  }
  getPlayers() {
    return this.playerList$;
  }
  getAddedPlayerStream() {
    return this.addedPlayer$;
  }
  addPlayer(player: Player) {
    const newPlayerList = this.playerList$.getValue();
    newPlayerList.push(player);
    this.playerList$.next(newPlayerList);

    this.addedPlayer$.next(player);
  }
  removePlayer(playerId: number) {
    let playerList = this.playerList$.getValue();
    playerList = playerList.filter((player) => player.id !== playerId);
    this.playerList$.next(playerList);
  }
}
