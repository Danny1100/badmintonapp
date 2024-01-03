import { Component } from '@angular/core';
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
  addedPlayer: Player = { name: '', skillId: 0 };

  getRadioStyle(playerSkillLevel: PlayerSkillData) {
    return {
      width: '150px',
      border: `1px solid ${playerSkillLevel.colour}`,
    };
  }
  addPlayer() {
    console.log(this.addedPlayer);
  }

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.skillLevels = this.playerService.getSkillMap();
  }
}
