export interface UnitMap {
  [unitId: string]: Unit;
}

export interface UnitQuantitytMap {
  [unitId: number]: number;
}

export class Unit {
  active: boolean;
  assetRequirements: any;
  attack: number;
  blocks: number;
  endBlock: number;
  defense: number;
  health: number;
  id: number;
  index: number;
  inQueue: boolean;
  inProgress: boolean;
  missingRequirements: any;
  name: string;
  price: number;
  quantity: number;
  quantityInQueue: number;
  resource: string;
  startBlock: number;
  waiting: boolean;

  constructor(data: any = {}) {
      this.active = data.active;
      this.assetRequirements = data.assetRequirements || [];
      this.attack = data.attack;
      this.blocks = data.blocks;
      this.endBlock = data.endBlock;
      this.defense = data.defense;
      this.health = data.health;
      this.id = data.id;
      this.index = data.index;
      this.inQueue = !!data.endBlock;
      this.inProgress = data.inProgress;
      this.missingRequirements = data.missingRequirements || [];
      this.name = data.name;
      this.price = data.price;
      this.quantity = data.quantity || 0;
      this.quantityInQueue = data.quantityInQueue || 0;
      this.resource = data.resource;
      this.startBlock = data.startBlock;
      this.waiting = data.waiting;
  }

}
