import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { Player } from '../player/services/player.service';
import { PlayerListService } from '../player-list/player-list-service/player-list.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { Court } from '../court/court.component';
import { LinkedPlayersService } from '../linked-players/linked-players-service/linked-players.service';
import { chunkArray } from './matchmaking.util';

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
  matchmakingQueuedGroups$: BehaviorSubject<Player[][]> = new BehaviorSubject<
    Player[][]
  >([]);

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
    // whenever waiting players list is updated, update matchmaking queue to have the same players
    this.waitingPlayers$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((waitingPlayers) => {
        this.matchmakingQueuedGroups$.next(chunkArray(waitingPlayers, 4));
      });
    this.playerList$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((players) => (this.playerList = players));
    this.courtList$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((courts) => (this.courtList = courts));
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
  // TODO: implement matchmaking
  matchmake(waitingPlayers: Player[], numberOfPlayersToMatchmake: number) {
    // const matchmakingQueuedPlayers = this.matchmakingQueuedPlayers$.getValue();
    // let playersToMatchmake = waitingPlayers;
    // // calculate matchmaking queue on rolling basis
    // if (matchmakingQueuedPlayers.length > 0) {
    //   playersToMatchmake = matchmakingQueuedPlayers.slice(
    //     -numberOfPlayersToMatchmake,
    //   );
    // }
    // // use a dictionary to store the number of players in each level
    // const skillLevels = Object.keys(PlayerSkillLevelDesc);
    // const playerSkillMap: Map<number, Player[]> = new Map<number, Player[]>();
    // skillLevels.forEach((_, i) => playerSkillMap.set(i, []));
    // playersToMatchmake.forEach((player) => {
    //   // if player is linked, ignore
    //   const linkedPlayerIds =
    //     this.linkedPlayersService.linkedPlayerIds$.getValue();
    //   if (linkedPlayerIds.has(player.id)) return;
    //   // else, add player to playerSkillMap
    //   const { skillId } = player;
    //   const currentList = playerSkillMap.get(skillId);
    //   if (!currentList) {
    //     alert(`Error finding player skill level ${skillId}`);
    //     return;
    //   }
    //   playerSkillMap.set(skillId, [...currentList, player]);
    // });
    // // shuffle the order of players in each skill group
    // const playerSkillMapLength = playerSkillMap.size;
    // for (let i = 0; i < playerSkillMapLength; i++) {
    //   const skillGroupPlayers = playerSkillMap.get(i);
    //   if (!skillGroupPlayers) {
    //     alert(`Error finding players with skill level ${i}`);
    //     return;
    //   }
    //   this.shuffleArray(skillGroupPlayers);
    // }
    // // create linked player groups and remove those players from playerSkillMap
    // let playerSkillMapArray: Player[][] = Array.from(playerSkillMap.values());
    // const linkedPlayers = this.linkedPlayersService.linkedPlayers$.getValue();
    // const linkedPlayerGroups = [];
    // for (let i = 0; i < linkedPlayers.length; i++) {
    //   // if any players in the linked group are not in the waiting list, ignore the linked group
    //   const group = linkedPlayers[i];
    //   if (
    //     group.find((player) => !waitingPlayers.find((p) => p.id === player.id))
    //   ) {
    //     continue;
    //   }
    //   const currentGroup = group.map((player) => player);
    //   const playersNeeded = 4 - group.length;
    //   for (let j = 0; j < playersNeeded; j++) {
    //     const targetSkill =
    //       currentGroup.reduce((acc, player) => acc + player.skillId, 0) /
    //       currentGroup.length;
    //     let foundInfo: any = { player: null, skillDiff: Infinity };
    //     playerSkillMapArray.forEach((playerGroup, skillIndex) => {
    //       const skillDiff = Math.abs(skillIndex - targetSkill);
    //       if (skillDiff < foundInfo.skillDiff && playerGroup.length > 0) {
    //         foundInfo = { player: playerGroup[0], skillDiff };
    //       }
    //     });
    //     if (!foundInfo.player) {
    //       alert('Error finding player to link');
    //       return;
    //     }
    //     currentGroup.push(foundInfo.player);
    //     playerSkillMapArray = playerSkillMapArray.map((playerGroup) =>
    //       playerGroup.filter((player) => player.id !== foundInfo.player.id),
    //     );
    //   }
    //   linkedPlayerGroups.push(currentGroup);
    // }
    // // remove people who have waited the least from the skill map array so that it is a multiple of 4 - this is to ensure people who have waited longer will always be put into a group
    // let playerSkillMapArrayLength = 0;
    // playerSkillMapArray.forEach(
    //   (playerGroup) => (playerSkillMapArrayLength += playerGroup.length),
    // );
    // const toRemove = playerSkillMapArrayLength % 4;
    // const removedPlayers: Player[] = [];
    // for (let i = 0; i < toRemove; i++) {
    //   let shortestWaitIndex = -1;
    //   let shortestWaitInfo: {
    //     skillMapIndex: number;
    //     playerGroupIndex: number;
    //   } | null = null;
    //   playerSkillMapArray.forEach((playerGroup, skillMapIndex) => {
    //     playerGroup.forEach((player, playerGroupIndex) => {
    //       const foundIndex = waitingPlayers.findIndex(
    //         (p) => p.id === player.id,
    //       );
    //       if (foundIndex > shortestWaitIndex) {
    //         shortestWaitIndex = foundIndex;
    //         shortestWaitInfo = { skillMapIndex, playerGroupIndex };
    //       }
    //     });
    //   });
    //   if (!shortestWaitInfo) {
    //     alert('Error finding player who has waited the least');
    //     return;
    //   }
    //   const { skillMapIndex, playerGroupIndex } = shortestWaitInfo;
    //   removedPlayers.push(playerSkillMapArray[skillMapIndex][playerGroupIndex]);
    //   playerSkillMapArray[skillMapIndex].splice(playerGroupIndex, 1);
    // }
    // // group similar skill players together in groups of 4 by iterating through the map
    // const sortedPlayerQueue: Player[] = [];
    // playerSkillMapArray.forEach((playerGroup) =>
    //   playerGroup.forEach((player: Player) => sortedPlayerQueue.push(player)),
    // );
    // const waitingGroups: Player[][] = [];
    // let currentGroup: Player[] = [];
    // let count = 0;
    // sortedPlayerQueue.forEach((player) => {
    //   currentGroup.push(player);
    //   count++;
    //   if (count % 4 === 0) {
    //     waitingGroups.push(currentGroup);
    //     currentGroup = [];
    //   }
    // });
    // // add linked player groups
    // linkedPlayerGroups.forEach((group) => waitingGroups.push(group));
    // // whoever is highest in the waiting list in each group will determine how early they are in the group queue
    // const sortedWaitingGroups: Player[][] = [];
    // const visited = new Set();
    // waitingPlayers.forEach((player) => {
    //   if (visited.has(player.id)) return;
    //   let foundIndex = -1;
    //   for (let i = 0; i < waitingGroups.length; i++) {
    //     const group = waitingGroups[i];
    //     for (let j = 0; j < group.length; j++) {
    //       const p = group[j];
    //       if (player.id === p.id) {
    //         foundIndex = i;
    //       }
    //     }
    //   }
    //   if (foundIndex > -1) {
    //     const foundGroup = waitingGroups[foundIndex];
    //     foundGroup.forEach((p) => visited.add(p.id));
    //     sortedWaitingGroups.push(foundGroup);
    //     waitingGroups.splice(foundIndex, 1);
    //   }
    // });
    // // add removed players (those who have waited the least) to the end of the queue
    // sortedWaitingGroups.push(removedPlayers);
    // // generate a final queue of players
    // const matchmadeQueue: Player[] = [];
    // sortedWaitingGroups.forEach((group) => matchmadeQueue.push(...group));
    // // append matchmadeQueue to existing matchmakingQueuedPlayers
    // const n = matchmadeQueue.length;
    // matchmakingQueuedPlayers.splice(-n, n, ...matchmadeQueue);
    // this.matchmakingQueuedPlayers$.next(matchmakingQueuedPlayers);
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
    // add first waiting group to court and remove them from waiting group
    const courts = this.courtList$.getValue();
    const updatedCourts = courts.map((c) => {
      if (c.courtNumber === court.courtNumber) {
        return {
          players: nextGroup,
          courtNumber: court.courtNumber,
        };
      }
      return c;
    });
    this.courtList$.next(updatedCourts);

    // remove the players from the waiting players list
    let waitingPlayers = this.waitingPlayers$.getValue();
    const newWaitingPlayers = waitingPlayers.filter((player) => {
      return !nextGroup.find((p) => p.id === player.id);
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
    // TODO: implement undo court
    // this.courtControllerService.updateCourt({ ...court, players: [] });
    // let waitingPlayers = this.waitingPlayers$.getValue();
    // court.players.forEach((player) => waitingPlayers.unshift(player));
    // this.waitingPlayers$.next(waitingPlayers);
    // const waitingGroups = this.waitingGroups$.getValue();
    // waitingGroups.unshift({
    //   courtNumber: -1,
    //   players: court.players,
    // });
    // this.waitingGroups$.next(waitingGroups);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
