import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Player } from '../player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerListService {
  currentPlayerId$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  playerList$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  addedPlayer$: ReplaySubject<Player> = new ReplaySubject<Player>();

  constructor() {
    const testPlayers = [
      { id: 1, name: 'Danny Cai', skillId: 0 },
      { id: 2, name: 'Nishamini Gunasingher', skillId: 1 },
      { id: 3, name: 'Darren Lin', skillId: 2 },
      { id: 4, name: 'Danny Cai', skillId: 3 },
    ];
  }

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
