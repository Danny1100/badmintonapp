import { Injectable } from '@angular/core';

export interface Player {
  name: string;
  skillId: 0 | 1 | 2 | 3 | 4;
}
enum PlayerSkillLevelDesc {
  Cracked = 'cracked',
  Strong = 'strong',
  Good = 'good',
  Amateur = 'amateur',
  New = 'new',
}
enum PlayerSkillLevelColour {
  Cracked = '#f30da9',
  Strong = '#f30d0d',
  Good = '#f3af0d',
  Amateur = '#0db2f3',
  New = '#e1f30d',
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
