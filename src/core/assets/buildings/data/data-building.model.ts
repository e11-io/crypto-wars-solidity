import { parseResource } from '../../../shared/util/helpers'

export class DataBuilding {

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
  typeId: number;
  level: number;
  id: number;
  index;
  startBlock;
  endBlock;
  inProgress;

  constructor(id: number, data: any = {}) {
    // TODO this data should  be sent as a valid json object and not the raw response from web3
    this.id = id;
    this.name = data[0];
    this.health = data[1].toNumber();
    this.defense = data[2].toNumber();
    this.attack = data[3].toNumber();
    this.goldCapacity = data[4].toNumber();
    this.crystalCapacity = data[5].toNumber();
    this.goldRate = data[6].toNumber();
    this.crystalRate = data[7].toNumber();
    this.price = data[8].toNumber();
    this.resource = parseResource(data[9].toNumber());
    this.blocks = data[10].toNumber();
    this.previousLevelId = data[11].toNumber();
    this.typeId = data[12].toNumber();
    this.level = Math.floor(id / 1000) || 1;

  }

}
