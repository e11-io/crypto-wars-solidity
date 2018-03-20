export class Building {
  active: boolean;
  name: string;
  health: number;
  defense: number;
  attack: number;
  goldCapacity: number;
  crystalCapacity: number;
  goldRate: number;
  crystalRate: number;
  price: number;
  resource: string;
  blocks: number;
  previousLevelId: number;
  nextLevelId: number;
  typeId: number;
  level: number;
  id: number;
  index: number;
  startBlock: number;
  endBlock: number;
  inProgress: boolean;
  maxLevel: boolean;
  inQueue: boolean;
  owned: boolean;
  waiting: boolean;

  constructor(data: any = {}) {
      this.active = data.active;
      this.id = data.id;
      this.name = data.name;
      this.health = data.health;
      this.defense = data.defense;
      this.attack = data.attack;
      this.goldCapacity = data.goldCapacity;
      this.crystalCapacity = data.crystalCapacity;
      this.goldRate = data.goldRate;
      this.crystalRate = data.crystalRate;
      this.price = data.price;
      this.resource = data.resource;
      this.blocks = data.blocks;
      this.previousLevelId = data.previousLevelId;
      this.nextLevelId = data.nextLevelId;
      this.typeId = data.typeId;
      this.level = data.level;
      this.index = data.index;
      this.startBlock = data.startBlock;
      this.endBlock = data.endBlock;
      this.inProgress = data.inProgress;
      this.maxLevel = data.maxLevel;
      this.inQueue = !!data.endBlock;
      this.owned = this.active || this.inQueue;
      this.waiting = data.waiting;
  }

}
