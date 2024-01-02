import { Component, Input } from '@angular/core';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
})
export class PlayerComponent {
  @Input({ required: true }) id!: number;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) skillId!: number;
  skillLevel!: string;
  colour!: string;

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    const { skillLevel, colour } = this.playerService.getPlayerDetails(this.id);
    this.skillLevel = skillLevel;
    this.colour = colour;
  }
}
