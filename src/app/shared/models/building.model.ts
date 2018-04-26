export interface BuildingMap {
  [buildingId: string]: Building;
}

export class Building {
  active: boolean;
  assetRequirements: any;
  attack: number;
  blocks: number;
  endBlock: number;
  crystalCapacity: number;
  crystalRate: number;
  defense: number;
  goldCapacity: number;
  goldRate: number;
  health: number;
  id: number;
  index: number;
  inQueue: boolean;
  inProgress: boolean;
  level: number;
  maxLevel: boolean;
  missingRequirements: any;
  name: string;
  owned: boolean;
  previousLevelId: number;
  price: number;
  nextLevelId: number;
  remainingBlocks: number;
  resource: string;
  startBlock: number;
  typeId: number;
  waiting: boolean;

  constructor(data: any = {}) {
      this.active = data.active;
      this.assetRequirements = data.assetRequirements || [];
      this.attack = data.attack;
      this.blocks = data.blocks;
      this.endBlock = data.endBlock;
      this.crystalCapacity = data.crystalCapacity;
      this.crystalRate = data.crystalRate;
      this.defense = data.defense;
      this.goldCapacity = data.goldCapacity;
      this.goldRate = data.goldRate;
      this.health = data.health;
      this.id = data.id;
      this.index = data.index;
      this.inQueue = !!data.endBlock;
      this.inProgress = data.inProgress;
      this.level = data.level;
      this.maxLevel = data.maxLevel;
      this.missingRequirements = data.missingRequirements || [];
      this.name = data.name;
      this.owned = this.active || this.inQueue;
      this.previousLevelId = data.previousLevelId;
      this.price = data.price;
      this.nextLevelId = data.nextLevelId;
      this.remainingBlocks = data.remainingBlocks;
      this.resource = data.resource;
      this.startBlock = data.startBlock;
      this.typeId = data.typeId;
      this.waiting = data.waiting;
  }

}
