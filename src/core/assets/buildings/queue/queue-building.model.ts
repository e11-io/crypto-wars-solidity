export class QueueBuilding {
  id: number;
  startBlock: number;
  endBlock: number;
  index: number;

  constructor(id: number, data: any = {}) {
    this.id = id;
    this.startBlock = data.startBlock;
    this.endBlock = data.endBlock;
    this.index = data.index;
  }

}
