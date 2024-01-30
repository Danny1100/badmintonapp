import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from 'src/app/player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class LinkedPlayersService {
  linkedPlayers$: BehaviorSubject<Player[][]> = new BehaviorSubject<Player[][]>(
    [],
  );
  linkedPlayerIds$: BehaviorSubject<Set<number>> = new BehaviorSubject<
    Set<number>
  >(new Set([]));

  constructor() {}

  removeLinkedPlayers(group: Player[]) {
    const linkedPlayerIds = this.linkedPlayerIds$.getValue();
    group.forEach((player) => linkedPlayerIds.delete(player.id));
    this.linkedPlayerIds$.next(linkedPlayerIds);
    const linkedPlayers = this.linkedPlayers$.getValue();
    const updatedLinkedPlayers = linkedPlayers.filter(
      (linkedPlayers) =>
        !linkedPlayers.find((player) => player.id === group[0].id),
    );
    this.linkedPlayers$.next(updatedLinkedPlayers);
  }
}
