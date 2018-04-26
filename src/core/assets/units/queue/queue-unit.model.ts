export class QueueUnit {
  id:         number;
  startBlock: number;
  endBlock:   number;
  quantity:   number;

  constructor(id: number, data: any = {}) {
    this.id =         id;
    this.startBlock = data.startBlock;
    this.endBlock =   data.endBlock;
    this.quantity =   data.quantity;
  }

}
