import { Component } from '@angular/core';
import { Player } from '../player/services/player.service';
import { Court } from '../court/court.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  courts!: Court[];
  waitingPlayers!: Player[];

  constructor() {}

  ngOninit() {}
}
