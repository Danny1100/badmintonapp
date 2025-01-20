import { BehaviorSubject } from 'rxjs';
import { Player } from '../player/services/player.service';

export class MatchmakingPlayerQueueSubject {
  private subject: BehaviorSubject<Player[]>;
  private waitingPlayers$!: BehaviorSubject<Player[]>;

  constructor(
    initialPlayers: Player[],
    waitingPlayersSubject: BehaviorSubject<Player[]>,
  ) {
    this.subject = new BehaviorSubject<Player[]>(initialPlayers);
    this.waitingPlayers$ = waitingPlayersSubject;
  }

  getBehaviorSubject() {
    return this.subject;
  }

  getValue(): Player[] {
    return this.subject.getValue();
  }

  validate(matchmakingQueuedPlayers: Player[]): boolean {
    // check that subject does not have duplicate players
    const matchmakingQueuedPlayerIds = new Set<number>();
    for (const player of matchmakingQueuedPlayers) {
      if (matchmakingQueuedPlayerIds.has(player.id)) {
        alert(`Duplicate player in matchmaking player queue: ${player.id}`);
        return false;
      } else {
        matchmakingQueuedPlayerIds.add(player.id);
      }
    }

    const waitingPlayers = this.waitingPlayers$.getValue();
    // check that length of matchmakingQueuedPlayers is the same as waitingPlayers
    if (matchmakingQueuedPlayers.length !== waitingPlayers.length) {
      alert(
        'Mismatch between waitingPlayers and matchmakingQueuedPlayers length',
      );
      return false;
    }

    // check that all players in waitingPlayers are in matchmakingQueuedPlayers
    for (const player of waitingPlayers) {
      if (!matchmakingQueuedPlayerIds.has(player.id)) {
        alert(
          `Player ${player.id} in waitingPlayers not in matchmakingQueuedPlayers`,
        );
        return false;
      }
    }

    return true;
  }

  next(players: Player[]): void {
    if (this.validate(players)) {
      this.subject.next(players);
    }
  }
}
