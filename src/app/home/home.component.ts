import { Component, HostListener } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerListService } from '../player-list/player-list.service';
import { LinkedPlayersService } from '../linked-players/linked-players-service/linked-players.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  waitingPlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getWaitingPlayers();
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();
  waitingGroups$: BehaviorSubject<Court[]> =
    this.matchmakingService.waitingGroups$;
  selectedPlayers: Player[] = [];

  // for testing
  customGroups$ = this.matchmakingService.customGroups$;
  linkedPlayers$ = this.linkedPlayersService.linkedPlayers$;

  constructor(
    private playerListService: PlayerListService,
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
    private linkedPlayersService: LinkedPlayersService,
  ) {}

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.preventDefault();
  }

  removePlayer(playerId: number) {
    this.playerListService.removePlayer(playerId);
    this.matchmakingService.removeWaitingPlayer(playerId);
  }
  selectPlayer(event: Event, player: Player) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    if (isChecked) {
      this.selectedPlayers.push(player);
    } else {
      this.selectedPlayers = this.selectedPlayers.filter(
        (p) => player.id !== p.id,
      );
    }
  }
  clearSelectedPlayers() {
    const elements = document.querySelectorAll('.waiting-player-checkbox');
    elements.forEach((el) => {
      const element = el as HTMLInputElement;
      element.checked = false;
    });
    this.selectedPlayers = [];
  }
  addCustomCourt() {
    const length = this.selectedPlayers.length;
    if (length !== 4) {
      alert(
        `Invalid number of selected players. Currently selected ${length} players.`,
      );
      return;
    }
    // check selected players are not already in a custom group
    const customGroupPlayerIds =
      this.matchmakingService.customGroupPlayerIds$.getValue();
    for (let i = 0; i < this.selectedPlayers.length; i++) {
      const playerId = this.selectedPlayers[i].id;
      if (customGroupPlayerIds.has(playerId)) {
        alert(
          `Invalid group: player with id ${playerId} is already in a custom group.`,
        );
        return;
      }
    }
    // check each linked group to make sure if any selected players are linked, all selected players are in the same linked group
    const linkedPlayerIds =
      this.linkedPlayersService.linkedPlayerIds$.getValue();
    if (this.selectedPlayers.find((player) => linkedPlayerIds.has(player.id))) {
      const linkedPlayerGroups =
        this.linkedPlayersService.linkedPlayers$.getValue();
      const selectedPlayerIds = new Set<number>();
      this.selectedPlayers.forEach((player) =>
        selectedPlayerIds.add(player.id),
      );
      const foundLinkedPlayerIds = new Set<number>();
      linkedPlayerGroups.forEach((group) => {
        group.forEach((player) => {
          if (selectedPlayerIds.has(player.id)) {
            group.forEach((p) => foundLinkedPlayerIds.add(p.id));
          }
        });
      });
      let valid = true;
      if (foundLinkedPlayerIds.size > selectedPlayerIds.size) {
        valid = false;
      }
      foundLinkedPlayerIds.forEach((id) => {
        if (!selectedPlayerIds.has(id)) {
          valid = false;
        }
      });
      if (!valid) {
        alert(
          'Invalid group: not all selected players are in linked groups that are compatible',
        );
        return;
      }
    }
    // add selected players ids to customGroupPlayerIds to ensure they cannot be added again later
    this.selectedPlayers.forEach((player) =>
      customGroupPlayerIds.add(player.id),
    );
    this.matchmakingService.customGroupPlayerIds$.next(customGroupPlayerIds);
    // add selected players to custom group
    const customGroups = this.matchmakingService.customGroups$.getValue();
    const customCourt = { courtNumber: -1, players: this.selectedPlayers };
    customGroups.push(customCourt);
    this.matchmakingService.customGroups$.next(customGroups);
    // run matchmaking algorithm to update court queue
    const waitingPlayers = this.waitingPlayers$.getValue();
    this.matchmakingService.matchmake(waitingPlayers);

    this.clearSelectedPlayers();
  }
  linkPlayers() {
    const length = this.selectedPlayers.length;
    if (length < 2 || length > 4) {
      alert(
        `Invalid number of selected players. Currently selected ${length} players.`,
      );
      return;
    }
    // check players are not already linked.
    const linkedPlayerIds =
      this.linkedPlayersService.linkedPlayerIds$.getValue();
    for (let i = 0; i < this.selectedPlayers.length; i++) {
      const playerId = this.selectedPlayers[i].id;
      if (linkedPlayerIds.has(playerId)) {
        alert(`Invalid group: player with id ${playerId} is already linked.`);
        return;
      }
    }
    // Check if first player is in a custom group. If so, all players to be linked must be in the same custom group
    const customGroupPlayerIds =
      this.matchmakingService.customGroupPlayerIds$.getValue();
    const customGroups = this.matchmakingService.customGroups$.getValue();
    const firstPlayerId = this.selectedPlayers[0].id;
    if (customGroupPlayerIds.has(firstPlayerId)) {
      const foundGroup = customGroups.find((group) =>
        group.players.find((player) => player.id === firstPlayerId),
      );
      if (!foundGroup) {
        alert(
          `Could not find custom group containing player with id ${firstPlayerId}`,
        );
        return;
      }
      let invalid = false;
      this.selectedPlayers.forEach((player) => {
        if (!foundGroup.players.find((p) => p.id === player.id)) {
          alert('Not all players to be linked are in the same custom group');
          invalid = true;
        }
      });
      if (invalid) return;
    }
    // add them to set of linked players so they cannot be added again later
    this.selectedPlayers.forEach((player) => linkedPlayerIds.add(player.id));
    this.linkedPlayersService.linkedPlayerIds$.next(linkedPlayerIds);
    // add them to link group
    const linkedPlayers = this.linkedPlayersService.linkedPlayers$.getValue();
    linkedPlayers.push(this.selectedPlayers);
    this.linkedPlayersService.linkedPlayers$.next(linkedPlayers);
    // run matchmaking algorithm to update court queue
    const waitingPlayers = this.matchmakingService.waitingPlayers$.getValue();
    this.matchmakingService.matchmake(waitingPlayers);

    this.clearSelectedPlayers();
  }
}
