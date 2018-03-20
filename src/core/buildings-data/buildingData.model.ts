export class Building {

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
      this.resource = this.parseResource(data[9].toNumber());
      this.blocks = data[10].toNumber();
      this.previousLevelId = data[11].toNumber();
      this.typeId = data[12].toNumber();
      this.level = Math.floor(id / 1000) || 1;

  }

  parseResource(type: number) {
    switch (type) {
      case 0:
        return 'gold'
      case 1:
        return 'crystal';

      case 2:
        return 'quantum';

      default:
        return null;
    }
  }

}
