import { Component, HostListener } from '@angular/core';
import { LinkedPlayersService } from './linked-players-service/linked-players.service';

@Component({
  selector: 'app-linked-players',
  templateUrl: './linked-players.component.html',
  styleUrls: ['./linked-players.component.css'],
})
export class LinkedPlayersComponent {
  linkedPlayers$ = this.linkedPlayersService.linkedPlayers$;

  constructor(private linkedPlayersService: LinkedPlayersService) {}

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.returnValue = false;
  }
}