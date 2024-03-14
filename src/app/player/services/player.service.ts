import { Injectable } from '@angular/core';

export interface Player {
  id: number;
  name: string;
  skillId: number;
}
export enum PlayerSkillLevelDesc {
  Cracked = 'cracked',
  Strong = 'strong',
  Good = 'good',
  Average = 'average',
  Amateur = 'amateur',
  New = 'new',
}
export enum PlayerSkillLevelColour {
  Cracked = '#f30da9',
  Strong = '#f30d0d',
  Good = '#f3af0d',
  Average = '#0db2f3',
  Amateur = '#36c513',
  New = '#ffaaea',
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
  skillMap = [
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
  ];

  constructor() {}

  getSkillMap() {
    return this.skillMap;
  }

  getPlayerDetails(skillId: number) {
    return this.skillMap[skillId];
  }
}
