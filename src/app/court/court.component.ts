import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '../player/services/player.service';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

export interface Court {
  courtNumber: number;
  players: Player[];
}

@Component({
  selector: 'app-court',
  templateUrl: './court.component.html',
  styleUrls: ['./court.component.css'],
})
export class CourtComponent {
  @Input({ required: true }) courtNumber!: number;
  @Input({ required: true }) players!: Player[];
  @Input() showButtons = true;
  @Output() onNextCourt = new EventEmitter();

  constructor(
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  cycleCourt() {
    this.onNextCourt.emit();
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
}
