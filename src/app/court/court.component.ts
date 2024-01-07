import { Component, Input } from '@angular/core';
import { Player } from '../player/services/player.service';
import { CourtControllerService } from '../court-controller/court-controller.service';

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

  constructor(private courtControllerService: CourtControllerService) {}

  removeCourt() {
    this.courtControllerService.removeCourt(this.courtNumber);
  }
}
