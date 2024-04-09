import { Component } from '@angular/core';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

@Component({
  selector: 'app-wait-duration',
  templateUrl: './wait-duration.component.html',
  styleUrls: ['./wait-duration.component.css'],
})
export class WaitDurationComponent {
  waitDuration$ = this.matchmakingService.waitingDuration$;

  constructor(private matchmakingService: MatchmakingService) {}
}
