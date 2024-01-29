import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-linked-players',
  templateUrl: './linked-players.component.html',
  styleUrls: ['./linked-players.component.css'],
})
export class LinkedPlayersComponent {
  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.returnValue = false;
  }
}
