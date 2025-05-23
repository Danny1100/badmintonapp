import { Component, Input } from '@angular/core';
import { PlayerService } from './services/player.service';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.css'],
    standalone: true,
    imports: [NgStyle],
})
export class PlayerComponent {
  @Input({ required: true }) id!: number;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) skillId!: number;
  skillLevel!: string;
  colour!: string;

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    const { skillLevel, colour } = this.playerService.getPlayerDetails(
      this.skillId,
    );
    this.skillLevel = skillLevel;
    this.colour = colour;
  }
}
