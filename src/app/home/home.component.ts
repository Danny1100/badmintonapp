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
  selectedPlayerIds: number[] = [];

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
  selectPlayer(event: Event, id: number) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    if (isChecked) {
      this.selectedPlayerIds.push(id);
    } else {
      this.selectedPlayerIds = this.selectedPlayerIds.filter(
        (playerId) => playerId !== id,
      );
    }
  }
  clearSelectedPlayers() {
    const elements = document.querySelectorAll('.waiting-player-checkbox');
    elements.forEach((el) => {
      const element = el as HTMLInputElement;
      element.checked = false;
    });
    this.selectedPlayerIds = [];
  }
  addCustomCourt() {
    const length = this.selectedPlayerIds.length;
    if (length !== 4) {
      alert(
        `Invalid number of selected players. Currently selected ${length} players.`,
      );
      return;
    }
    this.clearSelectedPlayers();
  }
}
