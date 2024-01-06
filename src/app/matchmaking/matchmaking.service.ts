import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  waitingPlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>(
    [],
  );

  constructor() {}
}
