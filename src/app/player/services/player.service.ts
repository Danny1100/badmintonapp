import { Injectable } from '@angular/core';

export interface Player {
  id: number;
  name: string;
  skillId: number;
}
export enum PlayerSkillLevelDesc {
  Cracked = 'Cracked',
  Strong = 'Strong',
  Good = 'Good',
  Average = 'Average',
  Amateur = 'Amateur',
  New = 'New',
  Organiser = 'Organiser',
}
export enum PlayerSkillLevelColour {
  Cracked = '#f30da9',
  Strong = '#ff5636',
  Good = '#f3af0d',
  Average = '#0db2f3',
  Amateur = '#36c513',
  New = '#ecfc05',
  Organiser = '#00fcf0',
}
export interface PlayerSkillData {
  skillLevel: PlayerSkillLevelDesc;
  colour: PlayerSkillLevelColour;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  // player skill level - lower number/index is higher skill
  private skillMap = [
    {
      skillLevel: PlayerSkillLevelDesc.Cracked,
      colour: PlayerSkillLevelColour.Cracked,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Strong,
      colour: PlayerSkillLevelColour.Strong,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Good,
      colour: PlayerSkillLevelColour.Good,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Average,
      colour: PlayerSkillLevelColour.Average,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Amateur,
      colour: PlayerSkillLevelColour.Amateur,
    },
    {
      skillLevel: PlayerSkillLevelDesc.New,
      colour: PlayerSkillLevelColour.New,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Organiser,
      colour: PlayerSkillLevelColour.Organiser,
    },
  ];

  constructor() {}

  getSkillMap() {
    return this.skillMap;
  }

  getPlayerDetails(skillId: number) {
    return this.skillMap[skillId];
  }
}
