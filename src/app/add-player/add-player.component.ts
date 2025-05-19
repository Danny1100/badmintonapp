import { Component, HostListener } from '@angular/core';
import {
  Player,
  PlayerService,
  PlayerSkillData,
  PlayerSkillLevelColour,
  PlayerSkillLevelDesc,
} from '../player/services/player.service';
import { BehaviorSubject } from 'rxjs';
import { PlayerListService } from '../player-list/player-list-service/player-list.service';
import { parse } from 'papaparse';
import { FormsModule } from '@angular/forms';
import { NgStyle, AsyncPipe } from '@angular/common';
import { PlayerComponent } from '../player/player.component';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css'],
  standalone: true,
  imports: [FormsModule, NgStyle, PlayerComponent, AsyncPipe],
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

  @HostListener('window:beforeunload', ['$event']) onRefresh(event: Event) {
    event.preventDefault();
  }

  getRadioStyle(playerSkillLevel: PlayerSkillData) {
    return {
      width: '150px',
      border: `1px solid ${playerSkillLevel.colour}`,
    };
  }

  addPlayersFromFile() {
    if (confirm('Are you sure you want to add players from file?')) {
      fetch('assets/players.csv')
        .then((res) => res.text())
        .then((data) => {
          const players = parse<{ Name: string; 'Skill Level': string }>(data, {
            header: true,
          }).data.map((player) => ({
            name: player.Name,
            skillId: Object.keys(PlayerSkillLevelDesc).indexOf(
              player['Skill Level'],
            ),
          }));
          players.forEach((player) => {
            if (!player.name || player.skillId < 0) return;
            this.addedPlayer = {
              ...this.addedPlayer,
              ...player,
            };
            this.addPlayer();
          });
        });
    }
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
    const formattedPlayer = {
      ...this.addedPlayer,
      skillId: Number(this.addedPlayer.skillId),
    };
    this.playerListService.addPlayer(formattedPlayer);
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
