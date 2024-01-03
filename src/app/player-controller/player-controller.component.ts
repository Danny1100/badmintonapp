import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Player,
  PlayerService,
  PlayerSkillData,
} from '../player/services/player.service';

@Component({
  selector: 'app-player-controller',
  templateUrl: './player-controller.component.html',
  styleUrls: ['./player-controller.component.css'],
})
export class PlayerControllerComponent {
  skillLevels: PlayerSkillData[] = [];
  addedPlayer!: Player;

  getRadioStyle(playerSkillLevel: PlayerSkillData) {
    return {
      width: '150px',
      border: `1px solid ${playerSkillLevel.colour}`,
    };
  }

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.skillLevels = this.playerService.getSkillMap();
  }
}
