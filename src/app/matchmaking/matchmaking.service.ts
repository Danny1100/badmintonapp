import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject, takeUntil } from 'rxjs';
import {
  Player,
  PlayerSkillLevelDesc,
} from '../player/services/player.service';
import { PlayerListService } from '../player-list/player-list.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { Court } from '../court/court.component';
import { LinkedPlayersService } from '../linked-players/linked-players-service/linked-players.service';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  addedPlayer$: ReplaySubject<Player> =
    this.playerListService.getAddedPlayerStream();
  playerList$: BehaviorSubject<Player[]> = this.playerListService.getPlayers();
  playerList!: Player[];
  waitingPlayers$: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>(
    [],
  );
  courtList$: BehaviorSubject<Court[]> =
    this.courtControllerService.getCourts();
  courtList!: Court[];
  waitingGroups$: BehaviorSubject<Court[]> = new BehaviorSubject<Court[]>([]);
  waitingDuration$: BehaviorSubject<
    Map<number, { player: Player; waitPeriod: number }>
  > = new BehaviorSubject(new Map());
  ngUnsubscribe$: Subject<boolean> = new Subject();

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
    this.playerList$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((players) => (this.playerList = players));
    this.courtList$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((courts) => (this.courtList = courts));
    // check there are no duplicate players in waiting groups
    this.waitingGroups$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((courts) => {
        const waitingGroupPlayers = new Set<number>();
        courts.forEach((court) => {
          court.players.forEach((player) => {
            if (waitingGroupPlayers.has(player.id)) {
              throw new Error('Player is in multiple waiting groups');
            } else {
              waitingGroupPlayers.add(player.id);
            }
          });
        });
      });
  }

  getWaitingPlayers() {
    return this.waitingPlayers$;
  }
  removeWaitingPlayer(playerId: number) {
    let waitingPlayers = this.waitingPlayers$.getValue();
    waitingPlayers = waitingPlayers.filter((player) => player.id !== playerId);
    this.waitingPlayers$.next(waitingPlayers);
    const linkedPlayerIds =
      this.linkedPlayersService.linkedPlayerIds$.getValue();
    if (linkedPlayerIds.has(playerId)) {
      this.linkedPlayersService.removeLinkedPlayerById(playerId);
    }
  }
  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  matchmake(waitingPlayers: Player[]) {
    // use a dictionary to store the number of players in each level
    const skillLevels = Object.keys(PlayerSkillLevelDesc);
    const playerSkillMap = new Map();
    skillLevels.forEach((skillLevelDesc, i) => playerSkillMap.set(i, []));
    waitingPlayers.forEach((player) => {
      // if player is linked, ignore
      const linkedPlayerIds =
        this.linkedPlayersService.linkedPlayerIds$.getValue();
      if (linkedPlayerIds.has(player.id)) return;
      // else, add player to playerSkillMap
      const { skillId } = player;
      const currentList = playerSkillMap.get(skillId);
      playerSkillMap.set(skillId, [...currentList, player]);
    });
    // shuffle the order of players in each skill group
    const playerSkillMapLength = playerSkillMap.size;
    for (let i = 0; i < playerSkillMapLength; i++) {
      const playerGroup = playerSkillMap.get(i);
      this.shuffleArray(playerGroup);
    }
    // create linked player groups and remove those players from playerSkillMap
    let playerSkillMapArray: Player[][] = Array.from(playerSkillMap.values());
    const linkedPlayers = this.linkedPlayersService.linkedPlayers$.getValue();
    const linkedPlayerGroups = [];
    for (let i = 0; i < linkedPlayers.length; i++) {
      // if any players in the linked group are not in the waiting list, ignore the linked group
      const group = linkedPlayers[i];
      if (
        group.find((player) => !waitingPlayers.find((p) => p.id === player.id))
      ) {
        continue;
      }

      const currentGroup = group.map((player) => player);
      const playersNeeded = 4 - group.length;
      for (let j = 0; j < playersNeeded; j++) {
        const targetSkill =
          currentGroup.reduce((acc, player) => acc + player.skillId, 0) /
          currentGroup.length;
        let foundInfo: any = { player: null, skillDiff: Infinity };
        playerSkillMapArray.forEach((playerGroup, skillIndex) => {
          const skillDiff = Math.abs(skillIndex - targetSkill);
          if (skillDiff < foundInfo.skillDiff && playerGroup.length > 0) {
            foundInfo = { player: playerGroup[0], skillDiff };
          }
        });
        if (!foundInfo.player) {
          alert('Error finding player to link');
          return;
        }
        currentGroup.push(foundInfo.player);
        playerSkillMapArray = playerSkillMapArray.map((playerGroup) =>
          playerGroup.filter(
            (player: Player) => player.id !== foundInfo.player.id,
          ),
        );
      }
      linkedPlayerGroups.push(currentGroup);
    }
    // remove people who have waited the least from the skill map array so that it is a multiple of 4 - this is to ensure people who have waited longer will always be put into a group
    let playerSkillMapArrayLength = 0;
    playerSkillMapArray.forEach(
      (playerGroup) => (playerSkillMapArrayLength += playerGroup.length),
    );
    const toRemove = playerSkillMapArrayLength % 4;
    for (let i = 0; i < toRemove; i++) {
      let shortestWaitIndex = -1;
      let shortestWaitInfo: {
        skillMapIndex: number;
        playerGroupIndex: number;
      } | null = null;
      playerSkillMapArray.forEach((playerGroup, skillMapIndex) => {
        playerGroup.forEach((player, playerGroupIndex) => {
          const foundIndex = waitingPlayers.findIndex(
            (p) => p.id === player.id,
          );
          if (foundIndex > shortestWaitIndex) {
            shortestWaitIndex = foundIndex;
            shortestWaitInfo = { skillMapIndex, playerGroupIndex };
          }
        });
      });
      if (!shortestWaitInfo) {
        alert('Error finding player who has waited the least');
        return;
      }
      const { skillMapIndex, playerGroupIndex } = shortestWaitInfo;
      playerSkillMapArray[skillMapIndex].splice(playerGroupIndex, 1);
    }
    // group similar skill players together in groups of 4 by iterating through the map
    const sortedPlayerQueue: Player[] = [];
    playerSkillMapArray.forEach((playerGroup) =>
      playerGroup.forEach((player: Player) => sortedPlayerQueue.push(player)),
    );
    const waitingGroups: Court[] = [];
    let courtPlayers: Player[] = [];
    let count = 0;
    const defaultCourtNumber = -1;
    sortedPlayerQueue.forEach((player) => {
      courtPlayers.push(player);
      count++;
      // note any players that cannot form a group of 4 will not be added to waitingGroups
      if (count % 4 === 0) {
        waitingGroups.push({
          courtNumber: defaultCourtNumber,
          players: courtPlayers,
        });
        courtPlayers = [];
      }
    });
    // add linked player groups
    linkedPlayerGroups.forEach((group) =>
      waitingGroups.push({
        courtNumber: defaultCourtNumber,
        players: group,
      }),
    );
    // whoever is highest in the waiting list in each group will determine how early they are in the group queue
    const sortedWaitingGroups: Court[] = [];
    const visited = new Set();
    waitingPlayers.forEach((player) => {
      if (visited.has(player.id)) return;
      let foundIndex = -1;
      for (let i = 0; i < waitingGroups.length; i++) {
        const group = waitingGroups[i];
        for (let j = 0; j < group.players.length; j++) {
          const p = group.players[j];
          if (player.id === p.id) {
            foundIndex = i;
          }
        }
      }
      if (foundIndex > -1) {
        const foundGroup = waitingGroups[foundIndex];
        foundGroup.players.forEach((p) => visited.add(p.id));
        sortedWaitingGroups.push(foundGroup);
        waitingGroups.splice(foundIndex, 1);
      }
    });
    this.waitingGroups$.next(sortedWaitingGroups);
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

    // if waiting groups length is 0, run matchmaking algorithm to calculate waiting groups
    let waitingPlayers = this.waitingPlayers$.getValue();
    if (this.waitingGroups$.getValue().length === 0) {
      if (waitingPlayers.length < 4) {
        alert('Not enough players to matchmake');
        return;
      }
      this.matchmake(waitingPlayers);
    }
    // get first waiting group
    const waitingGroups = this.waitingGroups$.getValue();
    const nextGroup = waitingGroups.shift();
    if (!nextGroup) {
      alert('Error getting next group: no group on waiting group list');
      return;
    }
    // add first waiting group to court and remove them from waiting group
    const courts = this.courtList$.getValue();
    const updatedCourts = courts.map((c) => {
      if (c.courtNumber === court.courtNumber) {
        return {
          ...nextGroup,
          courtNumber: court.courtNumber,
        };
      }
      return c;
    });
    this.courtList$.next(updatedCourts);
    this.waitingGroups$.next(waitingGroups);

    // remove the players from the waiting players list
    const newWaitingPlayers = waitingPlayers.filter((player) => {
      return !nextGroup.players.find((p) => p.id === player.id);
    });
    this.waitingPlayers$.next(newWaitingPlayers);

    // update waiting duration for each player
    const updatedWaitingPlayers = this.waitingPlayers$.getValue();
    const waitingDuration = this.waitingDuration$.getValue();
    updatedWaitingPlayers.forEach((player) => {
      if (waitingDuration.has(player.id)) {
        const { waitPeriod } = waitingDuration.get(player.id) as {
          player: Player;
          waitPeriod: number;
        };
        waitingDuration.set(player.id, { player, waitPeriod: waitPeriod + 1 });
      } else {
        waitingDuration.set(player.id, { player, waitPeriod: 1 });
      }
    });
    this.waitingDuration$.next(waitingDuration);
  }
  undoCourt(court: Court) {
    this.courtControllerService.updateCourt({ ...court, players: [] });

    let waitingPlayers = this.waitingPlayers$.getValue();
    court.players.forEach((player) => waitingPlayers.unshift(player));
    this.waitingPlayers$.next(waitingPlayers);

    const waitingGroups = this.waitingGroups$.getValue();
    waitingGroups.unshift({
      courtNumber: -1,
      players: court.players,
    });
    this.waitingGroups$.next(waitingGroups);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
