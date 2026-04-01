import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Player } from '../player/services/player.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerComponent } from '../player/player.component';

export interface Court {
  courtNumber: number;
  players: Player[];
}

@Component({
  selector: 'app-court',
  templateUrl: './court.component.html',
  styleUrls: ['./court.component.css'],
  standalone: true,
  imports: [PlayerComponent],
})
export class CourtComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) courtNumber!: number;
  @Input({ required: true }) players!: Player[];
  @Input() showButtons = true;
  disableNextCourtButton = true;

  elapsedSeconds = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  get stopwatchDisplay(): string {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = this.elapsedSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['players']) {
      const players: Player[] = changes['players'].currentValue;
      if (players.length > 0 && !this.timerInterval) {
        this.startTimer();
      } else if (players.length === 0) {
        this.resetTimer();
      }
    }
  }

  private startTimer() {
    this.elapsedSeconds = 0;
    this.timerInterval = setInterval(() => this.elapsedSeconds++, 1000);
  }

  private resetTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.elapsedSeconds = 0;
  }

  ngOnDestroy() {
    this.resetTimer();
  }

  cycleCourt() {
    if (this.disableNextCourtButton) return;
    this.matchmakingService.cycleCourt({
      courtNumber: this.courtNumber,
      players: this.players,
    });
  }
  removeCourt() {
    if (this.players.length > 0) {
      alert('Cannot remove court, there are still people playing');
      return;
    }
    this.courtControllerService.removeCourt(this.courtNumber);
  }

  ngOnInit() {
    // every time you cycle court, a new court component is created, this ensures no accidental double clicks of next court button
    setTimeout(() => (this.disableNextCourtButton = false), 200);
  }
}
