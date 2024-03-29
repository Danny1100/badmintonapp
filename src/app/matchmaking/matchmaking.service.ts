import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import {
  Player,
  PlayerSkillLevelDesc,
} from '../player/services/player.service';
import { PlayerListService } from '../player-list/player-list.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { Court } from '../court/court.component';

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

  constructor(
    private playerListService: PlayerListService,
    private courtControllerService: CourtControllerService,
  ) {
    // whenever a new player is added they are automatically added to the waiting player list
    this.addedPlayer$.subscribe((player) => {
      let waitingPlayers = this.waitingPlayers$.getValue();
      waitingPlayers.push(player);
      this.waitingPlayers$.next(waitingPlayers);
    });
    this.playerList$.subscribe((players) => (this.playerList = players));
    this.courtList$.subscribe((courts) => (this.courtList = courts));
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
  }
  matchmake(court: Court, waitingPlayers: Player[]) {
    // use a dictionary to store the number of players in each level
    const skillLevels = Object.keys(PlayerSkillLevelDesc);
    const playerSkillMap = new Map();
    skillLevels.forEach((skillLevelDesc, i) => playerSkillMap.set(i, []));
    waitingPlayers.forEach((player) => {
      // if player is in custom group, ignore
      const customGroupPlayerIds = this.customGroupPlayerIds$.getValue();
      if (customGroupPlayerIds.has(player.id)) return;
      // else, add player to playerSkillMap
      const { skillId } = player;
      const currentList = playerSkillMap.get(skillId);
      playerSkillMap.set(skillId, [...currentList, player]);
    });
    // group similar skill players together in groups of 4 by iterating through the map
    const sortedPlayerQueue: Player[] = [];
    Array.from(playerSkillMap.values()).forEach((playerGroup) =>
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
          courtNumber: court.courtNumber,
          players: courtPlayers,
        });
        courtPlayers = [];
      }
    });
    // add custom groups
    const customGroups = this.customGroups$.getValue();
    customGroups.forEach((group) =>
      waitingGroups.push({
        courtNumber: court.courtNumber,
        players: group.players,
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
    // run matchmaking algorithm to calculate waiting groups
    const waitingPlayers = this.waitingPlayers$.getValue();
    if (waitingPlayers.length < 4) {
      alert('Not enough players to matchmake');
      return;
    }
    this.matchmake(court, waitingPlayers);
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
}
