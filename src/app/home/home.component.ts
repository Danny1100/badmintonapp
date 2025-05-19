import { Component, HostListener } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Player } from '../player/services/player.service';
import { Court, CourtComponent } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerListService } from '../player-list/player-list.service';
import { LinkedPlayersService } from '../linked-players/linked-players-service/linked-players.service';
import { AddCourtComponent } from '../add-court/add-court.component';
import { PlayerComponent } from '../player/player.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [
        CourtComponent,
        AddCourtComponent,
        PlayerComponent,
        AsyncPipe,
    ],
})
export class HomeComponent {
  waitingPlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getWaitingPlayers();
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();
  matchmakingQueuedGroups$: BehaviorSubject<Player[][]> =
    this.matchmakingService.matchmakingQueuedGroups$;
  selectedPlayers: Player[] = [];

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
  linkPlayers() {
    // TODO: implement linking players and move this to matchmaking service
    // const length = this.selectedPlayers.length;
    // if (length < 2 || length > 4) {
    //   alert(
    //     `Invalid number of selected players. Currently selected ${length} players.`,
    //   );
    //   return;
    // }
    // // check players are not already linked.
    // const linkedPlayerIds =
    //   this.linkedPlayersService.linkedPlayerIds$.getValue();
    // for (let i = 0; i < this.selectedPlayers.length; i++) {
    //   const playerId = this.selectedPlayers[i].id;
    //   if (linkedPlayerIds.has(playerId)) {
    //     alert(`Invalid group: player with id ${playerId} is already linked.`);
    //     return;
    //   }
    // }
    // // add them to set of linked players so they cannot be added again later
    // this.selectedPlayers.forEach((player) => linkedPlayerIds.add(player.id));
    // this.linkedPlayersService.linkedPlayerIds$.next(linkedPlayerIds);
    // // add them to link group
    // const linkedPlayers = this.linkedPlayersService.linkedPlayers$.getValue();
    // linkedPlayers.push(this.selectedPlayers);
    // this.linkedPlayersService.linkedPlayers$.next(linkedPlayers);
    // // run matchmaking algorithm to update court queue
    // const waitingPlayers = this.matchmakingService.waitingPlayers$.getValue();
    // this.matchmakingService.matchmake(waitingPlayers, waitingPlayers.length);
    // this.clearSelectedPlayers();
  }
}
