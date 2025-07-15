import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from 'src/app/player/services/player.service';

@Injectable({
  providedIn: 'root',
})
export class LinkedPlayersService {
  private linkedPlayers$: BehaviorSubject<Player[][]> = new BehaviorSubject<
    Player[][]
  >([]);
  private linkedPlayerIds$: BehaviorSubject<Set<number>> = new BehaviorSubject<
    Set<number>
  >(new Set([]));

  constructor() {}

  getLinkedPlayers() {
    return this.linkedPlayers$;
  }
  getLinkedPlayerIds() {
    return this.linkedPlayerIds$;
  }
  removeLinkedPlayers(group: Player[]) {
    const linkedPlayerIds = this.linkedPlayerIds$.getValue();
    group.forEach((player) => linkedPlayerIds.delete(player.id));
    this.linkedPlayerIds$.next(linkedPlayerIds);

    const linkedPlayers = this.linkedPlayers$.getValue();
    const updatedLinkedPlayers = linkedPlayers.filter((g) => g !== group);
    this.linkedPlayers$.next(updatedLinkedPlayers);
  }
  removeLinkedPlayerById(id: number) {
    const linkedPlayers = this.linkedPlayers$.getValue();
    const foundGroup = linkedPlayers.find((group) =>
      group.find((player) => player.id === id),
    );
    if (!foundGroup) {
      alert(
        `Could not delete linked player group: could not find linked player group containing id ${id}`,
      );
      return;
    }
    this.removeLinkedPlayers(foundGroup);
  }
}
