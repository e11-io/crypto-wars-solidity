export class PlayerUnit {
  id: number;
  index: number;
  quantity: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.index = data.index;
    this.quantity = data.quantity;
  }

}
