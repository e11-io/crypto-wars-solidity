import { VillageInfo } from "../village/village-info.model";

export class PlayerTarget extends VillageInfo {
  block: string;
  points: number;

  constructor(data: any = {}) {
	  super(data);
    this.block = data.block;
    this.points = data.points;
  }

}
