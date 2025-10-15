import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court, CourtComponent } from '../court/court.component';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { AddCourtComponent } from '../add-court/add-court.component';
import { PlayerComponent } from '../player/player.component';
import { AsyncPipe } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  MatchmakingGroup,
  PlayersSortOptionFormObject,
} from '../matchmaking/matchmaking.util';

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
    DragDropModule,
  ],
})
export class HomeComponent {
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();
  matchmakingQueuedGroups$: BehaviorSubject<MatchmakingGroup[]> =
    this.matchmakingService.getMatchmakingQueuedGroups();
  nonMatchmadePlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getNonMatchmadePlayers();
  unarrivedPlayers$: BehaviorSubject<Player[]> =
    this.matchmakingService.getUnarrivedPlayers();

  filterTerm = new BehaviorSubject<string>('');
  filteredNonMatchmadePlayers: Player[] = [];
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  sortPlayerOptions = this.matchmakingService.getSortPlayerOptions();
  selectedNonMatchmadePlayersSortOption$ =
    this.matchmakingService.getSelectedNonMatchmadePlayersSortOptionStream();

  connectedPlayerDropLists: string[] = [];

  private ngUnsubscribe$: Subject<boolean> = new Subject();

  constructor(
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.preventDefault();
  }

  dropPlayer(event: CdkDragDrop<Player[]>) {
    if (event === null || event.previousContainer === event.container) return;

    // ensures max number of players in a matchmadeGroup is 4
    const targetElement: HTMLElement = event.container.element.nativeElement;
    if (
      targetElement.className.includes('waiting-group-players-container') &&
      event.container.data.length >= 4
    )
      return;

    transferArrayItem(
      event.previousContainer.data ?? [],
      event.container.data ?? [],
      event.previousIndex,
      event.currentIndex,
    );
    const newMatchmakingQueuedGroups =
      this.matchmakingService.getUpdatedMatchmakingQueuedGroups(
        this.matchmakingQueuedGroups$.getValue(),
        this.matchmakingService.getWaitingPlayers().getValue(),
      );
    this.matchmakingQueuedGroups$.next(newMatchmakingQueuedGroups);

    const newNonMatchmadePlayers =
      this.matchmakingService.getUpdatedNonMatchmadePlayers(
        this.matchmakingQueuedGroups$.getValue(),
        this.matchmakingService.getWaitingPlayers().getValue(),
        this.selectedNonMatchmadePlayersSortOption$.getValue().value,
      );
    this.nonMatchmadePlayers$.next(newNonMatchmadePlayers);
  }
  dropGroup(event: CdkDragDrop<MatchmakingGroup[]>) {
    const groups = this.matchmakingQueuedGroups$.getValue();
    moveItemInArray(groups, event.previousIndex, event.currentIndex);
    this.matchmakingQueuedGroups$.next(groups);
  }
  dropCourt(event: CdkDragDrop<Court[]>) {
    const courts = this.courts$.getValue();
    moveItemInArray(courts, event.previousIndex, event.currentIndex);
    this.courts$.next(courts);
  }
  moveNonMatchmadePlayerToMatchmakingQueue(player: Player) {
    this.matchmakingService.moveNonMatchmadePlayerToMatchmakingQueue(player);
  }
  moveMatchmakingQueuedPlayerToNonMatchmadeList(player: Player) {
    this.matchmakingService.moveMatchmakingQueuedPlayerToNonMatchmadeList(
      player,
    );
  }
  setPlayerArrived(player: Player) {
    this.matchmakingService.setPlayerArrived(player);
  }
  selectSortOption(sortOptionFormObject: PlayersSortOptionFormObject) {
    this.selectedNonMatchmadePlayersSortOption$.next(sortOptionFormObject);
  }
  onSearch(value: string) {
    this.filterTerm.next(value);
  }
  getFilteredNonMatchmadePlayers(
    filterTerm: string,
    nonMatchmadePlayers: Player[],
  ): Player[] {
    if (!filterTerm) return nonMatchmadePlayers;
    const lowerCaseFilterTerm = filterTerm.toLowerCase();
    return nonMatchmadePlayers.filter((player) =>
      player.name
        .toLowerCase()
        .split(' ')
        .some((word) => word.startsWith(lowerCaseFilterTerm)),
    );
  }

  ngOnInit() {
    this.matchmakingQueuedGroups$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((groups) => {
        this.connectedPlayerDropLists = [
          ...(groups?.map((group) => group.id) ?? []),
          'nonMatchmadePlayersList',
        ];
      });
    this.nonMatchmadePlayers$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        // Reset filter term when players change
        this.filterTerm.next('');
        if (this.searchInput) {
          this.searchInput.nativeElement.value = '';
        }
      });
    this.filterTerm
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((filterTerm) => {
        this.filteredNonMatchmadePlayers = this.getFilteredNonMatchmadePlayers(
          filterTerm,
          this.nonMatchmadePlayers$.getValue(),
        );
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }
}
