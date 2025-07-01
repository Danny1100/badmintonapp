export enum PlayersSortOption {
  Waiting = 'waiting',
  Name = 'name',
  SkillLevel = 'skillLevel',
}
export interface PlayersSortOptionFormObject {
  label: string;
  value: PlayersSortOption;
}
