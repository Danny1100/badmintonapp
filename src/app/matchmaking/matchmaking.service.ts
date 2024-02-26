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
  customGroups$: BehaviorSubject<Court[]> = new BehaviorSubject<Court[]>([]);
  customGroupPlayerIds$: BehaviorSubject<Set<number>> = new BehaviorSubject<
    Set<number>
  >(new Set([]));
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
  }

  getWaitingPlayers() {
    return this.waitingPlayers$;
  }
  removeCustomGroup(court: Court) {
    const customGroupPlayerIds = this.customGroupPlayerIds$.getValue();
    court.players.forEach((player) => {
      if (customGroupPlayerIds.has(player.id)) {
        customGroupPlayerIds.delete(player.id);
      }
    });
    this.customGroupPlayerIds$.next(customGroupPlayerIds);
    const customGroups = this.customGroups$.getValue();
    const updatedCustomGroups = customGroups.filter(
      (group) =>
        !group.players.find((player) => player.id === court.players[0].id),
    );
    this.customGroups$.next(updatedCustomGroups);
  }
  removeWaitingPlayer(playerId: number) {
    let waitingPlayers = this.waitingPlayers$.getValue();
    waitingPlayers = waitingPlayers.filter((player) => player.id !== playerId);
    this.waitingPlayers$.next(waitingPlayers);
    const customGroupPlayerIds = this.customGroupPlayerIds$.getValue();
    if (customGroupPlayerIds.has(playerId)) {
      const customCourts = this.customGroups$.getValue();
      const foundCourt = customCourts.find((court) =>
        court.players.find((player) => player.id === playerId),
      );
      if (!foundCourt) {
        alert(
          'Error removing player from custom group: could not find custom group player belongs to',
        );
        return;
      }
      this.removeCustomGroup(foundCourt);
    }
    const linkedPlayerIds =
      this.linkedPlayersService.linkedPlayerIds$.getValue();
    if (linkedPlayerIds.has(playerId)) {
      this.linkedPlayersService.removeLinkedPlayerById(playerId);
    }
  }
  matchmake(waitingPlayers: Player[], courtNumber: number = -1) {
    // use a dictionary to store the number of players in each level
    const skillLevels = Object.keys(PlayerSkillLevelDesc);
    const playerSkillMap = new Map();
    skillLevels.forEach((skillLevelDesc, i) => playerSkillMap.set(i, []));
    waitingPlayers.forEach((player) => {
      // if player is in custom group, ignore
      const customGroupPlayerIds = this.customGroupPlayerIds$.getValue();
      if (customGroupPlayerIds.has(player.id)) return;
      // if player is linked, ignore
      const linkedPlayerIds =
        this.linkedPlayersService.linkedPlayerIds$.getValue();
      if (linkedPlayerIds.has(player.id)) return;
      // else, add player to playerSkillMap
      const { skillId } = player;
      const currentList = playerSkillMap.get(skillId);
      playerSkillMap.set(skillId, [...currentList, player]);
    });
    // create linked player groups and remove those players from playerSkillMap
    let playerSkillMapArray = Array.from(playerSkillMap.values());
    const linkedPlayers = this.linkedPlayersService.linkedPlayers$.getValue();
    const linkedPlayerGroups = [];
    for (let i = 0; i < linkedPlayers.length; i++) {
      // if any players in the linked group are in a custom group, ignore the linked group
      const group = linkedPlayers[i];
      const customGroupPlayerIds = this.customGroupPlayerIds$.getValue();
      if (group.find((player) => customGroupPlayerIds.has(player.id))) {
        continue;
      }
      // if any players in the linked group are not in the waiting list, ignore the linked group
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
    // group similar skill players together in groups of 4 by iterating through the map
    const sortedPlayerQueue: Player[] = [];
    playerSkillMapArray.forEach((playerGroup) =>
      playerGroup.forEach((player: Player) => sortedPlayerQueue.push(player)),
    );
    const waitingGroups: Court[] = [];
    let courtPlayers: Player[] = [];
    let count = 0;
    sortedPlayerQueue.forEach((player) => {
      courtPlayers.push(player);
      count++;
      // note any players that cannot form a group of 4 will not be added to waitingGroups
      if (count % 4 === 0) {
        waitingGroups.push({
          courtNumber,
          players: courtPlayers,
        });
        courtPlayers = [];
      }
    });
    // add custom groups
    const customGroups = this.customGroups$.getValue();
    customGroups.forEach((group) =>
      waitingGroups.push({
        courtNumber,
        players: group.players,
      }),
    );
    // add linked player groups
    linkedPlayerGroups.forEach((group) =>
      waitingGroups.push({
        courtNumber,
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
    let removedPlayersFromCourt = false;
    // if there are players on the court, move them all to the bottom of the waiting players list and update the court list
    if (court.players.length > 0) {
      let waitingPlayers = this.waitingPlayers$.getValue();
      court.players.forEach((player) => waitingPlayers.push(player));
      this.waitingPlayers$.next(waitingPlayers);

      this.courtControllerService.updateCourt({ ...court, players: [] });
      removedPlayersFromCourt = true;
    }
    // run matchmaking algorithm to calculate waiting groups
    const waitingPlayers = this.waitingPlayers$.getValue();
    if (waitingPlayers.length < 4) {
      alert('Not enough players to matchmake');
      return;
    }
    this.matchmake(waitingPlayers, court.courtNumber);
    if (removedPlayersFromCourt) return;
    // get first waiting group
    const waitingGroups = this.waitingGroups$.getValue();
    const nextGroup = waitingGroups.shift();
    if (!nextGroup) {
      alert('Error getting next group: no group on waiting group list');
      return;
    }
    // if first waiting group is a custom group, remove them from customGroups and customGroupPlayerIds
    this.removeCustomGroup(nextGroup);
    // add first waiting group to court and remove them from waiting group
    const courts = this.courtList$.getValue();
    const updatedCourts = courts.map((c) => {
      if (c.courtNumber === court.courtNumber) {
        return nextGroup;
      }
      return c;
    });
    this.courtList$.next(updatedCourts);
    this.waitingGroups$.next(waitingGroups);

    // remove the players from the waiting players list
    const updatedWaitingPlayers = waitingPlayers.filter((player) => {
      return !nextGroup.players.find((p) => p.id === player.id);
    });
    this.waitingPlayers$.next(updatedWaitingPlayers);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
