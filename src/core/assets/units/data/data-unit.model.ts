import { parseResource } from '../../../shared/util/helpers'

export class DataUnit {

  id: number;
  name: string;
  health: number;
  defense: number;
  attack: number;
  price: number;
  resource: string;
  blocks: number;

  constructor(id: number, data: any = {}) {
      this.id = id;
      this.name = data[0];
      this.health = data[1].toNumber();
      this.defense = data[2].toNumber();
      this.attack = data[3].toNumber();
      this.price = data[4].toNumber();
      this.resource = parseResource(data[5].toNumber());
      this.blocks = data[6].toNumber();

  }

}
