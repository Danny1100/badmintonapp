import { Player } from '../player/services/player.service';

export enum PlayersSortOption {
  Waiting = 'waiting',
  Name = 'name',
  SkillLevel = 'skillLevel',
}
export interface PlayersSortOptionFormObject {
  label: string;
  value: PlayersSortOption;
}

export interface MatchmakingGroup {
  id: string;
  players: Player[];
}

export function getNewGroup(): MatchmakingGroup {
  return {
    id: crypto.randomUUID(),
    players: [],
  };
}
