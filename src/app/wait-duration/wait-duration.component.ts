import { Component } from '@angular/core';
import { MatchmakingService } from '../matchmaking/matchmaking.service';
import { PlayerComponent } from '../player/player.component';
import { AsyncPipe, KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-wait-duration',
    templateUrl: './wait-duration.component.html',
    styleUrls: ['./wait-duration.component.css'],
    standalone: true,
    imports: [
        PlayerComponent,
        AsyncPipe,
        KeyValuePipe,
    ],
})
export class WaitDurationComponent {
  waitDuration$ = this.matchmakingService.waitingDuration$;

  constructor(private matchmakingService: MatchmakingService) {}
}
