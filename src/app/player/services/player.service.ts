import { Injectable } from '@angular/core';

export interface Player {
  id: number;
  name: string;
  skillId: number;
  arrived: boolean;
}
export enum PlayerSkillLevelDesc {
  Cracked = 'Cracked',
  Strong = 'Strong',
  Good = 'Good',
  Average = 'Average',
  Novice = 'Novice',
  Amateur = 'Amateur',
  New = 'New',
  Organiser = 'Organiser',
}
export enum PlayerSkillLevelColourName {
  Pink = 'Pink',
  Red = 'Red',
  Orange = 'Orange',
  Blue = 'Blue',
  Purple = 'Purple',
  Green = 'Green',
  Yellow = 'Yellow',
  Teal = 'Teal',
}
export enum PlayerSkillLevelColour {
  Cracked = '#f30da9',
  Strong = '#ff5636',
  Good = '#f3af0d',
  Average = '#0db2f3',
  Novice = '#b863ff',
  Amateur = '#36c513',
  New = '#ecfc05',
  Organiser = '#00fcf0',
}
export interface PlayerSkillData {
  skillLevel: PlayerSkillLevelDesc;
  colourName: PlayerSkillLevelColourName;
  colour: PlayerSkillLevelColour;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  // player skill level - lower number/index is higher skill
  private skillMap: PlayerSkillData[] = [
    {
      skillLevel: PlayerSkillLevelDesc.Cracked,
      colourName: PlayerSkillLevelColourName.Pink,
      colour: PlayerSkillLevelColour.Cracked,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Strong,
      colourName: PlayerSkillLevelColourName.Red,
      colour: PlayerSkillLevelColour.Strong,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Good,
      colourName: PlayerSkillLevelColourName.Orange,
      colour: PlayerSkillLevelColour.Good,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Average,
      colourName: PlayerSkillLevelColourName.Blue,
      colour: PlayerSkillLevelColour.Average,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Novice,
      colourName: PlayerSkillLevelColourName.Purple,
      colour: PlayerSkillLevelColour.Novice,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Amateur,
      colourName: PlayerSkillLevelColourName.Green,
      colour: PlayerSkillLevelColour.Amateur,
    },
    {
      skillLevel: PlayerSkillLevelDesc.New,
      colourName: PlayerSkillLevelColourName.Yellow,
      colour: PlayerSkillLevelColour.New,
    },
    {
      skillLevel: PlayerSkillLevelDesc.Organiser,
      colourName: PlayerSkillLevelColourName.Teal,
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
