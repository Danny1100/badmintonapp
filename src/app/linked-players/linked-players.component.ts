import { Component, HostListener } from '@angular/core';
import { LinkedPlayersService } from './linked-players-service/linked-players.service';
import { Player } from '../player/services/player.service';
import { CourtComponent } from '../court/court.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-linked-players',
  templateUrl: './linked-players.component.html',
  styleUrls: ['./linked-players.component.css'],
  standalone: true,
  imports: [CourtComponent, AsyncPipe],
})
export class LinkedPlayersComponent {
  linkedPlayers$ = this.linkedPlayersService.getLinkedPlayers();

  constructor(private linkedPlayersService: LinkedPlayersService) {}

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.preventDefault();
  }

  removeLinkedPlayers(group: Player[]) {
    this.linkedPlayersService.removeLinkedPlayers(group);
  }
}
