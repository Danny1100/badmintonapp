import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from 'src/app/player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class LinkedPlayersService {
  linkedPlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  linkedPlayerIds$: BehaviorSubject<Set<number>> = new BehaviorSubject<
    Set<number>
  >(new Set([]));

  constructor() {}
}
