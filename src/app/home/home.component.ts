import { Component, HostListener } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerListService } from '../player-list/player-list.service';

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

  constructor(
    private playerListService: PlayerListService,
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.returnValue = false;
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
    this.matchmakingService.matchmake(customCourt, waitingPlayers);

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
    // check players are not already linked
    // add them to set of linked players so they cannot be added again later
    // add them to link group
    // run matchmaking algorithm to update court queue
    this.clearSelectedPlayers();
  }
}
