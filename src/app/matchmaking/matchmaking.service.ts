import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { Player } from '../player/services/player.service';
import { PlayerListService } from '../player-list/player-list-service/player-list.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { Court } from '../court/court.component';
import { LinkedPlayersService } from '../linked-players/linked-players-service/linked-players.service';
import {
  getNewGroup,
  MatchmakingGroup,
  PlayersSortOption,
  PlayersSortOptionFormObject,
} from './matchmaking.util';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  private addedPlayer$: ReplaySubject<Player> =
    this.playerListService.getAddedPlayerStream();
  private waitingPlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<
    Player[]
  >([]); // all players who are not on a court
  private courtList$: BehaviorSubject<Court[]> =
    this.courtControllerService.getCourts();

  private unarrivedPlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<
    Player[]
  >([]); // players who have not arrived yet
  private matchmakingQueuedGroups$: BehaviorSubject<MatchmakingGroup[]> =
    new BehaviorSubject<MatchmakingGroup[]>([]); // waiting players who are in a matchmade group
  private nonMatchmadePlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<
    Player[]
  >([]); // waiting players who are not in a matchmade group
  private sortPlayerOptions: PlayersSortOptionFormObject[] = [
    { label: 'Skill Level', value: PlayersSortOption.SkillLevel },
    { label: 'Name', value: PlayersSortOption.Name },
    { label: 'Wait Time', value: PlayersSortOption.Waiting },
  ];
  private selectedNonMatchmadePlayersSortOption$ =
    new BehaviorSubject<PlayersSortOptionFormObject>(this.sortPlayerOptions[0]);

  private waitingDuration$: BehaviorSubject<
    Map<number, { player: Player; waitPeriod: number }>
  > = new BehaviorSubject(new Map());
  private ngUnsubscribe$: Subject<boolean> = new Subject();

  constructor(
    private playerListService: PlayerListService,
    private courtControllerService: CourtControllerService,
    private linkedPlayersService: LinkedPlayersService,
  ) {
    // whenever a new player is added they are automatically added to the waiting player list
    this.addedPlayer$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((player) => {
        let waitingPlayers = this.waitingPlayers$.getValue();
        waitingPlayers.push(player);
        this.waitingPlayers$.next(waitingPlayers);
      });
    // whenever waiting players list is updated, update nonMatchmadePlayers$, matchmakingQueuedGroups$ and unarrivedPlayers$ accordingly
    this.waitingPlayers$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((waitingPlayers) => {
        const matchmakingQueuedGroups =
          this.matchmakingQueuedGroups$.getValue();

        const newMatchmakingQueuedGroups =
          this.getUpdatedMatchmakingQueuedGroups(
            matchmakingQueuedGroups,
            waitingPlayers,
          );
        const newNonMatchmadePlayers = this.getUpdatedNonMatchmadePlayers(
          matchmakingQueuedGroups,
          waitingPlayers,
          this.selectedNonMatchmadePlayersSortOption$.getValue().value,
        );

        const newUnarrivedPlayers = this.getUpdatedUnarrivedPlayers(
          waitingPlayers,
          newMatchmakingQueuedGroups,
          newNonMatchmadePlayers,
        );

        this.matchmakingQueuedGroups$.next(newMatchmakingQueuedGroups);
        this.nonMatchmadePlayers$.next(newNonMatchmadePlayers);
        this.unarrivedPlayers$.next(newUnarrivedPlayers);
      });
    // whenever selected player sort option is changed, sort update the non-matchmade player list
    this.selectedNonMatchmadePlayersSortOption$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((selectedSortOption) => {
        const newNonMatchmadePlayers = this.getUpdatedNonMatchmadePlayers(
          this.matchmakingQueuedGroups$.getValue(),
          this.waitingPlayers$.getValue(),
          selectedSortOption.value,
        );
        this.nonMatchmadePlayers$.next(newNonMatchmadePlayers);
      });
  }

  getWaitingPlayers() {
    return this.waitingPlayers$;
  }
  getMatchmakingQueuedGroups() {
    return this.matchmakingQueuedGroups$;
  }
  getNonMatchmadePlayers() {
    return this.nonMatchmadePlayers$;
  }
  getUnarrivedPlayers() {
    return this.unarrivedPlayers$;
  }
  getWaitingDuration() {
    return this.waitingDuration$;
  }
  getSelectedNonMatchmadePlayersSortOptionStream() {
    return this.selectedNonMatchmadePlayersSortOption$;
  }
  getSortPlayerOptions() {
    return this.sortPlayerOptions;
  }
  getUpdatedMatchmakingQueuedGroups(
    matchmakingQueuedGroups: MatchmakingGroup[],
    waitingPlayers: Player[],
  ): MatchmakingGroup[] {
    const newMatchmakingQueuedGroups: MatchmakingGroup[] = [];

    // for each player in matchmakingQueuedGroups, if they are in waitingPlayers, they are added to newMatchmakingQueuedGroups. This accounts for players removed from waitingPlayers
    matchmakingQueuedGroups
      .filter((group) => group.players.length > 0)
      .forEach((group) => {
        const newGroup = getNewGroup();
        group.players.forEach((player) => {
          const isInWaitingPlayers = waitingPlayers.some(
            (p) => p.id === player.id,
          );
          if (isInWaitingPlayers) {
            newGroup.players.push(player);
          }
        });
        if (newGroup.players.length > 0) {
          newMatchmakingQueuedGroups.push(newGroup);
        }
      });

    newMatchmakingQueuedGroups.push(getNewGroup()); // add an empty group to the end of the queue to allow players to be added to a new group

    return newMatchmakingQueuedGroups;
  }
  getUpdatedNonMatchmadePlayers(
    matchmakingQueuedGroups: MatchmakingGroup[],
    waitingPlayers: Player[],
    sortOption: PlayersSortOption,
  ): Player[] {
    let newNonMatchmadePlayers: Player[] = [];

    // any waiting player that is not in matchmakingQueuedGroups is added to newNonMatchmadePlayers. This accounts for player added and removed from waitingPlayers
    waitingPlayers.forEach((player) => {
      const isInMatchmakingQueue = matchmakingQueuedGroups.some((group) =>
        group.players.some((p) => p.id === player.id),
      );
      if (!isInMatchmakingQueue && player.arrived) {
        newNonMatchmadePlayers.push(player);
      }
    });

    if (sortOption === PlayersSortOption.Waiting) return newNonMatchmadePlayers;
    else if (sortOption === PlayersSortOption.Name) {
      newNonMatchmadePlayers = newNonMatchmadePlayers.sort((player1, player2) =>
        player1.name.localeCompare(player2.name),
      );
    } else if (sortOption === PlayersSortOption.SkillLevel) {
      newNonMatchmadePlayers = newNonMatchmadePlayers.sort(
        (player1, player2) => {
          if (player1.skillId !== player2.skillId) {
            return player1.skillId - player2.skillId;
          }
          return player1.name.localeCompare(player2.name);
        },
      );
    } else {
      throw new Error('Invalid sortOption when updating nonMatchmadePlayers');
    }

    return newNonMatchmadePlayers;
  }
  getUpdatedUnarrivedPlayers(
    waitingPlayers: Player[],
    matchmakingQueuedGroups: MatchmakingGroup[],
    nonMatchmadePlayers: Player[],
  ): Player[] {
    let newUnarrivedPlayers = waitingPlayers.filter(
      (player) => !player.arrived,
    );
    newUnarrivedPlayers.forEach((player) => {
      const isInMatchmakingQueue = matchmakingQueuedGroups.some((group) =>
        group.players.some((p) => p.id === player.id),
      );
      const isInNonMatchmadePlayers = nonMatchmadePlayers.some(
        (p) => p.id === player.id,
      );
      if (isInMatchmakingQueue || isInNonMatchmadePlayers) {
        throw new Error(
          `Player ${player.name} (id: ${player.id}) is in matchmaking queue or non-matchmade players list but is marked as not arrived.`,
        );
      }
    });
    newUnarrivedPlayers = newUnarrivedPlayers.sort((player1, player2) => {
      if (player1.skillId !== player2.skillId) {
        return player1.skillId - player2.skillId;
      }
      return player1.name.localeCompare(player2.name);
    });
    return newUnarrivedPlayers;
  }
  moveNonMatchmadePlayerToMatchmakingQueue(player: Player) {
    const matchmakingQueuedGroups = this.matchmakingQueuedGroups$.getValue();
    for (let i = 0; i < matchmakingQueuedGroups.length; i++) {
      const group = matchmakingQueuedGroups[i];
      if (group.players.length < 4) {
        // add player to the first group with less than 4 players
        group.players.push(player);
        this.matchmakingQueuedGroups$.next(matchmakingQueuedGroups);
        const newMatchmakingQueuedGroups =
          this.getUpdatedMatchmakingQueuedGroups(
            matchmakingQueuedGroups,
            this.waitingPlayers$.getValue(),
          );
        this.matchmakingQueuedGroups$.next(newMatchmakingQueuedGroups);

        // remove player from nonMatchmadePlayers$
        let nonMatchmadePlayers = this.nonMatchmadePlayers$.getValue();
        nonMatchmadePlayers = nonMatchmadePlayers.filter(
          (p) => p.id !== player.id,
        );
        this.nonMatchmadePlayers$.next(nonMatchmadePlayers);
        return;
      }
    }
    throw new Error(
      'Error moving non-matchmade player to matchmaking queue: no group with less than 4 players found',
    );
  }
  moveMatchmakingQueuedPlayerToNonMatchmadeList(player: Player) {
    const matchmakingQueuedGroups = this.matchmakingQueuedGroups$.getValue();
    for (let i = 0; i < matchmakingQueuedGroups.length; i++) {
      const group = matchmakingQueuedGroups[i];
      const playerIndex = group.players.findIndex((p) => p.id === player.id);
      if (playerIndex !== -1) {
        // remove player from the group
        group.players.splice(playerIndex, 1);
        const newMatchmakingQueuedGroups =
          this.getUpdatedMatchmakingQueuedGroups(
            matchmakingQueuedGroups,
            this.waitingPlayers$.getValue(),
          );
        this.matchmakingQueuedGroups$.next(newMatchmakingQueuedGroups);

        // add player to nonMatchmadePlayers$
        const newNonMatchmadePlayers = this.getUpdatedNonMatchmadePlayers(
          this.matchmakingQueuedGroups$.getValue(),
          this.waitingPlayers$.getValue(),
          this.selectedNonMatchmadePlayersSortOption$.getValue().value,
        );
        this.nonMatchmadePlayers$.next(newNonMatchmadePlayers);
        return;
      }
    }
    throw new Error(
      'Error moving matchmaking queued player to non-matchmade list: player not found in any group',
    );
  }
  setPlayerArrived(player: Player) {
    const waitingPlayers = this.waitingPlayers$.getValue();
    const index = waitingPlayers.findIndex((p) => p.id === player.id);
    if (index === -1) {
      alert(
        `Error trying to set player to arrived. Player with id ${player.id} not found in waiting players list.`,
      );
      return;
    }
    waitingPlayers[index] = { ...player, arrived: true };
    this.waitingPlayers$.next(waitingPlayers);
  }
  removeWaitingPlayer(playerId: number) {
    let waitingPlayers = this.waitingPlayers$.getValue();
    waitingPlayers = waitingPlayers.filter((player) => player.id !== playerId);
    this.waitingPlayers$.next(waitingPlayers);
    const linkedPlayerIds = this.linkedPlayersService
      .getLinkedPlayerIds()
      .getValue();
    if (linkedPlayerIds.has(playerId)) {
      this.linkedPlayersService.removeLinkedPlayerById(playerId);
    }
  }
  cycleCourt(court: Court) {
    // if there are players on the court, move them all to the bottom of the waiting players list and update the court list
    if (court.players.length > 0) {
      let waitingPlayers = this.waitingPlayers$.getValue();
      court.players.forEach((player) => waitingPlayers.push(player));
      this.waitingPlayers$.next(waitingPlayers);
      this.courtControllerService.updateCourt({ ...court, players: [] });
      return;
    }
    // get first waiting group
    const matchmakingQueuedGroups = this.matchmakingQueuedGroups$.getValue();
    const nextGroup = matchmakingQueuedGroups[0];
    if (!nextGroup) {
      alert('Error getting next group: no group on waiting group list');
      return;
    }
    if (nextGroup.players.length !== 4) {
      alert('Error getting next group: group needs 4 people');
      return;
    }
    // add first waiting group to court and remove them from waiting group
    const courts = this.courtList$.getValue();
    const updatedCourts = courts.map((c) => {
      if (c.courtNumber === court.courtNumber) {
        return {
          players: nextGroup.players,
          courtNumber: court.courtNumber,
        };
      }
      return c;
    });
    this.courtList$.next(updatedCourts);
    // remove the players from the waiting players list
    let waitingPlayers = this.waitingPlayers$.getValue();
    const newWaitingPlayers = waitingPlayers.filter((player) => {
      return !nextGroup.players.find((p) => p.id === player.id);
    });
    this.waitingPlayers$.next(newWaitingPlayers);
  }
  linkPlayers(players: Player[]) {
    const length = players.length;
    if (length < 2 || length > 4) {
      alert(
        `Invalid number of selected players. Currently selected ${length} players.`,
      );
      return;
    }
    // check players are not already linked.
    const linkedPlayerIds = this.linkedPlayersService
      .getLinkedPlayerIds()
      .getValue();
    for (let i = 0; i < players.length; i++) {
      const playerId = players[i].id;
      if (linkedPlayerIds.has(playerId)) {
        const playerName = players[i].name;
        alert(
          `Invalid group: ${playerName} (id: ${playerId}) is already linked.`,
        );
        return;
      }
    }
    // add them to set of linked players so they cannot be added again later
    players.forEach((player) => linkedPlayerIds.add(player.id));
    this.linkedPlayersService.getLinkedPlayerIds().next(linkedPlayerIds);
    // add them to link group
    const linkedPlayers = this.linkedPlayersService
      .getLinkedPlayers()
      .getValue();
    linkedPlayers.push(players);
    this.linkedPlayersService.getLinkedPlayers().next(linkedPlayers);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
