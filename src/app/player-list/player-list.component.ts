import { Component, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
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
    combineLatest([this.selectedPlayerListSortOption$, this.waitingPlayers$])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        const sortOption = this.selectedPlayerListSortOption$.getValue();
        this.sortedWaitingPlayers = this.getNewSortedWaitingPlayers(
          sortOption.value,
        );
      });
  }

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.preventDefault();
  }
  removePlayer(playerId: number) {
    this.selectedPlayers = this.selectedPlayers.filter(
      (p) => p.id !== playerId,
    );
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
    this.matchmakingService.linkPlayers(this.selectedPlayers);
    this.clearSelectedPlayers();
  }
  selectSortOption(sortOptionFormObject: PlayersSortOptionFormObject) {
    this.clearSelectedPlayers();
    this.selectedPlayerListSortOption$.next(sortOptionFormObject);
  }
  getNewSortedWaitingPlayers(sortOptionValue: PlayersSortOption) {
    let newSortedWaitingPlayers = this.waitingPlayers$.getValue().slice(); // slice to avoid mutating the original array
    if (sortOptionValue === PlayersSortOption.Waiting)
      return newSortedWaitingPlayers;
    else if (sortOptionValue === PlayersSortOption.Name) {
      return newSortedWaitingPlayers.sort((player1, player2) =>
        player1.name.localeCompare(player2.name),
      );
    } else if (sortOptionValue === PlayersSortOption.SkillLevel) {
      return newSortedWaitingPlayers.sort((player1, player2) => {
        if (player1.skillId !== player2.skillId) {
          return player1.skillId - player2.skillId;
        }
        return player1.name.localeCompare(player2.name);
      });
    } else {
      throw new Error('Invalid sortOption when updating nonMatchmadePlayers');
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
