import { Component } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court } from '../court/court.component';
import { BehaviorSubject } from 'rxjs';
import { CourtControllerService } from '../court-controller/court-controller.service';
import { MatchmakingService } from '../matchmaking/matchmaking.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  courts$: BehaviorSubject<Court[]> = this.courtControllerService.getCourts();

  constructor(
    private courtControllerService: CourtControllerService,
    private matchmakingService: MatchmakingService,
  ) {}

  ngOninit() {
    this.courts$.subscribe((obj) => console.log(obj));
    console.log('ran');
  }
}
