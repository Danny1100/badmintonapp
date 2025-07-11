import { Component, HostListener } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Player } from '../player/services/player.service';
import { PlayerListService } from './player-list-service/player-list.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerComponent } from '../player/player.component';
import { AsyncPipe } from '@angular/common';
import {
  PlayersSortOption,
  PlayersSortOptionFormObject,
} from '../matchmaking/matchmaking.util';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [PlayerComponent, AsyncPipe],
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.css',
})
export class PlayerListComponent {
  waitingPlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getWaitingPlayers();
  sortedWaitingPlayers: Player[] = [];
  currentlyPlayingPlayers: Player[] = [];
  selectedPlayers: Player[] = [];

  sortPlayerOptions = this.matchmakingService.getSortPlayerOptions();
  selectedPlayerListSortOption$ =
    this.playerListService.getSelectedPlayerListSortOptionStream();

  private ngUnsubscribe$: Subject<boolean> = new Subject();

  constructor(
    private playerListService: PlayerListService,
    private matchmakingService: MatchmakingService,
  ) {
    this.waitingPlayers$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((waitingPlayers) => {
        this.currentlyPlayingPlayers = this.playerListService
          .getPlayers()
          .getValue()
          .filter(
            (player) =>
              !waitingPlayers.find(
                (waitingPlayer) => waitingPlayer.id === player.id,
              ),
          );
      });
    this.selectedPlayerListSortOption$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((sortOption) => {
        const sortOptionValue = sortOption.value;
        let newSortedWaitingPlayers = this.waitingPlayers$.getValue().slice(); // slice to avoid mutating the original array
        if (sortOptionValue === PlayersSortOption.Waiting)
          this.sortedWaitingPlayers = newSortedWaitingPlayers;
        else if (sortOptionValue === PlayersSortOption.Name) {
          this.sortedWaitingPlayers = newSortedWaitingPlayers.sort(
            (player1, player2) => player1.name.localeCompare(player2.name),
          );
        } else if (sortOptionValue === PlayersSortOption.SkillLevel) {
          this.sortedWaitingPlayers = newSortedWaitingPlayers.sort(
            (player1, player2) => {
              if (player1.skillId !== player2.skillId) {
                return player1.skillId - player2.skillId;
              }
              return player1.name.localeCompare(player2.name);
            },
          );
        } else {
          throw new Error(
            'Invalid sortOption when updating nonMatchmadePlayers',
          );
        }
      });
  }

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
  selectSortOption(sortOptionFormObject: PlayersSortOptionFormObject) {
    this.selectedPlayerListSortOption$.next(sortOptionFormObject);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
