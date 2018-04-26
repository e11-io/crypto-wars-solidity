export class PlayerBuilding {
  id: number;
  index: number;
  level: number;
  active: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.index = data.index;
    this.level = data.level;
    this.active = data.active;
  }

}
