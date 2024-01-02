import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  // player skill level - lower number/index is higher skill
  skillMap = [
    { skillLevel: 'cracked', colour: '#f30da9' },
    { skillLevel: 'strong', colour: '#f30d0d' },
    { skillLevel: 'good', colour: '#f3af0d' },
    { skillLevel: 'amateur', colour: '#0db2f3' },
    { skillLevel: 'new', colour: '#e1f30d' },
  ];

  constructor() {}

  getPlayerDetails(skillId: number) {
    return this.skillMap[skillId];
  }
}
