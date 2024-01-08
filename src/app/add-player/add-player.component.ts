import { Component } from '@angular/core';
import {
  Player,
  PlayerService,
  PlayerSkillData,
  PlayerSkillLevelColour,
  PlayerSkillLevelDesc,
} from '../player/services/player.service';
import { BehaviorSubject } from 'rxjs';
import { PlayerListService } from '../player-list/player-list.service';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css'],
})
export class AddPlayerComponent {
  currentId: number = 0;
  skillLevels: PlayerSkillData[] = [];
  addedPlayer: Player = { id: this.currentId, name: '', skillId: 0 };
  playerList$: BehaviorSubject<Player[]> = this.playerListService.getPlayers();

  constructor(
    private playerService: PlayerService,
    private playerListService: PlayerListService,
  ) {}

  getRadioStyle(playerSkillLevel: PlayerSkillData, index: number) {
    return {
      width: '150px',
      border: `1px solid ${playerSkillLevel.colour}`,
    };
  }
  resetForm() {
    this.currentId++;
    this.addedPlayer = { id: this.currentId, name: '', skillId: 0 };
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
    this.playerListService.addPlayer(this.addedPlayer);
    this.resetForm();
  }

  ngOnInit() {
    this.skillLevels = this.playerService.getSkillMap();
  }
  ngAfterViewInit() {
    this.updateRadioButtons(this.skillLevels[0], 0);
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
