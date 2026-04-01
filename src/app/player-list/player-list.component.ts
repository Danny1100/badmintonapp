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
  sortPlayers,
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
  selectedPlayerIds: Set<number> = new Set();

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
      this.selectedPlayerIds.add(player.id);
    } else {
      this.selectedPlayers = this.selectedPlayers.filter(
        (p) => player.id !== p.id,
      );
      this.selectedPlayerIds.delete(player.id);
    }
  }
  clearSelectedPlayers() {
    this.selectedPlayers = [];
    this.selectedPlayerIds = new Set();
  }
  isPlayerSelected(playerId: number): boolean {
    return this.selectedPlayerIds.has(playerId);
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
    return sortPlayers(this.waitingPlayers$.getValue(), sortOptionValue);
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
