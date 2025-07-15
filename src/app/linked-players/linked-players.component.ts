import { Component, HostListener } from '@angular/core';
import { LinkedPlayersService } from './linked-players-service/linked-players.service';
import { Player } from '../player/services/player.service';
import { AsyncPipe } from '@angular/common';
import { PlayerComponent } from '../player/player.component';

@Component({
  selector: 'app-linked-players',
  templateUrl: './linked-players.component.html',
  styleUrls: ['./linked-players.component.css'],
  standalone: true,
  imports: [PlayerComponent, AsyncPipe],
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
