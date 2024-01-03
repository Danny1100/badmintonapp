import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import {
  Player,
  PlayerService,
  PlayerSkillData,
  PlayerSkillLevelColour,
  PlayerSkillLevelDesc,
} from '../player/services/player.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-player-controller',
  templateUrl: './player-controller.component.html',
  styleUrls: ['./player-controller.component.css'],
})
export class PlayerControllerComponent {
  skillLevels: PlayerSkillData[] = [];
  addedPlayer: Player = { name: '', skillId: 0 };

  getRadioStyle(playerSkillLevel: PlayerSkillData, index: number) {
    return {
      width: '150px',
      'background-color':
        index === this.addedPlayer.skillId ? playerSkillLevel.colour : 'white',
      border: `1px solid ${playerSkillLevel.colour}`,
    };
  }
  resetForm() {
    this.addedPlayer = { name: '', skillId: 0 };
    this.updateRadioButtons(
      {
        skillLevel: PlayerSkillLevelDesc.Cracked,
        colour: PlayerSkillLevelColour.Cracked,
      },
      0,
    );
  }
  addPlayer() {
    if (!this.addedPlayer.name) {
      alert('Missing player name');
      return;
    }
    console.log(this.addedPlayer);
    this.resetForm();
  }

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.skillLevels = this.playerService.getSkillMap();
  }
  updateRadioButtons(lvl: PlayerSkillData, index: number) {
    const elements = document.querySelectorAll('.player-skill-level-label');
    elements.forEach((element, i) => {
      const el = element as HTMLLabelElement;
      if (i === index) {
        el.style.backgroundColor = lvl.colour;
      } else {
        el.style.backgroundColor = 'white';
      }
    });
  }
}
