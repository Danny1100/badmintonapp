import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Player } from '../../player/services/player.service';
import {
  PlayersSortOption,
  PlayersSortOptionFormObject,
} from 'src/app/matchmaking/matchmaking.util';

@Injectable({
  providedIn: 'root',
})
export class PlayerListService {
  private currentPlayerId$: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);
  private playerList$: BehaviorSubject<Player[]> = new BehaviorSubject<
    Player[]
  >([]);
  private addedPlayer$: ReplaySubject<Player> = new ReplaySubject<Player>(1);
  private selectedPlayerListSortOption$ =
    new BehaviorSubject<PlayersSortOptionFormObject>({
      label: 'Name',
      value: PlayersSortOption.Name,
    });

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
  getSelectedPlayerListSortOptionStream() {
    return this.selectedPlayerListSortOption$;
  }
  addPlayer(player: Player) {
    const playerList = this.playerList$.getValue();
    this.playerList$.next([...playerList, player]);

    this.addedPlayer$.next(player);
  }
  removePlayer(playerId: number) {
    let playerList = this.playerList$.getValue();
    playerList = playerList.filter((player) => player.id !== playerId);
    this.playerList$.next(playerList);
  }
}
