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
  currentId$: BehaviorSubject<number> =
    this.playerListService.getCurrentPlayerId();
  skillLevels: PlayerSkillData[] = [];
  addedPlayer: Player = {
    id: this.currentId$.getValue(),
    name: '',
    skillId: 0,
  };
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
    const currentId = this.currentId$.getValue();
    this.addedPlayer = { id: currentId + 1, name: '', skillId: 0 };
    this.currentId$.next(currentId + 1);
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

    //testing code
    for (let i = 0; i < 40; i++) {
      const skillId = Math.floor(Math.random() * 5) as any;
      this.addedPlayer.name = i.toString();
      this.addedPlayer.skillId = skillId;
      this.addPlayer();
    }
    this.resetForm();
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
