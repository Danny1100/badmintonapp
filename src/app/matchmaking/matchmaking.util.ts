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

export function sortPlayers(
  players: Player[],
  sortOption: PlayersSortOption,
): Player[] {
  if (sortOption === PlayersSortOption.Waiting) return players;
  return [...players].sort((a, b) => {
    if (sortOption === PlayersSortOption.SkillLevel && a.skillId !== b.skillId) {
      return a.skillId - b.skillId;
    }
    return a.name.localeCompare(b.name);
  });
}
