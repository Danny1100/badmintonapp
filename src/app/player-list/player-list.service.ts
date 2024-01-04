import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerListService {
  playerList$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

  constructor() {}

  getPlayers() {
    return this.playerList$;
  }
  addPlayer(player: Player) {
    const newPlayerList = this.playerList$.getValue();
    newPlayerList.push(player);
    this.playerList$.next(newPlayerList);
  }
}
